import { describe, it, expect } from 'vitest'
import { purityKey, splitNetWeightByMetal } from './net-weight-by-metal.js'

describe('purityKey', () => {
  it('maps silver variants to SILVER', () => {
    expect(purityKey('SV', null)).toBe('SILVER')
    expect(purityKey(null, 'silver')).toBe('SILVER')
    expect(purityKey(null, 'SILVER')).toBe('SILVER')
  })
  it('keeps gold size', () => {
    expect(purityKey('YG', '18K')).toBe('18K')
    expect(purityKey('YG', null)).toBe('YG')
    expect(purityKey(null, null)).toBe('')
  })
})

describe('splitNetWeightByMetal', () => {
  it('splits backend shaped rows (GLS-202611-005)', () => {
    const r = splitNetWeightByMetal([
      { gold: null, goldSize: '18K', netWeight: 0.58 },
      { gold: null, goldSize: '9K', netWeight: 0.16 },
      { gold: null, goldSize: 'SILVER', netWeight: -1.74 }
    ])
    expect(r.gold).toBeCloseTo(0.74, 5)
    expect(r.silver).toBeCloseTo(-1.74, 5)
  })
  it('splits screen computed rows using goldType', () => {
    const r = splitNetWeightByMetal([
      { goldType: '18K', netWeight: 1 },
      { goldType: 'SILVER', netWeight: -2 }
    ])
    expect(r.gold).toBeCloseTo(1, 5)
    expect(r.silver).toBeCloseTo(-2, 5)
  })
  it('gold only gives silver null', () => {
    const r = splitNetWeightByMetal([{ goldType: '9K', netWeight: 0.5 }])
    expect(r.gold).toBeCloseTo(0.5, 5)
    expect(r.silver).toBeNull()
  })
  it('empty gives both null', () => {
    expect(splitNetWeightByMetal([])).toEqual({ gold: null, silver: null })
  })
})
