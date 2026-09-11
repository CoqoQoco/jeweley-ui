import dayjs from 'dayjs'

import { COMPANY_INFO, COMPANY_SOCIAL, socialUrl } from '@/config/company-info.js'
import { PAYMENT_METHOD_BY_CODE } from '@/constants/payment-methods.js'

// ไฟล์นี้สร้างใบเสร็จเป็น "ข้อความล้วนอังกฤษ" (ASCII-only, ไม่ผ่าน pdfmake/ภาพ) แล้วส่งเข้าคิวงานพิมพ์ —
// เครื่องกลางที่หน้า /print-station (views/print-station/index-view.vue) ดึงงานจากคิวแล้วส่งต่อให้
// jewelry-print-bridge วาดทั้งใบเป็นภาพ CPCL เป็นเส้นทางหลัก (printImage) ส่วน stripQrMarkers() ด้านล่าง
// มีไว้ให้เส้นทางที่ไม่ได้วาดภาพ (printRaw ที่ /print-station และ preview <pre> ใน receipt-print-action.vue)
// ต้องเป็น ASCII ล้วนเสมอเพราะ toAsciiOnly() ที่ทางออกกรองอักขระนอก ASCII ทิ้ง — โหมดข้อความของเครื่องพิมพ์รับได้แค่นี้
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

// คอลัมน์บรรทัดรายการวัตถุดิบ (ใต้รายละเอียดสินค้า) — ย้ายทั้งบล็อกมาชิดซ้ายแทนชิดขวาจบคอลัมน์ 47
// เพราะขอบขวาเดิมชนกับคอลัมน์เงินของแถวสินค้า/summary (Subtotal/TOTAL) พอดี ลูกค้าอ่านแล้วเข้าใจผิดว่า
// น้ำหนักวัสดุเป็นราคา — ให้จำนวนเม็ด/น้ำหนักอยู่ใกล้ชื่อวัสดุแทน ไม่ต้องดันสุดขอบกระดาษอีกต่อไป
const MATERIAL_INDENT = '    '
const MATERIAL_NAME_MIN_W = 12
const MATERIAL_NAME_MAX_W = 18
// จำนวนเม็ดชิดขวาในคอลัมน์แคบนี้ เพื่อให้หลักหน่วยตรงกันทุกแถว
const MATERIAL_QTY_W = 7
// ช่องว่างคั่นจำนวนเม็ดกับน้ำหนัก
const MATERIAL_GAP = 2

// จำนวนขีดของเส้นเซ็น — เยื้อง 2 + ขีด 45 ตัว = 47 พอดี
const SIGNATURE_LINE_LEN = 45

// ป้ายวิธีชำระเงินบนใบเสร็จ — ดึง receiptLabel จาก PAYMENT_METHOD_BY_CODE (src/constants/payment-methods.js)
// ห้ามใช้ paymentName จาก i18n เพราะเป็นภาษาไทย แล้วโดน toAsciiOnly() กรองทิ้งจนเหลือสตริงว่าง
// (เจอจริงตอน E2E 2026-09-03) และใบเสร็จต้องเป็นอังกฤษเสมอ ไม่ผูกกับภาษาที่ผู้ใช้เลือกบนจอ
// ครอบรหัส 0 (ค้างชำระ) และ 5 (เครดิต) ด้วย — ต้องไม่ตกไปที่คำว่า 'Payment' ทั่วไป

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

