import dayjs from 'dayjs'

import { initPdfMake } from '@/services/utils/pdf-make.js'
import { i18n } from '@/plugins/i18n/config.js'

// 80mm thermal paper in pt (1mm = 2.83465pt)
const PAGE_WIDTH = 226.77
const PAGE_MARGINS = [8, 10, 8, 10]
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGINS[0] - PAGE_MARGINS[2]
const RECEIPT_FONT = 'THSarabunNew'

function t(key, params) {
  return i18n.global.t(`view.mobile.receipt.${key}`, params)
}

function toNumber(value) {
  const num = Number(value)
  return Number.isFinite(num) ? num : 0
}

function formatMoney(value) {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(toNumber(value))
}

function formatDateTime(date) {
  const parsed = date ? dayjs(date) : dayjs()
  return parsed.isValid() ? parsed.format('DD/MM/YYYY HH:mm') : dayjs().format('DD/MM/YYYY HH:mm')
}

function divider() {
  return {
    margin: [0, 4, 0, 4],
    canvas: [
      {
        type: 'line',
        x1: 0,
        y1: 0,
        x2: CONTENT_WIDTH,
        y2: 0,
        lineWidth: 0.75,
        lineColor: '#393939'
      }
    ]
  }
}

// two-column label/value row — value column ต้องเป็น '*' เสมอ กัน overflow และดันชิดขวา
function kvRow(label, value, opts = {}) {
  const fontSize = opts.fontSize || 9
  return {
    columns: [
      { text: label, fontSize, bold: !!opts.bold, color: opts.color || '#393939', width: 'auto' },
      {
        text: value,
        fontSize,
        bold: !!opts.bold,
        alignment: 'right',
        color: opts.valueColor || opts.color || '#393939',
        width: '*'
      }
    ],
    columnGap: 4,
    margin: opts.margin || [0, 1, 0, 1]
  }
}

export class Receipt80mmBuilder {
  constructor(data) {
    this.data = data && typeof data === 'object' ? data : {}
    this.items = Array.isArray(this.data.items) ? this.data.items : []
    this.payments = Array.isArray(this.data.payments) ? this.data.payments : []
    this.customer = this.data.customer && typeof this.data.customer === 'object' ? this.data.customer : {}

    this.currencyUnit = this.data.currencyUnit || 'THB'
    this.currencyRate = toNumber(this.data.currencyRate) || 1

    this.specialDiscount = toNumber(this.data.specialDiscount)
    this.specialAddition = toNumber(this.data.specialAddition)
    this.freightAndInsurance = toNumber(this.data.freightAndInsurance)
    this.vatPercent = toNumber(this.data.vatPercent)

    this.subtotal = this.calculateSubtotal()
    this.totalAfterAdjust = this.subtotal - this.specialDiscount + this.specialAddition
    this.totalBeforeVat = this.totalAfterAdjust + this.freightAndInsurance
    this.vatAmount = (this.totalBeforeVat * this.vatPercent) / 100
    this.calculatedGrandTotal = this.totalBeforeVat + this.vatAmount

    // grandTotal จาก backend เป็นค่าหลักเสมอถ้าส่งมา — ค่าที่คำนวณเองใช้เทียบ/แสดงบรรทัดย่อยเท่านั้น
    this.grandTotal = this.isProvided(this.data.grandTotal)
      ? toNumber(this.data.grandTotal)
      : this.calculatedGrandTotal

    this.paidAmount = this.isProvided(this.data.paidAmount)
      ? toNumber(this.data.paidAmount)
      : this.payments.reduce((sum, p) => sum + toNumber(p?.amount), 0)

    this.remainingAmount = this.isProvided(this.data.remainingAmount)
      ? toNumber(this.data.remainingAmount)
      : this.grandTotal - this.paidAmount
  }

  isProvided(value) {
    return value !== undefined && value !== null && value !== ''
  }

  calculateSubtotal() {
    return this.items.reduce((sum, item) => {
      const price = toNumber(item?.appraisalPrice)
      const qty = toNumber(item?.qty)
      const discountPercent = toNumber(item?.discountPercent)
      const priceAfterDiscount = price * (1 - discountPercent / 100)
      return sum + (priceAfterDiscount / this.currencyRate) * qty
    }, 0)
  }

  getHeaderContent() {
    const subParts = []
    const billNumber = this.data.invoiceNumber || this.data.soNumber
    if (billNumber) subParts.push(billNumber)
    subParts.push(formatDateTime(this.data.date))
    if (this.data.sellerName) subParts.push(this.data.sellerName)

    const stack = [
      { text: t('shopName'), fontSize: 15, bold: true, alignment: 'center', margin: [0, 0, 0, 2] },
      { text: subParts.join(' · '), fontSize: 8, alignment: 'center', color: '#666666' }
    ]

    if (this.customer.name) {
      stack.push({
        text: `${t('customer')}: ${this.customer.name}`,
        fontSize: 8,
        alignment: 'center',
        color: '#666666',
        margin: [0, 2, 0, 0]
      })
    }

    return { stack }
  }

