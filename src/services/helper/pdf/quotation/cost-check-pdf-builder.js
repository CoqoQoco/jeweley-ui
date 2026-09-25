// src/services/helper/pdf/quotation/cost-check-pdf-builder.js
// ใบตรวจสอบต้นทุน — เอกสารภายในเทียบต้นทุนกับราคาขายก่อนส่งใบเสนอราคาให้ลูกค้า
// A4 แนวตั้ง ภาษาไทย ใช้ font THSarabunNew (AcherusGrotesque/ChakraPetch ไม่มี glyph ไทย)

import dayjs from 'dayjs'
import 'dayjs/locale/th'
import { initPdfMake } from '@/services/utils/pdf-make'
import { PDF_COLORS } from '@/services/helper/pdf/shared/pdf-theme.js'
import { prepareItemImages, loadCompanyLogo } from '@/services/helper/pdf/shared/pdf-images.js'
import { formatPrice as formatMoney } from '@/services/helper/pdf/shared/pdf-format.js'
import { formatItemStyleCode } from '@/services/utils/item-code.js'
import {
  computeCostCheckDocument,
  groupPriceTransactionsByGroup,
  LOW_MARGIN_THRESHOLD_PERCENT
} from '@/services/helper/pdf/quotation/cost-check-calc.js'

const COST_CHECK_FONT = 'THSarabunNew'
const WARNING_ORANGE = '#e07b00'
const PROFIT_NEUTRAL = '#000000'
// ความกว้างเนื้อหาจริงของ A4 แนวตั้ง (595.28 - margin ซ้ายขวา 30+30) — ใช้กับเส้น canvas (header rule)
// ที่วาดตรงๆ ด้วย x1/x2 (ไม่มี padding/เส้นขอบมาบวกเพิ่ม จึงชนขอบพอดีที่ค่านี้เป๊ะ)
const CONTENT_WIDTH = 535
// กันเผื่อ font metric / การปัดเศษของ pdfmake คลาดเคลื่อนเล็กน้อยตอน render จริง
const TABLE_SAFETY_BUFFER = 3

// *** สำคัญ *** pdfmake `table.widths` คือความกว้าง "เนื้อหา" ต่อคอลัมน์เท่านั้น ไม่ใช่ความกว้างตารางจริง
// ความกว้างตารางที่ render จริง = Σwidths + จำนวนคอลัมน์ × (paddingLeft+paddingRight) + จำนวนเส้นแนวตั้ง
// (คอลัมน์+1) × vLineWidth — ต้องคำนวณจาก padding/vLineWidth "จริง" ของแต่ละตาราง (ไฟล์นี้ตั้งไม่เท่ากัน
// ในแต่ละตาราง ไม่ใช่ default ของ pdfmake คือ padding 4/4pt + เส้น 1pt) ไม่งั้นตารางจะล้นขอบขวาจริง
// (เจอปัญหานี้มาแล้ว 2 รอบ จาก visual review — ห้ามตั้ง Σwidths = CONTENT_WIDTH ตรงๆ อีก)
function maxTableContentWidth(cols, { paddingX = 3, vLineWidth = 0.5 } = {}) {
  return CONTENT_WIDTH - cols * paddingX * 2 - (cols + 1) * vLineWidth - TABLE_SAFETY_BUFFER
}

const WARNING_LABELS = {
  LOSS: 'ขาดทุน',
  LOW_MARGIN: 'กำไรต่ำ',
  APPRAISAL_MISMATCH: 'ราคาไม่ตรง',
  NO_COST: 'ไม่มีต้นทุน',
  PARTIAL_COST_VERSION: 'ต้นทุนไม่ครบ'
}

const GROUP_LABELS = { Gold: 'ทอง', Worker: 'ค่าแรง', Embed: 'ค่าฝัง', Gem: 'พลอย', ETC: 'อื่นๆ' }

