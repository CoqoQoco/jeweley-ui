// wip.config.spec.js — sanity ของ config หมวด wip: id/reportRef ไม่ซ้ำและครบ, ทุก i18n key ที่ config อ้างมีจริง,
// source/state/preset ที่ block อ้างต้องมีใน config, params ของแต่ละ source คำนวณจาก filter เริ่มต้นได้
import { describe, it, expect, vi } from 'vitest'
import { createI18n } from 'vue-i18n'

vi.mock('@/services/permission/standard-edit-access.js', () => ({ hasStandardEditAccess: () => true }))

import productionInsightTh from '@/language/view/production-insight/th.js'
import executiveTh from '@/language/view/executive/th.js'
import { BLOCK_TYPES } from '@/components/insight/page/blocks/block-types.js'
import { TARGET_PRESETS } from '@/components/insight/page/blocks/target-presets.js'
import { COLUMN_KINDS } from '@/components/insight/page/columns.js'
import { collectBlockIds, findDuplicates, flattenBlocks, computeSourceKeys, diffSourceKeys, buildInitialState } from '@/components/insight/page/insight-page-helpers.js'
import { validateTabConfig, findTabForReportRef, blocksForTab, hasTabs, isSourceTabGated } from '@/components/insight/page/insight-tabs-helpers.js'
import { reactive, isReactive } from 'vue'
import { buildDefaultWipFilter } from '../insight-filters.js'
import { wipConfig, buildTrendCardRows, buildTrendTableRows, trendBucketLabel, leadBucketLabel, buildCapacitySummaryRows, signedCount, signedPercent } from './wip.config.js'

// reportRef ที่ API (ProductionInsightRuleEngine) ส่งมากับ finding ของหมวด wip — ทุกตัวต้องมี block id ให้ "ดู ›" เลื่อนไปหา
const WIP_REPORT_REFS = ['trend', 'departments', 'flow', 'leadTime', 'stalePlans', 'dueRisk', 'abnormalDwell']

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

