// workers.config.spec.js — sanity ของ config หมวด workers: id/reportRef ครบไม่ซ้ำ, i18n key ที่ config อ้างมีจริง, params ของ source/ตาราง,
// ตัวเลข KPI/กราฟ/ตารางที่ config คำนวณตรงกับของเดิม (workers-kpi-group / workers-trend-chart / workers-table / workers-detail-chart)
import { describe, it, expect } from 'vitest'
import { createI18n } from 'vue-i18n'

import productionInsightTh from '@/language/view/production-insight/th.js'
import executiveTh from '@/language/view/executive/th.js'
import { BLOCK_TYPES } from '@/components/insight/page/blocks/block-types.js'
import { COLUMN_KINDS, resolveCell } from '@/components/insight/page/columns.js'
import { buildKpiCards } from '@/components/insight/page/blocks/kpi-block-helpers.js'
import { buildTrendSeries, buildTrendOptions, resolveSeriesDefs } from '@/components/insight/page/blocks/trend-block-helpers.js'
import { applyToolbarFilters, isRowSelected, resolveRowSelection, resolveTableSections } from '@/components/insight/page/blocks/table-block-helpers.js'
import { buildPlanTableBody } from '@/components/insight/page/blocks/plan-table-block-helpers.js'
import { collectBlockIds, findDuplicates, flattenBlocks, computeSourceKeys, diffSourceKeys, buildInitialState, DISABLED_SOURCE_KEY } from '@/components/insight/page/insight-page-helpers.js'
import { buildDefaultWorkersFilter } from '../insight-filters.js'
import { workersConfig } from './workers.config.js'

const WORKERS_REPORT_REFS = ['wrkKpi', 'wrkTrend', 'wrkTable', 'wrkUnpaid']

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

const workers = [
  { code: 'A', name: 'อา', deptKey: 'setting', employmentType: 'IN_HOUSE', jobs: 10, plans: 8, wages: 5000, wagePerJob: 500, shareOfDeptJobs: 60.55, isRateOutlier: true, isConcentrated: false, goldLossPercent: 1.234 },
  { code: 'B', name: 'บี', deptKey: 'trim', employmentType: 'OUTSIDE', jobs: 5, plans: 5, wages: 9000, wagePerJob: 100, shareOfDeptJobs: 20, isRateOutlier: false, isConcentrated: true, goldDiffPercent: 0.5 },
  { code: 'C', name: 'ซี', deptKey: 'gemSort', employmentType: 'SHOP', jobs: 1, plans: 1, wages: 100, wagePerJob: 100, shareOfDeptJobs: 5, goldDiffPercent: 0 }
]

describe('workers config structure', () => {
  const nodes = flattenBlocks(workersConfig.blocks)

  it('block ids are unique and cover every reportRef, in the original order', () => {
    const ids = collectBlockIds(workersConfig.blocks)
    expect(findDuplicates(ids)).toEqual([])
    WORKERS_REPORT_REFS.forEach((ref) => expect(ids, `reportRef ${ref}`).toContain(ref))
    expect(workersConfig.blocks.map((b) => b.id)).toEqual(WORKERS_REPORT_REFS)
  })

  it('all nodes use known types and registered column kinds', () => {
    nodes.forEach((node) => {
      expect(BLOCK_TYPES).toContain(node.type)
      ;(node.columns || []).forEach((c) => expect(COLUMN_KINDS).toContain(c.kind))
      ;(node.sections || []).forEach((section) => (section.columns || []).forEach((c) => expect(COLUMN_KINDS).toContain(c.kind)))
    })
  })

  it('every static i18n key exists in th', () => {
    const keys = [...collectI18nKeys(workersConfig)]
    expect(keys.length).toBeGreaterThan(20)
    expect(keys.filter((key) => !i18n.global.te(key, 'th'))).toEqual([])
  })

  it('client-side toolbar state is declared; the concentration list is not rendered', () => {
    const declared = Object.keys(workersConfig.state)
    const table = workersConfig.blocks[2]
    expect(declared).toEqual(expect.arrayContaining([table.toolbar.multiselect.stateKey, table.toolbar.toggle.stateKey, table.selectable.stateKey]))
    expect(JSON.stringify(Object.keys(workersConfig.sources))).not.toContain('oncentration')
  })
})

