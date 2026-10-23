import dayjs from 'dayjs'
import 'dayjs/locale/en'
import { PDF_FONT, PDF_COLORS } from '@/services/helper/pdf/shared/pdf-theme.js'
import { buildDocumentHeader } from '@/services/helper/pdf/shared/pdf-sections.js'
import { formatItemStyleCode } from '@/services/utils/item-code.js'
import { COMPANY_INFO, loadCompanyInfo } from '@/config/company-info.js'
import {
  buildBreakdownPriceModel,
  getBlockRowCount,
  resolveGoldGroupLabel
} from '@/services/helper/breakdown-price-calc.js'

// ความกว้างคอลัมน์รวม 816 <= A4 landscape 842 - margin 10+10 = 822 (กัน pdfmake ดันตารางล้นกระดาษ)
// pdfmake บวก padding ซ้าย/ขวา (1.5 x 2) และเส้นตั้ง 0.5 เพิ่มจาก width — ผลรวม 736 + 69 + 12 = 817 <= A4 landscape 842 - margin 20 = 822
const CELL_PADDING_X = 1.5
const COLUMN_WIDTHS = [
  12, 38, 38, 34, // SL, STOCK NO., IMAGE, ARTICLE
  28, 30, 34, // GOLD: A B C
  22, 26, 32, 34, // DIAMOND: D E F G
  34, 20, 26, 32, 34, // STONE: name H I J K
  58, 30, 36, // LABOR: name L M
  38, 38, 22, 40 // N O P Q
]
const COLUMN_COUNT = COLUMN_WIDTHS.length
const IMAGE_SIZE = 30

// งบความสูงหน้า (pt) สำหรับตัดตารางเป็นก้อนต่อหน้า — pdfmake ไม่เก็บบล็อก rowSpan ของชิ้นเดียวกันไว้ด้วยกันข้ามหน้าให้
// หน้าแรกเสียที่ให้ header บริษัท/ลูกค้า; ค่าประมาณแบบเผื่อไว้ (เหลือที่ว่างท้ายหน้าดีกว่าบล็อกขาดครึ่ง)
const FIRST_PAGE_BUDGET = 350
const NEXT_PAGE_BUDGET = 465
const ROW_HEIGHT = 13.5

export class BreakdownPricePdfBuilder {
  constructor({
    items,
    customer,
    invoiceDate,
    invoiceNo,
    currencyUnit,
    currencyMultiplier,
    profitPercent,
    goldLossPercent,
    laborAllSettingUsd,
    laborWcpfrUsd
  }) {
    this.data = items || []
    this.customer = customer || {}
    this.invoiceDate = invoiceDate || dayjs().format('YYYY-MM-DD')
    this.invoiceNo = invoiceNo
    this.currencyUnit = currencyUnit || 'THB'
    this.currencyMultiplier = Number(currencyMultiplier) || 1
    const parsedProfit = profitPercent === '' || profitPercent === null ? NaN : Number(profitPercent)
    this.profitPercent = Number.isFinite(parsedProfit) ? parsedProfit : 15
    this.goldLossPercent = Number(goldLossPercent ?? 12)
    this.laborAllSettingUsd = laborAllSettingUsd
    this.laborWcpfrUsd = laborWcpfrUsd
    this.goldSpotPrice = this.customer.goldSpotPrice || this.customer.goldPerOz || 0
    this.logoBase64 = null
    this.companyInfo = { ...COMPANY_INFO }
    this.imageCache = new Map()
  }

  async prepareImages() {
    const { getAzureBlobAsBase64 } = await import('@/config/azure-storage-config.js')
    await Promise.all(
      this.data.map(async (item) => {
        const blobPath = item.imageBlobPath || item.imagePath
        if (!blobPath || this.imageCache.has(blobPath)) return
        const base64Image = await getAzureBlobAsBase64(blobPath, 'stock')
        if (base64Image && base64Image.length > 0) this.imageCache.set(blobPath, base64Image)
      })
    )
  }

  async preparePDF() {
    if (!this.logoBase64) {
      try {
        const logoPath = new URL('@/assets/duangkaew-icon.png', import.meta.url).href
        this.logoBase64 = await this.loadImageAsBase64(logoPath)
      } catch (error) {
        console.error('Failed to load logo:', error)
      }
    }
    const company = await loadCompanyInfo()
    this.companyInfo = { ...COMPANY_INFO, ...(company?.info || {}) }
    await this.prepareImages()
    return this
  }

