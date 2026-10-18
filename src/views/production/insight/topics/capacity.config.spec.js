// capacity.config.spec.js — sanity ของ config หมวด capacity: id/reportRef, i18n key, params ของ Capacity, กติกา unit ใบ/ชิ้น,
// ตัวกรองแผนกฝั่ง client, breakdown (patch ตัวกรอง/สุทธิ/ชิป) และตัวเลขที่ config คำนวณตรงกับของเดิม
import { describe, it, expect } from 'vitest'
import { createI18n } from 'vue-i18n'

import productionInsightTh from '@/language/view/production-insight/th.js'
import executiveTh from '@/language/view/executive/th.js'
import { BLOCK_TYPES } from '@/components/insight/page/blocks/block-types.js'
import { COLUMN_KINDS, resolveCell, resolveHeader, resolveTipText } from '@/components/insight/page/columns.js'
import { buildKpiCards } from '@/components/insight/page/blocks/kpi-block-helpers.js'
import { buildTrendSeries, buildTrendOptions, resolveSeriesDefs } from '@/components/insight/page/blocks/trend-block-helpers.js'
import { isRowSelected, resolveTableSections } from '@/components/insight/page/blocks/table-block-helpers.js'
import { collectBlockIds, findDuplicates, flattenBlocks, computeSourceKeys, diffSourceKeys, buildInitialState } from '@/components/insight/page/insight-page-helpers.js'
import { validateTabConfig, findTabForReportRef, blocksForTab, hasTabs } from '@/components/insight/page/insight-tabs-helpers.js'
import { reactive, isReactive } from 'vue'
import { buildDefaultCapacityFilter } from '../insight-filters.js'
import { capacityConfig, filterDepartments, resolveEffectiveDeptKey, buildDepartmentRows, formatSignedNet, activeBreakdownKeys, buildGroupFilterPatch } from './capacity.config.js'

const CAPACITY_REPORT_REFS = ['capKpi', 'capTrend', 'capDepartments', 'capBreakdown', 'capCostCard']

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

const departments = [
  { key: 'setting', exitsPerMonth: 90, exitsPiecesPerMonth: 300, workersMedian: 5, plansPerWorker: 18, piecesPerWorker: 60, waitingNow: 30, waitingNowPieces: 100, workingNow: 10, workingNowPieces: 40, activeWip: 40, activeWipPieces: 140, queueDays: 12.34, isBottleneck: true, workersSeries: [{ bucketEnd: '2026-08-01T00:00:00', workers: 5 }, { bucketEnd: '2026-09-01T00:00:00', workers: 6 }], exitsSeries: [{ bucketEnd: '2026-09-01T00:00:00', exits: 80 }] },
  { key: 'costCard', exitsPerMonth: 50, workersMedian: 2, queueDays: 5, isBottleneck: true },
  { key: 'trim', exitsPerMonth: 70, workersMedian: 4, queueDays: 3, isBottleneck: false }
]

const data = {
  Capacity: {
    asOf: '2026-10-01T08:00:00',
    kpi: { inflowPerMonth: 120, inflowPiecesPerMonth: 400, outputPerMonth: 100, outputPiecesPerMonth: 330, netPerMonth: 20, netPiecesPerMonth: 70, backlogMonths: 2.54, backlogMonthsPieces: 3.1, activeWip: 250, activeWipPieces: 820, bottleneckDepts: ['setting'] },
    series: [
      { bucketEnd: '2026-08-01T00:00:00', inflow: 10, output: 8, completed: 7, activeWipEnd: 30, inflowPieces: 40, outputPieces: 30, completedPieces: 28, activeWipEndPieces: 120 },
      { bucketEnd: '2026-09-01T00:00:00', inflow: 12, output: 9, completed: 8, activeWipEnd: null, inflowPieces: 50, outputPieces: 35, completedPieces: 30, activeWipEndPieces: null }
    ],
    departments,
    costCardToDone: { medianDays: 6, p90Days: 14.04, pendingNow: 12, pendingOver30d: 2, pendingActive: 8, pendingStale: 4, series: [{ bucketEnd: '2026-09-01T00:00:00', count: 5, medianDays: 6, p90Days: null }] },
    breakdown: {
      by: 'productType',
      rows: [
        { key: 'RING', name: 'แหวน', unit: 'PR.', inflowPiecesPerMonth: 120, outputPiecesPerMonth: 100, netPiecesPerMonth: 20, activeWipPieces: 300, activeWipPlans: 40 },
        { key: '', name: 'ไม่ระบุ', unit: 'mixed', inflowPiecesPerMonth: 10, outputPiecesPerMonth: 12, netPiecesPerMonth: -2, activeWipPieces: 30, activeWipPlans: 6 }
      ],
      series: [{ bucketEnd: '2026-09-01T00:00:00', key: 'RING', inflowPieces: 40, outputPieces: 30 }]
    }
  }
}

