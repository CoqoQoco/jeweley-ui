import { describe, it, expect } from 'vitest'
import {
  resolvePrice,
  formatPrice,
  salePriceFromPercent,
  percentFromPrices,
  validatePrice,
  countPriced
} from './catalog-price.js'

describe('resolvePrice', () => {
  it('A: full > sale => strike', () => {
    const r = resolvePrice({ priceFull: 30000, priceSale: 25000, priceCurrency: 'THB' })
    expect(r.kind).toBe('strike')
    expect(r.fullText).toBe('THB 30,000')
    expect(r.saleText).toBe('THB 25,000')
  })

  it('B: only full => single', () => {
    const r = resolvePrice({ priceFull: 30000, priceSale: null })
    expect(r.kind).toBe('single')
    expect(r.amountText).toBe('THB 30,000')
  })

  it('C: only sale => single', () => {
    const r = resolvePrice({ priceFull: null, priceSale: 25000 })
    expect(r.kind).toBe('single')
    expect(r.amountText).toBe('THB 25,000')
  })

  it('D: full == sale => single', () => {
    const r = resolvePrice({ priceFull: 25000, priceSale: 25000 })
    expect(r.kind).toBe('single')
    expect(r.amount).toBe(25000)
  })

  it('E: neither => none', () => {
    expect(resolvePrice({}).kind).toBe('none')
    expect(resolvePrice({ priceFull: null, priceSale: null }).kind).toBe('none')
    expect(resolvePrice({ priceFull: 0, priceSale: 0 }).kind).toBe('none')
    expect(resolvePrice({ priceFull: '', priceSale: '' }).kind).toBe('none')
  })

  it('F: sale > full (invalid) => single of sale, never strike', () => {
    const r = resolvePrice({ priceFull: 100, priceSale: 200 })
    expect(r.kind).toBe('single')
    expect(r.amount).toBe(200)
  })

  it('currency default THB, USD kept', () => {
    expect(resolvePrice({ priceFull: 10 }).currency).toBe('THB')
    expect(resolvePrice({ priceFull: 10, priceCurrency: 'USD' }).amountText).toBe('USD 10')
  })
})

describe('formatPrice', () => {
  it('thousands separators, no decimals for integer', () => {
    expect(formatPrice(25000, 'THB')).toBe('THB 25,000')
    expect(formatPrice(1234567, 'USD')).toBe('USD 1,234,567')
  })

  it('2 decimals when not integer', () => {
    expect(formatPrice(1087.5, 'USD')).toBe('USD 1,087.50')
    expect(formatPrice(99.99, 'THB')).toBe('THB 99.99')
  })

  it('no baht glyph', () => {
    expect(formatPrice(100, 'THB')).not.toContain('฿')
  })

  it('empty for null', () => {
    expect(formatPrice(null, 'THB')).toBe('')
  })
})

describe('salePriceFromPercent', () => {
  it('25% off 1,450 = 1,087.50', () => {
    expect(salePriceFromPercent(1450, 25)).toBe(1087.5)
  })

  it('rounds once to 2 decimals (half-up)', () => {
    expect(salePriceFromPercent(100, 33.333)).toBe(66.67)
    expect(salePriceFromPercent(10.01, 50)).toBe(5.01)
  })

  it('invalid input => null', () => {
    expect(salePriceFromPercent(null, 10)).toBeNull()
    expect(salePriceFromPercent(1000, -1)).toBeNull()
    expect(salePriceFromPercent(1000, 101)).toBeNull()
    expect(salePriceFromPercent(1000, '')).toBeNull()
  })

  it('0% and 100%', () => {
    expect(salePriceFromPercent(1000, 0)).toBe(1000)
    expect(salePriceFromPercent(1000, 100)).toBe(0)
  })
})

describe('percentFromPrices', () => {
  it('50% off', () => {
    expect(percentFromPrices(2000, 1000)).toBe(50)
  })

  it('no discount => null', () => {
    expect(percentFromPrices(1000, 1000)).toBeNull()
    expect(percentFromPrices(1000, null)).toBeNull()
  })
})

describe('validatePrice', () => {
  it('sale > full => saleExceedsFull', () => {
    expect(validatePrice({ priceFull: 100, priceSale: 150 })).toBe('saleExceedsFull')
  })

  it('valid combos => null', () => {
    expect(validatePrice({ priceFull: 100, priceSale: 100 })).toBeNull()
    expect(validatePrice({ priceFull: 100, priceSale: 50 })).toBeNull()
    expect(validatePrice({ priceSale: 50 })).toBeNull()
    expect(validatePrice({})).toBeNull()
  })

  it('negative => negative', () => {
    expect(validatePrice({ priceFull: -1 })).toBe('negative')
  })
})

describe('countPriced', () => {
  it('counts with / without', () => {
    const r = countPriced([{ priceFull: 10 }, { priceSale: 5 }, {}, { priceFull: 0 }])
    expect(r).toEqual({ withPrice: 2, withoutPrice: 2 })
  })
})
