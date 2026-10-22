// sales.config.spec.js — sanity ของ config แท็บขายและเงิน: โหมดแท็บ, block ต่อแท็บ, reportRef → แท็บ/ตัวสลับ (รวมการ์ด KPI), i18n th+en, ข้อความ rule ทุก code, config ไม่ reactive
import { describe, it, expect } from 'vitest'
import { createI18n } from 'vue-i18n'
import { reactive, isReactive } from 'vue'

import productionInsightTh from '@/language/view/production-insight/th.js'
import productionInsightEn from '@/language/view/production-insight/en.js'
import executiveTh from '@/language/view/executive/th.js'
import executiveEn from '@/language/view/executive/en.js'
import { BLOCK_TYPES } from '@/components/insight/page/blocks/block-types.js'
import { COLUMN_KINDS } from '@/components/insight/page/columns.js'
import { buildKpiCards } from '@/components/insight/page/blocks/kpi-block-helpers.js'
import { buildDonutChart } from '@/components/insight/page/blocks/donut-block-helpers.js'
import { buildPlanTableRequest } from '@/components/insight/page/blocks/plan-table-block-helpers.js'
import { collectBlockIds, findDuplicates, flattenBlocks, buildInitialState, isNodeVisible } from '@/components/insight/page/insight-page-helpers.js'
import { validateTabConfig, findTabForReportRef, blocksForTab, hasTabs, isSourceTabGated } from '@/components/insight/page/insight-tabs-helpers.js'
import { salesConfig } from './sales.config.js'

const makeI18n = (locale, lang, exec) => createI18n({ legacy: false, locale, messages: { [locale]: { view: { productionInsight: lang, executive: exec } } } })
const th = makeI18n('th', productionInsightTh, executiveTh)
const en = makeI18n('en', productionInsightEn, executiveEn)
const t = th.global.t

function collectI18nKeys(value, out = new Set()) {
  if (typeof value === 'string') {
    if (value.startsWith('view.productionInsight.salesInsight') || value.startsWith('view.executive.money')) out.add(value)
  } else if (Array.isArray(value)) {
    value.forEach((item) => collectI18nKeys(item, out))
  } else if (value && typeof value === 'object') {
    Object.values(value).forEach((item) => collectI18nKeys(item, out))
  }
  return out
}

const overview = {
  asOf: '2026-10-21T09:00:00',
  thresholds: { overdueWarnPercent: 20 },
  kpi: { totalGrandThb: 10000000, outstandingCount: 80, outstandingThb: 4000000, overdueCount: 30, overdueThb: 1500000, overduePercent: 37.5, paidPercent: 60, noDueDateAllCount: 40, soNotInvoicedCount: 5, soNotInvoicedThb: 700000 },
  paymentStates: [
    { key: 'received', count: 100, amountThb: 6000000 },
    { key: 'unpaidNotDue', count: 50, amountThb: 2500000 },
    { key: 'overdue', count: 30, amountThb: 1500000 }
  ]
}
const ctx = { data: { Overview: overview }, filter: { metal: 'ALL' }, t, loading: {}, state: { dueFilter: 'overdue' } }

describe('sales config structure', () => {
  const nodes = flattenBlocks(salesConfig.blocks)

  it('block ids are unique and block types are known', () => {
    expect(findDuplicates(collectBlockIds(salesConfig.blocks))).toEqual([])
    nodes.forEach((n) => expect(BLOCK_TYPES.concat(['slot']), n.id).toContain(n.type))
  })

  it('table columns use registered kinds', () => {
    nodes.filter((n) => n.type === 'table').forEach((n) => n.sections.forEach((s) => (s.columns || []).forEach((c) => expect(COLUMN_KINDS).toContain(c.kind))))
    nodes.filter((n) => n.type === 'planTable').forEach((n) => n.columns.forEach((c) => expect(COLUMN_KINDS).toContain(c.kind)))
  })

  it('every static i18n key exists in th and en', () => {
    const keys = collectI18nKeys(salesConfig)
    expect(keys.size).toBeGreaterThan(20)
    keys.forEach((key) => {
      expect(th.global.te(key, 'th'), `th ${key}`).toBe(true)
      expect(en.global.te(key, 'en'), `en ${key}`).toBe(true)
    })
  })

  it('Overview is the only eager source and is requested with months only', () => {
    expect(Object.keys(salesConfig.sources)).toEqual(['Overview'])
    expect(salesConfig.sources.Overview.endpoint).toBe('SalesInsight/Overview')
    expect(salesConfig.sources.Overview.params({ metal: 'GOLD' })).toEqual({ months: 12 })
    expect(isSourceTabGated(salesConfig.sources.Overview, [])).toBe(false)
    expect(salesConfig.findings.source).toBe('Overview')
    expect(salesConfig.i18nPrefix).toBe('view.productionInsight.salesInsight.rules')
  })

  it('config stays out of Vue reactivity', () => {
    expect(isReactive(reactive({ config: salesConfig }).config)).toBe(false)
  })
})

