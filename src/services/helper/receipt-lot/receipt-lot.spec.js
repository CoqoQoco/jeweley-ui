import { describe, it, expect } from 'vitest'

import {
  isSilverMetal,
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
