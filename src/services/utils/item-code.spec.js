import { describe, it, expect } from 'vitest'
import { formatItemStyleCode } from './item-code.js'

describe('formatItemStyleCode', () => {
  it('มีครบทั้ง stockNumberOrigin และ mold', () => {
    expect(
      formatItemStyleCode({ stockNumberOrigin: 'S810022S', mold: 'S810022S', productNumber: 'S810022SD7YL' })
    ).toBe('S810022S/S810022S')
  })

  it('ไม่มี stockNumberOrigin ถอยไปใช้ stockNumber', () => {
    expect(
      formatItemStyleCode({ stockNumber: 'S810022S', mold: 'S810022S' })
    ).toBe('S810022S/S810022S')
  })

  it('ไม่มี mold ถอยไปใช้ productNumber', () => {
    expect(
      formatItemStyleCode({ stockNumberOrigin: 'S810022S', productNumber: 'S810022SD7YL' })
    ).toBe('S810022S/S810022SD7YL')
  })

  it('ไม่มีอะไรเลย คืนค่าว่าง', () => {
    expect(formatItemStyleCode({})).toBe('')
    expect(formatItemStyleCode(undefined)).toBe('')
  })
})
