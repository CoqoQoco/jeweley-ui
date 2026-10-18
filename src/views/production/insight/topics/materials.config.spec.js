// materials.config.spec.js — sanity ของ config หมวด materials: id/reportRef ครบไม่ซ้ำ, i18n key ที่ config อ้างมีจริง, params ของ source/ตาราง,
// ตัวเลข KPI/กราฟที่ config คำนวณตรงกับของเดิม (materials-kpi-group / materials-trend-chart)
import { describe, it, expect } from 'vitest'
import { createI18n } from 'vue-i18n'

import productionInsightTh from '@/language/view/production-insight/th.js'
import executiveTh from '@/language/view/executive/th.js'
import { BLOCK_TYPES } from '@/components/insight/page/blocks/block-types.js'
import { COLUMN_KINDS } from '@/components/insight/page/columns.js'
import { buildKpiCards } from '@/components/insight/page/blocks/kpi-block-helpers.js'
import { buildTrendSeries, buildTrendOptions } from '@/components/insight/page/blocks/trend-block-helpers.js'
import { buildPlanTableBody, buildResetPagingKey } from '@/components/insight/page/blocks/plan-table-block-helpers.js'
import { collectBlockIds, findDuplicates, flattenBlocks, computeSourceKeys, diffSourceKeys, buildInitialState } from '@/components/insight/page/insight-page-helpers.js'
import { reactive, isReactive } from 'vue'
import { validateTabConfig, findTabForReportRef, blocksForTab, hasTabs, isSourceTabGated } from '@/components/insight/page/insight-tabs-helpers.js'
import { buildDefaultMaterialsFilter } from '../insight-filters.js'
import { materialsConfig, DEFAULT_COVER_DAYS } from './materials.config.js'

// reportRef ที่ API ส่งมากับ finding ของหมวด materials + ปลายทางของการ์ด KPI
const MATERIALS_REPORT_REFS = ['matKpi', 'matTrend', 'matWaiting', 'matDemand', 'matLowCover']

const i18n = createI18n({ legacy: false, locale: 'th', messages: { th: { view: { productionInsight: productionInsightTh, executive: executiveTh } } } })
const t = i18n.global.t

function collectI18nKeys(value, out = new Set()) {
  if (typeof value === 'string') {
    if (value.startsWith('view.')) out.add(value)
  } else if (Array.isArray(value)) {
    value.forEach((item) => collectI18nKeys(item, out))
  } else if (value && typeof value === 'object') {
    Object.values(value).forEach((item) => collectI18nKeys(item, out))
  }
  return out
}

describe('materials config structure', () => {
  const nodes = flattenBlocks(materialsConfig.blocks)

  it('block ids are unique and cover every reportRef (so "ดู ›" scrolling keeps working)', () => {
    const ids = collectBlockIds(materialsConfig.blocks)
    expect(findDuplicates(ids)).toEqual([])
    MATERIALS_REPORT_REFS.forEach((ref) => expect(ids, `reportRef ${ref}`).toContain(ref))
  })

  it('all blocks use known types and registered column kinds, in the original order', () => {
    nodes.forEach((node) => {
      expect(BLOCK_TYPES).toContain(node.type)
      ;(node.columns || []).forEach((c) => expect(COLUMN_KINDS).toContain(c.kind))
    })
    expect(materialsConfig.blocks.map((b) => b.id)).toEqual(['matKpi', 'matTrend', 'matWaiting', 'matDemand', 'matLowCover'])
  })

  it('every i18n key referenced statically exists in th', () => {
    const keys = [...collectI18nKeys(materialsConfig)]
    expect(keys.length).toBeGreaterThan(30)
    expect(keys.filter((key) => !i18n.global.te(key, 'th'))).toEqual([])
  })

  it('state keys used by the toolbars are declared; paged tables hit MaterialXxx endpoints', () => {
    const declared = Object.keys(materialsConfig.state)
    nodes.forEach((node) => {
      ;[node.toolbar?.toggle?.stateKey, node.toolbar?.number?.stateKey].filter(Boolean).forEach((key) => expect(declared).toContain(key))
    })
    expect(nodes.filter((n) => n.type === 'planTable').map((n) => n.endpoint)).toEqual([
      'ProductionInsight/MaterialWaitingPlans',
      'ProductionInsight/MaterialGemDemand',
      'ProductionInsight/MaterialGemLowCover'
    ])
    expect(materialsConfig.masters).toEqual(['fetchGem', 'fetchGemShape'])
  })
})

