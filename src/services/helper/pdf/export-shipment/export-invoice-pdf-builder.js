// ExportInvoicePdfBuilder — reproduces the customer's real export invoice layout
// (CONSIGNED TO block, item table, F.O.B. total row, amount-in-words, certify text)

import { initPdfMake } from '@/services/utils/pdf-make'
import { PDF_FONT } from '@/services/helper/pdf/shared/pdf-theme.js'
import { numberToWords } from '@/services/helper/pdf/shared/pdf-format.js'
import {
  buildDocHeader,
  buildConsigneeBlock,
  sumItems,
  fmtWeight,
  fmtDocMoney,
  TABLE_LAYOUT_THIN
} from './export-shipment-shared.js'

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
    // ใบตัวอย่างของลูกค้าเขียนเลขเป็นคำแบบเว้นวรรค (SIXTY THREE) ไม่ใช้ยัติภังค์
  return `(${name} ${numberToWords(whole).replace(/-/g, " ")} ONLY)`
}

export class ExportInvoicePdfBuilder {
  constructor(header, items) {
    this.header = header || {}
    this.items = Array.isArray(items) ? items : []
  }

  async preparePDF() {
    return this
  }

  getDocDefinition() {
    const h = this.header
    const items = this.items
    const currency = h.currency || 'USD'
    const totals = sumItems(items)

    const headerRow = [
      'ITEM\nNO.',
      'STOCK\nNO.',
      'DESCRIPTION',
      'Total Net\nWT.(GMS)',
      'Gold\n(GMS)',
      'Stone\n(CTS)',
      'Diamond\n(CTS)',
      'QTY\n(PCS)',
      `UNIT PRICE\n(${currency})`,
      `AMOUNT\n(${currency})`
    ].map((t) => ({ text: t, bold: true, fontSize: 7, alignment: 'center', fillColor: '#f0f0f0', margin: [2, 3, 2, 3] }))

    const bodyRows = items.map((it) => [
      { text: String(it.itemNo ?? ''), fontSize: 7, alignment: 'center' },
      { text: it.stockNumber || '', fontSize: 7 },
      { text: it.description || '', fontSize: 7 },
      { text: fmtWeight(it.netWeight, 3), fontSize: 7, alignment: 'right' },
      { text: fmtWeight(it.goldWeight, 2), fontSize: 7, alignment: 'right' },
      { text: fmtWeight(it.stoneWeight, 2), fontSize: 7, alignment: 'right' },
      { text: fmtWeight(it.diamondWeight, 3), fontSize: 7, alignment: 'right' },
      { text: String(it.qty ?? 0), fontSize: 7, alignment: 'center' },
      { text: fmtDocMoney(it.unitPrice, currency), fontSize: 7, alignment: 'right' },
      { text: fmtDocMoney(it.amount, currency), fontSize: 7, alignment: 'right' }
    ])

    const fobRow = [
      { text: h.incoterm || 'F.O.B. Bangkok', bold: true, fontSize: 7, alignment: 'right', colSpan: 3, fillColor: '#f0f0f0' },
      {},
      {},
      { text: fmtWeight(totals.netWeight, 3), bold: true, fontSize: 7, alignment: 'right', fillColor: '#f0f0f0' },
      { text: fmtWeight(totals.goldWeight, 2), bold: true, fontSize: 7, alignment: 'right', fillColor: '#f0f0f0' },
      { text: fmtWeight(totals.stoneWeight, 2), bold: true, fontSize: 7, alignment: 'right', fillColor: '#f0f0f0' },
      { text: fmtWeight(totals.diamondWeight, 3), bold: true, fontSize: 7, alignment: 'right', fillColor: '#f0f0f0' },
      { text: String(totals.qty), bold: true, fontSize: 7, alignment: 'center', fillColor: '#f0f0f0' },
      { text: '', fillColor: '#f0f0f0' },
      { text: fmtDocMoney(totals.amount, currency), bold: true, fontSize: 7, alignment: 'right', fillColor: '#f0f0f0' }
    ]

    const itemsTable = {
      table: {
        headerRows: 1,
        widths: [24, 55, '*', 45, 36, 36, 42, 26, 45, 52],
        body: [headerRow, ...bodyRows, fobRow]
      },
      layout: TABLE_LAYOUT_THIN
    }

    const parcelCount = Number(h.parcelCount) || 0
    const parcelText = parcelCount === 1 ? 'One parcel only' : `${parcelCount} parcels only`

    const trailing = {
      margin: [0, 8, 0, 0],
      stack: [
        { text: amountInWords(totals.amount, currency), fontSize: 9 },
        { text: parcelText, fontSize: 9, margin: [0, 4, 0, 0] },
        { text: 'We certify that this invoice is true and correct.', fontSize: 9, margin: [0, 4, 0, 0] },
        { text: `Net weight of merchandise ${fmtWeight(totals.netWeight, 3)} gms.`, fontSize: 9, margin: [0, 4, 0, 0] },
        { text: `ORIGIN ${(h.originCountry || 'THAILAND').toUpperCase()}`, fontSize: 9, margin: [0, 4, 0, 0] }
      ]
    }

    return {
      pageSize: 'A4',
      pageMargins: [40, 130, 40, 40],
      defaultStyle: { font: PDF_FONT, fontSize: 9 },
      header: (currentPage) => buildDocHeader('INVOICE', currentPage),
      content: [buildConsigneeBlock(h, 'INVOICE NO'), itemsTable, trailing]
    }
  }

  generatePDF() {
    const pdfMake = initPdfMake()
    return pdfMake.createPdf(this.getDocDefinition())
  }

  openPDF() {
    this.generatePDF().open()
  }

  downloadPDF(filename) {
    const name = filename || `ExportInvoice_${this.header.documentNumber || this.header.customNumber || 'export'}.pdf`
    this.generatePDF().download(name)
  }
}