// คั่นระหว่างท่อนข้อมูลในแถบสรุป — ใช้ pipe ASCII ธรรมดา (ไม่ใช้ตัวคั่นแบบจุดกลาง "·" เพราะยังไม่ยืนยันว่า
// THSarabunNew มี glyph นี้จริง กันปัญหาแบบ ⚠/—/≠ ที่เจอมาก่อน)
const STRIP_SEPARATOR = '   |   '

function severityColor(severity) {
  if (severity === 'red') return PDF_COLORS.red
  if (severity === 'orange') return WARNING_ORANGE
  return PDF_COLORS.darkGray
}

function fmtPct(value) {
  const num = Number(value)
  if (!Number.isFinite(num)) return '0.0%'
  return `${(num * 100).toFixed(1)}%`
}

function fmtQty(value) {
  const num = Number(value)
  if (!num) return ''
  return num.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 3 })
}

// เงินเป็นบวกเท่านั้นถึงแสดง — ค่า 0/ว่าง/undefined ให้เว้นว่างเซลล์ (กันคอลัมน์เต็มไปด้วย "0.00" ที่ไม่มีความหมาย
// เช่นแถวค่าแรงที่คิดราคาต่อจำนวนอย่างเดียว ไม่มีน้ำหนัก → ช่องราคา/น้ำหนักต้องว่าง ไม่ใช่ 0.00)
function formatMoneyOrBlank(value) {
  const num = Number(value)
  return num ? formatMoney(num) : ''
}

export class CostCheckPdfBuilder {
  constructor({ items, customer, invoiceDate, invoiceNo, lowMarginThreshold } = {}) {
    this.data = Array.isArray(items) ? items : []
    this.customer = customer || {}
    this.invoiceDate = invoiceDate || dayjs().format('YYYY-MM-DD')
    this.invoiceNo = invoiceNo || this.customer.invoiceNumber || ''
    this.currencyUnit = this.customer.currencyUnit || 'THB'
    this.currencyRate = Number(this.customer.currencyMultiplier) || 1
    this.markup = Number(this.customer.markup) || 0
    const parsedThreshold = Number(lowMarginThreshold)
    this.lowMarginThreshold = Number.isFinite(parsedThreshold) ? parsedThreshold : LOW_MARGIN_THRESHOLD_PERCENT
    this.logoBase64 = null

    this.document = computeCostCheckDocument({
      items: this.data,
      currencyRate: this.currencyRate,
      currencyUnit: this.currencyUnit,
      specialDiscount: this.customer.specialDiscount,
      specialAddition: this.customer.specialAddition,
      freight: this.customer.freight,
      vatPercent: this.customer.vatPercent,
      markup: this.markup,
      lowMarginThreshold: this.lowMarginThreshold
    })
  }

  async preparePDF() {
    if (!this.logoBase64) {
      this.logoBase64 = await loadCompanyLogo().catch(() => null)
    }
    await prepareItemImages(this.data)
    return this
  }

  // === Header ทุกหน้า ===

  buildPageHeader(currentPage, pageCount) {
    return {
      margin: [30, 14, 30, 0],
      stack: [
        {
          columns: [
            { text: 'ใบตรวจสอบต้นทุน (Cost Check)', bold: true, fontSize: 14, color: PDF_COLORS.primary, width: '*' },
            { text: `หน้า ${currentPage} / ${pageCount}`, alignment: 'right', fontSize: 9, color: PDF_COLORS.darkGray, width: 70 }
          ]
        },
        {
          margin: [0, 2, 0, 0],
          columns: [
            { text: `เลขที่ใบเสนอราคา: ${this.invoiceNo || '-'}`, fontSize: 9, width: '35%' },
            { text: `ลูกค้า: ${this.customer.name || '-'}`, fontSize: 9, width: '35%' },
            { text: `วันที่: ${dayjs(this.invoiceDate).locale('th').format('DD/MM/YYYY')}`, fontSize: 9, alignment: 'right', width: '30%' }
          ]
        },
        { text: 'เอกสารภายใน ห้ามส่งลูกค้า', bold: true, fontSize: 9, color: PDF_COLORS.red, margin: [0, 2, 0, 0] },
        {
          margin: [0, 4, 0, 0],
          canvas: [{ type: 'line', x1: 0, y1: 0, x2: CONTENT_WIDTH, y2: 0, lineWidth: 1, lineColor: PDF_COLORS.lightGray }]
        }
      ]
    }
  }

