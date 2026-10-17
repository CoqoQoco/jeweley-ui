// gold.config.spec.js — sanity ของ config หมวด "ทองและ Loss": id/reportRef, i18n key, params ของ Gold/GoldByStage (draftTargets ส่งทั้งคู่),
// KPI 2 แถว, ตารางแผนก (notWeighed/ค้างไม่รับคืน/default selection), รายละเอียดแผนก, กราฟทุกแผนก (ซ่อน includesScrap), กราฟแนวโน้ม, preset ตั้งเป้า
import { describe, it, expect, vi } from 'vitest'
import { createI18n } from 'vue-i18n'
import { reactive, isReactive } from 'vue'

import productionInsightTh from '@/language/view/production-insight/th.js'
import executiveTh from '@/language/view/executive/th.js'
import { BLOCK_TYPES } from '@/components/insight/page/blocks/block-types.js'
import { getTargetPreset } from '@/components/insight/page/blocks/target-presets.js'
import { buildDraftEmission } from '@/components/insight/page/blocks/target-drawer-helpers.js'
import {
  COLUMN_KINDS,
  resolveCell,
  resolveHeader,
  resolveTipText
} from '@/components/insight/page/columns.js'
import { buildKpiCards } from '@/components/insight/page/blocks/kpi-block-helpers.js'
import {
  buildTrendSeries,
  buildTrendOptions,
  resolveSeriesDefs
} from '@/components/insight/page/blocks/trend-block-helpers.js'
import {
  isRowSelected,
  resolveTableSections
} from '@/components/insight/page/blocks/table-block-helpers.js'
import {
  buildPlanTableRequest,
  buildResetPagingKey
} from '@/components/insight/page/blocks/plan-table-block-helpers.js'
import {
  collectBlockIds,
  findDuplicates,
  flattenBlocks,
  computeSourceKeys,
  diffSourceKeys,
  buildInitialState,
  buildStateResets,
  isNodeVisible
} from '@/components/insight/page/insight-page-helpers.js'
import { useMetalScopeStore } from '@/stores/modules/ui/metal-scope-store.js'
import { createPinia, setActivePinia } from 'pinia'
import { buildDefaultGoldFilter } from '../insight-filters.js'
import { goldConfig } from './gold.config.js'
import {
  GOLD_TARGET_PRESET_NAME,
  buildGoldTargetRows,
  buildGoldTargetSavedMap,
  buildGoldTargetSavePayload,
  buildGoldTargetDraftPayload
} from './gold-target-preset.js'

const GOLD_REPORT_REFS = [
  'goldKpi',
  'goldStage',
  'goldStageOutliers',
  'goldStagePending',
  'goldTrend',
  'goldWorkers',
  'goldOverSlips',
  'goldUncovered'
]

const i18n = createI18n({
  legacy: false,
  locale: 'th',
  messages: { th: { view: { productionInsight: productionInsightTh, executive: executiveTh } } }
})
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

const G = 'view.productionInsight.gold'

const departments = [
  {
    deptKey: 'trim',
    includesScrap: true,
    notWeighed: false,
    returnedSendGram: 100,
    sendGram: 150,
    receivedGram: 98,
    diffGram: 2,
    diffPercent: 2,
    targetPercent: null,
    slipLossPercent: 1.5,
    pendingWithWorkerCount: 0,
    pendingQueueCount: 0,
    workers: []
  },
  {
    deptKey: 'setting',
    includesScrap: false,
    notWeighed: false,
    returnedSendGram: 200.456,
    receivedGram: 190,
    diffGram: 10.456,
    diffPercent: 5.1,
    targetPercent: 3,
    slipLossPercent: 2,
    pendingWithWorkerCount: 2,
    pendingWithWorkerGram: 12.5,
    pendingQueueCount: 1,
    pendingQueueGram: 3,
    workers: [{ workerCode: 'W1', rows: 4, returnedSendGram: 50, diffGram: 1, diffPercent: 2 }]
  },
  {
    deptKey: 'gemSort',
    includesScrap: false,
    notWeighed: true,
    diffPercent: null,
    targetPercent: null,
    workers: []
  },
  {
    deptKey: 'plating',
    includesScrap: false,
    notWeighed: false,
    returnedSendGram: 10,
    receivedGram: 9,
    diffGram: 1,
    diffPercent: 1,
    targetPercent: 4,
    slipLossPercent: 0.5,
    workers: []
  }
]

const data = {
  Gold: {
    asOf: '2026-10-01T08:00:00',
    metalForced: false,
    kpi: [
      {
        workerType: 50,
        lossPercent: 1.234,
        allowedPercent: 1,
        targetPercent: 2,
        excessGram: 0,
        excessMoney: 0,
        coverageJobs: 10,
        coverageTotalJobs: 10,
        coveragePercent: 100
      },
      {
        workerType: 80,
        lossPercent: 3.456,
        allowedPercent: 2.5,
        targetPercent: 3,
        excessGram: 12.345,
        excessMoney: 1234,
        coverageJobs: 8,
        coverageTotalJobs: 10,
        coveragePercent: 80
      }
    ],
    series: [
      {
        workerType: 80,
        bucketEnd: '2026-09-07T00:00:00',
        rawLossGram: 5,
        allowedGram: 4,
        lossPercent: 3,
        allowedPercent: 2.5
      },
      {
        workerType: 50,
        bucketEnd: '2026-09-07T00:00:00',
        rawLossGram: 1,
        allowedGram: 1,
        lossPercent: 1,
        allowedPercent: 1
      }
    ],
    targets: [
      { workerType: 80, metal: 'GOLD', targetPercent: 3, source: 'draft' },
      { workerType: 50, metal: 'GOLD', targetPercent: 2, source: 'saved' }
    ],
    workers: [
      {
        workerType: 80,
        workerCode: 'W1',
        workerName: 'ช่าง',
        slipCount: 3,
        receivedGram: 12.5,
        lossPercent: 3.1,
        allowedPercent: 2,
        targetPercent: 3,
        excessGram: 1.2,
        excessMoney: 500,
        netMoney: -300,
        overBuckets: 2,
        qualifyingBuckets: 3
      }
    ]
  },
  GoldByStage: {
    departments,
    series: [
      { deptKey: 'setting', bucketEnd: '2026-08-01T00:00:00', diffPercent: 4 },
      { deptKey: 'setting', bucketEnd: '2026-09-01T00:00:00', diffPercent: 5 },
      { deptKey: 'trim', bucketEnd: '2026-09-01T00:00:00', diffPercent: 2 }
    ]
  },
  GoldLossTargets: [
    { scope: 'SLIP', workerType: 80, metal: 'GOLD', targetPercent: 3 },
    { scope: 'SLIP', workerType: 50, metal: 'GOLD', targetPercent: 2 },
    { scope: 'STAGE', workerType: 80, metal: 'GOLD', targetPercent: 3 }
  ]
}