  getItemsContent() {
    if (!this.items.length) {
      return [
        { text: t('noItems'), fontSize: 9, alignment: 'center', color: '#999999', margin: [0, 4, 0, 4] }
      ]
    }

    const blocks = []
    this.items.forEach((item) => {
      const price = toNumber(item?.appraisalPrice)
      const qty = toNumber(item?.qty)
      const discountPercent = toNumber(item?.discountPercent)
      const priceAfterDiscount = price * (1 - discountPercent / 100)
      const convertedPrice = priceAfterDiscount / this.currencyRate
      const total = convertedPrice * qty
      const description = item?.description || item?.stockNumber || '-'

      blocks.push({ text: description, fontSize: 9, bold: true, margin: [0, 2, 0, 0] })
      blocks.push({
        columns: [
          { text: item?.stockNumber || '', fontSize: 8, color: '#666666', width: 70 },
          { text: `${formatMoney(convertedPrice)} x ${qty}`, fontSize: 8, alignment: 'right', width: 80 },
          { text: formatMoney(total), fontSize: 8, bold: true, alignment: 'right', width: '*' }
        ],
        columnGap: 2
      })

      if (discountPercent > 0) {
        blocks.push({
          text: `${t('discount')} ${discountPercent}%`,
          fontSize: 7,
          color: '#ff4d4d',
          alignment: 'right',
          margin: [0, 0, 0, 2]
        })
      }
    })

    return blocks
  }

  getSummaryContent() {
    const rows = [kvRow(t('subtotal'), formatMoney(this.subtotal))]

    if (this.specialDiscount > 0) {
      rows.push(kvRow(t('specialDiscount'), `-${formatMoney(this.specialDiscount)}`, { valueColor: '#ff4d4d' }))
    }
    if (this.specialAddition > 0) {
      rows.push(kvRow(t('specialAddition'), `+${formatMoney(this.specialAddition)}`, { valueColor: '#038387' }))
    }
    if (this.freightAndInsurance > 0) {
      rows.push(kvRow(t('freight'), formatMoney(this.freightAndInsurance)))
    }
    if (this.vatPercent > 0) {
      rows.push(kvRow(`${t('vat')} (${this.vatPercent}%)`, formatMoney(this.vatAmount)))
    }

    rows.push(
      kvRow(t('grandTotal'), `${formatMoney(this.grandTotal)} ${this.currencyUnit}`, {
        fontSize: 12,
        bold: true,
        margin: [0, 2, 0, 2]
      })
    )

    return rows
  }

  getPaymentContent() {
    const rows = []

    if (this.payments.length) {
      rows.push({ text: `${t('paidBy')}:`, fontSize: 9, bold: true, margin: [0, 2, 0, 1] })
      this.payments.forEach((p) => {
        rows.push(kvRow(p?.paymentName || '-', formatMoney(p?.amount), { fontSize: 8 }))
      })
    }

    rows.push(kvRow(t('paid'), formatMoney(this.paidAmount), { bold: true }))

    if (this.remainingAmount > 0) {
      rows.push(kvRow(t('remaining'), formatMoney(this.remainingAmount), { bold: true, valueColor: '#ff4d4d' }))
    }

    return rows
  }

  getFooterContent() {
    return { text: t('thankYou'), fontSize: 10, bold: true, alignment: 'center', margin: [0, 6, 0, 0] }
  }

  getDocDefinition() {
    return {
      pageSize: { width: PAGE_WIDTH, height: 'auto' },
      pageMargins: PAGE_MARGINS,
      content: [
        this.getHeaderContent(),
        divider(),
        ...this.getItemsContent(),
        divider(),
        ...this.getSummaryContent(),
        divider(),
        ...this.getPaymentContent(),
        divider(),
        this.getFooterContent()
      ],
      defaultStyle: {
        font: RECEIPT_FONT,
        fontSize: 9
      }
    }
  }
}

export function buildReceiptDocDefinition(data) {
  return new Receipt80mmBuilder(data).getDocDefinition()
}

export function generateReceiptBlob(data) {
  const pdfMake = initPdfMake()
  const docDefinition = buildReceiptDocDefinition(data)
  return new Promise((resolve) => {
    pdfMake.createPdf(docDefinition).getBlob((blob) => resolve(blob))
  })
}

export function openReceipt(data) {
  const pdfMake = initPdfMake()
  const docDefinition = buildReceiptDocDefinition(data)
  pdfMake.createPdf(docDefinition).open()
}
