import { initPdfMake } from '@/services/utils/pdf-make'
import dayjs from 'dayjs'

function fmtW(val) {
  if (val == null) return '0.00'
  return Number(val).toFixed(2)
}

function fmt2(val) {
  if (val == null) return '0.00'
  const v = Number(val)
  const abs = Math.abs(v)
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return v < 0 ? `-${abs}` : abs
}

function fmtDate(val) {
  if (!val) return ''
  return dayjs(val).format('DD/MM/YYYY')
}

function fmtSign(val, decimals = 2) {
  const n = Number(val || 0)
  if (n === 0) return Number(0).toFixed(decimals)
  const abs = Math.abs(n)
    .toFixed(decimals)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return n > 0 ? `+${abs}` : `-${abs}`
}

function makeHeaderCell(text) {
  return {
    text,
    bold: true,
    fillColor: '#e0e0e0',
    color: '#000000',
    alignment: 'center',
    margin: [2, 3, 2, 3],
    border: [true, true, true, true]
  }
}

export class GoldLossTangPdfBuilder {
  constructor(slipData, options = {}) {
    this.slip = slipData
    this.includeJobs = options.includeJobs !== false
  }

  getHeaderContent() {
    return {
      columns: [
        'บริษัท ดวงเเก้ว จิวเวลรี่ แมนูแฟคเจอเรอร์ จำกัด',
        { text: 'ใบสรุปค่าเสียทองช่างแต่ง (Gold Loss Tang)', alignment: 'right' }
      ],
      bold: true,
      fontSize: 15,
      margin: [0, 0, 0, 0]
    }
  }

  getSubHeaderContent() {
    const s = this.slip
    const workerDisplay = s.workerName || s.workerCode || '-'
    const leftText = `เลขที่: ${s.documentNo || '-'}  [${fmtDate(s.createDate)}]   ช่าง: ${workerDisplay}`
    const rightText = `ช่วงวันที่: ${fmtDate(s.requestDateStart)} - ${fmtDate(s.requestDateEnd)}`

    return {
      table: {
        widths: ['*'],
        body: [
          [
            {
              stack: [
                {
                  columns: [
                    leftText,
                    { text: rightText, alignment: 'right' }
                  ],
                  fontSize: 13
                }
              ],
              border: [false, false, false, true]
            }
          ]
        ]
      },
      layout: {
        defaultBorder: false
      },
      margin: [0, 0, 0, 6]
    }
  }

  getWeightTables() {
    const s = this.slip
    const types = s.typeSummaries || []
    const leftRows = [
      ...types.map((t) => ({
        name: `${[t.gold, t.goldSize].filter(Boolean).join(' ')} (งาน)`,
        weight: t.issuedWeight
      })),
      ...(s.issuedLines || []).map((l) => ({
        name: l.name + (l.countInCalc === false ? ' (ไม่นำมาคิด)' : ''),
        weight: l.weight
      }))
    ]
    const rightRows = [
      ...types.map((t) => ({
        name: `${[t.gold, t.goldSize].filter(Boolean).join(' ')} (งาน)`,
        weight: t.returnedWeight
      })),
      ...(s.returnedLines || []).map((l) => ({
        name: l.name + (l.countInCalc === false ? ' (ไม่นำมาคิด)' : ''),
        weight: l.weight
      }))
    ]
    const maxRows = Math.max(leftRows.length, rightRows.length)

    const hdr = (text, alignment) => ({
      text,
      bold: true,
      fillColor: '#e0e0e0',
      color: '#000000',
      alignment,
      margin: [4, 3, 4, 3],
      border: [true, true, true, true]
    })

    const cell = (text) => ({
      text,
      fontSize: 10,
      margin: [4, 3, 4, 3],
      border: [true, true, true, true]
    })

    const cellR = (text) => ({
      text,
      fontSize: 10,
      alignment: 'right',
      margin: [4, 3, 4, 3],
      border: [true, true, true, true]
    })

    const groupTitleRow = [
      { text: 'น้ำหนักเบิก (g)', colSpan: 2, bold: true, fillColor: '#e0e0e0', alignment: 'center', margin: [4, 3, 4, 3] },
      {},
      { text: 'น้ำหนักคืน (g)', colSpan: 2, bold: true, fillColor: '#e0e0e0', alignment: 'center', margin: [4, 3, 4, 3] },
      {}
    ]

    const colHeaderRow = [
      hdr('ชื่อรายการ', 'left'),
      hdr('น้ำหนัก (g)', 'right'),
      hdr('ชื่อรายการ', 'left'),
      hdr('น้ำหนัก (g)', 'right')
    ]

    const dataRows = []
    for (let i = 0; i < maxRows; i++) {
      const L = leftRows[i]
      const R = rightRows[i]
      dataRows.push([
        cell(L?.name ?? ''),
        cellR(L ? fmtW(L.weight) : ''),
        cell(R?.name ?? ''),
        cellR(R ? fmtW(R.weight) : '')
      ])
    }

    const footerRow = [
      { text: 'รวมเบิก', bold: true, fontSize: 10, margin: [4, 3, 4, 3], border: [true, true, true, true], fillColor: '#f5f5f5' },
      { text: fmtW(s.issuedTotal), bold: true, fontSize: 10, alignment: 'right', margin: [4, 3, 4, 3], border: [true, true, true, true], fillColor: '#f5f5f5' },
      { text: 'รวมคืน', bold: true, fontSize: 10, margin: [4, 3, 4, 3], border: [true, true, true, true], fillColor: '#f5f5f5' },
      { text: fmtW(s.returnedTotal), bold: true, fontSize: 10, alignment: 'right', margin: [4, 3, 4, 3], border: [true, true, true, true], fillColor: '#f5f5f5' }
    ]

    return {
      table: {
        widths: ['*', 70, '*', 70],
        body: [groupTitleRow, colHeaderRow, ...dataRows, footerRow]
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => '#000000',
        vLineColor: () => '#000000'
      },
      margin: [0, 0, 0, 8]
    }
  }

