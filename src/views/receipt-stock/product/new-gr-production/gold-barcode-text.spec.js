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

describe('isGoldOrSilverMaterial', () => {
  it('matches only Gold and Silver', () => {
    expect(isGoldOrSilverMaterial({ type: 'Gold' })).toBe(true)
    expect(isGoldOrSilverMaterial({ type: 'Silver' })).toBe(true)
    expect(isGoldOrSilverMaterial({ type: 'Gem' })).toBe(false)
    expect(isGoldOrSilverMaterial(null)).toBe(false)
  })
})
