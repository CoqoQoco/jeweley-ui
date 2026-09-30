import { describe, it, expect } from 'vitest'

import {
  resolveDeltaVariant,
  resolveDeltaColorToken,
  resolveDeltaIcon,
  formatDeltaText,
  resolveDefaultSelectedDept,
  resolveTrendSummaryVariant,
  sortDepartmentsByDeltaDesc,
  formatSparklineBucketDate,
  isSparklineEdgePoint,
  buildSparklineDiscreteMarkers,
  prependRangeStartPoint
} from './wip-trend-helpers.js'

describe('resolveDeltaVariant', () => {
  it('positive delta = increase (worse — more stale WIP)', () => {
    expect(resolveDeltaVariant(5)).toBe('increase')
  })

  it('negative delta = decrease (better — less stale WIP)', () => {
    expect(resolveDeltaVariant(-5)).toBe('decrease')
  })

  it('zero/falsy delta = equal', () => {
    expect(resolveDeltaVariant(0)).toBe('equal')
    expect(resolveDeltaVariant(null)).toBe('equal')
    expect(resolveDeltaVariant(undefined)).toBe('equal')
  })
})

describe('resolveDeltaColorToken', () => {
  it('increase -> red (critical), decrease -> green, equal -> neutral sub-color', () => {
    expect(resolveDeltaColorToken('increase')).toBe('var(--base-red)')
    expect(resolveDeltaColorToken('decrease')).toBe('var(--base-green)')
    expect(resolveDeltaColorToken('equal')).toBe('var(--base-sub-color)')
  })

  it('falls back to the equal token for an unknown variant', () => {
    expect(resolveDeltaColorToken('bogus')).toBe('var(--base-sub-color)')
  })
})

describe('resolveDeltaIcon', () => {
  it('maps each variant to a caret/dash icon', () => {
    expect(resolveDeltaIcon('increase')).toBe('bi-caret-up-fill')
    expect(resolveDeltaIcon('decrease')).toBe('bi-caret-down-fill')
    expect(resolveDeltaIcon('equal')).toBe('bi-dash-lg')
  })
})

describe('formatDeltaText', () => {
  it('formats an increase with a plus sign and percent', () => {
    expect(formatDeltaText(12, 25)).toBe('+12 (+25%)')
  })

  it('formats a decrease with a minus sign and percent', () => {
    expect(formatDeltaText(-8, 15)).toBe('−8 (−15%)')
  })

  it('formats equal as "± 0" regardless of percent', () => {
    expect(formatDeltaText(0, 0)).toBe('± 0')
  })

  it('omits the percent parenthetical when deltaPercent is not given', () => {
    expect(formatDeltaText(10)).toBe('+10')
  })
})

describe('resolveDefaultSelectedDept', () => {
  it('returns the key of the department with the largest delta', () => {
    const departments = [
      { key: 'trim', delta: 3 },
      { key: 'setting', delta: 12 },
      { key: 'design', delta: -5 }
    ]
    expect(resolveDefaultSelectedDept(departments)).toBe('setting')
  })

  it('returns null for empty/missing input', () => {
    expect(resolveDefaultSelectedDept([])).toBeNull()
    expect(resolveDefaultSelectedDept(null)).toBeNull()
  })
})

describe('resolveTrendSummaryVariant', () => {
  it('inflowGreater when inflow > outflow', () => {
    expect(resolveTrendSummaryVariant(10, 4)).toBe('inflowGreater')
  })

  it('outflowGreater when outflow > inflow', () => {
    expect(resolveTrendSummaryVariant(4, 10)).toBe('outflowGreater')
  })

  it('equal when inflow === outflow (including both zero)', () => {
    expect(resolveTrendSummaryVariant(5, 5)).toBe('equal')
    expect(resolveTrendSummaryVariant(0, 0)).toBe('equal')
  })
})

