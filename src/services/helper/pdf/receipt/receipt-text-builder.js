import dayjs from 'dayjs'

// เครื่องพิมพ์ HPRT HM-A300E: โหมดข้อความทำงานปกติ แต่โหมดภาพ/กราฟิกพัง (พ่นกระดาษจนหมดม้วน)
// ไฟล์นี้จึงสร้างใบเสร็จเป็น "ข้อความล้วนอังกฤษ" ส่งตรงไป RawBT ผ่าน receipt-rawbt.js — ไม่ผ่าน pdfmake/ภาพใดๆ ทั้งสิ้น
// กระดาษกว้าง 48 ตัวอักษร แต่ใช้ 47 โดยตั้งใจ
// พิมพ์ครบ 48 ตัวเมื่อไหร่ เครื่องขึ้นบรรทัดใหม่ให้เอง แล้ว \n ของเราขึ้นซ้ำอีก = ได้บรรทัดว่างแถมทุกบรรทัด
// (พิสูจน์ด้วยการพิมพ์จริง 2026-09-03: บล็อก 10 บรรทัดกว้าง 48 ยาวเป็น 2 เท่าของบล็อกกว้าง 46)
// ห้ามเปลี่ยนกลับเป็น 48
const WIDTH = 47

// คอลัมน์บรรทัดสรุป (Subtotal/Discount/Addition/Freight/VAT/TOTAL/Outstanding)
// indent คงที่ทุกบรรทัดเพื่อให้ตัวเลขชิดขวาตรงคอลัมน์เดียวกับรายการสินค้า/วิธีชำระเงินซึ่งจบที่คอลัมน์ 47 พอดี
const SUMMARY_LABEL_W = 11
const SUMMARY_VALUE_W = 12

// คอลัมน์บรรทัดรายละเอียดสินค้า: "  " + รหัสสินค้า (18) + ราคา x จำนวน (15) + ยอดรวม (14) = 47
// ลด ITEM_COL3 (ยอดรวมขวาสุด) เพราะยอดเงินจริงของธุรกิจนี้ไม่เกิน 12-13 ตัวอักษร
const ITEM_COL1 = 18
const ITEM_COL2 = 15
const ITEM_COL3 = 14

function toNumber(value) {
  const num = Number(value)
  return Number.isFinite(num) ? num : 0
}

function formatMoney(value) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(toNumber(value))
}

function formatDateTime(date) {
  const parsed = date ? dayjs(date) : dayjs()
  return parsed.isValid() ? parsed.format('DD/MM/YYYY HH:mm') : dayjs().format('DD/MM/YYYY HH:mm')
}

function padRight(str, width) {
  return str.length >= width ? str : str + ' '.repeat(width - str.length)
}

function padLeft(str, width) {
  return str.length >= width ? str : ' '.repeat(width - str.length) + str
}

// safety net สุดท้าย — ห้ามมีบรรทัดไหนเกิน 47 ตัวอักษรเด็ดขาด (ตัวเลขจริงของธุรกิจนี้ไม่ควรชนขอบนี้อยู่แล้ว)
function clampLine(str) {
  return str.length > WIDTH ? str.slice(0, WIDTH) : str
}

function center(str) {
  if (str.length >= WIDTH) return clampLine(str)
  const pad = WIDTH - str.length
  return ' '.repeat(Math.floor(pad / 2)) + str
}

// label ซ้าย value ชิดขวา เต็มความกว้าง — ใช้กับรายการวิธีชำระเงินแต่ละแถว
function lineLR(label, value) {
  const valueStr = String(value)
  const maxLabel = Math.max(1, WIDTH - valueStr.length - 1)
  const labelStr = label.length > maxLabel ? label.slice(0, maxLabel) : label
  const gap = Math.max(1, WIDTH - labelStr.length - valueStr.length)
  return clampLine(labelStr + ' '.repeat(gap) + valueStr)
}

// บรรทัดสรุปแบบเยื้องขวา (Subtotal/TOTAL/Outstanding/...) — indent คงที่ทุกแถวเพื่อให้ value ชนคอลัมน์เดียวกัน
function summaryLine(label, value) {
  const labelCol = Math.max(SUMMARY_LABEL_W, label.length)
  const valueCol = Math.max(SUMMARY_VALUE_W, value.length)
  const indent = Math.max(0, WIDTH - labelCol - valueCol)
  return clampLine(' '.repeat(indent) + padRight(label, labelCol) + padLeft(value, valueCol))
}

function itemDetailLine(stockNumber, unitPrice, qty, total) {
  const left = padRight('  ' + (stockNumber || ''), ITEM_COL1).slice(0, ITEM_COL1)
  const mid = padLeft(`${formatMoney(unitPrice)} x${qty}`, ITEM_COL2)
  const right = padLeft(formatMoney(total), ITEM_COL3)
  return clampLine(left + mid + right)
}

