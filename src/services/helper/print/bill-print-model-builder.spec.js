import { describe, it, expect } from 'vitest'
import { buildBillPrintModel, computeBillTotals } from './bill-print-model-builder.js'

function makeItems(count) {
  return Array.from({ length: count }, (_, i) => ({
    stockNumber: `DK${i}`,
    productNumber: `P${i}`,
    productNameEN: `Ring ${i}`,
    qty: 1,
    appraisalPrice: 100,
    discountPercent: 0
  }))
}

function makeInvoice(soNumbers, itemCount = 1) {
  return {
    invoiceNo: 'INV-1',
    invoiceDate: '2026-10-21',
    customer: { name: 'Customer', address: 'Addr' },
    soNumbers,
    items: makeItems(itemCount),
    currencyRate: 1
  }
}

const LAYOUT = { rowHeight: 0.17, maxRowsPerPage: 25, offsetX: 0, offsetY: 0 }

function soLines(page, y0 = 7.6) {
  return page.filter((p) => p.y >= y0 - 0.0001 && p.y <= y0 + 0.17 * 2 + 0.0001 && p.align === 'left' && p.text.includes('SO'))
}

describe('buildBillPrintModel - SO number', () => {
  it('prints a single SO with label', () => {
    const model = buildBillPrintModel(makeInvoice(['SO261019002']), LAYOUT)
    const lines = soLines(model.pages[0])
    expect(lines).toHaveLength(1)
    expect(lines[0].text).toBe('SO No. SO261019002')
    expect(lines[0].x).toBeCloseTo(1.0)
    expect(lines[0].y).toBeCloseTo(7.6)
  })

  it('keeps 3 SO numbers on one line', () => {
    const model = buildBillPrintModel(makeInvoice(['SO261019001', 'SO261019002', 'SO261019003']), LAYOUT)
    const lines = soLines(model.pages[0])
    expect(lines).toHaveLength(1)
    expect(lines[0].text).toBe('SO No. SO261019001, SO261019002, SO261019003')
  })

  it('wraps 10 SO numbers into max 3 lines ending with (+N) without splitting a number', () => {
    const nums = Array.from({ length: 10 }, (_, i) => `SO2610190${String(i + 10)}`)
    const model = buildBillPrintModel(makeInvoice(nums), LAYOUT)
    const lines = soLines(model.pages[0])
    expect(lines).toHaveLength(3)
    expect(lines[0].text.startsWith('SO No. ')).toBe(true)
    expect(lines[1].x).toBeCloseTo(1.0 + 0.42)
    expect(lines[2].x).toBeCloseTo(1.0 + 0.42)
    const last = lines[2].text
    const m = last.match(/ \(\+(\d+)\)$/)
    expect(m).not.toBeNull()
    const printed = lines.map((l) => l.text.replace(/ \(\+\d+\)$/, '').replace('SO No. ', '')).join(', ').split(', ')
    printed.forEach((n) => expect(nums).toContain(n))
    expect(printed.length + Number(m[1])).toBe(10)
    lines.forEach((l) => expect(l.text.replace(/ \(\+\d+\)$/, '').length).toBeLessThanOrEqual(45))
  })

  it('prints SO on every page of a multi-page bill', () => {
    const model = buildBillPrintModel(makeInvoice(['SO261019002'], 30), LAYOUT)
    expect(model.pages).toHaveLength(2)
    model.pages.forEach((page) => {
      expect(page.some((p) => p.text === 'SO No. SO261019002')).toBe(true)
    })
  })

  it('prints nothing when showSoNumber is false', () => {
    const model = buildBillPrintModel(makeInvoice(['SO261019002']), { ...LAYOUT, showSoNumber: false })
    expect(model.pages[0].some((p) => p.text.includes('SO No.'))).toBe(false)
  })

  it('prints nothing when there are no SO numbers', () => {
    const model = buildBillPrintModel(makeInvoice([]), LAYOUT)
    expect(model.pages[0].some((p) => p.text.includes('SO No.'))).toBe(false)
  })
})

describe('buildBillPrintModel - total qty', () => {
  function totalQtyPrims(page, y = 7.6) {
    return page.filter((p) => p.align === 'right' && Math.abs(p.y - y) < 0.0001 && Math.abs(p.x - 3.75) < 0.0001 && p.fontSize === 12)
  }

  it('prints the summed qty on the last page only', () => {
    const invoice = makeInvoice([], 30)
    invoice.items[0].qty = 3
    const model = buildBillPrintModel(invoice, LAYOUT)
    expect(totalQtyPrims(model.pages[0])).toHaveLength(0)
    const prims = totalQtyPrims(model.pages[1])
    expect(prims).toHaveLength(1)
    expect(prims[0].text).toBe('32')
  })

  it('honours totalQty position and showTotalQty=false', () => {
    const pos = buildBillPrintModel(makeInvoice([], 2), { ...LAYOUT, totalQty: { x: 4, y: 9 } })
    expect(pos.pages[0].some((p) => p.text === '2' && p.x === 4 && p.y === 9)).toBe(true)
    const off = buildBillPrintModel(makeInvoice([], 2), { ...LAYOUT, showTotalQty: false })
    expect(totalQtyPrims(off.pages[0])).toHaveLength(0)
  })
})