const ctxOf = (overrides = {}) => ({
  filter: { ...buildDefaultGoldFilter(), metal: 'GOLD', ...(overrides.filter || {}) },
  state: { ...buildInitialState(goldConfig.state), ...(overrides.state || {}) },
  data: overrides.data || data,
  loading: {},
  t
})

const blockOf = (id) => flattenBlocks(goldConfig.blocks).find((node) => node.id === id)

describe('gold config structure', () => {
  const nodes = flattenBlocks(goldConfig.blocks)

  it('block ids are unique and cover every reportRef the API sends', () => {
    const ids = collectBlockIds(goldConfig.blocks)
    expect(findDuplicates(ids)).toEqual([])
    GOLD_REPORT_REFS.forEach((ref) => expect(ids, `reportRef ${ref}`).toContain(ref))
  })

  it('blocks keep the original order: note, KPI, stage, all-department chart, outliers, pending, trend, workers, over slips, uncovered', () => {
    expect(goldConfig.blocks.map((b) => b.id ?? b.type)).toEqual([
      'note',
      'goldKpi',
      'goldDeptPicker',
      'goldStage',
      'goldStageTrend',
      'goldStageOutliers',
      'goldStagePending',
      'goldTrend',
      'goldWorkers',
      'goldOverSlips',
      'goldUncovered',
      'goldWorkerModal'
    ])
  })

  it('all nodes use known types and registered column kinds', () => {
    nodes.forEach((node) => {
      if (node.selected || node.type === 'slot') return
      expect(BLOCK_TYPES).toContain(node.type)
      ;(node.columns || []).forEach((c) => expect(COLUMN_KINDS).toContain(c.kind))
    })
  })

  it('every static i18n key exists in th', () => {
    const keys = [...collectI18nKeys(goldConfig)]
    expect(keys.length).toBeGreaterThan(50)
    expect(keys.filter((key) => !i18n.global.te(key, 'th'))).toEqual([])
  })

  it('preset i18n keys exist in th and the preset is registered under its name', () => {
    const preset = getTargetPreset(GOLD_TARGET_PRESET_NAME)
    expect(preset).toBeTruthy()
    const keys = [...collectI18nKeys([preset.text, preset.historyColumns])]
    expect(keys.filter((key) => !i18n.global.te(key, 'th'))).toEqual([])
  })

  it('helpParams carries olderThanDays as days', () => {
    expect(goldConfig.helpParams({ olderThanDays: 21 })).toEqual({ days: 21 })
  })
})

describe('gold sources', () => {
  const filter = { ...buildDefaultGoldFilter(), metal: 'GOLD' }
  const state = buildInitialState(goldConfig.state)

  it('Gold body = range/bucket/worker filters/metal; GoldByStage = range/metal; draftTargets only when drafting', () => {
    const gold = goldConfig.sources.Gold.params(
      { ...filter, workerTypes: ['80'], workerCodes: ['W1'] },
      state
    )
    expect(Object.keys(gold).sort()).toEqual([
      'bucket',
      'draftTargets',
      'end',
      'metal',
      'start',
      'workerCodes',
      'workerTypes'
    ])
    expect(gold.workerTypes).toEqual([80])
    expect(gold.draftTargets).toBeUndefined()
    expect(gold.metal).toBe('GOLD')
    const stage = goldConfig.sources.GoldByStage.params(filter, {
      ...state,
      draftTargets: [{ scope: 'STAGE', workerType: 80, metal: 'GOLD', targetPercent: 5 }]
    })
    expect(Object.keys(stage).sort()).toEqual(['draftTargets', 'end', 'metal', 'start'])
    expect(stage.draftTargets).toHaveLength(1)
    expect(goldConfig.sources.GoldLossTargets).toMatchObject({
      endpoint: 'ProductionInsight/GoldLossTargets',
      method: 'get'
    })
  })

  it('one request per endpoint: range/metal -> Gold+GoldByStage; worker filter -> Gold; draft -> Gold+GoldByStage; olderThanDays/trend toggle -> none', () => {
    const before = computeSourceKeys(goldConfig.sources, filter, state)
    const diff = (patch, nextState = state) =>
      diffSourceKeys(
        before,
        computeSourceKeys(goldConfig.sources, { ...filter, ...patch }, nextState)
      ).sort()
    expect(diff({ start: new Date('2026-01-01'), end: new Date('2026-02-01') })).toEqual([
      'Gold',
      'GoldByStage'
    ])
    expect(diff({ metal: 'SILVER' })).toEqual(['Gold', 'GoldByStage'])
    expect(diff({ workerCodes: ['W1'] })).toEqual(['Gold'])
    expect(diff({ workerTypes: ['50'] })).toEqual(['Gold'])
    expect(diff({ olderThanDays: 30 })).toEqual([])
    expect(
      diff({}, { ...state, trendWorkerType: 50, stageDept: 'trim', includeQueue: true })
    ).toEqual([])
    expect(
      diff(
        {},
        {
          ...state,
          draftTargets: [{ scope: 'SLIP', workerType: 80, metal: 'GOLD', targetPercent: 5 }]
        }
      )
    ).toEqual(['Gold', 'GoldByStage'])
  })

  it('onSourceLoaded emits workers-loaded from Gold only', () => {
    const emitted = []
    const emit = (event, payload) => emitted.push([event, payload])
    goldConfig.onSourceLoaded('Gold', { workers: [{ workerCode: 'W1' }] }, emit)
    goldConfig.onSourceLoaded('Gold', {}, emit)
    goldConfig.onSourceLoaded('GoldByStage', { workers: [1] }, emit)
    expect(emitted).toEqual([
      ['workers-loaded', [{ workerCode: 'W1' }]],
      ['workers-loaded', []]
    ])
  })

  it('stageDept keeps the current selection while it still exists, else picks the most-over-target department', () => {
    const resetOn = goldConfig.state.stageDept.resetOn
    expect(
      buildStateResets(goldConfig.state, 'GoldByStage', data.GoldByStage, { stageDept: null })
    ).toEqual({ stageDept: 'setting' })
    expect(resetOn.value(data.GoldByStage, 'plating')).toBe('plating')
    expect(
      resetOn.value(
        { departments: [{ deptKey: 'trim', diffPercent: 1, targetPercent: 5 }] },
        'plating'
      )
    ).toBe('trim')
    expect(resetOn.value({}, null)).toBeNull()
  })
})

