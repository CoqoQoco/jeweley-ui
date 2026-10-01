import { describe, it, expect } from 'vitest'
import {
  STAGE_TARGET_WORKER_TYPE_ORDER,
  STAGE_TARGET_WORKER_TYPE_DEPT_KEY,
  resolveStageTargetDeptKey,
  resolveStageDiffVariant,
  mapGoldStageSeriesField,
  filterStageSeriesByDept,
  collectStageBuckets,
  alignStageSeriesToBuckets,
  formatStagePendingWithWorker,
  formatStagePendingQueue,
  buildGoldStageDraftTargetsPayload,
  resolveDefaultStageDeptKey
} from './gold-stage-helpers.js'

describe('STAGE_TARGET_WORKER_TYPE_ORDER', () => {
  it('lists the 3 numeric target workerType codes in display order', () => {
    expect(STAGE_TARGET_WORKER_TYPE_ORDER).toEqual([60, 80, 90])
  })
})

// ยืนยันจาก API agent (ตรวจ ProductionInsightRuleEngine.cs ตรงๆ): 60=rawPolish(ขัดดิบ)/80=setting(ฝัง)/
// 90=plating(ขัดชุบ) — เลขสถานะเดิมของระบบ ตรงกับ view.executive.department string key ที่มีอยู่แล้ว
describe('resolveStageTargetDeptKey', () => {
  it('maps 60/80/90 to the matching view.executive.department string key', () => {
    expect(resolveStageTargetDeptKey(60)).toBe('rawPolish')
    expect(resolveStageTargetDeptKey(80)).toBe('setting')
    expect(resolveStageTargetDeptKey(90)).toBe('plating')
  })

  it('returns null for an unknown workerType', () => {
    expect(resolveStageTargetDeptKey(50)).toBeNull()
    expect(resolveStageTargetDeptKey(999)).toBeNull()
  })

  it('STAGE_TARGET_WORKER_TYPE_DEPT_KEY has exactly the 3 known codes', () => {
    expect(STAGE_TARGET_WORKER_TYPE_DEPT_KEY).toEqual({ 60: 'rawPolish', 80: 'setting', 90: 'plating' })
  })
})

describe('resolveStageDiffVariant', () => {
  it('is "grey" when diffPercent is null (not weighed / no data)', () => {
    expect(resolveStageDiffVariant(null, 2)).toBe('grey')
  })

  it('is "green" when at or under target', () => {
    expect(resolveStageDiffVariant(1.5, 2)).toBe('green')
    expect(resolveStageDiffVariant(2, 2)).toBe('green')
  })

  it('is "warning" when over target', () => {
    expect(resolveStageDiffVariant(2.5, 2)).toBe('warning')
  })

  it('falls back to "main" when there is no target to compare against', () => {
    expect(resolveStageDiffVariant(2.5, null)).toBe('main')
  })
})

describe('mapGoldStageSeriesField', () => {
  it('extracts one field from every point', () => {
    expect(mapGoldStageSeriesField([{ diffPercent: 1 }, { diffPercent: 2 }], 'diffPercent')).toEqual([1, 2])
  })

  it('keeps null as a gap instead of coercing to 0', () => {
    expect(mapGoldStageSeriesField([{ diffPercent: null }], 'diffPercent')).toEqual([null])
  })

  it('returns [] for empty/missing input', () => {
    expect(mapGoldStageSeriesField(null, 'diffPercent')).toEqual([])
  })
})

describe('filterStageSeriesByDept', () => {
  const series = [
    { bucketEnd: '2026-05-31', deptKey: 60, diffPercent: 1 },
    { bucketEnd: '2026-05-31', deptKey: 80, diffPercent: 2 },
    { bucketEnd: '2026-06-30', deptKey: 60, diffPercent: 1.5 }
  ]

  it('keeps only points matching the given deptKey', () => {
    expect(filterStageSeriesByDept(series, 60)).toEqual([
      { bucketEnd: '2026-05-31', deptKey: 60, diffPercent: 1 },
      { bucketEnd: '2026-06-30', deptKey: 60, diffPercent: 1.5 }
    ])
  })

  it('returns [] for empty/missing input', () => {
    expect(filterStageSeriesByDept([], 60)).toEqual([])
    expect(filterStageSeriesByDept(null, 60)).toEqual([])
  })
})

describe('collectStageBuckets', () => {
  it('returns every unique bucketEnd in first-seen order', () => {
    const series = [
      { bucketEnd: '2026-05-31', deptKey: 60 },
      { bucketEnd: '2026-05-31', deptKey: 80 },
      { bucketEnd: '2026-06-30', deptKey: 60 }
    ]
    expect(collectStageBuckets(series)).toEqual(['2026-05-31', '2026-06-30'])
  })

  it('returns [] for empty/missing input', () => {
    expect(collectStageBuckets([])).toEqual([])
    expect(collectStageBuckets(null)).toEqual([])
  })
})

