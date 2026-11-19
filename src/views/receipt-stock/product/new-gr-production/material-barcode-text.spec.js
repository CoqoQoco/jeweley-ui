import { describe, it, expect } from 'vitest'

import { buildMaterialBarcodeText } from './material-barcode-text.js'

describe('buildMaterialBarcodeText', () => {
  it('Gem', () => {
    const m = { type: 'Gem', qty: 2, typeCode: 'RB', qtyWeight: 1.5, qtyWeightUnit: 'ct.' }
    expect(buildMaterialBarcodeText(m)).toBe('2RB1.5 ct.')
    expect(buildMaterialBarcodeText({ ...m, size: '3x3', region: 'TH' })).toBe('2RB1.5 ct., 3x3, (TH)')
  })

  it('Diamond with/without region and size', () => {
    const m = { type: 'Diamond', qty: 3, qtyWeight: 0.3, qtyWeightUnit: 'ct.', typeCode: 'VS' }
    expect(buildMaterialBarcodeText(m)).toBe('3Diamond0.3 ct., VS ')
    expect(buildMaterialBarcodeText({ ...m, size: '1.2' })).toBe('3Diamond0.3 ct., VS, 1.2 ')
    expect(buildMaterialBarcodeText({ ...m, size: '1.2', region: 'BE' })).toBe(
      '3Diamond0.3 ct., VS, 1.2 , (BE)'
    )
    expect(buildMaterialBarcodeText({ ...m, region: 'BE' })).toBe('3Diamond0.3 ct., VS , (BE)')
  })

  it('Gold and Silver follow isSilverPlan', () => {
    const g = { type: 'Gold', qtyWeight: 0.83, qtyWeightUnit: 'g.' }
    expect(buildMaterialBarcodeText(g)).toBe('0.83 g. Gold')
    expect(buildMaterialBarcodeText(g, { isSilverPlan: true })).toBe('0.83 g.')
    const s = { ...g, type: 'Silver' }
    expect(buildMaterialBarcodeText(s, { isSilverPlan: false })).toBe('0.83 g. Silver')
    expect(buildMaterialBarcodeText(s, { isSilverPlan: true })).toBe('0.83 g.')
  })

  it('other types return empty string', () => {
    expect(buildMaterialBarcodeText({ type: 'Worker', qty: 1 })).toBe('')
    expect(buildMaterialBarcodeText({ type: 'ETC', qty: 1 })).toBe('')
  })

  it('qty 0 is kept', () => {
    expect(buildMaterialBarcodeText({ type: 'Gem', qty: 0, typeCode: 'RB' })).toBe('0RB')
  })
})
