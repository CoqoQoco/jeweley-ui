// quality.config.spec.js — config แท็บคุณภาพข้อมูล: โครงแท็บ/บล็อก, source optional, KPI, [ดู ›] ส่งขึ้น parent, i18n th+en ครบและ key parity
import { describe, it, expect, vi } from 'vitest'
import { createI18n } from 'vue-i18n'
import { reactive, isReactive } from 'vue'

import productionInsightTh from '@/language/view/production-insight/th.js'
import productionInsightEn from '@/language/view/production-insight/en.js'
import executiveTh from '@/language/view/executive/th.js'
import executiveEn from '@/language/view/executive/en.js'
import { BLOCK_TYPES } from '@/components/insight/page/blocks/block-types.js'
import { COLUMN_KINDS } from '@/components/insight/page/columns.js'
import { buildKpiCards } from '@/components/insight/page/blocks/kpi-block-helpers.js'
import { collectBlockIds, findDuplicates, flattenBlocks } from '@/components/insight/page/insight-page-helpers.js'
import { validateTabConfig, blocksForTab } from '@/components/insight/page/insight-tabs-helpers.js'
import { qualityConfig } from './quality.config.js'
import { CHECK_FINDING_CODE } from './quality-helpers.js'

const makeI18n = (locale, lang, exec) => createI18n({ legacy: false, locale, messages: { [locale]: { view: { productionInsight: lang, executive: exec } } } })
const th = makeI18n('th', productionInsightTh, executiveTh)
const en = makeI18n('en', productionInsightEn, executiveEn)

function collectI18nKeys(value, out = new Set()) {
  if (typeof value === 'string') {
    if (value.startsWith('view.productionInsight.qualityInsight')) out.add(value)
  } else if (Array.isArray(value)) {
    value.forEach((item) => collectI18nKeys(item, out))
  } else if (value && typeof value === 'object') {
    Object.values(value).forEach((item) => collectI18nKeys(item, out))
  }
  return out
}

function flatten(obj, prefix = '') {
  return Object.entries(obj).flatMap(([key, value]) => (value && typeof value === 'object' ? flatten(value, `${prefix}${key}.`) : [`${prefix}${key}`]))
}

const overview = {
  asOf: '2026-10-22T09:00:00',
  kpi: { affectedTabs: ['stock', 'sales'] },
  checks: [
    { code: 'NO_COST', count: 10, total: 20, ratio: 50, severity: 'critical', impact: 'stockValuation', tab: 'stock', reportRef: 'stkCost', available: true },
    { code: 'INVOICE_NO_DUE', count: 1, total: 20, ratio: 5, severity: 'warning', impact: 'receivableAging', tab: 'sales', reportRef: 'salDue', available: true },
    { code: 'SO_NO_INVOICE', count: 0, total: 3, ratio: 0, severity: 'ok', impact: 'revenueRecognition', tab: 'sales', reportRef: 'salSo', available: true },
    { code: 'PLACEHOLDER_WORKER_WIP', count: 0, total: 0, ratio: 0, severity: 'ok', impact: 'workerAccountability', tab: 'production', reportRef: 'wrkTable', available: false }
  ]
}
const ctx = (extra = {}) => ({ data: { Overview: overview }, filter: {}, t: th.global.t, loading: {}, state: {}, ...extra })

