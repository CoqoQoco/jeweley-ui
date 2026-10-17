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

describe('buildBarcodeModel — gold name from typeCode', () => {
  const goldOf = (typeCode, typeBarcode = '1.72 g. Gold', type = 'Gold') =>
    buildBarcodeModel({ materials: [{ type, typeCode, typeBarcode }] }).gold

  it.each([
    ['WG', '1.72 g. White Gold'],
    ['YG', '1.72 g. Yellow Gold'],
    ['PG', '1.72 g. Pink Gold'],
    ['NG', '1.72 g. Y/P Gold'],
    ['MG', '1.72 g. W/P Gold']
  ])('typeCode %s -> "%s"', (code, expected) => {
    expect(goldOf(code)).toBe(expected)
  })

  it.each(['', null, undefined, 'XX'])('typeCode %s keeps stored text', (code) => {
    expect(goldOf(code)).toBe('1.72 g. Gold')
  })

  it('Silver with SV keeps "Silver", silver-plan text without type word is untouched', () => {
    expect(goldOf('SV', '0.83 g. Silver', 'Silver')).toBe('0.83 g. Silver')
    expect(goldOf('SV', '0.83 g.', 'Silver')).toBe('0.83 g.')
  })
})
