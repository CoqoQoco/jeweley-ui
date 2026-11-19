import { describe, it, expect } from 'vitest'
import { resolvePriceFromPriceWeight, normalizePriceWeight } from './material-price-weight.js'

describe('resolvePriceFromPriceWeight', () => {
  it('ทอง: weight × priceWeight ปัดครั้งเดียว 2 ตำแหน่ง', () => {
    expect(resolvePriceFromPriceWeight({ type: 'Gold', weight: 0.97, price: 1 }, 2000)).toBe(1940)
    expect(resolvePriceFromPriceWeight({ type: 'gold', weight: 0.1, price: 1 }, 2100.1)).toBe(210.01)
    expect(resolvePriceFromPriceWeight({ type: 'GOLD', weight: 0.07, price: 1 }, 3000)).toBe(210)
  })

  it('ไม่ใช่ทอง → ราคาเดิม', () => {
    expect(resolvePriceFromPriceWeight({ type: 'Gem', weight: 1, price: 500 }, 2000)).toBe(500)
    expect(resolvePriceFromPriceWeight({ type: 'Silver', weight: 1, price: 70 }, 2000)).toBe(70)
  })

  it('weight 0/ว่าง → ราคาเดิม', () => {
    expect(resolvePriceFromPriceWeight({ type: 'Gold', weight: 0, price: 123 }, 2000)).toBe(123)
    expect(resolvePriceFromPriceWeight({ type: 'Gold', weight: null, price: 123 }, 2000)).toBe(123)
  })

  it('ล้างค่า (0) → ราคาเดิม', () => {
    expect(resolvePriceFromPriceWeight({ type: 'Gold', weight: 1, price: 123 }, 0)).toBe(123)
  })
})

describe('normalizePriceWeight', () => {
  it('ว่าง/null/ไม่ใช่ตัวเลข → 0 · string ตัวเลขแปลงเป็น Number', () => {
    expect(normalizePriceWeight('')).toBe(0)
    expect(normalizePriceWeight(null)).toBe(0)
    expect(normalizePriceWeight('abc')).toBe(0)
    expect(normalizePriceWeight('02000')).toBe(2000)
    expect(normalizePriceWeight('2000.5')).toBe(2000.5)
  })
})
