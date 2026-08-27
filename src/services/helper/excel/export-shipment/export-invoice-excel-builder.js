// ExportInvoiceExcelBuilder — Excel counterpart of ExportInvoicePdfBuilder
// Columns / totals / trailing text are kept 1:1 with the PDF layout.

import dayjs from 'dayjs'
import ExcelJS from 'exceljs'
import { numberToWords } from '@/services/helper/pdf/shared/pdf-format.js'
import { sumItems, fmtWeight, fmtDocMoney } from '@/services/helper/pdf/export-shipment/export-shipment-shared.js'
import {
  EXCEL_HEADER_FILL,
  stdBorder,
  buildCompanyHeaderExcel,
  buildConsigneeBlockExcel,
  downloadWorkbook
} from './export-shipment-excel-shared.js'

const CURRENCY_NAMES = {
  USD: 'US DOLLARS',
  THB: 'THAI BAHT',
  EUR: 'EUROS',
  GBP: 'BRITISH POUNDS',
  SGD: 'SINGAPORE DOLLARS',
  HKD: 'HONGKONG DOLLARS',
  JPY: 'JAPANESE YEN',
  CNY: 'CHINESE YUAN'
}

function amountInWords(amount, currency) {
  const code = String(currency || 'USD').trim().toUpperCase()
  const name = CURRENCY_NAMES[code] || code
  const whole = Math.round(Number(amount) || 0)
  return `(${name} ${numberToWords(whole).replace(/-/g, ' ')} ONLY)`
}

export class ExportInvoiceExcelBuilder {
  constructor(header, items) {
    this.header = header || {}
    this.items = Array.isArray(items) ? items : []
  }

  async prepare() {
    return this
  }

  buildItemsTable(worksheet, startRow) {
    let row = startRow
    const currency = this.header.currency || 'USD'
    const headers = [
      'ITEM NO.',
      'STOCK NO.',
      'DESCRIPTION',
      'Total Net WT.(GMS)',
      'Gold(GMS)',
      'Stone(CTS)',
      'Diamond(CTS)',
      'QTY(PCS)',
      `UNIT PRICE (${currency})`,
      `AMOUNT (${currency})`
    ]

    headers.forEach((text, idx) => {
      const col = String.fromCharCode(65 + idx)
      const cell = worksheet.getCell(`${col}${row}`)
      cell.value = text
      cell.font = { name: 'Arial', size: 9, bold: true }
      cell.fill = EXCEL_HEADER_FILL
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
      cell.border = stdBorder()
    })
    worksheet.getRow(row).height = 28
    row++

    this.items.forEach((it) => {
      const cells = [
        { col: 'A', value: it.itemNo ?? '', align: 'center' },
        { col: 'B', value: it.stockNumber || '', align: 'left' },
        { col: 'C', value: it.description || '', align: 'left' },
        { col: 'D', value: fmtWeight(it.netWeight, 3), align: 'right' },
        { col: 'E', value: fmtWeight(it.goldWeight, 2), align: 'right' },
        { col: 'F', value: fmtWeight(it.stoneWeight, 2), align: 'right' },
        { col: 'G', value: fmtWeight(it.diamondWeight, 3), align: 'right' },
        { col: 'H', value: it.qty ?? 0, align: 'center' },
        { col: 'I', value: fmtDocMoney(it.unitPrice, currency), align: 'right' },
        { col: 'J', value: fmtDocMoney(it.amount, currency), align: 'right' }
      ]
      cells.forEach(({ col, value, align }) => {
        const cell = worksheet.getCell(`${col}${row}`)
        cell.value = value
        cell.font = { name: 'Arial', size: 9 }
        cell.alignment = { vertical: 'middle', horizontal: align, wrapText: col === 'C' }
        cell.border = stdBorder()
      })
      row++
    })

    const totals = sumItems(this.items)
    const fobLabel = this.header.incoterm || 'F.O.B. Bangkok'

    worksheet.mergeCells(`A${row}:C${row}`)
    worksheet.getCell(`A${row}`).value = fobLabel
    worksheet.getCell(`A${row}`).font = { name: 'Arial', size: 9, bold: true }
    worksheet.getCell(`A${row}`).alignment = { horizontal: 'right' }
    ;['A', 'B', 'C'].forEach((c) => {
      worksheet.getCell(`${c}${row}`).fill = EXCEL_HEADER_FILL
      worksheet.getCell(`${c}${row}`).border = stdBorder()
    })

    const totalCells = [
      { col: 'D', value: fmtWeight(totals.netWeight, 3) },
      { col: 'E', value: fmtWeight(totals.goldWeight, 2) },
      { col: 'F', value: fmtWeight(totals.stoneWeight, 2) },
      { col: 'G', value: fmtWeight(totals.diamondWeight, 3) },
      { col: 'H', value: totals.qty },
      { col: 'I', value: '' },
      { col: 'J', value: fmtDocMoney(totals.amount, currency) }
    ]
    totalCells.forEach(({ col, value }) => {
      const cell = worksheet.getCell(`${col}${row}`)
      cell.value = value
      cell.font = { name: 'Arial', size: 9, bold: true }
      cell.alignment = { horizontal: 'right' }
      cell.fill = EXCEL_HEADER_FILL
      cell.border = stdBorder()
    })
    row += 2

    return { nextRow: row, totals }
  }

  buildFooter(worksheet, startRow, totals) {
    const currency = this.header.currency || 'USD'
    let row = startRow
    const parcelCount = Number(this.header.parcelCount) || 0
    const parcelText = parcelCount === 1 ? 'One parcel only' : `${parcelCount} parcels only`

    const lines = [
      amountInWords(totals.amount, currency),
      parcelText,
      'We certify that this invoice is true and correct.',
      `Net weight of merchandise ${fmtWeight(totals.netWeight, 3)} gms.`,
      `ORIGIN ${(this.header.originCountry || 'THAILAND').toUpperCase()}`
    ]

    lines.forEach((text) => {
      worksheet.mergeCells(`A${row}:J${row}`)
      const cell = worksheet.getCell(`A${row}`)
      cell.value = text
      cell.font = { name: 'Arial', size: 9 }
      row++
    })

    return row
  }

  autoFitColumns(worksheet) {
    const widths = { A: 8, B: 14, C: 32, D: 15, E: 12, F: 12, G: 12, H: 10, I: 15, J: 15 }
    Object.keys(widths).forEach((col) => {
      worksheet.getColumn(col).width = widths[col]
    })
  }

  async generateExcel() {
    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'DK Jewelry Management System'
    workbook.created = new Date()

    const worksheet = workbook.addWorksheet('INVOICE', {
      pageSetup: { paperSize: 9, orientation: 'landscape' }
    })

    let row = buildCompanyHeaderExcel(worksheet, 1, 'INVOICE', 'J')
    row = buildConsigneeBlockExcel(worksheet, this.header, row, 'INVOICE NO', 'J')
    const { nextRow, totals } = this.buildItemsTable(worksheet, row)
    this.buildFooter(worksheet, nextRow, totals)

    this.autoFitColumns(worksheet)

    return workbook
  }

  async downloadExcel(filename) {
    const workbook = await this.generateExcel()
    const name =
      filename || `ExportInvoice_${this.header.documentNumber || this.header.customNumber || 'export'}_${dayjs().format('YYYYMMDD')}.xlsx`
    return downloadWorkbook(workbook, name)
  }
}