const ctxOf = (overrides = {}) => ({ filter: { ...buildDefaultCapacityFilter(), ...(overrides.filter || {}) }, state: { ...buildInitialState(capacityConfig.state), ...(overrides.state || {}) }, data, loading: {}, t })

describe('capacity config structure', () => {
  const nodes = flattenBlocks(capacityConfig.blocks)

  it('block ids are unique and cover every reportRef; the pending table and the what-if slot come last', () => {
    const ids = collectBlockIds(capacityConfig.blocks)
    expect(findDuplicates(ids)).toEqual([])
    CAPACITY_REPORT_REFS.forEach((ref) => expect(ids, `reportRef ${ref}`).toContain(ref))
    expect(capacityConfig.blocks.map((b) => b.id ?? b.type)).toEqual(['capKpi', 'capTrend', 'capDepartments', 'capBreakdown', 'capCostCard', 'capCostPending', 'capWhatIf'])
  })

  it('all nodes use known types and registered column kinds (slot is the escape hatch)', () => {
    nodes.forEach((node) => {
      if (node.row || node.group || node.type === 'slot') return
      expect(BLOCK_TYPES).toContain(node.type)
      ;(node.columns || []).forEach((c) => expect(COLUMN_KINDS).toContain(c.kind))
      ;(node.sections || []).forEach((section) => (section.columns || []).forEach((c) => expect(COLUMN_KINDS).toContain(c.kind)))
    })
  })

  it('every static i18n key exists in th', () => {
    const keys = [...collectI18nKeys(capacityConfig)]
    expect(keys.length).toBeGreaterThan(40)
    expect(keys.filter((key) => !i18n.global.te(key, 'th'))).toEqual([])
  })
})

describe('capacity source', () => {
  const filter = buildDefaultCapacityFilter()
  const state = buildInitialState(capacityConfig.state)

  it('params = start/end/bucket/unit/product filters/breakdownBy (the old serverFilterKey fields) and no departmentKeys', () => {
    const body = capacityConfig.sources.Capacity.params(filter, state)
    expect(Object.keys(body).sort()).toEqual(['breakdownBy', 'bucket', 'end', 'goldSizes', 'golds', 'productTypes', 'start', 'unit'])
    expect(body.bucket).toBe('month')
  })

  it('one request for: range / unit / product filters / breakdownBy; none for departmentKeys or table state', () => {
    const before = computeSourceKeys(capacityConfig.sources, filter, state)
    const same = (patch) => diffSourceKeys(before, computeSourceKeys(capacityConfig.sources, { ...filter, ...patch }, state))
    expect(same({ start: new Date('2026-01-01'), end: new Date('2026-02-01') })).toEqual(['Capacity'])
    expect(same({ unit: 'piece' })).toEqual(['Capacity'])
    expect(same({ productTypes: ['RING'], golds: ['YG'] })).toEqual(['Capacity'])
    expect(same({ breakdownBy: 'gold' })).toEqual(['Capacity'])
    expect(same({ departmentKeys: ['trim'] })).toEqual([])
    expect(diffSourceKeys(before, computeSourceKeys(capacityConfig.sources, filter, { ...state, capDept: 'trim', breakdownMetric: 'outputPieces' }))).toEqual([])
  })

  it('onSourceLoaded forwards Capacity.filterOptions only', () => {
    const emitted = []
    const emit = (event, payload) => emitted.push([event, payload])
    capacityConfig.onSourceLoaded('Capacity', { filterOptions: { golds: [] } }, emit)
    capacityConfig.onSourceLoaded('Capacity', {}, emit)
    capacityConfig.onSourceLoaded('Other', { filterOptions: {} }, emit)
    expect(emitted).toEqual([['filter-options-loaded', { golds: [] }]])
  })
})