  formatNum(value) {
    const num = Number(value)
    if (!Number.isFinite(num) || value === null || value === undefined || value === '') return '-'
    return num.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  // === แถบสรุปยอดรวม — หน้า 1 เท่านั้น (ไม่มีหน้าสรุปแยกอีกต่อไป) ===

  // บรรทัดพารามิเตอร์ราคา (มัวๆ เล็กๆ) — สกุลเงิน/อัตรา/มาร์กอัป/ส่วนลด/Gold Loss แสดงเสมอไม่ว่าจะเป็น 0 หรือไม่
  buildStripParamsLine() {
    const c = this.customer
    const parts = [
      `สกุลเงิน ${c.currencyUnit || '-'}`,
      `อัตรา ${this.formatNum(c.currencyMultiplier)}`,
      `มาร์กอัป ×${this.formatNum(c.markup)}`,
      `ส่วนลด ${this.formatNum(c.discountPercent)}%`,
      `Gold Loss ${this.formatNum(c.goldLossPercent)}%`
    ]
    return { text: parts.join(STRIP_SEPARATOR), fontSize: 8, color: PDF_COLORS.darkGray }
  }

  // บรรทัดตัวเลขรวมทั้งใบ — ส่วนลดพิเศษ/ส่วนเพิ่มพิเศษ/ค่าขนส่ง/VAT โชว์เฉพาะตอนมีค่า (ไม่ใช่ 0)
  // เป็น rich-text runs (array) เพื่อให้ท่อน "กำไร" และ "มีคำเตือน" มีสีของตัวเองแยกจากท่อนอื่นได้ในบรรทัดเดียว
  buildStripFigureRuns() {
    const d = this.document
    const t = d.totals
    const runs = []

    const push = (text, opts = {}) => {
      if (runs.length) runs.push({ text: STRIP_SEPARATOR, color: PDF_COLORS.darkGray })
      runs.push({ text, ...opts })
    }

    push(`ต้นทุนรวม ${formatMoney(d.totalCost)} ฿`)
    push(`ราคาตั้งขายรวม ${formatMoney(d.totalAppraisal)} ฿`)
    push(`สุทธิ ${formatMoney(d.totalNetThb)} ฿ (${formatMoney(d.totalNetForeign)} ${this.currencyUnit})`)
    if (Number(t.specialDiscount) > 0) push(`ส่วนลดพิเศษ ${formatMoney(t.specialDiscount)} ${this.currencyUnit}`)
    if (Number(t.specialAddition) > 0) push(`ส่วนเพิ่มพิเศษ ${formatMoney(t.specialAddition)} ${this.currencyUnit}`)
    if (Number(t.freight) > 0) push(`ค่าขนส่ง ${formatMoney(t.freight)} ${this.currencyUnit}`)
    if (Number(t.vatAmount) > 0) push(`VAT ${formatMoney(t.vatAmount)} ${this.currencyUnit}`)

    // สีแดงสงวนไว้สำหรับขาดทุนเท่านั้น กำไรปกติใช้สีดำตัวหนา (เป็นกลาง ไม่ใช่สีแดงของแบรนด์)
    push(
      `กำไร ${formatMoney(d.profitThb)} ฿ (${fmtPct(d.profitPct)})`,
      { bold: true, color: d.profitThb < 0 ? PDF_COLORS.red : PROFIT_NEUTRAL }
    )
    push(
      `มีคำเตือน ${d.warningCount} ชิ้น`,
      { bold: d.warningCount > 0, color: d.warningCount > 0 ? WARNING_ORANGE : PDF_COLORS.darkGray }
    )

    return runs
  }

  buildTotalsStrip() {
    // layout กล่องนี้: padding 8/8, เส้นขอบ 1pt, cols=1
    const maxWidth = maxTableContentWidth(1, { paddingX: 8, vLineWidth: 1 }) // = 514
    return {
      margin: [0, 8, 0, 12],
      table: {
        widths: [maxWidth],
        body: [
          [
            {
              stack: [
                this.buildStripParamsLine(),
                { text: this.buildStripFigureRuns(), fontSize: 9.5, margin: [0, 3, 0, 0] }
              ]
            }
          ]
        ]
      },
      layout: {
        hLineWidth: () => 1,
        vLineWidth: () => 1,
        hLineColor: () => PDF_COLORS.lightGray,
        vLineColor: () => PDF_COLORS.lightGray,
        fillColor: () => PDF_COLORS.panelBg,
        paddingLeft: () => 8,
        paddingRight: () => 8,
        paddingTop: () => 6,
        paddingBottom: () => 6
      }
    }
  }

  // === รายละเอียดต่อชิ้น (ไหลต่อเนื่องหลังแถบสรุปในหน้าเดียวกัน ไม่ใช่ 1 หน้า/ชิ้น) ===

  buildMaterialsSummary(item) {
    const materials = Array.isArray(item.materials) ? item.materials : []
    if (!materials.length) return '-'
    return materials
      .map((m) => {
        const weight = m.weight ? Number(m.weight).toFixed(2) : '0.00'
        return `${m.type || ''} ${m.typeCode || ''} ${weight}g`.trim()
      })
      .join(' / ')
  }

  // แถวชื่อชิ้นงาน 2 คอลัมน์ — ซ้าย: ลำดับ+รหัส+ประเภท+วัตถุดิบ, ขวา: จำนวน+ราคาป้ายอ้างอิง (ไม่มีบล็อกรูปแยกแล้ว
  // เพราะรูปย้ายไปอยู่ในคอลัมน์แรกของตารางต้นทุนแทน — ดู buildImageCell/buildCostTable)
  buildItemHeaderRow(item, check, index) {
    const tagPrice = Number(item.price ?? item.productPrice) || 0
    return {
      columns: [
        {
          width: '*',
          stack: [
            { text: `${index + 1}. ${formatItemStyleCode(item)}`, bold: true, fontSize: 11, color: PDF_COLORS.primary },
            { text: item.productTypeName || item.productNameTh || item.productNameEn || '', fontSize: 9, color: PDF_COLORS.darkGray },
            { text: this.buildMaterialsSummary(item), fontSize: 8, color: PDF_COLORS.darkGray, margin: [0, 2, 0, 0] }
          ]
        },
        {
          width: 150,
          alignment: 'right',
          stack: [
            { text: `จำนวน: ${fmtQty(check.qty) || '0'}`, fontSize: 9 },
            { text: `ราคาป้าย (อ้างอิง): ${formatMoney(tagPrice)} ฿`, fontSize: 8, color: PDF_COLORS.muted }
          ]
        }
      ]
    }
  }

  // เซลล์รูปในคอลัมน์แรกของตารางต้นทุน — ต้อง fit ในความกว้างคอลัมน์ (widths[0] = 62, เผื่อ padding 3/3 แล้ว)
  buildImageCell(item) {
    const raw = item.imageBase64
    if (!raw) return { text: '', alignment: 'center' }
    const imageData = raw.startsWith('data:image') ? raw : `data:image/png;base64,${raw}`
    return { image: imageData, fit: [54, 70], alignment: 'center', margin: [0, 2, 0, 2] }
  }

  buildCostTable(item) {
    const groups = groupPriceTransactionsByGroup(item.priceTransactions)
    // layout ตารางนี้: padding 3/3, เส้นแนวตั้ง 0.5pt (ค่า default ของ maxTableContentWidth) → cols=8
    // maxTableContentWidth(8) = 479.5 — Σwidths ต้องไม่เกินนี้ ไม่งั้นตารางล้นขอบขวา (ดูคอมเมนต์ formula ด้านบน)
    const widths = [62, 38, 138, 30, 50, 40, 55, 62] // sum = 475
    const header = [
      { text: 'รูป', style: 'compactHeader', alignment: 'center' },
      { text: 'กลุ่ม', style: 'compactHeader' },
      { text: 'รายละเอียด', style: 'compactHeader' },
      { text: 'จำนวน', style: 'compactHeader', alignment: 'center' },
      { text: 'ราคา/จำนวน', style: 'compactHeader', alignment: 'right' },
      { text: 'น้ำหนัก', style: 'compactHeader', alignment: 'right' },
      { text: 'ราคา/น้ำหนัก', style: 'compactHeader', alignment: 'right' },
      { text: 'รวม (฿)', style: 'compactHeader', alignment: 'right' }
    ]
    const body = [header]

    // เรียงทุก priceTransaction ตามกลุ่มก่อน (Gold/Worker/Embed/Gem/ETC) เพื่อรู้จำนวนแถวทั้งหมดล่วงหน้า —
    // ใช้กำหนด rowSpan ของรูปให้ครอบคลุมถึงแถว "รวมต้นทุน" ท้ายตารางด้วย (ผู้ใช้ขอให้รูปคร่อมแถว footer ด้วย)
    const orderedRows = []
    ;['Gold', 'Worker', 'Embed', 'Gem', 'ETC'].forEach((groupKey) => {
      const rows = groups[groupKey]
      if (!rows || !rows.length) return
      rows.forEach((t, idx) => orderedRows.push({ t, groupKey, isFirstOfGroup: idx === 0 }))
    })

    const totalCost = orderedRows.reduce((sum, r) => sum + (Number(r.t.totalPrice) || 0), 0)
    const totalRows = orderedRows.length + 1 // +1 = แถว "รวมต้นทุน" ท้ายตาราง

    if (!orderedRows.length) {
      body.push([
        { ...this.buildImageCell(item), rowSpan: totalRows },
        { text: 'ไม่มีข้อมูลต้นทุน', fontSize: 8, italics: true, color: PDF_COLORS.muted, colSpan: 6, alignment: 'center' },
        {}, {}, {}, {}, {},
        { text: '', fontSize: 8 }
      ])
    } else {
      orderedRows.forEach((row, index) => {
        const { t, groupKey, isFirstOfGroup } = row
        body.push([
          index === 0 ? { ...this.buildImageCell(item), rowSpan: totalRows } : {},
          { text: isFirstOfGroup ? GROUP_LABELS[groupKey] : '', fontSize: 8, bold: true },
          { text: t.nameDescription || '-', fontSize: 8 },
          { text: fmtQty(t.qty), fontSize: 8, alignment: 'center' },
          { text: formatMoneyOrBlank(t.qtyPrice), fontSize: 8, alignment: 'right' },
          { text: fmtQty(t.qtyWeight), fontSize: 8, alignment: 'right' },
          { text: formatMoneyOrBlank(t.qtyWeightPrice), fontSize: 8, alignment: 'right' },
          { text: formatMoney(Number(t.totalPrice) || 0), fontSize: 8, alignment: 'right' }
        ])
      })
    }

    // แถว "รวมต้นทุน" ท้ายตาราง — คอลัมน์รูป (0) เป็น {} ต่อ rowSpan จากด้านบน, colSpan ครอบ กลุ่ม..ราคา/น้ำหนัก (1-6)
    body.push([
      {},
      { text: 'รวมต้นทุน', style: 'costTableFooterLabel', colSpan: 6 },
      {}, {}, {}, {}, {},
      { text: formatMoney(totalCost), style: 'costTableFooterLabel', alignment: 'right' }
    ])

    return {
      margin: [0, 6, 0, 0],
      table: { headerRows: 1, widths, body },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => PDF_COLORS.lightGray,
        vLineColor: () => PDF_COLORS.lightGray,
        paddingLeft: () => 3,
        paddingRight: () => 3,
        paddingTop: () => 2,
        paddingBottom: () => 2
      }
    }
  }

