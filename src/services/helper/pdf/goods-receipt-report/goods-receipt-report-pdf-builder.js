// GoodsReceiptReportPdfBuilder — รายงานรายการสินค้านำเข้า (งานผลิต / งานนอก ใช้ builder เดียวกัน)
// A4 แนวนอน ภาษาไทย ใช้ font THSarabunNew (AcherusGrotesque/ChakraPetch ไม่มี glyph ไทย)

import dayjs from 'dayjs'
import { initPdfMake } from '@/services/utils/pdf-make'
import { PDF_COLORS } from '@/services/helper/pdf/shared/pdf-theme.js'
import {
  STONE_GROUPS,
  buildReportRows,
  buildReportTotals,
  formatReportNumber,
  formatThaiDate
} from '@/services/helper/goods-receipt-report/goods-receipt-report.js'

const REPORT_FONT = 'THSarabunNew'
const FONT_SIZE = 10
const PAGE_WIDTH = 841.89
const MARGIN_X = 20
const CELL_PADDING_X = 1.5
const V_LINE_WIDTH = 0.5
const SAFETY_BUFFER = 3

// ความกว้างเนื้อหาต่อคอลัมน์ (fixed ทั้งหมด — ห้ามใช้ '*' เพราะดันตารางล้นกระดาษ)
// date, mold, productNumber, detail, goldType, goldWeight, (qty+weight)x5, qty, sales
export const REPORT_COLUMN_WIDTHS = [
  42, 50, 68, 150, 30, 38,
  20, 34, 20, 34, 20, 34, 20, 34, 20, 34,
  26, 50
]

// ความกว้างตารางที่ render จริง = Σwidths + คอลัมน์ × (padding ซ้าย+ขวา) + (คอลัมน์+1) × เส้นแนวตั้ง
export function calcRenderedTableWidth(widths = REPORT_COLUMN_WIDTHS) {
  const sum = widths.reduce((acc, w) => acc + w, 0)
  return sum + widths.length * CELL_PADDING_X * 2 + (widths.length + 1) * V_LINE_WIDTH
}

export const MAX_TABLE_WIDTH = PAGE_WIDTH - MARGIN_X * 2 - SAFETY_BUFFER

export class GoodsReceiptReportPdfBuilder {
  constructor({ items, aggregates, labels, mode, receiptDateStart, receiptDateEnd } = {}) {
    this.mode = mode === 'outsource' ? 'outsource' : 'production'
    this.labels = labels || {}
    this.rows = buildReportRows(items, this.mode)
    this.totals = buildReportTotals(aggregates)
    this.receiptDateStart = receiptDateStart || null
    this.receiptDateEnd = receiptDateEnd || null
  }

  _headerCell(text, extra = {}) {
    return {
      text,
      bold: true,
      alignment: 'center',
      fillColor: PDF_COLORS.panelBg,
      margin: [0, 1, 0, 1],
      ...extra
    }
  }

  _headerRows() {
    const l = this.labels
    const span2 = (text) => [this._headerCell(text, { colSpan: 2 }), {}]
    const rowSpan = (text) => this._headerCell(text, { rowSpan: 2, margin: [0, 6, 0, 0] })
    const skip = () => ({})

    const top = [
      rowSpan(l.receiptDate),
      rowSpan(l.pdfStyleNo),
      rowSpan(l.productNumber),
      rowSpan(l.detail),
      ...span2(l.pdfGold),
      ...STONE_GROUPS.flatMap((group) => span2(l.stones?.[group])),
      rowSpan(l.qty),
      rowSpan(l.salesPrice)
    ]

    const bottom = [
      skip(),
      skip(),
      skip(),
      skip(),
      this._headerCell(l.pdfGoldTypeShort),
      this._headerCell(l.weightShort),
      ...STONE_GROUPS.flatMap(() => [this._headerCell(l.qtyShort), this._headerCell(l.weightShort)]),
      skip(),
      skip()
    ]

    return [top, bottom]
  }

  _num(value, decimals) {
    return { text: value ? formatReportNumber(value, decimals) : '', alignment: 'right' }
  }

