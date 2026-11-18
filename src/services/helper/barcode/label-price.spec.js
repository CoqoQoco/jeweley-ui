import { describe, it, expect } from 'vitest'
import {
  computeLabelPrice,
  pickLabelPrice,
  formatLabelPriceText,
  isLabelRateOutOfRange,
  isValidLabelRate,
  isUsableLabelPrice,
  normalizeLabelPriceInput,
  formatLabelPriceInput
} from './label-price.js'

describe('computeLabelPrice', () => {
  it('$ = ราคาบาท ÷ เรท ปัด 2 ตำแหน่ง', () => {
    expect(computeLabelPrice(25400, 'USD', 33)).toBe(769.7)
    expect(computeLabelPrice(8250, 'USD', 33)).toBe(250)
  })

  it('ปัดครึ่งขึ้นครั้งเดียว (ขอบ 1.005)', () => {
    expect(computeLabelPrice(1.005, 'USD', 1)).toBe(1.01)
    expect(computeLabelPrice(1005, 'USD', 1000)).toBe(1.01)
  })

  it('฿ = ราคาเดิม', () => {
    expect(computeLabelPrice(25400, 'THB', 33)).toBe(25400)
    expect(computeLabelPrice(25400, 'THB', '')).toBe(25400)
  })

  it('ข้อมูลไม่พอ -> null', () => {
    expect(computeLabelPrice(null, 'THB', 33)).toBeNull()
    expect(computeLabelPrice(0, 'USD', 33)).toBeNull()
    expect(computeLabelPrice(-5, 'THB', 33)).toBeNull()
    expect(computeLabelPrice(25400, 'USD', '')).toBeNull()
    expect(computeLabelPrice(25400, 'USD', 0)).toBeNull()
  })
})

describe('pickLabelPrice', () => {
  it('override มาก่อน ไม่มี = ค่าคำนวณ', () => {
    expect(pickLabelPrice(25400, 'USD', 33, '300')).toBe(300)
    expect(pickLabelPrice(25400, 'USD', 33, null)).toBe(769.7)
    expect(pickLabelPrice(25400, 'USD', 33, undefined)).toBe(769.7)
  })

  it('override ว่าง (กำลังพิมพ์) = ยังไม่มีราคา -> null ไม่ถอยกลับไปค่าคำนวณ', () => {
    expect(pickLabelPrice(25400, 'USD', 33, '')).toBeNull()
    expect(pickLabelPrice(25400, 'USD', 33, '  ')).toBeNull()
  })

  it('เปลี่ยนเรท: ชิ้นที่ไม่ได้แก้คำนวณใหม่ ชิ้นที่แก้ยังเท่าเดิม', () => {
    expect(pickLabelPrice(33000, 'USD', 33, null)).toBe(1000)
    expect(pickLabelPrice(33000, 'USD', 30, null)).toBe(1100)
    expect(pickLabelPrice(33000, 'USD', 30, '999')).toBe(999)
  })
})

describe('formatLabelPriceText', () => {
  it('ตัด .00 ทิ้ง', () => {
    expect(formatLabelPriceText(250, 'USD')).toBe('$250')
    expect(formatLabelPriceText(250.0, 'USD')).toBe('$250')
  })

  it('มีทศนิยม -> 2 ตำแหน่ง', () => {
    expect(formatLabelPriceText(769.7, 'USD')).toBe('$769.70')
    expect(formatLabelPriceText(0.5, 'USD')).toBe('$0.50')
  })

  it('ไม่มีจุลภาคคั่นหลักพัน ไม่มีสัญลักษณ์ในโหมดบาท', () => {
    expect(formatLabelPriceText(25400, 'THB')).toBe('25400')
    expect(formatLabelPriceText(1234567.891, 'USD')).toBe('$1234567.89')
  })

  it('ปัดครึ่งขึ้นเมื่อคีย์ทศนิยมเกิน 2 ตำแหน่ง', () => {
    expect(formatLabelPriceText(1.005, 'USD')).toBe('$1.01')
  })

  it('ราคาใช้ไม่ได้ -> ว่าง', () => {
    expect(formatLabelPriceText(0, 'USD')).toBe('')
    expect(formatLabelPriceText(null, 'USD')).toBe('')
    expect(formatLabelPriceText('abc', 'USD')).toBe('')
  })
})

describe('rate / price validators', () => {
  it('เรทนอก 20–50 -> เตือน', () => {
    expect(isLabelRateOutOfRange(33)).toBe(false)
    expect(isLabelRateOutOfRange(19.9)).toBe(true)
    expect(isLabelRateOutOfRange(51)).toBe(true)
    expect(isLabelRateOutOfRange('')).toBe(false)
  })

  it('เรทว่าง/0/ไม่ใช่เลข ใช้ไม่ได้', () => {
    expect(isValidLabelRate('33')).toBe(true)
    expect(isValidLabelRate('')).toBe(false)
    expect(isValidLabelRate(0)).toBe(false)
    expect(isValidLabelRate('x')).toBe(false)
  })

  it('ราคา ≤ 0 ใช้ไม่ได้', () => {
    expect(isUsableLabelPrice(1)).toBe(true)
    expect(isUsableLabelPrice(0)).toBe(false)
    expect(isUsableLabelPrice(null)).toBe(false)
  })
})

describe('input helpers', () => {
  it('ช่องว่าง -> null (ไม่ถือว่าแก้เอง)', () => {
    expect(normalizeLabelPriceInput('')).toBeNull()
    expect(normalizeLabelPriceInput('  ')).toBeNull()
    expect(normalizeLabelPriceInput('12.5')).toBe('12.5')
  })

  it('โชว์ 2 ตำแหน่งเมื่อไม่ใช่จำนวนเต็ม', () => {
    expect(formatLabelPriceInput(769.7)).toBe('769.70')
    expect(formatLabelPriceInput(250)).toBe(250)
    expect(formatLabelPriceInput(null)).toBe('')
  })
})
