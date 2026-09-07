import { describe, it, expect } from 'vitest'
import {
  splitRuns,
  isTotalLine,
  computeRunPositions,
  computeCanvasHeight,
  applyOneBitThreshold
} from './receipt-image-preview.js'

// happy-dom ไม่มี canvas 2d context จริง — เทสต์เฉพาะฟังก์ชัน pure (ไม่พึ่ง ctx.measureText/fillText)
// renderReceiptCanvas ต้องทดสอบผ่านเบราว์เซอร์จริง (E2E) ไม่ใช่ vitest

describe('splitRuns', () => {
  it('บรรทัดผสมไทย/อังกฤษ แบ่ง run ทุกครั้งที่สลับ ASCII/ไม่ใช่ ASCII (ช่องว่างเป็น ASCII จึงตัด run ไทยเป็นท่อนๆ)', () => {
    const line = 'Customer : คุณสมชาย ใจดี'
    const runs = splitRuns(line)

    expect(runs).toHaveLength(4)
    expect(runs[0]).toEqual({ text: 'Customer : ', startIndex: 0, isThai: false })
    expect(runs[1]).toEqual({ text: 'คุณสมชาย', startIndex: 11, isThai: true })
    expect(runs[2]).toEqual({ text: ' ', startIndex: 19, isThai: false })
    expect(runs[3]).toEqual({ text: 'ใจดี', startIndex: 20, isThai: true })
  })

  it('บรรทัด ASCII ล้วน ได้ run เดียว isThai=false', () => {
    const line = 'Seller   : CoqoAdmin'
    const runs = splitRuns(line)

    expect(runs).toHaveLength(1)
    expect(runs[0]).toEqual({ text: line, startIndex: 0, isThai: false })
  })

  it('บรรทัดไทยล้วน ได้ run เดียว isThai=true', () => {
    const line = 'คุณสมชาย'
    const runs = splitRuns(line)

    expect(runs).toHaveLength(1)
    expect(runs[0]).toEqual({ text: line, startIndex: 0, isThai: true })
  })

  it('บรรทัดว่าง คืน array ว่าง', () => {
    expect(splitRuns('')).toEqual([])
  })

  it('สลับไทย/อังกฤษหลายช่วง แบ่งได้ครบทุก run (ช่องว่างนับเป็น ASCII เสมอ)', () => {
    const line = 'A ก B ข'
    const runs = splitRuns(line)

    expect(runs.map((r) => r.text)).toEqual(['A ', 'ก', ' B ', 'ข'])
    expect(runs.map((r) => r.startIndex)).toEqual([0, 2, 3, 6])
    expect(runs.map((r) => r.isThai)).toEqual([false, true, false, true])
  })
})

describe('isTotalLine', () => {
  it('TOTAL (THB) → true', () => {
    expect(isTotalLine('   TOTAL (THB)              1,234.00')).toBe(true)
  })

  it('TOTAL (USD) → true', () => {
    expect(isTotalLine('  TOTAL (USD)                 12.00')).toBe(true)
  })

  it('บรรทัดอื่น (Subtotal) → false', () => {
    expect(isTotalLine('     Subtotal                900.00')).toBe(false)
  })

  it('บรรทัดว่าง → false', () => {
    expect(isTotalLine('')).toBe(false)
  })

  it('คำที่ขึ้นต้นคล้ายกันแต่ไม่ใช่ TOTAL → false', () => {
    expect(isTotalLine('Not-A-Total-Line')).toBe(false)
  })
})

