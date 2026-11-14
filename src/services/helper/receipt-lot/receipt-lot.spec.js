import { describe, it, expect } from 'vitest'

import {
  isSilverMetal,
  isSilverPlanData,
  hasSilverMaterial,
  resolveProductionType,
  validateReceiptQty,
  evaluateTopUp,
  pickDefaultLot,
  pickSuggestedLot,
  filterTopUpCandidates,
  normalizeProductNumber,
  normalizeSize,
  isSameSpec
} from './receipt-lot.js'

describe('isSilverMetal', () => {
  it('detects silver codes and names', () => {
    expect(isSilverMetal('Silver')).toBe(true)
    expect(isSilverMetal('SV')).toBe(true)
    expect(isSilverMetal('sil')).toBe(true)
    expect(isSilverMetal('White Gold')).toBe(false)
    expect(isSilverMetal(null)).toBe(false)
  })
})

describe('isSilverPlanData', () => {
  it('reads plan.gold only', () => {
    expect(isSilverPlanData({ gold: 'Silver' })).toBe(true)
    expect(isSilverPlanData({ gold: 'SILVER' })).toBe(true)
    expect(isSilverPlanData({ gold: 'SV' })).toBe(true)
    expect(isSilverPlanData({ gold: 'Yellow Gold' })).toBe(false)
    expect(isSilverPlanData({ gold: null })).toBe(false)
    expect(isSilverPlanData(null)).toBe(false)
    expect(isSilverPlanData(undefined)).toBe(false)
    expect(isSilverPlanData({ type: 'Silver' })).toBe(false)
  })
})

describe('validateReceiptQty', () => {
  it('gold must be exactly 1', () => {
    expect(validateReceiptQty({ isSilver: false, qty: 1 })).toBeNull()
    expect(validateReceiptQty({ isSilver: false, qty: '1' })).toBeNull()
    expect(validateReceiptQty({ isSilver: false, qty: 2 })).toBe('goldQty')
  })

  it('silver must be an integer >= 1', () => {
    expect(validateReceiptQty({ isSilver: true, qty: 5 })).toBeNull()
    expect(validateReceiptQty({ isSilver: true, qty: 0 })).toBe('silverQty')
    expect(validateReceiptQty({ isSilver: true, qty: 1.5 })).toBe('silverQty')
  })

  it('empty is required', () => {
    expect(validateReceiptQty({ isSilver: true, qty: '' })).toBe('required')
    expect(validateReceiptQty({ isSilver: false, qty: null })).toBe('required')
  })
})

describe('evaluateTopUp', () => {
  const lot = { locationCode: 'MAIN', productionType: 'Silver' }

  it('allows same location and same metal', () => {
    expect(evaluateTopUp({ lot, rowLocation: 'main', rowIsSilver: true })).toEqual({
      canTopUp: true,
      reason: null
    })
  })

  it('blocks different location', () => {
    expect(evaluateTopUp({ lot, rowLocation: 'SHOP', rowIsSilver: true }).reason).toBe('location')
  })

  it('blocks metal mismatch', () => {
    expect(evaluateTopUp({ lot, rowLocation: 'MAIN', rowIsSilver: false }).reason).toBe('metal')
  })
})

describe('pickDefaultLot', () => {
  const silverLot = { locationCode: 'MAIN', productionType: 'Silver' }

  it('silver with exactly one eligible lot defaults to top-up', () => {
    expect(pickDefaultLot({ lots: [silverLot], rowLocation: 'MAIN', rowIsSilver: true })).toBe(silverLot)
  })

  it('silver with several lots or ineligible lot defaults to new', () => {
    expect(pickDefaultLot({ lots: [silverLot, silverLot], rowLocation: 'MAIN', rowIsSilver: true })).toBeNull()
    expect(pickDefaultLot({ lots: [silverLot], rowLocation: 'SHOP', rowIsSilver: true })).toBeNull()
  })

  it('gold always defaults to new', () => {
    const goldLot = { locationCode: 'MAIN', productionType: 'Yellow Gold' }
    expect(pickDefaultLot({ lots: [goldLot], rowLocation: 'MAIN', rowIsSilver: false })).toBeNull()
  })
})

describe('hasSilverMaterial / resolveProductionType', () => {
  it('detects a Silver material', () => {
    expect(hasSilverMaterial([{ type: 'Silver' }])).toBe(true)
    expect(hasSilverMaterial([{ type: 'Diamond' }])).toBe(false)
    expect(hasSilverMaterial(undefined)).toBe(false)
  })

  it('defaults empty productionType to SV when a Silver material exists', () => {
    expect(resolveProductionType({ productionType: null, materials: [{ type: 'Silver' }] })).toBe('SV')
    expect(resolveProductionType({ productionType: '', materials: [{ type: 'Silver' }] })).toBe('SV')
  })

  it('keeps a gold color the user already chose', () => {
    expect(resolveProductionType({ productionType: 'YG', materials: [{ type: 'Silver' }] })).toBe('YG')
  })

  it('leaves empty productionType when no Silver material', () => {
    expect(resolveProductionType({ productionType: null, materials: [] })).toBe(null)
  })
})