describe('metal note', () => {
  const note = goldConfig.blocks[0]

  it('shows when the API forces the metal or the whole page scope is ALL', () => {
    setActivePinia(createPinia())
    useMetalScopeStore().setMetal('GOLD')
    expect(isNodeVisible(note, ctxOf())).toBe(false)
    expect(
      isNodeVisible(note, ctxOf({ data: { ...data, Gold: { ...data.Gold, metalForced: true } } }))
    ).toBe(true)
    useMetalScopeStore().setMetal('ALL')
    expect(isNodeVisible(note, ctxOf())).toBe(true)
  })
})

describe('KPI rows (ช่างฝัง 80 first, then ช่างแต่ง 50)', () => {
  const kpi = blockOf('goldKpi')

  it('two rows of three cards with the metal in the title and as-of', () => {
    const rows = kpi.rows(ctxOf())
    expect(rows.map((r) => r.label)).toEqual([`${G}.workerType.80`, `${G}.workerType.50`])
    expect(kpi.title(ctxOf(), t)).toBe(
      `${t('view.productionInsight.nav.gold')} — ${t(`${G}.metalLabel.GOLD`)}`
    )
    expect(kpi.title(ctxOf({ filter: { metal: 'SILVER' } }), t)).toContain(
      t(`${G}.metalLabel.SILVER`)
    )
    expect(kpi.asOf(ctxOf())).toBe('2026-10-01T08:00:00')
    expect(rows.every((r) => r.cards.length === 3)).toBe(true)
  })

  it('setting row values, subs, tones and report refs', () => {
    const cards = buildKpiCards({ cards: kpi.rows(ctxOf())[0].cards }, ctxOf(), t)
    expect(cards.map((c) => c.value)).toEqual(['3.46%', `12.35 ${t(`${G}.gramUnit`)}`, '80%'])
    expect(cards[0].sub).toBe(t(`${G}.kpiLossPercentSub`, { allowed: '2.5', target: '3' }))
    expect(cards[0].tone).toBe('warning')
    expect(cards[1].label).toBe(t(`${G}.kpiExcessGram`, { metal: t(`${G}.metalLabel.GOLD`) }))
    expect(cards[1].sub).toBe(t(`${G}.kpiExcessGramSub`, { money: '1,234' }))
    expect(cards[1].tone).toBe('warning')
    expect(cards[2].tone).toBe('warning')
    expect(cards.map((c) => c.reportRef)).toEqual(['goldKpi', 'goldOverSlips', 'goldUncovered'])
  })

  it('trim row is green when within target / full coverage, and empty data falls back to dashes', () => {
    const cards = buildKpiCards({ cards: kpi.rows(ctxOf())[1].cards }, ctxOf(), t)
    expect(cards.map((c) => c.tone)).toEqual(['green', 'green', 'green'])
    const empty = buildKpiCards({ cards: kpi.rows(ctxOf())[0].cards }, ctxOf({ data: { Gold: {} } }), t)
    expect(empty.map((c) => c.value)).toEqual(['—', `0 ${t(`${G}.gramUnit`)}`, '—'])
    expect(empty[0].tone).toBe('grey')
  })
})

describe('stage table', () => {
  const stage = blockOf('goldStage')
  const rows = stage.rows(ctxOf())
  const cell = (field, row) =>
    resolveCell(
      stage.columns.find((c) => c.field === field),
      row,
      t,
      ctxOf()
    )
  const settingRow = rows.find((r) => r.deptKey === 'setting')
  const gemRow = rows.find((r) => r.deptKey === 'gemSort')

  it('one row per department with translated label; selection compares deptKey', () => {
    expect(rows.map((r) => r.label)).toEqual(
      departments.map((d) => t(`view.executive.department.${d.deptKey}`))
    )
    const ctx = ctxOf({ state: { stageDept: 'setting' } })
    expect(isRowSelected(stage, ctx, settingRow)).toBe(true)
    expect(isRowSelected(stage, ctx, rows[0])).toBe(false)
  })

  it('send column shows returnedSendGram (not sendGram) with a tip on the header; diff % has its own tip', () => {
    expect(cell('sendGram', settingRow).text).toBe('200.46')
    const sendCol = stage.columns.find((c) => c.field === 'sendGram')
    expect(resolveHeader(sendCol, t, ctxOf())).toBe(t(`${G}.stageColSend`))
    expect(resolveTipText(sendCol, ctxOf(), t)).toBe(
      t('view.productionInsight.help.goldStageSendGram')
    )
    expect(
      resolveTipText(
        stage.columns.find((c) => c.field === 'diffPercent'),
        ctxOf(),
        t
      )
    ).toBe(t('view.productionInsight.help.goldStageDiffPercent'))
  })

  it('trim carries the scrap tip on the label; over-target diff % is red + bold', () => {
    expect(cell('label', rows[0]).tip).toBe(t(`${G}.stageTrimScrapNote`))
    expect(cell('label', settingRow)).toMatchObject({ strong: true })
    expect(cell('label', settingRow).tip).toBeUndefined()
    expect(cell('diffPercent', settingRow)).toMatchObject({
      kind: 'percent',
      text: '5.1%',
      color: 'var(--base-red)',
      bold: true
    })
    expect(cell('diffPercent', rows[0])).toMatchObject({ text: '2%', color: '', bold: false })
  })

  it('not-weighed department: message instead of figures, numeric cells blank', () => {
    expect(cell('diffPercent', gemRow)).toEqual({ kind: 'note', text: t(`${G}.stageNotWeighed`) })
    ;[
      'sendGram',
      'receivedGram',
      'diffGram',
      'targetPercent',
      'slipLossPercent',
      'pending'
    ].forEach((field) => expect(cell(field, gemRow)).toEqual({ kind: 'note', text: '' }))
  })

  it('pending column: two sub-lines (with worker / queue), dash when none', () => {
    const lines = cell('pending', settingRow).lines.map((l) => l.label)
    expect(lines).toEqual([
      t(`${G}.stagePendingWithWorker`, { count: '2', gram: '12.5' }),
      t(`${G}.stagePendingQueue`, { count: '1', gram: '3' })
    ])
    expect(cell('pending', rows[0]).lines).toEqual([])
  })

  it('detail: title with department name, chart filtered to the department with the target line, worker table', () => {
    const ctx = ctxOf({ state: { stageDept: 'setting' } })
    const row = stage.detail.selected(ctx)
    expect(row.deptKey).toBe('setting')
    const detailCtx = { ...ctx, selected: row }
    expect(stage.detail.title(detailCtx, t)).toBe(
      t(`${G}.stageDetailTitle`, { name: t('view.executive.department.setting') })
    )
    const [chart, workers] = stage.detail.blocks
    const points = chart.points(detailCtx)
    expect(points).toHaveLength(2)
    expect(buildTrendSeries(chart.series, points, t)[0].data).toEqual([4, 5])
    const options = buildTrendOptions({
      node: chart,
      points,
      categories: chart.categories(points),
      ctx: detailCtx,
      t
    })
    expect(options.annotations.yaxis[0]).toMatchObject({ y: 3 })
    expect(options.yaxis.labels.formatter(5.123)).toBe('5.12%')
    expect(workers.rows(detailCtx)).toHaveLength(1)
    expect(workers.subtitle).toBe(`${G}.stageWorkerTitle`)
    expect(stage.detail.selected(ctxOf({ state: { stageDept: null } }))).toBeNull()
  })
})