describe('KPI cards (unit-driven, bottleneck from the full department list)', () => {
  const kpi = capacityConfig.blocks[0]

  it('plan unit: plan figures, pieces as the secondary line', () => {
    const cards = buildKpiCards(kpi, ctxOf(), t)
    expect(cards.map((c) => c.value)).toEqual(['120', '100', `2.5 ${t('view.productionInsight.capacity.monthsUnit')}`, '1', `6 ${t('view.productionInsight.capacity.daysUnit')}`])
    expect(cards[0].sub).toBe(t('view.productionInsight.capacity.kpiInflowSub', { pieces: '400' }))
    expect(cards[1].sub).toBe(t('view.productionInsight.capacity.kpiNetSubUp', { amount: '20', unit: 'ใบ' }))
    expect(cards[1].tone).toBe('warning')
    expect(cards[3].sub).toBe(t('view.productionInsight.capacity.kpiBottleneckDeptItem', { name: t('view.executive.department.setting'), days: '12.3' }))
    expect(cards.map((c) => c.reportRef)).toEqual(['capTrend', 'capTrend', 'capDepartments', 'capDepartments', 'capCostCard'])
  })

  it('piece unit switches the whole set to piece fields', () => {
    const cards = buildKpiCards(kpi, ctxOf({ filter: { unit: 'piece' } }), t)
    expect(cards.map((c) => c.value).slice(0, 3)).toEqual(['400', '330', `3.1 ${t('view.productionInsight.capacity.monthsUnit')}`])
    expect(cards[0].sub).toBe(t('view.productionInsight.capacity.kpiInflowSubPlans', { plans: '120' }))
    expect(cards[1].sub).toBe(t('view.productionInsight.capacity.kpiNetSubUp', { amount: '70', unit: 'ชิ้น' }))
    expect(cards[2].sub).toBe(t('view.productionInsight.capacity.kpiBacklogSub', { activeWip: '820', unit: 'ชิ้น' }))
  })

  it('the bottleneck count ignores the department filter', () => {
    expect(buildKpiCards(kpi, ctxOf({ filter: { departmentKeys: ['trim'] } }), t)[3].value).toBe('1')
  })
})

describe('trend (unit-driven fields, hint, dashes for null)', () => {
  const trend = capacityConfig.blocks[1]

  it('plan unit reads inflow/output/completed/activeWipEnd; piece unit reads the *Pieces fields; hint only for pieces', () => {
    const plan = ctxOf()
    const points = trend.points(plan)
    const planSeries = buildTrendSeries(resolveSeriesDefs(trend, points, plan, t), points, t)
    expect(planSeries.map((s) => s.data)).toEqual([[10, 12], [8, 9], [7, 8], [30, null]])
    expect(planSeries[0].name).toBe(t('view.productionInsight.capacity.seriesInflow'))
    expect(trend.hint(plan, t)).toBe('')

    const piece = ctxOf({ filter: { unit: 'piece' } })
    const pieceSeries = buildTrendSeries(resolveSeriesDefs(trend, points, piece, t), points, t)
    expect(pieceSeries.map((s) => s.data)).toEqual([[40, 50], [30, 35], [28, 30], [120, null]])
    expect(pieceSeries[0].name).toBe(t('view.productionInsight.capacity.seriesInflowPieces'))
    expect(trend.hint(piece, t)).toBe(t('view.productionInsight.capacity.trendPieceUnitHint'))
  })

  it('3 bars on the left axis + the backlog line on the right, titled with the unit', () => {
    const ctx = ctxOf({ filter: { unit: 'piece' } })
    const points = trend.points(ctx)
    const options = buildTrendOptions({ node: { ...trend, series: resolveSeriesDefs(trend, points, ctx, t) }, points, categories: trend.categories(points), ctx, t })
    expect(options.stroke.width).toEqual([0, 0, 0, 3])
    expect(options.yaxis).toHaveLength(4)
    expect(options.yaxis[0].title.text).toBe('ชิ้น')
    expect(options.yaxis[3]).toMatchObject({ opposite: true, title: { text: 'ชิ้น' } })
    expect(options.xaxis.categories).toHaveLength(2)
  })
})

