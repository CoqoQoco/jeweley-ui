import dayjs from 'dayjs'
import QRCode from 'qrcode'

import { initPdfMake } from '@/services/utils/pdf-make.js'
import { i18n } from '@/plugins/i18n/config.js'
import { COMPANY_INFO, COMPANY_SOCIAL, socialUrl } from '@/config/company-info.js'

// 80mm thermal paper in pt (1mm = 2.83465pt)
const PAGE_WIDTH = 226.77
const PAGE_MARGINS = [8, 10, 8, 10]
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGINS[0] - PAGE_MARGINS[2]
const RECEIPT_FONT = 'THSarabunNew'

// pageSize.height:'auto' ทำให้ pdfmake ตั้งความสูงหน้าเป็น Infinity ภายใน (ดูคอมเมนต์ fixPageSize
// ใน node_modules/pdfmake) — เครื่องพิมพ์ความร้อนบางรุ่น (เช่น HPRT HM-A300E) เดินกระดาษ
// ตามความสูงหน้าที่ MediaBox รายงานจริง ไม่ใช่ตามเนื้อหา จึงต้องคำนวณความสูงจากเนื้อหาเองเป็นตัวเลข
// LINE_HEIGHT_FACTOR วัดจริงด้วย harness (pdfmake + font THSarabunNew.ttf จริง) ได้ค่าคงที่ ~1.301
// ทุก fontSize ที่ใช้ในใบเสร็จนี้ (7/8/9/10/12/15, ทั้ง regular และ bold ให้ค่าเท่ากัน)
const LINE_HEIGHT_FACTOR = 1.301
// จำนวนตัวอักษรโดยประมาณต่อบรรทัดของชื่อสินค้า (fontSize 9 bold) ภายใน CONTENT_WIDTH — วัดจริงพบว่า
// รับได้ 35-65 ตัวอักษร/บรรทัดแล้วแต่ตัวอักษร ใช้ค่าต่ำกว่าจริงเพื่อเผื่อเกินดีกว่าขาด (คำนวณจำนวนบรรทัดที่ตัด)
const DESC_CHARS_PER_LINE = 28
// ระยะที่ divider() แต่ละเส้นกินไป (margin บน 4 + ล่าง 4, ตัวเส้นเองสูง 0) — วัดจริงตรงกับค่านี้เป๊ะ
const DIVIDER_HEIGHT = 8

// ความกว้างคอลัมน์รายการวัตถุดิบต่อชิ้น (ใต้แถวรหัสสินค้า) — เดิมจำนวนเม็ด/น้ำหนักชิดขวาจบขอบเดียวกับ
// คอลัมน์เงินของแถวสินค้า (alignment: 'right' กว้างเท่ากันทั้งคู่) ลูกค้าอ่านแล้วเข้าใจผิดว่าน้ำหนักเป็นราคา
// ย้ายมาเป็นบล็อกชิดซ้าย: ชื่อวัสดุกว้างคงที่ก่อน แล้วจำนวนเม็ดชิดขวาในคอลัมน์แคบ แล้วน้ำหนักชิดซ้ายเป็น
// คอลัมน์สุดท้าย ('*') เพื่อไม่ให้ตัวเลขไปสุดขอบขวาอีก
const MATERIAL_NAME_COL_W = 80
const MATERIAL_QTY_COL_W = 50

// ระยะห่างระหว่างช่อง Seller กับ Customer (เรียงลงมาเต็มความกว้าง CONTENT_WIDTH เหมือนฝั่งข้อความ —
// user ปฏิเสธแบบ 2 ช่องเรียงข้างกันไปแล้วเพราะเซ็นไม่พอ)
const SIGNATURE_ROW_GAP = 10
// เผื่อเกิน เพื่อกันพลาดจากการปัดเศษ/ความคลาดเคลื่อนของการประมาณความยาวบรรทัดที่ตัดคำ
const SAFETY_BUFFER = 10

// QR ท้ายใบเสร็จ — ทาง PDF วาดอิสระด้วย pdfmake ไม่ต้องใช้บรรทัดสัญญาณเหมือนทางภาพ/CPCL
const FOOTER_QR_WIDTH = 90 // pt ≈ 32mm บนกระดาษ 80mm — QR ที่สร้างเป็นภาพสี่เหลี่ยมจัตุรัส สูง≈กว้าง
const FOOTER_QR_MARGIN_TOP = 6
const FOOTER_QR_MARGIN_BOTTOM = 2

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

