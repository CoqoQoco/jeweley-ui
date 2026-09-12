// SaleSummaryPdfBuilder — ใบสรุปตามประเภทสินค้า (ฝั่งขาย: Quotation / Invoice)
// ใช้หัวเอกสารแบบเอกสารขาย (โลโก้บริษัท + buildHeaderBlock) และดึงตัวเลขจาก buildSaleSummaryGroups เท่านั้น

import dayjs from 'dayjs'
import 'dayjs/locale/en'
import { initPdfMake } from '@/services/utils/pdf-make'
import { formatMoney } from '@/services/utils/decimal.js'
import { COMPANY_INFO, loadCompanyInfo } from '@/config/company-info.js'
import { PDF_COLORS, PDF_STYLES, PDF_FONT } from '../shared/pdf-theme.js'
import { loadCompanyLogo } from '../shared/pdf-images.js'
import { buildHeaderBlock } from '../shared/pdf-sections.js'
import { buildSaleSummaryGroups } from '@/services/helper/sale-summary/sale-summary-data.js'

const fmtWeight = (value, decimals) => (Number(value) || 0).toFixed(decimals)

export class SaleSummaryPdfBuilder {
  constructor({
    items,
    customer,
    documentDate,
    documentTitle,
    documentNumber,
    currencyUnit,
    divisor,
    groupByGoldType,
    productTypeLabels
  } = {}) {
    this.items = Array.isArray(items) ? items : []
    this.customer = customer || {}
    this.documentDate = documentDate || dayjs()
    this.documentTitle = documentTitle || 'SUMMARY'
    this.documentNumber = documentNumber || ''
    this.currencyUnit = currencyUnit || 'THB'
    this.divisor = Number(divisor) || 1
    this.groupByGoldType = groupByGoldType || false
    this.productTypeLabels = productTypeLabels || {}

    this.logoBase64 = null
    this.company = null
  }

  async preparePDF() {
    this.logoBase64 = await loadCompanyLogo()
    this.company = await loadCompanyInfo()
  }

  _money(value) {
    return formatMoney(value, { showDecimals: true })
  }

  getSummary() {
    return buildSaleSummaryGroups(this.items, {
      divisor: this.divisor,
      groupByGoldType: this.groupByGoldType,
      productTypeLabels: this.productTypeLabels
    })
  }

  getSummaryTableContent() {
    const { groups, totals } = this.getSummary()

    const headerCell = (text) => ({
      text,
      bold: true,
      fontSize: 8,
      color: PDF_COLORS.white,
      fillColor: PDF_COLORS.primary,
      alignment: 'center',
      margin: [2, 4, 2, 4]
    })

    const body = [
      [
        headerCell(this.groupByGoldType ? 'PRODUCT TYPE - GOLD TYPE' : 'PRODUCT TYPE'),
        headerCell('PCS'),
        headerCell('DIAMOND\n(CTS)'),
        headerCell('STONE\n(CTS)'),
        headerCell('GOLD\n(GMS)'),
        headerCell('NET WT.\n(GMS)'),
        headerCell(`AMOUNT\n(${this.currencyUnit})`)
      ]
    ]

    groups.forEach((group) => {
      body.push([
        { text: group.label, fontSize: 9, margin: [2, 3, 2, 3] },
        { text: String(group.qty), fontSize: 9, alignment: 'right', margin: [2, 3, 2, 3] },
        { text: fmtWeight(group.diamondWeight, 3), fontSize: 9, alignment: 'right', margin: [2, 3, 2, 3] },
        { text: fmtWeight(group.stoneWeight, 2), fontSize: 9, alignment: 'right', margin: [2, 3, 2, 3] },
        { text: fmtWeight(group.goldWeight, 2), fontSize: 9, alignment: 'right', margin: [2, 3, 2, 3] },
        { text: fmtWeight(group.netWeight, 3), fontSize: 9, alignment: 'right', margin: [2, 3, 2, 3] },
        { text: this._money(group.amount), fontSize: 9, alignment: 'right', margin: [2, 3, 2, 3] }
      ])
    })

    const totalCell = (text, alignment) => ({
      text,
      bold: true,
      fontSize: 9,
      color: PDF_COLORS.primary,
      fillColor: PDF_COLORS.lightGray,
      alignment,
      margin: [2, 4, 2, 4]
    })

    body.push([
      totalCell('GRAND TOTAL', 'left'),
      totalCell(String(totals.qty), 'right'),
      totalCell(fmtWeight(totals.diamondWeight, 3), 'right'),
      totalCell(fmtWeight(totals.stoneWeight, 2), 'right'),
      totalCell(fmtWeight(totals.goldWeight, 2), 'right'),
      totalCell(fmtWeight(totals.netWeight, 3), 'right'),
      totalCell(this._money(totals.amount), 'right')
    ])

    return {
      margin: [0, 8, 0, 0],
      table: {
        headerRows: 1,
        widths: ['*', 35, 55, 50, 50, 55, 75],
        body
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => PDF_COLORS.lightGray,
        vLineColor: () => PDF_COLORS.lightGray
      }
    }
  }

  getDocDefinition() {
    const companyInfo = this.company?.info || COMPANY_INFO

    const header = buildHeaderBlock({
      logoBase64: this.logoBase64,
      company: companyInfo,
      title: this.documentTitle,
      meta: [
        { label: 'No.:', value: this.documentNumber },
        { label: 'Date:', value: dayjs(this.documentDate).locale('en').format('MMM DD, YYYY') }
      ],
      billTo: {
        name: this.customer.name || this.customer.customerName || '',
        address: this.customer.address || this.customer.customerAddress || '',
        phone: this.customer.tel || this.customer.phone || '',
        email: this.customer.email || '',
        taxId: this.customer.taxId || ''
      }
    })

    return {
      pageSize: 'A4',
      pageMargins: [10, 18, 20, 40],
      defaultStyle: { font: PDF_FONT, fontSize: 10 },
      styles: PDF_STYLES,
      content: [header, this.getSummaryTableContent()]
    }
  }

  async generatePDF() {
    await this.preparePDF()
    const pdfMake = initPdfMake()
    return pdfMake.createPdf(this.getDocDefinition())
  }

  async openPDF() {
    const pdf = await this.generatePDF()
    pdf.open()
  }

  async downloadPDF(filename) {
    const pdf = await this.generatePDF()
    pdf.download(filename || `Summary_${this.documentNumber || 'document'}.pdf`)
  }

  async getPreviewUrl() {
    const pdf = await this.generatePDF()
    return new Promise((resolve) => {
      pdf.getBlob((blob) => resolve(URL.createObjectURL(blob)))
    })
  }
}
