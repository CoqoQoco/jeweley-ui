import { describe, it, expect } from 'vitest'

import { resolveGemName, resolveGemShapeName, resolveMatchedLinesPercent, resolveGemStatusVariant, resolveGemStatusLabelKey } from './materials-helpers.js'

describe('resolveGemName', () => {
  it('resolves the Thai name from gem master data (field nameTh)', () => {
    const master = [{ code: 'EM', nameTh: 'มรกต' }, { code: 'RB', nameTh: 'ทับทิม' }]
    expect(resolveGemName(master, 'EM')).toBe('มรกต')
  })

  it('falls back to the raw code when no master match is found', () => {
    expect(resolveGemName([{ code: 'RB', nameTh: 'ทับทิม' }], 'EM')).toBe('EM')
    expect(resolveGemName([], 'EM')).toBe('EM')
    expect(resolveGemName(null, 'EM')).toBe('EM')
  })

  it('returns an empty string for a missing code', () => {
    expect(resolveGemName([{ code: 'EM', nameTh: 'มรกต' }], null)).toBe('')
    expect(resolveGemName([{ code: 'EM', nameTh: 'มรกต' }], '')).toBe('')
  })
})

describe('resolveGemShapeName', () => {
  it('resolves the shape description from gem shape master data (field description)', () => {
    const master = [{ code: 'OV', description: 'ทรงรี' }, { code: 'RD', description: 'ทรงกลม' }]
    expect(resolveGemShapeName(master, 'OV')).toBe('ทรงรี')
  })

  it('falls back to the raw code when no master match is found', () => {
    expect(resolveGemShapeName([{ code: 'RD', description: 'ทรงกลม' }], 'OV')).toBe('OV')
  })
})

describe('resolveMatchedLinesPercent', () => {
  it('computes matched/total as a percentage', () => {
    expect(resolveMatchedLinesPercent(45, 50)).toBe(90)
  })

  it('returns null when totalLines is 0/missing (guards against NaN)', () => {
    expect(resolveMatchedLinesPercent(0, 0)).toBeNull()
    expect(resolveMatchedLinesPercent(5, null)).toBeNull()
    expect(resolveMatchedLinesPercent(5, undefined)).toBeNull()
  })
})

describe('resolveGemStatusVariant', () => {
  it('maps ready/short/unmatched to the correct token variant', () => {
    expect(resolveGemStatusVariant('ready')).toBe('green')
    expect(resolveGemStatusVariant('short')).toBe('warning')
    expect(resolveGemStatusVariant('unmatched')).toBe('grey')
  })

  it('falls back to grey for an unknown status', () => {
    expect(resolveGemStatusVariant('bogus')).toBe('grey')
    expect(resolveGemStatusVariant(null)).toBe('grey')
  })
})

describe('resolveGemStatusLabelKey', () => {
  it('returns the status itself when not unmatched', () => {
    expect(resolveGemStatusLabelKey('ready')).toBe('ready')
    expect(resolveGemStatusLabelKey('short')).toBe('short')
  })

  // ยืนยันจาก API agent 2026-10-02: unmatchedReason 'gem' = ไม่รู้จักชนิดพลอยเลย, 'spec' = รู้จักชนิดแต่
  // รูปทรง/ขนาดไม่ตรง
  it('splits unmatched into unmatchedGem/unmatchedSpec based on unmatchedReason', () => {
    expect(resolveGemStatusLabelKey('unmatched', 'gem')).toBe('unmatchedGem')
    expect(resolveGemStatusLabelKey('unmatched', 'spec')).toBe('unmatchedSpec')
  })

  it('falls back to the plain "unmatched" key when unmatchedReason is missing/unknown', () => {
    expect(resolveGemStatusLabelKey('unmatched')).toBe('unmatched')
    expect(resolveGemStatusLabelKey('unmatched', 'bogus')).toBe('unmatched')
  })

  it('falls back to "unmatched" for a missing/unknown status', () => {
    expect(resolveGemStatusLabelKey(null)).toBe('unmatched')
    expect(resolveGemStatusLabelKey('')).toBe('unmatched')
  })
})
