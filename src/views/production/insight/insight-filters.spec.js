import { describe, it, expect } from 'vitest'
import dayjs from 'dayjs'

import {
  SECTION_VALUES,
  resolveActiveSection,
  isFilterKeyRelevantToSection,
  buildDefaultDateRange,
  buildDefaultFilter,
  parseFilterQuery,
  filterToQuery,
  clearedFilterQueryKeys,
  sectionToQuery,
  buildActiveChips,
  formatChipDateRange
} from './insight-filters.js'

describe('resolveActiveSection', () => {
  it('returns the value when it is a known section', () => {
    SECTION_VALUES.forEach((section) => {
      expect(resolveActiveSection(section)).toBe(section)
    })
  })

  it('falls back to overview for invalid/missing values', () => {
    expect(resolveActiveSection('bogus')).toBe('overview')
    expect(resolveActiveSection(undefined)).toBe('overview')
    expect(resolveActiveSection(null)).toBe('overview')
    expect(resolveActiveSection('')).toBe('overview')
  })
})

describe('isFilterKeyRelevantToSection', () => {
  it('marks all global filters relevant for overview/wip/capacity/monthly', () => {
    ;['overview', 'wip', 'capacity', 'monthly'].forEach((section) => {
      ;['start', 'end', 'gold', 'goldSize', 'productType', 'customerType'].forEach((key) => {
        expect(isFilterKeyRelevantToSection(key, section)).toBe(true)
      })
    })
  })

  it('gold section is only relevant to the date range (raw gold weight has no product/customer dimension)', () => {
    expect(isFilterKeyRelevantToSection('start', 'gold')).toBe(true)
    expect(isFilterKeyRelevantToSection('end', 'gold')).toBe(true)
    expect(isFilterKeyRelevantToSection('goldType', 'gold')).toBe(false)
    ;['gold', 'goldSize', 'productType', 'customerType'].forEach((key) => {
      expect(isFilterKeyRelevantToSection(key, 'gold')).toBe(false)
    })
  })

  it('falls back to overview relevance for an unknown section', () => {
    expect(isFilterKeyRelevantToSection('gold', 'bogus')).toBe(true)
  })
})

describe('buildDefaultDateRange', () => {
  it('covers the current month plus the previous 5 months (6 months total, Thai timezone)', () => {
    const range = buildDefaultDateRange()
    const start = dayjs(range.start)
    const end = dayjs(range.end)

    expect(start.date()).toBe(1)
    expect(start.hour()).toBe(0)
    expect(end.isAfter(start)).toBe(true)

    // ระยะห่างเดือนต้อง-ท้าย = 5 เดือนเป๊ะ (รวมเดือนปัจจุบันแล้วครบ 6 เดือน)
    const monthDiff = end.diff(start, 'month')
    expect(monthDiff).toBe(5)
  })
})

describe('buildDefaultFilter', () => {
  it('has empty array filters plus the default date range', () => {
    const filter = buildDefaultFilter()
    expect(filter.gold).toEqual([])
    expect(filter.goldSize).toEqual([])
    expect(filter.productType).toEqual([])
    expect(filter.customerType).toEqual([])
    expect(filter.start).toBeInstanceOf(Date)
    expect(filter.end).toBeInstanceOf(Date)
  })
})

