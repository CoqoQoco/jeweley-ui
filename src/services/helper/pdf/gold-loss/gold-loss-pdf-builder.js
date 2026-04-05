import { initPdfMake } from '@/services/utils/pdf-make'
import dayjs from 'dayjs'

export class GoldLossPdfBuilder {
  constructor(header, items) {
    this.header = header  // { documentNo, startDate, endDate, createBy, createDate, remark }
    this.items = items || []
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
    const sign = val >= 0 ? '+' : '-'
    return `${sign}${Math.abs(val).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
  }

  getHeaderContent() {
    return {
      columns: [
        {
          text: 'บริษัท ดวงแก้ว จิวเวลรี่ จำกัด',
          style: 'companyName',
          width: '*'
        },
        {
          text: 'ใบงาน Gold Loss แต่ง',
          style: 'documentTitle',
          width: 'auto',
          alignment: 'right'
        }
      ],
      margin: [0, 0, 0, 5]
    }
  }

  getInfoContent() {
    return {
      columns: [
        {
          text: [
            { text: 'เลขที่ใบงาน: ', bold: true },
            { text: this.header.documentNo || '-' }
          ],
          width: '*'
        },
        {
          text: [
            { text: 'วันที่: ', bold: true },
            { text: `${this.formatDate(this.header.startDate)} - ${this.formatDate(this.header.endDate)}` }
          ],
          width: 'auto'
        }
      ],
      margin: [0, 0, 0, 2]
    }
  }

  getCreatorInfo() {
    return {
      columns: [
        {
          text: [
            { text: 'ผู้สร้าง: ', bold: true },
            { text: this.header.createBy || '-' }
          ],
          width: '*'
        },
        {
          text: [
            { text: 'วันที่สร้าง: ', bold: true },
            { text: this.formatDate(this.header.createDate) }
          ],
          width: 'auto'
        }
      ],
      margin: [0, 0, 0, 8]
    }
  }

  getTableContent() {
    const headerRow = [
      { text: '#', style: 'tableHeader', alignment: 'center' },
      { text: 'WO', style: 'tableHeader' },
      { text: 'ช่าง', style: 'tableHeader' },
      { text: 'ทอง', style: 'tableHeader' },
      { text: 'วันที่', style: 'tableHeader' },
      { text: 'จ่าย [ชิ้น]', style: 'tableHeader', alignment: 'right' },
      { text: 'น.น.จ่าย', style: 'tableHeader', alignment: 'right' },
      { text: 'แต่ง [ชิ้น]', style: 'tableHeader', alignment: 'right' },
      { text: 'น.น.รับ', style: 'tableHeader', alignment: 'right' },
      { text: 'ขาด/เกิน', style: 'tableHeader', alignment: 'right' },
      { text: '%loss', style: 'tableHeader', alignment: 'center' },
      { text: 'ราคาทอง', style: 'tableHeader', alignment: 'right' },
      { text: 'น.น.loss ได้', style: 'tableHeader', alignment: 'right' },
      { text: 'น.น.loss', style: 'tableHeader', alignment: 'right' },
      { text: 'เงิน ได้/ขาด', style: 'tableHeader', alignment: 'right' },
      { text: 'หมายเหตุ', style: 'tableHeader' }
    ]

    const bodyRows = this.items.map((item, idx) => {
      const send = item.goldWeightSend ?? 0
      const check = item.goldWeightCheck ?? 0
      const weightDiff = send - check
      const lossPercent = item.lossPercent ?? 0
      const goldLossPrice = item.goldLossPrice ?? 0
      const weightLossAllowed = send * (lossPercent / 100)
      const weightLossActual = weightLossAllowed - weightDiff
      const moneyDiff = weightLossActual * goldLossPrice

      return [
        { text: idx + 1, alignment: 'center' },
        { text: `${item.wo || ''}-${item.woNumber || ''}` },
        { text: `${item.workerCode || ''} - ${item.workerName || ''}`, fontSize: 8 },
        { text: `${item.goldType || ''}\n${item.goldTypeName || ''}`, fontSize: 8 },
        { text: this.formatDate(item.requestDate) },
        { text: this.fmt2(item.goldQtySend), alignment: 'right' },
        { text: this.fmt2(item.goldWeightSend), alignment: 'right' },
        { text: this.fmt2(item.goldQtyCheck), alignment: 'right' },
        { text: this.fmt2(item.goldWeightCheck), alignment: 'right' },
        { text: this.fmtSign2(weightDiff * -1), alignment: 'right' },
        { text: this.fmt2(lossPercent), alignment: 'center' },
        { text: this.fmt2(goldLossPrice), alignment: 'right' },
        { text: this.fmt2(weightLossAllowed), alignment: 'right' },
        { text: this.fmtSign2(weightLossActual), alignment: 'right' },
        { text: this.fmtSign2(moneyDiff), alignment: 'right' },
        { text: item.lossRemark || '-', fontSize: 8 }
      ]
    })

    return {
      table: {
        headerRows: 1,
        widths: [20, 55, 60, 50, 45, 40, 42, 40, 42, 45, 30, 42, 42, 42, 50, '*'],
        body: [headerRow, ...bodyRows]
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => '#cccccc',
        vLineColor: () => '#cccccc',
        fillColor: (rowIndex) => rowIndex === 0 ? '#921313' : null,
        paddingLeft: () => 3,
        paddingRight: () => 3,
        paddingTop: () => 2,
        paddingBottom: () => 2
      },
      margin: [0, 0, 0, 8]
    }
  }

  getSummaryContent() {
    let totalMoneyDiff = 0
    this.items.forEach(item => {
      const send = item.goldWeightSend ?? 0
      const check = item.goldWeightCheck ?? 0
      const weightDiff = send - check
      const lossPercent = item.lossPercent ?? 0
      const goldLossPrice = item.goldLossPrice ?? 0
      const weightLossAllowed = send * (lossPercent / 100)
      const weightLossActual = weightLossAllowed - weightDiff
      totalMoneyDiff += weightLossActual * goldLossPrice
    })

    return {
      columns: [
        { text: `จำนวน ${this.items.length} รายการ`, bold: true, width: '*' },
        {
          text: [
            { text: 'รวมเงิน ได้/ขาด: ', bold: true },
            { text: this.fmtSign2(totalMoneyDiff), bold: true }
          ],
          width: 'auto',
          alignment: 'right'
        }
      ]
    }
  }

  getDocDefinition() {
    return {
      pageSize: 'A4',
      pageOrientation: 'landscape',
      pageMargins: [15, 15, 15, 15],
      content: [
        this.getHeaderContent(),
        this.getInfoContent(),
        this.getCreatorInfo(),
        this.getTableContent(),
        this.getSummaryContent()
      ],
      styles: {
        companyName: { fontSize: 14, bold: true },
        documentTitle: { fontSize: 14, bold: true },
        tableHeader: { color: '#ffffff', bold: true, fontSize: 9 }
      },
      defaultStyle: {
        font: 'THSarabunNew',
        fontSize: 9
      }
    }
  }

  generatePDF() {
    const pdfMake = initPdfMake()
    return pdfMake.createPdf(this.getDocDefinition())
  }
}
