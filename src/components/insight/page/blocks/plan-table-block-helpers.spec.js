import { describe, it, expect } from 'vitest'
import { buildPlanTableBody, buildResetPagingKey, buildPlanTableRequest, buildToggleOptions, resolveFocusChip, mapPlanTableRows, resolveNumberInput } from './plan-table-block-helpers.js'

const t = (key, params) => (params ? `${key}:${JSON.stringify(params)}` : key)

describe('plan-table-block helpers', () => {
  const node = { params: (f, s) => ({ mode: s.mode, departmentKeys: f.departmentKeys, riskWindowDays: f.riskWindowDays }) }

  it('request merges paging with the config body', () => {
    const ctx = { filter: { departmentKeys: ['trim'], riskWindowDays: 30 }, state: { mode: 'overdue' } }
    expect(buildPlanTableBody(node, ctx)).toEqual({ mode: 'overdue', departmentKeys: ['trim'], riskWindowDays: 30 })
    expect(buildPlanTableRequest(node, ctx, { take: 10, skip: 20, sort: [] })).toEqual({ take: 10, skip: 20, sort: [], mode: 'overdue', departmentKeys: ['trim'], riskWindowDays: 30 })
  })

  it('reset key changes once for a multi-field change and ignores unrelated filter fields', () => {
    const a = buildResetPagingKey(node, { filter: { departmentKeys: [], riskWindowDays: 30, other: 1 }, state: { mode: 'overdue' } })
    const b = buildResetPagingKey(node, { filter: { departmentKeys: [], riskWindowDays: 30, other: 2 }, state: { mode: 'overdue' } })
    const c = buildResetPagingKey(node, { filter: { departmentKeys: ['trim'], riskWindowDays: 7 }, state: { mode: 'overdue' } })
    expect(a).toBe(b)
    expect(c).not.toBe(a)
  })

  it('keyParams replaces params as the key base (riskWindowDays only matters in dueSoon mode)', () => {
    const keyed = { ...node, keyParams: (f, s) => [s.mode, f.departmentKeys, s.mode === 'dueSoon' ? f.riskWindowDays : null] }
    const overdue30 = buildResetPagingKey(keyed, { filter: { departmentKeys: [], riskWindowDays: 30 }, state: { mode: 'overdue' } })
    const overdue7 = buildResetPagingKey(keyed, { filter: { departmentKeys: [], riskWindowDays: 7 }, state: { mode: 'overdue' } })
    const soon30 = buildResetPagingKey(keyed, { filter: { departmentKeys: [], riskWindowDays: 30 }, state: { mode: 'dueSoon' } })
    const soon7 = buildResetPagingKey(keyed, { filter: { departmentKeys: [], riskWindowDays: 7 }, state: { mode: 'dueSoon' } })
    expect(overdue30).toBe(overdue7)
    expect(soon30).not.toBe(soon7)
  })

  it('toggle options accept keys or functions for label/title', () => {
    const toggle = { options: [{ value: 'a', label: 'k.a', title: 'k.t' }, { value: 'b', label: (ctx, tt) => tt('k.b', { n: ctx.n }) }] }
    expect(buildToggleOptions(toggle, t, { n: 3 })).toEqual([
      { value: 'a', label: 'k.a', title: 'k.t' },
      { value: 'b', label: 'k.b:{"n":3}', title: undefined }
    ])
    expect(buildToggleOptions(undefined, t, {})).toEqual([])
  })

  it('focus chip appears only while the focus state has a value', () => {
    const focusNode = { focus: { stateKey: 'f', clearTip: 'k.clear', chipText: (ctx, tt, v) => tt('k.chip', { v }) } }
    expect(resolveFocusChip(focusNode, { state: { f: '' } }, t)).toBeNull()
    expect(resolveFocusChip(focusNode, { state: { f: 'trim' } }, t)).toEqual({ value: 'trim', text: 'k.chip:{"v":"trim"}', clearTip: 'k.clear' })
    expect(resolveFocusChip({}, { state: {} }, t)).toBeNull()
  })
})

describe('mapRows / number toolbar', () => {
  it('mapPlanTableRows applies node.mapRows and is a pass-through otherwise', () => {
    const items = [{ a: 1 }]
    expect(mapPlanTableRows({}, items, {}, t)).toBe(items)
    expect(mapPlanTableRows({ mapRows: (rows, ctx) => rows.map((r) => ({ ...r, k: ctx.k })) }, items, { k: 'x' }, t)).toEqual([{ a: 1, k: 'x' }])
  })

  it('resolveNumberInput only accepts valid numbers >= min that differ from the current value', () => {
    const cfg = { min: 1 }
    expect(resolveNumberInput(cfg, 45, 30)).toBe(45)
    expect(resolveNumberInput(cfg, '45', 30)).toBe(45)
    expect(resolveNumberInput(cfg, 30, 30)).toBeNull()
    expect(resolveNumberInput(cfg, '', 30)).toBeNull()
    expect(resolveNumberInput(cfg, null, 30)).toBeNull()
    expect(resolveNumberInput(cfg, 0, 30)).toBeNull()
    expect(resolveNumberInput(cfg, -5, 30)).toBeNull()
    expect(resolveNumberInput(cfg, 'abc', 30)).toBeNull()
    expect(resolveNumberInput({}, 1, 30)).toBe(1)
  })
})
