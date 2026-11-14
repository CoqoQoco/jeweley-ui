import { describe, it, expect } from 'vitest'
import { groupInvoiceLinesForPrint } from './invoice-line-merge.js'
import { lineAmount } from './money.js'

const mat = (w) => [{ type: 'Silver', weight: w }, { type: 'Gem', typeCode: 'Cubic Zirconia', typeOrigin: 'CZ', weight: 0.5 }]
const silver = (o = {}) => ({
  stockNumber: 'DK20J167', stockNumberOrigin: 'DK20J167', productNumber: 'R07416CZ9L-7', mold: 'R-7416Z-SIL',
  productionType: 'Silver', qty: 5, price: '1550.00', appraisalPrice: '1550.00', discountPercent: 0, materials: mat(2), ...o
})
const second = (o = {}) => silver({ stockNumber: 'DK20J046', stockNumberOrigin: 'DK20J046', productNumber: 'R07416CZ9L-3', mold: 'R-7416Z', qty: 1, ...o })
const sumW = (items) => items.reduce((s, i) => s + (i.totalMaterials || i.materials).reduce((a, m) => a + m.weight, 0), 0)
const sumAmt = (items) => items.reduce((s, i) => s + lineAmount(i, 1, 'THB'), 0)
const sumQty = (items) => items.reduce((s, i) => s + i.qty, 0)

describe('groupInvoiceLinesForPrint', () => {
  it('merges INV261113003 case into 1 line qty 6 shown as the largest-qty line', () => {
    const items = [silver(), second()]
    const out = groupInvoiceLinesForPrint(items)
    expect(out).toHaveLength(1)
    expect(out[0].qty).toBe(6)
    expect(out[0].stockNumberOrigin).toBe('DK20J167')
    expect(out[0].mold).toBe('R-7416Z-SIL')
    expect(sumQty(out)).toBe(sumQty(items))
    expect(sumAmt(out)).toBeCloseTo(sumAmt(items), 6)
    expect(sumW(out)).toBeCloseTo(sumW(items), 6)
  })

  it('shows the largest-qty line even when it is not first, at the first position', () => {
    const out = groupInvoiceLinesForPrint([second(), silver()])
    expect(out).toHaveLength(1)
    expect(out[0].stockNumber).toBe('DK20J167')
  })

  it('ties display the first occurrence', () => {
    const out = groupInvoiceLinesForPrint([silver({ qty: 2 }), second({ qty: 2 })])
    expect(out[0].stockNumber).toBe('DK20J167')
    expect(out[0].qty).toBe(4)
  })

  it('does not merge different colour (productNumber) with same mold', () => {
    expect(groupInvoiceLinesForPrint([silver(), second({ productNumber: 'R07416BZ9L-6' })])).toHaveLength(2)
  })

  it('does not merge different price or discount', () => {
    expect(groupInvoiceLinesForPrint([silver(), second({ appraisalPrice: '1600.00' })])).toHaveLength(2)
    expect(groupInvoiceLinesForPrint([silver(), second({ discountPercent: 5 })])).toHaveLength(2)
  })

  it('does not merge gold', () => {
    const gold = (o) => ({ stockNumber: 'G1', productNumber: 'G1-1', mold: 'M', productionType: 'Gold', appraisalPrice: 10, qty: 1, materials: [{ type: 'Gold', weight: 3 }], ...o })
    expect(groupInvoiceLinesForPrint([gold(), gold({ stockNumber: 'G2', productNumber: 'G1-2' })])).toHaveLength(2)
  })

  it('merges legacy codes without dash; dash-only suffix stays distinct', () => {
    const legacy = (o) => silver({ stockNumberOrigin: 'R00096CI9L2', productNumber: 'R00096CI9L2', mold: 'R-96', ...o })
    expect(groupInvoiceLinesForPrint([legacy({ stockNumber: 'A' }), legacy({ stockNumber: 'B' })])).toHaveLength(1)
    const dash = [legacy({ productNumber: 'R03970BZ9L-' }), legacy({ productNumber: 'R03970BZ9L' })]
    expect(groupInvoiceLinesForPrint(dash)).toHaveLength(2)
  })

  it('does not merge when productNumber or mold is empty', () => {
    expect(groupInvoiceLinesForPrint([silver({ productNumber: '' }), second({ productNumber: '' })])).toHaveLength(2)
    expect(groupInvoiceLinesForPrint([silver({ mold: '' }), second({ mold: '' })])).toHaveLength(2)
  })

  it('preserves order and does not mutate input', () => {
    const a = silver({ productNumber: 'A-1', mold: 'MA' })
    const b = silver({ productNumber: 'B-1', mold: 'MB' })
    const a2 = silver({ productNumber: 'A-2', mold: 'MA-SIL', qty: 1 })
    const items = [a, b, a2]
    const snapshot = JSON.parse(JSON.stringify(items))
    const out = groupInvoiceLinesForPrint(items)
    expect(out.map((i) => i.mold)).toEqual(['MA', 'MB'])
    expect(out[0].qty).toBe(6)
    expect(items).toEqual(snapshot)
  })
})
