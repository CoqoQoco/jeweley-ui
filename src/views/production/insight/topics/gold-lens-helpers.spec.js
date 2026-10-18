import { describe, it, expect } from 'vitest'

import {
  GOLD_LENS_VALUES,
  GOLD_LENS_DEFAULT,
  resolveGoldLens,
  lensOfCtx,
  resolveLensWorkerTypes,
  resolveLensKpiWorkerTypes,
  resolveLensDeptKeys,
  buildDeptPickerOptions,
  resolveGoldSourceStrip
} from './gold-lens-helpers.js'

describe('lens values', () => {
  it('all / setting / tang; anything else falls back to all', () => {
    expect(GOLD_LENS_VALUES).toEqual(['all', 'setting', 'tang'])
    expect(GOLD_LENS_DEFAULT).toBe('all')
    GOLD_LENS_VALUES.forEach((lens) => expect(resolveGoldLens(lens)).toBe(lens))
    ;['dept', 'bogus', undefined, null, ''].forEach((value) => expect(resolveGoldLens(value), String(value)).toBe('all'))
  })

  it('lensOfCtx reads filter.lens (only the worker modal sets it) and falls back to all', () => {
    expect(lensOfCtx({ filter: { lens: 'tang' } })).toBe('tang')
    expect(lensOfCtx({ filter: {} })).toBe('all')
    expect(lensOfCtx(undefined)).toBe('all')
  })
})

describe('resolveLensWorkerTypes', () => {
  it('setting locks 80 and tang locks 50, overriding the drawer value', () => {
    expect(resolveLensWorkerTypes('setting', ['50'])).toEqual([80])
    expect(resolveLensWorkerTypes('tang', [])).toEqual([50])
  })

  it('all uses the drawer value as numbers', () => {
    expect(resolveLensWorkerTypes('all', ['80', '50'])).toEqual([80, 50])
    expect(resolveLensWorkerTypes('all')).toEqual([])
    expect(resolveLensWorkerTypes('all', null)).toEqual([])
  })
})

describe('resolveLensKpiWorkerTypes', () => {
  it('all = both rows (80 first), setting = 80, tang = 50', () => {
    expect(resolveLensKpiWorkerTypes('all')).toEqual([80, 50])
    expect(resolveLensKpiWorkerTypes('setting')).toEqual([80])
    expect(resolveLensKpiWorkerTypes('tang')).toEqual([50])
  })
})

describe('resolveLensDeptKeys', () => {
  it('setting -> setting, tang -> trim, all -> every department', () => {
    expect(resolveLensDeptKeys('setting')).toEqual(['setting'])
    expect(resolveLensDeptKeys('tang')).toEqual(['trim'])
    expect(resolveLensDeptKeys('all')).toEqual([])
  })
})

describe('buildDeptPickerOptions', () => {
  it('lists every returned department except a not-weighed gemSort', () => {
    const departments = [{ deptKey: 'trim' }, { deptKey: 'rawPolish' }, { deptKey: 'gemSort', notWeighed: true }, { deptKey: 'setting' }, { deptKey: 'plating' }]
    expect(buildDeptPickerOptions(departments)).toEqual(['trim', 'rawPolish', 'setting', 'plating'])
    expect(buildDeptPickerOptions([{ deptKey: 'gemSort', notWeighed: false }])).toEqual(['gemSort'])
    expect(buildDeptPickerOptions(undefined)).toEqual([])
  })
})

describe('resolveGoldSourceStrip', () => {
  it('plan stays plan; slip follows the worker type the scope locks', () => {
    expect(resolveGoldSourceStrip('plan', 'setting')).toBe('plan')
    expect(resolveGoldSourceStrip('slip', 'all')).toBe('slip')
    expect(resolveGoldSourceStrip('slip', 'setting')).toBe('slip-setter')
    expect(resolveGoldSourceStrip('slip', 'tang')).toBe('slip-tang')
  })
})