  getSummaryCalc() {
    const s = this.slip
    const net = Number(s.returnedTotal || 0) - Number(s.issuedTotal || 0)
    const diff = s.diffLoss
    const moneyVal = Number(s.totalMoneyDiff || 0)
    const moneyLabel = moneyVal >= 0 ? 'เงินได้' : 'เงินเสีย'

    const cell = (text, opts = {}) => ({
      text,
      fontSize: 10,
      margin: [4, 3, 4, 3],
      border: [true, true, true, true],
      ...opts
    })

    const rows = [
      [
        cell('เปอร์เซ็นต์สูญเสีย'),
        cell(`${fmtW(s.lossPercent)} %`, { alignment: 'right' })
      ],
      [
        cell('ราคา/กรัม'),
        cell(`${fmt2(s.pricePerGram)}`, { alignment: 'right' })
      ],
      [
        cell('ยอดเบิกรวม'),
        cell(`${fmtW(s.issuedTotal)} g`, { alignment: 'right' })
      ],
      [
        cell('ยอดคืนรวม'),
        cell(`${fmtW(s.returnedTotal)} g`, { alignment: 'right' })
      ],
      [
        cell('ยอดสุทธิ (คืน−เบิก)'),
        cell(`${fmtSign(net)} g`, { alignment: 'right' })
      ],
      [
        cell('เพดานสูญเสีย (คืนตัวงาน×%)'),
        cell(`${fmtW(s.allowedLoss)} g`, { alignment: 'right' })
      ],
      [
        cell('ผลต่าง (เพดาน−เสียจริง)'),
        cell(`${fmtSign(diff)} g`, { alignment: 'right' })
      ],
      [
        cell('เงิน (ผลต่าง×ราคา)', { bold: true }),
        cell(`${fmtSign(s.totalMoneyDiff)}  (${moneyLabel})`, { bold: true, alignment: 'right' })
      ]
    ]

    const stack = [
      {
        text: 'สรุป & คำนวณ',
        bold: true,
        fontSize: 12,
        margin: [0, 0, 0, 3]
      },
      {
        table: {
          widths: ['*', 160],
          body: rows
        },
        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => '#000000',
          vLineColor: () => '#000000'
        }
      }
    ]

    if (s.remark) {
      stack.push({
        text: `หมายเหตุ: ${s.remark}`,
        fontSize: 10,
        margin: [0, 4, 0, 0]
      })
    }