describe('pickSuggestedLot', () => {
  const lot = (stockNumber, extra = {}) => ({
    stockNumber,
    locationCode: 'MAIN',
    productionType: 'SV',
    status: 'IN_STOCK',
    ...extra
  })
  const pick = (lots, extra = {}) =>
    pickSuggestedLot({ lots, rowLocation: 'MAIN', rowIsSilver: true, ...extra })

  it('picks the only non-SOLD candidate', () => {
    expect(pick([lot('A')])?.stockNumber).toBe('A')
  })

  it('ignores SOLD when exactly one non-SOLD candidate exists', () => {
    expect(pick([lot('S', { status: 'SOLD' }), lot('A')])?.stockNumber).toBe('A')
  })

  it('returns null when several non-SOLD candidates (ambiguous)', () => {
    expect(pick([lot('A'), lot('B')])).toBeNull()
  })

  it('picks the single SOLD lot when no non-SOLD candidate', () => {
    expect(pick([lot('S', { status: 'sold' })])?.stockNumber).toBe('S')
  })

  it('returns null for several SOLD lots and no non-SOLD', () => {
    expect(pick([lot('S1', { status: 'SOLD' }), lot('S2', { status: 'SOLD' })])).toBeNull()
  })

  it('skips lots in another location or metal', () => {
    expect(pick([lot('A', { locationCode: 'SHOP' })])).toBeNull()
    expect(pick([lot('A', { productionType: 'YG' })])).toBeNull()
    expect(pick([lot('A', { locationCode: 'SHOP' }), lot('B')])?.stockNumber).toBe('B')
  })

  it('never suggests for gold rows or empty input', () => {
    expect(pick([lot('A')], { rowIsSilver: false })).toBeNull()
    expect(pick([])).toBeNull()
    expect(pick(undefined)).toBeNull()
  })
})

describe('filterTopUpCandidates / normalizeProductNumber', () => {
  it('returns only valid candidates for silver rows', () => {
    const lots = [
      { stockNumber: 'A', locationCode: 'MAIN', productionType: 'SV' },
      { stockNumber: 'B', locationCode: 'SHOP', productionType: 'SV' }
    ]
    expect(filterTopUpCandidates({ lots, rowLocation: 'main', rowIsSilver: true }).map((l) => l.stockNumber)).toEqual(['A'])
    expect(filterTopUpCandidates({ lots, rowLocation: 'MAIN', rowIsSilver: false })).toEqual([])
  })

  it('trims and upper-cases product numbers', () => {
    expect(normalizeProductNumber('  ab12 ')).toBe('AB12')
    expect(normalizeProductNumber(null)).toBe('')
  })
})

describe('size matching for auto-pick', () => {
  const lot = (size, extra = {}) => ({
    stockNumber: 'A',
    locationCode: 'MAIN',
    productionType: 'SV',
    status: 'IN_STOCK',
    size,
    ...extra
  })
  const pick = (lots, extra = {}) =>
    pickSuggestedLot({ lots, rowLocation: 'MAIN', rowIsSilver: true, ...extra })

  it('normalizes size: trim, upper, strip leading #, zero/empty = empty', () => {
    expect(normalizeSize(' #52 ')).toBe('52')
    expect(normalizeSize('m')).toBe('M')
    expect(['', '#', '0', null, undefined, ' 0 '].map(normalizeSize)).toEqual(['', '', '', '', '', ''])
  })

  it('picks only when sizes are equal after normalization', () => {
    expect(pick([lot('52')], { rowSize: '#52' })?.stockNumber).toBe('A')
    expect(pick([lot('52')], { rowSize: '54' })).toBeNull()
  })

  it('treats empty sizes as equal but one-sided empty as mismatch', () => {
    expect(pick([lot('')], { rowSize: '#' })?.stockNumber).toBe('A')
    expect(pick([lot(null)], { rowSize: '0' })?.stockNumber).toBe('A')
    expect(pick([lot('52')], { rowSize: '' })).toBeNull()
    expect(pick([lot('')], { rowSize: '52' })).toBeNull()
  })

  it('compares stud / stem strictly like size', () => {
    expect(isSameSpec({ lot: lot('52', { studEarring: 'lg' }), rowSize: '52', rowStud: 'sm' })).toBe(false)
    expect(isSameSpec({ lot: lot('52', { studEarring: 'lg' }), rowSize: '52', rowStud: 'LG' })).toBe(true)
    expect(isSameSpec({ lot: lot('52'), rowSize: '52', rowStud: 'sm' })).toBe(false)
    expect(isSameSpec({ lot: lot('52', { studEarring: 'lg' }), rowSize: '52' })).toBe(false)
    expect(isSameSpec({ lot: lot('52'), rowSize: '52' })).toBe(true)
    expect(isSameSpec({ lot: lot('52', { earringStemSize: '10' }), rowSize: '52', rowStem: '12' })).toBe(false)
    expect(isSameSpec({ lot: lot('52', { earringStemSize: '10' }), rowSize: '52', rowStem: '#10' })).toBe(true)
  })

  it('does not auto-pick on stud mismatch', () => {
    expect(pick([lot('52', { studEarring: 'lg' })], { rowSize: '52', rowStud: 'sm' })).toBeNull()
    expect(pick([lot('52', { studEarring: 'lg' })], { rowSize: '52', rowStud: 'lg' })?.stockNumber).toBe('A')
  })

  it('does not auto-pick when the product has lots of different sizes', () => {
    expect(pick([lot('50', { stockNumber: 'X' }), lot('52')], { rowSize: '52' })).toBeNull()
    expect(pick([lot('#52', { stockNumber: 'X', status: 'SOLD' }), lot('52')], { rowSize: '52' })?.stockNumber).toBe('A')
  })
})
