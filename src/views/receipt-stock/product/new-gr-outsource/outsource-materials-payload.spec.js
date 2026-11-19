import { describe, it, expect } from 'vitest'

import { buildOutsourceMaterials } from './outsource-materials-payload.js'

describe('buildOutsourceMaterials', () => {
  it('maps weight, weightUnit, price and typeBarcode', () => {
    const [m] = buildOutsourceMaterials([
      { type: 'Gem', qty: 2, typeCode: 'RB', qtyWeight: '1.5', qtyWeightUnit: 'ct.', qtyPrice: 10, qtyWeightPrice: 100 }
    ])
    expect(m.weight).toBe(1.5)
    expect(m.weightUnit).toBe('ct.')
    expect(m.price).toBe(170)
    expect(m.typeBarcode).toBe('2RB1.5 ct.')
  })

  it('silver flag drops the type word on Gold', () => {
    const mat = { type: 'Gold', qtyWeight: 1, qtyWeightUnit: 'g.' }
    expect(buildOutsourceMaterials([mat], { isSilverPlan: true })[0].typeBarcode).toBe('1 g.')
    expect(buildOutsourceMaterials([mat])[0].typeBarcode).toBe('1 g. Gold')
  })

  it('keeps existing typeBarcode for types without a template', () => {
    const [m] = buildOutsourceMaterials([{ type: 'Worker', qty: 1, typeBarcode: 'ช่างA' }])
    expect(m.typeBarcode).toBe('ช่างA')
    expect(m.weight).toBeNull()
    expect(m.price).toBeNull()
  })

  it('null when nothing to build', () => {
    expect(buildOutsourceMaterials([{ type: 'ETC' }])[0].typeBarcode).toBeNull()
    expect(buildOutsourceMaterials(undefined)).toEqual([])
  })
})
