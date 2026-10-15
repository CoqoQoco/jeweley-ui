import { describe, it, expect, vi } from 'vitest'

vi.mock('@/services/permission/standard-edit-access.js', () => ({ hasStandardEditAccess: () => true }))

import { buildDraftEmission, emptyDraftOf, validateRemark, formatReferenceDays, formatHistoryCell } from './target-drawer-helpers.js'
import { TARGET_PRESETS, getTargetPreset, buildSavedMap } from './target-presets.js'

describe('target-drawer helpers', () => {
  const preset = TARGET_PRESETS.stageStandards

  it('emits no draft when nothing differs from the saved values, the payload otherwise', () => {
    expect(buildDraftEmission(preset, { trim: 5 }, { trim: 5 })).toEqual([])
    expect(buildDraftEmission(preset, { trim: 6, setting: 3 }, { trim: 5, setting: 3 })).toEqual([
      { deptKey: 'trim', standardDays: 6 },
      { deptKey: 'setting', standardDays: 3 }
    ])
  })

  it('ignores non-numeric draft values (still typing)', () => {
    expect(buildDraftEmission(preset, { trim: '' }, { trim: 5 })).toEqual([])
  })

  it('remark is required and trimmed', () => {
    expect(validateRemark('  ')).toBe(false)
    expect(validateRemark(undefined)).toBe(false)
    expect(validateRemark('เหตุผล')).toBe(true)
  })

  it('formatReferenceDays', () => {
    expect(formatReferenceDays(2.26)).toBe('2.3')
    expect(formatReferenceDays(null)).toBe('—')
  })
})

describe('stageStandards preset', () => {
  const preset = getTargetPreset('stageStandards')

  it('maps to the current StageStandards endpoints and draft param', () => {
    expect(preset.draftStateKey).toBe('draftStandards')
    expect(preset.savedSource).toBe('StageStandards')
    expect(preset.reloadSources).toEqual(['StageLeadTime', 'StageStandards'])
    expect(getTargetPreset('nope')).toBeNull()
  })

  it('builds drawer rows from the lead-time departments and saved standards', () => {
    const ctx = {
      data: {
        StageStandards: [{ deptKey: 'trim', standardDays: 4 }],
        StageLeadTime: { departments: [{ key: 'trim', standardDays: 3, median: { total: 5 }, p90: { total: 9 } }, { key: 'setting', standardDays: 6 }] }
      }
    }
    const rows = preset.rows(ctx, (key) => key)
    expect(rows[0]).toEqual({ key: 'trim', label: 'view.executive.department.trim', savedValue: 4, reference: { median: 5, p90: 9 } })
    expect(rows[1].savedValue).toBe(6)
    expect(preset.savedMap(ctx)).toEqual({ trim: 4 })
  })

  it('save/history delegate to the existing store actions', async () => {
    const store = { saveStageStandards: vi.fn().mockResolvedValue(true), fetchStageStandardHistory: vi.fn().mockResolvedValue([]) }
    await preset.save(store, { items: [1], remark: 'r' })
    await preset.history(store, 'trim')
    expect(store.saveStageStandards).toHaveBeenCalledWith({ items: [1], remark: 'r' })
    expect(store.fetchStageStandardHistory).toHaveBeenCalledWith('trim')
  })

  it('buildSavedMap', () => {
    expect(buildSavedMap([{ k: 'a', v: 1 }], 'k', 'v')).toEqual({ a: 1 })
    expect(buildSavedMap(null, 'k', 'v')).toEqual({})
  })
})

describe('scalar preset (deliveryTarget)', () => {
  const preset = getTargetPreset('deliveryTarget')

  it('maps to the current DeliveryTarget endpoints and the draftTargetPercent state', () => {
    expect(preset.mode).toBe('scalar')
    expect(preset.draftStateKey).toBe('draftTargetPercent')
    expect(preset.savedSource).toBe('DeliveryTarget')
    expect(preset.reloadSources).toEqual(['Delivery', 'DeliveryTarget'])
    expect([preset.min, preset.max]).toEqual([0, 100])
  })

  it('emits the number when it differs from the saved target and null when it does not', () => {
    expect(emptyDraftOf(preset)).toBeNull()
    expect(emptyDraftOf(TARGET_PRESETS.stageStandards)).toEqual([])
    expect(buildDraftEmission(preset, { value: 85 }, { value: 90 })).toBe(85)
    expect(buildDraftEmission(preset, { value: 90 }, { value: 90 })).toBeNull()
    expect(buildDraftEmission(preset, { value: 0 }, { value: 90 })).toBe(0)
    expect(buildDraftEmission(preset, { value: null }, { value: null })).toBeNull()
  })

  it('has one row without a key per department and shows the saved value as a percent', () => {
    const ctx = { data: { DeliveryTarget: { targetPercent: 92.5 }, Delivery: { kpi: { onTimePercent: 81.26 } } } }
    const rows = preset.rows(ctx, (key) => key)
    expect(rows).toHaveLength(1)
    expect(preset.savedMap(ctx)).toEqual({ value: 92.5 })
    expect(preset.savedText(rows[0])).toBe('92.5%')
    expect(preset.savedText({ savedValue: null })).toBe('—%')
    const t = (key, params) => `${key}:${params.percent}`
    expect(preset.referenceText(rows[0], ctx, t)).toBe('view.productionInsight.delivery.targetReferenceText:81.3%')
    expect(preset.referenceText(rows[0], { data: { Delivery: { kpi: {} } } }, t)).toBe('view.productionInsight.delivery.targetReferenceText:—')
  })

  it('save sends targetPercent + remark to the existing store action; history ignores the row key', async () => {
    const store = { saveDeliveryTarget: vi.fn().mockResolvedValue(true), fetchDeliveryTargetHistory: vi.fn().mockResolvedValue([]) }
    await preset.save(store, { items: 88, remark: 'r' })
    await preset.history(store, 'value')
    expect(store.saveDeliveryTarget).toHaveBeenCalledWith({ targetPercent: 88, remark: 'r' })
    expect(store.fetchDeliveryTargetHistory).toHaveBeenCalledWith()
  })
})

describe('formatHistoryCell', () => {
  it('formats dates, suffixes and plain values', () => {
    expect(formatHistoryCell({ field: 'd', date: true }, { d: '2026-10-01T00:00:00' })).toBe('01/10/2026')
    expect(formatHistoryCell({ field: 'd', date: true }, {})).toBe('')
    expect(formatHistoryCell({ field: 'p', suffix: '%' }, { p: 90 })).toBe('90%')
    expect(formatHistoryCell({ field: 'p', suffix: '%' }, { p: null })).toBe('')
    expect(formatHistoryCell({ field: 'r' }, { r: 'x' })).toBe('x')
  })
})

describe('buildDraftEmission with buildDraftPayload', () => {
  it('uses the preview-specific payload when the preset has one, empty draft when nothing changed', () => {
    const preset = {
      emptyDraft: [],
      hasChanges: (draft, saved) => draft.a !== saved.a,
      buildPayload: () => ['save'],
      buildDraftPayload: (draft) => ['preview', draft.a]
    }
    expect(buildDraftEmission(preset, { a: 2 }, { a: 1 })).toEqual(['preview', 2])
    expect(buildDraftEmission(preset, { a: 1 }, { a: 1 })).toEqual([])
    expect(buildDraftEmission({ ...preset, buildDraftPayload: undefined }, { a: 2 }, { a: 1 })).toEqual(['save'])
  })
})
