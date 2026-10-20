import { describe, it, expect } from 'vitest'
import {
  STALE_DAYS,
  applyRounding,
  calcQuickPrice,
  getMetalWeight,
  getQuickPriceAgeDays,
  isQuickPriceStale
} from './quick-price.js'

describe('calcQuickPrice', () => {
  it('35000 / 3.5 / 2.00g / 2000 / 20% / r100 => 7200', () => {
    const r = calcQuickPrice({ salePrice: 35000, markup: 3.5, goldWeight: 2, goldPrice: 2000, percent: 20, rounding: 100 })
    expect(r.valid).toBe(true)
    expect(r.cost).toBe(10000)
    expect(r.goldCost).toBe(4000)
    expect(r.costExGold).toBe(6000)
    expect(r.quickPrice).toBe(7200)
  })

  it('28500 / 3.5 / 1.84g / 2000 / 20% / r100 => raw ~5355.43 => 5400', () => {
    const r = calcQuickPrice({ salePrice: 28500, markup: 3.5, goldWeight: 1.84, goldPrice: 2000, percent: 20, rounding: 100 })
    expect(r.valid).toBe(true)
    expect(r.raw).toBeCloseTo(5355.43, 2)
    expect(r.quickPrice).toBe(5400)
  })

  it('12900 / 3.5 / 3.10g / 2000 => costExGold ~ -2514.29 => invalid', () => {
    const r = calcQuickPrice({ salePrice: 12900, markup: 3.5, goldWeight: 3.1, goldPrice: 2000, percent: 20, rounding: 100 })
    expect(r.valid).toBe(false)
    expect(r.error).toBe('costExGold')
    expect(r.costExGold).toBeCloseTo(-2514.29, 2)
    expect(r.quickPrice).toBeNull()
  })

  it('percent ว่าง = 0%', () => {
    const r = calcQuickPrice({ salePrice: 35000, markup: 3.5, goldWeight: 2, goldPrice: 2000, percent: '', rounding: 0 })
    expect(r.valid).toBe(true)
    expect(r.quickPrice).toBe(6000)
  })

  it('input ไม่ครบ => error ตามลำดับ', () => {
    expect(calcQuickPrice({ salePrice: 0, markup: 3.5 }).error).toBe('salePrice')
    expect(calcQuickPrice({ salePrice: 35000, markup: 0 }).error).toBe('markup')
    expect(calcQuickPrice({ salePrice: 35000, markup: 3.5, goldWeight: '' }).error).toBe('goldWeight')
    expect(calcQuickPrice({ salePrice: 35000, markup: 3.5, goldWeight: 2, goldPrice: '' }).error).toBe('goldPrice')
    expect(
      calcQuickPrice({ salePrice: 35000, markup: 3.5, goldWeight: 2, goldPrice: 2000, percent: -1 }).error
    ).toBe('percent')
  })
})

describe('applyRounding', () => {
  it('rounding 0 => 2 ตำแหน่ง half-up', () => {
    expect(applyRounding(1.005, 0)).toBe(1.01)
    expect(applyRounding(5355.4286, 0)).toBe(5355.43)
  })

  it('10 / 100 / 1000 => ปัดขึ้นเป็นพหุคูณ', () => {
    expect(applyRounding(5355.43, 10)).toBe(5360)
    expect(applyRounding(5355.43, 100)).toBe(5400)
    expect(applyRounding(5355.43, 1000)).toBe(6000)
  })

  it('ค่าที่เป็นพหุคูณพอดีไม่ถูกดันขึ้น (กัน float drift)', () => {
    expect(applyRounding(7200, 100)).toBe(7200)
    expect(applyRounding(7200.000000000001, 100)).toBe(7200)
    expect(applyRounding(7200.01, 100)).toBe(7300)
  })
})

describe('getMetalWeight', () => {
  it('รวมทองที่หน่วยเป็นกรัม ไม่สนตัวพิมพ์', () => {
    const r = getMetalWeight([
      { type: 'Gold', weight: 1.5, weightUnit: 'g.' },
      { type: 'GOLD', weight: 0.5, weightUnit: 'g' },
      { type: 'Gem', weight: 9, weightUnit: 'ct.' }
    ])
    expect(r).toEqual({ weight: 2, source: 'gold' })
  })

  it('ไม่มีทองใช้เงินแทน', () => {
    expect(getMetalWeight([{ type: 'Silver', weight: 3, weightUnit: 'g.' }])).toEqual({ weight: 3, source: 'silver' })
  })

  it('ไม่มีโลหะเลย => 0 / null', () => {
    expect(getMetalWeight([{ type: 'Gem', weight: 1, weightUnit: 'ct.' }])).toEqual({ weight: 0, source: null })
    expect(getMetalWeight(undefined)).toEqual({ weight: 0, source: null })
  })
})

describe('stale', () => {
  const now = new Date('2026-10-20T12:00:00Z')

  it('นับอายุเป็นวัน', () => {
    expect(getQuickPriceAgeDays('2026-10-20T00:00:00Z', now)).toBe(0)
    expect(getQuickPriceAgeDays('2026-10-10T12:00:00Z', now)).toBe(10)
    expect(getQuickPriceAgeDays(null, now)).toBeNull()
  })

  it(`เก่าเมื่อเกิน ${STALE_DAYS} วัน`, () => {
    expect(isQuickPriceStale('2026-10-13T12:00:00Z', now)).toBe(false)
    expect(isQuickPriceStale('2026-10-12T12:00:00Z', now)).toBe(true)
    expect(isQuickPriceStale(null, now)).toBe(false)
  })
})