describe('materials config sources and table params', () => {
  const filter = buildDefaultMaterialsFilter()
  const state = buildInitialState(materialsConfig.state)

  it('Materials is requested once with start/end/bucket=month only (metal comes from the store)', () => {
    const body = materialsConfig.sources.Materials.params(filter, state)
    expect(Object.keys(body).sort()).toEqual(['bucket', 'end', 'start'])
    expect(body.bucket).toBe('month')
    expect(materialsConfig.findings.source).toBe('Materials')
  })

  it('a range change refetches Materials; table toolbar state does not', () => {
    const before = computeSourceKeys(materialsConfig.sources, filter, state)
    const moved = { ...filter, start: new Date('2026-01-01'), end: new Date('2026-02-01') }
    expect(diffSourceKeys(before, computeSourceKeys(materialsConfig.sources, moved, state))).toEqual(['Materials'])
    expect(diffSourceKeys(before, computeSourceKeys(materialsConfig.sources, filter, { ...state, coverDays: 60, waitingStatus: 'short' }))).toEqual([])
  })

  it('tables have no start/end and use only their own toolbar state', () => {
    const [waiting, demand, lowCover] = materialsConfig.blocks.filter((b) => b.type === 'planTable')
    const ctx = { filter, state: { ...state, waitingStatus: 'short', demandStatus: 'ready', coverDays: 45 } }
    expect(buildPlanTableBody(waiting, ctx)).toEqual({ gemStatus: 'short' })
    expect(buildPlanTableBody(demand, ctx)).toEqual({ status: 'ready' })
    expect(buildPlanTableBody(lowCover, ctx)).toEqual({ coverDays: 45 })
    expect(buildPlanTableBody(lowCover, { filter, state: { ...state, coverDays: 0 } })).toEqual({ coverDays: DEFAULT_COVER_DAYS })
  })

  it('range / filter changes never reset the tables (snapshots)', () => {
    const [waiting] = materialsConfig.blocks.filter((b) => b.type === 'planTable')
    const k1 = buildResetPagingKey(waiting, { filter, state })
    const k2 = buildResetPagingKey(waiting, { filter: { ...filter, start: new Date('2020-01-01') }, state })
    expect(k1).toBe(k2)
  })
})

describe('materials KPI cards and trend (same figures as the old components)', () => {
  const ctx = {
    data: {
      Materials: {
        asOf: '2026-10-01T08:00:00',
        kpi: { waitingPlans: 12, waitingMedianDays: 5.26, issueMedianDays: 9.5, issueP90Days: 21, shortLines: 15, shortPlans: 8, matchedLines: 45, totalLines: 50 },
        series: [
          { bucketEnd: '2026-08-01T00:00:00', entered: 10, issueMedianDays: 4, issueP90Days: null },
          { bucketEnd: '2026-09-01T00:00:00', entered: 12, issueMedianDays: null, issueP90Days: 15 }
        ]
      }
    }
  }
  const kpi = materialsConfig.blocks[0]

  it('builds the 4 cards with the old values, subs, tones and report links', () => {
    const cards = buildKpiCards(kpi, ctx, t)
    expect(cards.map((c) => c.reportRef)).toEqual(['matWaiting', 'matTrend', 'matDemand', 'matWaiting'])
    expect(cards.map((c) => c.value)).toEqual(['12', `9.5 ${t('view.productionInsight.materials.daysUnit')}`, '15', '90%'])
    expect(cards[0].sub).toBe(t('view.productionInsight.materials.kpiWaitingPlansSub', { days: '5.3' }))
    expect(cards[2].tone).toBe('warning')
    expect(cards[3].sub).toBe(t('view.productionInsight.materials.kpiMatchedPercentSub', { matched: '45', total: '50' }))
  })

  it('shows dashes for missing KPI values (no totalLines => no percent)', () => {
    const cards = buildKpiCards(kpi, { data: { Materials: { kpi: {} } } }, t)
    expect(cards.map((c) => c.value)).toEqual(['—', '—', '—', '—'])
  })

  it('trend keeps null as a gap, bar on the left axis and median/P90 lines on the right axis (P90 dashed)', () => {
    const trend = materialsConfig.blocks[1]
    const points = trend.points(ctx)
    const series = buildTrendSeries(trend.series, points, t)
    expect(series.map((s) => s.type)).toEqual(['bar', 'line', 'line'])
    expect(series[1].data).toEqual([4, null])
    expect(series[2].data).toEqual([null, 15])
    const options = buildTrendOptions({ node: trend, points, categories: trend.categories(points), ctx, t })
    expect(options.stroke.dashArray).toEqual([0, 0, 6])
    expect(options.yaxis).toHaveLength(3)
    expect(options.xaxis.categories).toHaveLength(2)
  })
})

