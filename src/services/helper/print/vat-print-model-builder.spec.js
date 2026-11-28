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

describe('buildVatPrintModel - vatMode include (TK202611250002)', () => {
  const rows = [3560, 7520, 4040].map((p) => ({ productNameEN: 'X', qty: 1, appraisalPrice: p, discountPercent: 60 }))

  it('INV261112012 include @7% => rows ex-VAT, 5,652.34 / 395.66 / 6,048.00', () => {
    const inv = invoiceWith(0, 7, { items: rows })
    const texts = summaryTexts(buildVatPrintModel(inv, null, { vatMode: 'include' }))
    for (const t of ['1,330.84', '2,811.21', '1,510.28', '5,652.34', '395.66', '6,048.00']) {
      expect(texts).toContain(t)
    }
  })

  it('exclude keeps the old behaviour (adds VAT on top)', () => {
    const inv = invoiceWith(0, 7, { items: rows })
    const texts = summaryTexts(buildVatPrintModel(inv, null, { vatMode: 'exclude' }))
    expect(texts).toContain('6,048.00')
    expect(texts).toContain('423.36')
    expect(texts).toContain('6,471.36')
  })

  it('include with qty > 1 => unit 934.58, amount 2,803.74, VAT 196.26, total 3,000.00', () => {
    const inv = invoiceWith(0, 7, { items: [{ productNameEN: 'X', qty: 3, appraisalPrice: 1000, discountPercent: 0 }] })
    const texts = summaryTexts(buildVatPrintModel(inv, null, { vatMode: 'include' }))
    for (const t of ['934.58', '2,803.74', '196.26', '3,000.00']) expect(texts).toContain(t)
  })

  it('include with showDecimals=false => 1,000 / 70 / 1,070', () => {
    const texts = summaryTexts(buildVatPrintModel(invoiceWith(1070, 7), null, { vatMode: 'include', showDecimals: false }))
    for (const t of ['1,000', '70', '1,070']) expect(texts).toContain(t)
  })

  it('include with 0% VAT behaves like exclude', () => {
    const texts = summaryTexts(buildVatPrintModel(invoiceWith(500, 0), null, { vatMode: 'include' }))
    expect(texts.filter((t) => t === '500.00').length).toBeGreaterThanOrEqual(3)
  })
})

describe('buildVatPrintModel - vatIncluded invoice (include mode uses invoice figures)', () => {
  const rows = [3560, 7520, 4040].map((p) => ({ productNameEN: 'X', qty: 1, appraisalPrice: p, discountPercent: 60 }))

  it('INV261112012 vatIncluded => 5,652.33 / 395.66 / 6,047.99', () => {
    const inv = invoiceWith(0, 7, { items: rows, vatIncluded: true })
    const texts = summaryTexts(buildVatPrintModel(inv, null, { vatMode: 'include' }))
    for (const t of ['1,330.84', '2,811.21', '1,510.28', '5,652.33', '395.66', '6,047.99']) {
      expect(texts).toContain(t)
    }
  })

  it('specials are VAT-inclusive: 50010.24 less 10.24 => 46,728.97 / 3,271.03 / 50,000.00', () => {
    const inv = invoiceWith(50010.24, 7, { vatIncluded: true, specialDiscount: 10.24 })
    const texts = summaryTexts(buildVatPrintModel(inv, null, { vatMode: 'include' }))
    for (const t of ['46,728.97', '3,271.03', '50,000.00']) expect(texts).toContain(t)
  })

  it('exclude mode on a vatIncluded invoice keeps the legacy path', () => {
    const inv = invoiceWith(0, 7, { items: rows, vatIncluded: true })
    const texts = summaryTexts(buildVatPrintModel(inv, null, { vatMode: 'exclude' }))
    expect(texts).toContain('6,471.36')
  })
})

describe('buildVatPrintModel - customer address wrapping', () => {
  const addrPrims = (model, y) => model.pages[0].filter((p) => Math.abs(p.y - y) < 0.0001 && Math.abs(p.x - VAT_LAYOUT_DEFAULTS.vat.customerAddress.x) < 0.0001)

  it('splits explicit newlines into separate lines at rowHeight spacing', () => {
    const D = VAT_LAYOUT_DEFAULTS.vat
    const model = buildVatPrintModel(invoiceWith(100, 7, { customer: { name: 'A', address: 'line1\nline2\r\nline3' } }), null)
    const texts = model.pages[0].map((p) => p.text)
    expect(texts).toEqual(expect.arrayContaining(['line1', 'line2', 'line3']))
    expect(addrPrims(model, D.customerAddress.y)[0].text).toBe('line1')
    expect(addrPrims(model, D.customerAddress.y + D.rowHeight)[0].text).toBe('line2')
    expect(addrPrims(model, D.customerAddress.y + 2 * D.rowHeight)[0].text).toBe('line3')
  })

  it('wraps a long address at 70 chars and caps at 3 lines', () => {
    const long = Array.from({ length: 60 }, (_, i) => 'word' + i).join(' ')
    const model = buildVatPrintModel(invoiceWith(100, 7, { customer: { name: 'A', address: long } }), null)
    const D = VAT_LAYOUT_DEFAULTS.vat
    const lines = [0, 1, 2, 3].map((i) => addrPrims(model, D.customerAddress.y + i * D.rowHeight)[0]?.text)
    expect(lines[0].length).toBeLessThanOrEqual(56)
    expect(lines[1]).toBeTruthy()
    expect(lines[2]).toBeTruthy()
    expect(lines[3]).toBeUndefined()
  })
})

describe('buildVatPrintModel - customer address on vat-v2 (tax id directly below)', () => {
  const D2 = VAT_LAYOUT_DEFAULTS['vat-v2']
  const addrAtX = (model) => model.pages[0].filter((p) => Math.abs(p.x - D2.customerAddress.x) < 0.0001 && p.y >= D2.customerAddress.y - 0.0001 && p.y < D2.itemsStart.y)

  it('long address stays one full primitive (no truncation)', () => {
    const long = Array.from({ length: 60 }, (_, i) => 'word' + i).join(' ')
    const model = buildVatPrintModel(invoiceWith(100, 7, { customer: { name: 'A', address: long }, customerTaxId: 'TAX1' }), null, { layoutKey: 'vat-v2' })
    const prims = addrAtX(model).filter((p) => p.text.startsWith('word0'))
    expect(prims).toHaveLength(1)
    expect(prims[0].text).toBe(long)
    expect(prims[0].fontSize).toBe(8)
  })

  it('address longer than the room shrinks font proportionally (60 chars fit at 12pt)', () => {
    const addr = 'x'.repeat(80)
    const model = buildVatPrintModel(invoiceWith(100, 7, { customer: { name: 'A', address: addr } }), null, { layoutKey: 'vat-v2' })
    const p = model.pages[0].find((q) => q.text === addr)
    expect(p.fontSize).toBeCloseTo(12 * 60 / 80, 5)
  })

  it('short address keeps header font size', () => {
    const model = buildVatPrintModel(invoiceWith(100, 7, { customer: { name: 'A', address: 'short' } }), null, { layoutKey: 'vat-v2' })
    expect(model.pages[0].find((q) => q.text === 'short').fontSize).toBe(12)
  })

  it('newline address is joined with a space into one primitive', () => {
    const model = buildVatPrintModel(invoiceWith(100, 7, { customer: { name: 'A', address: 'line1\nline2' } }), null, { layoutKey: 'vat-v2' })
    const texts = model.pages[0].map((p) => p.text)
    expect(texts).toContain('line1 line2')
    expect(texts).not.toContain('line1')
  })
})