describe('department table / detail', () => {
  const table = capacityConfig.blocks[2]

  it('filterDepartments is client-side and tolerant', () => {
    expect(filterDepartments(departments, []).length).toBe(3)
    expect(filterDepartments(departments, ['trim']).map((d) => d.key)).toEqual(['trim'])
    expect(filterDepartments(null, ['trim'])).toEqual([])
  })

  it('rows resolve unit fields (piece) and label; columns headers switch with the unit', () => {
    const planRows = buildDepartmentRows(departments, 'plan', t)
    expect(planRows[0]).toMatchObject({ exits: 90, perWorker: 18, waiting: 30, working: 10, activeWip: 40, label: t('view.executive.department.setting') })
    const pieceRows = buildDepartmentRows(departments, 'piece', t)
    expect(pieceRows[0]).toMatchObject({ exits: 300, perWorker: 60, waiting: 100, working: 40, activeWip: 140 })
    const [section] = resolveTableSections(table)
    const exits = section.columns.find((c) => c.field === 'exits')
    expect(resolveHeader(exits, t, ctxOf())).toBe(t('view.productionInsight.capacity.deptColExitsPlan'))
    expect(resolveHeader(exits, t, ctxOf({ filter: { unit: 'piece' } }))).toBe(t('view.productionInsight.capacity.deptColExitsPiece'))
  })

  it('queue column keeps plan-based days with the unit, the bottleneck chip (document variant for costCard) and a unit note tip', () => {
    const [section] = resolveTableSections(table)
    const queue = section.columns.find((c) => c.field === 'queueDays')
    const rows = buildDepartmentRows(departments, 'plan', t)
    expect(resolveCell(queue, rows[0], t)).toMatchObject({ text: `12.3 ${t('view.productionInsight.capacity.daysUnit')}`, badge: t('view.productionInsight.capacity.deptBottleneckChip') })
    expect(resolveCell(queue, rows[1], t).badge).toBe(t('view.productionInsight.capacity.deptBottleneckCostCardChip'))
    expect(resolveCell(queue, rows[2], t).badge).toBe('')
    expect(resolveTipText(queue, ctxOf(), t)).toBe(t('view.productionInsight.help.capacityQueueDays'))
    expect(resolveTipText(queue, ctxOf({ filter: { unit: 'piece' } }), t)).toContain(t('view.productionInsight.capacity.deptQueuePlanNote'))
  })

  it('effective selection: clicked key if still listed, else the default (bottleneck) — highlight and detail follow it', () => {
    expect(resolveEffectiveDeptKey(departments, null)).toBe('setting')
    expect(resolveEffectiveDeptKey(departments, 'trim')).toBe('trim')
    expect(resolveEffectiveDeptKey([departments[2]], 'setting')).toBe('trim')
    const ctx = ctxOf()
    expect(isRowSelected(table, ctx, { key: 'setting' })).toBe(true)
    expect(isRowSelected(table, ctxOf({ state: { capDept: 'trim' } }), { key: 'trim' })).toBe(true)
    expect(table.detail.selected(ctx).key).toBe('setting')
    expect(table.detail.selected(ctxOf({ filter: { departmentKeys: ['trim'] }, state: { capDept: 'setting' } })).key).toBe('trim')
  })

  it('detail chart aligns exits to the workers buckets (gap when missing) and titles with the department name', () => {
    const ctx = { ...ctxOf(), selected: departments[0] }
    const points = table.detail.trend.points(ctx)
    const defs = resolveSeriesDefs(table.detail.trend, points, ctx, t)
    expect(buildTrendSeries(defs, points, t).map((s) => s.data)).toEqual([[null, 80], [5, 6]])
    expect(table.detail.title(ctx, t, departments[0])).toBe(t('view.productionInsight.capacity.deptDetailTitle', { name: t('view.executive.department.setting') }))
  })
})

