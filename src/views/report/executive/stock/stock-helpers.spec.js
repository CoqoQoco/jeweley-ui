import { describe, it, expect } from 'vitest'

import {
  STOCK_INSIGHT_ENDPOINT,
  buildOverviewParams,
  remapStockFindings,
  toneByThreshold,
  buildAgeRows,
  buildReceiptRows,
  buildCategoryRows,
  buildTrendHint,
  buildMonthLabels
} from './stock-helpers.js'

const t = (key, params) => (params ? `${key}:${JSON.stringify(params)}` : key)

describe('stock helpers', () => {
  it('request params contain only keys the API knows (metal is added by the store)', () => {
    expect(STOCK_INSIGHT_ENDPOINT).toBe('StockInsight/Overview')
    expect(buildOverviewParams()).toEqual({ months: 12 })
  })

  it('toneByThreshold: warning at/above the warn level, green below, main without data or threshold', () => {
    expect(toneByThreshold(30, 20)).toBe('warning')
    expect(toneByThreshold(20, 20)).toBe('warning')
    expect(toneByThreshold(5, 20)).toBe('green')
    expect(toneByThreshold(null, 20)).toBe('main')
    expect(toneByThreshold(5, undefined)).toBe('main')
  })

  it('cover forecast is remapped to a code per situation (null cover / low / high); other findings are untouched', () => {
    const items = [
      { code: 'FC_STK_COVER_MONTHS', params: { coverMonths: 1.2, direction: 'low' } },
      { code: 'FC_STK_COVER_MONTHS', params: { coverMonths: 40, direction: 'high' } },
      { code: 'FC_STK_COVER_MONTHS', params: { coverMonths: null, direction: 'high' } },
      { code: 'FC_STK_AGING_PROJECTED', params: {} }
    ]
    expect(remapStockFindings(items).map((i) => i.code)).toEqual(['FC_STK_COVER_LOW', 'FC_STK_COVER_HIGH', 'FC_STK_COVER_NONE', 'FC_STK_AGING_PROJECTED'])
    expect(remapStockFindings(null)).toEqual([])
    expect(items[0].code).toBe('FC_STK_COVER_MONTHS')
  })

  it('age rows keep the bucket order, derive with-cost count and no-cost percent, and hide qty for all metals', () => {
    const buckets = [
      { key: 'gt5y', count: 10, noCostCount: 5, costThb: 100, qty: 12 },
      { key: 'lt1y', count: 40, noCostCount: 4, costThb: 900, qty: 41 },
      { key: 'y1to2', count: 0, noCostCount: 0, costThb: 0, qty: 0 }
    ]
    const rows = buildAgeRows(buckets, t, 'GOLD')
    expect(rows.map((r) => r.key)).toEqual(['lt1y', 'y1to2', 'gt5y'])
    expect(rows[0]).toMatchObject({ count: 40, noCostCount: 4, withCostCount: 36, noCostPercent: 10, qtyShown: 41 })
    expect(rows[1].noCostPercent).toBeNull()
    expect(buildAgeRows(buckets, t, 'ALL').every((r) => r.qtyShown === null)).toBe(true)
    expect(buildAgeRows(null, t, 'ALL')).toEqual([])
  })

  it('receipt rows label a null type with a dash and compute the no-cost share', () => {
    const rows = buildReceiptRows([{ receiptType: 'PRODUCTION', count: 4, noCostCount: 1, qty: 4, costThb: 10 }, { receiptType: null, count: 2, noCostCount: 2, qty: 2, costThb: 0 }], t, 'SILVER')
    expect(rows[0]).toMatchObject({ label: 'PRODUCTION', noCostPercent: 25, qtyShown: 4 })
    expect(rows[1].label).toBe('view.productionInsight.stockInsight.receiptUnknown')
    expect(new Set(rows.map((r) => r.key)).size).toBe(2)
  })

  it('category rows are sorted by count, fall back to the code then to "unspecified"', () => {
    const rows = buildCategoryRows(
      [
        { category: 'RING', categoryName: 'แหวน', count: 3 },
        { category: 'X', categoryName: '', count: 9 },
        { category: '', categoryName: '', count: 5 }
      ],
      t,
      'GOLD'
    )
    expect(rows.map((r) => r.label)).toEqual(['X', 'view.productionInsight.stockInsight.categoryUnknown', 'แหวน'])
  })

  it('trend hint always explains net outflow and states the sales-history caveat (or its absence)', () => {
    const withHistory = buildTrendHint({ startMonth: '2026-06-01', fullMonths: 4 }, t)
    expect(withHistory).toContain('trendHintNet')
    expect(withHistory).toContain('trendHintHistory')
    expect(withHistory).toContain('"start":"มิ.ย. 2026"')
    expect(withHistory).toContain('"months":4')
    expect(buildTrendHint({ startMonth: null, fullMonths: 0 }, t)).toContain('trendHintNoHistory')
    expect(buildTrendHint(undefined, t)).toContain('trendHintNoHistory')
  })

  it('month labels come from the month start date with the year', () => {
    expect(buildMonthLabels([{ month: '2025-12-01' }, { month: '2026-01-01' }])).toEqual(['ธ.ค. 2025', 'ม.ค. 2026'])
    expect(buildMonthLabels(null)).toEqual([])
  })
})
