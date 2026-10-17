import { describe, it, expect } from 'vitest'

import { formatGoldBarcodeText, isGoldOrSilverMaterial } from './gold-barcode-text.js'

describe('formatGoldBarcodeText', () => {
  const gold = { type: 'Gold', qtyWeight: 0.83, qtyWeightUnit: 'g.' }

  it('gold plan keeps the type word', () => {
    expect(formatGoldBarcodeText(gold, false)).toBe('0.83 g. Gold')
    expect(formatGoldBarcodeText(gold)).toBe('0.83 g. Gold')
    expect(formatGoldBarcodeText({ ...gold, type: 'Silver' }, false)).toBe('0.83 g. Silver')
  })

  it('silver plan drops the type word for Gold and Silver materials', () => {
    expect(formatGoldBarcodeText(gold, true)).toBe('0.83 g.')
    expect(formatGoldBarcodeText({ ...gold, type: 'Silver' }, true)).toBe('0.83 g.')
  })

  it('handles missing unit', () => {
    expect(formatGoldBarcodeText({ type: 'Gold', qtyWeight: 1 }, true)).toBe('1')
    expect(formatGoldBarcodeText({ type: 'Gold', qtyWeight: 1 }, false)).toBe('1 Gold')
  })
})

describe('formatGoldBarcodeText — typeCode', () => {
  const base = { type: 'Gold', qtyWeight: 1.72, qtyWeightUnit: 'g.' }

  it.each([
    ['WG', '1.72 g. White Gold'],
    ['YG', '1.72 g. Yellow Gold'],
    ['PG', '1.72 g. Pink Gold'],
    ['NG', '1.72 g. Y/P Gold'],
    ['MG', '1.72 g. W/P Gold']
  ])('typeCode %s -> "%s"', (typeCode, expected) => {
    expect(formatGoldBarcodeText({ ...base, typeCode }, false)).toBe(expected)
  })

  it('empty or unknown typeCode falls back to type', () => {
    expect(formatGoldBarcodeText({ ...base, typeCode: '' }, false)).toBe('1.72 g. Gold')
    expect(formatGoldBarcodeText({ ...base, typeCode: 'XX' }, false)).toBe('1.72 g. Gold')
  })

  it('silver plan still drops the type word even with typeCode', () => {
    expect(formatGoldBarcodeText({ ...base, typeCode: 'WG' }, true)).toBe('1.72 g.')
    expect(formatGoldBarcodeText({ ...base, type: 'Silver', typeCode: 'SV' }, true)).toBe('1.72 g.')
  })
})

describe('isGoldOrSilverMaterial', () => {
  it('matches only Gold and Silver', () => {
    expect(isGoldOrSilverMaterial({ type: 'Gold' })).toBe(true)
    expect(isGoldOrSilverMaterial({ type: 'Silver' })).toBe(true)
    expect(isGoldOrSilverMaterial({ type: 'Gem' })).toBe(false)
    expect(isGoldOrSilverMaterial(null)).toBe(false)
  })
})
