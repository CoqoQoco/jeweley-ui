// executive-digest-helpers.spec.js — Executive Digest: status → chip, digest → การ์ด 4 โดเมน, top → findings, ปลายทาง click-through, rows ของ Excel
import { describe, it, expect } from 'vitest'

import th from '@/language/view/executive/th.js'
import en from '@/language/view/executive/en.js'
import { stockConfig } from './stock/stock.config.js'
import { salesConfig } from './sales/sales.config.js'
import { materialGoldConfig } from './material/material.config.js'
import {
  DIGEST_DOMAINS,
  DIGEST_RULES_PREFIX,
  resolveStatusView,
  buildDomainCards,
  renderDigestText,
  buildTopFindings,
  resolveDigestNavigation,
  buildDigestExcelRows,
  buildDigestExcelSheet
} from './executive-digest-helpers.js'

const t = (key, params) => (params ? `${key}|${JSON.stringify(params)}` : key)

const digest = {
  asOf: '2026-10-22T09:00:00',
  metal: 'ALL',
  domains: [
    { key: 'production', status: 'critical', problemCount: 3, forecastCount: 1, available: true },
    { key: 'sales', status: 'warning', problemCount: 2, forecastCount: 0, available: true },
    { key: 'material', status: 'unknown', problemCount: 0, forecastCount: 0, available: false },
    { key: 'stock', status: 'ok', problemCount: 0, forecastCount: 4, available: true }
  ],
  top: [
    { domain: 'production', severity: 'critical', tab: 'gold', code: 'GOLD_LOSS_ABOVE_TARGET', params: { metal: 'GOLD', percent: 3 }, reportRef: 'goldKpi' },
    { domain: 'sales', severity: 'warning', tab: 'sales', code: 'SAL_OLDEST_OVERDUE', params: { days: 40 }, reportRef: 'salDue' }
  ]
}

describe('digest prefixes mirror each tab config', () => {
  it('uses the same i18nPrefix as the stock / sales / material tabs', () => {
    expect(DIGEST_RULES_PREFIX.stock).toBe(stockConfig.i18nPrefix)
    expect(DIGEST_RULES_PREFIX.sales).toBe(salesConfig.i18nPrefix)
    expect(DIGEST_RULES_PREFIX.material).toBe(materialGoldConfig.i18nPrefix)
  })
})

describe('resolveStatusView', () => {
  it.each(['critical', 'warning', 'ok', 'unknown'])('maps %s to its variant and label key', (status) => {
    expect(resolveStatusView(status)).toEqual({ variant: status, labelKey: `view.executive.digest.status.${status}` })
  })

  it('falls back to unknown for empty / unrecognised status', () => {
    expect(resolveStatusView('').variant).toBe('unknown')
    expect(resolveStatusView('???').variant).toBe('unknown')
    expect(resolveStatusView(undefined).variant).toBe('unknown')
  })
})

describe('buildDomainCards', () => {
  it('always returns 4 cards in tab order with counts', () => {
    const cards = buildDomainCards(digest)
    expect(cards.map((c) => c.key)).toEqual(['production', 'sales', 'stock', 'material'])
    expect(cards[0]).toMatchObject({ status: 'critical', problemCount: 3, forecastCount: 1, available: true, labelKey: 'view.executive.digest.domain.production' })
    expect(cards[2]).toMatchObject({ status: 'ok', forecastCount: 4 })
  })

  it('marks a failed / missing domain as unknown with zero counts instead of dropping it', () => {
    const cards = buildDomainCards(digest)
    expect(cards[3]).toMatchObject({ key: 'material', status: 'unknown', available: false, problemCount: 0, forecastCount: 0 })
    expect(buildDomainCards(null).every((c) => c.status === 'unknown' && !c.available)).toBe(true)
    expect(DIGEST_DOMAINS).toHaveLength(4)
  })
})

