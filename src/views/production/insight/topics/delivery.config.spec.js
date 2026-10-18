// delivery.config.spec.js — sanity ของ config หมวด delivery: id/reportRef ครบไม่ซ้ำ, i18n key ที่ config อ้างมีจริง, params ของ source/ตาราง,
// ตัวเลข KPI/กราฟ/ชิป "ร่าง" ที่ config คำนวณตรงกับของเดิม
import { describe, it, expect, vi } from 'vitest'
import { createI18n } from 'vue-i18n'

vi.mock('@/services/permission/standard-edit-access.js', () => ({ hasStandardEditAccess: () => true }))

import productionInsightTh from '@/language/view/production-insight/th.js'
import executiveTh from '@/language/view/executive/th.js'
import { BLOCK_TYPES } from '@/components/insight/page/blocks/block-types.js'
import { TARGET_PRESETS } from '@/components/insight/page/blocks/target-presets.js'
import { COLUMN_KINDS } from '@/components/insight/page/columns.js'
import { buildKpiCards } from '@/components/insight/page/blocks/kpi-block-helpers.js'
import { buildTrendSeries, buildTrendOptions } from '@/components/insight/page/blocks/trend-block-helpers.js'
import { buildPlanTableBody, buildResetPagingKey } from '@/components/insight/page/blocks/plan-table-block-helpers.js'
import { collectBlockIds, findDuplicates, flattenBlocks, computeSourceKeys, diffSourceKeys, buildInitialState } from '@/components/insight/page/insight-page-helpers.js'
import { validateTabConfig, findTabForReportRef, blocksForTab, hasTabs } from '@/components/insight/page/insight-tabs-helpers.js'
import { reactive, isReactive } from 'vue'
import { buildDefaultDeliveryFilter } from '../insight-filters.js'
import { deliveryConfig } from './delivery.config.js'

// reportRef ที่ API ส่งมากับ finding ของหมวด delivery + ปลายทางของการ์ด KPI
const DELIVERY_REPORT_REFS = ['deliveryTrend', 'lateCustomers', 'atRisk', 'latePlans', 'stuckCostCard']

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

describe('delivery config structure', () => {
  const nodes = flattenBlocks(deliveryConfig.blocks)

  it('block ids are unique and cover every reportRef', () => {
    const ids = collectBlockIds(deliveryConfig.blocks)
    expect(findDuplicates(ids)).toEqual([])
    DELIVERY_REPORT_REFS.forEach((ref) => expect(ids, `reportRef ${ref}`).toContain(ref))
  })

  it('keeps the box order (KPI, trend group, customers, due switch, at risk, late plans, stuck)', () => {
    expect(deliveryConfig.blocks.map((b) => b.id ?? b.type)).toEqual(['kpi', 'deliveryTrend', 'lateCustomers', 'dueSwitch', 'atRisk', 'latePlans', 'stuckCostCard'])
    expect(deliveryConfig.blocks[1].blocks).toHaveLength(2)
  })

  it('all nodes use known types, registered column kinds and an existing target preset', () => {
    nodes.forEach((node) => {
      if (node.row || node.group) return
      if (node.type === 'slot') {
        expect(node.component).toBeTruthy()
        return
      }
      expect(BLOCK_TYPES).toContain(node.type)
      ;(node.columns || []).forEach((c) => expect(COLUMN_KINDS).toContain(c.kind))
      ;(node.toolbar?.actions || []).forEach((a) => expect(TARGET_PRESETS[a.preset]).toBeTruthy())
    })
  })

  it('every static i18n key exists in th', () => {
    const keys = [...collectI18nKeys(deliveryConfig)]
    expect(keys.length).toBeGreaterThan(40)
    expect(keys.filter((key) => !i18n.global.te(key, 'th'))).toEqual([])
    const preset = TARGET_PRESETS.deliveryTarget
    const presetKeys = [...collectI18nKeys(preset.text), ...preset.historyColumns.map((c) => c.header)]
    expect(presetKeys.filter((key) => !i18n.global.te(key, 'th'))).toEqual([])
  })

  it('the draft state declared for the target drawer exists', () => {
    expect(Object.keys(deliveryConfig.state)).toContain(TARGET_PRESETS.deliveryTarget.draftStateKey)
  })
})

