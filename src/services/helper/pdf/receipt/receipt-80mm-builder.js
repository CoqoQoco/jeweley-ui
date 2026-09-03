import dayjs from 'dayjs'

import { initPdfMake } from '@/services/utils/pdf-make.js'
import { i18n } from '@/plugins/i18n/config.js'

// 80mm thermal paper in pt (1mm = 2.83465pt)
const PAGE_WIDTH = 226.77
const PAGE_MARGINS = [8, 10, 8, 10]
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGINS[0] - PAGE_MARGINS[2]
const RECEIPT_FONT = 'THSarabunNew'

// pageSize.height:'auto' ทำให้ pdfmake ตั้งความสูงหน้าเป็น Infinity ภายใน (ดูคอมเมนต์ fixPageSize
// ใน node_modules/pdfmake) — เครื่องพิมพ์ความร้อนบางรุ่น (เช่น HPRT HM-A300E ผ่าน RawBT) เดินกระดาษ
// ตามความสูงหน้าที่ MediaBox รายงานจริง ไม่ใช่ตามเนื้อหา จึงต้องคำนวณความสูงจากเนื้อหาเองเป็นตัวเลข
// LINE_HEIGHT_FACTOR วัดจริงด้วย harness (pdfmake + font THSarabunNew.ttf จริง) ได้ค่าคงที่ ~1.301
// ทุก fontSize ที่ใช้ในใบเสร็จนี้ (7/8/9/10/12/15, ทั้ง regular และ bold ให้ค่าเท่ากัน)
const LINE_HEIGHT_FACTOR = 1.301
// จำนวนตัวอักษรโดยประมาณต่อบรรทัดของชื่อสินค้า (fontSize 9 bold) ภายใน CONTENT_WIDTH — วัดจริงพบว่า
// รับได้ 35-65 ตัวอักษร/บรรทัดแล้วแต่ตัวอักษร ใช้ค่าต่ำกว่าจริงเพื่อเผื่อเกินดีกว่าขาด (คำนวณจำนวนบรรทัดที่ตัด)
const DESC_CHARS_PER_LINE = 28
// ระยะที่ divider() แต่ละเส้นกินไป (margin บน 4 + ล่าง 4, ตัวเส้นเองสูง 0) — วัดจริงตรงกับค่านี้เป๊ะ
const DIVIDER_HEIGHT = 8
// เผื่อเกิน เพื่อกันพลาดจากการปัดเศษ/ความคลาดเคลื่อนของการประมาณความยาวบรรทัดที่ตัดคำ
const SAFETY_BUFFER = 10

function lineHeight(fontSize) {
  return fontSize * LINE_HEIGHT_FACTOR
}

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

  // ประเมินความสูงหน้าเป็นตัวเลข (pt) จากเนื้อหาจริงที่จะ render — สูตรอิงตาม margin/fontSize
  // ที่ประกาศไว้ตรงๆ ใน getXxxContent() ด้านบน ทุกจุด ต้องแก้คู่กันถ้าแก้ layout เนื้อหา
  estimateHeaderHeight() {
    let height = lineHeight(15) + 2 + lineHeight(8) // shopName (margin bottom 2) + subParts
    if (this.customer.name) {
      height += 2 + lineHeight(8) // customer line: margin top 2
    }
    return height
  }

  estimateItemsHeight() {
    if (!this.items.length) {
      return lineHeight(9) + 8 // noItems text, margin [0,4,0,4]
    }
    return this.items.reduce((sum, item) => {
      const description = item?.description || item?.stockNumber || '-'
      const wrappedLines = Math.max(1, Math.ceil(description.length / DESC_CHARS_PER_LINE))
      let itemHeight = 2 + lineHeight(9) * wrappedLines // description: margin top 2
      itemHeight += lineHeight(8) // stockNumber/price/qty/total row
      if (toNumber(item?.discountPercent) > 0) {
        itemHeight += lineHeight(7) + 2 // discount line: margin bottom 2
      }
      return sum + itemHeight
    }, 0)
  }

  estimateSummaryHeight() {
    let rowCount = 1 // subtotal เสมอ
    if (this.specialDiscount > 0) rowCount++
    if (this.specialAddition > 0) rowCount++
    if (this.freightAndInsurance > 0) rowCount++
    if (this.vatPercent > 0) rowCount++
    return rowCount * (2 + lineHeight(9)) + (4 + lineHeight(12)) // แถวปกติ (margin [0,1,0,1]) + grandTotal (margin [0,2,0,2])
  }

  estimatePaymentHeight() {
    let height = 0
    if (this.payments.length) {
      height += 3 + lineHeight(9) // "ชำระโดย:" margin [0,2,0,1]
      height += this.payments.length * (2 + lineHeight(8)) // แต่ละ payment margin [0,1,0,1]
    }
    height += 2 + lineHeight(9) // paid row
    if (this.remainingAmount > 0) {
      height += 2 + lineHeight(9) // remaining row
    }
    return height
  }

  estimateFooterHeight() {
    return 6 + lineHeight(10) // margin top 6
  }

  estimateReceiptHeight() {
    const height =
      PAGE_MARGINS[1] +
      PAGE_MARGINS[3] +
      this.estimateHeaderHeight() +
      DIVIDER_HEIGHT +
      this.estimateItemsHeight() +
      DIVIDER_HEIGHT +
      this.estimateSummaryHeight() +
      DIVIDER_HEIGHT +
      this.estimatePaymentHeight() +
      DIVIDER_HEIGHT +
      this.estimateFooterHeight() +
      SAFETY_BUFFER

    return Math.ceil(height)
  }

  getDocDefinition() {
    return {
      pageSize: { width: PAGE_WIDTH, height: this.estimateReceiptHeight() },
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