describe('materials columns', () => {
  const [, , waiting, demand, lowCover] = materialsConfig.blocks

  it('waiting table has the original columns (gems rendered as a chip list, workers header without tip)', () => {
    expect(waiting.columns.map((c) => c.field)).toEqual(['wo', 'product', 'requestDate', 'enteredGemSortDate', 'waitingDays', 'gems', 'dueDate', 'workers'])
    expect(waiting.columns.find((c) => c.field === 'gems').kind).toBe('chipList')
    expect(waiting.columns.find((c) => c.field === 'workers').tip).toBeUndefined()
    expect(waiting.dataKey).toBeUndefined()
  })

  it('demand table keys rows by rowKey and ends with a status chip', () => {
    expect(demand.dataKey).toBe('rowKey')
    expect(demand.columns.map((c) => c.field)).toEqual(['gemLabel', 'waitingPlans', 'upcomingPlans', 'requiredQty', 'available', 'usedPerMonth', 'coverDays', 'status'])
    expect(demand.columns.at(-1).kind).toBe('chip')
  })

  it('low-cover table is keyed by code and has the coverDays number toolbar (min 1)', () => {
    expect(lowCover.dataKey).toBe('code')
    expect(lowCover.toolbar.number).toMatchObject({ stateKey: 'coverDays', min: 1 })
    expect(lowCover.columns.map((c) => c.field)).toEqual(['code', 'groupName', 'shape', 'size', 'grade', 'quantity', 'used90d', 'coverDays'])
  })
})

describe('materials tabs (opt-in tab mode)', () => {
  const tabOf = (ref) => findTabForReportRef(materialsConfig, ref)?.tab

  it('opts in with the 5 data tabs in order and the config is valid', () => {
    expect(hasTabs(materialsConfig)).toBe(true)
    expect(materialsConfig.tabs.map((tab) => tab.key)).toEqual(['overview', 'trend', 'waiting', 'demand', 'lowcover'])
    expect(validateTabConfig(materialsConfig)).toEqual([])
  })

  it('tab labels exist in th', () => {
    materialsConfig.tabs.forEach((tab) => expect(i18n.global.te(tab.label, 'th'), tab.label).toBe(true))
  })

  it('exactly one block per tab', () => {
    const ids = (key) => blocksForTab(materialsConfig, key).map((n) => n.id)
    expect(ids('overview')).toEqual(['matKpi'])
    expect(ids('trend')).toEqual(['matTrend'])
    expect(ids('waiting')).toEqual(['matWaiting'])
    expect(ids('demand')).toEqual(['matDemand'])
    expect(ids('lowcover')).toEqual(['matLowCover'])
  })

  it('reportRef → tab for every backend ref and every KPI card link', () => {
    expect(tabOf('matKpi')).toBe('overview')
    expect(tabOf('matTrend')).toBe('trend')
    expect(tabOf('matWaiting')).toBe('waiting')
    expect(tabOf('matDemand')).toBe('demand')
    expect(tabOf('matLowCover')).toBe('lowcover')
    MATERIALS_REPORT_REFS.forEach((ref) => expect(tabOf(ref), ref).toBeTruthy())
    const kpi = materialsConfig.blocks.find((n) => n.id === 'matKpi')
    expect(kpi.cards.map((c) => [c.id, tabOf(c.reportRef)])).toEqual([['waiting', 'waiting'], ['issue', 'trend'], ['short', 'demand'], ['matched', 'waiting']])
  })

  it('Materials is eager (no tab gate) and the config stays out of Vue reactivity', () => {
    expect(materialsConfig.sources.Materials.tab).toBeUndefined()
    expect(isSourceTabGated(materialsConfig.sources.Materials, [])).toBe(false)
    expect(isReactive(reactive({ config: materialsConfig }).config)).toBe(false)
  })
})
