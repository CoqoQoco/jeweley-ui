// quality-helpers.spec.js — logic ล้วนของแท็บคุณภาพข้อมูล: แถวตัวตรวจ (ซ่อน available=false), KPI, ป้ายสถานะ, ตัวเลขในข้อความ, ปลายทาง [ดู ›]
import { describe, it, expect } from 'vitest'

import {
  DATA_QUALITY_ENDPOINT,
  CHECK_FINDING_CODE,
  buildOverviewParams,
  visibleChecks,
  resolveStatusVariant,
  buildKpi,
  buildCheckRows,
  formatQualityFindings,
  resolveQualityNavigation,
  resolveFindingNavigation
} from './quality-helpers.js'

const t = (key) => key

const overview = {
  asOf: '2026-10-22T09:00:00',
  kpi: { total: 5, warningCount: 2, criticalCount: 1, passedCount: 2, affectedTabs: ['stock', 'sales'] },
  checks: [
    { code: 'NO_COST', count: 23915, total: 29286, ratio: 81.66, severity: 'critical', impact: 'stockValuation', tab: 'stock', reportRef: 'stkCost', available: true },
    { code: 'INVOICE_NO_DUE', count: 5, total: 100, ratio: 5, severity: 'warning', impact: 'receivableAging', tab: 'sales', reportRef: 'salDue', available: true },
    { code: 'SO_NO_INVOICE', count: 0, total: 10, ratio: 0, severity: 'ok', impact: 'revenueRecognition', tab: 'sales', reportRef: 'salSo', available: true },
    { code: 'PLACEHOLDER_WORKER_WIP', count: 0, total: 0, ratio: 0, severity: 'ok', impact: 'workerAccountability', tab: 'production', reportRef: 'wrkTable', available: false }
  ]
}

describe('quality-helpers', () => {
  it('exposes the endpoint and sends no extra body keys (metal is added by the store)', () => {
    expect(DATA_QUALITY_ENDPOINT).toBe('ExecutiveReport/DataQuality')
    expect(buildOverviewParams()).toEqual({})
  })

  it('hides checks with available=false from rows and counts', () => {
    expect(visibleChecks(overview).map((c) => c.code)).toEqual(['NO_COST', 'INVOICE_NO_DUE', 'SO_NO_INVOICE'])
    expect(buildCheckRows(overview, t).map((r) => r.code)).toEqual(['NO_COST', 'INVOICE_NO_DUE', 'SO_NO_INVOICE'])
    expect(buildKpi(overview)).toMatchObject({ total: 3, problems: 2, critical: 1, passed: 1 })
    expect(visibleChecks({})).toEqual([])
  })

  it('maps rows with labels, impact, status text and the navigation target', () => {
    const [row] = buildCheckRows(overview, t)
    expect(row).toMatchObject({
      label: 'view.productionInsight.qualityInsight.checks.NO_COST',
      count: 23915,
      total: 29286,
      ratio: 81.66,
      statusText: 'view.productionInsight.status.critical',
      impactText: 'view.productionInsight.qualityInsight.impact.stockValuation',
      tabText: 'view.productionInsight.qualityInsight.tab.stock'
    })
    expect(row.navigation).toEqual({ domain: 'stock', target: { tab: 'stock', reportRef: 'stkCost', code: 'DQ_NO_COST', params: {} } })
  })

  it('unknown check codes and impacts fall back to the raw value instead of a missing key', () => {
    const [row] = buildCheckRows({ checks: [{ code: 'NEW_CHECK', count: 1, total: 2, ratio: 50, severity: 'warning', impact: 'somethingNew', tab: 'stock', available: true }] }, t)
    expect(row.label).toBe('NEW_CHECK')
    expect(row.impactText).toBe('somethingNew')
  })

  it('status variants map to the chip variants and default to pass', () => {
    expect([resolveStatusVariant('critical'), resolveStatusVariant('warning'), resolveStatusVariant('ok'), resolveStatusVariant('x')]).toEqual(['fail', 'warning', 'pass', 'pass'])
  })

  it('KPI affected tabs use the API list, falling back to tabs of non-ok visible checks', () => {
    expect(buildKpi(overview).affectedTabs).toEqual(['stock', 'sales'])
    expect(buildKpi({ checks: overview.checks }).affectedTabs).toEqual(['stock', 'sales'])
    expect(buildKpi({})).toEqual({ total: 0, problems: 0, critical: 0, passed: 0, affectedTabs: [] })
  })

  it('formats counts, totals, ratio and the negative gold weight with thousands separators', () => {
    const [item] = formatQualityFindings([{ code: 'DQ_NO_COST', params: { count: 23915, total: 29286, ratio: 81.66 } }])
    expect(item.params).toEqual({ count: '23,915', total: '29,286', ratio: '81.7' })
    const [gold] = formatQualityFindings([{ code: 'DQ_NEGATIVE_GOLD', params: { count: 3, negativeWeight: -1234.567, inboundRecorded: false } }])
    expect(gold.params).toMatchObject({ count: '3', negativeWeight: '1,234.57', inboundRecorded: false })
    expect(formatQualityFindings(undefined)).toEqual([])
    expect(formatQualityFindings([{ code: 'X' }])).toEqual([{ code: 'X' }])
  })

  it('navigation: finding codes map to their tab; the invoice finding opens the "no due date" toggle; production uses the workers topic', () => {
    expect(resolveFindingNavigation('salDue', { findingCode: 'DQ_INVOICE_NO_DUE' })).toEqual({ domain: 'sales', target: { tab: 'sales', reportRef: 'salDue', code: 'DQ_INVOICE_NO_DUE', params: { dueFilter: 'noDue' } } })
    expect(resolveFindingNavigation('matItems', { findingCode: 'DQ_NEGATIVE_GOLD' }).domain).toBe('material')
    expect(resolveQualityNavigation({ tab: 'production', reportRef: 'wrkTable', findingCode: 'DQ_PLACEHOLDER_WIP' }).target.tab).toBe('workers')
    expect(Object.values(CHECK_FINDING_CODE)).toContain('DQ_SO_NO_DELIVERY')
  })
})
