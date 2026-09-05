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

// คอลัมน์บรรทัดรายละเอียดสินค้า: ราคา x จำนวน (อย่างน้อย 15) + ยอดรวม (อย่างน้อย 14) ชิดขวาจบคอลัมน์ 47
// คอลัมน์รหัสสินค้าด้านซ้ายกินพื้นที่ที่เหลือ — ยอมให้รหัสสั้นลง ดีกว่ายอมให้ตัวเงินถูกตัดหางเมื่อยอดถึงหลักล้าน
const ITEM_COL2 = 15
const ITEM_COL3 = 14

// ป้ายวิธีชำระเงินบนใบเสร็จ — แม็ปจากโค้ดตัวเลขของ PAYMENT_METHODS ใน pos-checkout-sheet.vue
// ห้ามใช้ paymentName จาก i18n เพราะเป็นภาษาไทย แล้วโดน toAsciiOnly() กรองทิ้งจนเหลือสตริงว่าง
// (เจอจริงตอน E2E 2026-09-03) และใบเสร็จต้องเป็นอังกฤษเสมอ ไม่ผูกกับภาษาที่ผู้ใช้เลือกบนจอ
const PAYMENT_LABELS = { 1: 'Cash', 2: 'Transfer', 3: 'Cheque', 4: 'Credit Card', 5: 'Credit' }

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
  // +1 บังคับช่องว่างคั่นป้ายกับตัวเลขอย่างน้อย 1 ตัวเสมอ กันป้าย+ค่าชนกันพอดีความกว้าง (เช่น 'TOTAL (THB)' 11 ตัว + ยอด 12 ตัว)
  const valueCol = Math.max(SUMMARY_VALUE_W, value.length + 1)
  const indent = Math.max(0, WIDTH - labelCol - valueCol)
  return clampLine(' '.repeat(indent) + padRight(label, labelCol) + padLeft(value, valueCol))
}

// ตัวเงินได้ความกว้างที่ต้องการก่อนเสมอ — คอลัมน์รหัสสินค้าค่อยยืดหยุ่นรับส่วนที่เหลือ
// กันยอดเงินยาว (หลักล้านขึ้นไป) ถูก clampLine() ตัดหางทิ้งเมื่อคอลัมน์รหัสสินค้าตายตัวดันบรรทัดล้น
function itemDetailLine(stockNumber, unitPrice, qty, total) {
  const midRaw = `${formatMoney(unitPrice)} x${qty}`
  const rightRaw = formatMoney(total)

  // +1 บังคับให้มีช่องว่างคั่นอย่างน้อย 1 ตัวเสมอ กันตัวเลข 2 ก้อนติดกันเมื่อยอดยาว
  const mid = padLeft(midRaw, Math.max(ITEM_COL2, midRaw.length + 1))
  const right = padLeft(rightRaw, Math.max(ITEM_COL3, rightRaw.length + 1))

  const leftW = Math.max(0, WIDTH - mid.length - right.length)
  const left = padRight('  ' + (stockNumber || ''), leftW).slice(0, leftW)

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

// กรองเหลือ ASCII (\x20-\x7E และ \n) — เรียกที่ "ทางออกฝั่ง ESC/POS" เท่านั้น ไม่เรียกตอน build()
// เพราะ payload ที่เก็บในคิวต้องคงตัวอักษรไทย (เช่นชื่อลูกค้า) ไว้ให้โหมดพิมพ์เป็นภาพวาดออกมาได้
// โหมดข้อความส่งไบต์ดิบเข้าเครื่องพิมพ์ ตัวนอกช่วงนี้ทำให้พ่นกระดาษมั่ว จึงต้องกรองก่อนส่งเสมอ
export function toAsciiOnly(text) {
  let out = ''
  for (const ch of String(text)) {
    const code = ch.charCodeAt(0)
    if (ch === '\n' || (code >= 0x20 && code <= 0x7e)) out += ch
  }
  return out
}

function isAsciiOnly(text) {
  return /^[\x20-\x7e]*$/.test(String(text || ''))
}

// ป้ายวิธีชำระเงินต่อแถว: ใช้โค้ดตัวเลข (p.payment) แม็ปเป็นอังกฤษก่อนเสมอ
// fallback ไป paymentName เฉพาะเมื่อเป็น ASCII ล้วน แล้วสุดท้าย fallback 'Payment' — ห้ามปล่อยว่างเด็ดขาด
function paymentLabel(p) {
  const label = PAYMENT_LABELS[p?.payment] || (isAsciiOnly(p?.paymentName) ? p.paymentName : '') || 'Payment'
  return p?.bankCode ? `${label} (${p.bankCode})` : label
}

export class ReceiptTextBuilder {
  constructor(data) {
    this.data = data && typeof data === 'object' ? data : {}
    this.items = Array.isArray(this.data.items) ? this.data.items : []
    this.payments = Array.isArray(this.data.payments) ? this.data.payments : []

    // จำกัดความยาวชื่อกันบรรทัดล้น — ตัวไทยไม่ใช่ monospace ฝั่งวาดภาพจะย่อฟอนต์ให้พอดีเองอีกชั้น
    this.customerName = String(this.data.customer?.name || '').trim().slice(0, 30)
    this.seller = String(this.data.seller || '').trim().slice(0, 30)

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
    // ไม่พิมพ์ชื่อร้านเป็นข้อความ เพราะโลโก้ด้านบนมีชื่อร้านอยู่แล้ว (โหมดพิมพ์เป็นภาพ)
    // บรรทัดว่างคั่นให้หัวใบแยกเป็นก้อนแบรนด์ (โลโก้+สโลแกน) กับก้อนข้อมูลบิล (RECEIPT+เลขที่+ลูกค้า+ผู้ขาย)
    const lines = [
      center('The first step is always the hardest'),
      '',
      center('RECEIPT')
    ]

    // เลขที่บิล/วันที่ ชิดซ้ายให้อยู่กลุ่มเดียวกับ Customer/Seller อ่านเป็นบล็อกข้อมูลบิลก้อนเดียว
    const billNumber = this.data.invoiceNumber || this.data.soNumber
    const parts = []
    if (billNumber) parts.push(billNumber)
    parts.push(formatDateTime(this.data.date))
    lines.push(clampLine(parts.join('   ')))

    // ป้ายกว้าง 11 ตัวอักษรเท่ากันทั้งคู่ ('Customer : ' / 'Seller   : ') ค่าจึงเริ่มคอลัมน์เดียวกัน
    if (this.customerName) lines.push(clampLine(`Customer : ${this.customerName}`))
    if (this.seller) lines.push(clampLine(`Seller   : ${this.seller}`))

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
      lines.push(lineLR(paymentLabel(p), formatMoney(p?.amount)))
    })

    // จ่ายเกินยอด = มีเงินทอน (คนละกรณีกับ Outstanding ที่จ่ายไม่ครบ จึงเกิดพร้อมกันไม่ได้)
    const change = this.paidAmount - this.grandTotal
    if (change > 0) {
      lines.push(lineLR('Change', formatMoney(change)))
    }

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
      '',                          // เว้นให้รายการแรกไม่ติดเส้นคั่น
      ...this.buildItemLines(),
      divider,
      ...this.buildSummaryLines(),
      divider,
      ...this.buildPaymentLines(),
      divider,
      ...this.buildFooterLines()
    ]
    return lines.join('\n')
  }
}

export function buildReceiptText(data) {
  return new ReceiptTextBuilder(data).build()
}
