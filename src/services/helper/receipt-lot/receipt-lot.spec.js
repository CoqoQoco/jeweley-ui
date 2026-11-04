import { describe, it, expect } from 'vitest'

import {
  isSilverMetal,
  isSilverPlanData,
  hasSilverMaterial,
  resolveProductionType,
  validateReceiptQty,
  evaluateTopUp,
  pickDefaultLot
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