describe('all-department % chart', () => {
  const chart = blockOf('goldStageTrend')

  it('one line per department, palette colours, includesScrap hidden at start', () => {
    const ctx = ctxOf()
    const points = chart.points(ctx)
    expect(points).toEqual(['2026-08-01T00:00:00', '2026-09-01T00:00:00'])
    const defs = resolveSeriesDefs(chart, points, ctx, t)
    expect(defs.map((d) => d.name)).toEqual(
      departments.map((d) => t(`view.executive.department.${d.deptKey}`))
    )
    expect(defs[1].data).toEqual([4, 5])
    expect(defs[0].data).toEqual([null, 2])
    expect(defs.map((d) => !!d.hidden)).toEqual([true, false, false, false])
    const options = buildTrendOptions({
      node: { ...chart, series: defs },
      points,
      categories: [],
      ctx,
      t
    })
    const hidden = []
    options.chart.events.mounted({ hideSeries: (name) => hidden.push(name) })
    expect(hidden).toEqual([t('view.executive.department.trim')])
    expect(options.colors).toHaveLength(4)
    expect(chart.hint(ctx, t)).toBe(t(`${G}.stageTrendTrimHiddenNote`))
  })
})

describe('plan tables', () => {
  const filter = {
    ...buildDefaultGoldFilter(),
    metal: 'SILVER',
    workerTypes: ['80'],
    workerCodes: ['W1'],
    olderThanDays: 30
  }
  const state = buildInitialState(goldConfig.state)
  const ctx = { filter, state, data, loading: {}, t }

  it('every table sends the page metal, range and its own filters', () => {
    const body = (id, nextState = state) =>
      buildPlanTableRequest(
        blockOf(id),
        { ...ctx, state: nextState },
        { take: 50, skip: 0, sort: [] }
      )
    expect(body('goldStageOutliers')).toMatchObject({ metal: 'SILVER', departmentKeys: [] })
    expect(body('goldStageOutliers').start).toBeTruthy()
    expect(body('goldStagePending')).toMatchObject({
      metal: 'SILVER',
      departmentKeys: [],
      olderThanDays: 30,
      includeQueue: false
    })
    expect(body('goldStagePending', { ...state, includeQueue: true }).includeQueue).toBe(true)
    expect(body('goldOverSlips')).toMatchObject({
      metal: 'SILVER',
      workerTypes: [80],
      workerCodes: ['W1']
    })
    expect(body('goldOverSlips').olderThanDays).toBeUndefined()
    expect(body('goldUncovered')).toMatchObject({
      metal: 'SILVER',
      workerTypes: [80],
      workerCodes: ['W1'],
      olderThanDays: 30
    })
  })

  it('includeQueue is the only thing in the pending key that is page state; one change = one new key', () => {
    const node = blockOf('goldStagePending')
    expect(buildResetPagingKey(node, ctx)).not.toBe(
      buildResetPagingKey(node, { ...ctx, state: { ...state, includeQueue: true } })
    )
    expect(node.toolbar.checkbox).toMatchObject({ stateKey: 'includeQueue' })
  })

  it('pending worker cell: queue rows get the hourglass + muted style, worker name under the code', () => {
    const column = blockOf('goldStagePending').columns.find((c) => c.field === 'workerCode')
    expect(
      resolveCell(column, { workerCode: 'CG9K', workerName: '', isQueue: true }, t, ctx)
    ).toMatchObject({ primary: 'CG9K', primaryIcon: 'bi-hourglass-split', muted: true })
    expect(resolveCell(column, { workerCode: 'W1', workerName: 'สมชาย' }, t, ctx)).toMatchObject({
      primary: 'W1',
      secondary: 'สมชาย',
      primaryIcon: '',
      muted: false
    })
    expect(resolveCell(column, {}, t, ctx).primary).toBe('—')
  })

  it('over-slips: hint only on ช่างฝัง rows, request range, net money coloured; uncovered worker = name + code + hint', () => {
    const over = blockOf('goldOverSlips')
    const docCol = over.columns.find((c) => c.field === 'documentNo')
    expect(resolveCell(docCol, { documentNo: 'S1', workerType: 80 }, t, ctx).tip).toBe(
      t(`${G}.overSlipsSettingRowHint`)
    )
    expect(resolveCell(docCol, { documentNo: 'S2', workerType: 50 }, t, ctx).tip).toBeUndefined()
    expect(
      resolveCell(
        over.columns.find((c) => c.field === 'requestRange'),
        { requestDateStart: null, requestDateEnd: null },
        t,
        ctx
      ).text
    ).toBe('— - —')
    const net = over.columns.find((c) => c.field === 'netMoney')
    expect(resolveCell(net, { netMoney: 1500 }, t, ctx)).toMatchObject({
      text: t(`${G}.netMoneyPositive`, { amount: '1,500' }),
      color: 'var(--base-green)',
      bold: true
    })
    expect(resolveCell(net, { netMoney: -20 }, t, ctx)).toMatchObject({
      color: 'var(--base-warning)'
    })
    expect(resolveCell(net, { netMoney: 0 }, t, ctx)).toMatchObject({
      text: '—',
      color: '',
      bold: false
    })
    const worker = blockOf('goldUncovered').columns.find((c) => c.field === 'workerName')
    expect(resolveCell(worker, { workerName: 'สมชาย', workerCode: 'W1' }, t, ctx)).toMatchObject({
      text: 'สมชาย',
      secondary: 'W1',
      tip: t(`${G}.uncoveredWorkerHint`)
    })
    expect(over.title(ctx, t)).toBe(
      t(`${G}.overSlipsTitle`, { metal: t(`${G}.metalLabel.SILVER`) })
    )
  })
})

