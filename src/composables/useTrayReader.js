/**
 * useTrayReader — สถานะ/ควบคุมเครื่องอ่าน RFID แบบถาด iData A500 ที่ต่อกับคอมผ่าน Web Bluetooth หรือ WebHID
 *
 * state: unsupported | disconnected | connecting | connected | reading | error
 * เครื่องอ่านยิงแท็กเดิมซ้ำ ~10–20 ครั้ง/วินาที จึงรวมผลอ่านไว้แล้วส่งให้ handler ทีเดียวทุก READ_FLUSH_MS
 * handler ได้อาร์เรย์ [{ epc, rssi, hits, firstSeen, lastSeen }] (rssi เป็น undefined ถ้าเครื่องไม่ส่งมา)
 *
 * วิธีใช้ (Options API ผ่าน setup()):
 *   setup() {
 *     const tray = useTrayReader()
 *     return { tray }
 *   },
 *   created() { this.tray.setBatchHandler((batch) => this.applyBatch(batch)) }
 *
 * ออกจากหน้า (unmount / pagehide) ขณะกำลังอ่าน → ส่งคำสั่งหยุดให้เองเสมอ
 */
import { ref, computed, getCurrentInstance, onBeforeUnmount } from 'vue'
import { buildStartInventoryCommand, buildStopCommand, createFrameParser } from '@/services/rfid/a500-protocol.js'
import { createBleTransport } from '@/services/rfid/transport-ble.js'
import { createHidTransport } from '@/services/rfid/transport-hid.js'

export const READ_FLUSH_MS = 300
export const RECONNECT_TIMEOUT_MS = 5000
// ลองต่อกลับ USB ก่อน (เร็ว) แล้วค่อย Bluetooth
const RECONNECT_ORDER = ['hid', 'ble']
const TIMER_TICK_MS = 1000

export const TRAY_STATE = {
  UNSUPPORTED: 'unsupported',
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  READING: 'reading',
  ERROR: 'error'
}

const defaultTransports = {
  ble: createBleTransport,
  hid: createHidTransport
}

// ผู้ใช้ปิดหน้าต่างเลือกอุปกรณ์เฉยๆ ไม่ใช่ error
function isPickerCancelled(error) {
  if (error?.message === 'No device selected') return true
  return error?.name === 'NotFoundError' && /cancel/i.test(error?.message || '')
}

// แปลง error ของ browser API เป็น key ข้อความในหน้า (view.stock.rfidBasket.reader.<key>) ไม่โชว์ข้อความอังกฤษดิบ
export function errorKeyFor(error) {
  const name = error?.name
  if (name === 'NotAllowedError' || name === 'InvalidStateError' || name === 'SecurityError') return 'errorInUse'
  return 'errorUnavailable'
}

// reconnect() ของ Bluetooth อาจค้างนาน — รอไม่เกิน ms แล้วถือว่าไม่เจอ (ถ้าตอบมาทีหลังว่าต่อได้ ให้ปิดทิ้ง)
function reconnectWithTimeout(candidate, ms) {
  return new Promise((resolve) => {
    let settled = false
    const timer = setTimeout(() => {
      settled = true
      resolve(false)
    }, ms)
    Promise.resolve()
      .then(() => candidate.reconnect())
      .then(
        (ok) => {
          if (settled) {
            if (ok) Promise.resolve(candidate.disconnect()).catch(() => {})
            return
          }
          settled = true
          clearTimeout(timer)
          resolve(!!ok)
        },
        () => {
          if (settled) return
          settled = true
          clearTimeout(timer)
          resolve(false)
        }
      )
  })
}

