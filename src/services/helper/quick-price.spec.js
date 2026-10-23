import { describe, it, expect } from 'vitest'
import {
  STALE_DAYS,
  applyRounding,
  calcAlloyWeight,
  calcQuickPrice,
  buildAlloyFactors,
  ALLOY_FACTORS,
  getAlloyKarat,
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

describe('alloy', () => {
  it('getAlloyKarat normalize เฉพาะ 18K/14K/9K', () => {
    expect(getAlloyKarat('18K')).toBe('18K')
    expect(getAlloyKarat(' 14k ')).toBe('14K')
    expect(getAlloyKarat('9K')).toBe('9K')
    expect(['Silver', '10K', 'N/A', '', null, undefined].map(getAlloyKarat)).toEqual(['', '', '', '', '', ''])
  })

  it('calcAlloyWeight 2.00g 18K => 0.5376', () => {
    expect(calcAlloyWeight(2, '18K')).toBeCloseTo(0.5376, 6)
    expect(calcAlloyWeight(2, '')).toBe(0)
    expect(calcAlloyWeight('', '18K')).toBe(0)
  })

  it('goldCostTotal = 2.00g@3800 + alloy 0.5376g@20 = 7610.752', () => {
    const r = calcQuickPrice({
      salePrice: 46900, markup: 3.5, goldWeight: 2, goldPrice: 3800,
      alloyWeight: calcAlloyWeight(2, '18K'), alloyPrice: 20, percent: 0, rounding: 100
    })
    expect(r.goldCostTotal).toBeCloseTo(7610.752, 6)
  })

  it('ตัวอย่างหน้าจอ: 1.88g@3800 + alloy 0.505344g@20 => 6300 / 13400', () => {
    const r = calcQuickPrice({
      salePrice: 46900, markup: 3.5, goldWeight: 1.88, goldPrice: 3800,
      alloyWeight: 0.505344, alloyPrice: 20, percent: 0, rounding: 100
    })
    expect(r.valid).toBe(true)
    expect(r.costExGold).toBeCloseTo(6245.89312, 5)
    expect(r.quickPrice).toBe(6300)
    expect(r.totalPrice).toBe(13400)
  })

  it('calcAlloyWeight ใช้ gold loss % และ factors ที่ส่งเข้ามา', () => {
    expect(calcAlloyWeight(1.88, '18K', 12)).toBeCloseTo(0.505344, 6)
    expect(calcAlloyWeight(2, '18K', 0)).toBeCloseTo(0.48, 6)
    expect(calcAlloyWeight(2, '9K', 12)).toBeCloseTo(2 * 1.12 * 0.625, 6)
    expect(calcAlloyWeight(2, '18K', 12, { '18K': 0.3 })).toBeCloseTo(0.672, 6)
    expect(calcAlloyWeight(2, '18K', '')).toBe(0)
    expect(calcAlloyWeight(2, '18K', -1)).toBe(0)
  })

  it('buildAlloyFactors อ่านจาก setting และ fallback เมื่อขาด', () => {
    expect(ALLOY_FACTORS['9K']).toBe(0.625)
    expect(buildAlloyFactors({ alloyFactor18K: 0.25, alloyFactor14K: 0, alloyFactor9K: 0.7 })).toEqual({
      '18K': 0.25,
      '14K': 0.41,
      '9K': 0.7
    })
    expect(buildAlloyFactors(undefined)).toEqual(ALLOY_FACTORS)
  })

  it('alloyWeight > 0 ต้องมี alloyPrice', () => {
    const base = { salePrice: 46900, markup: 3.5, goldWeight: 2, goldPrice: 3800, alloyWeight: 0.5 }
    expect(calcQuickPrice({ ...base, alloyPrice: '' }).error).toBe('alloyPrice')
    expect(calcQuickPrice({ ...base, alloyPrice: -1 }).error).toBe('alloyPrice')
    expect(calcQuickPrice({ ...base, alloyWeight: -1, alloyPrice: 20 }).error).toBe('alloyWeight')
    expect(calcQuickPrice({ ...base, alloyWeight: '', alloyPrice: '' }).valid).toBe(true)
  })
})

describe('gold loss line (บรรทัดที่ 3)', () => {
  const base = {
    salePrice: 46900, markup: 3.5, goldWeight: 1.88, goldPrice: 3800,
    alloyWeight: 0.505, alloyPrice: 20, percent: 50, rounding: 10
  }

  it('ตัวอย่างจริง gl 12%', () => {
    const r = calcQuickPrice({ ...base, goldLossPercent: 12 })
    expect(r.valid).toBe(true)
    expect(r.raw).toBeCloseTo(9368.85, 2)
    expect(r.quickPrice).toBe(9370)
    expect(r.totalPrice).toBe(16530)
    expect(r.goldLossValid).toBe(true)
    expect(r.goldWithLossCost).toBeCloseTo(8001.28, 2)
    expect(r.goldLossCostTotal).toBeCloseTo(8011.38, 2)
    expect(r.goldLossTotalRaw).toBeCloseTo(17380.23, 2)
    expect(r.goldLossTotalPrice).toBe(17390)
  })

  it('gl ว่าง/ติดลบ/ไม่ใช่เลข => บรรทัดเดิมยังคำนวณได้ บรรทัดใหม่เป็น null', () => {
    for (const bad of ['', null, undefined, -1, 'abc']) {
      const r = calcQuickPrice({ ...base, goldLossPercent: bad })
      expect(r.valid).toBe(true)
      expect(r.quickPrice).toBe(9370)
      expect(r.totalPrice).toBe(16530)
      expect(r.goldLossValid).toBe(false)
      expect(r.goldLossCostTotal).toBeNull()
      expect(r.goldLossTotalPrice).toBeNull()
    }
  })

  it('gl = 0 ใช้ได้ และ goldLossCostTotal = goldCostTotal', () => {
    const r = calcQuickPrice({ ...base, goldLossPercent: 0 })
    expect(r.goldLossValid).toBe(true)
    expect(r.goldLossCostTotal).toBeCloseTo(r.goldCostTotal, 6)
    expect(r.goldLossTotalPrice).toBe(r.totalPrice)
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