  _detailCell(row) {
    const l = this.labels
    const ref =
      this.mode === 'outsource'
        ? [row.vendor, row.poNumber ? `${l.poNumber}: ${row.poNumber}` : ''].filter(Boolean).join('  ')
        : row.wo
          ? `${l.wo}: ${row.wo}`
          : ''
    const stack = [{ text: row.detail }]
    if (ref) stack.push({ text: ref, color: PDF_COLORS.darkGray })
    return { stack }
  }

  _dataRow(row) {
    return [
      { text: row.receiptDate },
      { text: row.mold },
      { text: row.productNumber },
      this._detailCell(row),
      { text: row.goldType, alignment: 'center' },
      this._num(row.goldWeight, 2),
      ...STONE_GROUPS.flatMap((group) => [
        this._num(row[`${group}Qty`], 0),
        this._num(row[`${group}Weight`], 3)
      ]),
      this._num(row.qty, 0),
      this._num(row.productPrice, 2)
    ]
  }

  _totalRow() {
    const t = this.totals
    const cell = (text, alignment = 'right', extra = {}) => ({
      text,
      bold: true,
      alignment,
      fillColor: PDF_COLORS.lightGray,
      ...extra
    })
    return [
      cell(this.labels.grandTotal, 'left', { colSpan: 5 }),
      {},
      {},
      {},
      {},
      cell(formatReportNumber(t.goldWeight, 2)),
      ...STONE_GROUPS.flatMap((group) => [
        cell(formatReportNumber(t[`${group}Qty`], 0)),
        cell(formatReportNumber(t[`${group}Weight`], 3))
      ]),
      cell(formatReportNumber(t.qty, 0)),
      cell(formatReportNumber(t.productPrice, 2))
    ]
  }

  getTableContent() {
    const [top, bottom] = this._headerRows()
    return {
      margin: [0, 6, 0, 0],
      table: {
        headerRows: 2,
        dontBreakRows: true,
        widths: REPORT_COLUMN_WIDTHS,
        body: [top, bottom, ...this.rows.map((row) => this._dataRow(row)), this._totalRow()]
      },
      layout: {
        hLineWidth: () => V_LINE_WIDTH,
        vLineWidth: () => V_LINE_WIDTH,
        hLineColor: () => PDF_COLORS.muted,
        vLineColor: () => PDF_COLORS.muted,
        paddingLeft: () => CELL_PADDING_X,
        paddingRight: () => CELL_PADDING_X,
        paddingTop: () => 1,
        paddingBottom: () => 1
      }
    }
  }

  _periodText() {
    const l = this.labels
    const modeLabel = this.mode === 'outsource' ? l.modeOutsource : l.modeProduction
    const start = formatThaiDate(this.receiptDateStart)
    const end = formatThaiDate(this.receiptDateEnd)
    const period = start || end ? `${l.pdfPeriod} ${start} - ${end}` : ''
    return [modeLabel, period].filter(Boolean).join('    ')
  }

  getDocDefinition() {
    const l = this.labels
    const printDate = formatThaiDate(dayjs().toDate())

    return {
      pageSize: 'A4',
      pageOrientation: 'landscape',
      pageMargins: [MARGIN_X, 40, MARGIN_X, 30],
      defaultStyle: { font: REPORT_FONT, fontSize: FONT_SIZE, lineHeight: 0.85 },
      header: (currentPage, pageCount) => ({
        text: `${l.pdfPage} ${currentPage}/${pageCount}    ${l.pdfDate} ${printDate}`,
        alignment: 'right',
        fontSize: FONT_SIZE,
        margin: [MARGIN_X, 14, MARGIN_X, 0]
      }),
      content: [
        { text: l.pdfTitle, alignment: 'center', bold: true, fontSize: 18 },
        { text: this._periodText(), alignment: 'center', fontSize: 11 },
        this.getTableContent()
      ]
    }
  }

  async generatePDF() {
    const pdfMake = initPdfMake()
    return pdfMake.createPdf(this.getDocDefinition())
  }

  async downloadPDF(filename) {
    const pdf = await this.generatePDF()
    pdf.download(filename || `goods-receipt-report_${dayjs().format('YYYYMMDD')}.pdf`)
  }
}