describe('breakdown', () => {
  const [tableNode, chartNode] = capacityConfig.blocks[3].blocks

  it('net formatting and the group filter patch (toggle on repeat click, per dimension)', () => {
    expect(formatSignedNet(20)).toBe('+20')
    expect(formatSignedNet(-2)).toBe('−2')
    expect(formatSignedNet(0)).toBe('0')
    expect(formatSignedNet(null)).toBe('—')
    const filter = buildDefaultCapacityFilter()
    expect(buildGroupFilterPatch(filter, 'RING')).toEqual({ productTypes: ['RING'] })
    expect(buildGroupFilterPatch({ ...filter, productTypes: ['RING'] }, 'RING')).toEqual({ productTypes: [] })
    expect(buildGroupFilterPatch({ ...filter, productTypes: ['RING', 'EAR'] }, 'RING')).toEqual({ productTypes: ['RING'] })
    expect(buildGroupFilterPatch({ ...filter, breakdownBy: 'gold' }, '')).toEqual({ golds: [''] })
    expect(buildGroupFilterPatch({ ...filter, breakdownBy: 'goldSize' }, '16')).toEqual({ goldSizes: ['16'] })
    expect(activeBreakdownKeys({ ...filter, breakdownBy: 'gold', golds: ['YG'] })).toEqual(['YG'])
  })

  it('toggle writes the page filter (not state); row click asks the page to update the filter; active rows are highlighted', () => {
    const updates = []
    const ctx = { ...ctxOf(), updateFilter: (patch) => updates.push(patch) }
    tableNode.toolbar.toggle.onChange(ctx, 'gold')
    tableNode.onRowClick({ key: 'RING' }, ctx)
    expect(updates).toEqual([{ breakdownBy: 'gold' }, { productTypes: ['RING'] }])
    expect(tableNode.toolbar.toggle.value(ctx)).toBe('productType')
    expect(tableNode.rowClass({ key: 'RING' }, { ...ctx, filter: { ...ctx.filter, productTypes: ['RING'] } })['insight-table__row--selected']).toBe(true)
    expect(tableNode.rowClass({ key: 'EAR' }, { ...ctx, filter: { ...ctx.filter, productTypes: ['RING'] } })['insight-table__row--selected']).toBe(false)
  })

  it('table cells: unit codes translated (PR. → คู่, mixed → ชิ้น/คู่), net coloured only when non-zero', () => {
    const section = resolveTableSections(tableNode).find((s) => s.kind === 'table')
    const unit = section.columns.find((c) => c.field === 'unit')
    const net = section.columns.find((c) => c.field === 'netPiecesPerMonth')
    const rows = section.rows(ctxOf())
    expect(resolveCell(unit, rows[0], t).text).toBe('คู่')
    expect(resolveCell(unit, rows[1], t).text).toBe('ชิ้น/คู่')
    expect(resolveCell(net, rows[0], t)).toMatchObject({ text: '+20', color: 'var(--base-warning)', bold: true })
    expect(resolveCell(net, rows[1], t)).toMatchObject({ text: '−2', color: 'var(--base-green)' })
    expect(resolveHeader(section.columns[0], t, ctxOf())).toBe(t('view.productionInsight.capacity.breakdownBy.productType'))
  })

  it('stacked chart: top groups + palette colours, metric toggled by state', () => {
    const ctx = ctxOf()
    const points = chartNode.points(ctx)
    expect(points).toEqual(['2026-09-01T00:00:00'])
    const defs = resolveSeriesDefs(chartNode, points, ctx, t)
    expect(defs).toHaveLength(1)
    expect(defs[0]).toMatchObject({ name: 'แหวน', data: [40], type: 'bar' })
    const output = ctxOf({ state: { breakdownMetric: 'outputPieces' } })
    expect(resolveSeriesDefs(chartNode, chartNode.points(output), output, t)[0].data).toEqual([30])
    expect(chartNode.title(ctx, t)).toBe(t('view.productionInsight.capacity.breakdownChartTitle', { by: t('view.productionInsight.capacity.breakdownBy.productType') }))
  })
})

