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
