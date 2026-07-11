import dayjs from 'dayjs'
import { initPdfMake } from '@/services/utils/pdf-make'
import { convertAmountToThaiText } from '@/services/utils/thai-baht-text.js'
import { COMPANY_INFO, COMPANY_TAX_ID } from '@/config/company-info.js'
import { PDF_COLORS, PDF_FONT } from '../shared/pdf-theme.js'
import { buildSeekSummary } from '../shared/pdf-seek-sections.js'
import { loadCompanyLogo } from '../shared/pdf-images.js'

export class BillingNotePdfBuilder {
  constructor(data, mode = 'main') {
    this.data = data || {}
    this.mode = mode
    this.logoBase64 = null
  }

  async preparePDF() {
    this.logoBase64 = await loadCompanyLogo()
  }

  formatMoney(value) {
    return (Number(value) || 0).toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  formatDate(value) {
    return value ? dayjs(value).format('DD/MM/YYYY') : ''
  }

  formatDateBE(value) {
    if (!value) return ''
    const d = new Date(value)
    if (isNaN(d.getTime())) return ''
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    return `${dd}/${mm}/${d.getFullYear() + 543}`
  }

  getGroupByType() {
    const products = Array.isArray(this.data.products) ? this.data.products : []
    const map = new Map()

    products.forEach((p) => {
      const key = p.productTypeName && String(p.productTypeName).trim() ? p.productTypeName : 'ไม่ระบุประเภท'
      const qty = Number(p.qty) || 0
      map.set(key, (map.get(key) || 0) + qty)
    })

    return Array.from(map.entries()).map(([productTypeName, qty]) => ({ productTypeName, qty }))
  }

  getGroupByCode() {
    const products = Array.isArray(this.data.products) ? this.data.products : []
    const map = new Map()

    products.forEach((p) => {
      const key = p.productNumber && String(p.productNumber).trim() ? p.productNumber : '-'
      const qty = Number(p.qty) || 0
      const existing = map.get(key)
      if (existing) {
        existing.qty += qty
      } else {
        map.set(key, { productNumber: key, productTypeName: p.productTypeName || '', qty })
      }
    })

    return Array.from(map.values())
  }

  getSeekHeaderTH() {
    const items = Array.isArray(this.data.items) ? this.data.items : []

    const logoCell = this.logoBase64
      ? { image: this.logoBase64, width: 34, height: 34, margin: [0, 0, 0, 0] }
      : { text: '', width: 34, margin: [0, 0, 0, 0] }

    const metaRows = [
      { label: 'เลขที่เอกสาร:', value: this.data.running || '' },
      { label: 'วันที่:', value: this.formatDateBE(this.data.documentDate) },
      { label: 'บิลจำนวน:', value: `${items.length} ฉบับ` }
    ].map(({ label, value }) => ({
      columns: [
        { text: label, fontSize: 9, color: PDF_COLORS.darkGray, width: '45%', alignment: 'right' },
        { text: value || '', fontSize: 9, bold: true, color: PDF_COLORS.darkGray, width: '55%', alignment: 'left', margin: [6, 0, 0, 0] }
      ],
      margin: [0, 1, 0, 1]
    }))

    const customerStack = [
      { text: 'ลูกค้า:', bold: true, fontSize: 10, color: PDF_COLORS.darkGray, margin: [0, 0, 0, 2] },
      { text: this.data.customerName || '', fontSize: 10, margin: [0, 0, 0, 1] },
      { text: this.data.customerAddress || '', fontSize: 9, color: PDF_COLORS.darkGray }
    ]

    return {
      stack: [
        {
          columns: [
            {
              width: 'auto',
              columnGap: 16,
              columns: [
                logoCell,
                {
                  width: 'auto',
                  margin: [0, 2, 0, 0],
                  stack: [
                    { text: 'Duang Kaew Jewelry', fontSize: 15, bold: true, color: PDF_COLORS.darkGray, margin: [0, 0, 0, 2] },
                    { text: 'TAX ID: ' + COMPANY_TAX_ID, fontSize: 9, color: PDF_COLORS.darkGray }
                  ]
                }
              ]
            },
            {
              text: 'ใบวางบิล',
              fontSize: 24,
              bold: true,
              color: PDF_COLORS.primary,
              alignment: 'right'
            }
          ]
        },
        {
          margin: [0, 8, 0, 8],
          canvas: [{
            type: 'line',
            x1: 0,
            y1: 0,
            x2: 565,
            y2: 0,
            lineWidth: 1.2,
            lineColor: PDF_COLORS.primary
          }]
        },
        {
          columns: [
            { width: '60%', stack: customerStack },
            { width: '40%', stack: metaRows }
          ],
          margin: [0, 0, 0, 8]
        }
      ]
    }
  }

  setThinHeader(text) {
    return {
      text: text || '',
      bold: true,
      fontSize: 8,
      color: PDF_COLORS.darkGray,
      alignment: 'center',
      margin: [4, 4, 4, 4]
    }
  }

  getThinTableLayout() {
    return {
      hLineWidth: (i, node) => (i === 0 || i === 1 || i === node.table.body.length ? 0.8 : 0.4),
      vLineWidth: () => 0,
      hLineColor: (i, node) => (i === 0 || i === 1 || i === node.table.body.length ? PDF_COLORS.primary : PDF_COLORS.lightGray),
      paddingTop: () => 3,
      paddingBottom: () => 3
    }
  }

  setTableCell(text) {
    return {
      text: text || '',
      fontSize: 11,
      margin: [4, 5, 4, 5]
    }
  }

  setTableCellRight(text) {
    return {
      text: text || '',
      fontSize: 11,
      alignment: 'right',
      margin: [4, 5, 4, 5]
    }
  }

  setTableCellCenter(text) {
    return {
      text: text || '',
      fontSize: 11,
      alignment: 'center',
      margin: [4, 5, 4, 5]
    }
  }

  getTypeSummaryTableContent() {
    const groups = this.getGroupByType()
    const body = [
      [this.setThinHeader('ประเภทสินค้า'), this.setThinHeader('จำนวน (ชิ้น)')]
    ]

    let totalQty = 0
    groups.forEach((g) => {
      totalQty += g.qty
      body.push([this.setTableCell(g.productTypeName), this.setTableCellRight(this.formatMoney(g.qty))])
    })

    body.push([
      { text: 'รวมทั้งหมด', bold: true, fontSize: 11, alignment: 'right', color: PDF_COLORS.primary, margin: [4, 5, 4, 5] },
      { text: this.formatMoney(totalQty), bold: true, fontSize: 11, alignment: 'right', color: PDF_COLORS.primary, margin: [4, 5, 4, 5] }
    ])

    return {
      margin: [0, 0, 0, 10],
      table: {
        headerRows: 1,
        widths: ['*', 120],
        body
      },
      layout: this.getThinTableLayout()
    }
  }

  getCodeTableContent() {
    const groups = this.getGroupByCode()
    const body = [
      [this.setThinHeader('รหัสสินค้า'), this.setThinHeader('ประเภท'), this.setThinHeader('จำนวน (ชิ้น)')]
    ]

    groups.forEach((g) => {
      body.push([
        this.setTableCell(g.productNumber),
        this.setTableCell(g.productTypeName),
        this.setTableCellRight(this.formatMoney(g.qty))
      ])
    })

    return {
      margin: [0, 0, 0, 10],
      table: {
        headerRows: 1,
        widths: ['*', 150, 100],
        body
      },
      layout: this.getThinTableLayout()
    }
  }

  getSeekItemsTableTH() {
    const items = Array.isArray(this.data.items) ? this.data.items : []
    const body = [
      [
        this.setThinHeader('#'),
        this.setThinHeader('วัน/เดือน/ปี'),
        this.setThinHeader('เลขที่เอกสาร'),
        this.setThinHeader('จำนวนเงิน'),
        this.setThinHeader('หมายเหตุ')
      ]
    ]

    items.forEach((item, idx) => {
      body.push([
        this.setTableCellCenter(String(idx + 1)),
        this.setTableCell(this.formatDateBE(item.invoiceDate)),
        this.setTableCell(item.invoiceRunning),
        this.setTableCellRight(this.formatMoney(item.amountBeforeVat)),
        this.setTableCell(item.remark || '')
      ])
    })

    return {
      margin: [0, 0, 0, 0],
      table: {
        headerRows: 1,
        widths: [25, 80, '*', 90, 90],
        body
      },
      layout: this.getThinTableLayout()
    }
  }

  getResizeAndSummaryRow() {
    const goldQty = Number(this.data.goldResizeQty) || 0
    const goldPerUnit = Number(this.data.goldResizePerUnit) || 0
    const goldAmount = Number(this.data.goldResizeAmount) || 0
    const silverQty = Number(this.data.silverResizeQty) || 0
    const silverPerUnit = Number(this.data.silverResizePerUnit) || 0
    const silverAmount = Number(this.data.silverResizeAmount) || 0
    const totalResize = goldAmount + silverAmount
    const subTotal = Number(this.data.subTotal) || 0
    const supportPercent = Number(this.data.supportPercent) || 0
    const supportAmount = Number(this.data.supportAmount) || 0
    const vatPercent = Number(this.data.vatPercent) || 0
    const vatAmount = Number(this.data.vatAmount) || 0
    const grandTotal = Number(this.data.grandTotal) || 0

    const summaryRows = [{ label: 'ยอดก่อน VAT', value: this.formatMoney(subTotal) }]
    if (this.data.hasSupport && supportPercent > 0) {
      summaryRows.push({ label: `เงินสนับสนุน ${supportPercent}%`, value: this.formatMoney(supportAmount) })
    }
    summaryRows.push({ label: `VAT ${vatPercent}%`, value: this.formatMoney(vatAmount) })

    return {
      margin: [0, 10, 0, 0],
      columns: [
        {
          width: '50%',
          stack: [
            {
              text: `ค่าตัดไซด์ทอง: ${goldQty} วง × ${this.formatMoney(goldPerUnit)} = ${this.formatMoney(goldAmount)}`,
              fontSize: 9,
              color: PDF_COLORS.darkGray,
              margin: [0, 0, 0, 4]
            },
            {
              text: `ค่าตัดไซด์เงิน: ${silverQty} วง × ${this.formatMoney(silverPerUnit)} = ${this.formatMoney(silverAmount)}`,
              fontSize: 9,
              color: PDF_COLORS.darkGray,
              margin: [0, 0, 0, 4]
            },
            {
              text: `รวมค่าตัดไซด์ทั้งหมด: ${this.formatMoney(totalResize)}`,
              fontSize: 9,
              bold: true,
              color: PDF_COLORS.darkGray
            }
          ]
        },
        {
          width: '50%',
          stack: [
            buildSeekSummary({
              rows: summaryRows,
              netPayableLabel: 'ยอดรวมสุทธิ',
              netPayableValue: this.formatMoney(grandTotal)
            })
          ]
        }
      ]
    }
  }

  getAmountInWordsBlock() {
    return {
      text: '(' + convertAmountToThaiText(this.data.grandTotal) + ')',
      fontSize: 11,
      bold: true,
      margin: [0, 8, 0, 4]
    }
  }

  getSeekSignatureTH() {
    const supportAmount = Number(this.data.supportAmount) || 0
    const hasSupport = Boolean(this.data.hasSupport) && supportAmount > 0
    const signColWidth = hasSupport ? 130 : 165
    const signLineWidth = hasSupport ? 115 : 150

    const signatureColumns = [
      {
        width: '*',
        stack: [
          { text: 'Duang Kaew Jewelry', fontSize: 8, bold: true, margin: [0, 0, 0, 2] },
          { text: 'TAX ID: ' + COMPANY_TAX_ID, fontSize: 7, color: PDF_COLORS.darkGray, margin: [0, 0, 0, 1] },
          { text: COMPANY_INFO.address, fontSize: 7, color: PDF_COLORS.darkGray, margin: [0, 0, 0, 1] },
          { text: 'โทร: ' + COMPANY_INFO.phone, fontSize: 7, color: PDF_COLORS.darkGray }
        ]
      },
      {
        width: signColWidth,
        stack: [
          { text: ' ', fontSize: 8, margin: [0, 0, 0, 8] },
          {
            canvas: [{ type: 'line', x1: 0, y1: 0, x2: signLineWidth, y2: 0, lineWidth: 0.8, lineColor: PDF_COLORS.darkGray, dash: { length: 2 } }],
            margin: [0, 0, 0, 4]
          },
          { text: 'ผู้วางบิล', fontSize: 8, bold: true, color: PDF_COLORS.darkGray },
          { text: 'วันที่วางบิล ................', fontSize: 7, color: PDF_COLORS.darkGray, margin: [0, 1, 0, 0] }
        ]
      },
      {
        width: signColWidth,
        stack: [
          { text: ' ', fontSize: 8, margin: [0, 0, 0, 8] },
          {
            canvas: [{ type: 'line', x1: 0, y1: 0, x2: signLineWidth, y2: 0, lineWidth: 0.8, lineColor: PDF_COLORS.darkGray, dash: { length: 2 } }],
            margin: [0, 0, 0, 4]
          },
          { text: 'ผู้รับวางบิล', fontSize: 8, bold: true, color: PDF_COLORS.darkGray },
          { text: 'นัดรับเช็ควันที่ ................', fontSize: 7, color: PDF_COLORS.darkGray, margin: [0, 1, 0, 0] }
        ]
      }
    ]

    if (hasSupport) {
      signatureColumns.push({
        width: signColWidth,
        stack: [
          { text: ' ', fontSize: 8, margin: [0, 0, 0, 8] },
          {
            canvas: [{ type: 'line', x1: 0, y1: 0, x2: signLineWidth, y2: 0, lineWidth: 0.8, lineColor: PDF_COLORS.darkGray, dash: { length: 2 } }],
            margin: [0, 0, 0, 4]
          },
          { text: 'ผู้รับเงินสนับสนุน', fontSize: 8, bold: true, color: PDF_COLORS.darkGray },
          { text: `จำนวน ${this.formatMoney(supportAmount)} บาท`, fontSize: 7, color: PDF_COLORS.darkGray, margin: [0, 1, 0, 0] }
        ]
      })
    }

    return {
      stack: [
        {
          margin: [0, 16, 0, 8],
          canvas: [{
            type: 'line',
            x1: 0,
            y1: 0,
            x2: 565,
            y2: 0,
            lineWidth: 0.8,
            lineColor: PDF_COLORS.lightGray
          }]
        },
        {
          columns: signatureColumns
        }
      ]
    }
  }

  getDocDefinition() {
    const self = this

    let content
    if (this.mode === 'byType') {
      content = [this.getSeekHeaderTH(), this.getTypeSummaryTableContent()]
    } else if (this.mode === 'byCode') {
      content = [this.getSeekHeaderTH(), this.getCodeTableContent()]
    } else {
      content = [
        this.getSeekHeaderTH(),
        this.getSeekItemsTableTH(),
        this.getResizeAndSummaryRow(),
        this.getAmountInWordsBlock()
      ]
    }

    return {
      pageSize: 'A4',
      pageMargins: [20, 20, 20, 90],
      defaultStyle: {
        font: PDF_FONT,
        fontSize: 11
      },
      content,
      footer: function (currentPage, pageCount) {
        const pageText = {
          text: currentPage.toString() + ' / ' + pageCount,
          alignment: 'center',
          fontSize: 8,
          margin: [0, 6, 0, 0]
        }
        if (currentPage === pageCount) {
          return { margin: [20, 0, 20, 0], stack: [self.getSeekSignatureTH(), pageText] }
        }
        return pageText
      }
    }
  }

  generatePDF() {
    const pdfMake = initPdfMake()
    return pdfMake.createPdf(this.getDocDefinition())
  }
}