describe('alignStageSeriesToBuckets', () => {
  const series = [
    { bucketEnd: '2026-05-31', deptKey: 60, diffPercent: 1 },
    { bucketEnd: '2026-06-30', deptKey: 80, diffPercent: 2 }
  ]
  const buckets = ['2026-05-31', '2026-06-30']

  it('aligns one department onto the shared bucket axis, filling gaps with null', () => {
    expect(alignStageSeriesToBuckets(series, 60, buckets, 'diffPercent')).toEqual([1, null])
    expect(alignStageSeriesToBuckets(series, 80, buckets, 'diffPercent')).toEqual([null, 2])
  })

  it('returns an array of nulls when the dept has no points at all', () => {
    expect(alignStageSeriesToBuckets(series, 90, buckets, 'diffPercent')).toEqual([null, null])
  })
})

describe('formatStagePendingWithWorker', () => {
  const formatCount = (v) => `${v}`
  const formatGram = (v) => `${v}g`

  it('formats "{n} · {gram}" when something is pending with a worker', () => {
    expect(formatStagePendingWithWorker({ pendingWithWorkerCount: 3, pendingWithWorkerGram: 12.5 }, formatCount, formatGram)).toBe('3 · 12.5g')
  })

  it('returns an empty string when nothing is pending with a worker', () => {
    expect(formatStagePendingWithWorker({ pendingWithWorkerCount: 0, pendingWithWorkerGram: 0 }, formatCount, formatGram)).toBe('')
    expect(formatStagePendingWithWorker(null, formatCount, formatGram)).toBe('')
  })
})

describe('formatStagePendingQueue', () => {
  const formatCount = (v) => `${v}`
  const formatGram = (v) => `${v}g`

  it('formats "{n} · {gram}" when something is queued, not yet assigned', () => {
    expect(formatStagePendingQueue({ pendingQueueCount: 2, pendingQueueGram: 0.8 }, formatCount, formatGram)).toBe('2 · 0.8g')
  })

  it('returns an empty string when the queue is empty', () => {
    expect(formatStagePendingQueue({ pendingQueueCount: 0, pendingQueueGram: 0 }, formatCount, formatGram)).toBe('')
    expect(formatStagePendingQueue(null, formatCount, formatGram)).toBe('')
  })
})

describe('buildGoldStageDraftTargetsPayload', () => {
  it('converts a composite-key draft map into an array of {scope:"STAGE",workerType,metal,targetPercent}, dropping non-finite entries (field is workerType, not deptKey — confirmed by API agent)', () => {
    const draft = { '60-GOLD': 2, '80-GOLD': NaN, '90-SILVER': 1.5 }
    expect(buildGoldStageDraftTargetsPayload(draft)).toEqual([
      { scope: 'STAGE', workerType: 60, metal: 'GOLD', targetPercent: 2 },
      { scope: 'STAGE', workerType: 90, metal: 'SILVER', targetPercent: 1.5 }
    ])
  })

  it('returns [] for empty/missing input', () => {
    expect(buildGoldStageDraftTargetsPayload({})).toEqual([])
    expect(buildGoldStageDraftTargetsPayload(null)).toEqual([])
  })
})

describe('resolveDefaultStageDeptKey', () => {
  it('picks the department furthest over its target', () => {
    const departments = [
      { deptKey: 60, diffPercent: 2.2, targetPercent: 2 },
      { deptKey: 80, diffPercent: 3.5, targetPercent: 2 },
      { deptKey: 90, diffPercent: 1, targetPercent: 2 }
    ]
    expect(resolveDefaultStageDeptKey(departments)).toBe(80)
  })

  it('skips departments with no diffPercent/targetPercent to compare (e.g. notWeighed)', () => {
    const departments = [
      { deptKey: 60, diffPercent: null, targetPercent: null },
      { deptKey: 80, diffPercent: 3, targetPercent: 2 }
    ]
    expect(resolveDefaultStageDeptKey(departments)).toBe(80)
  })

  it('falls back to the first department when nothing is comparable', () => {
    expect(resolveDefaultStageDeptKey([{ deptKey: 60, diffPercent: null, targetPercent: null }])).toBe(60)
  })

  it('returns null for empty/missing input', () => {
    expect(resolveDefaultStageDeptKey([])).toBeNull()
    expect(resolveDefaultStageDeptKey(null)).toBeNull()
  })
})
