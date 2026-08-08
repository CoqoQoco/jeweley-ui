import dayjs from 'dayjs'
import 'dayjs/locale/en'
import { initPdfMake } from '@/services/utils/pdf-make'
import { COMPANY_INFO, COMPANY_TAX_ID, COMPANY_BANK, loadCompanyInfo } from '@/config/company-info.js'
import { PDF_COLORS, PDF_FONT } from '../shared/pdf-theme.js'
import { formatPrice } from '../shared/pdf-format.js'
import { loadCompanyLogo } from '../shared/pdf-images.js'
import { setTableCell, setTableCellRight } from '../shared/pdf-cells.js'
import { paginate } from '../shared/pdf-sections.js'
import {
  buildSeekHeader,
  buildSeekSummary,
  buildPaymentOptions,
  buildRemarks
} from '../shared/pdf-seek-sections.js'

const ITEMS_PER_PAGE = 15

function setCellCenter(text) {
  return {
    text: text || '',
    fontSize: 7,
    alignment: 'center',
    margin: [2, 3, 2, 3]
  }
}

export class MaterialSalePdfBuilder {
  constructor(data) {
    this.data = data || {}
    this.logoBase64 = null
    this.company = null
    this.itemsPerPage = ITEMS_PER_PAGE
  }

  async preparePDF() {
    this.logoBase64 = await loadCompanyLogo()
    this.company = await loadCompanyInfo()
    return this
  }

  _fmt2(num) {
    return formatPrice(Number(num) || 0)
  }

  /**
   * getSummaryBand
   * 4-quadrant band adapted from buildStatusBand (pdf-seek-sections.js) —
   * material sale has no payment tracking, so this shows document totals instead.
   */
  getSummaryBand() {
    const items = Array.isArray(this.data.items) ? this.data.items : []
    const itemCount = items.length
    const totalPieces = items.reduce((sum, it) => sum + (Number(it.qtyPiece) || 0), 0)
    const totalWeight = items.reduce((sum, it) => sum + (Number(it.qtyWeight) || 0), 0)
    const grandTotal = Number(this.data.grandTotal) || 0

    const labelStyle = { fontSize: 8, margin: [0, 0, 0, 2] }
    const valueStyle = { fontSize: 11, bold: true }

    return {
      margin: [0, 6, 0, 6],
      table: {
        widths: ['*', '*', '*', '*'],
        body: [
          [
            { ...labelStyle, text: 'จำนวนรายการ', color: PDF_COLORS.white, fillColor: PDF_COLORS.green },
            { ...labelStyle, text: 'จำนวนเม็ดรวม', color: PDF_COLORS.white, fillColor: PDF_COLORS.green },
            { ...labelStyle, text: 'น้ำหนักรวม', color: PDF_COLORS.white, fillColor: PDF_COLORS.primary },
            { ...labelStyle, text: 'ยอดสุทธิ', color: PDF_COLORS.white, fillColor: PDF_COLORS.primary }
          ],
          [
            { ...valueStyle, text: itemCount.toLocaleString('th-TH'), color: PDF_COLORS.white, fillColor: PDF_COLORS.green },
            { ...valueStyle, text: totalPieces.toLocaleString('th-TH', { maximumFractionDigits: 0 }), color: PDF_COLORS.white, fillColor: PDF_COLORS.green },
            { ...valueStyle, text: this._fmt2(totalWeight) + ' ct', color: PDF_COLORS.white, fillColor: PDF_COLORS.primary },
            { ...valueStyle, text: this._fmt2(grandTotal), color: PDF_COLORS.white, fillColor: PDF_COLORS.primary }
          ]
        ]
      },
      layout: {
        hLineWidth: () => 0,
        vLineWidth: () => 0,
        paddingLeft: () => 8,
        paddingRight: () => 8,
        paddingTop: () => 3,
        paddingBottom: () => 3
      }
    }
  }

  /**
   * getItemsTableContent
   * Light, clean items table (no colored header, no vertical lines) — seek layout style,
   * mirrors getItemsTableContent() in invoice-summary-builder.js.
   */
  getItemsTableContent(pageItems, pageNum) {
    const body = []

    body.push(
      ['ลำดับ', 'รายการ', 'จำนวนเม็ด', 'ราคารวม Vat', 'น้ำหนัก (กะรัต)', 'ราคาก่อน Vat', 'จำนวนเงิน'].map((text) => ({
        text,
        bold: true,
        fontSize: 7,
        color: PDF_COLORS.darkGray,
        alignment: 'center',
        margin: [2, 4, 2, 4]
      }))
    )

    const safeItems = pageItems || []
    safeItems.forEach((item, index) => {
      const actualIndex = pageNum * this.itemsPerPage + index

      body.push([
        setCellCenter(String(actualIndex + 1)),
        setTableCell(item.description || item.gemName || ''),
        setTableCellRight(Number(item.qtyPiece || 0).toLocaleString('th-TH', { maximumFractionDigits: 0 })),
        setTableCellRight(this._fmt2(item.priceInclVat)),
        setTableCellRight(this._fmt2(item.qtyWeight)),
        setTableCellRight(this._fmt2(item.priceExclVat)),
        setTableCellRight(this._fmt2(item.amount))
      ])
    })

    return {
      margin: [0, 0, 0, 0],
      table: {
        headerRows: 1,
        widths: [30, '*', 55, 65, 65, 65, 70],
        body
      },
      layout: {
        hLineWidth: (i, node) => (i === 0 || i === 1 || i === node.table.body.length ? 0.8 : 0.4),
        vLineWidth: () => 0,
        hLineColor: (i, node) => (i === 0 || i === 1 || i === node.table.body.length ? PDF_COLORS.primary : PDF_COLORS.lightGray),
        paddingTop: () => 2,
        paddingBottom: () => 2
      }
    }
  }

