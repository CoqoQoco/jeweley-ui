import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useTrayReader, TRAY_STATE } from './useTrayReader.js'
import { encodeFrame, toHex } from '@/services/rfid/a500-protocol.js'

function fakeTransport({ supported = true, kind = 'hid', reconnectResult = false, connectError = null } = {}) {
  let dataCb = () => {}
  let disconnectCb = () => {}
  return {
    kind,
    deviceName: 'A500_TEST',
    written: [],
    isSupported: () => supported,
    connect: vi.fn(async () => {
      if (connectError) throw connectError
    }),
    reconnect: vi.fn(async () => reconnectResult),
    write: vi.fn(async function (bytes) {
      this.written.push(toHex(bytes))
    }),
    onData: (cb) => (dataCb = cb),
    onDisconnect: (cb) => (disconnectCb = cb),
    disconnect: vi.fn(async () => {}),
    emit: (bytes) => dataCb(bytes),
    drop: () => disconnectCb()
  }
}

function tag(epcBytes, rssiByte = 0xca) {
  return encodeFrame(0x0602, [0x00, epcBytes.length, ...epcBytes, 0x01, rssiByte])
}

const START = '55 00 00 06 06 02 00 00 00 00 16 96'
const STOP = '55 00 00 02 02 12 0C 44'