  async loadImageAsBase64(path) {
    try {
      const response = await fetch(path)
      const blob = await response.blob()
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
    } catch (error) {
      console.error('Error loading image:', error)
      return null
    }
  }

  getModels() {
    return buildBreakdownPriceModel(this.data, {
      currencyMultiplier: this.currencyMultiplier,
      profitPercent: this.profitPercent,
      goldLossPercent: this.goldLossPercent,
      laborAllSettingUsd: this.laborAllSettingUsd,
      laborWcpfrUsd: this.laborWcpfrUsd
    })
  }

  // === table cells ===

  headCell(text, extra = {}) {
    return { text, style: 'headCell', alignment: 'center', ...extra }
  }

  cell(text, extra = {}) {
    return { text: text === undefined || text === null ? '' : String(text), alignment: 'center', ...extra }
  }

  num(value, extra = {}) {
    return this.cell(this.formatPrice(value), { alignment: 'right', ...extra })
  }

  // ว่างเมื่อไม่มีค่า (กันพิมพ์ 0.00 ในช่องที่ไม่เกี่ยว)
  numOrBlank(value, extra = {}) {
    return Number(value) ? this.num(value, extra) : this.cell('', extra)
  }

  imageCell(item, rowSpan) {
    const base64 = this.imageCache.get(item.imageBlobPath || item.imagePath) || item.imageBase64
    if (!base64) return this.cell('', { rowSpan })
    const image = base64.startsWith('data:image') ? base64 : `data:image/png;base64,${base64}`
    return { image, width: IMAGE_SIZE, height: IMAGE_SIZE, alignment: 'center', rowSpan }
  }

  buildHeaderRows(goldLabel) {
    const e = {}
    const fill = (n) => Array.from({ length: n }, () => ({}))
    const first4 = ['SL', 'STOCK NO.', 'IMAGE', 'ARTICLE'].map((t) => this.headCell(t, { rowSpan: 3 }))
    const group = (text, span) => [this.headCell(text, { colSpan: span }), ...fill(span - 1)]
    const tail = (text) => this.headCell(text, { rowSpan: 2 })

    const row0 = [
      ...first4,
      ...group(goldLabel, 3),
      ...group('DIAMOND', 4),
      ...group('STONE', 5),
      ...group('LABOR CHARGE', 3),
      tail('Total'),
      tail(`Profit ${this.profitPercent}%`),
      tail('Total QTY'),
      tail('Total Amount')
    ]
    const row1 = [
      e, e, e, e,
      ...['Gold Wt', 'Price/gms', 'Gold Value'].map((t) => this.headCell(t)),
      ...['# of pc', '# of ct', 'Dia Price/Carat', 'Dia Charge'].map((t) => this.headCell(t)),
      ...['Color Stone', '# of pc', '# of ct', 'Stone Price/Carat', 'Stone Charge'].map((t) => this.headCell(t)),
      ...['Labor', 'Labor Price/pcs', 'Total Labor Price'].map((t) => this.headCell(t)),
      e, e, e, e
    ]
    const letters = [
      '', '', '', '',
      'A', 'B', 'C',
      'D', 'E', 'F', 'G',
      '', 'H', 'I', 'J', 'K',
      '', 'L', 'M',
      'N', 'O', 'P', 'Q'
    ]
    const row2 = letters.map((l, i) => (i < 4 ? e : this.headCell(l ? `(${l})` : '', { style: 'letterCell' })))
    return [row0, row1, row2]
  }

