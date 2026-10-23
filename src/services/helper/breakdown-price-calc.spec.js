import { describe, it, expect } from 'vitest'
import {
  buildBreakdownPriceItem,
  getBlockRowCount,
  resolveGoldGroupLabel,
  resolveItemKarat
} from './breakdown-price-calc.js'

function sampleItem(extra = {}) {
  return {
    qty: 2,
    productionTypeSize: '18K',
    priceTransactions: [
      { nameGroup: 'Gold', nameDescription: '18K Gold', qtyWeight: 1.98, qtyWeightPrice: 114.95, applyGoldLoss: false },
      { nameGroup: 'Gem', nameDescription: 'Diamond', qty: 6, qtyWeight: 0.3, qtyWeightPrice: 70, totalPrice: 21 },
      { nameGroup: 'Gem', nameDescription: 'Ruby', qty: 1, qtyWeight: 0.4, qtyWeightPrice: 42.4, totalPrice: 16.96 },
      { nameGroup: 'Gem', nameDescription: 'Sapphire', qty: 1, qtyWeight: 0.3, qtyWeightPrice: 42.4, totalPrice: 12.72 },
      { nameGroup: 'Gem', nameDescription: 'Emerald', qty: 1, qtyWeight: 0.5, qtyWeightPrice: 25.4, totalPrice: 12.7 },
      { nameGroup: 'Embed', nameDescription: 'Setting', qty: 1, qtyPrice: 4.5, totalPrice: 4.5 },
      { nameGroup: 'Worker', nameDescription: 'W.C.P.F.R', qty: 1, qtyPrice: 11, totalPrice: 11 }
    ],
    ...extra
  }
}

const OPTS = { currencyMultiplier: 1, profitPercent: 10, goldLossPercent: 12 }

describe('buildBreakdownPriceItem sample item 1', () => {
  const m = buildBreakdownPriceItem(sampleItem(), OPTS)

  it('gold / diamond / labor', () => {
    expect(m.gold).toEqual({ weight: 1.98, pricePerGram: 114.95, value: 227.6 })
    expect(m.diamond.pcs).toBe(6)
    expect(m.diamond.ct).toBe(0.3)
    expect(m.diamond.pricePerCt).toBe(70)
    expect(m.diamond.charge).toBe(21)
    expect(m.laborTotal).toBe(15.5)
    expect(m.labor.map((l) => l.total)).toEqual([4.5, 11])
  })

  it('stone options: N per stone', () => {
    expect(m.mode).toBe('options')
    expect(m.stones.map((s) => s.name)).toEqual(['Ruby', 'Sapphire', 'Emerald'])
    expect(m.options.map((o) => o.N)).toEqual([281.06, 276.82, 276.8])
    expect(m.options[0].O).toBe(309.17)
    expect(m.options[0].Q).toBe(618.34)
    expect(m.options[0].P).toBe(2)
  })

  it('block rows = max(stones, labor+1, 1)', () => {
    expect(getBlockRowCount(m)).toBe(3)
  })
})

describe('stoneAsOptions=false', () => {
  it('sums all stone charges into one total', () => {
    const m = buildBreakdownPriceItem(sampleItem({ stoneAsOptions: false }), OPTS)
    expect(m.mode).toBe('single')
    expect(m.options).toEqual([])
    expect(m.single.K).toBe(42.38)
    expect(m.single.N).toBe(306.48)
    expect(m.single.O).toBe(337.13)
  })
})

