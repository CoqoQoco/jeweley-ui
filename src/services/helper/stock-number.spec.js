import { describe, it, expect } from 'vitest'
import { normalizeStockNumber, isSameStockNumber, stripStockNumberDash } from './stock-number.js'

describe('normalizeStockNumber', () => {
  it('trim, ตัดขีด, ตัวใหญ่', () => {
    expect(normalizeStockNumber(' dk-20g-123 ')).toBe('DK20G123')
    expect(normalizeStockNumber('DK20I969')).toBe('DK20I969')
  })

  it('null/undefined → ค่าว่าง', () => {
    expect(normalizeStockNumber(null)).toBe('')
    expect(normalizeStockNumber(undefined)).toBe('')
  })
})

describe('isSameStockNumber', () => {
  it('เลขมีขีดกับไม่มีขีดถือว่าเลขเดียวกัน', () => {
    expect(isSameStockNumber('DK-20G-123', 'DK20G123')).toBe(true)
    expect(isSameStockNumber('DK20G123', 'dk-20g-124')).toBe(false)
  })

  it('ค่าว่างไม่ถือว่าเท่ากัน', () => {
    expect(isSameStockNumber('', '')).toBe(false)
    expect(isSameStockNumber(null, undefined)).toBe(false)
  })
})

describe('stripStockNumberDash', () => {
  it('ตัดเฉพาะขีด ไม่แตะตัวพิมพ์', () => {
    expect(stripStockNumberDash('DK-20g-123')).toBe('DK20g123')
    expect(stripStockNumberDash(null)).toBe('')
  })
})