  buildItemRows(item, model, index) {
    const rows = getBlockRowCount(model)
    const stoneRows = model.stones
    const skipCell = {}
    const body = []
    const spanTotals = model.mode === 'single'

    for (let r = 0; r < rows; r++) {
      const first = r === 0
      const row = []

      // SL / STOCK / IMAGE / ARTICLE / GOLD / DIAMOND
      if (first) {
        row.push(this.cell(index + 1, { rowSpan: rows }))
        row.push(this.cell(formatItemStyleCode(item), { rowSpan: rows }))
        row.push(this.imageCell(item, rows))
        row.push(this.cell(item.description || item.productTypeName || '', { rowSpan: rows }))
        row.push(this.num(model.gold.weight, { rowSpan: rows }))
        row.push(this.num(model.gold.pricePerGram, { rowSpan: rows }))
        row.push(this.num(model.gold.value, { rowSpan: rows }))
        row.push(this.cell(model.diamond.pcs || '', { rowSpan: rows }))
        row.push(this.numOrBlank(model.diamond.ct, { rowSpan: rows }))
        row.push(this.numOrBlank(model.diamond.pricePerCt, { rowSpan: rows }))
        row.push(this.numOrBlank(model.diamond.charge, { rowSpan: rows }))
      } else {
        for (let i = 0; i < 11; i++) row.push(skipCell)
      }

      // STONE
      const stone = stoneRows[r]
      row.push(this.cell(stone ? stone.name : '', { alignment: 'left' }))
      row.push(this.cell(stone ? stone.pcs || '' : ''))
      row.push(stone ? this.numOrBlank(stone.ct) : this.cell(''))
      row.push(stone ? this.numOrBlank(stone.pricePerCt) : this.cell(''))
      row.push(stone ? this.num(stone.charge) : this.cell(''))

      // LABOR
      const line = model.labor[r]
      if (line) {
        row.push(this.cell(line.name, { alignment: 'left' }))
        row.push(this.num(line.pricePerPc))
        row.push(this.num(line.total))
      } else if (r === model.labor.length) {
        row.push(this.cell('Total Labor Price', { alignment: 'left', bold: true }))
        row.push(this.cell(''))
        row.push(this.num(model.laborTotal, { bold: true }))
      } else {
        row.push(this.cell(''), this.cell(''), this.cell(''))
      }

      // N / O / P / Q
      if (spanTotals) {
        const t = model.single
        if (first) {
          row.push(this.num(t.N, { rowSpan: rows, bold: true }))
          row.push(this.num(t.O, { rowSpan: rows }))
          row.push(this.cell(t.P, { rowSpan: rows }))
          row.push(this.num(t.Q, { rowSpan: rows, bold: true }))
        } else {
          row.push(skipCell, skipCell, skipCell, skipCell)
        }
      } else {
        const t = model.options[r]
        if (t) {
          row.push(this.num(t.N, { bold: true }), this.num(t.O), this.cell(t.P), this.num(t.Q, { bold: true }))
        } else {
          row.push(this.cell(''), this.cell(''), this.cell(''), this.cell(''))
        }
      }

      body.push(row)
    }
    return body
  }