describe('workers config sources', () => {
  const filter = buildDefaultWorkersFilter()
  const state = buildInitialState(workersConfig.state)

  it('Workers params are the old fetchWorkers body', () => {
    expect(Object.keys(workersConfig.sources.Workers.params(filter, state)).sort()).toEqual(['departmentKeys', 'employmentTypes', 'end', 'start'])
    expect(workersConfig.findings.source).toBe('Workers')
  })

  it('WorkerMonthly is disabled until a worker is selected, then needs code+deptKey+start+end in ONE key', () => {
    const off = computeSourceKeys(workersConfig.sources, filter, state)
    expect(off.WorkerMonthly).toBe(DISABLED_SOURCE_KEY)
    const picked = { ...state, selectedWorker: { code: 'A', deptKey: 'setting', name: 'อา' } }
    const on = computeSourceKeys(workersConfig.sources, filter, picked)
    expect(diffSourceKeys(off, on)).toEqual(['WorkerMonthly'])
    expect(workersConfig.sources.WorkerMonthly.params(filter, picked)).toMatchObject({ code: 'A', deptKey: 'setting' })
    // เปลี่ยนช่วงเวลาตอนมีช่างที่เลือก: Workers + WorkerMonthly คนละ 1 ครั้ง; ตัวกรองในตารางไม่กระทบ source ใดเลย
    const moved = { ...filter, start: new Date('2026-01-01'), end: new Date('2026-02-01') }
    expect(diffSourceKeys(on, computeSourceKeys(workersConfig.sources, moved, picked)).sort()).toEqual(['WorkerMonthly', 'Workers'])
    expect(diffSourceKeys(on, computeSourceKeys(workersConfig.sources, filter, { ...picked, tableDept: ['trim'], tableType: 'OUTSIDE' }))).toEqual([])
    expect(diffSourceKeys(on, computeSourceKeys(workersConfig.sources, { ...filter, departmentKeys: ['trim'] }, picked))).toEqual(['Workers'])
  })

  it('selected worker is cleared when it disappears after a reload and kept otherwise', () => {
    const reset = workersConfig.state.selectedWorker.resetOn.value
    const current = { code: 'A', deptKey: 'setting', name: 'อา' }
    expect(reset({ workers }, current)).toBe(current)
    expect(reset({ workers: [workers[1]] }, current)).toBeNull()
    expect(reset({ workers }, null)).toBeNull()
  })

  it('unpaid jobs table sends start/end/departmentKeys', () => {
    const unpaid = workersConfig.blocks[3]
    expect(Object.keys(buildPlanTableBody(unpaid, { filter, state })).sort()).toEqual(['departmentKeys', 'end', 'start'])
    expect(unpaid.endpoint).toBe('ProductionInsight/UnpaidPieceJobs')
  })
})