describe('sales tabs', () => {
  const tabOf = (ref, params) => {
    const custom = salesConfig.tabFor(ref, params || {}, ctx)
    return custom || findTabForReportRef(salesConfig, ref)
  }

  it('opts in with the 5 data tabs and validates', () => {
    expect(hasTabs(salesConfig)).toBe(true)
    expect(salesConfig.tabs.map((x) => x.key)).toEqual(['overview', 'aging', 'due', 'trend', 'so'])
    expect(validateTabConfig(salesConfig)).toEqual([])
  })

  it('blocks per tab', () => {
    const ids = (key) => blocksForTab(salesConfig, key).map((n) => n.id)
    expect(ids('overview')).toEqual(['salKpi', 'salPayment'])
    expect(ids('aging')).toEqual(['salAging', 'salTopCustomers'])
    expect(ids('due')).toEqual(['salDueSwitch', 'salDueOverdue', 'salDueUnpaid', 'salDueNoDue'])
    expect(ids('trend')).toEqual(['salTrend'])
    expect(ids('so')).toEqual(['salSo'])
  })

  it('backend refs route to the right tab; salDue also picks the toggle by finding code', () => {
    expect(tabOf('salAging').tab).toBe('aging')
    expect(tabOf('salSo').tab).toBe('so')
    const due = (code) => tabOf('salDue', { findingCode: code })
    expect(due('SAL_OLDEST_OVERDUE')).toMatchObject({ tab: 'due', reveal: { stateKey: 'dueFilter', value: 'overdue' }, anchor: 'salDueOverdue' })
    expect(due('FC_SAL_BECOMING_OVERDUE').reveal.value).toBe('overdue')
    expect(due('SAL_NO_DUE_DATE')).toMatchObject({ reveal: { value: 'noDue' }, anchor: 'salDueNoDue' })
    expect(due('FC_SAL_COLLECTION').reveal.value).toBe('unpaid')
  })

  it('KPI cards link to the matching tab (and toggle)', () => {
    const kpi = salesConfig.blocks.find((n) => n.id === 'salKpi')
    const targets = kpi.cards.map((c) => {
      const target = tabOf(c.reportRef, c.reportParams)
      return [c.id, target.tab, target.reveal?.value ?? null]
    })
    expect(targets).toEqual([['outstanding', 'due', 'unpaid'], ['overdue', 'due', 'overdue'], ['paid', 'overview', null], ['so', 'so', null]])
  })

  it('only the selected due table is visible; each posts the right Receivables filter with paging', () => {
    const tables = ['salDueOverdue', 'salDueUnpaid', 'salDueNoDue'].map((id) => salesConfig.blocks.find((n) => n.id === id))
    expect(tables.map((n) => isNodeVisible(n, { state: { dueFilter: 'unpaid' } }))).toEqual([false, true, false])
    expect(buildInitialState(salesConfig.state).dueFilter).toBe('overdue')
    expect(tables.map((n) => buildPlanTableRequest(n, ctx, { take: 20, skip: 0, sort: [] }))).toEqual([
      { take: 20, skip: 0, sort: [], filter: 'overdue' },
      { take: 20, skip: 0, sort: [], filter: 'unpaid' },
      { take: 20, skip: 0, sort: [], filter: 'noDueDate' }
    ])
    const so = salesConfig.blocks.find((n) => n.id === 'salSo')
    expect(so.endpoint).toBe('ExecutiveReport/SalesOrdersWithoutInvoice')
    expect(buildPlanTableRequest(so, ctx, { take: 20, skip: 0, sort: [] })).toEqual({ take: 20, skip: 0, sort: [] })
  })

  it('the toggle slot lists the three filters worst-first with counts from the KPI and writes dueFilter', () => {
    const slot = salesConfig.blocks.find((n) => n.id === 'salDueSwitch')
    const props = slot.props(ctx)
    expect(props.options.map((o) => o.value)).toEqual(['overdue', 'unpaid', 'noDue'])
    expect(props.options[2].label).toContain('40')
    expect(props.modelValue).toBe('overdue')
    const spy = { state: {}, setState(key, value) { this.state[key] = value } }
    slot.events['update:modelValue'](spy, 'noDue')
    expect(spy.state.dueFilter).toBe('noDue')
  })

  it('invoice and SO number cells are buttons that navigate to the existing detail pages', () => {
    const calls = []
    const navigate = (location) => calls.push(location)
    const invoiceCol = salesConfig.blocks.find((n) => n.id === 'salDueOverdue').columns[0]
    const soCol = salesConfig.blocks.find((n) => n.id === 'salSo').columns[0]
    invoiceCol.onClick({ running: 'R1', dkInvoiceNumber: null }, { navigate })
    soCol.onClick({ soNumber: 'SO1' }, { navigate })
    expect(calls).toEqual([{ name: 'invoice-detail', query: { invoiceNumber: 'R1' } }, { name: 'sale-order', query: { soNumber: 'SO1' } }])
  })
})

