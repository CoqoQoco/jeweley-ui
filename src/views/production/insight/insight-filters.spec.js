import { describe, it, expect } from 'vitest'

import {
  SECTION_VALUES,
  DEFAULT_SECTION,
  resolveActiveSection,
  buildDefaultWipFilter,
  parseWipFilterQuery,
  wipFilterToQuery,
  clearedWipFilterQueryKeys,
  buildActiveChips
} from './insight-filters.js'

describe('resolveActiveSection', () => {
  it('returns the value when it is a known section', () => {
    SECTION_VALUES.forEach((section) => {
      expect(resolveActiveSection(section)).toBe(section)
    })
  })

  it('falls back to the default section (wip) for invalid/missing values', () => {
    expect(resolveActiveSection('bogus')).toBe(DEFAULT_SECTION)
    expect(resolveActiveSection(undefined)).toBe(DEFAULT_SECTION)
    expect(resolveActiveSection(null)).toBe(DEFAULT_SECTION)
    expect(resolveActiveSection('')).toBe(DEFAULT_SECTION)
  })
})

describe('buildDefaultWipFilter', () => {
  it('defaults to no department filter, 180-day stale threshold, 30-day risk window', () => {
    expect(buildDefaultWipFilter()).toEqual({
      departmentKeys: [],
      staleDays: 180,
      riskWindowDays: 30
    })
  })
})

describe('parseWipFilterQuery / wipFilterToQuery round-trip', () => {
  it('parses query strings back into filter shape', () => {
    const filter = parseWipFilterQuery({ wipDept: 'setting,trim', wipStaleDays: '90', wipRiskWindow: '14' })
    expect(filter).toEqual({ departmentKeys: ['setting', 'trim'], staleDays: 90, riskWindowDays: 14 })
  })

  it('falls back to defaults when the query is empty', () => {
    expect(parseWipFilterQuery({})).toEqual(buildDefaultWipFilter())
  })

  it('ignores invalid non-positive numeric query values and falls back to defaults', () => {
    const filter = parseWipFilterQuery({ wipStaleDays: '0', wipRiskWindow: 'abc' })
    expect(filter.staleDays).toBe(180)
    expect(filter.riskWindowDays).toBe(30)
  })

  it('wipFilterToQuery only emits keys that differ from default', () => {
    expect(wipFilterToQuery(buildDefaultWipFilter())).toEqual({})
    expect(wipFilterToQuery({ departmentKeys: ['setting'], staleDays: 180, riskWindowDays: 30 })).toEqual({ wipDept: 'setting' })
    expect(wipFilterToQuery({ departmentKeys: [], staleDays: 90, riskWindowDays: 30 })).toEqual({ wipStaleDays: '90' })
  })

  it('round-trips through parseWipFilterQuery -> wipFilterToQuery -> parseWipFilterQuery', () => {
    const original = { departmentKeys: ['setting', 'trim'], staleDays: 120, riskWindowDays: 14 }
    const roundTripped = parseWipFilterQuery(wipFilterToQuery(original))
    expect(roundTripped).toEqual(original)
  })
})

describe('clearedWipFilterQueryKeys', () => {
  it('returns query keys that are back to default', () => {
    const keys = clearedWipFilterQueryKeys(buildDefaultWipFilter())
    expect(keys.sort()).toEqual(['wipDept', 'wipRiskWindow', 'wipStaleDays'].sort())
  })

  it('excludes keys that are still non-default', () => {
    const keys = clearedWipFilterQueryKeys({ departmentKeys: ['setting'], staleDays: 90, riskWindowDays: 30 })
    expect(keys.sort()).toEqual(['wipRiskWindow'].sort())
  })
})

describe('buildActiveChips', () => {
  it('always includes alwaysShow items and drops empty non-alwaysShow items', () => {
    const chips = buildActiveChips([
      { key: 'dept', label: 'แผนก', value: '' },
      { key: 'staleDays', label: 'ไม่ขยับเกิน', value: '90 วัน' },
      { key: 'always', label: '', value: 'x', alwaysShow: true }
    ])
    expect(chips.map((c) => c.key)).toEqual(['staleDays', 'always'])
  })

  it('maps each item to { key, label, value }', () => {
    const chips = buildActiveChips([{ key: 'dept', label: 'แผนก', value: 'ฝัง, แต่ง' }])
    expect(chips).toEqual([{ key: 'dept', label: 'แผนก', value: 'ฝัง, แต่ง' }])
  })
})