// ตัดคำขึ้นบรรทัดใหม่เมื่อชื่อสินค้ายาวเกิน 47 — คำเดี่ยวที่ยาวเกิน width ก็ตัดเป็นท่อนแทนการดันบรรทัดยาวเกิน
function wrapText(text, width = WIDTH) {
  const words = String(text || '').split(/\s+/).filter(Boolean)
  if (!words.length) return ['-']

  const lines = []
  let current = ''
  words.forEach((rawWord) => {
    let word = rawWord
    while (word.length > width) {
      if (current) {
        lines.push(current)
        current = ''
      }
      lines.push(word.slice(0, width))
      word = word.slice(width)
    }
    const candidate = current ? `${current} ${word}` : word
    if (candidate.length > width) {
      lines.push(current)
      current = word
    } else {
      current = candidate
    }
  })
  if (current) lines.push(current)
  return lines
}

// กรอง ASCII แบบเด็ดขาด — เหลือเฉพาะ \x20-\x7E และ \n เท่านั้น กันเครื่องพิมพ์พ่นกระดาษมั่วจากอักขระนอกช่วงนี้
// ห้ามข้ามขั้นตอนนี้เด็ดขาด แม้ข้อมูลปัจจุบันจะเป็น ASCII ล้วนอยู่แล้วก็ตาม (กันของใหม่ที่อาจหลุดเข้ามาในอนาคต)
function toAsciiOnly(text) {
  let out = ''
  for (const ch of String(text)) {
    const code = ch.charCodeAt(0)
    if (ch === '\n' || (code >= 0x20 && code <= 0x7e)) out += ch
  }
  return out
}

export class ReceiptTextBuilder {
  constructor(data) {
    this.data = data && typeof data === 'object' ? data : {}
    this.items = Array.isArray(this.data.items) ? this.data.items : []
    this.payments = Array.isArray(this.data.payments) ? this.data.payments : []

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

    // grandTotal/paidAmount/remainingAmount จาก backend เป็นค่าหลักเสมอถ้าส่งมา ห้ามคำนวณทับ (เหมือน receipt-80mm-builder.js)
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

  buildHeaderLines() {
    const lines = [center('Duang Kaew Jewelry'), center('The first step is always the hardest')]

    const billNumber = this.data.invoiceNumber || this.data.soNumber
    const parts = []
    if (billNumber) parts.push(billNumber)
    parts.push(formatDateTime(this.data.date))
    lines.push(center(parts.join('   ')))

    return lines
  }

  buildItemLines() {
    if (!this.items.length) {
      return [center('No items')]
    }

    const lines = []
    this.items.forEach((item) => {
      const price = toNumber(item?.appraisalPrice)
      const qty = toNumber(item?.qty)
      const discountPercent = toNumber(item?.discountPercent)
      const priceAfterDiscount = price * (1 - discountPercent / 100)
      const unitPrice = priceAfterDiscount / this.currencyRate
      const total = unitPrice * qty
      const description = item?.description || item?.stockNumber || '-'

      wrapText(description).forEach((line) => lines.push(line))
      lines.push(itemDetailLine(item?.stockNumberOrigin || item?.stockNumber, unitPrice, qty, total))
      if (discountPercent > 0) {
        lines.push(`  Discount ${discountPercent}%`)
      }
    })

    return lines
  }

  buildSummaryLines() {
    const lines = [summaryLine('Subtotal', formatMoney(this.subtotal))]

    if (this.specialDiscount > 0) {
      lines.push(summaryLine('Discount', `-${formatMoney(this.specialDiscount)}`))
    }
    if (this.specialAddition > 0) {
      lines.push(summaryLine('Addition', `+${formatMoney(this.specialAddition)}`))
    }
    if (this.freightAndInsurance > 0) {
      lines.push(summaryLine('Freight', formatMoney(this.freightAndInsurance)))
    }
    if (this.vatPercent > 0) {
      lines.push(summaryLine(`VAT ${this.vatPercent}%`, formatMoney(this.vatAmount)))
    }

    lines.push(summaryLine(`TOTAL (${this.currencyUnit})`, formatMoney(this.grandTotal)))

    return lines
  }

  buildPaymentLines() {
    const lines = []

    this.payments.forEach((p) => {
      const name = p?.bankName ? `${p.paymentName || '-'} (${p.bankName})` : p?.paymentName || '-'
      lines.push(lineLR(name, formatMoney(p?.amount)))
    })

    // จ่ายไม่ครบ (remainingAmount จาก backend > 0) แสดง Outstanding — ห้ามคำนวณทับ remainingAmount
    if (this.remainingAmount > 0) {
      lines.push(summaryLine('Outstanding', formatMoney(this.remainingAmount)))
    }

    return lines
  }

  buildFooterLines() {
    // เว้น 4 บรรทัดท้ายให้ฉีกกระดาษได้พอดี
    return [center('Thank you for taking the first step with us'), '', '', '', '']
  }

  build() {
    const divider = '-'.repeat(WIDTH)
    const lines = [
      ...this.buildHeaderLines(),
      divider,
      ...this.buildItemLines(),
      divider,
      ...this.buildSummaryLines(),
      divider,
      ...this.buildPaymentLines(),
      divider,
      ...this.buildFooterLines()
    ]
    return toAsciiOnly(lines.join('\n'))
  }
}

export function buildReceiptText(data) {
  return new ReceiptTextBuilder(data).build()
}