describe('sales KPI cards, donut and rule texts', () => {
  const kpi = salesConfig.blocks.find((n) => n.id === 'salKpi')

  it('4 cards with money / percent values and a threshold tone on overdue', () => {
    const cards = buildKpiCards(kpi, ctx, t)
    expect(cards.map((c) => c.value)).toEqual(['฿4,000,000', '฿1,500,000', '60%', '฿700,000'])
    expect(cards[1].tone).toBe('warning')
    expect(buildKpiCards(kpi, { ...ctx, data: {} }, t)[0].value).toBe('—')
  })

  it('payment donut: three slices, abbreviated money legend, bill count + total in the centre, slice click jumps to the due tab', () => {
    const donut = salesConfig.blocks.find((n) => n.id === 'salPayment')
    const jumps = []
    const chart = buildDonutChart(donut, donut.slices(ctx, t), t, { ...ctx, goToReport: (...args) => jumps.push(args) })
    expect(chart.series).toEqual([6000000, 2500000, 1500000])
    expect(chart.options.legend.formatter('x', { seriesIndex: 0 })).toBe('x: ฿6.00M (60.0%)')
    const labels = chart.options.plotOptions.pie.donut.labels
    expect(labels.total.label).toContain('180')
    expect(labels.total.formatter()).toBe('฿10.00M')
    chart.options.chart.events.dataPointSelection(null, null, { dataPointIndex: 2 })
    chart.options.chart.events.dataPointSelection(null, null, { dataPointIndex: 0 })
    expect(jumps).toEqual([['salDue', { dueFilter: 'overdue' }]])
  })

  const codes = {
    SAL_OVERDUE_RECEIVABLE: { overdueThb: 1500000, overdueCount: 30, outstandingThb: 4000000, percent: 37.5 },
    SAL_OLDEST_OVERDUE: { days: 120, customerName: 'ก' },
    SAL_NO_DUE_DATE: { count: 40, percent: 50 },
    SAL_SO_NOT_INVOICED: { count: 5, amountThb: 700000, overdueDeliveryCount: 2, noDeliveryDateCount: 1 },
    SAL_CUSTOMER_CONCENTRATION: { customerName: 'ก', percent: 55 },
    FC_SAL_COLLECTION: { amountThb: 100, count: 2, windowDays: 30 },
    FC_SAL_COLLECTION_NONE: { amountThb: 0, count: 0, windowDays: 30 },
    FC_SAL_BECOMING_OVERDUE: { amountThb: 100, count: 2, days: 14 },
    FC_SAL_SO_DELIVERY: { count: 2, amountThb: 100, days: 14 },
    ACT_FOLLOW_OVERDUE: { overdueThb: 1500000, overdueCount: 30, topCustomerName: 'ก' },
    ACT_SET_DUE_DATE: { count: 40 },
    ACT_INVOICE_FROM_SO: { count: 5 },
    ACT_SPREAD_RISK: { customerName: 'ก', percent: 55 }
  }

  it('every rule code has a th and en text that interpolates fully', () => {
    Object.entries(codes).forEach(([code, params]) => {
      const key = `view.productionInsight.salesInsight.rules.${code}`
      ;[th, en].forEach((i18n) => {
        const text = i18n.global.t(key, params)
        expect(text, code).not.toBe(key)
        expect(text, code).not.toContain('{')
      })
    })
  })

  it('related-action labels and the sale manager role exist in th and en', () => {
    ;['SAL_OVERDUE_RECEIVABLE', 'SAL_OLDEST_OVERDUE', 'SAL_NO_DUE_DATE', 'SAL_SO_NOT_INVOICED', 'SAL_CUSTOMER_CONCENTRATION', 'FC_SAL_BECOMING_OVERDUE', 'FC_SAL_SO_DELIVERY'].forEach((code) => {
      expect(productionInsightTh.codeLabel[code], code).toBeTruthy()
      expect(productionInsightEn.codeLabel[code], code).toBeTruthy()
    })
    expect(productionInsightTh.ownerRole.saleManager).toBe('ผู้จัดการฝ่ายขาย')
    expect(productionInsightEn.ownerRole.saleManager).toBe('Sales manager')
  })
})
