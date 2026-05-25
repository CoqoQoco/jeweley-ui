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
        { text: `${item.wo || ''}${item.woNumber ? ' - ' + item.woNumber : ''}`, bold: true, border: [false, false, false, false] },
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
      { text: 'ราคา/กรัม', style: 'tableHeader', alignment: 'right' },
      { text: 'จำนวนเงิน', style: 'tableHeader', alignment: 'right' }
    ]

    let totalWeightLoss = 0
    let totalMoneyDiff = 0

    const dataRows = this.items.map((item) => {
      const lossPercent = item.lossPercent ?? 0
      const weightLossAllowed = item.weightLossAllowed ?? ((item.goldWeightCheck ?? 0) * lossPercent / 100)
      const weightLossActual = item.weightLossActual ?? 0
      const moneyDiff = item.moneyDiff ?? 0

      totalWeightLoss += weightLossActual
      totalMoneyDiff += moneyDiff

      return [
        { text: this.formatDate(item.jobDate) },
        { text: `${item.wo || ''}${item.woNumber ? ' - ' + item.woNumber : ''}` },
        { text: `${item.productNumber || ''}` },
        { text: `${item.statusName || ''}` },
        { text: `${item.gold || ''}${item.goldSize ? ` - ${item.goldSize}` : ''} ${item.description ? `[${item.description}]` : ''}` },
        { text: `${item.goldQtyCheck ?? ''}`, alignment: 'right' },
        { text: this.fmt2(lossPercent), alignment: 'right' },
        { text: this.fmt2(weightLossAllowed), alignment: 'right' },
        { text: this.fmtSign2(weightLossActual), alignment: 'right' },
        { text: this.fmt2(item.goldLossPrice ?? item.pricePerGram ?? item.wages ?? 0), alignment: 'right' },
        { text: this.fmt2(moneyDiff), alignment: 'right' }
      ]
    })

    const footerRow = [
      { text: 'รวมน้ำหนัก loss', bold: true, colSpan: 9, alignment: 'right' },
      {}, {}, {}, {}, {}, {}, {}, {},
      { text: this.fmtSign2(totalWeightLoss), bold: true, alignment: 'right' },
      { text: this.fmt2(totalMoneyDiff), bold: true, alignment: 'right' }
    ]

    return [headerRow, ...dataRows, footerRow]
  }

  buildGoldReturnTableContent() {
    const returnItems = (this.slip && this.slip.goldReturnItems) ? this.slip.goldReturnItems : []
    if (returnItems.length === 0) return null

    const headerRow = [
      { text: 'Gold Size', style: 'tableHeader' },
      { text: 'น้ำหนัก (g)', style: 'tableHeader', alignment: 'right' },
      { text: 'ราคา/กรัม', style: 'tableHeader', alignment: 'right' },
      { text: 'จำนวนเงิน', style: 'tableHeader', alignment: 'right' }
    ]

    let totalWeight = 0
    let totalAmount = 0

    const dataRows = returnItems.map((r) => {
      const amount = r.amount ?? ((r.weight || 0) * (r.pricePerGram || 0))
      totalWeight += r.weight || 0
      totalAmount += amount
      return [
        { text: r.goldSize || '' },
        { text: this.fmt2(r.weight), alignment: 'right' },
        { text: this.fmt2(r.pricePerGram), alignment: 'right' },
        { text: this.fmt2(amount), alignment: 'right' }
      ]
    })

    const footerRow = [
      { text: 'รวม', bold: true, alignment: 'right' },
      { text: this.fmt2(totalWeight), bold: true, alignment: 'right' },
      { text: '', bold: true },
      { text: this.fmt2(totalAmount), bold: true, alignment: 'right' }
    ]

    return {
      margin: [0, 8, 0, 0],
      stack: [
        { text: 'รับคืนทอง', bold: true, fontSize: 12, margin: [0, 0, 0, 4] },
        {
          fontSize: 11,
          table: {
            headerRows: 1,
            widths: ['*', 70, 80, 80],
            body: [headerRow, ...dataRows, footerRow]
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#cccccc',
            vLineColor: () => '#cccccc',
            fillColor: (rowIndex) => rowIndex === 0 ? '#921313' : null
          }
        }
      ]
    }
  }

  getTableContent() {
    if (this.mode === 'goldLoss') {
      return {
        fontSize: 10,
        margin: [0, 0, 0, 0],
        table: {
          headerRows: 1,
          widths: [46, 52, '*', 36, '*', 28, 26, 50, 40, 46, 48],
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

    const returnItems = this.slip.goldReturnItems || []
    const totalGoldReturnAmount = returnItems.reduce((sum, r) => sum + (r.amount ?? ((r.weight || 0) * (r.pricePerGram || 0))), 0)
    const totalReturnWeight = returnItems.reduce((sum, r) => sum + (r.weight || 0), 0)
    const totalMoneyLoss = this.slip.totalLossAmount != null
      ? this.slip.totalLossAmount
      : (this.items || []).reduce((sum, i) => sum + (i.moneyDiff || 0), 0)
    const netPayAmount = this.slip.netPayAmount != null
      ? this.slip.netPayAmount
      : totalMoneyLoss + totalGoldReturnAmount
    const netWeightLoss = (this.slip.totalWeightLoss || 0) + totalReturnWeight

    const returnTableContent = this.buildGoldReturnTableContent()

    const result = [
      {
        margin: [0, 10, 0, 0],
        table: {
          widths: ['*'],
          body: [[{ columns: [], border: [false, true, false, false] }]]
        },
        layout: { defaultBorder: false }
      }
    ]

    if (returnTableContent) {
      result.push(returnTableContent)
      result.push({
        margin: [0, 6, 0, 0],
        table: {
          widths: ['*'],
          body: [[{ columns: [], border: [false, true, false, false] }]]
        },
        layout: { defaultBorder: false }
      })
    }

    result.push(
      {
        columns: [
          { text: 'รวมเงิน loss', alignment: 'right', width: '*' },
          { text: `: ${this.fmt2(totalMoneyLoss)} บาท`, width: 140, alignment: 'right' }
        ],
        fontSize: 12,
        margin: [0, 2, 0, 0]
      },
      {
        columns: [
          { text: '(+) รับคืนทอง (เงิน)', alignment: 'right', width: '*' },
          { text: `: + ${this.fmt2(totalGoldReturnAmount)} บาท`, width: 140, alignment: 'right' }
        ],
        fontSize: 12,
        margin: [0, 2, 0, 0]
      },
      {
        columns: [
          { text: 'ยอดสุทธิจ่ายช่าง', alignment: 'right', bold: true, width: '*' },
          { text: `: ${this.fmtSign2(netPayAmount)} บาท`, bold: true, color: netPayAmount < 0 ? '#ff4d4d' : '#038387', width: 140, alignment: 'right' }
        ],
        fontSize: 13,
        margin: [0, 2, 0, 4]
      },
      {
        columns: [
          { text: 'น้ำหนัก loss สุทธิ', alignment: 'right', bold: true, width: '*' },
          { text: `: ${this.fmtSign2(netWeightLoss)} กรัม`, bold: true, width: 140, alignment: 'right' }
        ],
        fontSize: 12,
        margin: [0, 2, 0, 0]
      }
    )

    return result
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