describe('workers ranking table', () => {
  const workers = blockOf('goldWorkers')

  it('rows from Gold.workers with a stable key, empty text, over-ratio and net money cells', () => {
    const rows = workers.rows(ctxOf())
    expect(rows[0].rowKey).toBe('80-W1')
    expect(workers.emptyText).toBe(`${G}.workersEmpty`)
    expect(workers.rows(ctxOf({ data: { Gold: {} } }))).toEqual([])
    const cell = (field) =>
      resolveCell(
        workers.columns.find((c) => c.field === field),
        rows[0],
        t,
        ctxOf()
      )
    expect(cell('overRatio').text).toBe('2/3')
    expect(cell('workerTypeLabel').text).toBe(t(`${G}.workerType.80`))
    expect(cell('lossPercent').text).toBe('3.1%')
    expect(cell('netMoney').text).toBe(t(`${G}.netMoneyNegative`, { amount: '300' }))
    expect(
      resolveTipText(
        workers.columns.find((c) => c.field === 'overRatio'),
        ctxOf(),
        t
      )
    ).toBe(t('view.productionInsight.help.workersColOverRatio'))
    expect(resolveTableSections(workers)).toHaveLength(1)
  })
})

describe('gold trend chart', () => {
  const trend = blockOf('goldTrend')

  it('points follow the worker-type toggle (state only, no request) and the toggle covers 80/50', () => {
    expect(trend.points(ctxOf()).map((p) => p.workerType)).toEqual([80])
    expect(
      trend.points(ctxOf({ state: { trendWorkerType: 50 } })).map((p) => p.workerType)
    ).toEqual([50])
    expect(trend.toolbar.toggle.options.map((o) => o.value)).toEqual([80, 50])
    expect(trend.toolbar.inline).toBe(true)
    expect(trend.toolbar.actions).toEqual([
      { type: 'targetDrawer', preset: GOLD_TARGET_PRESET_NAME }
    ])
  })

  it('bars grams on the left axis, % lines on the right (allowed dashed), target line on the right axis', () => {
    const ctx = ctxOf()
    const points = trend.points(ctx)
    const defs = resolveSeriesDefs(trend, points, ctx, t)
    expect(defs.map((d) => [d.type, d.axis ?? 0, !!d.dashed])).toEqual([
      ['bar', 0, false],
      ['bar', 0, false],
      ['line', 1, false],
      ['line', 1, true]
    ])
    expect(defs[0].name).toBe(t(`${G}.seriesRawLoss`, { metal: t(`${G}.metalLabel.GOLD`) }))
    expect(buildTrendSeries(defs, points, t).map((s) => s.data[0])).toEqual([5, 4, 3, 2.5])
    const options = buildTrendOptions({
      node: { ...trend, series: defs },
      points,
      categories: trend.categories(points),
      ctx,
      t
    })
    expect(options.yaxis).toHaveLength(4)
    expect(options.yaxis[0].title.text).toBe(t(`${G}.gramUnit`))
    expect(options.yaxis[2]).toMatchObject({ opposite: true, title: { text: '%' } })
    expect(options.yaxis[2].labels.formatter(3.456)).toBe('3.46%')
    expect(options.yaxis[0].labels.formatter(5.678)).toBe('5.68')
    expect(options.annotations.yaxis[0]).toMatchObject({ y: 3, yAxisIndex: 2 })
    expect(options.plotOptions.bar.columnWidth).toBe('45%')
    expect(options.stroke.dashArray).toEqual([0, 0, 0, 6])
  })

  it('draft chip only when the previewed target differs from the saved one', () => {
    expect(
      trend.toolbar.chip(
        ctxOf({
          data: {
            ...data,
            GoldLossTargets: [{ scope: 'SLIP', workerType: 80, metal: 'GOLD', targetPercent: 5 }]
          }
        }),
        t
      )
    ).toBe(t(`${G}.targetDraftChip`))
    expect(trend.toolbar.chip(ctxOf(), t)).toBe('')
    expect(trend.toolbar.chip(ctxOf({ state: { trendWorkerType: 50 } }), t)).toBe('')
  })
})