describe('quality config structure', () => {
  const nodes = flattenBlocks(qualityConfig.blocks)

  it('opts into tabs with one data tab and validates; ids unique; block and column kinds known', () => {
    expect(qualityConfig.tabs.map((x) => x.key)).toEqual(['overview'])
    expect(validateTabConfig(qualityConfig)).toEqual([])
    expect(findDuplicates(collectBlockIds(qualityConfig.blocks))).toEqual([])
    nodes.forEach((n) => expect(BLOCK_TYPES, n.id).toContain(n.type))
    nodes.filter((n) => n.type === 'table').forEach((n) => n.sections.forEach((s) => s.columns.forEach((c) => expect(COLUMN_KINDS).toContain(c.kind))))
    expect(blocksForTab(qualityConfig, 'overview').map((n) => n.id)).toEqual(['dqKpi', 'dqChecks'])
  })

  it('source is the DataQuality endpoint, optional, metal-scoped (default) and sends an empty body', () => {
    expect(qualityConfig.sources.Overview).toMatchObject({ endpoint: 'ExecutiveReport/DataQuality', optional: true })
    expect(qualityConfig.sources.Overview.scoped).toBeUndefined()
    expect(qualityConfig.sources.Overview.params()).toEqual({})
    expect(qualityConfig.i18nPrefix).toBe('view.productionInsight.qualityInsight.rules')
  })

  it('stays out of Vue reactivity', () => {
    expect(isReactive(reactive({ config: qualityConfig }).config)).toBe(false)
  })

  it('KPI cards: problems = warning+critical, critical, passed, affected screens (visible checks only)', () => {
    const kpi = qualityConfig.blocks.find((n) => n.id === 'dqKpi')
    const cards = buildKpiCards(kpi, ctx(), th.global.t)
    expect(cards.map((c) => [c.key, c.value])).toEqual([['problems', '2'], ['critical', '1'], ['passed', '1'], ['affected', '2']])
    expect(cards.map((c) => c.tone)).toEqual(['warning', 'warning', 'green', 'warning'])
    expect(cards[2].sub).toContain('3')
  })

  it('KPI cards show a dash before data arrives', () => {
    const kpi = qualityConfig.blocks.find((n) => n.id === 'dqKpi')
    const cards = buildKpiCards(kpi, ctx({ data: {} }), th.global.t)
    expect(cards.map((c) => c.value)).toEqual(['—', '—', '—', '—'])
  })

  it('checks table lists only available checks and the view column hands the navigation to the parent', () => {
    const table = qualityConfig.blocks.find((n) => n.id === 'dqChecks')
    const rows = table.sections[0].rows(ctx())
    expect(rows.map((r) => r.code)).toEqual(['NO_COST', 'INVOICE_NO_DUE', 'SO_NO_INVOICE'])
    const viewCol = table.sections[0].columns.at(-1)
    const onNavigate = vi.fn()
    viewCol.onClick(rows[1], ctx({ filter: { onNavigate } }))
    expect(onNavigate).toHaveBeenCalledWith({ domain: 'sales', target: { tab: 'sales', reportRef: 'salDue', code: 'DQ_INVOICE_NO_DUE', params: { dueFilter: 'noDue' } } })
    expect(() => viewCol.onClick(rows[0], ctx())).not.toThrow()
  })

  it('finding [ดู ›] (tabFor) navigates through the parent and never switches tab inside the page', () => {
    const onNavigate = vi.fn()
    expect(qualityConfig.tabFor('stkCost', { findingCode: 'DQ_NO_COST' }, ctx({ filter: { onNavigate } }))).toBeNull()
    expect(onNavigate).toHaveBeenCalledWith({ domain: 'stock', target: { tab: 'stock', reportRef: 'stkCost', code: 'DQ_NO_COST', params: {} } })
  })
})

describe('quality i18n', () => {
  it('every static key used by the config exists in th and en', () => {
    const keys = collectI18nKeys(qualityConfig)
    expect(keys.size).toBeGreaterThan(10)
    keys.forEach((key) => {
      expect(th.global.te(key, 'th'), `th ${key}`).toBe(true)
      expect(en.global.te(key, 'en'), `en ${key}`).toBe(true)
    })
  })

  it('th and en have the same key set (qualityInsight, executive tab + excel keys)', () => {
    expect(flatten(productionInsightEn.qualityInsight).sort()).toEqual(flatten(productionInsightTh.qualityInsight).sort())
    expect(executiveEn.tabs.quality).toBeTruthy()
    expect(executiveTh.tabs.quality).toBeTruthy()
    const pick = (lang) => Object.keys(lang.excel.snapshot).filter((k) => k.startsWith('quality')).sort()
    expect(pick(executiveEn)).toEqual(pick(executiveTh))
  })

  it('has a rule text for every finding and action code, and a check label per check', () => {
    ;['DQ_NO_COST', 'DQ_NEGATIVE_GOLD', 'DQ_INVOICE_NO_DUE', 'DQ_SO_NO_DELIVERY', 'DQ_SO_NO_INVOICE', 'DQ_PLACEHOLDER_WIP', 'ACT_DQ_PRICE_NO_COST', 'ACT_DQ_RECORD_OPENING_BALANCE', 'ACT_DQ_SET_INVOICE_DUE', 'ACT_DQ_SET_SO_DELIVERY_DATE', 'ACT_DQ_INVOICE_FROM_SO', 'ACT_DQ_ASSIGN_REAL_WORKER'].forEach((code) => {
      expect(productionInsightTh.qualityInsight.rules[code], code).toBeTruthy()
      expect(productionInsightEn.qualityInsight.rules[code], code).toBeTruthy()
    })
    Object.keys(CHECK_FINDING_CODE).forEach((code) => expect(productionInsightTh.qualityInsight.checks[code], code).toBeTruthy())
  })

  it('renders the Thai text with the formatted numbers', () => {
    const p = qualityConfig.filterFindings([{ code: 'DQ_NO_COST', params: { count: 23915, total: 29286, ratio: 81.66 } }])[0].params
    expect(th.global.t('view.productionInsight.qualityInsight.rules.DQ_NO_COST', p)).toBe('ล็อตสินค้าในคลัง 23,915 จาก 29,286 ล็อต (81.7%) ยังไม่มีต้นทุน ทำให้มูลค่าสต็อกและกำไรคำนวณไม่ได้ครบ')
  })
})