  // ไล่คำนวณเป็นขั้น: ต้นทุน → ×มาร์กอัป → −ส่วนลด% → สุทธิ ฿/สกุลขาย → กำไร ฿ (%)
  buildChainStrip(check) {
    const cell = (label, value, opts = {}) => ({
      width: 76,
      stack: [
        { text: label, fontSize: 7, color: PDF_COLORS.muted },
        { text: value, fontSize: 9, bold: true, ...opts }
      ]
    })
    const arrow = (text) => ({ width: 20, text, fontSize: 8, color: PDF_COLORS.muted, margin: [0, 8, 0, 0], alignment: 'center' })

    // สีแดงสงวนไว้สำหรับขาดทุนเท่านั้น กำไรปกติใช้สีดำตัวหนา (เป็นกลาง)
    const profitColor = check.profit < 0 ? PDF_COLORS.red : PROFIT_NEUTRAL

    return {
      margin: [0, 8, 0, 0],
      columns: [
        cell('ต้นทุน', `${formatMoney(check.cost)} ฿`),
        arrow(`×${this.formatNum(this.markup)}`),
        // แสดงราคาตั้งขาย "จริง" ที่บันทึกไว้ (ไม่ใช่ค่าคาดหวังจากต้นทุน×มาร์กอัป) ให้สอดคล้องกับสุทธิ ฿
        // ที่คำนวณต่อจากราคานี้จริงๆ — ส่วนค่าคาดหวังไปอยู่ใน APPRAISAL_MISMATCH warning แทน
        cell('ราคาตั้งขาย', `${formatMoney(check.appraisal)} ฿`),
        arrow(`-${check.discountPercent}%`),
        cell('สุทธิ ฿', `${formatMoney(check.netThb)} ฿`),
        cell(`สุทธิ (${this.currencyUnit})`, formatMoney(check.netForeign)),
        cell('กำไร', `${formatMoney(check.profit)} ฿ (${fmtPct(check.profitPct)})`, { color: profitColor })
      ]
    }
  }