describe('computeRunPositions', () => {
  it('ยึดตำแหน่งคอลัมน์ตาม startIndex * charWidth เมื่อไม่ชนกัน', () => {
    const charWidth = 10
    const runs = [
      { text: 'AB', startIndex: 0, isThai: false },
      { text: 'CD', startIndex: 5, isThai: false }
    ]
    const measureFn = (run) => run.text.length * charWidth // จำลอง monospace เป๊ะ

    const { positions, totalWidth } = computeRunPositions(runs, charWidth, measureFn)

    expect(positions[0].x).toBe(0)
    expect(positions[1].x).toBe(50) // 5 * 10
    expect(totalWidth).toBe(70) // 50 + (2*10)
  })

  it('กันซ้อนทับ: run ก่อนหน้ากว้างเกินจน startIndex ของ run ถัดไปชน ต้องเลื่อน cursor แทน', () => {
    const charWidth = 10
    const runs = [
      { text: 'กขคง', startIndex: 0, isThai: true }, // วัดกว้างเกิน 3 คอลัมน์ (ไม่ใช่ monospace)
      { text: 'XYZ', startIndex: 3, isThai: false }
    ]
    const measureFn = (run) => (run.isThai ? 50 : run.text.length * charWidth)

    const { positions, totalWidth } = computeRunPositions(runs, charWidth, measureFn)

    expect(positions[0].x).toBe(0)
    // desiredX ของ run ที่ 2 = 3*10 = 30 แต่ cursor หลัง run แรก = 50 → ต้องใช้ 50 กันซ้อนทับ
    expect(positions[1].x).toBe(50)
    expect(totalWidth).toBe(80) // 50 + 30
  })

  it('array ว่าง คืน positions ว่างและ totalWidth 0', () => {
    const { positions, totalWidth } = computeRunPositions([], 10, () => 0)
    expect(positions).toEqual([])
    expect(totalWidth).toBe(0)
  })
})

describe('applyOneBitThreshold', () => {
  it('พิกเซลแดงเข้มของโลโก้ (190,45,45) luminance≈88 → ต้องกลายเป็นดำสนิท', () => {
    const data = new Uint8ClampedArray([190, 45, 45, 255])
    applyOneBitThreshold(data)
    expect(Array.from(data)).toEqual([0, 0, 0, 255])
  })

  it('เทาอ่อน (200,200,200) luminance=200 → ต้องกลายเป็นขาวสนิท', () => {
    const data = new Uint8ClampedArray([200, 200, 200, 255])
    applyOneBitThreshold(data)
    expect(Array.from(data)).toEqual([255, 255, 255, 255])
  })

  it('คาบเส้นพอดี threshold (160,160,160) luminance=160 → ไม่ < 160 จึงเป็นขาว', () => {
    const data = new Uint8ClampedArray([160, 160, 160, 255])
    applyOneBitThreshold(data)
    expect(Array.from(data)).toEqual([255, 255, 255, 255])
  })

  it('ต่ำกว่า threshold เพียงเล็กน้อย (159,159,159) luminance=159 → ต้องเป็นดำ', () => {
    const data = new Uint8ClampedArray([159, 159, 159, 255])
    applyOneBitThreshold(data)
    expect(Array.from(data)).toEqual([0, 0, 0, 255])
  })

  it('บังคับ alpha เป็น 255 เสมอ ไม่ว่า alpha เดิมจะเป็นอะไร', () => {
    const data = new Uint8ClampedArray([255, 255, 255, 0])
    applyOneBitThreshold(data)
    expect(data[3]).toBe(255)
  })

  it('แปลงหลายพิกเซลในอาร์เรย์เดียวกันได้ถูกต้องทีละพิกเซล', () => {
    // พิกเซล 1: ดำ (แดงเข้ม), พิกเซล 2: ขาว (เทาอ่อน)
    const data = new Uint8ClampedArray([190, 45, 45, 255, 200, 200, 200, 255])
    applyOneBitThreshold(data)
    expect(Array.from(data)).toEqual([0, 0, 0, 255, 255, 255, 255, 255])
  })
})

describe('computeCanvasHeight', () => {
  it('ไม่มีโลโก้ (textTop=0): height = ceil(lines*lineHeight) + bottomMargin', () => {
    const height = computeCanvasHeight(10, 20, 0, 60)
    expect(height).toBe(0 + 200 + 60)
  })

  it('มีโลโก้ (textTop>0): บวก textTop เข้าไปด้วย', () => {
    const height = computeCanvasHeight(10, 20, 130, 60)
    expect(height).toBe(130 + 200 + 60)
  })

  it('ปัดเศษขึ้นเสมอเมื่อ lines*lineHeight ไม่ลงตัว', () => {
    const height = computeCanvasHeight(3, 20.5, 0, 60)
    // 3 * 20.5 = 61.5 → ceil = 62
    expect(height).toBe(62 + 60)
  })

  it('ใช้ bottomMarginDots default เมื่อไม่ส่งมา', () => {
    const height = computeCanvasHeight(5, 10)
    expect(height).toBe(0 + 50 + 60)
  })
})
