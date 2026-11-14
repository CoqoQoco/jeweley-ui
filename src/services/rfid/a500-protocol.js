/**
 * a500-protocol — โปรโตคอลเครื่องอ่าน RFID แบบถาด iData A500 (ฟังก์ชันล้วน ไม่ใช้ browser API)
 *
 * เฟรม: 0x55 | control(0x00) | len(2, BE; = 2 + ความยาว body) | msgType(2, BE) | body | CRC16(2, BE)
 * CRC16 คิดจากทุกไบต์หลัง header จนจบ body (poly 0x8005, init 0, ไม่ reflect)
 * escape ทุกไบต์หลัง header: 0x55 -> 56 56, 0x56 -> 56 57
 *
 * ใช้เฉพาะ 2 คำสั่ง: เริ่มอ่านต่อเนื่อง (0x0602) กับหยุด/ปิดเสา (0x0212) — ห้ามเพิ่มคำสั่งตั้งค่า
 */
import { normalizeEpc } from '@/composables/useRfidReader.js'

export const FRAME_HEADER = 0x55
export const ESCAPE = 0x56
export const MSG_INVENTORY = 0x0602
export const MSG_POWER_OFF = 0x0212
const MAX_FRAME_LEN = 1024

const CRC_TABLE = (() => {
  const table = new Uint16Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i << 8
    for (let j = 0; j < 8; j++) c = c & 0x8000 ? ((c << 1) ^ 0x8005) & 0xffff : (c << 1) & 0xffff
    table[i] = c
  }
  return table
})()

export function crc16(bytes) {
  let crc = 0
  for (const b of bytes) crc = ((crc << 8) ^ CRC_TABLE[((crc >> 8) ^ b) & 0xff]) & 0xffff
  return crc
}

export function escapeBytes(bytes) {
  const out = []
  for (const b of bytes) {
    if (b === FRAME_HEADER) out.push(ESCAPE, ESCAPE)
    else if (b === ESCAPE) out.push(ESCAPE, 0x57)
    else out.push(b)
  }
  return out
}

// คืน null ถ้าข้อมูลหมดกลางลำดับ escape (รอไบต์ถัดไป)
export function unescapeBytes(bytes) {
  const out = []
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i]
    if (b !== ESCAPE) {
      out.push(b)
      continue
    }
    if (i + 1 >= bytes.length) return null
    out.push(bytes[i + 1] === ESCAPE ? FRAME_HEADER : ESCAPE)
    i++
  }
  return out
}

export function encodeFrame(msgType, body = []) {
  const len = 2 + body.length
  const core = [0x00, len >> 8, len & 0xff, msgType >> 8, msgType & 0xff, ...body]
  const crc = crc16(core)
  return Uint8Array.from([FRAME_HEADER, ...escapeBytes([...core, crc >> 8, crc & 0xff])])
}

export function buildStartInventoryCommand() {
  return encodeFrame(MSG_INVENTORY, [0x00, 0x00, 0x00, 0x00])
}

export function buildStopCommand() {
  return encodeFrame(MSG_POWER_OFF)
}

export function toHex(bytes) {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')
}

// RSSI เป็น signed byte: 0xCA -> -54 dBm
export function rssiFromByte(byte) {
  return byte > 127 ? byte - 256 : byte
}

// body = [type(2), status, epcLen, epc..., antenna?, rssi?] — ACK (type + status) ไม่มี epcLen จึงไม่ใช่แท็ก
function parseTag(type, body) {
  if (type !== MSG_INVENTORY || body.length < 4) return null
  const status = body[2]
  const epcLen = body[3]
  if (status !== 0x00 || epcLen === 0 || body.length < 4 + epcLen) return null
  const epc = normalizeEpc(toHex(body.slice(4, 4 + epcLen)))
  const extra = body.slice(4 + epcLen)
  return {
    epc,
    antenna: extra.length > 0 ? extra[0] : null,
    rssi: extra.length > 1 ? rssiFromByte(extra[1]) : null
  }
}

/**
 * parser สตรีม — push(bytes) คืนอาร์เรย์ event:
 *   { kind: 'tag', epc, antenna, rssi } | { kind: 'frame', type, body }
 * อ่านตามฟิลด์ length (ไม่ค้นหา 0x55 ถัดไป) รับไบต์ที่ถูกแบ่งเป็น chunk ใดก็ได้
 * เฟรมที่ CRC ผิดถูกทิ้งแล้ว resync ที่ 0x55 ถัดไป (0x55 ดิบมีได้เฉพาะที่ header เพราะถูก escape ในเนื้อหา)
 */
export function createFrameParser() {
  let buf = []
  let dropped = 0

  function dropToNextHeader() {
    const next = buf.indexOf(FRAME_HEADER, 1)
    buf = next < 0 ? [] : buf.slice(next)
  }

  // คืน 'more' (รอข้อมูล) | 'bad' (ทิ้งแล้ว) | { type, body, consumed }
  function readOne() {
    const u = []
    let i = 1
    while (i < buf.length) {
      let b = buf[i]
      if (b === FRAME_HEADER) return 'bad'
      if (b === ESCAPE) {
        if (i + 1 >= buf.length) return 'more'
        b = buf[i + 1] === ESCAPE ? FRAME_HEADER : ESCAPE
        i++
      }
      u.push(b)
      i++
      if (u.length === 3) {
        const len = (u[1] << 8) | u[2]
        if (len < 2 || len > MAX_FRAME_LEN) return 'bad'
      }
      if (u.length >= 3 && u.length === 3 + ((u[1] << 8) | u[2]) + 2) {
        const len = (u[1] << 8) | u[2]
        const crc = (u[3 + len] << 8) | u[4 + len]
        if (crc16(u.slice(0, 3 + len)) !== crc) return 'bad'
        const body = u.slice(3, 3 + len)
        return { type: (body[0] << 8) | body[1], body, consumed: i }
      }
    }
    return 'more'
  }

  function push(bytes) {
    const events = []
    for (const b of bytes) buf.push(b & 0xff)
    for (;;) {
      const start = buf.indexOf(FRAME_HEADER)
      if (start < 0) {
        buf = []
        break
      }
      if (start > 0) buf = buf.slice(start)
      const result = readOne()
      if (result === 'more') break
      if (result === 'bad') {
        dropped++
        dropToNextHeader()
        continue
      }
      buf = buf.slice(result.consumed)
      const tag = parseTag(result.type, result.body)
      events.push(tag ? { kind: 'tag', ...tag } : { kind: 'frame', type: result.type, body: result.body })
    }
    return events
  }

  return {
    push,
    reset() {
      buf = []
    },
    get droppedCount() {
      return dropped
    }
  }
}