describe('delivery config sources and table params', () => {
  const filter = buildDefaultDeliveryFilter()
  const state = buildInitialState(deliveryConfig.state)

  it('Delivery params match the old fetchDelivery body; no draft key unless there is a draft', () => {
    const body = deliveryConfig.sources.Delivery.params(filter, state)
    expect(Object.keys(body).sort()).toEqual(['bucket', 'draftTargetPercent', 'end', 'riskHorizonDays', 'start'])
    expect(body.draftTargetPercent).toBeUndefined()
    expect(JSON.parse(JSON.stringify(body))).not.toHaveProperty('draftTargetPercent')
    expect(deliveryConfig.sources.Delivery.params(filter, { draftTargetPercent: 90 }).draftTargetPercent).toBe(90)
    expect(deliveryConfig.sources.DeliveryTarget.method).toBe('get')
    expect(deliveryConfig.sources.Delivery.tab).toBeUndefined()
    expect(deliveryConfig.sources.DeliveryTarget.tab).toBe('trend')
  })

  it('source refetch rules: range → Delivery, riskHorizon → Delivery, departmentKeys → none, draft → Delivery only', () => {
    const before = computeSourceKeys(deliveryConfig.sources, filter, state)
    const range = { ...filter, start: new Date('2026-01-01'), end: new Date('2026-02-01'), bucket: 'month' }
    expect(diffSourceKeys(before, computeSourceKeys(deliveryConfig.sources, range, state))).toEqual(['Delivery'])
    expect(diffSourceKeys(before, computeSourceKeys(deliveryConfig.sources, { ...filter, riskHorizonDays: 7 }, state))).toEqual(['Delivery'])
    expect(diffSourceKeys(before, computeSourceKeys(deliveryConfig.sources, { ...filter, departmentKeys: ['trim'] }, state))).toEqual([])
    expect(diffSourceKeys(before, computeSourceKeys(deliveryConfig.sources, filter, { draftTargetPercent: 85 }))).toEqual(['Delivery'])
  })

  it('table params: atRisk = departmentKeys + riskHorizonDays, latePlans = range, stuck = none', () => {
    const [atRisk, latePlans, stuck] = deliveryConfig.blocks.filter((b) => b.type === 'planTable')
    const ctx = { filter: { ...filter, departmentKeys: ['trim'], riskHorizonDays: 14 }, state }
    expect(buildPlanTableBody(atRisk, ctx)).toEqual({ riskHorizonDays: 14, departmentKeys: ['trim'] })
    expect(Object.keys(buildPlanTableBody(latePlans, ctx)).sort()).toEqual(['end', 'start'])
    expect(buildPlanTableBody(stuck, ctx)).toEqual({})
  })

  it('table reset keys: atRisk resets on department/horizon, latePlans on range only, stuck never', () => {
    const [atRisk, latePlans, stuck] = deliveryConfig.blocks.filter((b) => b.type === 'planTable')
    const base = { filter, state }
    const dept = { filter: { ...filter, departmentKeys: ['trim'] }, state }
    const range = { filter: { ...filter, start: new Date('2020-01-01') }, state }
    expect(buildResetPagingKey(atRisk, dept)).not.toBe(buildResetPagingKey(atRisk, base))
    expect(buildResetPagingKey(atRisk, range)).toBe(buildResetPagingKey(atRisk, base))
    expect(buildResetPagingKey(latePlans, range)).not.toBe(buildResetPagingKey(latePlans, base))
    expect(buildResetPagingKey(latePlans, dept)).toBe(buildResetPagingKey(latePlans, base))
    expect(buildResetPagingKey(stuck, range)).toBe(buildResetPagingKey(stuck, base))
  })
})

