import { describe, it, expect } from 'vitest'

import {
  lensOfCtx,
  resolveLensWorkerTypes,
  isLensWorkerTypeLocked,
  resolveLensKpiWorkerTypes,
  resolveLensDeptKeys,
  resolveEffectiveStageDept,
  resolveEffectiveTrendWorkerType,
  filterDepartmentsByLens,
  isGoldBlockVisible,
  isGoldBlockCollapsedByDefault,
  resolveGoldSourceStrip,
  classifyFinding,
  filterFindingsByLens,
  buildDeptPickerOptions
} from './gold-lens-helpers.js'

const departments = ['design', 'trim', 'rawPolish', 'setting', 'plating'].map((deptKey) => ({ deptKey }))

describe('lensOfCtx', () => {
  it('reads filter.lens and falls back to all', () => {
    expect(lensOfCtx({ filter: { lens: 'tang' } })).toBe('tang')
    expect(lensOfCtx({ filter: { lens: 'bogus' } })).toBe('all')
    expect(lensOfCtx({ filter: {} })).toBe('all')
    expect(lensOfCtx(undefined)).toBe('all')
  })
})

describe('resolveLensWorkerTypes', () => {
  it('setting locks 80 and tang locks 50, overriding the drawer value', () => {
    expect(resolveLensWorkerTypes('setting', ['50'])).toEqual([80])
    expect(resolveLensWorkerTypes('tang', [])).toEqual([50])
    expect(isLensWorkerTypeLocked('setting')).toBe(true)
    expect(isLensWorkerTypeLocked('tang')).toBe(true)
  })

  it('all and dept use the drawer value as numbers', () => {
    expect(resolveLensWorkerTypes('all', ['80', '50'])).toEqual([80, 50])
    expect(resolveLensWorkerTypes('dept', ['50'])).toEqual([50])
    expect(resolveLensWorkerTypes('all')).toEqual([])
    expect(resolveLensWorkerTypes('all', null)).toEqual([])
    expect(isLensWorkerTypeLocked('all')).toBe(false)
    expect(isLensWorkerTypeLocked('dept')).toBe(false)
  })
})

describe('resolveLensKpiWorkerTypes', () => {
  it('all = both rows (80 first), setting = 80, tang = 50, dept = none', () => {
    expect(resolveLensKpiWorkerTypes('all')).toEqual([80, 50])
    expect(resolveLensKpiWorkerTypes('setting')).toEqual([80])
    expect(resolveLensKpiWorkerTypes('tang')).toEqual([50])
    expect(resolveLensKpiWorkerTypes('dept')).toEqual([])
  })
})

describe('resolveLensDeptKeys', () => {
  it('setting -> setting, tang -> trim, dept -> the selected department, all -> every department', () => {
    expect(resolveLensDeptKeys('setting', 'plating')).toEqual(['setting'])
    expect(resolveLensDeptKeys('tang', null)).toEqual(['trim'])
    expect(resolveLensDeptKeys('dept', 'plating')).toEqual(['plating'])
    expect(resolveLensDeptKeys('dept', null)).toEqual([])
    expect(resolveLensDeptKeys('all', 'plating')).toEqual([])
  })
})

describe('effective selections', () => {
  it('stage department: locked lenses ignore the clicked row, others keep it', () => {
    expect(resolveEffectiveStageDept('setting', 'plating')).toBe('setting')
    expect(resolveEffectiveStageDept('tang', null)).toBe('trim')
    expect(resolveEffectiveStageDept('dept', 'plating')).toBe('plating')
    expect(resolveEffectiveStageDept('all', 'rawPolish')).toBe('rawPolish')
    expect(resolveEffectiveStageDept('all', undefined)).toBeNull()
  })

  it('trend worker type: locked lenses ignore the toggle, others keep it', () => {
    expect(resolveEffectiveTrendWorkerType('setting', 50)).toBe(80)
    expect(resolveEffectiveTrendWorkerType('tang', 80)).toBe(50)
    expect(resolveEffectiveTrendWorkerType('all', 50)).toBe(50)
  })
})

describe('filterDepartmentsByLens', () => {
  it('setting keeps only setting, tang only trim, rawPolish/plating only in all and dept', () => {
    expect(filterDepartmentsByLens(departments, 'setting').map((d) => d.deptKey)).toEqual(['setting'])
    expect(filterDepartmentsByLens(departments, 'tang').map((d) => d.deptKey)).toEqual(['trim'])
    expect(filterDepartmentsByLens(departments, 'all')).toHaveLength(5)
    expect(filterDepartmentsByLens(departments, 'dept')).toHaveLength(5)
    expect(filterDepartmentsByLens(undefined, 'setting')).toEqual([])
  })
})