describe('buildBillPrintModel - product code mode', () => {
  const codeOf = (model) => model.pages[0].find((p) => p.x === 1.1 && p.y === 3.1)?.text

  it('prints productNumber by default', () => {
    const invoice = makeInvoice([], 1)
    invoice.items[0].mold = 'M0'
    expect(codeOf(buildBillPrintModel(invoice, LAYOUT))).toBe('P0')
  })

  it('prints mold in mold mode and falls back to productNumber', () => {
    const invoice = makeInvoice([], 1)
    invoice.items[0].mold = 'M0'
    expect(codeOf(buildBillPrintModel(invoice, { ...LAYOUT, productCodeMode: 'mold' }))).toBe('M0')
    invoice.items[0].mold = ''
    expect(codeOf(buildBillPrintModel(invoice, { ...LAYOUT, productCodeMode: 'mold' }))).toBe('P0')
  })
})

describe('buildBillPrintModel - custom remark', () => {
  const remarkOf = (model) => model.pages[0].find((p) => p.x === 2.0 && Math.abs(p.y - (8.3 - 0.17)) < 0.0001)?.text

  function inv(customRemark, stems = []) {
    const invoice = makeInvoice([], stems.length || 1)
    invoice.customRemark = customRemark
    stems.forEach((s, i) => { invoice.items[i].earringStemSize = s })
    return invoice
  }

  it('prints custom remark alone as plain text', () => {
    expect(remarkOf(buildBillPrintModel(inv('รวม stud 10 ชิ้น'), LAYOUT))).toBe('รวม stud 10 ชิ้น')
  })

  it('joins custom remark and unique stem sizes', () => {
    expect(remarkOf(buildBillPrintModel(inv('note', ['10', '12', '10']), LAYOUT))).toBe('note, 10, 12')
  })

  it('prints custom remark but not stems when showRemark=false', () => {
    expect(remarkOf(buildBillPrintModel(inv('note', ['10']), { ...LAYOUT, showRemark: false }))).toBe('note')
    expect(remarkOf(buildBillPrintModel(inv('', ['10']), { ...LAYOUT, showRemark: false }))).toBeUndefined()
  })

  it('prints nothing when both are empty', () => {
    expect(remarkOf(buildBillPrintModel(inv(''), LAYOUT))).toBeUndefined()
  })
})

describe('buildBillPrintModel - footer VAT totals', () => {
  const items = [
    { qty: 1, appraisalPrice: 4650, discountPercent: 0 },
    { qty: 1, appraisalPrice: 4650, discountPercent: 0 }
  ]
  const inv = { invoiceNo: 'X', invoiceDate: '2026-11-01', customer: {}, soNumbers: [], items, currencyRate: 1 }

  it('keeps summaryVatPercent 0 as 0 (not 7)', () => {
    const model = buildBillPrintModel(inv, { ...LAYOUT, showVat: true, summaryVatPercent: 0, unitPriceMode: 'tag' })
    expect(model.totals.vat).toBe(0)
    expect(model.totals.grandTotal).toBeCloseTo(9300, 2)
  })

  it('falls back to 7 when percent is missing or NaN', () => {
    const a = buildBillPrintModel(inv, { ...LAYOUT, showVat: true })
    const b = buildBillPrintModel(inv, { ...LAYOUT, showVat: true, summaryVatPercent: 'abc' })
    expect(a.totals.vat).toBeCloseTo(651, 2)
    expect(b.totals.vat).toBeCloseTo(651, 2)
  })

  it('subVat mode + showVat 7 truncates to 2dp: 4345.79 x2 = 8691.58 + 608.41 = 9299.99', () => {
    const model = buildBillPrintModel(inv, { ...LAYOUT, showVat: true, summaryVatPercent: 7, unitPriceMode: 'subVat', unitVatPercent: 7 })
    expect(model.totals).toEqual({ subtotal: 8691.58, vat: 608.41, grandTotal: 9299.99 })
  })

  it('tag mode + showVat 7 inflates the total to 9,951', () => {
    const model = buildBillPrintModel(inv, { ...LAYOUT, showVat: true, summaryVatPercent: 7, unitPriceMode: 'tag' })
    expect(model.totals.subtotal).toBeCloseTo(9300, 2)
    expect(model.totals.vat).toBeCloseTo(651, 2)
    expect(model.totals.grandTotal).toBeCloseTo(9951, 2)
  })

  it('computeBillTotals matches the totals exposed on the model', () => {
    const layout = { ...LAYOUT, showVat: true, summaryVatPercent: 7, unitPriceMode: 'addVat', unitVatPercent: 7 }
    expect(computeBillTotals(inv, layout)).toEqual(buildBillPrintModel(inv, layout).totals)
  })
})

