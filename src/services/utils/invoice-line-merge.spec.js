import { describe, it, expect } from 'vitest'
import { groupInvoiceLinesForPrint } from './invoice-line-merge.js'
import { lineAmount } from './money.js'

const mat = (w) => [{ type: 'Silver', weight: w }, { type: 'Gem', typeCode: 'Cubic Zirconia', typeOrigin: 'CZ', weight: 0.5 }]
const silver = (o = {}) => ({
  stockNumber: 'S1', stockNumberOrigin: 'R07416CZ9L-7', mold: 'R-7416', productionType: 'Silver',
  appraisalPrice: 1550, discountPercent: 0, qty: 3, materials: mat(2), ...o
})
const sumW = (items) => items.reduce((s, i) => s + (i.totalMaterials || i.materials).reduce((a, m) => a + m.weight, 0), 0)
const sumAmt = (items) => items.reduce((s, i) => s + lineAmount(i, 1, 'THB'), 0)
const sumQty = (items) => items.reduce((s, i) => s + i.qty, 0)

describe('groupInvoiceLinesForPrint', () => {
  it('merges INV261113003 case into 1 line qty 6 with base number', () => {
    const items = [silver({ qty: 3 }), silver({ stockNumber: 'S2', stockNumberOrigin: 'R07416CZ9L-3', qty: 3 })]
    const out = groupInvoiceLinesForPrint(items)
    expect(out).toHaveLength(1)
    expect(out[0].qty).toBe(6)
    expect(out[0].stockNumberOrigin).toBe('R07416CZ9L')
    expect(sumQty(out)).toBe(sumQty(items))
    expect(sumAmt(out)).toBeCloseTo(sumAmt(items), 6)
    expect(sumW(out)).toBeCloseTo(sumW(items), 6)
  })

  it('does not merge different colour same mold', () => {
    const items = [silver({ stockNumberOrigin: 'R07416BZ9L-6' }), silver()]
    expect(groupInvoiceLinesForPrint(items)).toHaveLength(2)
  })

  it('does not merge different price or discount', () => {
    expect(groupInvoiceLinesForPrint([silver(), silver({ appraisalPrice: 1600 })])).toHaveLength(2)
    expect(groupInvoiceLinesForPrint([silver(), silver({ discountPercent: 5 })])).toHaveLength(2)
  })

  it('does not merge gold', () => {
    const gold = (o) => ({ stockNumberOrigin: 'G1-1', mold: 'M', productionType: 'Gold', appraisalPrice: 10, qty: 1, materials: [{ type: 'Gold', weight: 3 }], ...o })
    expect(groupInvoiceLinesForPrint([gold(), gold({ stockNumberOrigin: 'G1-2' })])).toHaveLength(2)
  })

  it('merges legacy codes without dash and keeps dash-only suffix as-is', () => {
    const legacy = [silver({ stockNumberOrigin: 'R00096CI9L2' }), silver({ stockNumberOrigin: 'R00096CI9L2' })]
    expect(groupInvoiceLinesForPrint(legacy)).toHaveLength(1)
    const dash = [silver({ stockNumberOrigin: 'R03970BZ9L-' }), silver({ stockNumberOrigin: 'R03970BZ9L' })]
    expect(groupInvoiceLinesForPrint(dash)).toHaveLength(2)
  })

  it('preserves order and does not mutate input', () => {
    const a = silver({ stockNumberOrigin: 'A-1', mold: 'MA' })
    const b = silver({ stockNumberOrigin: 'B-1', mold: 'MB' })
    const a2 = silver({ stockNumberOrigin: 'A-2', mold: 'MA' })
    const items = [a, b, a2]
    const snapshot = JSON.parse(JSON.stringify(items))
    const out = groupInvoiceLinesForPrint(items)
    expect(out.map((i) => i.mold)).toEqual(['MA', 'MB'])
    expect(out[0].qty).toBe(6)
    expect(items).toEqual(snapshot)
    expect(a.qty).toBe(3)
  })

  it('does not merge when stockNumberOrigin is empty (never falls back to stockNumber)', () => {
    const items = [
      silver({ stockNumberOrigin: '', stockNumber: 'DK-SIL-20H-002' }),
      silver({ stockNumberOrigin: '', stockNumber: 'DK-SIL-20H-003' })
    ]
    const out = groupInvoiceLinesForPrint(items)
    expect(out).toHaveLength(2)
    expect(out[0].stockNumber).toBe('DK-SIL-20H-002')
  })
})