describe('defaults when no embed / worker rows', () => {
  const item = {
    qty: 1,
    priceTransactions: [
      { nameGroup: 'Gold', nameDescription: 'Gold', qtyWeight: 2, qtyWeightPrice: 100, applyGoldLoss: false },
      { nameGroup: 'Gem', nameDescription: 'เพชร', qty: 4, qtyWeight: 0.2, qtyWeightPrice: 50, totalPrice: 10 },
      { nameGroup: 'Gem', nameDescription: 'Ruby', qty: 3, qtyWeight: 0.3, totalPrice: 9 },
      { nameGroup: 'Gem', nameDescription: 'Garnet', qty: 5, qtyWeight: 0.5, totalPrice: 7 }
    ]
  }
  const settings = { laborAllSettingUsd: 0.5, laborWcpfrUsd: 11 }

  it('options mode uses D + max stone pcs, rate = multiplier -> USD unchanged', () => {
    const m = buildBreakdownPriceItem(item, { currencyMultiplier: 33, ...settings })
    expect(m.labor.map((l) => l.name)).toEqual(['All Setting', 'W.C.P.F.R'])
    expect(m.labor[0].pricePerPc).toBe(0.5)
    expect(m.labor[0].total).toBe(4.5)
    expect(m.labor[1].total).toBe(11)
    expect(m.laborTotal).toBe(15.5)
  })

  it('non-options mode uses D + sum of stone pcs', () => {
    const m = buildBreakdownPriceItem({ ...item, stoneAsOptions: false }, { currencyMultiplier: 33, ...settings })
    expect(m.labor[0].total).toBe(6)
  })

  it('usdRate converts into other display currency', () => {
    const m = buildBreakdownPriceItem(item, { currencyMultiplier: 1, usdRate: 33, ...settings })
    expect(m.labor[1].total).toBe(363)
  })
})

describe('currency conversion and splits', () => {
  it('divides THB by currencyMultiplier', () => {
    const m = buildBreakdownPriceItem(
      {
        qty: 1,
        priceTransactions: [
          { nameGroup: 'Gold', nameDescription: 'Gold', qtyWeight: 2, qtyWeightPrice: 3300, applyGoldLoss: false },
          { nameGroup: 'Gem', nameDescription: 'Ruby', qty: 1, qtyWeight: 1, totalPrice: 660 }
        ]
      },
      { currencyMultiplier: 33, profitPercent: 0 }
    )
    expect(m.gold.pricePerGram).toBe(100)
    expect(m.gold.value).toBe(200)
    expect(m.stones[0].charge).toBe(20)
    expect(m.stones[0].pricePerCt).toBe(20)
  })

  it('applies gold loss and skips alloy', () => {
    const m = buildBreakdownPriceItem(
      {
        qty: 1,
        priceTransactions: [
          { nameGroup: 'Gold', nameDescription: 'Gold', qtyWeight: 10, qtyWeightPrice: 100, applyGoldLoss: true },
          { nameGroup: 'Gold', nameDescription: 'Alloy', qtyWeight: 1, qtyWeightPrice: 10, applyGoldLoss: true }
        ]
      },
      { currencyMultiplier: 1, goldLossPercent: 12 }
    )
    expect(m.gold.weight).toBe(12.2)
    expect(m.gold.value).toBe(1130)
  })

  it('other groups go into labor, no stones -> single', () => {
    const m = buildBreakdownPriceItem(
      { qty: 1, priceTransactions: [{ nameGroup: 'ETC', nameDescription: 'Box', totalPrice: 3 }] },
      { currencyMultiplier: 1, profitPercent: 0 }
    )
    expect(m.mode).toBe('single')
    expect(m.labor.map((l) => l.name)).toContain('Box')
    expect(m.laborTotal).toBe(m.labor.reduce((s, l) => s + l.total, 0))
  })
})

describe('karat label', () => {
  it('resolves per item and group', () => {
    expect(resolveItemKarat({ productionTypeSize: '14k' })).toBe('14K')
    expect(resolveItemKarat({ priceTransactions: [{ nameGroup: 'Gold', nameDescription: '9K Gold' }] })).toBe('9K')
    expect(resolveGoldGroupLabel([{ productionTypeSize: '18K' }, { productionTypeSize: '18K' }])).toBe('18K GOLD')
    expect(resolveGoldGroupLabel([{ productionTypeSize: '18K' }, { productionTypeSize: '14K' }])).toBe('GOLD')
    expect(resolveGoldGroupLabel([{}])).toBe('GOLD')
  })
})