describe('cost card group', () => {
  const group = capacityConfig.blocks[4]

  it('keeps the old id and card frame around the summary figures and the monthly chart only', () => {
    expect(group.id).toBe('capCostCard')
    expect(group.card).toBeTruthy()
    expect(group.blocks.map((b) => b.type)).toEqual(['kpi', 'trend'])
    expect(group.blocks.every((b) => b.bare)).toBe(true)
  })

  it('the pending-plans table is split out into its own top-level block with its own title/frame', () => {
    const pending = capacityConfig.blocks.find((b) => b.id === 'capCostPending')
    expect(pending.type).toBe('planTable')
    expect(pending.bare).toBeUndefined()
    expect(pending.title).toBe('view.productionInsight.capacity.costCardPendingTableTitle')
    expect(pending.endpoint).toBe('ProductionInsight/CostCardPendingPlans')
    expect(pending.params()).toEqual({})
    expect(flattenBlocks(group.blocks).some((b) => b.endpoint)).toBe(false)
  })

  it('summary items: median/p90 in days, pending with the active/stale breakdown only when both exist', () => {
    const items = group.blocks[0].items(ctxOf(), t)
    expect(items.map((i) => i.value)).toEqual([`6 ${t('view.productionInsight.capacity.daysUnit')}`, `14 ${t('view.productionInsight.capacity.daysUnit')}`, '12', '2'])
    expect(items[2].sub).toBe(t('view.productionInsight.capacity.costCardPendingBreakdown', { active: '8', stale: '4' }))
    const without = group.blocks[0].items({ ...ctxOf(), data: { Capacity: { costCardToDone: { pendingNow: 3, pendingActive: null, pendingStale: 4 } } } }, t)
    expect(without[2].sub).toBe('')
  })

  it('chart keeps null as gap with lines on the days axis (P90 dashed)', () => {
    const trend = group.blocks[1]
    const points = trend.points(ctxOf())
    expect(buildTrendSeries(trend.series, points, t).map((s) => s.data)).toEqual([[5], [6], [null]])
    const options = buildTrendOptions({ node: trend, points, categories: trend.categories(points), ctx: ctxOf(), t })
    expect(options.stroke.dashArray).toEqual([0, 0, 6])
    expect(options.yaxis).toHaveLength(3)
  })
})

describe('capacity tabs (opt-in tab mode)', () => {
  it('opts in with the 7 data tabs in order and every top-level block names one of them', () => {
    expect(hasTabs(capacityConfig)).toBe(true)
    expect(capacityConfig.tabs.map((tab) => tab.key)).toEqual(['overview', 'trend', 'dept', 'breakdown', 'costcard', 'costpending', 'whatif'])
    expect(validateTabConfig(capacityConfig)).toEqual([])
  })

  it('tab labels exist in th', () => {
    capacityConfig.tabs.forEach((tab) => expect(i18n.global.te(tab.label, 'th'), tab.label).toBe(true))
  })

  it('top-level blocks per tab: each tab holds little', () => {
    const ids = (key) => blocksForTab(capacityConfig, key).map((n) => n.id || n.type)
    expect(ids('overview')).toEqual(['capKpi'])
    expect(ids('trend')).toEqual(['capTrend'])
    expect(ids('dept')).toEqual(['capDepartments'])
    expect(ids('breakdown')).toEqual(['capBreakdown'])
    expect(ids('costcard')).toEqual(['capCostCard'])
    expect(ids('costpending')).toEqual(['capCostPending'])
    expect(ids('whatif')).toEqual(['capWhatIf'])
  })

  it('reportRef → tab for every backend ref and every KPI card link', () => {
    const tabOf = (ref) => findTabForReportRef(capacityConfig, ref)?.tab
    expect(tabOf('capKpi')).toBe('overview')
    expect(tabOf('capTrend')).toBe('trend')
    expect(tabOf('capDepartments')).toBe('dept')
    expect(tabOf('capBreakdown')).toBe('breakdown')
    expect(tabOf('capCostCard')).toBe('costcard')
    CAPACITY_REPORT_REFS.forEach((ref) => expect(tabOf(ref), ref).toBeTruthy())
    const kpi = capacityConfig.blocks.find((b) => b.id === 'capKpi')
    kpi.cards.forEach((card) => expect(tabOf(card.reportRef), `${card.id} → ${card.reportRef}`).toBeTruthy())
  })

  it('only one source (Capacity) and it is eager; the config and the what-if component stay out of Vue reactivity', () => {
    expect(Object.keys(capacityConfig.sources)).toEqual(['Capacity'])
    expect(capacityConfig.sources.Capacity.tab).toBeUndefined()
    expect(isReactive(reactive({ config: capacityConfig }).config)).toBe(false)
    const slot = capacityConfig.blocks.find((n) => n.id === 'capWhatIf')
    expect(isReactive(reactive({ c: slot.component }).c)).toBe(false)
  })
})
