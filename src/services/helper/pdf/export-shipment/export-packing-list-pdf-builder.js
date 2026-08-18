// ExportPackingListPdfBuilder — one row per parcelNo group, item no. range + weight totals

import { initPdfMake } from '@/services/utils/pdf-make'
import { PDF_FONT } from '@/services/helper/pdf/shared/pdf-theme.js'
import {
  buildDocHeader,
  buildConsigneeBlock,
  sumItems,
  fmtWeight,
  TABLE_LAYOUT_THIN
} from './export-shipment-shared.js'

export class ExportPackingListPdfBuilder {
  constructor(header, items) {
    this.header = header || {}
    this.items = Array.isArray(items) ? items : []
  }

  async preparePDF() {
    return this
  }

  buildParcels() {
    const map = new Map()

    this.items.forEach((it) => {
      const key = it.parcelNo !== null && it.parcelNo !== undefined && it.parcelNo !== '' ? String(it.parcelNo) : 'UNASSIGNED'
      if (!map.has(key)) map.set(key, { parcelNo: key, items: [] })
      map.get(key).items.push(it)
    })

    const parcels = [...map.values()].map((p) => {
      const itemNos = p.items.map((it) => Number(it.itemNo) || 0).filter((n) => n > 0)
      const min = itemNos.length ? Math.min(...itemNos) : null
      const max = itemNos.length ? Math.max(...itemNos) : null
      return {
        parcelNo: p.parcelNo,
        itemRange: min && max ? (min === max ? String(min) : `${min}-${max}`) : '-',
        qty: p.items.reduce((s, it) => s + (Number(it.qty) || 0), 0),
        netWeight: p.items.reduce((s, it) => s + (Number(it.netWeight) || 0), 0)
      }
    })

    parcels.sort((a, b) => {
      const na = Number(a.parcelNo)
      const nb = Number(b.parcelNo)
      if (!isNaN(na) && !isNaN(nb)) return na - nb
      return String(a.parcelNo).localeCompare(String(b.parcelNo))
    })

    return parcels
  }

  getDocDefinition() {
    const h = this.header
    const parcels = this.buildParcels()
    const totals = sumItems(this.items)

    const headerRow = ['PARCEL NO.', 'ITEM NO.', 'PCS', 'NET WEIGHT\n(GMS)']
      .map((t) => ({ text: t, bold: true, fontSize: 8, alignment: 'center', fillColor: '#f0f0f0', margin: [2, 3, 2, 3] }))

    const bodyRows = parcels.map((p) => [
      { text: p.parcelNo, fontSize: 8, alignment: 'center' },
      { text: p.itemRange, fontSize: 8, alignment: 'center' },
      { text: String(p.qty), fontSize: 8, alignment: 'right' },
      { text: fmtWeight(p.netWeight, 3), fontSize: 8, alignment: 'right' }
    ])

    const totalRow = [
      { text: 'TOTAL', bold: true, fontSize: 8, fillColor: '#f0f0f0', colSpan: 2 },
      {},
      { text: String(totals.qty), bold: true, fontSize: 8, alignment: 'right', fillColor: '#f0f0f0' },
      { text: fmtWeight(totals.netWeight, 3), bold: true, fontSize: 8, alignment: 'right', fillColor: '#f0f0f0' }
    ]

    const parcelCount = Number(h.parcelCount) || parcels.length

    return {
      pageSize: 'A4',
      pageMargins: [40, 130, 40, 40],
      defaultStyle: { font: PDF_FONT, fontSize: 9 },
      header: (currentPage) => buildDocHeader('PACKING LIST', currentPage),
      content: [
        buildConsigneeBlock(h, 'REF NO'),
        {
          table: {
            headerRows: 1,
            widths: ['*', '*', 60, 90],
            body: [headerRow, ...bodyRows, totalRow]
          },
          layout: TABLE_LAYOUT_THIN
        },
        { text: `TOTAL ${parcelCount} PARCEL(S)`, bold: true, fontSize: 10, margin: [0, 10, 0, 0] }
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
    const name = filename || `ExportPackingList_${this.header.documentNumber || this.header.customNumber || 'export'}.pdf`
    this.generatePDF().download(name)
  }
}
