import { describe, it, expect } from 'vitest'
import dayjs from 'dayjs'

import {
  RANGE_PRESET_VALUES,
  DEFAULT_RANGE_PRESET,
  resolvePresetRange,
  resolveCustomBucket,
  buildDefaultRangeState,
  resolveRangeState,
  formatRangeLabel,
  parseRangeQuery,
  rangeToQuery,
  clearedRangeQueryKeys
} from './range-presets.js'

const NOW = new Date('2026-09-29T13:23:00+07:00')

describe('resolvePresetRange', () => {
  it('resolves 1m/3m to a week bucket', () => {
    expect(resolvePresetRange('1m', NOW).bucket).toBe('week')
    expect(resolvePresetRange('3m', NOW).bucket).toBe('week')
  })

  it('resolves 6m/1y to a month bucket', () => {
    expect(resolvePresetRange('6m', NOW).bucket).toBe('month')
    expect(resolvePresetRange('1y', NOW).bucket).toBe('month')
  })

  it('end is always "now" (end of day, Thai time)', () => {
    RANGE_PRESET_VALUES.forEach((preset) => {
      const range = resolvePresetRange(preset, NOW)
      expect(dayjs(range.end).format('YYYY-MM-DD')).toBe('2026-09-29')
    })
  })

  it('start is amount-of-months/years back from now, start of day', () => {
    expect(dayjs(resolvePresetRange('1m', NOW).start).format('YYYY-MM-DD')).toBe('2026-08-29')
    expect(dayjs(resolvePresetRange('3m', NOW).start).format('YYYY-MM-DD')).toBe('2026-06-29')
    expect(dayjs(resolvePresetRange('6m', NOW).start).format('YYYY-MM-DD')).toBe('2026-03-29')
    expect(dayjs(resolvePresetRange('1y', NOW).start).format('YYYY-MM-DD')).toBe('2025-09-29')
  })

  it('returns null for an unknown preset', () => {
    expect(resolvePresetRange('bogus', NOW)).toBeNull()
  })
})

describe('resolveCustomBucket', () => {
  it('uses week bucket when the span is 92 days or less', () => {
    expect(resolveCustomBucket(new Date('2026-01-01'), new Date('2026-04-03'))).toBe('week') // 92 days
  })

  it('uses month bucket when the span exceeds 92 days', () => {
    expect(resolveCustomBucket(new Date('2026-01-01'), new Date('2026-04-04'))).toBe('month') // 93 days
  })

  it('defaults to week when start/end missing', () => {
    expect(resolveCustomBucket(null, new Date())).toBe('week')
    expect(resolveCustomBucket(new Date(), null)).toBe('week')
  })
})

describe('buildDefaultRangeState', () => {
  it('defaults to the 3m preset (user decision)', () => {
    const state = buildDefaultRangeState(NOW)
    expect(state.preset).toBe(DEFAULT_RANGE_PRESET)
    expect(state.preset).toBe('3m')
    expect(state.bucket).toBe('week')
  })
})

describe('resolveRangeState', () => {
  it('resolves a preset the same way resolvePresetRange does', () => {
    expect(resolveRangeState('6m', null, null, NOW)).toEqual({ preset: '6m', ...resolvePresetRange('6m', NOW) })
  })

  it('keeps custom start/end as given and computes bucket from the span', () => {
    const start = new Date('2026-01-01')
    const end = new Date('2026-02-01')
    expect(resolveRangeState('custom', start, end, NOW)).toEqual({ preset: 'custom', start, end, bucket: 'week' })
  })
})

describe('formatRangeLabel', () => {
  it('formats as DD/MM/YYYY – DD/MM/YYYY', () => {
    expect(formatRangeLabel(new Date('2026-04-01'), new Date('2026-09-29'))).toBe('01/04/2026 – 29/09/2026')
  })

  it('returns empty string when either date is missing', () => {
    expect(formatRangeLabel(null, new Date())).toBe('')
    expect(formatRangeLabel(new Date(), null)).toBe('')
  })
})

describe('parseRangeQuery', () => {
  it('parses a custom start/end pair', () => {
    const state = parseRangeQuery({ start: '2026-01-01', end: '2026-02-01' }, NOW)
    expect(state.preset).toBe('custom')
    expect(dayjs(state.start).format('YYYY-MM-DD')).toBe('2026-01-01')
    expect(dayjs(state.end).format('YYYY-MM-DD')).toBe('2026-02-01')
    expect(state.bucket).toBe('week')
  })

  it('parses a valid preset', () => {
    const state = parseRangeQuery({ range: '6m' }, NOW)
    expect(state.preset).toBe('6m')
    expect(state.bucket).toBe('month')
  })

  it('falls back to the default (3m) when query is empty/invalid', () => {
    expect(parseRangeQuery({}, NOW).preset).toBe('3m')
    expect(parseRangeQuery({ range: 'bogus' }, NOW).preset).toBe('3m')
  })
})

describe('rangeToQuery / clearedRangeQueryKeys round-trip', () => {
  it('emits nothing for the default preset (3m)', () => {
    expect(rangeToQuery(buildDefaultRangeState(NOW))).toEqual({})
    expect(clearedRangeQueryKeys(buildDefaultRangeState(NOW)).sort()).toEqual(['range', 'start', 'end'].sort())
  })

  it('emits only `range` for a non-default preset', () => {
    const state = { preset: '1y', ...resolvePresetRange('1y', NOW) }
    expect(rangeToQuery(state)).toEqual({ range: '1y' })
    expect(clearedRangeQueryKeys(state).sort()).toEqual(['start', 'end'].sort())
  })

  it('emits only start/end for custom', () => {
    const state = { preset: 'custom', start: new Date('2026-01-01'), end: new Date('2026-02-01'), bucket: 'week' }
    expect(rangeToQuery(state)).toEqual({ start: '2026-01-01', end: '2026-02-01' })
    expect(clearedRangeQueryKeys(state)).toEqual(['range'])
  })

  it('round-trips through parseRangeQuery -> rangeToQuery -> parseRangeQuery for a non-default preset', () => {
    const original = { preset: '1y', ...resolvePresetRange('1y', NOW) }
    const roundTripped = parseRangeQuery(rangeToQuery(original), NOW)
    expect(roundTripped.preset).toBe('1y')
  })
})
