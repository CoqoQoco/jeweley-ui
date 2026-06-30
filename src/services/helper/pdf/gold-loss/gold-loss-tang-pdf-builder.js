import { initPdfMake } from '@/services/utils/pdf-make'
import dayjs from 'dayjs'

function fmt4(val) {
  if (val == null) return '0.0000'
  return Number(val).toFixed(4)
}

function fmt2(val) {
  if (val == null) return '0.00'
  const v = Number(val)
  const abs = Math.abs(v).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return v < 0 ? `-${abs}` : abs
}

function fmtDate(val) {
  if (!val) return ''
  return dayjs(val).format('DD/MM/YYYY')
}

export class GoldLossTangPdfBuilder {
  constructor(slipData) {
    this.slip = slipData
  }

  getHeader() {
    const s = this.slip
    return {
      columns: [
        {
          stack: [
            { text: 'ใบงานสรุปทองช่างแต่ง (Gold Loss Tang)', style: 'docTitle' },
            { text: `เลขที่: ${s.documentNo || '-'}`, style: 'docNo' },
            { text: `วันที่พิมพ์: ${fmtDate(new Date())}`, style: 'subText' }
          ]
        },
        {
          stack: [
            { text: `ช่าง: ${s.workerName || s.workerCode || '-'}`, style: 'subText' },
            { text: `ช่วงวันที่: ${fmtDate(s.requestDateStart)} - ${fmtDate(s.requestDateEnd)}`, style: 'subText' },
            { text: `สร้างโดย: ${s.createBy || '-'}`, style: 'subText' }
          ],
          alignment: 'right'
        }
      ],
      margin: [0, 0, 0, 10]
    }
  }

  getJobsTable() {
    const items = this.slip.items || []

    const headerRow = [
      { text: 'ลำดับ', style: 'tableHeader', alignment: 'center' },
      { text: 'WO', style: 'tableHeader' },
      { text: 'วันที่', style: 'tableHeader' },
      { text: 'ทอง', style: 'tableHeader' },
      { text: 'จ่าย (g)', style: 'tableHeader', alignment: 'right' },
      { text: 'รับ (g)', style: 'tableHeader', alignment: 'right' }
    ]

    const dataRows = items.map((item, idx) => [
      { text: String(idx + 1), alignment: 'center' },
      { text: item.wo + (item.woNumber ? '-' + item.woNumber : '') },
      { text: fmtDate(item.jobDate) },
      { text: [item.gold, item.goldSize].filter(Boolean).join(' ') },
      { text: fmt4(item.goldWeightSend), alignment: 'right' },
      { text: fmt4(item.goldWeightCheck), alignment: 'right' }
    ])

    return {
      table: {
        headerRows: 1,
        widths: [30, '*', 60, 60, 60, 60],
        body: [headerRow, ...dataRows]
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => '#cccccc',
        vLineColor: () => '#cccccc',
        fillColor: (rowIndex) => (rowIndex === 0 ? '#921313' : null)
      },
      margin: [0, 0, 0, 10]
    }
  }

  getExtraLines() {
    const issued = this.slip.issuedLines || []
    const returned = this.slip.returnedLines || []

    if (!issued.length && !returned.length) return null

    const stack = []

    if (issued.length) {
      stack.push({ text: 'รายการเบิกเพิ่มเติม', style: 'sectionTitle', margin: [0, 4, 0, 2] })
      issued.forEach((e) => {
        stack.push({ text: `  ${e.name}: ${fmt4(e.weight)} g`, style: 'subText' })
      })
    }

    if (returned.length) {
      stack.push({ text: 'รายการคืนเพิ่มเติม', style: 'sectionTitle', margin: [0, 6, 0, 2] })
      returned.forEach((e) => {
        stack.push({ text: `  ${e.name}: ${fmt4(e.weight)} g`, style: 'subText' })
      })
    }

    return { stack, margin: [0, 0, 0, 10] }
  }

  getSummaryTable() {
    const s = this.slip
    const diffLoss = Number(s.diffLoss || 0)
    const money = Number(s.totalMoneyDiff || 0)

    const diffText = `${diffLoss >= 0 ? '+' : ''}${fmt4(diffLoss)} g`
    const moneyText = `${money >= 0 ? '+' : ''}${fmt2(money)} บาท`

    const rows = [
      ['%Loss', `${s.lossPercent}%`, 'ราคา/กรัม', `${fmt2(s.pricePerGram)} บาท`],
      ['เบิกรวม', `${fmt4(s.issuedTotal)} g`, 'คืนรวม', `${fmt4(s.returnedTotal)} g`],
      ['สูญหายจริง', `${fmt4(s.rawLoss)} g`, 'สูญหายที่อนุญาต', `${fmt4(s.allowedLoss)} g`],
      ['ผลต่าง', diffText, 'เงินได้/ขาด', moneyText]
    ]

    return {
      table: {
        widths: [80, '*', 80, '*'],
        body: rows.map((row) =>
          row.map((cell, i) => ({
            text: cell,
            style: i % 2 === 0 ? 'summaryLabel' : 'summaryValue',
            border: [true, true, true, true]
          }))
        )
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => '#e0e0e0',
        vLineColor: () => '#e0e0e0'
      },
      margin: [0, 0, 0, 10]
    }
  }

  getDocDefinition() {
    const extraLines = this.getExtraLines()

    const content = [this.getHeader(), this.getJobsTable()]

    if (extraLines) {
      content.push(extraLines)
    }

    content.push(this.getSummaryTable())

    if (this.slip.remark) {
      content.push({
        text: `หมายเหตุ: ${this.slip.remark}`,
        style: 'subText',
        margin: [0, 4, 0, 0]
      })
    }

    return {
      pageSize: 'A4',
      pageOrientation: 'portrait',
      pageMargins: [15, 15, 15, 15],
      content,
      styles: {
        docTitle: {
          font: 'THSarabunNew',
          fontSize: 16,
          bold: true,
          color: '#921313'
        },
        docNo: {
          font: 'THSarabunNew',
          fontSize: 12,
          bold: true
        },
        subText: {
          font: 'THSarabunNew',
          fontSize: 10
        },
        sectionTitle: {
          font: 'THSarabunNew',
          fontSize: 11,
          bold: true,
          color: '#921313'
        },
        tableHeader: {
          font: 'THSarabunNew',
          fontSize: 10,
          bold: true,
          color: '#ffffff'
        },
        summaryLabel: {
          font: 'THSarabunNew',
          fontSize: 10,
          bold: true,
          color: '#555555'
        },
        summaryValue: {
          font: 'THSarabunNew',
          fontSize: 10
        }
      },
      defaultStyle: {
        font: 'THSarabunNew',
        fontSize: 10
      }
    }
  }

  generatePDF() {
    const pdfMake = initPdfMake()
    return pdfMake.createPdf(this.getDocDefinition())
  }
}