describe('goldLossTargets preset', () => {
  const preset = getTargetPreset(GOLD_TARGET_PRESET_NAME)

  it('rows: slip 4 (80,50 x GOLD,SILVER) then stage 6, grouped by section and metal, unique keys', () => {
    const rows = buildGoldTargetRows(ctxOf(), t)
    expect(rows).toHaveLength(10)
    expect(new Set(rows.map((r) => r.key)).size).toBe(10)
    expect(rows.slice(0, 4).map((r) => r.key)).toEqual([
      'SLIP:80-GOLD',
      'SLIP:50-GOLD',
      'SLIP:80-SILVER',
      'SLIP:50-SILVER'
    ])
    expect(rows.slice(4).map((r) => r.key)).toEqual([
      'STAGE:60-GOLD',
      'STAGE:80-GOLD',
      'STAGE:90-GOLD',
      'STAGE:60-SILVER',
      'STAGE:80-SILVER',
      'STAGE:90-SILVER'
    ])
    expect(rows[0].section).toBe(t(`${G}.targetSlipSectionTitle`))
    expect(rows[4].section).toBe(t(`${G}.targetStageSectionTitle`))
    expect(rows[0].group).toBe(t(`${G}.metalLabel.GOLD`))
    expect(rows[2].group).toBe(t(`${G}.metalLabel.SILVER`))
    expect(rows[5].label).toBe(t('view.executive.department.setting'))
    expect(rows[0].historyLabel).toBe(`${t(`${G}.workerType.80`)} — ${t(`${G}.metalLabel.GOLD`)}`)
  })

  it('reference text only for the metal being viewed (slip: Gold.kpi loss %, stage: GoldByStage diff %)', () => {
    const rows = buildGoldTargetRows(ctxOf(), t)
    expect(preset.referenceText(rows[0], ctxOf(), t)).toBe(
      t(`${G}.targetReferenceText`, { percent: '3.46%' })
    )
    expect(preset.referenceText(rows[2], ctxOf(), t)).toBe('')
    const stageSetting = rows.find((r) => r.key === 'STAGE:80-GOLD')
    expect(preset.referenceText(stageSetting, ctxOf(), t)).toBe(
      t(`${G}.targetReferenceText`, { percent: '5.1%' })
    )
  })

  it('saved map is split by scope and read-only text shows the saved percent', () => {
    expect(buildGoldTargetSavedMap(ctxOf())).toEqual({
      'SLIP:80-GOLD': 3,
      'SLIP:50-GOLD': 2,
      'STAGE:80-GOLD': 3
    })
    const rows = buildGoldTargetRows(ctxOf(), t)
    expect(preset.savedText(rows[0])).toBe('3%')
    expect(preset.savedText(rows[2])).toBe('—%')
  })

  it('save payload = every numeric row of both scopes (slip first); draft payload = only the scope(s) that changed', () => {
    const saved = buildGoldTargetSavedMap(ctxOf())
    const draft = { ...saved, 'SLIP:80-GOLD': 4, 'STAGE:80-GOLD': 3, 'STAGE:60-GOLD': NaN }
    expect(buildGoldTargetSavePayload(draft)).toEqual([
      { scope: 'SLIP', workerType: 80, metal: 'GOLD', targetPercent: 4 },
      { scope: 'SLIP', workerType: 50, metal: 'GOLD', targetPercent: 2 },
      { scope: 'STAGE', workerType: 80, metal: 'GOLD', targetPercent: 3 }
    ])
    expect(
      buildGoldTargetDraftPayload({ ...saved, 'SLIP:80-GOLD': 4 }, saved).map((item) => item.scope)
    ).toEqual(['SLIP', 'SLIP'])
    const both = buildGoldTargetDraftPayload(
      { ...saved, 'SLIP:80-GOLD': 4, 'STAGE:80-GOLD': 6 },
      saved
    )
    expect(both.map((item) => item.scope)).toEqual(['SLIP', 'SLIP', 'STAGE'])
  })

  it('draft emission: unchanged = empty, changed = combined array that feeds both Gold and GoldByStage', () => {
    const saved = buildGoldTargetSavedMap(ctxOf())
    expect(buildDraftEmission(preset, { ...saved }, saved)).toEqual([])
    const emission = buildDraftEmission(preset, { ...saved, 'STAGE:80-GOLD': 7 }, saved)
    expect(emission).toEqual([{ scope: 'STAGE', workerType: 80, metal: 'GOLD', targetPercent: 7 }])
    expect(preset.draftStateKey).toBe('draftTargets')
    expect(preset.reloadSources).toEqual(['Gold', 'GoldByStage', 'GoldLossTargets'])
    expect(preset.hasChanges({ 'SLIP:80-GOLD': 3 }, { 'SLIP:80-GOLD': 3 })).toBe(false)
  })

  it('history and save go through the existing store actions with scope/workerType/metal', async () => {
    const calls = []
    const store = {
      fetchGoldLossTargetHistory: async (...args) => calls.push(['history', ...args]),
      saveGoldLossTargets: async (payload) => calls.push(['save', payload])
    }
    const row = buildGoldTargetRows(ctxOf(), t).find((r) => r.key === 'STAGE:90-SILVER')
    await preset.history(store, row.key, row)
    await preset.save(store, { items: [1], remark: 'r' })
    expect(calls).toEqual([
      ['history', 90, 'SILVER', 'STAGE'],
      ['save', { items: [1], remark: 'r' }]
    ])
  })
})

