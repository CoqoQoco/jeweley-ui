import { initPdfMake } from '@/services/utils/pdf-make'
import dayjs from 'dayjs'
import { PDF_FONT } from '@/services/helper/pdf/shared/pdf-theme.js'

export class GoldLossTangMonthlyPdfBuilder {
  constructor(report) {
    this.report = report || {}
  }

  formatDate(val) {
    if (!val) return ''
    return dayjs(val).format('DD/MM/YYYY')
  }

  formatDateRangeCell(start, end) {
    const s = this.formatDate(start)
    const e = this.formatDate(end)
    if (!s || !e) return s || e || ''
    return s === e ? s : `${s} - ${e}`
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

  sectionTitle(text) {
    return { text, bold: true, fontSize: 10, margin: [0, 12, 0, 4] }
  }

  getHeaderContent() {
    const r = this.report
    return [
      {
        columns: [
          'บริษัท ดวงแก้ว จิวเวลรี่ แมนูแฟคเจอเรอร์ จำกัด',
          { text: 'ใบสรุป Gold Loss ช่างแต่ง (รายเดือน)', alignment: 'right' }
        ],
        bold: true,
        fontSize: 12,
        margin: [0, 0, 0, 0]
      },
      {
        columns: [
          `พนักงาน: ${r.workerCode || ''} - ${r.workerName || ''}`,
          {
            text: `วันที่: ${this.formatDate(r.requestDateStart)} - ${this.formatDate(r.requestDateEnd)}`,
            alignment: 'right'
          }
        ],
        fontSize: 10,
        margin: [0, 0, 0, 0]
      },
      {
        columns: [
          '',
          { text: `จำนวนใบ: ${r.slipCount ?? 0}`, alignment: 'right' }
        ],
        fontSize: 10,
        margin: [0, 0, 0, 0]
      },
      {
        table: {
          widths: ['*'],
          body: [[{ columns: [], border: [false, false, false, true] }]]
        },
        layout: { defaultBorder: false },
        margin: [0, 4, 0, 0]
      }
    ]
  }

  getFlatItems() {
    const slips = this.report.slips || []
    const flat = []
    slips.forEach((slip) => {
      (slip.items || []).forEach((item) => {
        flat.push({
          ...item,
          documentNo: slip.documentNo,
          lossPercent: slip.lossPercent,
          pricePerGram: slip.pricePerGram,
          displayDate: item.jobDate || slip.requestDateStart || null
        })
      })
    })
    flat.sort((a, b) => new Date(a.displayDate || 0) - new Date(b.displayDate || 0))
    return flat
  }

  buildItemsTableBody() {
    const headerRow = [
      { text: 'วันที่', style: 'tableHeader' },
      { text: 'เลขที่ใบ GLT', style: 'tableHeader' },
      { text: 'เลขที่ใบงาน', style: 'tableHeader' },
      { text: 'รหัสสินค้า', style: 'tableHeader' },
      { text: 'ทอง', style: 'tableHeader' },
      { text: 'จำนวน', style: 'tableHeader', alignment: 'right' },
      { text: '%loss', style: 'tableHeader', alignment: 'right' },
      { text: 'นน.จ่าย', style: 'tableHeader', alignment: 'right' },
      { text: 'นน.รับ', style: 'tableHeader', alignment: 'right' },
      { text: 'นน.ที่ loss ได้', style: 'tableHeader', alignment: 'right' },
      { text: 'ราคา/กรัม', style: 'tableHeader', alignment: 'right' }
    ]

    let totalSend = 0
    let totalCheck = 0
    let totalLossAllowed = 0

    const dataRows = this.getFlatItems().map((item) => {
      totalSend += Number(item.goldWeightSend || 0)
      totalCheck += Number(item.goldWeightCheck || 0)
      totalLossAllowed += Number(item.weightLossAllowed || 0)
      return [
        { text: item.displayDate ? this.formatDate(item.displayDate) : '-' },
        { text: item.documentNo || '' },
        { text: `${item.wo || ''}${item.woNumber ? ' - ' + item.woNumber : ''}` },
        { text: item.productNumber || '' },
        { text: [item.gold, item.goldSize].filter(Boolean).join(' - ') || '-' },
        { text: `${item.goldQtyCheck ?? ''}`, alignment: 'right' },
        { text: this.fmt2(item.lossPercent), alignment: 'right' },
        { text: this.fmt2(item.goldWeightSend), alignment: 'right' },
        { text: this.fmt2(item.goldWeightCheck), alignment: 'right' },
        { text: this.fmt2(item.weightLossAllowed), alignment: 'right' },
        { text: this.fmt2(item.pricePerGram), alignment: 'right' }
      ]
    })

    const footerRow = [
      { text: 'รวม', bold: true, colSpan: 7, alignment: 'right' },
      {}, {}, {}, {}, {}, {},
      { text: this.fmt2(totalSend), bold: true, alignment: 'right' },
      { text: this.fmt2(totalCheck), bold: true, alignment: 'right' },
      { text: this.fmt2(totalLossAllowed), bold: true, alignment: 'right' },
      { text: '', bold: true }
    ]

    return [headerRow, ...dataRows, footerRow]
  }

  getItemsTableContent() {
    return {
      fontSize: 8.5,
      margin: [0, 0, 0, 0],
      table: {
        headerRows: 1,
        widths: [54, 72, 60, '*', 40, 32, 26, 38, 38, 44, 42],
        body: this.buildItemsTableBody()
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => '#cccccc',
        vLineColor: () => '#cccccc',
        fillColor: (rowIndex) => rowIndex === 0 ? '#921313' : null,
        paddingLeft: () => 2,
        paddingRight: () => 2
      }
    }
  }

  getFlatExtras() {
    const slips = this.report.slips || []
    const flat = []
    slips.forEach((slip) => {
      (slip.extras || []).forEach((extra) => {
        flat.push({ ...extra, documentNo: slip.documentNo, goldSize: slip.goldSize })
      })
    })
    return flat
  }

  buildExtrasSection() {
    const extras = this.getFlatExtras()
    if (extras.length === 0) return null

    const headerRow = [
      { text: 'เลขที่ใบ GLT', style: 'tableHeader' },
      { text: 'ประเภท', style: 'tableHeader' },
      { text: 'รายการ', style: 'tableHeader' },
      { text: 'ทอง', style: 'tableHeader' },
      { text: 'น้ำหนัก (g)', style: 'tableHeader', alignment: 'right' }
    ]

    let totalIssued = 0
    let totalReturned = 0

    const dataRows = extras.map((extra) => {
      const isCounted = extra.countInCalc !== false
      const kindLabel = extra.kind === 1 ? 'เบิก' : extra.kind === 2 ? 'คืน' : ''
      if (isCounted) {
        if (extra.kind === 1) totalIssued += Number(extra.weight || 0)
        if (extra.kind === 2) totalReturned += Number(extra.weight || 0)
      }
      const name = (extra.name || '') + (isCounted ? '' : ' (ไม่นำมาคิด)')
      return [
        { text: extra.documentNo || '' },
        { text: kindLabel },
        { text: name },
        { text: extra.goldSize || '' },
        { text: this.fmt2(extra.weight), alignment: 'right' }
      ]
    })

    const footerRow1 = [
      { text: 'รวมเบิก', bold: true, colSpan: 4, alignment: 'right' }, {}, {}, {},
      { text: this.fmt2(totalIssued), bold: true, alignment: 'right' }
    ]
    const footerRow2 = [
      { text: 'รวมคืน', bold: true, colSpan: 4, alignment: 'right' }, {}, {}, {},
      { text: this.fmt2(totalReturned), bold: true, alignment: 'right' }
    ]

    return {
      stack: [
        this.sectionTitle('[2] เบิก/คืนทองเพิ่ม'),
        {
          fontSize: 8.5,
          table: {
            headerRows: 1,
            widths: [72, 40, '*', 45, 55],
            body: [headerRow, ...dataRows, footerRow1, footerRow2]
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#cccccc',
            vLineColor: () => '#cccccc',
            fillColor: (rowIndex) => rowIndex === 0 ? '#921313' : null,
            paddingLeft: () => 2,
            paddingRight: () => 2
          }
        }
      ]
    }
  }

  buildSlipSummaryTableBody() {
    const slips = this.report.slips || []
    const headerRow = [
      { text: 'เลขที่ใบ', style: 'tableHeader' },
      { text: 'ช่วงวันที่', style: 'tableHeader' },
      { text: 'ทอง', style: 'tableHeader' },
      { text: '%loss', style: 'tableHeader', alignment: 'right' },
      { text: 'ราคา/กรัม', style: 'tableHeader', alignment: 'right' },
      { text: 'รวมเบิก', style: 'tableHeader', alignment: 'right' },
      { text: 'รวมคืน', style: 'tableHeader', alignment: 'right' },
      { text: 'loss ดิบ', style: 'tableHeader', alignment: 'right' },
      { text: 'loss ที่ได้', style: 'tableHeader', alignment: 'right' },
      { text: 'ส่วนต่าง', style: 'tableHeader', alignment: 'right' },
      { text: 'จำนวนเงิน', style: 'tableHeader', alignment: 'right' }
    ]

    let totalIssued = 0
    let totalReturned = 0
    let totalRawLoss = 0
    let totalAllowedLoss = 0
    let totalDiffLoss = 0
    let totalMoney = 0

    const dataRows = slips.map((slip) => {
      totalIssued += Number(slip.issuedTotal || 0)
      totalReturned += Number(slip.returnedTotal || 0)
      totalRawLoss += Number(slip.rawLoss || 0)
      totalAllowedLoss += Number(slip.allowedLoss || 0)
      totalDiffLoss += Number(slip.diffLoss || 0)
      totalMoney += Number(slip.totalMoneyDiff || 0)
      return [
        { text: slip.documentNo || '' },
        { text: this.formatDateRangeCell(slip.requestDateStart, slip.requestDateEnd), fontSize: 7.5 },
        { text: slip.goldSize || '' },
        { text: this.fmt2(slip.lossPercent), alignment: 'right' },
        { text: this.fmt2(slip.pricePerGram), alignment: 'right' },
        { text: this.fmt2(slip.issuedTotal), alignment: 'right' },
        { text: this.fmt2(slip.returnedTotal), alignment: 'right' },
        { text: this.fmt2(slip.rawLoss), alignment: 'right' },
        { text: this.fmt2(slip.allowedLoss), alignment: 'right' },
        { text: this.fmtSign2(slip.diffLoss), alignment: 'right' },
        { text: this.fmt2(slip.totalMoneyDiff), alignment: 'right' }
      ]
    })

    const footerRow = [
      { text: 'รวม', bold: true, colSpan: 5, alignment: 'right' },
      {}, {}, {}, {},
      { text: this.fmt2(totalIssued), bold: true, alignment: 'right' },
      { text: this.fmt2(totalReturned), bold: true, alignment: 'right' },
      { text: this.fmt2(totalRawLoss), bold: true, alignment: 'right' },
      { text: this.fmt2(totalAllowedLoss), bold: true, alignment: 'right' },
      { text: this.fmtSign2(totalDiffLoss), bold: true, alignment: 'right' },
      { text: this.fmt2(totalMoney), bold: true, alignment: 'right' }
    ]

    return [headerRow, ...dataRows, footerRow]
  }

  getSlipSummaryTableContent() {
    return {
      fontSize: 8.5,
      margin: [0, 0, 0, 0],
      table: {
        headerRows: 1,
        widths: ['*', 50, 34, 26, 42, 42, 42, 38, 38, 38, 52],
        body: this.buildSlipSummaryTableBody()
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => '#cccccc',
        vLineColor: () => '#cccccc',
        fillColor: (rowIndex) => rowIndex === 0 ? '#921313' : null,
        paddingLeft: () => 2,
        paddingRight: () => 2
      }
    }
  }

  buildGoldTypeSummaryTableBody() {
    const rows = this.report.goldTypeSummaries || []
    const headerRow = [
      { text: 'ประเภททอง', style: 'tableHeader' },
      { text: 'รวมเบิก (g)', style: 'tableHeader', alignment: 'right' },
      { text: 'รวมคืน (g)', style: 'tableHeader', alignment: 'right' },
      { text: 'loss ดิบ (g)', style: 'tableHeader', alignment: 'right' },
      { text: 'loss ที่ได้ (g)', style: 'tableHeader', alignment: 'right' },
      { text: 'ส่วนต่าง (g)', style: 'tableHeader', alignment: 'right' },
      { text: 'จำนวนเงิน', style: 'tableHeader', alignment: 'right' }
    ]

    let totalIssued = 0
    let totalReturned = 0
    let totalRawLoss = 0
    let totalAllowedLoss = 0
    let totalDiffLoss = 0
    let totalMoney = 0

    const dataRows = rows.map((row) => {
      totalIssued += Number(row.issuedTotal || 0)
      totalReturned += Number(row.returnedTotal || 0)
      totalRawLoss += Number(row.rawLoss || 0)
      totalAllowedLoss += Number(row.allowedLoss || 0)
      totalDiffLoss += Number(row.diffLoss || 0)
      totalMoney += Number(row.totalMoneyDiff || 0)
      return [
        { text: row.goldSize || '' },
        { text: this.fmt2(row.issuedTotal), alignment: 'right' },
        { text: this.fmt2(row.returnedTotal), alignment: 'right' },
        { text: this.fmt2(row.rawLoss), alignment: 'right' },
        { text: this.fmt2(row.allowedLoss), alignment: 'right' },
        { text: this.fmtSign2(row.diffLoss), alignment: 'right' },
        { text: this.fmt2(row.totalMoneyDiff), alignment: 'right' }
      ]
    })

    const footerRow = [
      { text: 'รวม', bold: true, alignment: 'right' },
      { text: this.fmt2(totalIssued), bold: true, alignment: 'right' },
      { text: this.fmt2(totalReturned), bold: true, alignment: 'right' },
      { text: this.fmt2(totalRawLoss), bold: true, alignment: 'right' },
      { text: this.fmt2(totalAllowedLoss), bold: true, alignment: 'right' },
      { text: this.fmtSign2(totalDiffLoss), bold: true, alignment: 'right' },
      { text: this.fmt2(totalMoney), bold: true, alignment: 'right' }
    ]

    return [headerRow, ...dataRows, footerRow]
  }

  getGoldTypeSummaryTableContent() {
    return {
      fontSize: 8.5,
      margin: [0, 0, 0, 0],
      table: {
        headerRows: 1,
        widths: ['*', 60, 60, 55, 55, 55, 65],
        body: this.buildGoldTypeSummaryTableBody()
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => '#cccccc',
        vLineColor: () => '#cccccc',
        fillColor: (rowIndex) => rowIndex === 0 ? '#921313' : null,
        paddingLeft: () => 2,
        paddingRight: () => 2
      }
    }
  }

  getFooterContent() {
    const r = this.report
    const netPay = r.netPayAmount ?? 0

    return [
      {
        table: {
          widths: ['*'],
          body: [[{ columns: [], border: [false, true, false, false] }]]
        },
        layout: { defaultBorder: false },
        margin: [0, 10, 0, 0]
      },
      {
        columns: [
          { text: 'รวมส่วนต่างน้ำหนัก', alignment: 'right', width: '*' },
          { text: `: ${this.fmtSign2(r.totalDiffLoss)} กรัม`, width: 140, alignment: 'right' }
        ],
        fontSize: 10,
        margin: [0, 6, 0, 0]
      },
      {
        columns: [
          { text: 'ยอดสุทธิจ่ายช่าง', alignment: 'right', bold: true, width: '*' },
          {
            text: `: ${this.fmtSign2(netPay)} บาท`,
            bold: true,
            color: netPay < 0 ? '#ff4d4d' : '#038387',
            width: 140,
            alignment: 'right'
          }
        ],
        fontSize: 11,
        margin: [0, 4, 0, 0]
      }
    ]
  }

  getDocDefinition() {
    const extrasSection = this.buildExtrasSection()

    const content = [
      ...this.getHeaderContent(),
      this.sectionTitle('[1] รายละเอียดใบงาน'),
      this.getItemsTableContent(),
      ...(extrasSection ? [extrasSection] : []),
      this.sectionTitle('[3] สรุปรายใบ (ตัวเลขทางการ)'),
      this.getSlipSummaryTableContent(),
      this.sectionTitle('[4] สรุปแยกตามประเภททอง'),
      this.getGoldTypeSummaryTableContent(),
      ...this.getFooterContent()
    ]

    return {
      pageSize: 'A4',
      pageMargins: [20, 20, 20, 10],
      content,
      defaultStyle: {
        font: PDF_FONT,
        fontSize: 9
      },
      styles: {
        tableHeader: { color: '#ffffff', bold: true, fontSize: 8.5 }
      }
    }
  }

  generatePDF() {
    const pdfMake = initPdfMake()
    return pdfMake.createPdf(this.getDocDefinition())
  }
}
