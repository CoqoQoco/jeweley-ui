import { initPdfMake } from '@/services/utils/pdf-make'
import dayjs from 'dayjs'

export class WorkerWagesSuccessPdfBuilder {
  constructor(worker, dateRange, items, mode, slip = null) {
    this.worker = worker || {}
    this.dateRange = dateRange || {}
    this.items = items || []
    this.mode = mode || 'wages'
    this.slip = slip
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
    const modeTitle = this.mode === 'goldLoss' ? 'ใบสรุปงาน Gold Loss' : 'ค่าแรงตามพนักงาน'
    const docNoText = (this.mode === 'goldLoss' && this.slip)
      ? `เลขที่: ${this.slip.documentNo || ''}`
      : ''
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
      ...(docNoText ? [{
        columns: [
          '',
          { text: docNoText, alignment: 'right', bold: true }
        ],
        fontSize: 13,
        margin: [0, 0, 0, 0]
      }] : []),
      {
        table: {
          widths: ['*'],
          body: [[{ columns: [], border: [false, false, false, true] }]]
        },
        layout: { defaultBorder: false },
        margin: [0, 0, 0, 0]
      },
      {
        columns: [this.mode === 'goldLoss' ? 'ใบสรุปงาน Gold Loss' : 'สถานะสำเร็จ'],
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
      { text: 'ราคา/หน่วย', bold: true, alignment: 'right', border: [false, true, false, true] },
      { text: 'จำนวนเงิน', bold: true, alignment: 'right', border: [false, true, false, true] }
    ]

    let totalQty = 0
    let totalWages = 0

    const dataRows = this.items.map((item) => {
      totalQty += item.goldQtyCheck || 0
      totalWages += item.totalWages || 0
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
        { text: `${item.goldQtyCheck ?? ''}`, bold: true, alignment: 'right', border: [false, false, false, false] },
        { text: item.wages ? Number(item.wages).toFixed(2) : '0.00', bold: true, alignment: 'right', border: [false, false, false, false] },
        { text: item.totalWages ? Number(item.totalWages).toFixed(2) : '0.00', bold: true, alignment: 'right', border: [false, false, false, false] }
      ]
    })

    const footerRow = [
      { text: '', bold: true, alignment: 'right', border: [false, true, false, false] },
      { text: '', bold: true, alignment: 'right', border: [false, true, false, false] },
      { text: '', bold: true, alignment: 'right', border: [false, true, false, false] },
      { text: '', bold: true, alignment: 'right', border: [false, true, false, false] },
      { text: 'รวม', bold: true, alignment: 'right', border: [false, true, false, false] },
      { text: `${totalQty}`, bold: true, alignment: 'right', border: [false, true, false, false] },
      { text: '', bold: true, alignment: 'right', border: [false, true, false, false] },
      { text: Number(totalWages).toFixed(2), bold: true, alignment: 'right', border: [false, true, false, false] }
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
        widths: [60, 60, '*', 60, '*', 50, 50, 50],
        body: this.buildWagesTableBody(),
        layout: { defaultBorder: false }
      }
    }
  }

  getSlipSummaryContent() {
    if (this.mode !== 'goldLoss' || !this.slip) return []
    return [
      {
        margin: [0, 10, 0, 0],
        table: {
          widths: ['*'],
          body: [[{ columns: [], border: [false, true, false, false] }]]
        },
        layout: { defaultBorder: false }
      },
      {
        columns: [
          { text: 'รวมน้ำหนัก loss', alignment: 'right', width: '*' },
          { text: `: ${this.fmtSign2(this.slip.totalWeightLoss)} กรัม`, width: 120, alignment: 'right' }
        ],
        fontSize: 12,
        margin: [0, 2, 0, 0]
      },
      {
        columns: [
          { text: 'รับคืนทอง (Gold Return)', alignment: 'right', width: '*' },
          { text: `: ${this.fmt2(this.slip.goldReturn)} กรัม`, width: 120, alignment: 'right' }
        ],
        fontSize: 12,
        margin: [0, 2, 0, 0]
      },
      {
        columns: [
          { text: 'น้ำหนัก loss สุทธิ', alignment: 'right', bold: true, width: '*' },
          { text: `: ${this.fmtSign2(this.slip.netWeightLoss)} กรัม`, bold: true, width: 120, alignment: 'right' }
        ],
        fontSize: 12,
        margin: [0, 2, 0, 0]
      }
    ]
  }

  getDocDefinition() {
    return {
      pageSize: 'A4',
      pageMargins: [20, 20, 20, 10],
      content: [
        ...this.getHeaderContent(),
        this.getTableContent(),
        ...this.getSlipSummaryContent()
      ],
      defaultStyle: {
        font: 'THSarabunNew',
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
