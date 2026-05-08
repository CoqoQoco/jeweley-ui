import dayjs from 'dayjs'
import { initPdfMake } from '@/services/utils/pdf-make'
import { convertAmountToThaiText } from '@/services/utils/thai-baht-text.js'
import {
  PAGE_WIDTH,
  PAGE_HEIGHT,
  FIELD_INVOICE_NO,
  FIELD_INVOICE_DATE,
  FIELD_PAGE_NUMBER,
  FIELD_CUSTOMER_NAME,
  FIELD_CUSTOMER_TAX_ID,
  FIELD_CUSTOMER_ADDRESS,
  ITEMS_BASE_Y,
  LINE_HEIGHT,
  MAX_ROWS_PER_PAGE,
  COL_NO,
  COL_DESCRIPTION,
  COL_QTY,
  COL_UNIT_PRICE,
  COL_AMOUNT,
  FIELD_TOTAL_QTY,
  FIELD_SUB_TOTAL,
  FIELD_VAT,
  FIELD_GRAND_TOTAL,
  FIELD_TOTAL_AMOUNT_TEXT
} from './continuous-form-layout.js'

const mmToPt = (mm) => mm * 2.83465
const RIGHT_ALIGN_WIDTH = 80

export class InvoiceContinuousPdfBuilder {
  constructor(saleOrderData, options = {}) {
    this.saleOrderData = saleOrderData || {}
    this.offsetX = mmToPt(Number(options.offsetX) || 0)
    this.offsetY = mmToPt(Number(options.offsetY) || 0)
    this.calibrationMode = options.calibrationMode === true

    this.items = Array.isArray(this.saleOrderData.items) ? this.saleOrderData.items : []
    this.customer = this.saleOrderData.customer || {}
    this.invoiceNo = this.saleOrderData.invoiceNo || ''
    this.invoiceDate = this.saleOrderData.invoiceDate || dayjs()
    this.currencyRate = Number(this.saleOrderData.currencyRate) || 1

    this.customerTaxId =
      this.saleOrderData.customerTaxId ||
      this.saleOrderData.taxId ||
      this.customer.taxId ||
      ''

    this.specialDiscount = Number(this.saleOrderData.specialDiscount) || 0
    this.specialAddition = Number(this.saleOrderData.specialAddition) || 0
    this.freightAndInsurance = Number(this.saleOrderData.freightAndInsurance) || 0
    this.vatPercent =
      Number(this.saleOrderData.vatPercent) || Number(this.saleOrderData.vat) || 0

    this.subtotal = this.calculateSubtotal()
    this.totalAfterDiscountAndAddition =
      this.subtotal - this.specialDiscount + this.specialAddition
    this.totalBeforeVat = this.totalAfterDiscountAndAddition + this.freightAndInsurance
    this.vatAmount = (this.totalBeforeVat * this.vatPercent) / 100
    this.totalAmount = this.totalBeforeVat + this.vatAmount
    this.totalQty = this.items.reduce((sum, item) => sum + (Number(item.qty) || 0), 0)
  }

  calculateSubtotal() {
    let total = 0
    this.items.forEach((item) => {
      const price = Number(item.appraisalPrice) || 0
      const qty = Number(item.qty) || 0
      const discountPercent = Number(item.discountPercent) || 0
      const priceAfterDiscount = price * (1 - discountPercent / 100)
      const convertedPrice = priceAfterDiscount / this.currencyRate
      total += convertedPrice * qty
    })
    return total
  }

