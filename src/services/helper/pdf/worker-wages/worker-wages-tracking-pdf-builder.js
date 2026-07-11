import { initPdfMake } from '@/services/utils/pdf-make'
import dayjs from 'dayjs'
import { PDF_FONT } from '@/services/helper/pdf/shared/pdf-theme.js'

export class WorkerWagesTrackingPdfBuilder {
  constructor(worker, dateRange, items, mode) {
    this.worker = worker || {}
    this.dateRange = dateRange || {}
    this.items = items || []
    this.mode = mode || 'wages'
  }

  formatDate(val) {
    if (!val) return ''
    return dayjs(val).format('DD/MM/YYYY')
  }

  fmt2(val) {
    if (val == null) return '0.00'
    return Number(val).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  fmtSign2(val) {
    if (val == null) return '0.00'
    const sign = val >= 0 ? '+' : ''
    return `${sign}${Number(val).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
  }

  getHeaderContent() {
    const modeTitle = this.mode === 'goldLoss' ? 'ติดตามงาน Gold Loss' : 'ติดตามสถานะงาน'
    return [
      {
        columns: [
          'บริษัท ดวงแก้ว จิวเวลรี่ แมนูแฟคเจอเรอร์ จำกัด',
          { text: modeTitle, alignment: 'right' }
        ],
        bold: true,
        fontSize: 15,
        margin: [0, 0, 0, 0]
      },
      {
        columns: [
          `พนักงาน: ${this.worker.code || ''} - ${this.worker.nameTh || ''}`,
          {
            text: `วันที่: ${this.formatDate(this.dateRange.requestDateStart)} - ${this.formatDate(this.dateRange.requestDateEnd)}`,
            alignment: 'right'
          }
        ],
        fontSize: 14,
        margin: [0, 0, 0, 0]
      },
      {
        table: {
          widths: ['*'],
          body: [[{ columns: [], border: [false, false, false, true] }]]
        },
        layout: { defaultBorder: false },
        margin: [0, 0, 0, 0]
      },
      {
        columns: [this.mode === 'goldLoss' ? 'ใบสรุปติดตามงาน Gold Loss' : 'ติดตามสถานะงาน'],
        fontSize: 15,
        margin: [0, 15, 0, 0]
      }
    ]
  }

  buildWagesTableBody() {
    const headerRow = [
      { text: 'วันที่', bold: true, border: [false, true, false, true] },
      { text: 'เลขที่ใบงาน', bold: true, border: [false, true, false, true] },
      { text: 'รหัสสินค้า', bold: true, border: [false, true, false, true] },
      { text: 'แผนก', bold: true, border: [false, true, false, true] },
      { text: 'รายละเอียด', bold: true, border: [false, true, false, true] },
      { text: 'จำนวน', bold: true, alignment: 'right', border: [false, true, false, true] },
      { text: 'น้ำหนักจ่าย', bold: true, alignment: 'right', border: [false, true, false, true] }
    ]

    const filtered = this.items.filter((x) => x.status === x.statusActive)

    let totalQty = 0
    let totalWeight = 0

    const dataRows = filtered.map((item) => {
      const qty = item.status === 70 ? (item.goldQtyCheck || 0) : (item.goldQtySend || 0)
      const weight = item.status === 70 ? (item.goldWeightCheck || 0) : (item.goldWeightSend || 0)
      totalQty += qty
      totalWeight += weight
      return [
        { text: this.formatDate(item.jobDate), bold: true, border: [false, false, false, false] },
        { text: `${item.wo}-${item.woNumber}`, bold: true, border: [false, false, false, false] },
        { text: `${item.productNumber || ''}`, bold: true, border: [false, false, false, false] },
        { text: `${item.statusName || ''}`, bold: true, border: [false, false, false, false] },
        {
          text: `${item.gold || ''}${item.goldSize ? ` - ${item.goldSize}` : ''} ${item.description ? `[${item.description}]` : ''}`,
          bold: true,
          border: [false, false, false, false]
        },
        { text: `${item.status === 70 ? item.goldQtyCheck : item.goldQtySend ?? ''}`, bold: true, alignment: 'right', border: [false, false, false, false] },
        { text: `${item.status === 70 ? item.goldWeightCheck : item.goldWeightSend ?? ''}`, bold: true, alignment: 'right', border: [false, false, false, false] }
      ]
    })

    const footerRow = [
      { text: '', bold: true, alignment: 'right', border: [false, true, false, false] },
      { text: '', bold: true, alignment: 'right', border: [false, true, false, false] },
      { text: '', bold: true, alignment: 'right', border: [false, true, false, false] },
      { text: '', bold: true, alignment: 'right', border: [false, true, false, false] },
      { text: 'รวม', bold: true, alignment: 'right', border: [false, true, false, false] },
      { text: `${totalQty}`, bold: true, alignment: 'right', border: [false, true, false, false] },
      { text: `${totalWeight}`, bold: true, alignment: 'right', border: [false, true, false, false] }
    ]

    return [headerRow, ...dataRows, footerRow]
  }

  buildGoldLossTableBody() {
    const headerRow = [
      { text: 'วันที่', style: 'tableHeader' },
      { text: 'เลขที่ใบงาน', style: 'tableHeader' },
      { text: 'รหัสสินค้า', style: 'tableHeader' },
      { text: 'แผนก', style: 'tableHeader' },
      { text: 'รายละเอียด', style: 'tableHeader' },
      { text: 'จำนวน', style: 'tableHeader', alignment: 'right' },
      { text: '%loss', style: 'tableHeader', alignment: 'right' },
      { text: 'น้ำหนักที่ loss ได้', style: 'tableHeader', alignment: 'right' },
      { text: 'น้ำหนัก loss', style: 'tableHeader', alignment: 'right' },
      { text: 'จำนวนเงิน', style: 'tableHeader', alignment: 'right' }
    ]

    let totalWeightLoss = 0
    let totalMoneyDiff = 0

    const dataRows = this.items.map((item) => {
      const send = item.goldWeightSend ?? 0
      const check = item.goldWeightCheck ?? 0
      const lossPercent = item.lossPercent ?? 0
      const weightLossAllowed = send * lossPercent / 100
      const weightLossActual = weightLossAllowed - (send - check)
      const moneyDiff = item.totalWages ?? 0

      totalWeightLoss += weightLossActual
      totalMoneyDiff += moneyDiff

      return [
        { text: this.formatDate(item.jobDate) },
        { text: `${item.wo}-${item.woNumber}` },
        { text: `${item.productNumber || ''}` },
        { text: `${item.statusName || ''}` },
        { text: `${item.gold || ''}${item.goldSize ? ` - ${item.goldSize}` : ''} ${item.description ? `[${item.description}]` : ''}` },
        { text: `${item.goldQtyCheck ?? ''}`, alignment: 'right' },
        { text: this.fmt2(lossPercent), alignment: 'right' },
        { text: this.fmt2(weightLossAllowed), alignment: 'right' },
        { text: this.fmtSign2(weightLossActual), alignment: 'right' },
        { text: this.fmt2(moneyDiff), alignment: 'right' }
      ]
    })

    const footerRow = [
      { text: 'รวมน้ำหนัก loss', bold: true, colSpan: 8, alignment: 'right' },
      {}, {}, {}, {}, {}, {}, {},
      { text: this.fmtSign2(totalWeightLoss), bold: true, alignment: 'right' },
      { text: this.fmt2(totalMoneyDiff), bold: true, alignment: 'right' }
    ]

    return [headerRow, ...dataRows, footerRow]
  }

  getTableContent() {
    if (this.mode === 'goldLoss') {
      return {
        fontSize: 11,
        margin: [0, 0, 0, 0],
        table: {
          headerRows: 1,
          widths: [50, 55, '*', 40, '*', 35, 30, 55, 45, 55],
          body: this.buildGoldLossTableBody()
        },
        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => '#cccccc',
          vLineColor: () => '#cccccc',
          fillColor: (rowIndex) => rowIndex === 0 ? '#921313' : null
        }
      }
    }

    return {
      fontSize: 11,
      margin: [0, 0, 0, 0],
      table: {
        headerRows: 1,
        widths: [60, 60, '*', 60, '*', 50, 50],
        body: this.buildWagesTableBody(),
        layout: { defaultBorder: false }
      }
    }
  }

  getDocDefinition() {
    return {
      pageSize: 'A4',
      pageMargins: [20, 20, 20, 10],
      content: [
        ...this.getHeaderContent(),
        this.getTableContent()
      ],
      defaultStyle: {
        font: PDF_FONT,
        fontSize: 10
      },
      styles: {
        tableHeader: { color: '#ffffff', bold: true, fontSize: 10 }
      }
    }
  }

  generatePDF() {
    const pdfMake = initPdfMake()
    return pdfMake.createPdf(this.getDocDefinition())
  }
}
