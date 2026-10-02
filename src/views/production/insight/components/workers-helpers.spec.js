import { describe, it, expect } from 'vitest'

import {
  topWagesByDept,
  resolveGoldColumnValue,
  filterWorkersByEmploymentType,
  filterWorkersByDept,
  collectWageBuckets,
  alignWageSeriesToBuckets,
  mapWorkersSeriesTotalField,
  collectWageDeptKeys,
  sortWorkersByWagesDesc
} from './workers-helpers.js'

describe('topWagesByDept', () => {
  it('sorts by share descending and takes the top 2 by default', () => {
    const wagesByDept = [
      { deptKey: 'trim', wagesPerMonth: 50000, share: 20 },
      { deptKey: 'setting', wagesPerMonth: 120000, share: 45 },
      { deptKey: 'rawPolish', wagesPerMonth: 30000, share: 15 }
    ]
    expect(topWagesByDept(wagesByDept)).toEqual([
      { deptKey: 'setting', wagesPerMonth: 120000, share: 45 },
      { deptKey: 'trim', wagesPerMonth: 50000, share: 20 }
    ])
  })

  it('respects a custom maxShown', () => {
    const wagesByDept = [
      { deptKey: 'a', share: 10 },
      { deptKey: 'b', share: 30 },
      { deptKey: 'c', share: 20 }
    ]
    expect(topWagesByDept(wagesByDept, 1)).toEqual([{ deptKey: 'b', share: 30 }])
  })

  it('returns [] for empty/missing input', () => {
    expect(topWagesByDept([])).toEqual([])
    expect(topWagesByDept(null)).toEqual([])
  })
})

describe('resolveGoldColumnValue', () => {
  it('prefers goldLossPercent (from slip) when both are present', () => {
    expect(resolveGoldColumnValue({ goldLossPercent: 2.1, goldDiffPercent: 1.5 })).toEqual({ percent: 2.1, fromSlip: true })
  })

  it('falls back to goldDiffPercent (from stage) when goldLossPercent is missing', () => {
    expect(resolveGoldColumnValue({ goldLossPercent: null, goldDiffPercent: 1.5 })).toEqual({ percent: 1.5, fromSlip: false })
  })

  it('returns null when neither is present', () => {
    expect(resolveGoldColumnValue({ goldLossPercent: null, goldDiffPercent: null })).toBeNull()
    expect(resolveGoldColumnValue({})).toBeNull()
    expect(resolveGoldColumnValue(null)).toBeNull()
  })

  // คัดพลอย (gemSort) ไม่ได้ชั่งน้ำหนักทองเลย — ต้องโชว์ "—" เสมอแม้ backend ส่ง goldDiffPercent=0 มา (bug
  // จริงที่เจอบน prod 2026-10-02: gemSort โชว์ "0%" ทั้งที่ไม่มีข้อมูลจริงให้เทียบ)
  it('returns null for gemSort rows even when goldDiffPercent is 0 (never weighed, not a real diff)', () => {
    expect(resolveGoldColumnValue({ deptKey: 'gemSort', goldDiffPercent: 0 })).toBeNull()
    expect(resolveGoldColumnValue({ deptKey: 'gemSort', goldLossPercent: 1.5 })).toBeNull()
  })

  it('returns null when sendGram/checkGram are both present and equal (not really weighed), for any dept', () => {
    expect(resolveGoldColumnValue({ deptKey: 'setting', sendGram: 5, checkGram: 5, goldDiffPercent: 0 })).toBeNull()
  })

  it('still resolves normally for non-gemSort depts', () => {
    expect(resolveGoldColumnValue({ deptKey: 'setting', goldDiffPercent: 2.5 })).toEqual({ percent: 2.5, fromSlip: false })
  })
})

describe('sortWorkersByWagesDesc', () => {
  it('sorts workers by wages descending', () => {
    const workers = [{ code: 'A', wages: 1000 }, { code: 'B', wages: 3000 }, { code: 'C', wages: 2000 }]
    expect(sortWorkersByWagesDesc(workers).map((w) => w.code)).toEqual(['B', 'C', 'A'])
  })

  it('does not mutate the original array', () => {
    const workers = [{ code: 'A', wages: 1000 }, { code: 'B', wages: 3000 }]
    sortWorkersByWagesDesc(workers)
    expect(workers.map((w) => w.code)).toEqual(['A', 'B'])
  })

  it('returns [] for empty/missing input', () => {
    expect(sortWorkersByWagesDesc([])).toEqual([])
    expect(sortWorkersByWagesDesc(null)).toEqual([])
  })
})