// สร้าง QR เป็น dataURL — คืน null เมื่อสร้างไม่สำเร็จ (ไม่ throw ให้ footer วาดต่อโดยไม่มี QR)
async function buildQrDataUrl(url) {
  try {
    return await QRCode.toDataURL(url, { errorCorrectionLevel: 'M', width: 300, margin: 1 })
  } catch {
    return null
  }
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

      // รายการวัตถุดิบต่อชิ้น (ทอง/เพชร/พลอย) — ไม่มีข้อมูลก็ไม่วาดบล็อกนี้เลย
      const materials = Array.isArray(item?.materialSummary) ? item.materialSummary : []
      materials.forEach((m) => {
        blocks.push({
          columns: [
            { text: m.name, fontSize: 7, color: '#666666', width: MATERIAL_NAME_COL_W },
            { text: m.qty || '', fontSize: 7, color: '#666666', alignment: 'right', width: MATERIAL_QTY_COL_W },
            { text: m.weight, fontSize: 7, color: '#666666', alignment: 'left', width: '*' }
          ],
          columnGap: 4,
          margin: [8, 0, 0, 0]
        })
      })
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

  // แสดงเฉพาะใบที่ชำระครบแล้วเท่านั้น (จ่ายบางส่วน/ยังไม่จ่าย = ไม่แสดงเลย ไม่กินพื้นที่)
  hasSignatureBlock() {
    return this.grandTotal > 0 && this.remainingAmount <= 0
  }

  getSignatureContent() {
    if (!this.hasSignatureBlock()) return []

    // เรียงลงมาเต็มความกว้าง (เหมือน buildSignatureLines() ฝั่งข้อความ) — ไม่ใช่ 2 ช่องเคียงกัน
    // เพราะช่องแคบเซ็นไม่พอ margin-bottom ของ label คือระยะเว้นให้เซ็นจริง เส้นยาวเต็ม CONTENT_WIDTH
    const signatureRow = (label, marginBottom = 0) => ({
      stack: [
        { text: label, fontSize: 8, color: '#666666', margin: [0, 0, 0, 20] },
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: CONTENT_WIDTH, y2: 0, lineWidth: 0.5, lineColor: '#393939' }] }
      ],
      margin: [0, 0, 0, marginBottom]
    })

    return [
      { text: t('signatureTitle'), fontSize: 9, bold: true, alignment: 'center', margin: [0, 2, 0, 8] },
      signatureRow(t('signatureSeller'), SIGNATURE_ROW_GAP),
      signatureRow(t('signatureCustomer'))
    ]
  }

  // ช่องทางติดต่อที่มีค่า (ไม่ว่าง) เท่านั้น — ใช้ร่วมกันทั้ง estimateFooterHeight() และ getFooterContent()
  // เพื่อให้จำนวนแถวที่ประมาณความสูงกับที่วาดจริงตรงกันเสมอ
  getFooterChannelEntries() {
    const { website, social } = this.company
    const entries = [
      [t('channelWeb'), website],
      [t('channelLine'), social.lineOa],
      [t('channelFacebook'), social.facebook],
      [t('channelInstagram'), social.instagram],
      [t('channelTiktok'), social.tiktok]
    ]
    return entries.filter(([, value]) => !!value)
  }

  // เตรียม QR (async) + รายการช่องทางไว้ล่วงหน้าครั้งเดียว — ใช้ทั้งคำนวณความสูงหน้า (estimateReceiptHeight)
  // และวาดเนื้อหาจริง (getFooterContent) ให้ผลตรงกันเป๊ะ ไม่ว่า QR จะสร้างสำเร็จหรือไม่
  async prepareFooterPlan() {
    const qrUrl = socialUrl('website', this.company.website)
    const qrDataUrl = qrUrl ? await buildQrDataUrl(qrUrl) : null
    return { qrDataUrl, channelEntries: this.getFooterChannelEntries() }
  }

  getFooterContent(footerPlan) {
    const blocks = [
      { text: t('thankYou'), fontSize: 10, bold: true, alignment: 'center', margin: [0, 6, 0, 0] }
    ]

    if (footerPlan.qrDataUrl) {
      blocks.push({
        image: footerPlan.qrDataUrl,
        width: FOOTER_QR_WIDTH,
        alignment: 'center',
        margin: [0, FOOTER_QR_MARGIN_TOP, 0, FOOTER_QR_MARGIN_BOTTOM]
      })
      blocks.push({
        text: t('scanToShopFollow'),
        fontSize: 8,
        alignment: 'center',
        color: '#666666',
        margin: [0, 0, 0, 4]
      })
    }

    footerPlan.channelEntries.forEach(([label, value]) => {
      blocks.push({
        columns: [
          { text: label, fontSize: 7, bold: true, width: 60, color: '#666666' },
          { text: value, fontSize: 7, width: '*', color: '#666666' }
        ],
        columnGap: 4,
        margin: [0, 0, 0, 1]
      })
    })

    return blocks
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
      const materials = Array.isArray(item?.materialSummary) ? item.materialSummary : []
      itemHeight += materials.length * lineHeight(7) // แถวรายการวัตถุดิบ (ไม่มี margin เพิ่ม)
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

  // ต้องตรงกับ getSignatureContent() เป๊ะ — เรียงลงมา 2 แถว (Seller, Customer) ไม่ใช่เคียงข้างกันแล้ว
  // แถวละ: label (margin-bottom 20 เผื่อเซ็น) + เส้น canvas สูง 0 → title + แถว×2 + ช่องว่างคั่นระหว่างแถว 1 จุด
  estimateSignatureHeight() {
    if (!this.hasSignatureBlock()) return 0
    const titleHeight = 2 + lineHeight(9) + 8
    const rowHeight = lineHeight(8) + 20
    return titleHeight + rowHeight * 2 + SIGNATURE_ROW_GAP
  }

  // footerPlan มาจาก prepareFooterPlan() — ต้องเป็นอันเดียวกับที่ getFooterContent() ใช้วาดจริงเสมอ
  // ไม่งั้นความสูงหน้ากับเนื้อหาจริงจะไม่ตรงกัน (เครื่องพิมพ์เดินกระดาษตาม MediaBox ไม่ใช่ตามเนื้อหา)
  estimateFooterHeight(footerPlan) {
    let height = 6 + lineHeight(10) // thankYou text, margin top 6

    if (footerPlan.qrDataUrl) {
      height += FOOTER_QR_MARGIN_TOP + FOOTER_QR_WIDTH + FOOTER_QR_MARGIN_BOTTOM // QR ภาพสี่เหลี่ยมจัตุรัส สูง≈กว้าง
      height += lineHeight(8) + 4 // "Scan to shop & follow" caption, margin bottom 4
    }

    height += footerPlan.channelEntries.length * (lineHeight(7) + 1) // แถวช่องทาง margin bottom 1

    return height
  }

  estimateReceiptHeight(footerPlan) {
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
      this.estimateSignatureHeight() +
      this.estimateFooterHeight(footerPlan) +
      SAFETY_BUFFER

    return Math.ceil(height)
  }

  async getDocDefinition() {
    const footerPlan = await this.prepareFooterPlan()

    return {
      pageSize: { width: PAGE_WIDTH, height: this.estimateReceiptHeight(footerPlan) },
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
        ...this.getSignatureContent(),
        ...this.getFooterContent(footerPlan)
      ],
      defaultStyle: {
        font: RECEIPT_FONT,
        fontSize: 9
      }
    }
  }
}

export async function buildReceiptDocDefinition(data) {
  return new Receipt80mmBuilder(data).getDocDefinition()
}

export async function generateReceiptBlob(data) {
  const pdfMake = initPdfMake()
  const docDefinition = await buildReceiptDocDefinition(data)
  return new Promise((resolve) => {
    pdfMake.createPdf(docDefinition).getBlob((blob) => resolve(blob))
  })
}

export async function openReceipt(data) {
  const pdfMake = initPdfMake()
  const docDefinition = await buildReceiptDocDefinition(data)
  pdfMake.createPdf(docDefinition).open()
}
