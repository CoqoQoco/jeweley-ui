import { describe, it, expect } from 'vitest'

import {
  resolveGemName,
  resolveGemShapeName,
  resolveMatchedLinesPercent,
  resolveGemStatusVariant,
  resolveGemStatusLabelKey,
  buildGemLineLabel,
  buildGemStatusChipText,
  buildGemChipItems,
  buildGemDemandLabel,
  mapGemDemandRows
} from './materials-helpers.js'

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

describe('config builders (gem chip list / demand rows)', () => {
  const t = (key, params) => (params ? `${key}:${JSON.stringify(params)}` : key)
  const masters = { gem: [{ code: 'RB', nameTh: 'ทับทิม' }], gemShape: [{ code: 'RD', description: 'กลม' }] }

  it('line label resolves master names, shows size/metal and quantity; falls back to raw codes', () => {
    expect(buildGemLineLabel({ gem: 'RB', shape: 'RD', size: '3mm', metal: 'GOLD', qty: 1234 }, masters, t)).toBe('ทับทิม กลม 3mm view.productionInsight.gold.metalLabel.GOLD ×1,234')
    expect(buildGemLineLabel({ gem: 'ZZ', shape: 'XX', qty: 2 }, { gem: [], gemShape: [] }, t)).toBe('ZZ XX ×2')
    expect(buildGemLineLabel({ gem: 'ZZ', qty: 2 }, undefined, t)).toBe('ZZ ×2')
  })

  it('status chip text: short shows the available quantity, unmatched splits by reason', () => {
    expect(buildGemStatusChipText({ status: 'short', available: 3 }, t)).toBe('view.productionInsight.materials.gemStatusShortWithAvailable:{"available":"3"}')
    expect(buildGemStatusChipText({ status: 'unmatched', unmatchedReason: 'gem' }, t)).toBe('view.productionInsight.materials.gemStatus.unmatchedGem')
    expect(buildGemStatusChipText({ status: 'unmatched', unmatchedReason: 'spec' }, t)).toBe('view.productionInsight.materials.gemStatus.unmatchedSpec')
    expect(buildGemStatusChipText({ status: 'ready' }, t)).toBe('view.productionInsight.materials.gemStatus.ready')
  })

  it('chip items: one per gem line with the status variant', () => {
    const items = buildGemChipItems({ gems: [{ gem: 'RB', qty: 1, status: 'ready' }, { gem: 'ZZ', qty: 1, status: 'short', available: 0 }] }, masters, t)
    expect(items.map((i) => i.variant)).toEqual(['green', 'warning'])
    expect(buildGemChipItems({}, masters, t)).toEqual([])
  })

  it('demand rows get a stable rowKey and a gem label without quantity', () => {
    const rows = mapGemDemandRows([{ gem: 'RB', shape: 'RD', size: '3', metal: 'GOLD' }, { gem: 'RB', shape: 'RD', size: '3', metal: 'GOLD' }], masters, t)
    expect(rows[0].rowKey).toBe('RB-RD-3-GOLD-0')
    expect(rows[1].rowKey).toBe('RB-RD-3-GOLD-1')
    expect(rows[0].gemLabel).toBe(buildGemDemandLabel({ gem: 'RB', shape: 'RD', size: '3', metal: 'GOLD' }, masters, t))
    expect(rows[0].gemLabel).toContain('ทับทิม กลม 3')
    expect(mapGemDemandRows(null, masters, t)).toEqual([])
  })
})
