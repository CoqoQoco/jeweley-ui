import { describe, it, expect } from 'vitest'
import { buildBillPrintModel } from './bill-print-model-builder.js'

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
