import { describe, it, expect } from 'vitest'

import { GOLD_DUE_TABLES, GOLD_DUE_TABLE_DEFAULT, GOLD_DUE_SCOPES, parseWorkerType, resolveGoldReportTarget } from './gold-tab-helpers.js'

const departments = [{ deptKey: 'trim' }, { deptKey: 'setting' }, { deptKey: 'plating' }]
const target = (ref, params) => resolveGoldReportTarget(ref, params, departments)

describe('constants', () => {
  it('due tables are ordered worst first and the first one is the default', () => {
    expect(GOLD_DUE_TABLES).toEqual(['overSlips', 'uncovered', 'outliers', 'pending'])
    expect(GOLD_DUE_TABLE_DEFAULT).toBe('overSlips')
    expect(GOLD_DUE_SCOPES).toEqual(['all', 'setting', 'tang'])
  })
})

describe('parseWorkerType', () => {
  it('accepts 80 / 50 as number or string; everything else is null', () => {
    expect(parseWorkerType({ workerType: 80 })).toBe(80)
    expect(parseWorkerType({ workerType: '50' })).toBe(50)
    ;[{ workerType: 0 }, { workerType: 60 }, { workerType: null }, {}, undefined].forEach((params) => expect(parseWorkerType(params)).toBeNull())
  })
})

describe('resolveGoldReportTarget (every ref x workerType / deptKey)', () => {
  it('goldKpi: by worker type to its tab (with the row anchor), otherwise the overview', () => {
    expect(target('goldKpi', { workerType: 50 })).toEqual({ tab: 'tang', anchor: 'goldKpiTang' })
    expect(target('goldKpi', { workerType: 80 })).toEqual({ tab: 'setting', anchor: 'goldKpiSetting' })
    expect(target('goldKpi', {})).toEqual({ tab: 'overview' })
  })

  it('goldTrend / goldWorkers: by worker type, default setting; anchors point at the per-tab block', () => {
    ;['goldTrend', 'goldWorkers'].forEach((ref) => {
      expect(target(ref, { workerType: 50 }), ref).toEqual({ tab: 'tang', anchor: `${ref}Tang` })
      expect(target(ref, { workerType: 80 }), ref).toEqual({ tab: 'setting', anchor: `${ref}Setting` })
      expect(target(ref, {}), ref).toEqual({ tab: 'setting', anchor: `${ref}Setting` })
    })
  })

  it('goldStage: dept tab and stageDept from params.deptKey only when it exists in the data', () => {
    expect(target('goldStage', { deptKey: 'plating' })).toEqual({ tab: 'dept', reveal: [{ stateKey: 'stageDept', value: 'plating' }] })
    expect(target('goldStage', { deptKey: 'nope' })).toEqual({ tab: 'dept', reveal: [] })
    expect(target('goldStage', {})).toEqual({ tab: 'dept', reveal: [] })
  })

  it('due tables: tab due, the matching toggle value, scope from workerType (default all, always set)', () => {
    const revealOf = (ref, params) => target(ref, params).reveal
    const expected = { goldOverSlips: 'overSlips', goldUncovered: 'uncovered', goldStageOutliers: 'outliers', goldStagePending: 'pending' }
    Object.entries(expected).forEach(([ref, table]) => {
      expect(target(ref, {}).tab, ref).toBe('due')
      expect(revealOf(ref, {}), ref).toEqual([{ stateKey: 'dueTable', value: table }, { stateKey: 'dueScope', value: 'all' }])
      expect(revealOf(ref, { workerType: 80 }), ref).toEqual([{ stateKey: 'dueTable', value: table }, { stateKey: 'dueScope', value: 'setting' }])
      expect(revealOf(ref, { workerType: 50 }), ref).toEqual([{ stateKey: 'dueTable', value: table }, { stateKey: 'dueScope', value: 'tang' }])
    })
  })

  it('unknown refs return null (the page falls back to the block-id mapping)', () => {
    expect(target('goldNothing', {})).toBeNull()
    expect(resolveGoldReportTarget('goldKpi')).toEqual({ tab: 'overview' })
  })
})
