import { describe, it, expect } from 'vitest'

import {
  SECTION_VALUES,
  DEFAULT_SECTION,
  resolveActiveSection,
  buildDefaultWipFilter,
  parseWipFilterQuery,
  wipFilterToQuery,
  clearedWipFilterQueryKeys,
  buildActiveChips,
  WIP_DEFAULT_STALE_DAYS,
  WIP_DEFAULT_RISK_WINDOW_DAYS,
  WIP_DEFAULT_GROWTH_THRESHOLD_PERCENT,
  buildDefaultDeliveryFilter,
  parseDeliveryFilterQuery,
  deliveryFilterToQuery,
  clearedDeliveryFilterQueryKeys,
  DELIVERY_DEFAULT_RISK_HORIZON_DAYS
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
  it('defaults to no department filter, 180-day stale threshold, 30-day risk window, 20% growth threshold, 3m range', () => {
    const filter = buildDefaultWipFilter()
    expect(filter.departmentKeys).toEqual([])
    expect(filter.staleDays).toBe(180)
    expect(filter.riskWindowDays).toBe(30)
    expect(filter.growthThresholdPercent).toBe(20)
    expect(filter.rangePreset).toBe('3m')
    expect(filter.bucket).toBe('week')
    expect(filter.start).toBeInstanceOf(Date)
    expect(filter.end).toBeInstanceOf(Date)
  })
})

describe('parseWipFilterQuery / wipFilterToQuery round-trip', () => {
  it('parses query strings back into filter shape, including range and growth threshold', () => {
    const filter = parseWipFilterQuery({ wipDept: 'setting,trim', wipStaleDays: '90', wipRiskWindow: '14', wipGrowth: '35', range: '1y' })
    expect(filter.departmentKeys).toEqual(['setting', 'trim'])
    expect(filter.staleDays).toBe(90)
    expect(filter.riskWindowDays).toBe(14)
    expect(filter.growthThresholdPercent).toBe(35)
    expect(filter.rangePreset).toBe('1y')
    expect(filter.bucket).toBe('month')
  })

  it('falls back to defaults when the query is empty', () => {
    const filter = parseWipFilterQuery({})
    const defaults = buildDefaultWipFilter()
    expect(filter.departmentKeys).toEqual(defaults.departmentKeys)
    expect(filter.staleDays).toBe(defaults.staleDays)
    expect(filter.riskWindowDays).toBe(defaults.riskWindowDays)
    expect(filter.growthThresholdPercent).toBe(defaults.growthThresholdPercent)
    expect(filter.rangePreset).toBe(defaults.rangePreset)
  })

  it('parses a custom start/end range', () => {
    const filter = parseWipFilterQuery({ start: '2026-01-01', end: '2026-02-01' })
    expect(filter.rangePreset).toBe('custom')
    expect(filter.bucket).toBe('week')
  })

  it('ignores invalid non-positive numeric query values and falls back to defaults', () => {
    const filter = parseWipFilterQuery({ wipStaleDays: '0', wipRiskWindow: 'abc', wipGrowth: '-5' })
    expect(filter.staleDays).toBe(WIP_DEFAULT_STALE_DAYS)
    expect(filter.riskWindowDays).toBe(WIP_DEFAULT_RISK_WINDOW_DAYS)
    expect(filter.growthThresholdPercent).toBe(WIP_DEFAULT_GROWTH_THRESHOLD_PERCENT)
  })

  it('wipFilterToQuery only emits keys that differ from default', () => {
    expect(wipFilterToQuery(buildDefaultWipFilter())).toEqual({})
    expect(wipFilterToQuery({ ...buildDefaultWipFilter(), departmentKeys: ['setting'] })).toEqual({ wipDept: 'setting' })
    expect(wipFilterToQuery({ ...buildDefaultWipFilter(), growthThresholdPercent: 35 })).toEqual({ wipGrowth: '35' })
    expect(wipFilterToQuery({ ...buildDefaultWipFilter(), rangePreset: '1y', start: new Date('2025-09-29'), end: new Date('2026-09-29') })).toEqual({
      range: '1y'
    })
  })

  it('round-trips through parseWipFilterQuery -> wipFilterToQuery -> parseWipFilterQuery', () => {
    const original = {
      departmentKeys: ['setting', 'trim'],
      staleDays: 120,
      riskWindowDays: 14,
      growthThresholdPercent: 35,
      rangePreset: '1y',
      start: new Date('2025-09-29'),
      end: new Date('2026-09-29'),
      bucket: 'month'
    }
    const roundTripped = parseWipFilterQuery(wipFilterToQuery(original))
    expect(roundTripped.departmentKeys).toEqual(original.departmentKeys)
    expect(roundTripped.staleDays).toBe(original.staleDays)
    expect(roundTripped.riskWindowDays).toBe(original.riskWindowDays)
    expect(roundTripped.growthThresholdPercent).toBe(original.growthThresholdPercent)
    expect(roundTripped.rangePreset).toBe(original.rangePreset)
  })
})