    return {
      stack,
      margin: [0, 8, 0, 0]
    }
  }

  getJobsSection() {
    const items = this.slip.items || []

    const headerRow = [
      makeHeaderCell('ลำดับ'),
      makeHeaderCell('WO'),
      makeHeaderCell('วันที่'),
      makeHeaderCell('ประเภททอง'),
      makeHeaderCell('จ่าย (g)'),
      makeHeaderCell('รับ (g)')
    ]

    let dataRows
    if (!items.length) {
      dataRows = [
        [
          {
            text: 'ไม่มีใบงาน',
            colSpan: 6,
            alignment: 'center',
            fontSize: 10,
            margin: [0, 8, 0, 8],
            border: [true, false, true, true]
          },
          {}, {}, {}, {}, {}
        ]
      ]
    } else {
      let totalSend = 0
      let totalCheck = 0

      dataRows = items.map((item, idx) => {
        totalSend += Number(item.goldWeightSend || 0)
        totalCheck += Number(item.goldWeightCheck || 0)
        const rowFill = idx % 2 === 1 ? '#f5f5f5' : null
        return [
          { text: String(idx + 1), alignment: 'center', fontSize: 10, fillColor: rowFill, margin: [2, 4, 2, 4] },
          { text: (item.wo || '') + (item.woNumber ? '-' + item.woNumber : ''), fontSize: 10, fillColor: rowFill, margin: [2, 4, 2, 4] },
          { text: fmtDate(item.jobDate), fontSize: 10, fillColor: rowFill, margin: [2, 4, 2, 4] },
          { text: [item.gold, item.goldSize].filter(Boolean).join(' '), fontSize: 10, fillColor: rowFill, margin: [2, 4, 2, 4] },
          { text: fmtW(item.goldWeightSend), alignment: 'right', fontSize: 10, fillColor: rowFill, margin: [2, 4, 2, 4] },
          { text: fmtW(item.goldWeightCheck), alignment: 'right', fontSize: 10, fillColor: rowFill, margin: [2, 4, 2, 4] }
        ]
      })

      dataRows.push([
        { text: '', border: [true, true, false, true] },
        { text: '', border: [false, true, false, true] },
        { text: '', border: [false, true, false, true] },
        { text: 'รวม', bold: true, fontSize: 10, alignment: 'right', border: [false, true, false, true], margin: [2, 4, 2, 4] },
        { text: fmtW(totalSend), bold: true, fontSize: 10, alignment: 'right', border: [false, true, false, true], margin: [2, 4, 2, 4] },
        { text: fmtW(totalCheck), bold: true, fontSize: 10, alignment: 'right', border: [false, true, true, true], margin: [2, 4, 2, 4] }
      ])
    }

    return {
      stack: [
        {
          text: 'รายละเอียดใบงาน (WO)',
          bold: true,
          fontSize: 13,
          margin: [0, 0, 0, 6]
        },
        {
          table: {
            headerRows: 1,
            widths: [28, '*', 62, 70, 58, 58],
            body: [headerRow, ...dataRows]
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000',
            fillColor: (rowIndex) => {
              if (rowIndex === 0) return '#e0e0e0'
              return null
            }
          }
        }
      ]
    }
  }

  getSignatureBlock() {
    return {
      margin: [0, 55, 0, 0],
      columns: [
        { width: '*', text: '' },
        {
          width: 'auto',
          columns: [
            {
              width: 150,
              alignment: 'center',
              stack: [
                { text: '______________________', margin: [0, 0, 0, 2] },
                { text: 'ผู้จัดทำ' },
                { text: 'วันที่ ......../......../........', fontSize: 9, margin: [0, 2, 0, 0] }
              ]
            },
            { width: 30, text: '' },
            {
              width: 150,
              alignment: 'center',
              stack: [
                { text: '______________________', margin: [0, 0, 0, 2] },
                { text: 'ผู้อนุมัติ' },
                { text: 'วันที่ ......../......../........', fontSize: 9, margin: [0, 2, 0, 0] }
              ]
            }
          ]
        }
      ]
    }
  }

  getDocDefinition() {
    const content = [
      this.getHeaderContent(),
      this.getSubHeaderContent(),
      this.getWeightTables(),
      this.getSummaryCalc(),
      this.getSignatureBlock()
    ]
    if (this.includeJobs && (this.slip.items || []).length) {
      content.push({ text: '', pageBreak: 'after' })
      content.push(this.getJobsSection())
    }

    return {
      pageSize: 'A4',
      pageMargins: [15, 15, 15, 15],
      content,
      footer: (currentPage, pageCount) => ({
        text: 'หน้า ' + currentPage + ' / ' + pageCount,
        alignment: 'right',
        fontSize: 8,
        color: '#000000',
        margin: [0, 5, 20, 0]
      }),
      defaultStyle: {
        font: 'THSarabunNew',
        fontSize: 10
      },
      styles: {
        sectionTitle: {
          font: 'THSarabunNew',
          fontSize: 12,
          bold: true
        }
      }
    }
  }

  generatePDF() {
    return initPdfMake().createPdf(this.getDocDefinition())
  }
}