// แถวช่องทางติดต่อท้ายใบเสร็จ — ป้ายกว้าง 11 ตัวอักษรคงที่ เยื้องซ้าย 2 ช่อง เหมือนบรรทัด 'Customer : ' ที่หัวใบ
function footerChannelLine(label, value) {
  return clampLine('  ' + padRight(label, 11) + value)
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

// ความกว้างคอลัมน์ชื่อวัสดุร่วมทั้งใบ — ไล่หาชื่อยาวสุดในทุก item เพื่อให้จำนวน/น้ำหนักตรงคอลัมน์กันทุกแถว
// (ชื่อวัสดุยาวในชิ้นหนึ่ง เช่น 'DIAMOND (G,VS1)' ต้องไม่ทำให้แถวของชิ้นอื่นเยื้องไม่ตรงกัน)
function materialNameWidth(items) {
  const itemList = Array.isArray(items) ? items : []
  let longest = 0
  itemList.forEach((item) => {
    const materials = Array.isArray(item?.materialSummary) ? item.materialSummary : []
    materials.forEach((m) => {
      const len = String(m?.name || '').length
      if (len > longest) longest = len
    })
  })
  // +1 บังคับช่องว่างคั่นชื่อกับจำนวนอย่างน้อย 1 ตัวเสมอ
  return Math.min(MATERIAL_NAME_MAX_W, Math.max(MATERIAL_NAME_MIN_W, longest + 1))
}

// บรรทัดวัตถุดิบต่อชิ้น (ใต้ itemDetailLine) — เยื้อง 4, ชื่อวัสดุชิดซ้ายกว้างคงที่ตลอดทั้งใบ (nameWidth
// มาจาก materialNameWidth() คำนวณครั้งเดียวก่อนวนทั้งใบ), จำนวนเม็ดชิดขวาในคอลัมน์แคบ แล้วน้ำหนักชิดซ้ายต่อท้าย
// ไม่ดันไปจบคอลัมน์ 47 อีกต่อไป — กันลูกค้าอ่านสับสนว่าน้ำหนักเป็นราคา (ขอบขวาเดิมชนคอลัมน์เงินพอดี)
// qty เป็น '' เมื่อวัสดุไม่มีจำนวนเม็ด (ทอง) — ปล่อยเป็นช่องว่างตามที่เป็น ไม่เติมค่าแทน
function materialLine(name, qty, weight, nameWidth) {
  const width = nameWidth || MATERIAL_NAME_MIN_W
  const nameCol = padRight(String(name || '').slice(0, width), width)
  const qtyCol = padLeft(qty || '', MATERIAL_QTY_W)
  const weightStr = weight || ''

  const line = MATERIAL_INDENT + nameCol + qtyCol + ' '.repeat(MATERIAL_GAP) + weightStr
  return clampLine(line.trimEnd())
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

// ตรวจจับบรรทัดสัญญาณ QR — ต้องตรงกับตรรกะฝั่ง ReceiptImageBuilder.cs (print-bridge) เป๊ะ:
// trim ท้ายแล้วขึ้นต้น [[QR: และลงท้าย ]]
const QR_MARKER_LINE_PATTERN = /^\[\[QR:.*\]\]$/

// ลบบรรทัดสัญญาณ [[QR:...]] ออกทั้งบรรทัด (รวม newline) — เรียกที่ทางออกที่ไม่ได้วาดภาพ (printRaw / <pre> fallback)
// กันบรรทัดสัญญาณโผล่เป็นตัวหนังสือดิบๆ ให้ผู้ใช้เห็น
export function stripQrMarkers(text) {
  return String(text ?? '')
    .split('\n')
    .filter((line) => !QR_MARKER_LINE_PATTERN.test(line.trimEnd()))
    .join('\n')
}

// ป้ายวิธีชำระเงินต่อแถว: ใช้โค้ดตัวเลข (p.payment) แม็ปเป็นอังกฤษก่อนเสมอ
// fallback ไป paymentName เฉพาะเมื่อเป็น ASCII ล้วน แล้วสุดท้าย fallback 'Payment' — ห้ามปล่อยว่างเด็ดขาด
function paymentLabel(p) {
  const label =
    PAYMENT_METHOD_BY_CODE[p?.payment]?.receiptLabel ||
    (isAsciiOnly(p?.paymentName) ? p.paymentName : '') ||
    'Payment'
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

    // fallback ไปค่า default จาก config เสมอ — ใบเสร็จมี footer ช่องทางติดต่อไม่ว่า caller จะส่ง company มาหรือไม่
    this.company = this.normalizeCompany(this.data.company)

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

  // shape: { website, social: { facebook, instagram, tiktok, lineOa } } — field ไหนไม่ส่งมา fallback ไป config เสมอ
  normalizeCompany(company) {
    const source = company && typeof company === 'object' ? company : {}
    const social = source.social && typeof source.social === 'object' ? source.social : {}
    return {
      website: source.website || COMPANY_INFO.website,
      social: {
        facebook: social.facebook || COMPANY_SOCIAL.facebook,
        instagram: social.instagram || COMPANY_SOCIAL.instagram,
        tiktok: social.tiktok || COMPANY_SOCIAL.tiktok,
        lineOa: social.lineOa || COMPANY_SOCIAL.lineOa
      }
    }
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
    const nameW = materialNameWidth(this.items)
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

      // รายการวัตถุดิบต่อชิ้น (ทอง/เพชร/พลอย) — ไม่มีข้อมูลก็ไม่พิมพ์บรรทัดใดๆ เลย (ไม่ขึ้น '-' หรือ 'No materials')
      const materials = Array.isArray(item?.materialSummary) ? item.materialSummary : []
      materials.forEach((m) => lines.push(materialLine(m.name, m.qty, m.weight, nameW)))
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

  // แสดงเฉพาะใบที่ชำระครบแล้วเท่านั้น (จ่ายบางส่วน/ยังไม่จ่าย = ไม่แสดงเลย ไม่กินบรรทัดใดๆ)
  hasSignatureBlock() {
    return this.grandTotal > 0 && this.remainingAmount <= 0
  }

  buildSignatureLines() {
    if (!this.hasSignatureBlock()) return []

    const signatureLine = '  ' + '_'.repeat(SIGNATURE_LINE_LEN)
    return [
      center('SIGNATURES'),
      '',
      '  Seller',
      '',
      signatureLine,
      '',
      '  Customer',
      '',
      signatureLine,
      ''
    ]
  }

  buildFooterLines() {
    const { website, social } = this.company
    const lines = [center('Thank you for taking the first step with us'), '']

    // บรรทัดสัญญาณ QR ให้โหมดพิมพ์เป็นภาพ (receipt-image-preview.js / ReceiptImageBuilder.cs) วาด QR แทน —
    // push ดิบ ห้ามผ่าน center()/clampLine() เพราะไม่ได้ถูกพิมพ์เป็นตัวอักษรจริง (ยาวเกิน 47 ได้)
    const qrUrl = socialUrl('website', website)
    if (qrUrl) lines.push(`[[QR:${qrUrl}]]`)

    lines.push(center('Scan to shop & follow'))

    if (website) lines.push(footerChannelLine('Web', website))
    if (social.lineOa) lines.push(footerChannelLine('LINE', social.lineOa))
    if (social.facebook) lines.push(footerChannelLine('Facebook', social.facebook))
    if (social.instagram) lines.push(footerChannelLine('Instagram', social.instagram))
    if (social.tiktok) lines.push(footerChannelLine('TikTok', social.tiktok))

    // เว้น 4 บรรทัดท้ายให้ฉีกกระดาษได้พอดี
    lines.push('', '', '', '')
    return lines
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
      ...this.buildSignatureLines(),
      ...this.buildFooterLines()
    ]
    return lines.join('\n')
  }
}

export function buildReceiptText(data) {
  return new ReceiptTextBuilder(data).build()
}