describe('renderDigestText / buildTopFindings', () => {
  it('translates production findings with the production rules prefix', () => {
    expect(renderDigestText(t, 'production', 'WIP_STALE', { count: 2 })).toContain('view.productionInsight.rules.WIP_STALE')
  })

  it('applies the tab remap for other domains (FC_SAL_COLLECTION warning -> _NONE)', () => {
    expect(renderDigestText(t, 'sales', 'FC_SAL_COLLECTION', {}, 'warning')).toContain('view.productionInsight.salesInsight.rules.FC_SAL_COLLECTION_NONE')
    expect(renderDigestText(t, 'sales', 'FC_SAL_COLLECTION', {}, 'info')).toContain('salesInsight.rules.FC_SAL_COLLECTION')
    expect(renderDigestText(t, 'stock', 'FC_STK_COVER_MONTHS', { coverMonths: null })).toContain('stockInsight.rules.FC_STK_COVER_NONE')
  })

  it('keeps backend order and builds InsightFindingList items with a domain tag and click-through params', () => {
    const list = buildTopFindings(digest.top, t)
    expect(list).toHaveLength(2)
    expect(list[0]).toMatchObject({ severity: 'critical', tag: 'view.executive.digest.domain.production', reportRef: 'gold' })
    expect(list[0].reportParams).toMatchObject({ domain: 'production', tab: 'gold', reportRef: 'goldKpi', code: 'GOLD_LOSS_ABOVE_TARGET' })
    expect(list[1]).toMatchObject({ severity: 'warning', reportRef: 'sales' })
    expect(new Set(list.map((f) => f.key)).size).toBe(2)
    expect(buildTopFindings(undefined, t)).toEqual([])
  })
})

describe('resolveDigestNavigation', () => {
  it('production topic -> production view target', () => {
    expect(resolveDigestNavigation('production', { tab: 'gold' })).toEqual({ tab: 'production', productionTarget: { view: 'gold' }, salesTarget: null })
    expect(resolveDigestNavigation('production', { tab: 'materials' }).productionTarget).toEqual({ view: 'materials' })
  })

  it('unknown production topic / card click only switches the tab', () => {
    expect(resolveDigestNavigation('production', { tab: 'nope' }).productionTarget).toBeNull()
    expect(resolveDigestNavigation('production', null)).toEqual({ tab: 'production', productionTarget: null, salesTarget: null })
    expect(resolveDigestNavigation('stock', { tab: 'stock', reportRef: 'stkAge' })).toEqual({ tab: 'stock', productionTarget: null, salesTarget: null })
  })

  it('sales salDue finding -> due sub-tab with the matching filter', () => {
    expect(resolveDigestNavigation('sales', { tab: 'sales', reportRef: 'salDue', code: 'SAL_NO_DUE_DATE', params: {} }).salesTarget).toEqual({ sub: 'due', dueFilter: 'noDue' })
    expect(resolveDigestNavigation('sales', { tab: 'sales', reportRef: 'salAging', code: 'X', params: {} }).salesTarget).toBeNull()
  })
})

describe('buildDigestExcelRows / sheet', () => {
  it('lists the 4 domains then the top findings', () => {
    const rows = buildDigestExcelRows(digest, t)
    expect(rows[0]).toEqual({ c1: 'view.executive.digest.excel.colDomain', c2: 'view.executive.digest.excel.colStatus', c3: 'view.executive.digest.excel.colProblems', c4: 'view.executive.digest.excel.colForecasts' })
    expect(rows[1]).toEqual({ c1: 'view.executive.digest.domain.production', c2: 'view.executive.digest.status.critical', c3: 3, c4: 1 })
    expect(rows[4]).toEqual({ c1: 'view.executive.digest.domain.material', c2: 'view.executive.digest.status.unknown', c3: '', c4: '' })
    expect(rows[5]).toEqual({})
    expect(rows[7]).toMatchObject({ c1: 1, c2: 'view.executive.digest.domain.production', c3: 'view.executive.excel.insight.severity.critical' })
    expect(rows[7].c4).toContain('view.productionInsight.rules.GOLD_LOSS_ABOVE_TARGET')
    expect(rows).toHaveLength(9)
  })

  it('builds a named sheet with 4 columns', () => {
    const sheet = buildDigestExcelSheet(digest, t)
    expect(sheet.sheetName).toBe('view.executive.digest.excel.sheetName')
    expect(sheet.columns.map((c) => c.key)).toEqual(['c1', 'c2', 'c3', 'c4'])
  })
})

describe('i18n', () => {
  const keysOf = (obj) => [...Object.keys(obj.digest), ...Object.keys(obj.digest.domain), ...Object.keys(obj.digest.status), ...Object.keys(obj.digest.excel)]

  it('has the same digest keys in th and en, covering every domain and status', () => {
    expect(keysOf(th)).toEqual(keysOf(en))
    DIGEST_DOMAINS.forEach((d) => {
      expect(th.digest.domain[d]).toBeTruthy()
      expect(en.digest.domain[d]).toBeTruthy()
    })
    ;['critical', 'warning', 'ok', 'unknown'].forEach((s) => expect(en.digest.status[s]).toBeTruthy())
  })
})
