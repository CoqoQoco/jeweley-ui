import { describe, it, expect, vi } from 'vitest'

vi.mock('@/services/permission/standard-edit-access.js', () => ({ hasStandardEditAccess: () => true }))

import { buildDraftEmission, validateRemark, formatReferenceDays } from './target-drawer-helpers.js'
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