describe('delivery KPI / charts / draft chip', () => {
  const delivery = {
    asOf: '2026-10-01T08:00:00',
    targetPercent: 90,
    targetSource: 'draft',
    kpi: { completedCount: 100, onTimeCount: 85, onTimePercent: 85, lateMedianDays: 3.25, plannedLeadMedianDays: 10, actualLeadMedianDays: 12.5, suggestedLeadDays: 14, openCount: 40, openOverdueCount: 9, openOverdueActiveCount: 6, atRiskCount: 11, stuckAfterCostCardCount: 4 },
    series: [
      { bucketEnd: '2026-09-01T00:00:00', onTimePercent: 80, plannedLeadMedianDays: 10, actualLeadMedianDays: null },
      { bucketEnd: '2026-09-08T00:00:00', onTimePercent: null, plannedLeadMedianDays: null, actualLeadMedianDays: 12 }
    ]
  }
  const ctx = { filter: buildDefaultDeliveryFilter(), state: {}, data: { Delivery: delivery, DeliveryTarget: { targetPercent: 95 } } }

  it('6 cards with old values, subs, tones and links', () => {
    const cards = buildKpiCards(deliveryConfig.blocks[0], ctx, t)
    expect(cards.map((c) => c.reportRef)).toEqual(['deliveryTrend', 'latePlans', 'deliveryTrend', 'atRisk', 'atRisk', 'stuckCostCard'])
    expect(cards[0].value).toBe('85%')
    expect(cards[0].tone).toBe('warning')
    expect(cards[0].sub).toBe(t('view.productionInsight.delivery.kpiOnTimeSubTarget', { target: '90', completed: '100', onTime: '85' }))
    expect(cards[1].value).toBe(`3.3 ${t('view.productionInsight.delivery.daysUnit')}`)
    expect(cards[2].sub).toBe(t('view.productionInsight.delivery.kpiLeadCompareSub', { planned: '10', suggested: '14' }))
    expect(cards[3].value).toBe('6')
    expect(cards[3].sub).toBe(t('view.productionInsight.delivery.kpiOpenOverdueSub', { all: '9', open: '40' }))
    expect(cards.map((c) => c.value).slice(4)).toEqual(['11', '4'])
  })

  it('without a target the first card has the no-target sub and a neutral tone', () => {
    const noTarget = { ...ctx, data: { Delivery: { ...delivery, targetPercent: null } } }
    const cards = buildKpiCards(deliveryConfig.blocks[0], noTarget, t)
    expect(cards[0].sub).toBe(t('view.productionInsight.delivery.kpiOnTimeSubNoTarget', { completed: '100', onTime: '85' }))
    expect(cards[0].tone).toBe('main')
  })

  it('on-time chart: bar, max 100, % formatting and the target line; null stays a gap', () => {
    const node = deliveryConfig.blocks[1].blocks[0]
    const points = node.points(ctx)
    expect(buildTrendSeries(node.series, points, t)[0].data).toEqual([80, null])
    const options = buildTrendOptions({ node, points, categories: node.categories(points), ctx, t })
    expect(options.chart.type).toBe('bar')
    expect(options.yaxis.max).toBe(100)
    expect(options.yaxis.labels.formatter(85)).toBe('85%')
    expect(options.annotations.yaxis[0].y).toBe(90)
    expect(buildTrendOptions({ node, points, categories: [], ctx: { ...ctx, data: { Delivery: { ...delivery, targetPercent: null } } }, t }).annotations).toEqual({})
  })

  it('lead chart: planned (dashed) vs actual, days', () => {
    const node = deliveryConfig.blocks[1].blocks[1]
    const points = node.points(ctx)
    const series = buildTrendSeries(node.series, points, t)
    expect(series.map((s) => s.data)).toEqual([[10, null], [null, 12]])
    const options = buildTrendOptions({ node, points, categories: [], ctx, t })
    expect(options.stroke.width).toEqual([2, 3])
    expect(options.stroke.dashArray).toEqual([6, 0])
  })

  it('draft chip appears only when the previewed target differs from the saved target', () => {
    const chip = deliveryConfig.blocks[1].blocks[0].toolbar.chip
    expect(chip(ctx, t)).toBe(t('view.productionInsight.delivery.targetDraftChip'))
    expect(chip({ ...ctx, data: { Delivery: { ...delivery, targetPercent: 95 }, DeliveryTarget: { targetPercent: 95 } } }, t)).toBe('')
    expect(chip({ ...ctx, data: { Delivery: { ...delivery, targetSource: 'saved' }, DeliveryTarget: { targetPercent: 95 } } }, t)).toBe('')
  })

  it('late customers use the empty text when there are none', () => {
    const node = deliveryConfig.blocks[2]
    expect(node.emptyText).toBe('view.productionInsight.delivery.lateCustomersEmpty')
    expect(node.dataKey).toBe('customerCode')
    expect(node.rows({ data: { Delivery: {} } })).toEqual([])
  })
})