describe('lens (มุมมอง) — block matrix', () => {
  const lensCtx = (lens, state = {}) => ctxOf({ filter: { lens }, state })
  const visible = (id, lens) => isNodeVisible(blockOf(id), lensCtx(lens))
  const collapsedByDefault = (id, lens) => blockOf(id).collapsedByDefault(lensCtx(lens))
  const stageTrend = blockOf('goldStageTrend')
  const COLLAPSIBLE = [
    'goldStageOutliers',
    'goldStagePending',
    'goldWorkers',
    'goldOverSlips',
    'goldUncovered'
  ]

  it('overview lens: everything visible, only the deep-dive blocks are collapsible and start collapsed', () => {
    ;[
      'goldKpi',
      'goldStage',
      'goldStageTrend',
      'goldStageOutliers',
      'goldStagePending',
      'goldTrend',
      'goldWorkers',
      'goldOverSlips',
      'goldUncovered'
    ].forEach((id) => expect(visible(id, 'all'), id).toBe(true))
    COLLAPSIBLE.forEach((id) => {
      expect(blockOf(id).collapsible, id).toBe(true)
      expect(collapsedByDefault(id, 'all'), id).toBe(true)
    })
    ;['goldKpi', 'goldStage', 'goldStageTrend', 'goldTrend'].forEach((id) =>
      expect(blockOf(id).collapsible, id).toBeUndefined()
    )
  })

  it('setting/tang show everything expanded; dept hides KPI, stage trend, gold trend, workers, over slips, uncovered', () => {
    ;['setting', 'tang'].forEach((lens) => {
      COLLAPSIBLE.forEach((id) => {
        expect(visible(id, lens), `${lens}/${id}`).toBe(true)
        expect(collapsedByDefault(id, lens), `${lens}/${id}`).toBe(false)
      })
    })
    ;[
      'goldKpi',
      'goldStageTrend',
      'goldTrend',
      'goldWorkers',
      'goldOverSlips',
      'goldUncovered'
    ].forEach((id) => expect(visible(id, 'dept'), id).toBe(false))
    ;['goldStage', 'goldStageOutliers', 'goldStagePending'].forEach((id) =>
      expect(visible(id, 'dept'), id).toBe(true)
    )
    expect(collapsedByDefault('goldStageOutliers', 'dept')).toBe(false)
  })

  it('changing the lens resets what the user toggled (collapseResetKey follows the lens)', () => {
    expect(blockOf('goldWorkers').collapseResetKey(lensCtx('setting'))).toBe('setting')
    expect(blockOf('goldWorkers').collapseResetKey(lensCtx('all'))).toBe('all')
  })

  it('KPI rows: all = 80 then 50, setting = 80 only, tang = 50 only, with the matching SLIP strip', () => {
    const kpi = blockOf('goldKpi')
    expect(kpi.rows(lensCtx('all')).map((r) => r.id)).toEqual(['kpi80', 'kpi50'])
    expect(kpi.rows(lensCtx('setting')).map((r) => r.id)).toEqual(['kpi80'])
    expect(kpi.rows(lensCtx('tang')).map((r) => r.id)).toEqual(['kpi50'])
    expect(kpi.sourceStrip(lensCtx('setting'))).toBe('slip-setter')
    expect(kpi.sourceStrip(lensCtx('tang'))).toBe('slip-tang')
    expect(kpi.sourceStrip(lensCtx('all'))).toBe('slip')
  })

  it('stage table: all/dept = every department, setting = setting only, tang = trim only; always the PLAN strip', () => {
    const stage = blockOf('goldStage')
    const deptKeys = (lens) => stage.rows(lensCtx(lens)).map((r) => r.deptKey)
    expect(stage.sourceStrip).toBe('plan')
    expect(deptKeys('all')).toEqual(['trim', 'setting', 'gemSort', 'plating'])
    expect(deptKeys('dept')).toEqual(['trim', 'setting', 'gemSort', 'plating'])
    expect(deptKeys('setting')).toEqual(['setting'])
    expect(deptKeys('tang')).toEqual(['trim'])
  })

  it('stage selection: locked lenses select their own department (detail + highlight), others follow the clicked row', () => {
    const stage = blockOf('goldStage')
    const rowOf = (ctx, key) => stage.rows(ctx).find((r) => r.deptKey === key)
    const settingCtx = lensCtx('setting', { stageDept: 'plating' })
    expect(stage.detail.selected(settingCtx).deptKey).toBe('setting')
    expect(isRowSelected(stage, settingCtx, rowOf(settingCtx, 'setting'))).toBe(true)
    const tangCtx = lensCtx('tang', { stageDept: null })
    expect(stage.detail.selected(tangCtx).deptKey).toBe('trim')
    expect(isRowSelected(stage, tangCtx, rowOf(tangCtx, 'trim'))).toBe(true)
    const deptCtx = lensCtx('dept', { stageDept: 'plating' })
    expect(stage.detail.selected(deptCtx).deptKey).toBe('plating')
    expect(isRowSelected(stage, deptCtx, rowOf(deptCtx, 'plating'))).toBe(true)
    expect(isRowSelected(stage, deptCtx, rowOf(deptCtx, 'setting'))).toBe(false)
  })

  it('stage trend: one line for setting/tang (trim not hidden), all lines with trim hidden for all; title names the department', () => {
    const defsOf = (lens) => {
      const ctx = lensCtx(lens)
      return resolveSeriesDefs(stageTrend, stageTrend.points(ctx), ctx, t)
    }
    expect(defsOf('all').map((d) => !!d.hidden)).toEqual([true, false, false, false])
    expect(defsOf('setting').map((d) => d.name)).toEqual([t('view.executive.department.setting')])
    expect(defsOf('setting')[0].data).toEqual([4, 5])
    expect(defsOf('tang').map((d) => !!d.hidden)).toEqual([false])
    expect(defsOf('tang')[0].data).toEqual([2])
    expect(stageTrend.points(lensCtx('tang'))).toEqual(['2026-09-01T00:00:00'])
    expect(defsOf('setting')[0].colorValue).toBe(defsOf('all')[1].colorValue)
    expect(stageTrend.title(lensCtx('all'), t)).toBe(t(`${G}.stageTrendTitle`))
    expect(stageTrend.title(lensCtx('tang'), t)).toBe(
      t(`${G}.stageTrendTitleOne`, { name: t('view.executive.department.trim') })
    )
    expect(stageTrend.hint(lensCtx('tang'), t)).toBe('')
    expect(stageTrend.hint(lensCtx('all'), t)).toBe(t(`${G}.stageTrendTrimHiddenNote`))
  })

  it('outliers/pending departmentKeys: all = [], setting = [setting], tang = [trim], dept = [selected department]', () => {
    const body = (id, lens, state = {}) =>
      buildPlanTableRequest(blockOf(id), lensCtx(lens, state), { take: 50, skip: 0, sort: [] })
        .departmentKeys
    ;['goldStageOutliers', 'goldStagePending'].forEach((id) => {
      expect(body(id, 'all', { stageDept: 'plating' }), id).toEqual([])
      expect(body(id, 'setting', { stageDept: 'plating' }), id).toEqual(['setting'])
      expect(body(id, 'tang'), id).toEqual(['trim'])
      expect(body(id, 'dept', { stageDept: 'plating' }), id).toEqual(['plating'])
    })
    const node = blockOf('goldStageOutliers')
    const keyOf = (lens, stageDept) => buildResetPagingKey(node, lensCtx(lens, { stageDept }))
    expect(keyOf('dept', 'plating')).not.toBe(keyOf('dept', 'setting'))
    expect(keyOf('all', 'plating')).toBe(keyOf('all', 'setting'))
  })

  it('gold trend: points follow the lens, the 80/50 toggle is hidden when the lens locks the type, target follows too', () => {
    const trend = blockOf('goldTrend')
    const types = (lens, trendWorkerType) =>
      trend.points(lensCtx(lens, { trendWorkerType })).map((p) => p.workerType)
    expect(types('setting', 50)).toEqual([80])
    expect(types('tang', 80)).toEqual([50])
    expect(types('all', 50)).toEqual([50])
    expect(trend.toolbar.toggle.visible(lensCtx('all'))).toBe(true)
    expect(trend.toolbar.toggle.visible(lensCtx('dept'))).toBe(true)
    expect(trend.toolbar.toggle.visible(lensCtx('setting'))).toBe(false)
    expect(trend.toolbar.toggle.visible(lensCtx('tang'))).toBe(false)
    expect(trend.targetLine.value(lensCtx('tang', { trendWorkerType: 80 }))).toBe(2)
    expect(trend.targetLine.value(lensCtx('setting', { trendWorkerType: 50 }))).toBe(3)
  })

  it('workers ranking: all = both types, setting = 80 only, tang = 50 only', () => {
    const workers = blockOf('goldWorkers')
    const mixed = {
      ...data,
      Gold: {
        ...data.Gold,
        workers: [
          ...data.Gold.workers,
          { ...data.Gold.workers[0], workerType: 50, workerCode: 'T1' }
        ]
      }
    }
    const rowsOf = (lens) =>
      workers.rows(ctxOf({ filter: { lens }, data: mixed })).map((r) => r.rowKey)
    expect(rowsOf('all')).toEqual(['80-W1', '50-T1'])
    expect(rowsOf('setting')).toEqual(['80-W1'])
    expect(rowsOf('tang')).toEqual(['50-T1'])
  })

  it('Gold/over-slips/uncovered workerTypes: the lens wins over the drawer value, the drawer value applies otherwise', () => {
    const state = buildInitialState(goldConfig.state)
    const filterOf = (lens, workerTypes) => ({
      ...buildDefaultGoldFilter(),
      metal: 'GOLD',
      lens,
      workerTypes
    })
    const goldTypes = (lens, workerTypes) =>
      goldConfig.sources.Gold.params(filterOf(lens, workerTypes), state).workerTypes
    expect(goldTypes('setting', ['50'])).toEqual([80])
    expect(goldTypes('tang', [])).toEqual([50])
    expect(goldTypes('all', ['50'])).toEqual([50])
    expect(goldTypes('dept', [])).toEqual([])
    const tableTypes = (id, lens, workerTypes) =>
      buildPlanTableRequest(
        blockOf(id),
        { filter: filterOf(lens, workerTypes), state, data, loading: {}, t },
        { take: 50, skip: 0, sort: [] }
      ).workerTypes
    ;['goldOverSlips', 'goldUncovered'].forEach((id) => {
      expect(tableTypes(id, 'setting', ['50']), id).toEqual([80])
      expect(tableTypes(id, 'tang', []), id).toEqual([50])
      expect(tableTypes(id, 'all', ['80']), id).toEqual([80])
    })
  })

  it('switching the lens refetches only what depends on it: Gold when the worker type changes, never GoldByStage', () => {
    const state = buildInitialState(goldConfig.state)
    const keysOf = (lens) =>
      computeSourceKeys(
        goldConfig.sources,
        { ...buildDefaultGoldFilter(), metal: 'GOLD', lens },
        state
      )
    expect(diffSourceKeys(keysOf('all'), keysOf('setting'))).toEqual(['Gold'])
    expect(diffSourceKeys(keysOf('setting'), keysOf('tang'))).toEqual(['Gold'])
    expect(diffSourceKeys(keysOf('all'), keysOf('dept'))).toEqual([])
  })
})