  /**
   * getSignatureBlock
   * Billing-note style footer signature — divider line + company info block (left,
   * sourced from this.company/loadCompanyInfo so it follows /setting/company-info)
   * + 3 dashed sign columns (ผู้รับ / ผู้ส่ง / วันที่).
   */
  getSignatureBlock() {
    const signColWidth = 130
    const signLineWidth = 115

    const signCell = (label) => ({
      width: signColWidth,
      stack: [
        { text: ' ', fontSize: 8, margin: [0, 0, 0, 28] },
        {
          canvas: [{ type: 'line', x1: 0, y1: 0, x2: signLineWidth, y2: 0, lineWidth: 0.8, lineColor: PDF_COLORS.darkGray, dash: { length: 2 } }],
          margin: [0, 0, 0, 4]
        },
        { text: label, alignment: 'center', fontSize: 8, bold: true, color: PDF_COLORS.darkGray }
      ]
    })

    return {
      stack: [
        {
          margin: [0, 16, 0, 8],
          canvas: [{ type: 'line', x1: 0, y1: 0, x2: 555, y2: 0, lineWidth: 0.8, lineColor: PDF_COLORS.lightGray }]
        },
        {
          columns: [
            {
              width: '*',
              stack: [
                { text: this.company?.info?.name || COMPANY_INFO.name, fontSize: 8, bold: true, margin: [0, 0, 0, 2] },
                { text: 'TAX ID: ' + (this.company?.taxId || COMPANY_TAX_ID), fontSize: 7, color: PDF_COLORS.darkGray, margin: [0, 0, 0, 1] },
                { text: this.company?.info?.address || COMPANY_INFO.address, fontSize: 7, color: PDF_COLORS.darkGray, margin: [0, 0, 0, 1] },
                { text: 'โทร: ' + (this.company?.info?.phone || COMPANY_INFO.phone), fontSize: 7, color: PDF_COLORS.darkGray }
              ]
            },
            signCell('ผู้รับ'),
            signCell('ผู้ส่ง'),
            signCell('วันที่')
          ]
        }
      ]
    }
  }

  getDocDefinition() {
    const self = this
    const d = this.data
    const items = Array.isArray(d.items) ? d.items : []
    const vatPercent = Number(d.vatPercent) || 7

    // Build a FRESH header object per page — pdfmake mutates content nodes during
    // layout, so reusing one reference across pages renders later pages incompletely.
    const makeHeader = () => buildSeekHeader({
      logoBase64: self.logoBase64,
      companyName: self.company?.info?.name || COMPANY_INFO.name,
      companyTaxId: self.company?.taxId || COMPANY_TAX_ID,
      title: 'INVOICE',
      meta: [
        { label: 'Date of Issue:', value: dayjs(d.documentDate).locale('en').format('MMM DD, YYYY') },
        { label: 'Document No.:', value: d.documentNo || '' }
      ],
      billTo: {
        name: d.customerName || '',
        address: d.customerAddress || '',
        taxId: d.customerTaxId || ''
      }
    })

    const summaryRows = [
      { label: 'Subtotal', value: self._fmt2(d.subTotal) },
      { label: `VAT ${vatPercent}%`, value: self._fmt2(d.vatAmount) }
    ]

    return {
      pageSize: 'A4',
      pageMargins: [20, 18, 20, 130],
      defaultStyle: { font: PDF_FONT, fontSize: 11 },
      footer: (currentPage, pageCount) => {
        const pageText = {
          text: currentPage.toString() + ' / ' + pageCount,
          alignment: 'center',
          fontSize: 8,
          margin: [0, 6, 0, 0]
        }
        if (currentPage === pageCount) {
          return { margin: [20, 0, 20, 0], stack: [self.getSignatureBlock(), pageText] }
        }
        return pageText
      },
      content: paginate(
        items,
        self.itemsPerPage,
        (pageItems, pageNum, isLastPage) => {
          const blocks = []

          blocks.push(makeHeader())

          if (pageNum === 0) {
            blocks.push(self.getSummaryBand())
          }

          blocks.push(self.getItemsTableContent(pageItems, pageNum))

          if (isLastPage) {
            const summaryNode = buildSeekSummary({
              rows: summaryRows,
              netPayableLabel: 'Total',
              netPayableValue: self._fmt2(d.grandTotal)
            })
            const pay = buildPaymentOptions({ bank: self.company?.bank || COMPANY_BANK })
            blocks.push({
              columns: [
                { width: '52%', stack: pay ? [pay] : [{ text: '' }] },
                { width: '48%', stack: [summaryNode] }
              ],
              columnGap: 16,
              margin: [0, 8, 0, 4]
            })

            const rem = buildRemarks({ text: d.remark })
            if (rem) blocks.push(rem)
          }

          return blocks
        }
      )
    }
  }

  generatePDF() {
    const pdfMake = initPdfMake()
    return pdfMake.createPdf(this.getDocDefinition())
  }
}