describe('parseFilterQuery / filterToQuery round-trip', () => {
  it('parses query strings back into filter shape', () => {
    const filter = parseFilterQuery({
      start: '2026-04-01',
      end: '2026-09-29',
      gold: 'Yellow,White',
      goldSize: '18K',
      productType: 'RING,EARRING',
      customerType: ''
    })

    expect(dayjs(filter.start).format('YYYY-MM-DD')).toBe('2026-04-01')
    expect(dayjs(filter.end).format('YYYY-MM-DD')).toBe('2026-09-29')
    expect(filter.gold).toEqual(['Yellow', 'White'])
    expect(filter.goldSize).toEqual(['18K'])
    expect(filter.productType).toEqual(['RING', 'EARRING'])
    expect(filter.customerType).toEqual([])
  })

  it('falls back to the default date range when start/end are missing from the query', () => {
    const filter = parseFilterQuery({})
    const defaults = buildDefaultDateRange()
    expect(dayjs(filter.start).isSame(defaults.start, 'day')).toBe(true)
    expect(dayjs(filter.end).isSame(defaults.end, 'day')).toBe(true)
  })

  it('filterToQuery only emits keys that have a value', () => {
    const query = filterToQuery({
      start: new Date('2026-04-01'),
      end: new Date('2026-09-29'),
      gold: ['Yellow'],
      goldSize: [],
      productType: [],
      customerType: []
    })
    expect(query).toEqual({ start: '2026-04-01', end: '2026-09-29', gold: 'Yellow' })
  })

  it('round-trips through parseFilterQuery -> filterToQuery -> parseFilterQuery', () => {
    const original = {
      start: new Date('2026-04-01'),
      end: new Date('2026-09-29'),
      gold: ['Yellow', 'White'],
      goldSize: ['18K'],
      productType: [],
      customerType: ['L']
    }
    const roundTripped = parseFilterQuery(filterToQuery(original))
    expect(dayjs(roundTripped.start).format('YYYY-MM-DD')).toBe('2026-04-01')
    expect(dayjs(roundTripped.end).format('YYYY-MM-DD')).toBe('2026-09-29')
    expect(roundTripped.gold).toEqual(['Yellow', 'White'])
    expect(roundTripped.goldSize).toEqual(['18K'])
    expect(roundTripped.productType).toEqual([])
    expect(roundTripped.customerType).toEqual(['L'])
  })
})

describe('clearedFilterQueryKeys', () => {
  it('returns array-filter keys that are empty', () => {
    const keys = clearedFilterQueryKeys({ gold: [], goldSize: ['18K'], productType: [], customerType: undefined })
    expect(keys.sort()).toEqual(['customerType', 'gold', 'productType'].sort())
  })
})

describe('sectionToQuery', () => {
  it('normalizes to a valid section value', () => {
    expect(sectionToQuery('wip')).toEqual({ view: 'wip' })
    expect(sectionToQuery('bogus')).toEqual({ view: 'overview' })
  })
})

describe('formatChipDateRange', () => {
  it('formats as DD/MM/YYYY – DD/MM/YYYY', () => {
    expect(formatChipDateRange(new Date('2026-04-01'), new Date('2026-09-29'))).toBe('01/04/2026 – 29/09/2026')
  })

  it('returns empty string when either date is missing', () => {
    expect(formatChipDateRange(null, new Date())).toBe('')
    expect(formatChipDateRange(new Date(), null)).toBe('')
  })
})

describe('buildActiveChips', () => {
  it('always includes alwaysShow items and drops empty non-alwaysShow items', () => {
    const chips = buildActiveChips(
      [
        { key: 'dateRange', label: '', value: '01/04/2026 – 29/09/2026', alwaysShow: true },
        { key: 'gold', label: 'ทอง', value: '' },
        { key: 'goldSize', label: 'ขนาดทอง', value: '18K' }
      ],
      'overview'
    )
    expect(chips.map((c) => c.key)).toEqual(['dateRange', 'goldSize'])
  })

  it('marks chips whose key is not relevant to the active section as dimmed', () => {
    const chips = buildActiveChips(
      [
        { key: 'dateRange', label: '', value: '01/04/2026 – 29/09/2026', alwaysShow: true },
        { key: 'goldSize', label: 'ขนาดทอง', value: '18K' }
      ],
      'gold'
    )
    expect(chips.find((c) => c.key === 'dateRange').dimmed).toBe(false)
    expect(chips.find((c) => c.key === 'goldSize').dimmed).toBe(true)
  })
})
