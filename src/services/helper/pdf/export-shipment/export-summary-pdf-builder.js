// ExportSummaryPdfBuilder — totals grouped by product type x gold type
// (parsed from item.description e.g. "9K EARRING Diamond/Emerald" -> "EARRING - 9K")

import { initPdfMake } from '@/services/utils/pdf-make'
import { PDF_FONT } from '@/services/helper/pdf/shared/pdf-theme.js'
import {
  buildDocHeader,
  buildConsigneeBlock,
  sumItems,
  fmtWeight,
  fmtDocMoney,
  TABLE_LAYOUT_THIN
} from './export-shipment-shared.js'

const GOLD_TYPE_RE = /^\d+K$/i

function parseGroup(description) {
  const desc = (description || '').trim()
  if (!desc) return { goldType: 'N/A', productType: 'OTHER' }

  const tokens = desc.split(/\s+/)
  let idx = 0
  let goldType = 'N/A'
  if (tokens[0] && GOLD_TYPE_RE.test(tokens[0])) {
    goldType = tokens[0].toUpperCase()
    idx = 1
  }
  const productType = (tokens[idx] || 'OTHER').toUpperCase()
  return { goldType, productType }
}

export class ExportSummaryPdfBuilder {
  constructor(header, items) {
    this.header = header || {}
    this.items = Array.isArray(items) ? items : []
  }

  async preparePDF() {
    return this
  }

  buildGroups() {
    const map = new Map()

    this.items.forEach((it) => {
      const { goldType, productType } = parseGroup(it.description)
      const key = `${productType}|${goldType}`
      if (!map.has(key)) {
        map.set(key, {
          label: `${productType} - ${goldType}`,
          qty: 0,
          netWeight: 0,
          goldWeight: 0,
          stoneWeight: 0,
          diamondWeight: 0,
          amount: 0
        })
      }
      const g = map.get(key)
      g.qty += Number(it.qty) || 0
      g.netWeight += Number(it.netWeight) || 0
      g.goldWeight += Number(it.goldWeight) || 0
      g.stoneWeight += Number(it.stoneWeight) || 0
      g.diamondWeight += Number(it.diamondWeight) || 0
      g.amount += Number(it.amount) || 0
    })

    return [...map.values()].sort((a, b) => a.label.localeCompare(b.label))
  }

  getDocDefinition() {
    const h = this.header
    const currency = h.currency || 'USD'
    const groups = this.buildGroups()
    const totals = sumItems(this.items)

    const headerRow = ['PRODUCT TYPE - GOLD TYPE', 'PCS', 'NET WT.\n(GMS)', 'GOLD\n(GMS)', 'STONE\n(CTS)', 'DIAMOND\n(CTS)', `AMOUNT\n(${currency})`]
      .map((t) => ({ text: t, bold: true, fontSize: 8, alignment: 'center', fillColor: '#f0f0f0', margin: [2, 3, 2, 3] }))

    const bodyRows = groups.map((g) => [
      { text: g.label, fontSize: 8 },
      { text: String(g.qty), fontSize: 8, alignment: 'right' },
      { text: fmtWeight(g.netWeight, 3), fontSize: 8, alignment: 'right' },
      { text: fmtWeight(g.goldWeight, 2), fontSize: 8, alignment: 'right' },
      { text: fmtWeight(g.stoneWeight, 2), fontSize: 8, alignment: 'right' },
      { text: fmtWeight(g.diamondWeight, 3), fontSize: 8, alignment: 'right' },
      { text: fmtDocMoney(g.amount, currency), fontSize: 8, alignment: 'right' }
    ])

    const totalRow = [
      { text: 'GRAND TOTAL', bold: true, fontSize: 8, fillColor: '#f0f0f0' },
      { text: String(totals.qty), bold: true, fontSize: 8, alignment: 'right', fillColor: '#f0f0f0' },
      { text: fmtWeight(totals.netWeight, 3), bold: true, fontSize: 8, alignment: 'right', fillColor: '#f0f0f0' },
      { text: fmtWeight(totals.goldWeight, 2), bold: true, fontSize: 8, alignment: 'right', fillColor: '#f0f0f0' },
      { text: fmtWeight(totals.stoneWeight, 2), bold: true, fontSize: 8, alignment: 'right', fillColor: '#f0f0f0' },
      { text: fmtWeight(totals.diamondWeight, 3), bold: true, fontSize: 8, alignment: 'right', fillColor: '#f0f0f0' },
      { text: fmtDocMoney(totals.amount, currency), bold: true, fontSize: 8, alignment: 'right', fillColor: '#f0f0f0' }
    ]

    return {
      pageSize: 'A4',
      pageMargins: [40, 130, 40, 40],
      defaultStyle: { font: PDF_FONT, fontSize: 9 },
      header: (currentPage) => buildDocHeader('SUMMARY', currentPage),
      content: [
        buildConsigneeBlock(h, 'REF NO'),
        {
          table: {
            headerRows: 1,
            widths: ['*', 40, 55, 50, 50, 55, 60],
            body: [headerRow, ...bodyRows, totalRow]
          },
          layout: TABLE_LAYOUT_THIN
        }
      ]
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
    const name = filename || `ExportSummary_${this.header.documentNumber || this.header.customNumber || 'export'}.pdf`
    this.generatePDF().download(name)
  }
}
