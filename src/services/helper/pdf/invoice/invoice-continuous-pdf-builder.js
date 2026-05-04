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

  buildContent() {
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