  getDocDefinition() {
    const models = this.getModels()
    const goldLabel = resolveGoldGroupLabel(this.data)

    const chunks = []
    let current = null
    let used = 0
    let budget = FIRST_PAGE_BUDGET
    this.data.forEach((item, idx) => {
      const rows = this.buildItemRows(item, models[idx], idx)
      const height = Math.max(rows.length * ROW_HEIGHT, IMAGE_SIZE + 8) + 4
      if (!current || used + height > budget) {
        if (current) budget = NEXT_PAGE_BUDGET
        current = []
        chunks.push(current)
        used = 0
      }
      current.push(...rows)
      used += height
    })
    if (!chunks.length) chunks.push([])
    const tables = chunks.map((rows, chunkIndex) => {
      const body = [...this.buildHeaderRows(goldLabel), ...rows]
      body.forEach((row) => {
        if (row.length !== COLUMN_COUNT) {
          throw new Error(`Break Down Price: row has ${row.length} cells, expected ${COLUMN_COUNT}`)
        }
      })
      return {
        margin: [0, chunkIndex === 0 ? 10 : 0, 0, 0],
        ...(chunkIndex > 0 ? { pageBreak: 'before' } : {}),
        table: { headerRows: 3, widths: COLUMN_WIDTHS, body },
        layout: this.tableLayout()
      }
    })

    const rightStack = {
      stack: [
        { text: 'BREAK DOWN PRICE', fontSize: 16, color: PDF_COLORS.darkGray, alignment: 'center', margin: [0, 8, 0, 2] },
        ...(this.invoiceNo
          ? [{ text: `No.: ${this.invoiceNo}`, fontSize: 9, bold: true, color: PDF_COLORS.primary, alignment: 'center' }]
          : [])
      ]
    }
    const customerLeft = [
      { text: `CONSIGNED TO: ${this.customer.name || ''}`, fontSize: 11, bold: true, color: PDF_COLORS.primary },
      { text: this.customer.address || '', fontSize: 9, color: PDF_COLORS.darkGray },
      { text: `Tel: ${this.customer.tel || ''}`, fontSize: 9, color: PDF_COLORS.darkGray }
    ]
    const customerRight = [
      { text: `DATE: ${dayjs(this.invoiceDate).locale('en').format('MMMM DD, YYYY')}`, fontSize: 9, bold: true, color: PDF_COLORS.darkGray },
      {
        text: `GOLD LOCKED: ${this.goldSpotPrice ? `$${this.formatPrice(Number(this.goldSpotPrice))}/OZ` : '-'}`,
        fontSize: 9,
        bold: true,
        color: PDF_COLORS.darkGray
      },
      { text: `Currency: ${this.currencyUnit}`, fontSize: 9, bold: true, color: PDF_COLORS.darkGray }
    ]

    const header = buildDocumentHeader({
      logoBase64: this.logoBase64,
      company: this.companyInfo,
      rightStack,
      customerLeft,
      customerRight,
      ruleWidth: 822
    })

    return {
      pageOrientation: 'landscape',
      pageSize: 'A4',
      pageMargins: [10, 10, 10, 40],
      content: [
        header,
        ...tables,
        {
          margin: [0, 15, 0, 0],
          columns: [
            { text: 'ORIGIN THAILAND', style: 'parcelText', alignment: 'left', width: '70%' },
            { text: '______________________________', style: 'parcelText', alignment: 'center', width: '30%' }
          ]
        },
        {
          columns: [
            { text: '', style: 'parcelText', alignment: 'left', width: '70%' },
            { text: '(Authorized Signature and Company Stamp)', style: 'parcelText', alignment: 'center', width: '30%' }
          ]
        },
        {
          margin: [0, 10, 0, 0],
          stack: [
            { text: 'Price is F.O.B. Bangkok not inclued freight and insurance', style: 'conditionText' },
            { text: 'Production time within 5-7 weeks', style: 'conditionText' },
            { text: '50% payment of tt, 50% before the shipment.', style: 'conditionText' },
            { text: 'Gold weight, Diamond weight and Stones weight are approximately, the actual weight will be known after production is completed', style: 'conditionText' },
            { text: 'Minimun order 6 pcs per design / Minimun purchase US$ 5,000', style: 'conditionText' },
            { text: 'The price quotation is current gold price market at www.kitco.com (please confirm within 2 days)', style: 'conditionText' }
          ]
        }
      ],
      footer: function (currentPage, pageCount) {
        return { text: currentPage.toString() + ' / ' + pageCount, alignment: 'center', margin: [0, 10, 0, 0] }
      },
      defaultStyle: { font: PDF_FONT, fontSize: 6.5 },
      styles: {
        headCell: { fontSize: 6.5, bold: true, color: 'white' },
        letterCell: { fontSize: 6, bold: true, color: '#8B0000' },
        parcelText: { fontSize: 10, color: '#393939' },
        conditionText: { fontSize: 8, color: '#666666' }
      }
    }
  }

  tableLayout() {
    return {
      hLineWidth: () => 0.5,
      vLineWidth: () => 0.5,
      hLineColor: () => '#cccccc',
      vLineColor: () => '#cccccc',
      paddingLeft: () => CELL_PADDING_X,
      paddingRight: () => CELL_PADDING_X,
      paddingTop: () => 2,
      paddingBottom: () => 2,
      fillColor: (rowIndex) => (rowIndex < 2 ? '#8B0000' : rowIndex === 2 ? '#f3dede' : null)
    }
  }

  formatPrice(price) {
    const n = Number(price)
    if (!Number.isFinite(n)) return '0.00'
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  async generatePDF() {
    await this.preparePDF()
    const pdfMake = (await import('@/services/utils/pdf-make')).initPdfMake()
    return pdfMake.createPdf(this.getDocDefinition())
  }
}
