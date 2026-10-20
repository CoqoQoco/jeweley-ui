import { describe, it, expect } from 'vitest'
import { convertAmountToThaiText } from './thai-baht-text.js'

describe('convertAmountToThaiText', () => {
  it('611000 → หกแสนหนึ่งหมื่นหนึ่งพันบาทถ้วน', () => {
    expect(convertAmountToThaiText(611000)).toBe('หกแสนหนึ่งหมื่นหนึ่งพันบาทถ้วน')
  })

  it('61100 → หกหมื่นหนึ่งพันหนึ่งร้อยบาทถ้วน', () => {
    expect(convertAmountToThaiText(61100)).toBe('หกหมื่นหนึ่งพันหนึ่งร้อยบาทถ้วน')
  })

  it('21 → ยี่สิบเอ็ดบาทถ้วน', () => {
    expect(convertAmountToThaiText(21)).toBe('ยี่สิบเอ็ดบาทถ้วน')
  })

  it('มีสตางค์', () => {
    expect(convertAmountToThaiText(10.5)).toBe('สิบบาทห้าสิบสตางค์')
  })

  it('ค่าที่ไม่ใช่ตัวเลข → ว่าง', () => {
    expect(convertAmountToThaiText('abc')).toBe('')
  })
})
