import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useRfidReader, normalizeEpc, isValidEpc } from './useRfidReader.js'

function fireTag(detail) {
  window.dispatchEvent(new CustomEvent('dk-rfid-tag', { detail }))
}

function makeBridge(overrides = {}) {
  return { start: vi.fn(), stop: vi.fn(), setPower: vi.fn(), isAvailable: vi.fn(() => true), ...overrides }
}

describe('useRfidReader', () => {
  let reader

  beforeEach(() => {
    delete window.DkRfid
    reader = useRfidReader()
  })

  afterEach(() => {
    reader.detach()
    delete window.DkRfid
  })

  it('ไม่มี window.DkRfid → available = false และ start/stop/setPower ไม่พัง', () => {
    reader.attach()
    expect(reader.available.value).toBe(false)
    expect(() => {
      reader.start()
      reader.stop()
    }).not.toThrow()
    expect(reader.setPower(10)).toBeNull()
    expect(reader.reading.value).toBe(false)
  })

  it('มี DkRfid และ isAvailable() = true → available = true', () => {
    window.DkRfid = makeBridge()
    reader.attach()
    expect(reader.available.value).toBe(true)
  })

  it('isAvailable() = false → available = false', () => {
    window.DkRfid = makeBridge({ isAvailable: vi.fn(() => false) })
    reader.attach()
    expect(reader.available.value).toBe(false)
  })

  it('start/stop เรียก bridge และตั้ง reading', () => {
    const bridge = makeBridge()
    window.DkRfid = bridge
    reader.attach()
    reader.start()
    expect(bridge.start).toHaveBeenCalledTimes(1)
    expect(reader.reading.value).toBe(true)
    reader.stop()
    expect(bridge.stop).toHaveBeenCalledTimes(1)
    expect(reader.reading.value).toBe(false)
  })

  it('dk-rfid-state ปรับ reading', () => {
    reader.attach()
    window.dispatchEvent(new CustomEvent('dk-rfid-state', { detail: { reading: true } }))
    expect(reader.reading.value).toBe(true)
    window.dispatchEvent(new CustomEvent('dk-rfid-state', { detail: { reading: false } }))
    expect(reader.reading.value).toBe(false)
  })

  it('dk-rfid-tag → lastTag และ tags unique ตาม epc (นับครั้ง เก็บ rssi แรงสุด)', () => {
    reader.attach()
    fireTag({ epc: 'e280 1160', tid: 'T1', rssi: '-60' })
    fireTag({ epc: 'E2801160', tid: 'T1', rssi: -45 })
    fireTag({ epc: 'E2801160', rssi: -70 })
    fireTag({ epc: 'AABB', tid: 'T2', rssi: -50 })

    expect(reader.tags.value).toHaveLength(2)
    const first = reader.tags.value.find((t) => t.epc === 'E2801160')
    expect(first).toMatchObject({ count: 3, rssi: -45, tid: 'T1' })
    expect(reader.lastTag.value.epc).toBe('AABB')
  })

  it('tagsByRssi เรียงแรงสุดก่อน และ rssi ที่ไม่มีไปท้าย', () => {
    reader.attach()
    fireTag({ epc: 'A1', rssi: -70 })
    fireTag({ epc: 'B2', rssi: -40 })
    fireTag({ epc: 'C3' })
    expect(reader.tagsByRssi.value.map((t) => t.epc)).toEqual(['B2', 'A1', 'C3'])
  })

  it('ข้าม event ที่ไม่มี epc', () => {
    reader.attach()
    fireTag({ epc: '  ', rssi: -40 })
    fireTag(undefined)
    expect(reader.tags.value).toHaveLength(0)
  })

  it('clear ล้าง tags และ lastTag', () => {
    reader.attach()
    fireTag({ epc: 'A1' })
    reader.clear()
    expect(reader.tags.value).toEqual([])
    expect(reader.lastTag.value).toBeNull()
  })

  it('setPower clamp 1-30 และปัดเป็น int', () => {
    const bridge = makeBridge()
    window.DkRfid = bridge
    reader.attach()
    expect(reader.setPower(0)).toBe(1)
    expect(reader.setPower(99)).toBe(30)
    expect(reader.setPower(12.6)).toBe(13)
    expect(reader.setPower('abc')).toBeNull()
    expect(bridge.setPower.mock.calls).toEqual([[1], [30], [13]])
  })

  it('detach ถอด listener (event หลังจากนั้นไม่เข้า) และหยุดอ่านถ้ากำลังอ่าน', () => {
    const bridge = makeBridge()
    window.DkRfid = bridge
    reader.attach()
    reader.start()
    reader.detach()
    expect(bridge.stop).toHaveBeenCalledTimes(1)
    fireTag({ epc: 'ZZ' })
    expect(reader.tags.value).toHaveLength(0)
  })

  it('addManual รับเฉพาะ hex และ normalize เป็นตัวพิมพ์ใหญ่', () => {
    expect(reader.addManual('xyz')).toBe(false)
    expect(reader.addManual('')).toBe(false)
    expect(reader.addManual('e280 11a0')).toBe(true)
    expect(reader.tags.value[0].epc).toBe('E28011A0')
  })

  it('helper normalizeEpc / isValidEpc', () => {
    expect(normalizeEpc(' ab cd ')).toBe('ABCD')
    expect(isValidEpc('abcd')).toBe(true)
    expect(isValidEpc('abcg')).toBe(false)
  })
})
