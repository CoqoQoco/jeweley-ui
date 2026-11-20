import { describe, it, expect } from 'vitest'
import { buildVatPrintModel } from './vat-print-model-builder.js'
import { VAT_LAYOUT_DEFAULTS } from './vat-layout-defaults.js'

function invoiceWith(price, vatPercent, extra = {}) {
  return {
    invoiceNo: 'INV1',
    invoiceDate: '2026-11-20',
    customer: { name: 'A', address: 'B' },
    items: [{ productNameEN: 'X', qty: 1, appraisalPrice: price, discountPercent: 0 }],
    currencyRate: 1,
    vatPercent,
    ...extra
  }
}

function summaryTexts(model) {
  const prims = model.pages[model.pages.length - 1]
  return prims.map((p) => p.text)
}

describe('buildVatPrintModel - VAT totals', () => {
  it('14,874.76 @7% => 1,041.23 / 15,915.99', () => {
    const texts = summaryTexts(buildVatPrintModel(invoiceWith(14874.76, 7), null))
    expect(texts).toContain('14,874.76')
    expect(texts).toContain('1,041.23')
    expect(texts).toContain('15,915.99')
  })

  it('rounds subtotal first: 100.0049 @7% => 100.00 / 7.00 / 107.00', () => {
    const texts = summaryTexts(buildVatPrintModel(invoiceWith(100.0049, 7), null))
    expect(texts).toContain('100.00')
    expect(texts).toContain('7.00')
    expect(texts).toContain('107.00')
  })

  it('0% VAT prints 0.00 and total = subtotal', () => {
    const texts = summaryTexts(buildVatPrintModel(invoiceWith(500, 0), null))
    expect(texts).toContain('0.00')
    expect(texts.filter((t) => t === '500.00').length).toBeGreaterThanOrEqual(3)
  })
})

describe('buildVatPrintModel - layout versions', () => {
  const find = (model, text) => model.pages[0].find((p) => p.text === text)

  it('v1 (default) keeps the original coordinates', () => {
    const model = buildVatPrintModel(invoiceWith(100, 7), null)
    const no = find(model, 'INV1')
    expect(no.x).toBe(6.0)
    expect(no.y).toBe(1.8)
    const qty = model.pages[0].find((p) => p.text === '1' && p.align === 'right')
    expect(qty.x).toBe(4.15)
    expect(model.pages[0].some((p) => p.x === 6.5 && p.y === 7.6)).toBe(true)
  })

  it('v2 uses its own defaults', () => {
    const model = buildVatPrintModel(invoiceWith(100, 7), null, { layoutKey: 'vat-v2' })
    const d = VAT_LAYOUT_DEFAULTS['vat-v2']
    const no = find(model, 'INV1')
    expect(no.x).toBe(d.invoiceNo.x)
    expect(no.y).toBe(d.invoiceNo.y)
    expect(d.invoiceNo.x).not.toBe(VAT_LAYOUT_DEFAULTS.vat.invoiceNo.x)
  })

  it('v2 prints total quantity, v1 does not', () => {
    const items = [
      { productNameEN: 'X', qty: 2, appraisalPrice: 10, discountPercent: 0 },
      { productNameEN: 'Y', qty: 3, appraisalPrice: 10, discountPercent: 0 }
    ]
    const v2 = buildVatPrintModel(invoiceWith(0, 7, { items }), null, { layoutKey: 'vat-v2' })
    const d = VAT_LAYOUT_DEFAULTS['vat-v2'].totalQty
    expect(v2.pages[0].some((p) => p.text === '5' && p.x === d.x && p.y === d.y)).toBe(true)
    const v1 = buildVatPrintModel(invoiceWith(0, 7, { items }), null)
    expect(v1.pages[0].some((p) => p.text === '5')).toBe(false)
  })

  it('saved layout overrides defaults per key', () => {
    const model = buildVatPrintModel(invoiceWith(100, 7), { invoiceNo: { x: 3, y: 4 } }, { layoutKey: 'vat-v2' })
    const no = find(model, 'INV1')
    expect(no.x).toBe(3)
    expect(no.y).toBe(4)
  })
})

describe('buildVatPrintModel - showDecimals=false and VAT clamp', () => {
  it('100.49 @7% without decimals => 100 / 7 / 107', () => {
    const texts = summaryTexts(buildVatPrintModel(invoiceWith(100.49, 7), null, { showDecimals: false }))
    expect(texts).toContain('100')
    expect(texts).toContain('7')
    expect(texts).toContain('107')
  })

  it('negative VAT percent clamps to 0', () => {
    const texts = summaryTexts(buildVatPrintModel(invoiceWith(500, -7), null))
    expect(texts).not.toContain('-35.00')
    expect(texts.filter((t) => t === '500.00').length).toBeGreaterThanOrEqual(3)
  })

  it('VAT percent above 100 clamps to 100', () => {
    const texts = summaryTexts(buildVatPrintModel(invoiceWith(100, 250), null))
    expect(texts).toContain('200.00')
  })
})
