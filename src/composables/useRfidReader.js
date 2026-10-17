/**
 * useRfidReader — composable กลางสำหรับอ่านแท็ก RFID จากเครื่อง handheld (iData T2X)
 *
 * แอป Android (DK Handheld) ฉีด window.DkRfid { start, stop, setPower, isAvailable }
 * และยิง CustomEvent: 'dk-rfid-tag' {epc, tid, rssi} ทุกครั้งที่อ่านแท็ก / 'dk-rfid-state' {reading}
 * เมื่อเปิดบนเบราว์เซอร์ทั่วไป window.DkRfid ไม่มี → available = false (caller ซ่อนปุ่มอ่านและใช้ addManual แทน)
 *
 * วิธีใช้ (Options API ผ่าน setup()):
 *   setup() {
 *     const { available, reading, tags, tagsByRssi, start, stop, clear } = useRfidReader()
 *     return { available, reading, tags, tagsByRssi, start, stop, clear }
 *   }
 *
 * สมัคร/ถอด event อัตโนมัติตอน mount/unmount ถ้าเรียกใน setup() ของ component
 * นอก component (เช่น unit test) เรียก attach() / detach() เอง
 */
import { ref, computed, getCurrentInstance, onMounted, onBeforeUnmount } from 'vue'

export const RFID_TAG_EVENT = 'dk-rfid-tag'
export const RFID_STATE_EVENT = 'dk-rfid-state'
export const RFID_POWER_MIN = 1
export const RFID_POWER_MAX = 30

export function normalizeEpc(value) {
  return String(value ?? '')
    .replace(/\s+/g, '')
    .toUpperCase()
}

export function isValidEpc(value) {
  return /^[0-9A-F]+$/.test(normalizeEpc(value))
}

function toRssi(value) {
  if (value === null || value === undefined || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function getBridge() {
  return typeof window !== 'undefined' ? window.DkRfid : undefined
}

export function useRfidReader() {
  const available = ref(false)
  const reading = ref(false)
  const lastTag = ref(null)
  const tags = ref([])

  const tagsByRssi = computed(() => [...tags.value].sort((a, b) => (b.rssi ?? -Infinity) - (a.rssi ?? -Infinity)))

  function refreshAvailable() {
    const bridge = getBridge()
    available.value = !!bridge && (typeof bridge.isAvailable !== 'function' || !!bridge.isAvailable())
  }

  function pushTag({ epc, tid, rssi }) {
    const normalized = normalizeEpc(epc)
    if (!normalized) return

    const rssiNum = toRssi(rssi)
    const existing = tags.value.find((t) => t.epc === normalized)

    if (existing) {
      existing.count += 1
      if (tid) existing.tid = tid
      if (rssiNum !== null && (existing.rssi === null || rssiNum > existing.rssi)) existing.rssi = rssiNum
      lastTag.value = existing
      return
    }

    tags.value.push({ epc: normalized, tid: tid || null, rssi: rssiNum, count: 1 })
    lastTag.value = tags.value[tags.value.length - 1]
  }

  function onTag(event) {
    pushTag(event?.detail || {})
  }

  function onState(event) {
    reading.value = !!event?.detail?.reading
  }

  function attach() {
    refreshAvailable()
    window.addEventListener(RFID_TAG_EVENT, onTag)
    window.addEventListener(RFID_STATE_EVENT, onState)
  }

  function start() {
    const bridge = getBridge()
    if (!bridge) return
    bridge.start()
    reading.value = true
  }

  function stop() {
    const bridge = getBridge()
    if (bridge) bridge.stop()
    reading.value = false
  }

  function detach() {
    window.removeEventListener(RFID_TAG_EVENT, onTag)
    window.removeEventListener(RFID_STATE_EVENT, onState)
    if (reading.value) stop()
  }

  function clear() {
    tags.value = []
    lastTag.value = null
  }

  function setPower(level) {
    const bridge = getBridge()
    const n = Math.round(Number(level))
    if (!bridge || !Number.isFinite(n)) return null
    const clamped = Math.min(RFID_POWER_MAX, Math.max(RFID_POWER_MIN, n))
    bridge.setPower(clamped)
    return clamped
  }

  function addManual(epc) {
    if (!isValidEpc(epc)) return false
    pushTag({ epc, tid: null, rssi: null })
    return true
  }

  if (getCurrentInstance()) {
    onMounted(attach)
    onBeforeUnmount(detach)
  }

  return { available, reading, lastTag, tags, tagsByRssi, start, stop, clear, setPower, addManual, attach, detach }
}

export default useRfidReader
