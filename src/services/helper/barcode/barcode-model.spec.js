import { describe, it, expect } from 'vitest'
import { buildBarcodeModel } from './barcode-model.js'

describe('buildBarcodeModel — isSilver', () => {
  it.each(['Silver', 'SILVER', 'silver'])('productionTypeSize "%s" -> isSilver true', (size) => {
    expect(buildBarcodeModel({ productionTypeSize: size }).isSilver).toBe(true)
  })

  it.each(['18K', '9K', '', null, undefined])('productionTypeSize %s -> isSilver false', (size) => {
    expect(buildBarcodeModel({ productionTypeSize: size }).isSilver).toBe(false)
  })

  it('stock ว่าง -> isSilver false', () => {
    expect(buildBarcodeModel(null).isSilver).toBe(false)
  })

  it('Silver material เข้า gold text เหมือน Gold และ goldType คงค่าเดิม', () => {
    const model = buildBarcodeModel({
      productionTypeSize: 'Silver',
      materials: [
        { type: 'Silver', typeBarcode: '5.2G SV' },
        { type: 'Gem', typeBarcode: 'RB' }
      ]
    })
    expect(model.gold).toBe('5.2G SV')
    expect(model.goldType).toBe('Silver')
    expect(model.gems).toEqual(['RB'])
  })
})