describe('clearedWipFilterQueryKeys', () => {
  it('returns query keys that are back to default', () => {
    const keys = clearedWipFilterQueryKeys(buildDefaultWipFilter())
    expect(keys.sort()).toEqual(['range', 'start', 'end', 'wipDept', 'wipRiskWindow', 'wipStaleDays', 'wipGrowth'].sort())
  })

  it('excludes keys that are still non-default', () => {
    const keys = clearedWipFilterQueryKeys({ ...buildDefaultWipFilter(), staleDays: 90, growthThresholdPercent: 35 })
    expect(keys).not.toContain('wipStaleDays')
    expect(keys).not.toContain('wipGrowth')
    expect(keys).toContain('wipRiskWindow')
  })
})

describe('buildDefaultDeliveryFilter', () => {
  it('defaults to no department filter, 30-day risk horizon, 3m range', () => {
    const filter = buildDefaultDeliveryFilter()
    expect(filter.departmentKeys).toEqual([])
    expect(filter.riskHorizonDays).toBe(30)
    expect(filter.rangePreset).toBe('3m')
    expect(filter.bucket).toBe('week')
    expect(filter.start).toBeInstanceOf(Date)
    expect(filter.end).toBeInstanceOf(Date)
  })
})

describe('parseDeliveryFilterQuery / deliveryFilterToQuery round-trip', () => {
  it('parses query strings back into filter shape', () => {
    const filter = parseDeliveryFilterQuery({ dlvDept: 'setting,trim', dlvRiskHorizon: '14', range: '1y' })
    expect(filter.departmentKeys).toEqual(['setting', 'trim'])
    expect(filter.riskHorizonDays).toBe(14)
    expect(filter.rangePreset).toBe('1y')
    expect(filter.bucket).toBe('month')
  })

  it('falls back to defaults when the query is empty', () => {
    const filter = parseDeliveryFilterQuery({})
    const defaults = buildDefaultDeliveryFilter()
    expect(filter.departmentKeys).toEqual(defaults.departmentKeys)
    expect(filter.riskHorizonDays).toBe(defaults.riskHorizonDays)
    expect(filter.rangePreset).toBe(defaults.rangePreset)
  })

  it('ignores invalid non-positive numeric query values and falls back to defaults', () => {
    const filter = parseDeliveryFilterQuery({ dlvRiskHorizon: '0' })
    expect(filter.riskHorizonDays).toBe(DELIVERY_DEFAULT_RISK_HORIZON_DAYS)
  })

  it('deliveryFilterToQuery only emits keys that differ from default', () => {
    expect(deliveryFilterToQuery(buildDefaultDeliveryFilter())).toEqual({})
    expect(deliveryFilterToQuery({ ...buildDefaultDeliveryFilter(), departmentKeys: ['setting'] })).toEqual({ dlvDept: 'setting' })
    expect(deliveryFilterToQuery({ ...buildDefaultDeliveryFilter(), riskHorizonDays: 14 })).toEqual({ dlvRiskHorizon: '14' })
  })

  it('round-trips through parseDeliveryFilterQuery -> deliveryFilterToQuery -> parseDeliveryFilterQuery', () => {
    const original = {
      departmentKeys: ['setting', 'trim'],
      riskHorizonDays: 14,
      rangePreset: '1y',
      start: new Date('2025-09-29'),
      end: new Date('2026-09-29'),
      bucket: 'month'
    }
    const roundTripped = parseDeliveryFilterQuery(deliveryFilterToQuery(original))
    expect(roundTripped.departmentKeys).toEqual(original.departmentKeys)
    expect(roundTripped.riskHorizonDays).toBe(original.riskHorizonDays)
    expect(roundTripped.rangePreset).toBe(original.rangePreset)
  })
})

describe('clearedDeliveryFilterQueryKeys', () => {
  it('returns query keys that are back to default', () => {
    const keys = clearedDeliveryFilterQueryKeys(buildDefaultDeliveryFilter())
    expect(keys.sort()).toEqual(['range', 'start', 'end', 'dlvDept', 'dlvRiskHorizon'].sort())
  })

  it('excludes keys that are still non-default', () => {
    const keys = clearedDeliveryFilterQueryKeys({ ...buildDefaultDeliveryFilter(), riskHorizonDays: 14 })
    expect(keys).not.toContain('dlvRiskHorizon')
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
