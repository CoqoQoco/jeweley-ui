import { describe, it, expect } from 'vitest'

import {
  resolveStandardChipVariant,
  resolveStandardChipColorToken,
  calcWaitWorkShare,
  isSmallSplitSample,
  hasAnySeriesValue,
  shouldShowDraftChip,
  buildCapacityDeltaText,
  resolveMostOverStandardDept,
  mapSeriesField,
  buildDraftStandardsPayload,
  hasDraftChanges
} from './wip-lead-time-helpers.js'

describe('resolveStandardChipVariant', () => {
  it('is "pass" when at or under standard', () => {
    expect(resolveStandardChipVariant(0)).toBe('pass')
    expect(resolveStandardChipVariant(-10)).toBe('pass')
    expect(resolveStandardChipVariant(null)).toBe('pass')
  })

  it('is "warning" when over standard but under 50%', () => {
    expect(resolveStandardChipVariant(1)).toBe('warning')
    expect(resolveStandardChipVariant(49)).toBe('warning')
  })

  it('is "critical" at or beyond 50% over standard', () => {
    expect(resolveStandardChipVariant(50)).toBe('critical')
    expect(resolveStandardChipVariant(120)).toBe('critical')
  })
})

describe('resolveStandardChipColorToken', () => {
  it('maps each variant to its token', () => {
    expect(resolveStandardChipColorToken('pass')).toBe('var(--base-green)')
    expect(resolveStandardChipColorToken('warning')).toBe('var(--base-warning)')
    expect(resolveStandardChipColorToken('critical')).toBe('var(--base-red)')
  })

  it('falls back to the pass token for an unknown variant', () => {
    expect(resolveStandardChipColorToken('bogus')).toBe('var(--base-green)')
  })
})

describe('calcWaitWorkShare', () => {
  it('splits wait/work into percentages that sum to 100', () => {
    expect(calcWaitWorkShare(3, 1)).toEqual({ waitPercent: 75, workPercent: 25, hasData: true })
  })

  it('rounds wait then derives work as the remainder (never over/under 100 from separate rounding)', () => {
    expect(calcWaitWorkShare(1, 2)).toEqual({ waitPercent: 33, workPercent: 67, hasData: true })
  })

  it('returns {0,0,hasData:true} when both are actually zero (real data, not missing)', () => {
    expect(calcWaitWorkShare(0, 0)).toEqual({ waitPercent: 0, workPercent: 0, hasData: true })
  })

  it('returns hasData:false when both wait and work are null (never recorded — not a real zero)', () => {
    expect(calcWaitWorkShare(null, null)).toEqual({ waitPercent: 0, workPercent: 0, hasData: false })
  })
})

describe('isSmallSplitSample', () => {
  it('is true for a positive count under 10', () => {
    expect(isSmallSplitSample(1)).toBe(true)
    expect(isSmallSplitSample(9)).toBe(true)
  })

  it('is false for 0, 10+, or non-finite input', () => {
    expect(isSmallSplitSample(0)).toBe(false)
    expect(isSmallSplitSample(10)).toBe(false)
    expect(isSmallSplitSample(null)).toBe(false)
    expect(isSmallSplitSample(undefined)).toBe(false)
  })
})

describe('hasAnySeriesValue', () => {
  it('is true when at least one point has a non-null value for the field', () => {
    expect(hasAnySeriesValue([{ medianWait: null }, { medianWait: 3 }], 'medianWait')).toBe(true)
  })

  it('is false when every point is null/missing for the field', () => {
    expect(hasAnySeriesValue([{ medianWait: null }, {}], 'medianWait')).toBe(false)
  })

  it('is false for empty/missing input', () => {
    expect(hasAnySeriesValue([], 'medianWait')).toBe(false)
    expect(hasAnySeriesValue(null, 'medianWait')).toBe(false)
  })
})

describe('shouldShowDraftChip', () => {
  const savedStandards = [{ deptKey: 'design', standardDays: 14 }, { deptKey: 'trim', standardDays: 10 }]

  it('is false when the row is not a draft (standardSource !== "draft")', () => {
    expect(shouldShowDraftChip('design', 20, 'saved', savedStandards)).toBe(false)
  })

  it('is true when the draft row value differs from the saved standard', () => {
    expect(shouldShowDraftChip('design', 20, 'draft', savedStandards)).toBe(true)
  })

  it('is false when the draft row value equals the saved standard (API marks every dept "draft" even when unchanged)', () => {
    expect(shouldShowDraftChip('design', 14, 'draft', savedStandards)).toBe(false)
    expect(shouldShowDraftChip('trim', 10, 'draft', savedStandards)).toBe(false)
  })

  it('is true when the department has no saved standard yet and the draft sets one', () => {
    expect(shouldShowDraftChip('setting', 7, 'draft', savedStandards)).toBe(true)
  })

  it('is false for empty/missing savedStandards when the draft value is also missing', () => {
    expect(shouldShowDraftChip('design', null, 'draft', [])).toBe(false)
    expect(shouldShowDraftChip('design', null, 'draft', null)).toBe(false)
  })
})