describe('sortDepartmentsByDeltaDesc', () => {
  it('sorts by delta descending without mutating the input array', () => {
    const departments = [
      { key: 'a', delta: 2 },
      { key: 'b', delta: 10 },
      { key: 'c', delta: -3 }
    ]
    const sorted = sortDepartmentsByDeltaDesc(departments)
    expect(sorted.map((d) => d.key)).toEqual(['b', 'a', 'c'])
    expect(departments.map((d) => d.key)).toEqual(['a', 'b', 'c'])
  })

  it('returns [] for empty/missing input', () => {
    expect(sortDepartmentsByDeltaDesc([])).toEqual([])
    expect(sortDepartmentsByDeltaDesc(null)).toEqual([])
  })
})

describe('formatSparklineBucketDate', () => {
  it('formats week bucket as DD/MM', () => {
    expect(formatSparklineBucketDate('2026-09-14', 'week')).toBe('14/09')
  })

  it('formats month bucket as YYYY-MM', () => {
    expect(formatSparklineBucketDate('2026-09-14', 'month')).toBe('2026-09')
  })

  it('returns empty string when bucketEnd is missing', () => {
    expect(formatSparklineBucketDate(null, 'week')).toBe('')
    expect(formatSparklineBucketDate(undefined, 'month')).toBe('')
  })
})

describe('isSparklineEdgePoint', () => {
  it('is true for the first and last index', () => {
    expect(isSparklineEdgePoint(0, 5)).toBe(true)
    expect(isSparklineEdgePoint(4, 5)).toBe(true)
  })

  it('is false for a middle index', () => {
    expect(isSparklineEdgePoint(2, 5)).toBe(false)
  })

  it('is false when length is 0', () => {
    expect(isSparklineEdgePoint(0, 0)).toBe(false)
  })
})

describe('buildSparklineDiscreteMarkers', () => {
  it('returns first + last markers for a multi-point series', () => {
    const markers = buildSparklineDiscreteMarkers(5, '#393939')
    expect(markers).toEqual([
      { seriesIndex: 0, dataPointIndex: 0, fillColor: '#393939', strokeColor: '#393939', size: 4 },
      { seriesIndex: 0, dataPointIndex: 4, fillColor: '#393939', strokeColor: '#393939', size: 4 }
    ])
  })

  it('returns a single marker when the series has only 1 point (avoids overlapping duplicates)', () => {
    const markers = buildSparklineDiscreteMarkers(1, '#393939')
    expect(markers).toEqual([{ seriesIndex: 0, dataPointIndex: 0, fillColor: '#393939', strokeColor: '#393939', size: 4 }])
  })

  it('returns [] for an empty series', () => {
    expect(buildSparklineDiscreteMarkers(0, '#393939')).toEqual([])
  })
})

describe('prependRangeStartPoint', () => {
  const series = [
    { bucketEnd: '2026-09-07', wip: 3369 },
    { bucketEnd: '2026-09-14', wip: 3401 }
  ]

  it('prepends a synthetic point with the true range-start value', () => {
    const result = prependRangeStartPoint(series, '2026-09-01', 3382)
    expect(result).toHaveLength(3)
    expect(result[0]).toEqual({ bucketEnd: '2026-09-01', wip: 3382, inflow: null, outflow: null, isSynthetic: true })
    expect(result[1]).toBe(series[0])
    expect(result[2]).toBe(series[1])
  })

  it('does not mutate the original series', () => {
    prependRangeStartPoint(series, '2026-09-01', 3382)
    expect(series).toHaveLength(2)
  })

  it('returns the series untouched when rangeStart is missing', () => {
    expect(prependRangeStartPoint(series, null, 3382)).toBe(series)
  })

  it('returns the series untouched when startWip is not a finite number', () => {
    expect(prependRangeStartPoint(series, '2026-09-01', null)).toBe(series)
    expect(prependRangeStartPoint(series, '2026-09-01', undefined)).toBe(series)
    expect(prependRangeStartPoint(series, '2026-09-01', NaN)).toBe(series)
  })

  it('returns [] when series is empty/missing and inputs are invalid', () => {
    expect(prependRangeStartPoint(null, null, 3382)).toEqual([])
    expect(prependRangeStartPoint(undefined, '2026-09-01', null)).toEqual([])
  })
})