describe('buildBillPrintModel - truncation to 2 decimals (continuous bill)', () => {
  const mk = (prices, qty = 1) => ({
    invoiceNo: 'X', invoiceDate: '2026-11-01', customer: {}, soNumbers: [], currencyRate: 1,
    items: prices.map((p) => ({ qty, appraisalPrice: p, discountPercent: 0 }))
  })
  const SUB = { ...LAYOUT, showVat: true, summaryVatPercent: 7, unitPriceMode: 'subVat', unitVatPercent: 7 }
  const texts = (model) => model.pages[0].map((p) => p.text)

  it('subVat 7% + VAT 7%: 1424/3008/1616 prints 1330.84 / 2811.21 / 1510.28 and sums exactly', () => {
    const model = buildBillPrintModel(mk([1424, 3008, 1616]), SUB)
    expect(model.totals).toEqual({ subtotal: 5652.33, vat: 395.66, grandTotal: 6047.99 })
    const t = texts(model)
    ;['1,330.84', '2,811.21', '1,510.28', '5,652.33', '395.66', '6,047.99'].forEach((v) => expect(t).toContain(v))
    expect(computeBillTotals(mk([1424, 3008, 1616]), SUB)).toEqual(model.totals)
  })

  it('cuts instead of rounding when the third decimal is >= 5', () => {
    const model = buildBillPrintModel(mk([1.07 * 100.006]), { ...LAYOUT, unitPriceMode: 'subVat', unitVatPercent: 7, showVat: false })
    expect(model.totals.subtotal).toBe(100)
    const m2 = buildBillPrintModel(mk([100.019]), { ...LAYOUT, showVat: false })
    expect(m2.totals.subtotal).toBe(100.01)
    expect(texts(m2)).toContain('100.01')
  })

  it('truncates the line amount after unit price when qty > 1', () => {
    const model = buildBillPrintModel(mk([1424], 3), SUB)
    expect(texts(model)).toContain('1,330.84')
    expect(model.totals.subtotal).toBe(3992.52)
    expect(model.totals.vat).toBe(279.47)
    expect(model.totals.grandTotal).toBe(4271.99)
  })

  it('does not lose a cent on float traps (0.29, 1.005, 1330.84)', () => {
    const t = (price) => buildBillPrintModel(mk([price]), { ...LAYOUT, showVat: false }).totals.subtotal
    expect(t(0.29)).toBe(0.29)
    expect(t(1.005)).toBe(1)
    expect(t(1330.84)).toBe(1330.84)
    expect(t(1330.8399999)).toBe(1330.84)
    expect(t(4.35)).toBe(4.35)
    expect(t(1.15)).toBe(1.15)
  })

  it('VAT is cut: 100.01 x 7% = 7.0007 -> 7.00; 99.99 x 7% = 6.9993 -> 6.99', () => {
    expect(buildBillPrintModel(mk([100.01]), { ...LAYOUT, showVat: true, summaryVatPercent: 7 }).totals.vat).toBe(7)
    expect(buildBillPrintModel(mk([99.99]), { ...LAYOUT, showVat: true, summaryVatPercent: 7 }).totals.vat).toBe(6.99)
  })
})

describe('buildBillPrintModel - customer address newlines', () => {
  it('splits explicit newlines into separate lines', () => {
    const inv = { ...makeInvoice([]), customer: { name: 'C', address: 'a1\nb2\r\nc3' } }
    const texts = buildBillPrintModel(inv, LAYOUT).pages[0].map((p) => p.text)
    expect(texts).toEqual(expect.arrayContaining(['a1', 'b2', 'c3']))
  })

  it('caps address at 3 lines at default layout and never reaches the items area', () => {
    const long = Array.from({ length: 80 }, (_, i) => 'word' + i).join(' ')
    const inv = { ...makeInvoice([]), customer: { name: 'C', address: long } }
    const prims = buildBillPrintModel(inv, LAYOUT).pages[0].filter((p) => p.x === 1.2 && p.text.startsWith('word'))
    expect(prims).toHaveLength(3)
  })

  it('caps to 1 line when the items start right below the address', () => {
    const inv = { ...makeInvoice([]), customer: { name: 'C', address: 'a1\nb2\nc3' } }
    const layout = { ...LAYOUT, customerAddress: { x: 1.2, y: 2.15 }, itemsStart: { x: 0, y: 2.3 } }
    const texts = buildBillPrintModel(inv, layout).pages[0].map((p) => p.text)
    expect(texts).toContain('a1')
    expect(texts).not.toContain('b2')
  })
})
