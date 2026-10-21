// stock.config.spec.js — sanity ของ config แท็บคลังสินค้า: โหมดแท็บถูกต้อง, block ต่อแท็บ, reportRef → แท็บ (รวมการ์ด KPI), i18n key ครบทั้ง th/en,
// ข้อความ rule ทุก code ของ rule engine มีทั้ง th/en และ forecast ระบุจำนวนเดือนของข้อมูลขาย, config ไม่ถูกห่อ reactive
import { describe, it, expect } from 'vitest'
import { createI18n } from 'vue-i18n'
import { reactive, isReactive } from 'vue'

import productionInsightTh from '@/language/view/production-insight/th.js'
import productionInsightEn from '@/language/view/production-insight/en.js'
import executiveTh from '@/language/view/executive/th.js'
import { BLOCK_TYPES } from '@/components/insight/page/blocks/block-types.js'
import { COLUMN_KINDS } from '@/components/insight/page/columns.js'
import { buildKpiCards } from '@/components/insight/page/blocks/kpi-block-helpers.js'
import { collectBlockIds, findDuplicates, flattenBlocks, computeSourceKeys } from '@/components/insight/page/insight-page-helpers.js'
import { validateTabConfig, findTabForReportRef, blocksForTab, hasTabs, isSourceTabGated } from '@/components/insight/page/insight-tabs-helpers.js'
import { stockConfig } from './stock.config.js'

const REPORT_REFS = ['stkCost', 'stkAge', 'stkTrend']

const makeI18n = (locale, lang) => createI18n({ legacy: false, locale, messages: { [locale]: { view: { productionInsight: lang, executive: executiveTh } } } })
const th = makeI18n('th', productionInsightTh)
const en = makeI18n('en', productionInsightEn)
const t = th.global.t

function collectI18nKeys(value, out = new Set()) {
  if (typeof value === 'string') {
    if (value.startsWith('view.productionInsight.stockInsight')) out.add(value)
  } else if (Array.isArray(value)) {
    value.forEach((item) => collectI18nKeys(item, out))
  } else if (value && typeof value === 'object' && !(typeof value === 'function')) {
    Object.values(value).forEach((item) => collectI18nKeys(item, out))
  }
  return out
}

const overview = {
  asOf: '2026-10-21T09:00:00',
  status: 'warning',
  thresholds: { noCostWarnPercent: 20, noCostCriticalPercent: 40, aged5yWarnPercent: 30 },
  kpi: { inStockCount: 1000, inStockQty: 1200, noCostCount: 300, noCostPercent: 30, costThb: 5000000, agedOver1yCount: 600, agedOver1yPercent: 60, agedOver5yCount: 100, agedOver5yPercent: 10 }
}
const ctx = { data: { Overview: overview }, filter: { metal: 'ALL' }, t, loading: {}, state: {} }

describe('stock config structure', () => {
  const nodes = flattenBlocks(stockConfig.blocks)

  it('block ids are unique and use known block types', () => {
    expect(findDuplicates(collectBlockIds(stockConfig.blocks))).toEqual([])
    nodes.forEach((n) => expect(BLOCK_TYPES.concat(['slot']), n.id).toContain(n.type))
    expect(nodes.some((n) => n.type === 'donut')).toBe(true)
    expect(nodes.some((n) => n.type === 'bar')).toBe(true)
  })

  it('table columns use registered kinds', () => {
    nodes
      .filter((n) => n.type === 'table')
      .forEach((n) => n.sections.forEach((s) => (s.columns || []).forEach((c) => expect(COLUMN_KINDS, `${n.id}.${c.field}`).toContain(c.kind))))
  })

  it('every static i18n key exists in th and en', () => {
    const keys = collectI18nKeys(stockConfig)
    expect(keys.size).toBeGreaterThan(20)
    keys.forEach((key) => {
      expect(th.global.te(key, 'th'), `th ${key}`).toBe(true)
      expect(en.global.te(key, 'en'), `en ${key}`).toBe(true)
    })
  })

  it('the single source is eager and is requested with months only', () => {
    expect(Object.keys(stockConfig.sources)).toEqual(['Overview'])
    expect(stockConfig.sources.Overview.endpoint).toBe('StockInsight/Overview')
    expect(stockConfig.sources.Overview.params({ metal: 'GOLD' })).toEqual({ months: 12 })
    expect(computeSourceKeys(stockConfig.sources, { metal: 'GOLD' }, {}, [])).toEqual(computeSourceKeys(stockConfig.sources, { metal: 'SILVER' }, {}, []))
    expect(isSourceTabGated(stockConfig.sources.Overview, [])).toBe(false)
    expect(stockConfig.findings.source).toBe('Overview')
  })
})

