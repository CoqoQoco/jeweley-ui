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

function severityColor(severity) {
  if (severity === 'red') return PDF_COLORS.red
  if (severity === 'orange') return WARNING_ORANGE
  return PDF_COLORS.darkGray
}

// warning "เด่นสุด" ของรายการ — เอาไว้แสดงเป็น label สั้นๆ ในตารางสรุป (ไม่ใช่แค่จำนวน) ให้สีแดง (LOSS)
// เด่นกว่าสีส้มเสมอ ถ้าไม่มีสีแดงเลยให้ใช้ตัวแรกที่พบ (ลำดับ push ใน buildItemWarnings คือลำดับความสำคัญอยู่แล้ว)
function primaryWarning(warnings) {
  if (!Array.isArray(warnings) || !warnings.length) return null
  return warnings.find((w) => w.severity === 'red') || warnings[0]
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

  // === Header/Footer ทุกหน้า ===

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

  // === หน้า 1: พารามิเตอร์ราคา ===

  buildParametersSection() {
    const c = this.customer
    const rows = [
      ['สกุลเงิน', c.currencyUnit || '-', 'อัตราแลกเปลี่ยน', this.formatNum(c.currencyMultiplier)],
      ['มาร์กอัป (×)', this.formatNum(c.markup), 'ส่วนลด (%)', this.formatNum(c.discountPercent)],
      ['Gold Spot (US$/Oz.)', this.formatNum(c.goldSpotPrice), 'Premium', this.formatNum(c.goldPremium)],
      ['Gold Markup', this.formatNum(c.goldMarkup), 'Gold Loss (%)', this.formatNum(c.goldLossPercent)],
      ['ค่าบริการ/Service (%)', this.formatNum(c.profitPercent), '', '']
    ]

    return {
      margin: [0, 8, 0, 0],
      table: {
        widths: [110, 120, 110, 120],
        body: rows.map(([l1, v1, l2, v2]) => [
          { text: l1, fontSize: 9, bold: true, color: PDF_COLORS.darkGray },
          { text: v1, fontSize: 9 },
          { text: l2, fontSize: 9, bold: true, color: PDF_COLORS.darkGray },
          { text: v2, fontSize: 9 }
        ])
      },
      layout: {
        hLineWidth: () => 0,
        vLineWidth: () => 0,
        paddingLeft: () => 2,
        paddingRight: () => 2,
        paddingTop: () => 2,
        paddingBottom: () => 2
      }
    }
  }

  formatNum(value) {
    const num = Number(value)
    if (!Number.isFinite(num) || value === null || value === undefined || value === '') return '-'
    return num.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  buildTotalsBox() {
    const d = this.document
    const t = d.totals

    const row = (label, value, opts = {}) => [
      { text: label, fontSize: 9, bold: true, color: PDF_COLORS.darkGray },
      { text: value, fontSize: 9, alignment: 'right', ...opts }
    ]

    const body = [
      row('ต้นทุนรวม (฿)', formatMoney(d.totalCost)),
      row('ราคาตั้งขายรวม (฿)', formatMoney(d.totalAppraisal)),
      row('ส่วนลดพิเศษ (สกุลขาย)', formatMoney(t.specialDiscount)),
      row('ส่วนเพิ่มพิเศษ (สกุลขาย)', formatMoney(t.specialAddition)),
      row('สุทธิรวม (฿)', formatMoney(d.totalNetThb)),
      row(`สุทธิรวม (${this.currencyUnit})`, formatMoney(d.totalNetForeign)),
      row('ค่าขนส่ง (สกุลขาย)', formatMoney(t.freight)),
      row(`VAT (${this.formatNum(this.customer.vatPercent)}%)`, formatMoney(t.vatAmount)),
      row(
        'กำไรเอกสาร (฿)',
        `${formatMoney(d.profitThb)}  (${fmtPct(d.profitPct)})`,
        // สีแดงสงวนไว้สำหรับ "ขาดทุน" เท่านั้น กำไรปกติใช้สีดำตัวหนา (เป็นกลาง ไม่ใช่สีแดงของแบรนด์)
        { bold: true, color: d.profitThb < 0 ? PDF_COLORS.red : PROFIT_NEUTRAL }
      ),
      row(
        'จำนวนรายการที่มีคำเตือน',
        String(d.warningCount),
        { bold: true, color: d.warningCount > 0 ? WARNING_ORANGE : PDF_COLORS.darkGray }
      )
    ]

    // layout ตารางนี้: padding 4/4, ไม่มีเส้นแนวตั้ง (vLineWidth 0) → cols=2
    const maxWidth = maxTableContentWidth(2, { paddingX: 4, vLineWidth: 0 }) // = 516
    return {
      margin: [0, 10, 0, 0],
      table: { widths: [200, maxWidth - 200], body },
      layout: {
        hLineWidth: (i) => (i === 0 || i === body.length ? 1 : 0.5),
        vLineWidth: () => 0,
        hLineColor: () => PDF_COLORS.lightGray,
        fillColor: () => PDF_COLORS.panelBg,
        paddingLeft: () => 4,
        paddingRight: () => 4,
        paddingTop: () => 3,
        paddingBottom: () => 3
      }
    }
  }

  buildCompactTable() {
    // layout ตารางนี้: padding 3/3, เส้นแนวตั้ง 0.5pt (ค่า default ของ maxTableContentWidth) → cols=9
    // maxTableContentWidth(9) = 473 — Σwidths ต้องไม่เกินนี้ ไม่งั้นตารางล้นขอบขวา (ดูคอมเมนต์ formula ด้านบน)
    const widths = [20, 93, 25, 60, 60, 60, 55, 40, 60] // sum = 473
    const header = [
      { text: '#', style: 'compactHeader', alignment: 'center' },
      { text: 'รหัส', style: 'compactHeader' },
      { text: 'จำนวน', style: 'compactHeader', alignment: 'center' },
      { text: 'ต้นทุน (฿)', style: 'compactHeader', alignment: 'right' },
      { text: 'ราคาตั้งขาย (฿)', style: 'compactHeader', alignment: 'right' },
      { text: 'สุทธิ (฿)', style: 'compactHeader', alignment: 'right' },
      { text: `สุทธิ (${this.currencyUnit})`, style: 'compactHeader', alignment: 'right' },
      { text: '% กำไร', style: 'compactHeader', alignment: 'right' },
      { text: 'เตือน', style: 'compactHeader', alignment: 'center' }
    ]

    const body = [header]

    this.document.items.forEach((check, index) => {
      const item = this.data[index]
      const rowColor = check.severity === 'red' ? '#fdecea' : check.severity === 'orange' ? '#fff4e5' : null
      const warnColor = severityColor(check.severity)
      const warning = primaryWarning(check.warnings)

      body.push([
        { text: String(index + 1), fontSize: 8, alignment: 'center', fillColor: rowColor },
        { text: formatItemStyleCode(item), fontSize: 8, fillColor: rowColor },
        { text: fmtQty(check.qty) || '0', fontSize: 8, alignment: 'center', fillColor: rowColor },
        { text: formatMoney(check.lineCost), fontSize: 8, alignment: 'right', fillColor: rowColor },
        { text: formatMoney(check.lineAppraisal), fontSize: 8, alignment: 'right', fillColor: rowColor },
        { text: formatMoney(check.lineNetThb), fontSize: 8, alignment: 'right', fillColor: rowColor },
        { text: formatMoney(check.lineNetForeign), fontSize: 8, alignment: 'right', fillColor: rowColor },
        { text: fmtPct(check.profitPct), fontSize: 8, alignment: 'right', fillColor: rowColor },
        {
          text: warning ? (WARNING_LABELS[warning.code] || warning.code) : '',
          fontSize: 7.5,
          alignment: 'center',
          bold: true,
          color: warnColor,
          fillColor: rowColor
        }
      ])
    })

    return {
      margin: [0, 10, 0, 0],
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

  buildSummaryPage() {
    return {
      stack: [
        { text: 'พารามิเตอร์ราคา', bold: true, fontSize: 12, color: PDF_COLORS.primary },
        this.buildParametersSection(),
        { text: 'สรุปยอดรวมทั้งใบ', bold: true, fontSize: 12, color: PDF_COLORS.primary, margin: [0, 12, 0, 0] },
        this.buildTotalsBox(),
        { text: 'รายการสินค้า', bold: true, fontSize: 12, color: PDF_COLORS.primary, margin: [0, 12, 0, 0] },
        this.buildCompactTable()
      ]
    }
  }

  // === หน้ารายละเอียดต่อชิ้น (ไหลต่อเนื่อง ไม่ใช่ 1 หน้า/ชิ้น) ===

  buildImageCell(item) {
    const raw = item.imageBase64
    if (!raw) {
      return { canvas: [{ type: 'rect', x: 0, y: 0, w: 55, h: 55, lineWidth: 0.5, lineColor: PDF_COLORS.lightGray }] }
    }
    const imageData = raw.startsWith('data:image') ? raw : `data:image/png;base64,${raw}`
    return { image: imageData, fit: [55, 55] }
  }

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

  buildItemHeaderRow(item, check, index) {
    const tagPrice = Number(item.price ?? item.productPrice) || 0
    return {
      columns: [
        { width: 60, stack: [this.buildImageCell(item)] },
        {
          width: '*',
          margin: [8, 0, 0, 0],
          stack: [
            { text: `${index + 1}. ${formatItemStyleCode(item)}`, bold: true, fontSize: 11, color: PDF_COLORS.primary },
            { text: item.productTypeName || item.productNameTh || item.productNameEn || '', fontSize: 9, color: PDF_COLORS.darkGray },
            { text: this.buildMaterialsSummary(item), fontSize: 8, color: PDF_COLORS.darkGray, margin: [0, 2, 0, 0] }
          ]
        },
        {
          width: 130,
          alignment: 'right',
          stack: [
            { text: `จำนวน: ${fmtQty(check.qty) || '0'}`, fontSize: 9 },
            { text: `ราคาป้าย (อ้างอิง): ${formatMoney(tagPrice)} ฿`, fontSize: 8, color: PDF_COLORS.muted }
          ]
        }
      ]
    }
  }

  buildCostTable(item) {
    const groups = groupPriceTransactionsByGroup(item.priceTransactions)
    // layout ตารางนี้: padding 3/3, เส้นแนวตั้ง 0.5pt (ค่า default ของ maxTableContentWidth) → cols=6
    // maxTableContentWidth(6) = 492.5 — Σwidths ต้องไม่เกินนี้ ไม่งั้นตารางล้นขอบขวา (ดูคอมเมนต์ formula ด้านบน)
    const widths = [55, 192, 35, 55, 80, 75] // sum = 492
    const header = [
      { text: 'กลุ่ม', style: 'compactHeader' },
      { text: 'รายละเอียด', style: 'compactHeader' },
      { text: 'จำนวน', style: 'compactHeader', alignment: 'center' },
      { text: 'น้ำหนัก', style: 'compactHeader', alignment: 'right' },
      { text: 'ราคา/หน่วย (฿)', style: 'compactHeader', alignment: 'right' },
      { text: 'รวม (฿)', style: 'compactHeader', alignment: 'right' }
    ]
    const body = [header]

    ;['Gold', 'Worker', 'Embed', 'Gem', 'ETC'].forEach((groupKey) => {
      const rows = groups[groupKey]
      if (!rows || !rows.length) return
      rows.forEach((t, idx) => {
        const unitPrice = Number(t.qtyWeight) ? Number(t.qtyWeightPrice) || 0 : Number(t.qtyPrice) || 0
        body.push([
          { text: idx === 0 ? GROUP_LABELS[groupKey] : '', fontSize: 8, bold: true },
          { text: t.nameDescription || '-', fontSize: 8 },
          { text: fmtQty(t.qty), fontSize: 8, alignment: 'center' },
          { text: fmtQty(t.qtyWeight), fontSize: 8, alignment: 'right' },
          { text: formatMoney(unitPrice), fontSize: 8, alignment: 'right' },
          { text: formatMoney(Number(t.totalPrice) || 0), fontSize: 8, alignment: 'right' }
        ])
      })
    })

    if (body.length === 1) {
      body.push([{ text: 'ไม่มีข้อมูลต้นทุน', fontSize: 8, italics: true, color: PDF_COLORS.muted, colSpan: 6, alignment: 'center' }, {}, {}, {}, {}, {}])
    }

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
      content: [
        this.buildSummaryPage(),
        { text: '', pageBreak: 'after' },
        { text: 'รายละเอียดต้นทุนรายชิ้น', bold: true, fontSize: 12, color: PDF_COLORS.primary, margin: [0, 0, 0, 8] },
        ...this.buildDetailSection()
      ],
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
