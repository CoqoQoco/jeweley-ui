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
import { validateTabConfig, findTabForReportRef, blocksForTab, hasTabs, isSourceTabGated } from '@/components/insight/page/insight-tabs-helpers.js'
import { resolveGoldReportTarget } from './gold-tab-helpers.js'
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

  it('block ids are unique and every reportRef the API sends resolves to a tab', () => {
    const ids = collectBlockIds([...goldConfig.blocks, ...goldConfig.floating])
    expect(findDuplicates(ids)).toEqual([])
    GOLD_REPORT_REFS.forEach((ref) => expect(findTabForReportRef(goldConfig, ref) || resolveGoldReportTarget(ref, {}, []), `reportRef ${ref}`).toBeTruthy())
  })

  it('top-level blocks in tab order; the worker modal floats outside the tabs', () => {
    expect(goldConfig.blocks.map((b) => b.id ?? b.type)).toEqual([
      'note',
      'goldKpi',
      'goldKpiTang',
      'goldTrendTang',
      'goldWorkersTang',
      'goldKpiSetting',
      'goldTrendSetting',
      'goldWorkersSetting',
      'goldDeptPicker',
      'goldStage',
      'goldStageTrend',
      'dueSwitch',
      'dueScopeSwitch',
      'goldOverSlips',
      'goldUncovered',
      'goldStageOutliers',
      'goldStagePending'
    ])
    expect(goldConfig.floating.map((b) => b.id)).toEqual(['goldWorkerModal'])
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

describe('workers ranking table (per worker type)', () => {
  const workers = blockOf('goldWorkersSetting')

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

  it('each tab shows only its own worker type', () => {
    const mixed = { ...data, Gold: { ...data.Gold, workers: [...data.Gold.workers, { ...data.Gold.workers[0], workerType: 50, workerCode: 'T1' }] } }
    const rowsOf = (id) => blockOf(id).rows(ctxOf({ data: mixed })).map((r) => r.rowKey)
    expect(rowsOf('goldWorkersSetting')).toEqual(['80-W1'])
    expect(rowsOf('goldWorkersTang')).toEqual(['50-T1'])
  })
})

describe('gold trend chart (one per worker type, no 80/50 toggle)', () => {
  const trend = blockOf('goldTrendSetting')
  const tangTrend = blockOf('goldTrendTang')

  it('points are fixed to the tab worker type; no type toggle; target drawer kept', () => {
    expect(trend.points(ctxOf()).map((p) => p.workerType)).toEqual([80])
    expect(tangTrend.points(ctxOf()).map((p) => p.workerType)).toEqual([50])
    expect(trend.toolbar.toggle).toBeUndefined()
    expect(trend.toolbar.inline).toBe(true)
    expect(trend.toolbar.actions).toEqual([{ type: 'targetDrawer', preset: GOLD_TARGET_PRESET_NAME }])
    expect(tangTrend.toolbar.actions).toEqual([{ type: 'targetDrawer', preset: GOLD_TARGET_PRESET_NAME }])
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
    const options = buildTrendOptions({ node: { ...trend, series: defs }, points, categories: trend.categories(points), ctx, t })
    expect(options.yaxis).toHaveLength(4)
    expect(options.yaxis[0].title.text).toBe(t(`${G}.gramUnit`))
    expect(options.yaxis[2]).toMatchObject({ opposite: true, title: { text: '%' } })
    expect(options.yaxis[2].labels.formatter(3.456)).toBe('3.46%')
    expect(options.yaxis[0].labels.formatter(5.678)).toBe('5.68')
    expect(options.annotations.yaxis[0]).toMatchObject({ y: 3, yAxisIndex: 2 })
    expect(options.plotOptions.bar.columnWidth).toBe('45%')
    expect(options.stroke.dashArray).toEqual([0, 0, 0, 6])
  })

  it('target line follows the tab type; draft chip only when the previewed target differs from the saved one', () => {
    expect(trend.targetLine.value(ctxOf())).toBe(3)
    expect(tangTrend.targetLine.value(ctxOf())).toBe(2)
    const drafted = ctxOf({ data: { ...data, GoldLossTargets: [{ scope: 'SLIP', workerType: 80, metal: 'GOLD', targetPercent: 5 }] } })
    expect(trend.toolbar.chip(drafted, t)).toBe(t(`${G}.targetDraftChip`))
    expect(trend.toolbar.chip(ctxOf(), t)).toBe('')
    expect(tangTrend.toolbar.chip(drafted, t)).toBe('')
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

describe('gold tabs (opt-in tab mode)', () => {
  it('opts in with the 5 data tabs in order and every top-level block names one of them', () => {
    expect(hasTabs(goldConfig)).toBe(true)
    expect(goldConfig.tabs.map((tab) => tab.key)).toEqual(['overview', 'tang', 'setting', 'dept', 'due'])
    expect(validateTabConfig(goldConfig)).toEqual([])
  })

  it('tab, toggle and scope labels exist in th', () => {
    goldConfig.tabs.forEach((tab) => expect(i18n.global.te(tab.label, 'th'), tab.label).toBe(true))
    ;['dueSwitchAria', 'dueScopeAria', 'dueOptions.overSlips', 'dueOptions.uncovered', 'dueOptions.outliers', 'dueOptions.pending'].forEach((key) => expect(i18n.global.te(`${G}.tabs.${key}`, 'th'), key).toBe(true))
    ;['all', 'setting', 'tang'].forEach((key) => expect(i18n.global.te(`${G}.lens.${key}`, 'th'), key).toBe(true))
  })

  it('top-level blocks per tab: each tab holds little', () => {
    const ids = (key) => blocksForTab(goldConfig, key).map((n) => n.id || n.type)
    expect(ids('overview')).toEqual(['note', 'goldKpi'])
    expect(ids('tang')).toEqual(['goldKpiTang', 'goldTrendTang', 'goldWorkersTang'])
    expect(ids('setting')).toEqual(['goldKpiSetting', 'goldTrendSetting', 'goldWorkersSetting'])
    expect(ids('dept')).toEqual(['goldDeptPicker', 'goldStage', 'goldStageTrend'])
    expect(ids('due')).toEqual(['dueSwitch', 'dueScopeSwitch', 'goldOverSlips', 'goldUncovered', 'goldStageOutliers', 'goldStagePending'])
  })

  it('KPI rows: overview = 80 then 50; tang tab = row 50; setting tab = row 80; links carry the row worker type', () => {
    expect(blockOf('goldKpi').rows(ctxOf()).map((r) => r.id)).toEqual(['kpi80', 'kpi50'])
    expect(blockOf('goldKpiTang').rows.map((r) => r.id)).toEqual(['kpi50'])
    expect(blockOf('goldKpiSetting').rows.map((r) => r.id)).toEqual(['kpi80'])
    blockOf('goldKpi').rows(ctxOf()).forEach((row, i) => row.cards.forEach((card) => expect(card.reportParams, card.id).toEqual({ workerType: [80, 50][i] })))
    expect(blockOf('goldKpiTang').sourceStrip).toBe('slip-tang')
    expect(blockOf('goldKpiSetting').sourceStrip).toBe('slip-setter')
    expect(blockOf('goldKpi').sourceStrip(ctxOf())).toBe('slip')
    expect(blockOf('goldStage').sourceStrip).toBe('plan')
  })

  it('Gold and GoldByStage stay eager; GoldLossTargets loads with the tang or setting tab', () => {
    expect(goldConfig.sources.Gold.tab).toBeUndefined()
    expect(goldConfig.sources.GoldByStage.tab).toBeUndefined()
    expect(isSourceTabGated(goldConfig.sources.GoldLossTargets, [])).toBe(true)
    expect(isSourceTabGated(goldConfig.sources.GoldLossTargets, ['dept'])).toBe(true)
    expect(isSourceTabGated(goldConfig.sources.GoldLossTargets, ['tang'])).toBe(false)
    expect(isSourceTabGated(goldConfig.sources.GoldLossTargets, ['setting'])).toBe(false)
  })

  it('the tab bar shows all findings: no lens-based finding filter any more', () => {
    expect(goldConfig.filterFindings).toBeUndefined()
  })

  it('the dept tab shows every department (picker + selectable table + all-department chart)', () => {
    const stage = blockOf('goldStage')
    expect(stage.rows(ctxOf()).map((r) => r.deptKey)).toEqual(['trim', 'setting', 'gemSort', 'plating'])
    const picker = blockOf('goldDeptPicker')
    const props = picker.props(ctxOf({ state: { stageDept: 'setting' } }))
    expect(props.options.map((o) => o.value)).toEqual(['trim', 'setting', 'plating'])
    expect(props.modelValue).toBe('setting')
    const ctx = { ...ctxOf(), setState: (k, v) => (ctx.state[k] = v) }
    picker.events['update:modelValue'](ctx, 'plating')
    expect(ctx.state.stageDept).toBe('plating')
    expect(stage.detail.selected(ctxOf({ state: { stageDept: 'plating' } })).deptKey).toBe('plating')
  })

  it('due tab: one table at a time (worst first, default overSlips) and the scope drives request bodies', () => {
    const state = buildInitialState(goldConfig.state)
    expect(state.dueTable).toBe('overSlips')
    expect(state.dueScope).toBe('all')
    const visibleIds = (dueTable) => ['goldOverSlips', 'goldUncovered', 'goldStageOutliers', 'goldStagePending'].filter((id) => blockOf(id).visible({ state: { ...state, dueTable } }))
    expect(visibleIds('overSlips')).toEqual(['goldOverSlips'])
    expect(visibleIds('uncovered')).toEqual(['goldUncovered'])
    expect(visibleIds('outliers')).toEqual(['goldStageOutliers'])
    expect(visibleIds('pending')).toEqual(['goldStagePending'])
    const body = (id, dueScope, workerTypes = []) =>
      buildPlanTableRequest(blockOf(id), { filter: { ...buildDefaultGoldFilter(), metal: 'GOLD', workerTypes }, state: { ...state, dueScope }, data, loading: {}, t }, { take: 50, skip: 0, sort: [] })
    expect(body('goldOverSlips', 'all', ['50']).workerTypes).toEqual([50])
    expect(body('goldOverSlips', 'setting', ['50']).workerTypes).toEqual([80])
    expect(body('goldUncovered', 'tang').workerTypes).toEqual([50])
    expect(body('goldStageOutliers', 'all').departmentKeys).toEqual([])
    expect(body('goldStageOutliers', 'setting').departmentKeys).toEqual(['setting'])
    expect(body('goldStagePending', 'tang').departmentKeys).toEqual(['trim'])
    const switchBlock = blockOf('dueSwitch')
    expect(switchBlock.props({ state, t: (k) => k }).options.map((o) => o.value)).toEqual(['overSlips', 'uncovered', 'outliers', 'pending'])
    expect(blockOf('dueScopeSwitch').props({ state, t: (k) => k }).options.map((o) => o.value)).toEqual(['all', 'setting', 'tang'])
    const next = { ...state }
    switchBlock.events['update:modelValue']({ setState: (k, v) => (next[k] = v) }, 'pending')
    expect(next.dueTable).toBe('pending')
  })

  it('changing the due table or scope never refetches Gold / GoldByStage', () => {
    const state = buildInitialState(goldConfig.state)
    const filter = { ...buildDefaultGoldFilter(), metal: 'GOLD' }
    const before = computeSourceKeys(goldConfig.sources, filter, state)
    expect(diffSourceKeys(before, computeSourceKeys(goldConfig.sources, filter, { ...state, dueTable: 'pending', dueScope: 'tang', includeQueue: true }))).toEqual([])
  })

  it('reportRef → tab: static ids, and the finding/KPI resolver (workerType / deptKey)', () => {
    const tab = (ref, params = {}) => goldConfig.tabFor(ref, params, ctxOf())
    expect(tab('goldKpi')).toMatchObject({ tab: 'overview' })
    expect(tab('goldKpi', { workerType: 50 })).toMatchObject({ tab: 'tang', anchor: 'goldKpiTang' })
    expect(tab('goldKpi', { workerType: 80 })).toMatchObject({ tab: 'setting', anchor: 'goldKpiSetting' })
    expect(tab('goldOverSlips', { workerType: 80 }).reveal).toEqual([{ stateKey: 'dueTable', value: 'overSlips' }, { stateKey: 'dueScope', value: 'setting' }])
    expect(tab('goldStage', { deptKey: 'plating' })).toEqual({ tab: 'dept', reveal: [{ stateKey: 'stageDept', value: 'plating' }] })
    ;['goldStage', 'goldStageTrend', 'goldOverSlips', 'goldUncovered', 'goldStageOutliers', 'goldStagePending'].forEach((id) => expect(findTabForReportRef(goldConfig, id)?.tab, id).toBeTruthy())
    expect(findTabForReportRef(goldConfig, 'goldStageOutliers')).toMatchObject({ tab: 'due', reveal: { stateKey: 'dueTable', value: 'outliers' } })
  })
})

describe('config stays out of Vue reactivity (data()/props wrap it)', () => {
  it('the config and its slot components are raw, so reactive() does not proxy them', () => {
    const wrapped = reactive({ config: goldConfig })
    expect(isReactive(wrapped.config)).toBe(false)
    expect(isReactive(wrapped.config.blocks)).toBe(false)
    const slots = [...goldConfig.blocks, ...goldConfig.floating].filter((b) => b.type === 'slot')
    expect(slots.map((b) => b.id)).toEqual(['goldDeptPicker', 'dueSwitch', 'dueScopeSwitch', 'goldWorkerModal'])
    slots.forEach((slot) => expect(isReactive(reactive({ node: slot }).node.component), slot.id).toBe(false))
    slots.forEach((slot) => expect(isReactive(reactive({ c: slot.component }).c), slot.id).toBe(false))
  })
})

describe('worker drill-down entry points', () => {
  const stage = blockOf('goldStage')
  const [, stageWorkers] = stage.detail.blocks
  const workers = blockOf('goldWorkersSetting')
  const tangWorkers = blockOf('goldWorkersTang')
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
    expect(resolveCell(tangWorkers.columns.find((c) => c.field === 'workerCode'), row, t, ctxOf()).asAction).toBe(true)

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
    const slot = goldConfig.floating.find((b) => b.id === 'goldWorkerModal')
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
})
