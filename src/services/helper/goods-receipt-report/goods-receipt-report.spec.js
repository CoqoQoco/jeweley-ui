import { describe, it, expect } from 'vitest'
import {
  buildReportColumns,
  buildGrandTotalCells,
  buildReportRows,
  buildReportTotals,
  buildReportLabels,
  buildExcelRows,
  formatReportNumber,
  formatThaiDate
} from './goods-receipt-report.js'
import {
  GoodsReceiptReportPdfBuilder,
  REPORT_COLUMN_WIDTHS,
  calcRenderedTableWidth,
  MAX_TABLE_WIDTH
} from '@/services/helper/pdf/goods-receipt-report/goods-receipt-report-pdf-builder.js'

const t = (key) => key.split('.').pop()
const labels = buildReportLabels(t)

const items = [
  {
    receiptDate: '2026-10-01T03:00:00Z',
    mold: 'CN-1',
    productNumber: 'R01',
    productNameTh: 'แหวน',
    woText: 'WO1-2',
    goldType: '18K',
    goldWeight: 3.5,
    diamondQty: 2,
    diamondWeight: 0.123,
    qty: 1,
    productPrice: 1500
  },
  { productNumber: 'R02', vendor: 'V1', poNumber: 'PO9', qty: 2, productPrice: 100.5 }
]
const aggregates = {
  totalQty: 3,
  totalSales: 1600.5,
  goldWeight: 3.5,
  diamondQty: 2,
  diamondWeight: 0.123
}

describe('goods-receipt-report helper', () => {
  it('formatReportNumber / formatThaiDate', () => {
    expect(formatReportNumber(1234.5, 2)).toBe('1,234.50')
    expect(formatReportNumber(null, 0)).toBe('0')
    expect(formatThaiDate('2026-10-13T05:00:00')).toBe('13/10/2569')
    expect(formatThaiDate(null)).toBe('')
  })

  it('columns: production has WO, outsource has vendor/PO, both have stone columns', () => {
    const prod = buildReportColumns(t, 'production').map((c) => c.field)
    const out = buildReportColumns(t, 'outsource').map((c) => c.field)
    expect(prod).toContain('woText')
    expect(prod).not.toContain('vendor')
    expect(out).toEqual(expect.arrayContaining(['vendor', 'poNumber']))
    expect(out).not.toContain('woText')
    ;[prod, out].forEach((cols) => {
      expect(cols).toEqual(
        expect.arrayContaining(['goldType', 'goldWeight', 'rubyQty', 'otherWeight', 'qty', 'productPrice'])
      )
    })
  })

  it('grand total cells: label colspan before first numeric column, values from aggregates', () => {
    const columns = buildReportColumns(t, 'production')
    const cells = buildGrandTotalCells(columns, aggregates, 'GT')
    expect(cells[0]).toMatchObject({ key: 'label', text: 'GT', align: 'left' })
    expect(cells.reduce((acc, c) => acc + c.colspan, 0)).toBe(columns.length)
    const byKey = Object.fromEntries(cells.map((c) => [c.key, c.text]))
    expect(byKey.goldWeight).toBe('3.50')
    expect(byKey.diamondWeight).toBe('0.123')
    expect(byKey.qty).toBe('3')
    expect(byKey.productPrice).toBe('1,600.50')
    expect(byKey.goldType).toBeUndefined()
  })

  it('rows + totals normalize missing values to 0', () => {
    const rows = buildReportRows(items, 'outsource')
    expect(rows[1]).toMatchObject({ vendor: 'V1', poNumber: 'PO9', goldWeight: 0, rubyQty: 0 })
    expect(buildReportRows(items, 'production')[0].wo).toBe('WO1-2')
    expect(buildReportTotals(aggregates)).toMatchObject({ qty: 3, productPrice: 1600.5, rubyQty: 0 })
  })

  it('excel rows: last row is Grand Total with same keys', () => {
    const rows = buildExcelRows(items, aggregates, labels, 'production')
    expect(rows).toHaveLength(3)
    expect(Object.keys(rows[2])).toEqual(Object.keys(rows[0]))
    expect(rows[2][labels.receiptDate]).toBe(labels.grandTotal)
    expect(rows[2][labels.qty]).toBe(3)
    expect(rows[2][labels.salesPrice]).toBe(1600.5)
    expect(rows[0][`${labels.stones.diamond} ${labels.qtyShort}`]).toBe(2)
    const outsource = buildExcelRows(items, aggregates, labels, 'outsource')
    expect(Object.keys(outsource[0])).toEqual(expect.arrayContaining([labels.vendor, labels.poNumber]))
    expect(Object.keys(outsource[0])).not.toContain(labels.wo)
  })
})

describe('GoodsReceiptReportPdfBuilder', () => {
  it('table fits landscape A4 content width', () => {
    expect(calcRenderedTableWidth(REPORT_COLUMN_WIDTHS)).toBeLessThanOrEqual(MAX_TABLE_WIDTH)
  })

  it('doc definition: landscape, THSarabunNew, 2 header rows, consistent column count', () => {
    const builder = new GoodsReceiptReportPdfBuilder({
      items,
      aggregates,
      labels,
      mode: 'production',
      receiptDateStart: '2026-10-01',
      receiptDateEnd: '2026-10-13'
    })
    const doc = builder.getDocDefinition()
    expect(doc.pageOrientation).toBe('landscape')
    expect(doc.defaultStyle.font).toBe('THSarabunNew')
    const { table } = doc.content[2]
    expect(table.headerRows).toBe(2)
    expect(table.widths).not.toContain('*')
    table.body.forEach((row) => expect(row).toHaveLength(table.widths.length))
    expect(table.body).toHaveLength(2 + items.length + 1)
    expect(table.body.at(-1)[0].text).toBe(labels.grandTotal)
  })
})