describe('block visibility / default collapse matrix', () => {
  const hiddenInDept = ['goldKpi', 'goldStageTrend', 'goldTrend', 'goldWorkers', 'goldOverSlips', 'goldUncovered']
  const visibleInDept = ['note', 'goldStage', 'goldStageOutliers', 'goldStagePending']
  const collapsedInAll = ['goldStageOutliers', 'goldStagePending', 'goldWorkers', 'goldOverSlips', 'goldUncovered']

  it('dept lens hides the worker-type blocks only', () => {
    hiddenInDept.forEach((id) => expect(isGoldBlockVisible(id, 'dept'), id).toBe(false))
    visibleInDept.forEach((id) => expect(isGoldBlockVisible(id, 'dept'), id).toBe(true))
    ;['all', 'setting', 'tang'].forEach((lens) => {
      ;[...hiddenInDept, ...visibleInDept].forEach((id) => expect(isGoldBlockVisible(id, lens), `${lens}/${id}`).toBe(true))
    })
  })

  it('only the deep-dive blocks start collapsed, and only in the all lens', () => {
    collapsedInAll.forEach((id) => expect(isGoldBlockCollapsedByDefault(id, 'all'), id).toBe(true))
    ;['goldKpi', 'goldStage', 'goldStageTrend', 'goldTrend'].forEach((id) => expect(isGoldBlockCollapsedByDefault(id, 'all'), id).toBe(false))
    ;['setting', 'tang', 'dept'].forEach((lens) => {
      collapsedInAll.forEach((id) => expect(isGoldBlockCollapsedByDefault(id, lens), `${lens}/${id}`).toBe(false))
    })
  })
})

describe('resolveGoldSourceStrip', () => {
  it('plan stays plan; slip follows the worker type the lens locks', () => {
    expect(resolveGoldSourceStrip('plan', 'setting')).toBe('plan')
    expect(resolveGoldSourceStrip('slip', 'all')).toBe('slip')
    expect(resolveGoldSourceStrip('slip', 'dept')).toBe('slip')
    expect(resolveGoldSourceStrip('slip', 'setting')).toBe('slip-setter')
    expect(resolveGoldSourceStrip('slip', 'tang')).toBe('slip-tang')
  })
})

describe('findings by lens', () => {
  const item = (code, params) => ({ code, params })
  const setting = item('GOLD_LOSS_ABOVE_TARGET', { workerType: 80 })
  const tang = item('GOLD_LOSS_ABOVE_TARGET', { workerType: 50 })
  const stageSetting = item('GOLD_STAGE_ABOVE_TARGET', { deptKey: 'setting' })
  const stageTrim = item('FC_GOLD_STAGE_RISING', { deptKey: 'trim' })
  const stagePlating = item('GOLD_STAGE_ABOVE_TARGET', { deptKey: 'plating' })
  const pending = item('GOLD_STAGE_PENDING_RETURN', { topDeptKey: 'plating', count: 3 })
  const outliers = item('GOLD_STAGE_OUTLIER_JOBS', { count: 9 })
  const unknownType = item('ACT_X', { workerType: 0 })
  const all = [setting, tang, stageSetting, stageTrim, stagePlating, pending, outliers, unknownType]
  const names = (list) => list.map((i) => all.indexOf(i))

  it('classifies by workerType, then deptKey; everything else (topDeptKey, workerType 0, no params) is generic', () => {
    expect(classifyFinding(setting)).toEqual({ kind: 'workerType', value: 80 })
    expect(classifyFinding(stageTrim)).toEqual({ kind: 'dept', value: 'trim' })
    expect(classifyFinding(pending).kind).toBe('generic')
    expect(classifyFinding(unknownType).kind).toBe('generic')
    expect(classifyFinding({}).kind).toBe('generic')
    expect(classifyFinding(undefined).kind).toBe('generic')
  })

  it('all returns the list untouched', () => {
    expect(filterFindingsByLens(all, 'all', null)).toBe(all)
    expect(filterFindingsByLens(undefined, 'setting', null)).toEqual([])
  })

  it('setting keeps workerType 80 / dept setting + generic, drops 50, trim and other departments', () => {
    expect(names(filterFindingsByLens(all, 'setting', null))).toEqual([0, 2, 5, 6, 7])
  })

  it('tang keeps workerType 50 / dept trim + generic', () => {
    expect(names(filterFindingsByLens(all, 'tang', null))).toEqual([1, 3, 5, 6, 7])
  })

  it('dept drops worker-type items, keeps the selected department (every department while none is selected) + generic', () => {
    expect(names(filterFindingsByLens(all, 'dept', 'plating'))).toEqual([4, 5, 6, 7])
    expect(names(filterFindingsByLens(all, 'dept', null))).toEqual([2, 3, 4, 5, 6, 7])
  })
})

describe('buildDeptPickerOptions', () => {
  it('lists every returned department except a not-weighed gemSort', () => {
    const departments = [
      { deptKey: 'trim' },
      { deptKey: 'rawPolish' },
      { deptKey: 'gemSort', notWeighed: true },
      { deptKey: 'setting' },
      { deptKey: 'plating' }
    ]
    expect(buildDeptPickerOptions(departments)).toEqual(['trim', 'rawPolish', 'setting', 'plating'])
    expect(buildDeptPickerOptions([{ deptKey: 'gemSort', notWeighed: false }])).toEqual(['gemSort'])
    expect(buildDeptPickerOptions(undefined)).toEqual([])
  })
})