describe('wip config structure', () => {
  const nodes = flattenBlocks(wipConfig.blocks)

  it('block ids are unique', () => {
    expect(findDuplicates(collectBlockIds(wipConfig.blocks))).toEqual([])
  })

  it('every reportRef the API sends for wip maps to a block id (so "ดู ›" scrolling keeps working)', () => {
    const ids = collectBlockIds(wipConfig.blocks)
    WIP_REPORT_REFS.forEach((ref) => expect(ids, `reportRef ${ref}`).toContain(ref))
  })

  it('every node is a row, a group, or a known block type; columns use registered kinds', () => {
    nodes.forEach((node) => {
      if (node.row || node.group) {
        expect(Array.isArray(node.blocks)).toBe(true)
        return
      }
      if (node.type === 'slot') {
        expect(node.component).toBeTruthy()
        return
      }
      expect(BLOCK_TYPES, `type ${node.type}`).toContain(node.type)
      ;(node.columns || []).forEach((c) => expect(COLUMN_KINDS).toContain(c.kind))
      ;(node.sections || []).forEach((section) => (section.columns || []).forEach((c) => expect(COLUMN_KINDS).toContain(c.kind)))
    })
  })

  it('every i18n key referenced statically by the config exists in th', () => {
    const keys = [...collectI18nKeys(wipConfig)]
    expect(keys.length).toBeGreaterThan(40)
    const missing = keys.filter((key) => !i18n.global.te(key, 'th'))
    expect(missing).toEqual([])
  })

  it('state keys used by blocks are declared in config.state and targetDrawer presets exist', () => {
    const declared = Object.keys(wipConfig.state)
    nodes.forEach((node) => {
      ;[node.selectable?.stateKey, node.selectedState, node.focus?.stateKey, node.toolbar?.toggle?.stateKey].filter(Boolean).forEach((key) => expect(declared).toContain(key))
      ;(node.toolbar?.actions || []).forEach((action) => {
        expect(TARGET_PRESETS[action.preset]).toBeTruthy()
        expect(declared).toContain(TARGET_PRESETS[action.preset].draftStateKey)
      })
    })
  })

  it('source / paged table nodes declare endpoints under ProductionInsight', () => {
    Object.values(wipConfig.sources).forEach((source) => expect(source.endpoint).toMatch(/^ProductionInsight\//))
    nodes.filter((n) => n.type === 'planTable').forEach((n) => expect(n.endpoint).toMatch(/^ProductionInsight\//))
    expect(Object.keys(wipConfig.sources)).toEqual(['Wip', 'WipTrend', 'StageLeadTime', 'StageStandards'])
  })

  it('findings come from the Wip source', () => {
    expect(wipConfig.findings.source).toBe('Wip')
    expect(wipConfig.sources.Wip).toBeTruthy()
  })
})

describe('wip config sources', () => {
  const filter = buildDefaultWipFilter()
  const state = buildInitialState(wipConfig.state)

  it('Wip params match the previous fetchWip body', () => {
    const body = wipConfig.sources.Wip.params(filter, state)
    expect(Object.keys(body).sort()).toEqual(['end', 'growthThresholdPercent', 'riskWindowDays', 'staleDays', 'start'])
    expect(body.staleDays).toBe(filter.staleDays)
  })

  it('range change touches Wip / WipTrend / StageLeadTime but not StageStandards; staleDays touches only Wip', () => {
    const before = computeSourceKeys(wipConfig.sources, filter, state)
    const newRange = { ...filter, start: new Date('2026-01-01'), end: new Date('2026-02-01'), bucket: 'month' }
    expect(diffSourceKeys(before, computeSourceKeys(wipConfig.sources, newRange, state)).sort()).toEqual(['StageLeadTime', 'Wip', 'WipTrend'])
    expect(diffSourceKeys(before, computeSourceKeys(wipConfig.sources, { ...filter, staleDays: 90 }, state))).toEqual(['Wip'])
    expect(diffSourceKeys(before, computeSourceKeys(wipConfig.sources, { ...filter, departmentKeys: ['trim'] }, state))).toEqual([])
  })

  it('draftStandards (drawer preview) only changes StageLeadTime, empty draft sends nothing', () => {
    const before = computeSourceKeys(wipConfig.sources, filter, state)
    const withDraft = computeSourceKeys(wipConfig.sources, filter, { ...state, draftStandards: [{ deptKey: 'trim', standardDays: 4 }] })
    expect(diffSourceKeys(before, withDraft)).toEqual(['StageLeadTime'])
    expect(wipConfig.sources.StageLeadTime.params(filter, state)).not.toHaveProperty('draftStandards', [])
  })

  it('StageStandards is a GET with no params', () => {
    expect(wipConfig.sources.StageStandards.method).toBe('get')
    expect(wipConfig.sources.StageStandards.params()).toBeNull()
  })
})

describe('wip config state resets', () => {
  it('trendDept defaults to the biggest riser, else total', () => {
    const reset = wipConfig.state.trendDept.resetOn.value
    expect(reset({ departments: [{ key: 'trim', delta: 1 }, { key: 'setting', delta: 9 }], total: { delta: 10 } })).toBe('setting')
    expect(reset({ departments: [], total: { delta: 1 } })).toBe('total')
    expect(reset({ departments: [] })).toBeNull()
  })

  it('leadDept keeps a still-valid selection and otherwise picks the most over-standard department', () => {
    const reset = wipConfig.state.leadDept.resetOn.value
    const data = { departments: [{ key: 'trim', overStandardPercent: 10 }, { key: 'setting', overStandardPercent: 80 }] }
    expect(reset(data, 'trim')).toBe('trim')
    expect(reset(data, 'gone')).toBe('setting')
    expect(reset(data, null)).toBe('setting')
  })
})

describe('wip config builders', () => {
  it('trend cards put "total" first, table rows sort by delta with total last', () => {
    const res = { total: { startWip: 10, delta: 3 }, departments: [{ key: 'trim', delta: 1 }, { key: 'setting', delta: 5 }] }
    expect(buildTrendCardRows(res, t).map((r) => r.key)).toEqual(['total', 'trim', 'setting'])
    expect(buildTrendTableRows(res, t).map((r) => r.key)).toEqual(['setting', 'trim', 'total'])
    expect(buildTrendTableRows(res, t)[2].isTotal).toBe(true)
  })

  it('bucket labels', () => {
    expect(trendBucketLabel([{ end: 'e1', label: 'L1' }], 'e1', 'week')).toBe('L1')
    expect(leadBucketLabel(null)).toBe('')
    expect(leadBucketLabel('2026-10-01T00:00:00')).toBe('01/10')
  })

  it('signed formatting', () => {
    expect(signedCount(5)).toBe('+5')
    expect(signedCount(-5)).toBe('−5')
    expect(signedCount(0)).toBe('± 0')
    expect(signedPercent(null)).toBe('—')
    expect(signedPercent(0)).toBe('0%')
    expect(signedPercent(-12)).toBe('−12%')
  })

  it('capacity summary has lead days / throughput / bottleneck rows', () => {
    const rows = buildCapacitySummaryRows({ current: { totalLeadDays: 10, monthlyThroughput: 100, bottleneckDept: 'setting' }, atStandard: { totalLeadDays: 8 } }, t)
    expect(rows.map((r) => r.key)).toEqual(['lead', 'throughput', 'bottleneck'])
    expect(rows[0].now).toContain('10')
    expect(rows[1].atStandard).toBe('—')
    expect(rows[2].now).toBe(t('view.executive.department.setting'))
  })
})

describe('wip tabs (opt-in tab mode)', () => {
  it('opts in with the 4 data tabs in order, and every top-level block names one of them (no block falls into the first tab silently)', () => {
    expect(hasTabs(wipConfig)).toBe(true)
    expect(wipConfig.tabs.map((tab) => tab.key)).toEqual(['trend', 'dept', 'leadtime', 'due'])
    expect(validateTabConfig(wipConfig)).toEqual([])
  })

  it('tab labels exist in th and en', () => {
    wipConfig.tabs.forEach((tab) => expect(i18n.global.te(tab.label, 'th'), tab.label).toBe(true))
    ;['tabs.problems', 'tabs.forecasts', 'tabs.actions', 'tabs.ariaLabel', 'tabs.dataGroup', 'wip.tabs.dueSwitchAria', 'wip.tabs.dueOptions.stale', 'wip.tabs.dueOptions.dueRisk', 'wip.tabs.dueOptions.abnormal'].forEach((key) =>
      expect(i18n.global.te(`view.productionInsight.${key}`, 'th'), key).toBe(true)
    )
  })

  it('top-level blocks per tab', () => {
    const ids = (key) => blocksForTab(wipConfig, key).map((n) => n.id || (n.row ? 'row' : n.type))
    expect(ids('trend')).toEqual(['trend'])
    expect(ids('dept')).toEqual(['row'])
    expect(ids('leadtime')).toEqual(['leadTime', 'capacity'])
    expect(ids('due')).toEqual(['dueSwitch', 'stalePlans', 'dueRisk', 'abnormalDwell'])
  })

  it('reportRef → tab (+ due toggle value): every reportRef the API sends is reachable', () => {
    const expectTab = (ref, tab, value) => {
      const target = findTabForReportRef(wipConfig, ref)
      expect(target?.tab, ref).toBe(tab)
      expect(target?.reveal?.value, ref).toBe(value)
    }
    expectTab('trend', 'trend', undefined)
    expectTab('departments', 'dept', undefined)
    expectTab('flow', 'dept', undefined)
    expectTab('leadTime', 'leadtime', undefined)
    expectTab('capacity', 'leadtime', undefined)
    expectTab('stalePlans', 'due', 'stale')
    expectTab('dueRisk', 'due', 'dueRisk')
    expectTab('abnormalDwell', 'due', 'abnormal')
    WIP_REPORT_REFS.forEach((ref) => expect(findTabForReportRef(wipConfig, ref), ref).not.toBeNull())
    wipConfig.blocks.filter((n) => n.reveal).forEach((n) => expect(n.reveal.stateKey).toBe('dueTable'))
  })

  it('the due tables are visible one at a time from state.dueTable (default stale)', () => {
    const state = buildInitialState(wipConfig.state)
    expect(state.dueTable).toBe('stale')
    const blockOf = (id) => wipConfig.blocks.find((n) => n.id === id)
    const visibleIds = (dueTable) => ['stalePlans', 'dueRisk', 'abnormalDwell'].filter((id) => blockOf(id).visible({ state: { ...state, dueTable } }))
    expect(visibleIds('stale')).toEqual(['stalePlans'])
    expect(visibleIds('dueRisk')).toEqual(['dueRisk'])
    expect(visibleIds('abnormal')).toEqual(['abnormalDwell'])
    const dueSwitch = blockOf('dueSwitch')
    const ctx = { state, t: (key) => key }
    expect(dueSwitch.props(ctx).options.map((o) => o.value)).toEqual(['stale', 'dueRisk', 'abnormal'])
    const next = { ...state }
    dueSwitch.events['update:modelValue']({ setState: (key, value) => (next[key] = value) }, 'abnormal')
    expect(next.dueTable).toBe('abnormal')
  })

  it('WipTrend and the lead-time sources are bound to their tabs; Wip (findings + dept charts) and the plan tables are not gated by source', () => {
    expect(wipConfig.sources.Wip.tab).toBeUndefined()
    expect(wipConfig.sources.WipTrend.tab).toBe('trend')
    expect(wipConfig.sources.StageLeadTime.tab).toBe('leadtime')
    expect(wipConfig.sources.StageStandards.tab).toBe('leadtime')
    expect(isSourceTabGated(wipConfig.sources.WipTrend, [])).toBe(true)
    expect(isSourceTabGated(wipConfig.sources.WipTrend, ['trend'])).toBe(false)
  })

  it('the config and its slot component stay out of Vue reactivity', () => {
    expect(isReactive(reactive({ config: wipConfig }).config)).toBe(false)
    const slot = wipConfig.blocks.find((n) => n.id === 'dueSwitch')
    expect(isReactive(reactive({ c: slot.component }).c)).toBe(false)
  })

  it('the abnormal-count click focuses the department and jumps to the abnormal table when the page offers goToReport', () => {
    const leadTime = wipConfig.blocks.find((n) => n.id === 'leadTime')
    const click = leadTime.columns.find((c) => c.field === 'abnormal').onClick
    const calls = []
    click({ key: 'setting' }, { setState: (...a) => calls.push(['set', ...a]), goToReport: (ref) => calls.push(['go', ref]) })
    expect(calls).toEqual([['set', 'abnormalFocus', 'setting'], ['go', 'abnormalDwell']])
    const onlySet = []
    click({ key: 'trim' }, { setState: (...a) => onlySet.push(a) })
    expect(onlySet).toEqual([['abnormalFocus', 'trim']])
  })
})
