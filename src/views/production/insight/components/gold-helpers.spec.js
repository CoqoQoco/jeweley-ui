import { describe, it, expect } from 'vitest'

import {
  resolveGoldLossStatVariant,
  resolveNetMoneyVariant,
  shouldShowGoldDraftChip,
  mapGoldSeriesField,
  formatOverBucketsRatio,
  buildGoldDraftTargetsPayload,
  buildGoldTargetKey,
  hasGoldDraftChanges
} from './gold-helpers.js'

describe('resolveGoldLossStatVariant', () => {
  it('is "grey" when lossPercent is null (no slips in range yet)', () => {
    expect(resolveGoldLossStatVariant(null, 2)).toBe('grey')
  })

  it('is "green" when at or under target (lower loss is better)', () => {
    expect(resolveGoldLossStatVariant(2, 2)).toBe('green')
    expect(resolveGoldLossStatVariant(1, 2)).toBe('green')
  })

  it('is "warning" when over target', () => {
    expect(resolveGoldLossStatVariant(3, 2)).toBe('warning')
  })

  it('falls back to "main" when there is no target to compare against', () => {
    expect(resolveGoldLossStatVariant(3, null)).toBe('main')
    expect(resolveGoldLossStatVariant(3, undefined)).toBe('main')
  })
})

describe('resolveNetMoneyVariant', () => {
  it('is "green" for a positive net (ช่างได้คืน)', () => {
    expect(resolveNetMoneyVariant(500)).toBe('green')
  })

  it('is "warning" for a negative net (หักช่าง)', () => {
    expect(resolveNetMoneyVariant(-500)).toBe('warning')
  })

  it('is "grey" for zero/missing', () => {
    expect(resolveNetMoneyVariant(0)).toBe('grey')
    expect(resolveNetMoneyVariant(null)).toBe('grey')
  })
})

describe('shouldShowGoldDraftChip', () => {
  const savedTargets = [
    { workerType: 50, metal: 'GOLD', targetPercent: 2 },
    { workerType: 80, metal: 'GOLD', targetPercent: 1.5 },
    { workerType: 50, metal: 'SILVER', targetPercent: 3 },
    { workerType: 80, metal: 'SILVER', targetPercent: 2.5 }
  ]

  it('is false when not a draft row', () => {
    expect(shouldShowGoldDraftChip(50, 'GOLD', 3, 'saved', savedTargets)).toBe(false)
  })

  it('is true when the draft value differs from the saved target for that worker type + metal', () => {
    expect(shouldShowGoldDraftChip(50, 'GOLD', 3, 'draft', savedTargets)).toBe(true)
  })

  it('is false when the draft value equals the saved target (API marks it "draft" even when unchanged)', () => {
    expect(shouldShowGoldDraftChip(50, 'GOLD', 2, 'draft', savedTargets)).toBe(false)
    expect(shouldShowGoldDraftChip(80, 'SILVER', 2.5, 'draft', savedTargets)).toBe(false)
  })

  it('compares against the matching metal only — same worker type but different metal must not match', () => {
    // ช่างแต่ง (50) ทอง เป้า 2, เงิน เป้า 3 — ส่งค่า 3 มาเทียบกับ "ทอง" ต้องถือว่าต่าง (ไม่ไปชนกับแถวเงิน)
    expect(shouldShowGoldDraftChip(50, 'GOLD', 3, 'draft', savedTargets)).toBe(true)
  })

  it('is true when the worker type + metal combo has no saved target yet and the draft sets one', () => {
    expect(shouldShowGoldDraftChip(90, 'GOLD', 2, 'draft', savedTargets)).toBe(true)
  })

  it('is false for empty/missing savedTargets when the draft value is also missing', () => {
    expect(shouldShowGoldDraftChip(50, 'GOLD', null, 'draft', [])).toBe(false)
    expect(shouldShowGoldDraftChip(50, 'GOLD', null, 'draft', null)).toBe(false)
  })
})

describe('mapGoldSeriesField', () => {
  it('extracts one field from every point', () => {
    const series = [{ lossPercent: 2 }, { lossPercent: 3 }]
    expect(mapGoldSeriesField(series, 'lossPercent')).toEqual([2, 3])
  })

  it('keeps null buckets as null (gap) instead of coercing to 0', () => {
    const series = [{ lossPercent: 2 }, { lossPercent: null }, { lossPercent: 0 }]
    expect(mapGoldSeriesField(series, 'lossPercent')).toEqual([2, null, 0])
  })

  it('returns [] for empty/missing input', () => {
    expect(mapGoldSeriesField([], 'lossPercent')).toEqual([])
    expect(mapGoldSeriesField(null, 'lossPercent')).toEqual([])
  })
})

describe('formatOverBucketsRatio', () => {
  it('formats as "n/m"', () => {
    expect(formatOverBucketsRatio(2, 3)).toBe('2/3')
  })

  it('defaults overBuckets to 0 when missing but qualifyingBuckets is set', () => {
    expect(formatOverBucketsRatio(null, 3)).toBe('0/3')
  })

  it('returns "—" when there are no qualifying buckets at all (avoids a misleading 0/0)', () => {
    expect(formatOverBucketsRatio(0, 0)).toBe('—')
    expect(formatOverBucketsRatio(null, null)).toBe('—')
  })
})

describe('buildGoldDraftTargetsPayload', () => {
  it('converts a composite-key draft map into an array of {workerType,metal,targetPercent}, dropping non-finite entries', () => {
    const draft = { '50-GOLD': 2, '80-GOLD': NaN, '50-SILVER': 3, '80-SILVER': 2.5 }
    expect(buildGoldDraftTargetsPayload(draft)).toEqual([
      { workerType: 50, metal: 'GOLD', targetPercent: 2 },
      { workerType: 50, metal: 'SILVER', targetPercent: 3 },
      { workerType: 80, metal: 'SILVER', targetPercent: 2.5 }
    ])
  })

  it('returns [] for empty/missing input', () => {
    expect(buildGoldDraftTargetsPayload({})).toEqual([])
    expect(buildGoldDraftTargetsPayload(null)).toEqual([])
  })
})

describe('buildGoldTargetKey', () => {
  it('joins workerType and metal with a dash', () => {
    expect(buildGoldTargetKey(80, 'GOLD')).toBe('80-GOLD')
    expect(buildGoldTargetKey(50, 'SILVER')).toBe('50-SILVER')
  })
})

describe('hasGoldDraftChanges', () => {
  it('is false when draft matches saved exactly', () => {
    expect(hasGoldDraftChanges({ 50: 2, 80: 1.5 }, { 50: 2, 80: 1.5 })).toBe(false)
  })

  it('is true when any value differs', () => {
    expect(hasGoldDraftChanges({ 50: 3, 80: 1.5 }, { 50: 2, 80: 1.5 })).toBe(true)
  })

  it('is false for empty/missing input on both sides', () => {
    expect(hasGoldDraftChanges({}, {})).toBe(false)
    expect(hasGoldDraftChanges(null, null)).toBe(false)
  })
})
