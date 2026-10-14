import { describe, it, expect } from 'vitest'

import { resolveOnTimeStatVariant, shouldShowDeliveryDraftChip, mapDeliverySeriesField } from './delivery-helpers.js'

describe('resolveOnTimeStatVariant', () => {
  it('is "grey" when onTimePercent is null (no completed plans in range yet)', () => {
    expect(resolveOnTimeStatVariant(null, 95)).toBe('grey')
  })

  it('is "green" when at or above target', () => {
    expect(resolveOnTimeStatVariant(95, 95)).toBe('green')
    expect(resolveOnTimeStatVariant(98, 95)).toBe('green')
  })

  it('is "warning" when below target', () => {
    expect(resolveOnTimeStatVariant(80, 95)).toBe('warning')
  })

  it('falls back to "main" when there is no target to compare against', () => {
    expect(resolveOnTimeStatVariant(80, null)).toBe('main')
    expect(resolveOnTimeStatVariant(80, undefined)).toBe('main')
  })
})

describe('shouldShowDeliveryDraftChip', () => {
  it('is false when not a draft row', () => {
    expect(shouldShowDeliveryDraftChip('saved', 90, 85)).toBe(false)
  })

  it('is true when the draft value differs from the saved target', () => {
    expect(shouldShowDeliveryDraftChip('draft', 90, 85)).toBe(true)
  })

  it('is false when the draft value equals the saved target (API marks it "draft" even when unchanged)', () => {
    expect(shouldShowDeliveryDraftChip('draft', 85, 85)).toBe(false)
  })

  it('is false when both are missing/null', () => {
    expect(shouldShowDeliveryDraftChip('draft', null, null)).toBe(false)
  })
})

describe('mapDeliverySeriesField', () => {
  it('extracts one field from every point', () => {
    const series = [{ onTimePercent: 90 }, { onTimePercent: 80 }]
    expect(mapDeliverySeriesField(series, 'onTimePercent')).toEqual([90, 80])
  })

  it('keeps null buckets as null (gap) instead of coercing to 0', () => {
    const series = [{ onTimePercent: 90 }, { onTimePercent: null }, { onTimePercent: 0 }]
    expect(mapDeliverySeriesField(series, 'onTimePercent')).toEqual([90, null, 0])
  })

  it('treats a missing field the same as null', () => {
    expect(mapDeliverySeriesField([{}], 'plannedLeadMedianDays')).toEqual([null])
  })

  it('returns [] for empty/missing input', () => {
    expect(mapDeliverySeriesField([], 'onTimePercent')).toEqual([])
    expect(mapDeliverySeriesField(null, 'onTimePercent')).toEqual([])
  })
})