describe('stock tabs', () => {
  it('opts in with the 6 data tabs and validates', () => {
    expect(hasTabs(stockConfig)).toBe(true)
    expect(stockConfig.tabs.map((x) => x.key)).toEqual(['overview', 'trend', 'age', 'cost', 'receipt', 'category'])
    expect(validateTabConfig(stockConfig)).toEqual([])
  })

  it('blocks per tab', () => {
    const ids = (key) => blocksForTab(stockConfig, key).map((n) => n.id)
    expect(ids('overview')).toEqual(['stkKpi', 'stkCostShare'])
    expect(ids('trend')).toEqual(['stkTrend'])
    expect(ids('age')).toEqual(['stkAge', 'stkAgeTable'])
    expect(ids('cost')).toEqual(['stkCost', 'stkCostReceipt', 'stkCostLinks'])
    expect(ids('receipt')).toEqual(['stkReceiptShare', 'stkReceipt'])
    expect(ids('category')).toEqual(['stkCategory', 'stkCategoryTable'])
  })

  it('reportRef -> tab for every backend ref and every KPI card link', () => {
    const tabOf = (ref) => findTabForReportRef(stockConfig, ref)?.tab
    expect(tabOf('stkCost')).toBe('cost')
    expect(tabOf('stkAge')).toBe('age')
    expect(tabOf('stkTrend')).toBe('trend')
    REPORT_REFS.forEach((ref) => expect(tabOf(ref), ref).toBeTruthy())
    const kpi = stockConfig.blocks.find((n) => n.id === 'stkKpi')
    expect(kpi.cards.map((c) => [c.id, tabOf(c.reportRef)])).toEqual([['inStock', 'category'], ['noCost', 'cost'], ['cost', 'cost'], ['aged', 'age']])
  })

  it('config stays out of Vue reactivity and routes i18n through the stock rules namespace', () => {
    expect(isReactive(reactive({ config: stockConfig }).config)).toBe(false)
    expect(stockConfig.i18nPrefix).toBe('view.productionInsight.stockInsight.rules')
  })
})

describe('stock KPI cards and donut', () => {
  const kpi = stockConfig.blocks.find((n) => n.id === 'stkKpi')

  it('4 cards with values, subs and severity tones from the API thresholds', () => {
    const cards = buildKpiCards(kpi, ctx, t)
    expect(cards.map((c) => c.value)).toEqual(['1,000', '30%', '฿5,000,000', '60%'])
    expect(cards[1].tone).toBe('warning')
    expect(cards[3].tone).toBe('green')
    expect(cards[0].sub).toContain('1,200')
  })

  it('donut slices split with / without cost and sum to the in-stock count', () => {
    const donut = stockConfig.blocks.find((n) => n.id === 'stkCostShare')
    const slices = donut.slices(ctx, t)
    expect(slices.map((s) => s.value)).toEqual([700, 300])
  })

  it('empty data yields dashes / zero slices, never throws', () => {
    const empty = { data: {}, filter: {}, t, loading: {}, state: {} }
    expect(() => buildKpiCards(kpi, empty, t)).not.toThrow()
    expect(buildKpiCards(kpi, empty, t)[0].value).toBe('—')
    expect(stockConfig.blocks.find((n) => n.id === 'stkCostShare').slices(empty, t).map((s) => s.value)).toEqual([0, 0])
  })
})

describe('stock rule texts (th + en)', () => {
  const codes = {
    STK_NO_COST_HIGH: { noCostCount: 1, inStockCount: 2, percent: 50 },
    STK_AGED_OVER_5Y: { count: 5, percent: 10 },
    STK_NO_PRODUCTION_DATE: { count: 7 },
    STK_NO_OUTFLOW: { months: 3, historyMonths: 4 },
    FC_STK_COVER_LOW: { coverMonths: 1.5, avgMonthlyOutflow: 10, endStockQty: 15, historyMonths: 4, windowMonths: 3 },
    FC_STK_COVER_HIGH: { coverMonths: 40, avgMonthlyOutflow: 1, endStockQty: 40, historyMonths: 4, windowMonths: 3 },
    FC_STK_COVER_NONE: { avgMonthlyOutflow: 0, endStockQty: 40, historyMonths: 4, windowMonths: 3 },
    FC_STK_AGING_PROJECTED: { fromPercent: 20, toPercent: 35, months: 6, historyMonths: 4, windowMonths: 3 },
    ACT_PRICE_NO_COST: { noCostCount: 1, percent: 50 },
    ACT_CLEAR_AGED: { count: 5, percent: 10, projectedPercent: 20 },
    ACT_REPLENISH: { avgMonthlyOutflow: 10 },
    ACT_SLOW_INTAKE: { avgMonthlyOutflow: 1 },
    ACT_FIX_PRODUCTION_DATE: { count: 7 }
  }

  it('every code has a th and en text and interpolates its params', () => {
    Object.entries(codes).forEach(([code, params]) => {
      const key = `view.productionInsight.stockInsight.rules.${code}`
      const thText = th.global.t(key, params)
      const enText = en.global.t(key, params)
      expect(thText, code).not.toBe(key)
      expect(enText, code).not.toBe(key)
      expect(thText, code).not.toContain('{')
      expect(enText, code).not.toContain('{')
    })
  })

  it('forecast texts show the sales-history caveat with the number of months', () => {
    ;['FC_STK_COVER_LOW', 'FC_STK_COVER_HIGH', 'FC_STK_COVER_NONE', 'FC_STK_AGING_PROJECTED'].forEach((code) => {
      const text = th.global.t(`view.productionInsight.stockInsight.rules.${code}`, codes[code])
      expect(text, code).toContain('ข้อมูลขาย 4 เดือน')
    })
  })

  it('related-action labels exist for every finding code the actions reference', () => {
    ;['STK_NO_COST_HIGH', 'STK_AGED_OVER_5Y', 'STK_NO_PRODUCTION_DATE', 'STK_NO_OUTFLOW', 'FC_STK_COVER_MONTHS', 'FC_STK_AGING_PROJECTED'].forEach((code) => {
      expect(productionInsightTh.codeLabel[code], code).toBeTruthy()
      expect(productionInsightEn.codeLabel[code], code).toBeTruthy()
    })
  })
})