describe('buildCapacityDeltaText', () => {
  const format = (v) => `${v}d`

  it('formats an improvement (at-standard higher than current)', () => {
    expect(buildCapacityDeltaText(10, 14, format)).toBe('10d → 14d (+4d)')
  })

  it('formats a reduction (at-standard lower than current)', () => {
    expect(buildCapacityDeltaText(14, 10, format)).toBe('14d → 10d (−4d)')
  })

  it('formats no change as ± 0', () => {
    expect(buildCapacityDeltaText(10, 10, format)).toBe('10d → 10d (± 0)')
  })

  it('falls back to String() when no formatFn is given', () => {
    expect(buildCapacityDeltaText(10, 14)).toBe('10 → 14 (+4)')
  })
})

describe('resolveMostOverStandardDept', () => {
  it('returns the key of the department with the highest overStandardPercent', () => {
    const departments = [
      { key: 'design', overStandardPercent: 10 },
      { key: 'trim', overStandardPercent: 80 },
      { key: 'setting', overStandardPercent: -5 }
    ]
    expect(resolveMostOverStandardDept(departments)).toBe('trim')
  })

  it('picks the closest-to-standard department when none is over (still the highest overStandardPercent)', () => {
    const departments = [
      { key: 'design', overStandardPercent: -20 },
      { key: 'trim', overStandardPercent: -5 }
    ]
    expect(resolveMostOverStandardDept(departments)).toBe('trim')
  })

  it('falls back to the first department when overStandardPercent is missing on every row', () => {
    const departments = [{ key: 'design' }, { key: 'trim' }]
    expect(resolveMostOverStandardDept(departments)).toBe('design')
  })

  it('returns null for empty/missing input', () => {
    expect(resolveMostOverStandardDept([])).toBeNull()
    expect(resolveMostOverStandardDept(null)).toBeNull()
  })
})

describe('mapSeriesField', () => {
  it('extracts one field from every point', () => {
    const series = [{ medianTotal: 10, p90Total: 12 }, { medianTotal: 8, p90Total: 9 }]
    expect(mapSeriesField(series, 'medianTotal')).toEqual([10, 8])
    expect(mapSeriesField(series, 'p90Total')).toEqual([12, 9])
  })

  it('keeps null buckets as null (gap) instead of coercing to 0 (count==0 in that bucket, not a real zero)', () => {
    const series = [{ medianTotal: 10 }, { medianTotal: null }, { medianTotal: 0 }, { medianTotal: null }]
    expect(mapSeriesField(series, 'medianTotal')).toEqual([10, null, 0, null])
  })

  it('treats a missing field the same as null', () => {
    expect(mapSeriesField([{}], 'medianTotal')).toEqual([null])
  })

  it('returns [] for empty/missing input', () => {
    expect(mapSeriesField([], 'medianTotal')).toEqual([])
    expect(mapSeriesField(null, 'medianTotal')).toEqual([])
  })
})

describe('buildDraftStandardsPayload', () => {
  it('converts a draft map into an array, dropping non-finite entries', () => {
    const draft = { design: 14, trim: NaN, setting: 10 }
    expect(buildDraftStandardsPayload(draft)).toEqual([
      { deptKey: 'design', standardDays: 14 },
      { deptKey: 'setting', standardDays: 10 }
    ])
  })

  it('returns [] for empty/missing input', () => {
    expect(buildDraftStandardsPayload({})).toEqual([])
    expect(buildDraftStandardsPayload(null)).toEqual([])
  })
})

describe('hasDraftChanges', () => {
  it('is false when draft matches saved exactly', () => {
    expect(hasDraftChanges({ design: 14, trim: 10 }, { design: 14, trim: 10 })).toBe(false)
  })

  it('is true when any value differs', () => {
    expect(hasDraftChanges({ design: 15, trim: 10 }, { design: 14, trim: 10 })).toBe(true)
  })

  it('is true when draft has a key saved does not (new dept being set)', () => {
    expect(hasDraftChanges({ design: 14, trim: 10 }, { design: 14 })).toBe(true)
  })

  it('is false for empty/missing input on both sides', () => {
    expect(hasDraftChanges({}, {})).toBe(false)
    expect(hasDraftChanges(null, null)).toBe(false)
  })
})