  buildWarningsBlock(check) {
    if (!check.warnings.length) return null
    return {
      margin: [0, 6, 0, 0],
      stack: check.warnings.map((w) => ({
        text: `เตือน: [${WARNING_LABELS[w.code] || w.code}] ${w.message}`,
        fontSize: 8,
        bold: true,
        color: severityColor(w.severity)
      }))
    }
  }

  buildDetailBlock(item, check, index) {
    const nodes = [this.buildItemHeaderRow(item, check, index), this.buildCostTable(item), this.buildChainStrip(check)]
    const warningsBlock = this.buildWarningsBlock(check)
    if (warningsBlock) nodes.push(warningsBlock)

    return {
      unbreakable: true,
      margin: [0, 0, 0, 16],
      stack: [
        ...nodes,
        { margin: [0, 8, 0, 0], canvas: [{ type: 'line', x1: 0, y1: 0, x2: CONTENT_WIDTH, y2: 0, lineWidth: 0.5, lineColor: PDF_COLORS.lightGray }] }
      ]
    }
  }

  buildDetailSection() {
    return this.data.map((item, index) => this.buildDetailBlock(item, this.document.items[index], index))
  }

  getDocDefinition() {
    return {
      pageSize: 'A4',
      pageOrientation: 'portrait',
      pageMargins: [30, 80, 30, 30],
      header: (currentPage, pageCount) => this.buildPageHeader(currentPage, pageCount),
      content: [this.buildTotalsStrip(), ...this.buildDetailSection()],
      defaultStyle: {
        font: COST_CHECK_FONT,
        fontSize: 10,
        color: '#000000'
      },
      styles: {
        compactHeader: {
          fontSize: 8,
          bold: true,
          color: 'white',
          fillColor: PDF_COLORS.primary,
          margin: [0, 2, 0, 2]
        },
        costTableFooterLabel: {
          fontSize: 8,
          bold: true,
          color: PDF_COLORS.primary,
          fillColor: PDF_COLORS.lightGray
        }
      }
    }
  }

  async generatePDF() {
    await this.preparePDF()
    const pdfMake = initPdfMake()
    const docDefinition = this.getDocDefinition()
    return pdfMake.createPdf(docDefinition)
  }
}