describe('filterWorkersByEmploymentType', () => {
  const workers = [
    { code: 'A', employmentType: 'IN_HOUSE' },
    { code: 'B', employmentType: 'OUTSIDE' },
    { code: 'C', employmentType: null }
  ]

  it('returns everything when employmentType is "ALL" or missing', () => {
    expect(filterWorkersByEmploymentType(workers, 'ALL')).toEqual(workers)
    expect(filterWorkersByEmploymentType(workers, null)).toEqual(workers)
  })

  it('filters to the matching employmentType only (excludes null/unknown)', () => {
    expect(filterWorkersByEmploymentType(workers, 'IN_HOUSE')).toEqual([{ code: 'A', employmentType: 'IN_HOUSE' }])
  })

  it('returns [] for empty/missing workers', () => {
    expect(filterWorkersByEmploymentType([], 'IN_HOUSE')).toEqual([])
    expect(filterWorkersByEmploymentType(null, 'IN_HOUSE')).toEqual([])
  })
})

describe('filterWorkersByDept', () => {
  const workers = [
    { code: 'A', deptKey: 'trim' },
    { code: 'B', deptKey: 'setting' }
  ]

  it('returns everything when departmentKeys is empty/missing', () => {
    expect(filterWorkersByDept(workers, [])).toEqual(workers)
    expect(filterWorkersByDept(workers, null)).toEqual(workers)
  })

  it('filters to the matching deptKeys only', () => {
    expect(filterWorkersByDept(workers, ['setting'])).toEqual([{ code: 'B', deptKey: 'setting' }])
  })
})

describe('collectWageBuckets', () => {
  it('returns every unique bucketEnd in first-seen order', () => {
    const series = [
      { bucketEnd: '2026-05-31', deptKey: 'trim' },
      { bucketEnd: '2026-05-31', deptKey: 'setting' },
      { bucketEnd: '2026-06-30', deptKey: 'trim' }
    ]
    expect(collectWageBuckets(series)).toEqual(['2026-05-31', '2026-06-30'])
  })

  it('returns [] for empty/missing input', () => {
    expect(collectWageBuckets([])).toEqual([])
    expect(collectWageBuckets(null)).toEqual([])
  })
})

describe('alignWageSeriesToBuckets', () => {
  const series = [
    { bucketEnd: '2026-05-31', deptKey: 'trim', wages: 1000 },
    { bucketEnd: '2026-06-30', deptKey: 'setting', wages: 2000 }
  ]
  const buckets = ['2026-05-31', '2026-06-30']

  it('aligns one department onto the shared bucket axis, filling gaps with null', () => {
    expect(alignWageSeriesToBuckets(series, 'trim', buckets)).toEqual([1000, null])
    expect(alignWageSeriesToBuckets(series, 'setting', buckets)).toEqual([null, 2000])
  })

  it('returns an array of nulls when the dept has no points at all', () => {
    expect(alignWageSeriesToBuckets(series, 'gemSort', buckets)).toEqual([null, null])
  })
})

describe('collectWageDeptKeys', () => {
  it('returns every unique deptKey in first-seen order', () => {
    const series = [
      { bucketEnd: '2026-05-31', deptKey: 'trim' },
      { bucketEnd: '2026-05-31', deptKey: 'setting' },
      { bucketEnd: '2026-06-30', deptKey: 'trim' }
    ]
    expect(collectWageDeptKeys(series)).toEqual(['trim', 'setting'])
  })

  it('returns [] for empty/missing input', () => {
    expect(collectWageDeptKeys([])).toEqual([])
    expect(collectWageDeptKeys(null)).toEqual([])
  })
})

describe('mapWorkersSeriesTotalField', () => {
  it('extracts one field from every point', () => {
    expect(mapWorkersSeriesTotalField([{ wagePerPlan: 100 }, { wagePerPlan: 120 }], 'wagePerPlan')).toEqual([100, 120])
  })

  it('keeps null as a gap instead of coercing to 0', () => {
    expect(mapWorkersSeriesTotalField([{ wagePerPlan: null }], 'wagePerPlan')).toEqual([null])
  })

  it('returns [] for empty/missing input', () => {
    expect(mapWorkersSeriesTotalField(null, 'wagePerPlan')).toEqual([])
  })
})