describe('delivery tabs (opt-in tab mode)', () => {
  it('opts in with the 4 data tabs in order and every top-level block names one of them', () => {
    expect(hasTabs(deliveryConfig)).toBe(true)
    expect(deliveryConfig.tabs.map((tab) => tab.key)).toEqual(['overview', 'trend', 'customers', 'due'])
    expect(validateTabConfig(deliveryConfig)).toEqual([])
  })

  it('tab and toggle labels exist in th', () => {
    deliveryConfig.tabs.forEach((tab) => expect(i18n.global.te(tab.label, 'th'), tab.label).toBe(true))
    ;['dueSwitchAria', 'dueOptions.atRisk', 'dueOptions.latePlans', 'dueOptions.stuckCostCard'].forEach((key) => expect(i18n.global.te(`view.productionInsight.delivery.tabs.${key}`, 'th'), key).toBe(true))
  })

  it('top-level blocks per tab: each tab holds little', () => {
    const ids = (key) => blocksForTab(deliveryConfig, key).map((n) => n.id || n.type)
    expect(ids('overview')).toEqual(['kpi'])
    expect(ids('trend')).toEqual(['deliveryTrend'])
    expect(ids('customers')).toEqual(['lateCustomers'])
    expect(ids('due')).toEqual(['dueSwitch', 'atRisk', 'latePlans', 'stuckCostCard'])
  })

  it('reportRef → tab (+ due toggle): finding links and every KPI card link are reachable', () => {
    const expectTab = (ref, tab, value) => {
      const target = findTabForReportRef(deliveryConfig, ref)
      expect(target?.tab, ref).toBe(tab)
      expect(target?.reveal?.value, ref).toBe(value)
    }
    expectTab('deliveryTrend', 'trend', undefined)
    expectTab('lateCustomers', 'customers', undefined)
    expectTab('atRisk', 'due', 'atRisk')
    expectTab('latePlans', 'due', 'latePlans')
    expectTab('stuckCostCard', 'due', 'stuckCostCard')
    const kpi = deliveryConfig.blocks.find((b) => b.type === 'kpi')
    kpi.cards.forEach((card) => expect(findTabForReportRef(deliveryConfig, card.reportRef), `${card.id} → ${card.reportRef}`).not.toBeNull())
    DELIVERY_REPORT_REFS.forEach((ref) => expect(findTabForReportRef(deliveryConfig, ref), ref).not.toBeNull())
    deliveryConfig.blocks.filter((n) => n.reveal).forEach((n) => expect(n.reveal.stateKey).toBe('dueTable'))
  })

  it('the due tables are visible one at a time from state.dueTable, worst first, default atRisk', () => {
    const state = buildInitialState(deliveryConfig.state)
    expect(state.dueTable).toBe('atRisk')
    const blockOf = (id) => deliveryConfig.blocks.find((n) => n.id === id)
    const visibleIds = (dueTable) => ['atRisk', 'latePlans', 'stuckCostCard'].filter((id) => blockOf(id).visible({ state: { ...state, dueTable } }))
    expect(visibleIds('atRisk')).toEqual(['atRisk'])
    expect(visibleIds('latePlans')).toEqual(['latePlans'])
    expect(visibleIds('stuckCostCard')).toEqual(['stuckCostCard'])
    const dueSwitch = blockOf('dueSwitch')
    expect(dueSwitch.props({ state, t: (key) => key }).options.map((o) => o.value)).toEqual(['atRisk', 'latePlans', 'stuckCostCard'])
    const next = { ...state }
    dueSwitch.events['update:modelValue']({ setState: (key, value) => (next[key] = value) }, 'stuckCostCard')
    expect(next.dueTable).toBe('stuckCostCard')
  })

  it('the target drawer stays in the trend toolbar and the config/slot component stay out of Vue reactivity', () => {
    const trend = deliveryConfig.blocks.find((b) => b.id === 'deliveryTrend')
    expect(trend.blocks[0].toolbar.actions).toEqual([{ type: 'targetDrawer', preset: 'deliveryTarget' }])
    expect(isReactive(reactive({ config: deliveryConfig }).config)).toBe(false)
    const slot = deliveryConfig.blocks.find((n) => n.id === 'dueSwitch')
    expect(isReactive(reactive({ c: slot.component }).c)).toBe(false)
  })
})
