import { describe, it, expect } from 'vitest'

import {
  SALES_INSIGHT_ENDPOINT,
  buildOverviewParams,
  remapSalesFindings,
  toneByThreshold,
  resolveDueFilter,
  resolveSalesReportTarget,
  buildPaymentSlices,
  sumPaymentCount,
  resolvePaymentSliceFilter,
  buildAgingRows,
  buildTopCustomerRows,
  mapInvoiceRows,
  mapSoRows,
  dueFilterCounts,
  buildTrendHint,
  buildMonthLabels,
  DUE_FILTERS,
  DUE_FILTER_API_VALUE
} from './sales-helpers.js'
import { resolveKpiSalesTarget, resolveKpiTab } from '../executive-helpers.js'

const t = (key, params) => (params ? `${key}:${JSON.stringify(params)}` : key)

describe('sales helpers', () => {
  it('request params contain only months (metal is added by the store, thresholds not sent)', () => {
    expect(SALES_INSIGHT_ENDPOINT).toBe('SalesInsight/Overview')
    expect(buildOverviewParams()).toEqual({ months: 12 })
  })

  it('collection forecast keeps its code when info and gets its own text when it is a warning (nothing due)', () => {
    const out = remapSalesFindings([
      { code: 'FC_SAL_COLLECTION', severity: 'info', params: { count: 3 } },
      { code: 'FC_SAL_COLLECTION', severity: 'warning', params: { count: 0 } },
      { code: 'FC_SAL_BECOMING_OVERDUE', severity: 'warning', params: {} }
    ])
    expect(out.map((i) => i.code)).toEqual(['FC_SAL_COLLECTION', 'FC_SAL_COLLECTION_NONE', 'FC_SAL_BECOMING_OVERDUE'])
    expect(remapSalesFindings(null)).toEqual([])
  })

  it('toneByThreshold', () => {
    expect(toneByThreshold(30, 20)).toBe('warning')
    expect(toneByThreshold(5, 20)).toBe('green')
    expect(toneByThreshold(null, 20)).toBe('main')
    expect(toneByThreshold(5, undefined)).toBe('main')
  })

  it('due filter order is worst-first and maps to the Receivables filter values', () => {
    expect(DUE_FILTERS).toEqual(['overdue', 'unpaid', 'noDue'])
    expect(DUE_FILTER_API_VALUE).toEqual({ overdue: 'overdue', unpaid: 'unpaid', noDue: 'noDueDate' })
  })

  it('resolveDueFilter: explicit card param wins, then the finding code, then the default (overdue)', () => {
    expect(resolveDueFilter({ dueFilter: 'unpaid', findingCode: 'SAL_NO_DUE_DATE' })).toBe('unpaid')
    expect(resolveDueFilter({ findingCode: 'SAL_OLDEST_OVERDUE' })).toBe('overdue')
    expect(resolveDueFilter({ findingCode: 'FC_SAL_BECOMING_OVERDUE' })).toBe('overdue')
    expect(resolveDueFilter({ findingCode: 'SAL_NO_DUE_DATE' })).toBe('noDue')
    expect(resolveDueFilter({ findingCode: 'FC_SAL_COLLECTION' })).toBe('unpaid')
    expect(resolveDueFilter({ findingCode: 'FC_SAL_COLLECTION_NONE' })).toBe('unpaid')
    expect(resolveDueFilter({ dueFilter: 'bogus' })).toBe('overdue')
    expect(resolveDueFilter(undefined)).toBe('overdue')
  })

  it('salDue routes to the due tab with a reveal + anchor of the right table; other refs are left to the block-id lookup', () => {
    expect(resolveSalesReportTarget('salDue', { findingCode: 'SAL_NO_DUE_DATE' })).toEqual({ tab: 'due', reveal: { stateKey: 'dueFilter', value: 'noDue' }, anchor: 'salDueNoDue' })
    expect(resolveSalesReportTarget('salDue', { dueFilter: 'unpaid' }).anchor).toBe('salDueUnpaid')
    expect(resolveSalesReportTarget('salAging', {})).toBeNull()
    expect(resolveSalesReportTarget('salSo', {})).toBeNull()
  })

  it('payment slices keep the old order / colours and count the bills', () => {
    const states = [
      { key: 'overdue', count: 2, amountThb: 300 },
      { key: 'received', count: 5, amountThb: 1000 },
      { key: 'unpaidNotDue', count: 3, amountThb: 200 }
    ]
    const slices = buildPaymentSlices(states)
    expect(slices.map((s) => s.value)).toEqual([1000, 200, 300])
    expect(slices.map((s) => s.color)).toEqual(['token:green', 'token:warning', 'token:red'])
    expect(sumPaymentCount(states)).toBe(10)
    expect(buildPaymentSlices(null).map((s) => s.value)).toEqual([0, 0, 0])
    expect([0, 1, 2, 3].map(resolvePaymentSliceFilter)).toEqual([null, 'unpaid', 'overdue', null])
  })

  it('aging rows follow the bucket order and carry the bill count in the label', () => {
    const rows = buildAgingRows([{ key: 'gt90', count: 1, amountThb: 50 }, { key: 'notDue', count: 4, amountThb: 400 }], t)
    expect(rows.map((r) => r.key)).toEqual(['notDue', 'gt90'])
    expect(rows[0].label).toContain('"count":4')
    expect(rows[0].amountThb).toBe(400)
    expect(buildAgingRows(null, t)).toEqual([])
  })

  it('top customers fall back to the code and keep amounts', () => {
    const rows = buildTopCustomerRows([{ customerCode: 'C1', customerName: '', count: 2, outstandingThb: 10, overdueThb: 5 }])
    expect(rows[0]).toMatchObject({ customerName: 'C1', count: 2, outstandingThb: 10, overdueThb: 5 })
    expect(buildTopCustomerRows(null)).toEqual([])
  })

  it('invoice rows: invoice number falls back to running, rowKey = running, outstanding keeps the bill currency, metal share hint only for a single metal', () => {
    const rows = mapInvoiceRows(
      [
        { running: 'R1', dkInvoiceNumber: null, outstanding: 1234.5, currencyUnit: 'USD', paymentState: 'unpaid', metalShare: 0.4 },
        { running: 'R2', dkInvoiceNumber: 'INV-2', outstanding: null, paymentState: null }
      ],
      'GOLD',
      t
    )
    expect(rows[0]).toMatchObject({ rowKey: 'R1', invoiceNo: 'R1', outstandingText: '1,234.50 USD' })
    expect(rows[0].metalHint).toContain('"percent":40')
    expect(rows[0].stateText).toBe('view.executive.money.paymentState.unpaid')
    expect(rows[1]).toMatchObject({ invoiceNo: 'INV-2', outstandingText: '—', stateText: '—', metalHint: '' })
    expect(mapInvoiceRows([{ running: 'R1', metalShare: 0.4 }], 'ALL', t)[0].metalHint).toBe('')
  })

  it('SO rows are keyed by SO number with a yes/no overdue text', () => {
    const rows = mapSoRows([{ soNumber: 'SO1', isOverdue: true }, { soNumber: 'SO2', isOverdue: false }], 'ALL', t)
    expect(rows.map((r) => r.rowKey)).toEqual(['SO1', 'SO2'])
    expect(rows.map((r) => r.overdueText)).toEqual(['view.executive.money.yes', 'view.executive.money.no'])
  })

  it('toggle counts use the same figures as the summary cards (no-due = every bill without a due date)', () => {
    expect(dueFilterCounts({ overdueCount: 3, outstandingCount: 9, noDueDateAllCount: 40, noDueDateCount: 2 })).toEqual({ overdue: 3, unpaid: 9, noDue: 40 })
    expect(dueFilterCounts(undefined)).toEqual({ overdue: 0, unpaid: 0, noDue: 0 })
  })

  it('trend hint states where invoice data starts; month labels carry the year', () => {
    const hint = buildTrendHint({ startMonth: '2026-06-01', fullMonths: 4 }, t)
    expect(hint).toContain('trendHint:')
    expect(hint).toContain('"start":"มิ.ย. 2026"')
    expect(buildTrendHint({ startMonth: null }, t)).toBe('view.productionInsight.salesInsight.trendHintNone')
    expect(buildMonthLabels([{ month: '2026-09-01' }])).toEqual(['ก.ย. 2026'])
  })
})

describe('summary card navigation targets', () => {
  it('maps the sales cards to a sub tab (+ due toggle) and others to nothing', () => {
    expect(resolveKpiSalesTarget('receivablesOutstanding')).toEqual({ sub: 'due', dueFilter: 'unpaid' })
    expect(resolveKpiSalesTarget('noDueDate')).toEqual({ sub: 'due', dueFilter: 'noDue' })
    expect(resolveKpiSalesTarget('soNoInvoice')).toEqual({ sub: 'so' })
    expect(resolveKpiSalesTarget('stockNoCost')).toBeNull()
    ;['receivablesOutstanding', 'noDueDate', 'soNoInvoice'].forEach((key) => expect(resolveKpiTab(key)).toBe('sales'))
  })

  it('returns a fresh object each time (so a repeated click is seen as a change)', () => {
    expect(resolveKpiSalesTarget('soNoInvoice')).not.toBe(resolveKpiSalesTarget('soNoInvoice'))
  })
})