describe('workers KPI / trend / table / detail', () => {
  const data = {
    Workers: {
      asOf: '2026-10-01T08:00:00',
      kpi: { wagesPerMonth: 123456.7, wagePerOutputPlan: 540, activeWorkers: 20, outsideWageShare: 33.33, excludesSalaried: true, wagesByDept: [{ deptKey: 'trim', share: 10 }, { deptKey: 'setting', share: 60 }], activeWorkersByDept: [{ deptKey: 'setting', count: 12 }] },
      series: [
        { bucketEnd: '2026-08-01T00:00:00', deptKey: 'setting', wages: 100 },
        { bucketEnd: '2026-09-01T00:00:00', deptKey: 'setting', wages: 150 },
        { bucketEnd: '2026-09-01T00:00:00', deptKey: 'trim', wages: 50 }
      ],
      seriesTotal: [{ wagePerPlan: 500 }, { wagePerPlan: null }],
      workers
    },
    WorkerMonthly: { series: [{ bucketEnd: '2026-08-01T00:00:00', jobs: 3, wages: 900 }, { bucketEnd: '2026-09-01T00:00:00', jobs: null, wages: null }] }
  }
  const ctx = { filter: buildDefaultWorkersFilter(), state: buildInitialState(workersConfig.state), data, t }
  const [kpi, trend, table, unpaid] = workersConfig.blocks

  it('4 KPI cards: baht values, top-2 department sub-label with the salary note, links', () => {
    const cards = buildKpiCards(kpi, ctx, t)
    expect(cards.map((c) => c.value)).toEqual(['฿123,457', '฿540', '20', '33.3%'])
    expect(cards[0].sub).toContain(t('view.productionInsight.workers.excludesSalariedNote'))
    expect(cards[0].sub.indexOf(t('view.executive.department.setting'))).toBeLessThan(cards[0].sub.indexOf(t('view.executive.department.trim')))
    expect(cards[2].sub).toBe(`${t('view.executive.department.setting')} 12`)
    expect(cards.map((c) => c.reportRef)).toEqual(['wrkTrend', 'wrkTrend', 'wrkTable', 'wrkTable'])
  })

  it('trend: stacked bar per department found in the data + wage-per-plan line on the right axis (null kept as gap)', () => {
    const points = trend.points(ctx)
    expect(points).toEqual(['2026-08-01T00:00:00', '2026-09-01T00:00:00'])
    const defs = resolveSeriesDefs(trend, points, ctx, t)
    const series = buildTrendSeries(defs, points, t)
    expect(series.map((s) => s.type)).toEqual(['bar', 'bar', 'line'])
    expect(series[0].data).toEqual([100, 150])
    expect(series[1].data).toEqual([null, 50])
    expect(series[2].data).toEqual([500, null])
    const options = buildTrendOptions({ node: { ...trend, series: defs }, points, categories: trend.categories(points), ctx, t })
    expect(options.chart.stacked).toBe(true)
    expect(options.stroke.width).toEqual([0, 0, 3])
    expect(options.yaxis).toHaveLength(3)
    expect(options.yaxis[2].opposite).toBe(true)
    expect(options.tooltip.y[0].formatter(1500)).toBe('฿1,500')
  })

  it('table: sorted by wages desc, no row selected by default, gold column with s marker and gemSort dash', () => {
    const [section, note] = resolveTableSections(table)
    const rows = section.rows(ctx)
    expect(rows.map((r) => r.code)).toEqual(['B', 'A', 'C'])
    expect(note.kind).toBe('text')
    expect(rows.some((r) => isRowSelected(table, ctx, r))).toBe(false)
    const goldCol = section.columns.find((c) => c.field === 'gold')
    expect(resolveCell(goldCol, rows[1], t)).toMatchObject({ text: '1.2%', sup: 's' })
    expect(resolveCell(goldCol, rows[0], t)).toMatchObject({ text: '0.5%', sup: '' })
    expect(resolveCell(goldCol, rows[2], t)).toMatchObject({ text: '—', sup: '' })
  })

  it('table: outlier / concentrated cells use the warning colour + bold only on flagged rows', () => {
    const [section] = resolveTableSections(table)
    const rows = section.rows(ctx)
    const rate = section.columns.find((c) => c.field === 'wagePerJob')
    const share = section.columns.find((c) => c.field === 'shareOfDeptJobs')
    expect(resolveCell(rate, rows.find((r) => r.code === 'A'), t)).toMatchObject({ text: '฿500', color: 'var(--base-warning)', bold: true })
    expect(resolveCell(rate, rows.find((r) => r.code === 'B'), t)).toMatchObject({ color: '', bold: false })
    expect(resolveCell(share, rows.find((r) => r.code === 'B'), t)).toMatchObject({ text: '20%', bold: true })
  })

  it('table: client-side dept / employment filters (no request) and row selection stores the worker object', () => {
    const rows = resolveTableSections(table)[0].rows(ctx)
    expect(applyToolbarFilters(table.toolbar, rows, { state: { tableDept: ['trim'], tableType: 'ALL' } }).map((r) => r.code)).toEqual(['B'])
    expect(applyToolbarFilters(table.toolbar, rows, { state: { tableDept: [], tableType: 'SHOP' } }).map((r) => r.code)).toEqual(['C'])
    expect(table.toolbar.multiselect.options(ctx, t).map((o) => o.value)).toEqual(['setting', 'trim', 'gemSort'])
    const selection = resolveRowSelection(table, { data: rows[1] })
    expect(selection).toEqual({ stateKey: 'selectedWorker', value: { code: 'A', deptKey: 'setting', name: 'อา' } })
    expect(isRowSelected(table, { state: { selectedWorker: selection.value } }, rows[1])).toBe(true)
    expect(isRowSelected(table, { state: { selectedWorker: selection.value } }, rows[0])).toBe(false)
  })

  it('detail: shown only for a selected worker, titled with the name; bars = jobs, line = wages on the right axis', () => {
    const detail = table.detail
    expect(detail.selected(ctx)).toBeNull()
    const picked = { ...ctx, state: { ...ctx.state, selectedWorker: { code: 'A', deptKey: 'setting', name: 'อา' } } }
    expect(detail.selected(picked).name).toBe('อา')
    expect(detail.title(picked, t, detail.selected(picked))).toBe(t('view.productionInsight.workers.detailTitle', { name: 'อา' }))
    const points = detail.trend.points(picked)
    const series = buildTrendSeries(detail.trend.series, points, t)
    expect(series.map((s) => s.data)).toEqual([[3, null], [900, null]])
    const options = buildTrendOptions({ node: detail.trend, points, categories: detail.trend.categories(points), ctx: picked, t })
    expect(options.plotOptions.bar.columnWidth).toBe('45%')
    expect(options.yaxis[1].opposite).toBe(true)
  })

  it('unpaid table columns: worker code stacked with name', () => {
    const worker = unpaid.columns.find((c) => c.field === 'workerCode')
    expect(resolveCell(worker, { workerCode: 'W1', workerName: 'สมชาย' }, t)).toMatchObject({ primary: 'W1', secondary: 'สมชาย', strong: false })
    expect(resolveCell(worker, {}, t).primary).toBe('—')
  })
})