  formatNumber(num) {
    if (typeof num !== 'number' || isNaN(num)) return '0.00'
    return num.toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  buildHeaderFields(pageIndex, totalPages) {
    return [
      {
        text: this.invoiceNo,
        absolutePosition: {
          x: FIELD_INVOICE_NO.x + this.offsetX,
          y: FIELD_INVOICE_NO.y + this.offsetY
        },
        alignment: 'left'
      },
      {
        text: dayjs(this.invoiceDate).format('DD/MM/YYYY'),
        absolutePosition: {
          x: FIELD_INVOICE_DATE.x + this.offsetX,
          y: FIELD_INVOICE_DATE.y + this.offsetY
        },
        alignment: 'left'
      },
      {
        text: `${pageIndex + 1}/${totalPages}`,
        absolutePosition: {
          x: FIELD_PAGE_NUMBER.x + this.offsetX,
          y: FIELD_PAGE_NUMBER.y + this.offsetY
        },
        alignment: 'left'
      },
      {
        text: this.customer.name || '',
        absolutePosition: {
          x: FIELD_CUSTOMER_NAME.x + this.offsetX,
          y: FIELD_CUSTOMER_NAME.y + this.offsetY
        },
        alignment: 'left'
      },
      {
        text: this.customerTaxId,
        absolutePosition: {
          x: FIELD_CUSTOMER_TAX_ID.x + this.offsetX,
          y: FIELD_CUSTOMER_TAX_ID.y + this.offsetY
        },
        alignment: 'left'
      },
      {
        text: this.customer.address || '',
        absolutePosition: {
          x: FIELD_CUSTOMER_ADDRESS.x + this.offsetX,
          y: FIELD_CUSTOMER_ADDRESS.y + this.offsetY
        },
        alignment: 'left'
      }
    ]
  }

  buildItemRows(chunk, pageIndex) {
    const rows = []
    chunk.forEach((item, rowIndex) => {
      const y = ITEMS_BASE_Y + rowIndex * LINE_HEIGHT + this.offsetY
      const itemNo = pageIndex * MAX_ROWS_PER_PAGE + rowIndex + 1

      const appraisalPrice = Number(item.appraisalPrice) || 0
      const qty = Number(item.qty) || 0
      const discountPercent = Number(item.discountPercent) || 0
      const priceAfterDiscount = appraisalPrice * (1 - discountPercent / 100)
      const unitPrice = priceAfterDiscount / this.currencyRate
      const amount = unitPrice * qty

      const description = item.description || item.productNumber || ''

      rows.push(
        {
          text: String(itemNo),
          absolutePosition: { x: COL_NO + this.offsetX, y },
          alignment: 'left'
        },
        {
          text: description,
          absolutePosition: { x: COL_DESCRIPTION + this.offsetX, y },
          alignment: 'left'
        },
        {
          text: qty ? String(qty) : '',
          absolutePosition: { x: COL_QTY - RIGHT_ALIGN_WIDTH + this.offsetX, y },
          width: RIGHT_ALIGN_WIDTH,
          alignment: 'right'
        },
        {
          text: this.formatNumber(unitPrice),
          absolutePosition: { x: COL_UNIT_PRICE - RIGHT_ALIGN_WIDTH + this.offsetX, y },
          width: RIGHT_ALIGN_WIDTH,
          alignment: 'right'
        },
        {
          text: this.formatNumber(amount),
          absolutePosition: { x: COL_AMOUNT - RIGHT_ALIGN_WIDTH + this.offsetX, y },
          width: RIGHT_ALIGN_WIDTH,
          alignment: 'right'
        }
      )
    })
    return rows
  }

  buildSummaryFields() {
    return [
      {
        text: String(this.totalQty),
        absolutePosition: {
          x: FIELD_TOTAL_QTY.x - RIGHT_ALIGN_WIDTH + this.offsetX,
          y: FIELD_TOTAL_QTY.y + this.offsetY
        },
        width: RIGHT_ALIGN_WIDTH,
        alignment: 'right'
      },
      {
        text: this.formatNumber(this.totalBeforeVat),
        absolutePosition: {
          x: FIELD_SUB_TOTAL.x - RIGHT_ALIGN_WIDTH + this.offsetX,
          y: FIELD_SUB_TOTAL.y + this.offsetY
        },
        width: RIGHT_ALIGN_WIDTH,
        alignment: 'right'
      },
      {
        text: this.formatNumber(this.vatAmount),
        absolutePosition: {
          x: FIELD_VAT.x - RIGHT_ALIGN_WIDTH + this.offsetX,
          y: FIELD_VAT.y + this.offsetY
        },
        width: RIGHT_ALIGN_WIDTH,
        alignment: 'right'
      },
      {
        text: this.formatNumber(this.totalAmount),
        absolutePosition: {
          x: FIELD_GRAND_TOTAL.x - RIGHT_ALIGN_WIDTH + this.offsetX,
          y: FIELD_GRAND_TOTAL.y + this.offsetY
        },
        width: RIGHT_ALIGN_WIDTH,
        alignment: 'right'
      },
      {
        text: convertAmountToThaiText(this.totalAmount),
        absolutePosition: {
          x: FIELD_TOTAL_AMOUNT_TEXT.x + this.offsetX,
          y: FIELD_TOTAL_AMOUNT_TEXT.y + this.offsetY
        },
        alignment: 'left'
      }
    ]
  }

  buildCalibrationGrid() {
    const nodes = []
    const ox = this.offsetX
    const oy = this.offsetY

    // X axis tick marks (top edge) every 50pt from 0 to 648
    for (let x = 0; x <= PAGE_WIDTH; x += 50) {
      const px = x + ox
      nodes.push({
        canvas: [{ type: 'line', x1: px, y1: oy, x2: px, y2: 10 + oy, lineWidth: 0.5 }]
      })
      nodes.push({
        text: String(x),
        absolutePosition: { x: px + 1, y: oy + 1 },
        fontSize: 6
      })
    }

    // Y axis tick marks (left edge) every 50pt from 0 to 792
    for (let y = 0; y <= PAGE_HEIGHT; y += 50) {
      const py = y + oy
      nodes.push({
        canvas: [{ type: 'line', x1: ox, y1: py, x2: 10 + ox, y2: py, lineWidth: 0.5 }]
      })
      nodes.push({
        text: String(y),
        absolutePosition: { x: ox + 1, y: py + 1 },
        fontSize: 6
      })
    }

    // Helper to push cross + label at (fx, fy, label)
    const addCross = (fx, fy, label) => {
      const cx = fx + ox
      const cy = fy + oy
      const arm = 3
      nodes.push({
        canvas: [
          { type: 'line', x1: cx - arm, y1: cy, x2: cx + arm, y2: cy, lineWidth: 0.5 },
          { type: 'line', x1: cx, y1: cy - arm, x2: cx, y2: cy + arm, lineWidth: 0.5 }
        ]
      })
      nodes.push({
        text: label,
        absolutePosition: { x: cx + 5, y: cy - 3 },
        fontSize: 6
      })
    }

    // Header FIELD cross marks
    addCross(FIELD_INVOICE_NO.x, FIELD_INVOICE_NO.y, 'INVOICE_NO')
    addCross(FIELD_INVOICE_DATE.x, FIELD_INVOICE_DATE.y, 'INVOICE_DATE')
    addCross(FIELD_PAGE_NUMBER.x, FIELD_PAGE_NUMBER.y, 'PAGE_NUMBER')
    addCross(FIELD_CUSTOMER_NAME.x, FIELD_CUSTOMER_NAME.y, 'CUSTOMER_NAME')
    addCross(FIELD_CUSTOMER_TAX_ID.x, FIELD_CUSTOMER_TAX_ID.y, 'CUSTOMER_TAX_ID')
    addCross(FIELD_CUSTOMER_ADDRESS.x, FIELD_CUSTOMER_ADDRESS.y, 'CUSTOMER_ADDRESS')

    // Summary FIELD cross marks
    addCross(FIELD_TOTAL_QTY.x, FIELD_TOTAL_QTY.y, 'TOTAL_QTY')
    addCross(FIELD_SUB_TOTAL.x, FIELD_SUB_TOTAL.y, 'SUB_TOTAL')
    addCross(FIELD_VAT.x, FIELD_VAT.y, 'VAT')
    addCross(FIELD_GRAND_TOTAL.x, FIELD_GRAND_TOTAL.y, 'GRAND_TOTAL')
    addCross(FIELD_TOTAL_AMOUNT_TEXT.x, FIELD_TOTAL_AMOUNT_TEXT.y, 'TOTAL_AMOUNT_TEXT')

    // Item row markers — first row (rowIndex 0) and last row (MAX_ROWS_PER_PAGE - 1)
    const itemCols = [
      { x: COL_NO, label: 'COL_NO' },
      { x: COL_DESCRIPTION, label: 'COL_DESC' },
      { x: COL_QTY, label: 'COL_QTY' },
      { x: COL_UNIT_PRICE, label: 'COL_PRICE' },
      { x: COL_AMOUNT, label: 'COL_AMOUNT' }
    ]
    const firstRowY = ITEMS_BASE_Y
    const lastRowY = ITEMS_BASE_Y + (MAX_ROWS_PER_PAGE - 1) * LINE_HEIGHT
    itemCols.forEach(({ x, label }) => {
      addCross(x, firstRowY, label + '[0]')
      addCross(x, lastRowY, label + '[last]')
    })

    return nodes
  }

  buildContent() {
    if (this.calibrationMode) {
      return this.buildCalibrationGrid()
    }

    const totalItems = this.items.length
    const totalPages = totalItems === 0 ? 1 : Math.ceil(totalItems / MAX_ROWS_PER_PAGE)
    const content = []

    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
      const start = pageIndex * MAX_ROWS_PER_PAGE
      const chunk = this.items.slice(start, start + MAX_ROWS_PER_PAGE)
      const isLastPage = pageIndex === totalPages - 1

      content.push(...this.buildHeaderFields(pageIndex, totalPages))
      content.push(...this.buildItemRows(chunk, pageIndex))

      if (isLastPage) {
        content.push(...this.buildSummaryFields())
      }

      if (!isLastPage) {
        content.push({ text: '', pageBreak: 'after' })
      }
    }

    return content
  }

  getDocDefinition() {
    return {
      pageSize: { width: PAGE_WIDTH, height: PAGE_HEIGHT },
      pageMargins: [0, 0, 0, 0],
      content: this.buildContent(),
      defaultStyle: {
        font: 'THSarabunNew',
        fontSize: 10
      }
    }
  }

  generatePDF() {
    const pdfMake = initPdfMake()
    return pdfMake.createPdf(this.getDocDefinition())
  }
}