export function useTrayReader({ transports = defaultTransports, flushMs = READ_FLUSH_MS } = {}) {
  const instances = {}
  const supportedKinds = Object.keys(transports).filter((kind) => {
    instances[kind] = transports[kind]()
    return instances[kind].isSupported()
  })

  const state = ref(supportedKinds.length ? TRAY_STATE.DISCONNECTED : TRAY_STATE.UNSUPPORTED)
  const activeKind = ref('')
  const deviceName = ref('')
  const errorKey = ref('')
  const connectionLost = ref(false)
  const elapsedSec = ref(0)
  // true ระหว่างกำลังส่งคำสั่ง (เริ่ม/หยุด/เชื่อมต่อ/ตัดการเชื่อมต่อ) — ปุ่มต้องกดซ้ำไม่ได้
  const busy = ref(false)
  // มี transport ที่ยังเปิดอยู่ (รวมกรณี ERROR ที่เครื่องยังต่ออยู่)
  const live = ref(false)
  // ส่งคำสั่งเริ่มอ่านไปแล้วและยังไม่ได้ยืนยันว่าส่งหยุดสำเร็จ — เครื่องอาจยังยิงแท็กอยู่
  const mayBeReading = ref(false)

  const reading = computed(() => state.value === TRAY_STATE.READING)
  const connected = computed(() => state.value === TRAY_STATE.CONNECTED || state.value === TRAY_STATE.READING)
  const canStop = computed(() => live.value && mayBeReading.value)

  let transport = null
  let disposed = false
  let batchHandler = () => {}
  let parser = createFrameParser()
  let buffer = new Map()
  let flushTimer = null
  let tickTimer = null
  let startedAt = 0

  function setBatchHandler(handler) {
    batchHandler = handler || (() => {})
  }

  function flush() {
    if (flushTimer !== null) {
      clearTimeout(flushTimer)
      flushTimer = null
    }
    if (buffer.size === 0) return
    const batch = [...buffer.values()]
    buffer = new Map()
    // handler ของหน้าเว็บพังต้องไม่ทำให้ stop/disconnect/busy ค้าง
    try {
      batchHandler(batch)
    } catch (error) {
      console.error(error)
    }
  }

  function gather(tag) {
    const now = Date.now()
    const rssi = tag.rssi === null || tag.rssi === undefined ? undefined : tag.rssi
    const item = buffer.get(tag.epc)
    if (item) {
      item.hits += 1
      item.lastSeen = now
      if (rssi !== undefined && (item.rssi === undefined || rssi > item.rssi)) item.rssi = rssi
    } else {
      buffer.set(tag.epc, { epc: tag.epc, rssi, hits: 1, firstSeen: now, lastSeen: now })
    }
    if (flushTimer === null) flushTimer = setTimeout(flush, flushMs)
  }

  function onBytes(bytes) {
    if (!mayBeReading.value) return
    for (const event of parser.push(bytes)) {
      if (event.kind === 'tag') gather(event)
    }
  }

  function stopTimer() {
    if (tickTimer !== null) {
      clearInterval(tickTimer)
      tickTimer = null
    }
  }

  function startTimer() {
    stopTimer()
    startedAt = Date.now()
    elapsedSec.value = 0
    tickTimer = setInterval(() => {
      elapsedSec.value = Math.floor((Date.now() - startedAt) / 1000)
    }, TIMER_TICK_MS)
  }

  function fail(error) {
    errorKey.value = errorKeyFor(error)
    state.value = TRAY_STATE.ERROR
  }

  function onTransportDisconnect() {
    connectionLost.value = mayBeReading.value
    mayBeReading.value = false
    stopTimer()
    flush()
    parser.reset()
    state.value = TRAY_STATE.DISCONNECTED
    transport = null
    live.value = false
  }

  function bind(selected) {
    transport = selected
    live.value = true
    mayBeReading.value = false
    activeKind.value = selected.kind
    deviceName.value = selected.deviceName
    selected.onData(onBytes)
    selected.onDisconnect(onTransportDisconnect)
    parser = createFrameParser()
    connectionLost.value = false
    errorKey.value = ''
    state.value = TRAY_STATE.CONNECTED
  }

  // ส่งหยุดอ่าน (ถ้าอาจยังอ่านอยู่) แล้วปิด transport ปัจจุบัน
  async function closeCurrent() {
    const current = transport
    if (!current) return
    transport = null
    live.value = false
    stopTimer()
    flush()
    if (mayBeReading.value) {
      try {
        await current.write(buildStopCommand())
      } catch {
        // ปิดต่ออยู่แล้ว ไม่ต้องรายงานซ้ำ
      }
    }
    mayBeReading.value = false
    await current.disconnect()
  }

  async function connect(kind) {
    const selected = instances[kind]
    if (!selected || !selected.isSupported() || busy.value || disposed) return false
    busy.value = true
    try {
      await closeCurrent()
      state.value = TRAY_STATE.CONNECTING
      try {
        await selected.connect()
      } catch (error) {
        await Promise.resolve(selected.disconnect()).catch(() => {})
        if (disposed) return false
        if (isPickerCancelled(error)) {
          state.value = TRAY_STATE.DISCONNECTED
          return false
        }
        fail(error)
        return false
      }
      if (disposed) {
        await Promise.resolve(selected.disconnect()).catch(() => {})
        return false
      }
      bind(selected)
      return true
    } finally {
      busy.value = false
    }
  }

  // ต่อกลับกับเครื่องที่เคยอนุญาตไว้ (เปิดหน้าใหม่แล้วไม่ต้องกดเลือกเครื่องซ้ำ)
  async function autoReconnect() {
    if (busy.value || disposed || transport) return false
    busy.value = true
    try {
      const order = RECONNECT_ORDER.filter((kind) => supportedKinds.includes(kind))
      for (const kind of order) {
        const candidate = instances[kind]
        state.value = TRAY_STATE.CONNECTING
        const ok = await reconnectWithTimeout(candidate, RECONNECT_TIMEOUT_MS)
        if (ok && disposed) {
          await Promise.resolve(candidate.disconnect()).catch(() => {})
          return false
        }
        if (ok) {
          bind(candidate)
          return true
        }
        if (disposed) return false
      }
      state.value = TRAY_STATE.DISCONNECTED
      return false
    } finally {
      busy.value = false
    }
  }

  async function start() {
    const current = transport
    if (!current || busy.value || mayBeReading.value) return false
    if (state.value !== TRAY_STATE.CONNECTED && state.value !== TRAY_STATE.ERROR) return false
    busy.value = true
    parser.reset()
    mayBeReading.value = true
    try {
      await current.write(buildStopCommand())
      // ปิดหน้า/ตัดการเชื่อมต่อระหว่างรอ: closeCurrent ถอด transport แล้วและส่งหยุดเอง ห้ามส่งเริ่มอ่านตามหลัง
      if (transport !== current) return false
      await current.write(buildStartInventoryCommand())
    } catch (error) {
      if (transport === current) fail(error)
      return false
    } finally {
      busy.value = false
    }
    if (transport !== current) return false
    errorKey.value = ''
    connectionLost.value = false
    state.value = TRAY_STATE.READING
    startTimer()
    return true
  }

  async function stop() {
    const current = transport
    if (!current || busy.value || !mayBeReading.value) return false
    busy.value = true
    stopTimer()
    flush()
    try {
      await current.write(buildStopCommand())
    } catch (error) {
      if (transport === current) fail(error)
      return false
    } finally {
      busy.value = false
    }
    mayBeReading.value = false
    if (transport === current) {
      errorKey.value = ''
      state.value = TRAY_STATE.CONNECTED
    }
    return true
  }

  async function disconnect() {
    if (!transport || busy.value) return
    busy.value = true
    try {
      await closeCurrent()
      state.value = TRAY_STATE.DISCONNECTED
      connectionLost.value = false
    } finally {
      busy.value = false
    }
  }

  // ปิดหน้า: ส่งหยุดอ่านถ้าอาจยังอ่านอยู่ แล้วคืนทรัพยากร (connect ที่ค้างอยู่จะปิด transport เองเมื่อเสร็จ)
  function dispose() {
    disposed = true
    if (typeof window !== 'undefined') window.removeEventListener('pagehide', onPageHide)
    closeCurrent().catch(() => {})
  }

  function onPageHide() {
    if (transport && mayBeReading.value) {
      Promise.resolve(transport.write(buildStopCommand())).catch(() => {})
    }
  }

  if (typeof window !== 'undefined') window.addEventListener('pagehide', onPageHide)
  if (getCurrentInstance()) onBeforeUnmount(dispose)

  return {
    state,
    activeKind,
    deviceName,
    errorKey,
    busy,
    live,
    canStop,
    connectionLost,
    elapsedSec,
    reading,
    connected,
    supportedKinds,
    setBatchHandler,
    connect,
    autoReconnect,
    start,
    stop,
    disconnect,
    dispose
  }
}

export default useTrayReader