describe('config stays out of Vue reactivity (data()/props wrap it)', () => {
  it('the config and its slot components are raw, so reactive() does not proxy them', () => {
    const wrapped = reactive({ config: goldConfig })
    expect(isReactive(wrapped.config)).toBe(false)
    expect(isReactive(wrapped.config.blocks)).toBe(false)
    const slots = goldConfig.blocks.filter((b) => b.type === 'slot')
    expect(slots.map((b) => b.id)).toEqual(['goldDeptPicker', 'goldWorkerModal'])
    slots.forEach((slot) => expect(isReactive(reactive({ node: slot }).node.component), slot.id).toBe(false))
    slots.forEach((slot) => expect(isReactive(reactive({ c: slot.component }).c), slot.id).toBe(false))
  })
})

describe('worker drill-down entry points', () => {
  const stage = blockOf('goldStage')
  const [, stageWorkers] = stage.detail.blocks
  const workers = blockOf('goldWorkers')
  const setState = (ctx) => {
    ctx.setState = (key, value) => {
      ctx.state[key] = value
    }
    return ctx
  }

  it('worker-code cells are keyboard-reachable buttons: ranking rows always, stage rows only for departments with a slip worker type', () => {
    const rankingCol = workers.columns.find((c) => c.field === 'workerCode')
    const row = { workerType: 80, workerCode: 'W1', workerName: 'ช่าง' }
    expect(resolveCell(rankingCol, row, t, ctxOf()).asAction).toBe(true)

    const stageCol = stageWorkers.columns.find((c) => c.field === 'workerCode')
    const stageRow = { workerCode: 'W9' }
    const detailCtx = (deptKey) => ({ ...ctxOf(), selected: { deptKey } })
    expect(resolveCell(stageCol, stageRow, t, detailCtx('setting')).asAction).toBe(true)
    expect(resolveCell(stageCol, stageRow, t, detailCtx('trim')).asAction).toBe(true)
    expect(resolveCell(stageCol, stageRow, t, detailCtx('plating')).asAction).toBeUndefined()
    expect(resolveCell(stageCol, stageRow, t, detailCtx('rawPolish')).asAction).toBeUndefined()
  })

  it('row click and cell button open the same modal state; unsupported departments do nothing', () => {
    const rankingCtx = setState(ctxOf())
    workers.onRowClick({ workerType: 50, workerCode: 'T1', workerName: 'ต' }, rankingCtx)
    expect(rankingCtx.state.workerModal).toEqual({ workerType: 50, workerCode: 'T1', workerName: 'ต' })

    const settingCtx = setState({ ...ctxOf(), selected: { deptKey: 'setting' } })
    stageWorkers.onRowClick({ workerCode: 'W9' }, settingCtx)
    expect(settingCtx.state.workerModal).toEqual({ workerType: 80, workerCode: 'W9', workerName: '' })

    const platingCtx = setState({ ...ctxOf(), selected: { deptKey: 'plating' } })
    stageWorkers.onRowClick({ workerCode: 'W9' }, platingCtx)
    expect(platingCtx.state.workerModal).toBeNull()
  })

  it('the modal slot reads state.workerModal and its events close it / push the page filter', () => {
    const slot = blockOf('goldWorkerModal')
    const ctx = setState({ ...ctxOf({ state: { workerModal: { workerType: 80, workerCode: 'W1' } } }), updateFilter: vi.fn() })
    expect(slot.props(ctx)).toMatchObject({ isShow: true, worker: { workerCode: 'W1' }, pageFilter: ctx.filter })
    expect(slot.props(ctxOf()).isShow).toBe(false)
    slot.events['apply-filter'](ctx, { workerTypes: ['80'], workerCodes: ['W1'] })
    expect(ctx.updateFilter).toHaveBeenCalledWith({ workerTypes: ['80'], workerCodes: ['W1'] })
    expect(ctx.state.workerModal).toBeNull()
    ctx.state.workerModal = { workerType: 80, workerCode: 'W1' }
    slot.events.closeModal(ctx)
    expect(ctx.state.workerModal).toBeNull()
  })

  it('findings hook uses the lens and the effective stage department', () => {
    const items = [
      { code: 'A', params: { workerType: 80 } },
      { code: 'B', params: { deptKey: 'plating' } },
      { code: 'C', params: {} }
    ]
    const run = (lens, stageDept) => goldConfig.filterFindings(items, { lens }, { stageDept }).map((i) => i.code)
    expect(run('all', null)).toEqual(['A', 'B', 'C'])
    expect(run('setting', 'plating')).toEqual(['A', 'C'])
    expect(run('dept', 'plating')).toEqual(['B', 'C'])
  })

  it('department picker only shows in the dept lens, lists weighed departments and writes stageDept', () => {
    const picker = blockOf('goldDeptPicker')
    expect(isNodeVisible(picker, ctxOf({ filter: { lens: 'dept' } }))).toBe(true)
    expect(isNodeVisible(picker, ctxOf({ filter: { lens: 'all' } }))).toBe(false)
    const props = picker.props(ctxOf({ filter: { lens: 'dept' }, state: { stageDept: 'setting' } }))
    expect(props.options.map((o) => o.value)).toEqual(['trim', 'setting', 'plating'])
    expect(props.modelValue).toBe('setting')
    const ctx = setState(ctxOf({ filter: { lens: 'dept' } }))
    picker.events['update:modelValue'](ctx, 'plating')
    expect(ctx.state.stageDept).toBe('plating')
  })
})