describe('useTrayReader', () => {
  let hid
  let ble
  let tray

  function make(options = {}) {
    hid = options.hid || fakeTransport({ kind: 'hid' })
    ble = options.ble || fakeTransport({ kind: 'ble' })
    tray = useTrayReader({ transports: { ble: () => ble, hid: () => hid }, flushMs: 300 })
    return tray
  }

  beforeEach(() => vi.useFakeTimers())
  afterEach(() => {
    tray?.dispose()
    vi.useRealTimers()
  })

  it('ไม่มี API ที่รองรับเลย -> unsupported', () => {
    make({ hid: fakeTransport({ supported: false }), ble: fakeTransport({ supported: false }) })
    expect(tray.state.value).toBe(TRAY_STATE.UNSUPPORTED)
  })

  it('รายการที่รองรับกรองตาม isSupported', () => {
    make({ ble: fakeTransport({ supported: false, kind: 'ble' }) })
    expect(tray.supportedKinds).toEqual(['hid'])
  })

  it('connect สำเร็จ -> connected + ชื่อเครื่อง', async () => {
    make()
    await tray.connect('hid')
    expect(tray.state.value).toBe(TRAY_STATE.CONNECTED)
    expect(tray.deviceName.value).toBe('A500_TEST')
    expect(tray.activeKind.value).toBe('hid')
  })

  it('ผู้ใช้ยกเลิกหน้าต่างเลือกอุปกรณ์ -> กลับ disconnected ไม่ใช่ error', async () => {
    const err = Object.assign(new Error('cancel'), { name: 'NotFoundError' })
    make({ hid: fakeTransport({ connectError: err }) })
    expect(await tray.connect('hid')).toBe(false)
    expect(tray.state.value).toBe(TRAY_STATE.DISCONNECTED)
  })

  it('connect ล้มด้วยสาเหตุอื่น -> error พร้อมข้อความ', async () => {
    make({ hid: fakeTransport({ connectError: new Error('boom') }) })
    await tray.connect('hid')
    expect(tray.state.value).toBe(TRAY_STATE.ERROR)
    expect(tray.errorKey.value).toBe('errorUnavailable')
    expect(tray.live.value).toBe(false)
  })

  it('NotAllowedError / InvalidStateError -> ข้อความให้ปิดโปรแกรม iRFID', async () => {
    make({ hid: fakeTransport({ connectError: Object.assign(new Error('x'), { name: 'NotAllowedError' }) }) })
    await tray.connect('hid')
    expect(tray.errorKey.value).toBe('errorInUse')
  })

  it('connect ซ้อนขณะกำลังเชื่อมต่อ ถูกกัน', async () => {
    make()
    const first = tray.connect('hid')
    expect(await tray.connect('hid')).toBe(false)
    await first
    expect(hid.connect).toHaveBeenCalledTimes(1)
  })

  it('ออกจากหน้าระหว่าง connect ค้างอยู่ -> ปิด transport ทิ้ง ไม่ผูก', async () => {
    make()
    let release
    hid.connect = vi.fn(() => new Promise((resolve) => (release = resolve)))
    const pending = tray.connect('hid')
    await vi.advanceTimersByTimeAsync(0)
    tray.dispose()
    release()
    expect(await pending).toBe(false)
    expect(hid.disconnect).toHaveBeenCalled()
    expect(tray.live.value).toBe(false)
  })

  it('ออกจากหน้าระหว่าง autoReconnect ค้างอยู่ -> ปิด transport ทิ้ง', async () => {
    make()
    let release
    hid.reconnect = vi.fn(() => new Promise((resolve) => (release = resolve)))
    const pending = tray.autoReconnect()
    await vi.advanceTimersByTimeAsync(0)
    tray.dispose()
    release(true)
    expect(await pending).toBe(false)
    expect(hid.disconnect).toHaveBeenCalled()
    expect(tray.live.value).toBe(false)
  })

  it('connect ใหม่ขณะมี transport เดิมค้าง (ERROR) -> ปิดตัวเดิมก่อน', async () => {
    make()
    await tray.connect('hid')
    await tray.start()
    hid.write = vi.fn(async () => {
      throw new Error('fail')
    })
    await tray.stop()
    expect(tray.state.value).toBe(TRAY_STATE.ERROR)
    await tray.connect('ble')
    expect(hid.disconnect).toHaveBeenCalled()
    expect(tray.activeKind.value).toBe('ble')
    expect(tray.state.value).toBe(TRAY_STATE.CONNECTED)
  })

  it('stop เขียนไม่สำเร็จ -> ERROR แต่ยัง canStop และ dispose ต้องส่งหยุดซ้ำ', async () => {
    make()
    await tray.connect('hid')
    await tray.start()
    const realWrite = hid.write
    hid.write = vi.fn(async () => {
      throw new Error('fail')
    })
    await tray.stop()
    expect(tray.state.value).toBe(TRAY_STATE.ERROR)
    expect(tray.live.value).toBe(true)
    expect(tray.canStop.value).toBe(true)
    hid.write = realWrite
    tray.dispose()
    await vi.advanceTimersByTimeAsync(0)
    expect(hid.written.at(-1)).toBe(STOP)
    expect(hid.disconnect).toHaveBeenCalled()
  })

  it('stop สำเร็จหลังเคย error -> canStop เป็น false', async () => {
    make()
    await tray.connect('hid')
    await tray.start()
    expect(tray.canStop.value).toBe(true)
    await tray.stop()
    expect(tray.canStop.value).toBe(false)
  })

  it('กด start ซ้ำระหว่างส่งคำสั่ง ถูกกัน และ busy เปิดอยู่ระหว่างส่ง', async () => {
    make()
    await tray.connect('hid')
    const first = tray.start()
    expect(tray.busy.value).toBe(true)
    expect(await tray.start()).toBe(false)
    await first
    expect(tray.busy.value).toBe(false)
    expect(hid.written).toEqual([STOP, START])
  })

  it('ปิดหน้าระหว่าง start (หลังเขียนหยุดครั้งแรก) -> ไม่ส่งเริ่มอ่านตามหลัง', async () => {
    make()
    await tray.connect('hid')
    let releaseFirst
    const realWrite = hid.write
    hid.write = vi.fn(function (bytes) {
      if (!releaseFirst) return new Promise((resolve) => (releaseFirst = () => resolve(realWrite.call(this, bytes))))
      return realWrite.call(this, bytes)
    })
    const starting = tray.start()
    await vi.advanceTimersByTimeAsync(0)
    tray.dispose()
    releaseFirst()
    expect(await starting).toBe(false)
    await vi.advanceTimersByTimeAsync(0)
    expect(hid.written).not.toContain(START)
    expect(hid.written.at(-1)).toBe(STOP)
    expect(hid.disconnect).toHaveBeenCalled()
  })

  it('handler ของ batch พัง -> stop/busy ไม่ค้าง', async () => {
    make()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    tray.setBatchHandler(() => {
      throw new Error('boom')
    })
    await tray.connect('hid')
    await tray.start()
    hid.emit(tag([0x01]))
    expect(await tray.stop()).toBe(true)
    expect(tray.busy.value).toBe(false)
    expect(tray.state.value).toBe(TRAY_STATE.CONNECTED)
  })

  it('autoReconnect ลอง USB ก่อน Bluetooth', async () => {
    make()
    await tray.autoReconnect()
    expect(hid.reconnect.mock.invocationCallOrder[0]).toBeLessThan(ble.reconnect.mock.invocationCallOrder[0])
  })

  it('Bluetooth reconnect ค้างเกิน 5 วินาที -> เลิกเงียบๆ กลับ disconnected และ busy ปลด', async () => {
    make()
    let late
    ble.reconnect = vi.fn(() => new Promise((resolve) => (late = resolve)))
    const pending = tray.autoReconnect()
    await vi.advanceTimersByTimeAsync(5000)
    expect(await pending).toBe(false)
    expect(tray.state.value).toBe(TRAY_STATE.DISCONNECTED)
    expect(tray.busy.value).toBe(false)
    late(true)
    await vi.advanceTimersByTimeAsync(0)
    expect(ble.disconnect).toHaveBeenCalled()
  })

  it('transport หลุดระหว่าง start -> ไม่ขึ้น READING', async () => {
    make()
    await tray.connect('hid')
    hid.write = vi.fn(async () => {
      hid.drop()
    })
    expect(await tray.start()).toBe(false)
    expect(tray.state.value).toBe(TRAY_STATE.DISCONNECTED)
    expect(tray.live.value).toBe(false)
  })

  it('autoReconnect ต่อกับเครื่องที่เคยอนุญาต', async () => {
    make({ hid: fakeTransport({ reconnectResult: true }) })
    expect(await tray.autoReconnect()).toBe(true)
    expect(tray.state.value).toBe(TRAY_STATE.CONNECTED)
  })

  it('autoReconnect ไม่เจอเครื่อง -> disconnected', async () => {
    make()
    expect(await tray.autoReconnect()).toBe(false)
    expect(tray.state.value).toBe(TRAY_STATE.DISCONNECTED)
  })

  it('start ส่งเฉพาะคำสั่งหยุด+เริ่มอ่าน และ stop ส่งคำสั่งหยุด', async () => {
    make()
    await tray.connect('hid')
    await tray.start()
    expect(tray.state.value).toBe(TRAY_STATE.READING)
    expect(hid.written).toEqual([STOP, START])
    await tray.stop()
    expect(tray.state.value).toBe(TRAY_STATE.CONNECTED)
    expect(hid.written.at(-1)).toBe(STOP)
  })

  it('รวมผลอ่านแล้วส่ง handler ทีเดียวทุก 300 ms', async () => {
    make()
    const handler = vi.fn()
    tray.setBatchHandler(handler)
    await tray.connect('hid')
    await tray.start()
    hid.emit(tag([0xaa, 0x01], 0xd0))
    hid.emit(tag([0xaa, 0x01], 0xca))
    hid.emit(tag([0xbb, 0x02]))
    expect(handler).not.toHaveBeenCalled()
    vi.advanceTimersByTime(300)
    expect(handler).toHaveBeenCalledTimes(1)
    const batch = handler.mock.calls[0][0]
    expect(batch).toHaveLength(2)
    const a = batch.find((b) => b.epc === 'AA01')
    expect(a.hits).toBe(2)
    expect(a.rssi).toBe(-48)
  })

  it('หยุดอ่านแล้ว flush ที่ค้างทันที และไม่รับแท็กหลังหยุด', async () => {
    make()
    const handler = vi.fn()
    tray.setBatchHandler(handler)
    await tray.connect('hid')
    await tray.start()
    hid.emit(tag([0x01]))
    await tray.stop()
    expect(handler).toHaveBeenCalledTimes(1)
    hid.emit(tag([0x02]))
    vi.advanceTimersByTime(1000)
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('จับเวลาการอ่านเป็นวินาที', async () => {
    make()
    await tray.connect('hid')
    await tray.start()
    vi.advanceTimersByTime(3000)
    expect(tray.elapsedSec.value).toBe(3)
  })

  it('หลุดขณะอ่าน -> disconnected + connectionLost และ flush ผลที่ค้าง', async () => {
    make()
    const handler = vi.fn()
    tray.setBatchHandler(handler)
    await tray.connect('hid')
    await tray.start()
    hid.emit(tag([0x01]))
    hid.drop()
    expect(tray.state.value).toBe(TRAY_STATE.DISCONNECTED)
    expect(tray.connectionLost.value).toBe(true)
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('dispose ขณะอ่านอยู่ ต้องส่งคำสั่งหยุดแล้วตัดการเชื่อมต่อ', async () => {
    make()
    await tray.connect('hid')
    await tray.start()
    tray.dispose()
    await vi.advanceTimersByTimeAsync(0)
    expect(hid.written.at(-1)).toBe(STOP)
    expect(hid.disconnect).toHaveBeenCalled()
  })

  it('disconnect ขณะอ่านอยู่ หยุดก่อนแล้วตัดการเชื่อมต่อ', async () => {
    make()
    await tray.connect('hid')
    await tray.start()
    await tray.disconnect()
    expect(hid.written.at(-1)).toBe(STOP)
    expect(hid.disconnect).toHaveBeenCalled()
    expect(tray.state.value).toBe(TRAY_STATE.DISCONNECTED)
  })
})
