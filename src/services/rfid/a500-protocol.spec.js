import { describe, it, expect } from 'vitest'
import {
  crc16,
  encodeFrame,
  escapeBytes,
  unescapeBytes,
  buildStartInventoryCommand,
  buildStopCommand,
  createFrameParser,
  rssiFromByte,
  toHex
} from './a500-protocol.js'

// สร้างเฟรมขาเข้าจากเครื่อง: body = type(2) + ...payload
function inbound(body) {
  return encodeFrame((body[0] << 8) | body[1], body.slice(2))
}

function tagFrame(epcBytes, extra = [0x01, 0xca]) {
  return inbound([0x06, 0x02, 0x00, epcBytes.length, ...epcBytes, ...extra])
}

describe('a500-protocol encode', () => {
  it('คำสั่งเริ่มอ่านต้องได้ไบต์ตรงตามเครื่องจริง', () => {
    expect(toHex(buildStartInventoryCommand())).toBe('55 00 00 06 06 02 00 00 00 00 16 96')
  })

  it('คำสั่งหยุดต้องได้ไบต์ตรงตามเครื่องจริง', () => {
    expect(toHex(buildStopCommand())).toBe('55 00 00 02 02 12 0C 44')
  })

  it('crc16 ของข้อมูลว่างเป็น 0 และคำนวณซ้ำได้ค่าเดิม', () => {
    expect(crc16([])).toBe(0)
    expect(crc16([0x00, 0x00, 0x02, 0x02, 0x12])).toBe(0x0c44)
  })

  it('escape / unescape ไป-กลับ รวม 0x55 และ 0x56 ในเนื้อหา', () => {
    const raw = [0x01, 0x55, 0x02, 0x56, 0x03, 0x56, 0x55]
    const escaped = escapeBytes(raw)
    expect(escaped).toEqual([0x01, 0x56, 0x56, 0x02, 0x56, 0x57, 0x03, 0x56, 0x57, 0x56, 0x56])
    expect(unescapeBytes(escaped)).toEqual(raw)
  })

  it('unescape คืน null เมื่อข้อมูลหมดกลางลำดับ escape', () => {
    expect(unescapeBytes([0x01, 0x56])).toBeNull()
  })

  it('rssi: 0xCA -> -54, ค่าบวกคงเดิม', () => {
    expect(rssiFromByte(0xca)).toBe(-54)
    expect(rssiFromByte(0x10)).toBe(16)
  })
})

describe('a500-protocol parser', () => {
  const EPC = [0xe2, 0x80, 0x11, 0x60, 0x60, 0x00, 0x02, 0x05]

  it('อ่านเฟรมแท็ก: EPC ตัวพิมพ์ใหญ่ไม่มีช่องว่าง + antenna + rssi', () => {
    const events = createFrameParser().push(tagFrame(EPC))
    expect(events).toEqual([{ kind: 'tag', epc: 'E280116060000205', antenna: 1, rssi: -54 }])
  })

  it('เฟรมแท็กที่ไม่มีไบต์ antenna/rssi ก็ใช้ได้', () => {
    const events = createFrameParser().push(tagFrame(EPC, []))
    expect(events).toEqual([{ kind: 'tag', epc: 'E280116060000205', antenna: null, rssi: null }])
  })

  it('มี antenna แต่ไม่มี rssi', () => {
    const [event] = createFrameParser().push(tagFrame(EPC, [0x02]))
    expect(event.antenna).toBe(2)
    expect(event.rssi).toBeNull()
  })

  it('ACK ของ inventory และ power off ไม่ถูกนับเป็นแท็ก', () => {
    const parser = createFrameParser()
    const ack1 = parser.push(inbound([0x06, 0x02, 0x00]))
    const ack2 = parser.push(inbound([0x02, 0x12, 0x00]))
    expect(ack1).toEqual([{ kind: 'frame', type: 0x0602, body: [0x06, 0x02, 0x00] }])
    expect(ack2).toEqual([{ kind: 'frame', type: 0x0212, body: [0x02, 0x12, 0x00] }])
  })

  it('รับไบต์ที่ถูกแบ่งเป็น chunk ทีละไบต์', () => {
    const parser = createFrameParser()
    const events = []
    for (const b of tagFrame(EPC)) events.push(...parser.push([b]))
    expect(events).toHaveLength(1)
    expect(events[0].epc).toBe('E280116060000205')
  })

  it('EPC ที่มี 0x55 / 0x56 ในเนื้อหาถูก escape และอ่านกลับได้ถูกต้อง', () => {
    const epc = [0x55, 0x56, 0x01, 0x56, 0x55, 0xaa]
    const parser = createFrameParser()
    const frame = tagFrame(epc)
    expect(toHex(frame)).toContain('56 56')
    const events = []
    for (let i = 0; i < frame.length; i += 3) events.push(...parser.push(frame.slice(i, i + 3)))
    expect(events).toHaveLength(1)
    expect(events[0].epc).toBe('55560156 55AA'.replace(' ', ''))
  })

  it('มีขยะนำหน้าก่อน header', () => {
    const events = createFrameParser().push([0x00, 0x13, 0x99, ...tagFrame(EPC)])
    expect(events).toHaveLength(1)
    expect(events[0].kind).toBe('tag')
  })

  it('เฟรมที่ CRC ผิดถูกทิ้ง แล้ว resync ที่เฟรมถัดไป', () => {
    const bad = Array.from(tagFrame(EPC))
    bad[bad.length - 1] ^= 0xff
    const parser = createFrameParser()
    const events = parser.push([...bad, ...tagFrame([0x01, 0x02, 0x03])])
    expect(events).toHaveLength(1)
    expect(events[0].epc).toBe('010203')
    expect(parser.droppedCount).toBe(1)
  })

  it('หลายเฟรมใน chunk เดียว', () => {
    const events = createFrameParser().push([...tagFrame([0x01]), ...tagFrame([0x02]), ...tagFrame([0x03])])
    expect(events.map((e) => e.epc)).toEqual(['01', '02', '03'])
  })

  it('ฟิลด์ length ผิดปกติ (ใหญ่เกิน) ถูกทิ้งแล้วอ่านเฟรมถัดไปได้', () => {
    const events = createFrameParser().push([0x55, 0x00, 0xff, 0xff, ...tagFrame([0x07])])
    expect(events.map((e) => e.epc)).toEqual(['07'])
  })
})
