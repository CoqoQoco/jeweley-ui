import dayjs from 'dayjs'

const THAI_MONTHS = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม'
]

const UNIT_MAP = {
  R: 'วง',
  G: 'วง',
  N: 'เส้น',
  B: 'เส้น',
  CH: 'เส้น',
  E: 'คู่',
  ES: 'คู่',
  EL: 'คู่',
  EH: 'คู่',
  SE: 'คู่',
  P: 'อัน',
  LK: 'กรอบ'
}
const DEFAULT_UNIT = 'ชิ้น'

const HEADER_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF921313' } }
const HEADER_FONT = { name: 'Arial', bold: true, color: { argb: 'FFFFFFFF' }, size: 10 }
const HEADER_ALIGNMENT = { vertical: 'middle', horizontal: 'center', wrapText: true }
const BODY_FONT = { name: 'Arial', size: 10 }
const THIN_BORDER = {
  top: { style: 'thin' },
  left: { style: 'thin' },
  bottom: { style: 'thin' },
  right: { style: 'thin' }
}

function safeNumber(value, decimalPlaces = 2) {
  if (value == null || isNaN(value)) return 0
  return Number(Number(value).toFixed(decimalPlaces))
}

export class PlanBomSummaryExcelBuilder {
  constructor(data, options = {}) {
    this.data = Array.isArray(data) ? data : []
    this.options = options
  }

  getAmount(item) {
    return safeNumber(
      (item.qty || 0) * (item.qtyPrice || 0) + (item.qtyWeight || 0) * (item.qtyWeightPrice || 0),
      2
    )
  }

  getKaratLabel() {
    const goldSize = this.options.goldSize
    if (!goldSize || !Array.isArray(goldSize) || goldSize.length !== 1) return ''
    return goldSize[0] || ''
  }

  getMonthLabel() {
    const start = this.options.start
    if (!start) return ''
    const d = dayjs(start)
    const month = THAI_MONTHS[d.month()]
    const year = d.year() + 543
    return `${month} ${year}`
  }

  buildTableAData() {
    const gemRows = this.data.filter((item) => item.nameGroup === 'Gem')
    const goldRows = this.data.filter((item) => item.nameGroup === 'Gold')

    const gemGroups = {}
    gemRows.forEach((item) => {
      const key = item.nameMaster || ''
      if (!gemGroups[key]) {
        gemGroups[key] = { name: key, qty: 0, amount: 0 }
      }
      gemGroups[key].qty += item.qtyWeight || 0
      gemGroups[key].amount += this.getAmount(item)
    })

    const rows = Object.values(gemGroups)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((g) => ({
        detail: g.name,
        qty: g.qty,
        unit: 'ct.',
        amount: g.amount
      }))

    if (goldRows.length > 0) {
      const goldQty = goldRows.reduce((sum, item) => sum + (item.qtyWeight || 0), 0)
      const goldAmount = goldRows.reduce((sum, item) => sum + this.getAmount(item), 0)
      rows.push({
        detail: 'น้ำหนักทองรวม',
        qty: goldQty,
        unit: 'g.',
        amount: goldAmount
      })
    }

    const total = rows.reduce((sum, r) => sum + r.amount, 0)

    return { rows, total }
  }

  buildTableBData() {
    const groups = {}
    this.data.forEach((item) => {
      const key = item.productTypeName || ''
      if (!groups[key]) {
        groups[key] = {
          name: key,
          productType: item.productType,
          qty: 0,
          amount: 0,
          seenPlanIds: new Set()
        }
      }
      const group = groups[key]
      const planId = item.productionPlanId
      if (planId != null && !group.seenPlanIds.has(planId)) {
        group.seenPlanIds.add(planId)
        group.qty += item.productQty ?? 0
      }
      group.amount += this.getAmount(item)
    })

    const rows = Object.values(groups)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((g) => ({
        detail: g.name,
        qty: g.qty,
        unit: UNIT_MAP[g.productType] || DEFAULT_UNIT,
        amount: g.amount
      }))

    const total = rows.reduce((sum, r) => sum + r.amount, 0)

    return { rows, total }
  }

  writeTableHeader(worksheet, rowIndex, firstHeader) {
    const row = worksheet.getRow(rowIndex)
    row.values = [firstHeader, 'จำนวน', 'หน่วย', 'จำนวนเงิน']
    row.height = 22
    row.eachCell((cell) => {
      cell.fill = HEADER_FILL
      cell.font = HEADER_FONT
      cell.alignment = HEADER_ALIGNMENT
      cell.border = THIN_BORDER
    })
    return rowIndex + 1
  }

  writeTableRows(worksheet, rowIndex, rows) {
    rows.forEach((r) => {
      const row = worksheet.getRow(rowIndex)
      row.values = [r.detail, r.qty, r.unit, r.amount]
      row.getCell(1).alignment = { vertical: 'middle', horizontal: 'left' }
      row.getCell(2).alignment = { vertical: 'middle', horizontal: 'right' }
      row.getCell(2).numFmt = '#,##0.00'
      row.getCell(3).alignment = { vertical: 'middle', horizontal: 'center' }
      row.getCell(4).alignment = { vertical: 'middle', horizontal: 'right' }
      row.getCell(4).numFmt = '#,##0.00'
      row.eachCell((cell) => {
        cell.font = BODY_FONT
        cell.border = THIN_BORDER
      })
      rowIndex += 1
    })
    return rowIndex
  }

  writeTotalRow(worksheet, rowIndex, total) {
    worksheet.mergeCells(rowIndex, 1, rowIndex, 3)
    const labelCell = worksheet.getCell(rowIndex, 1)
    labelCell.value = 'รวมเป็นเงิน (บาท)'
    labelCell.font = { name: 'Arial', bold: true, size: 10, color: { argb: 'FF921313' } }
    labelCell.alignment = { vertical: 'middle', horizontal: 'right' }

    const amountCell = worksheet.getCell(rowIndex, 4)
    amountCell.value = total
    amountCell.numFmt = '#,##0.00'
    amountCell.font = { name: 'Arial', bold: true, size: 10, color: { argb: 'FF921313' } }
    amountCell.alignment = { vertical: 'middle', horizontal: 'right' }

    const row = worksheet.getRow(rowIndex)
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } }
      cell.border = THIN_BORDER
    })

    return rowIndex + 1
  }

  buildSheet(workbook) {
    const worksheet = workbook.addWorksheet('สรุปวัตถุดิบ', {
      views: [{ showGridLines: true }]
    })

    worksheet.columns = [{ width: 35 }, { width: 15 }, { width: 12 }, { width: 18 }]

    const karatLabel = this.getKaratLabel()
    const monthLabel = this.getMonthLabel()
    const titleText = `ใบเบิกวัตถุดิบ งาน ${karatLabel} ประจำเดือน ${monthLabel}`
      .replace(/\s+/g, ' ')
      .trim()

    worksheet.mergeCells('A1:D1')
    const titleCell = worksheet.getCell('A1')
    titleCell.value = titleText
    titleCell.font = { name: 'Arial', bold: true, size: 14 }
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' }
    worksheet.getRow(1).height = 26

    const tableA = this.buildTableAData()
    const tableB = this.buildTableBData()

    let rowIndex = 3
    rowIndex = this.writeTableHeader(worksheet, rowIndex, 'รายละเอียด')
    rowIndex = this.writeTableRows(worksheet, rowIndex, tableA.rows)
    rowIndex = this.writeTotalRow(worksheet, rowIndex, tableA.total)

    rowIndex += 1

    rowIndex = this.writeTableHeader(worksheet, rowIndex, 'ประเภทสินค้า')
    rowIndex = this.writeTableRows(worksheet, rowIndex, tableB.rows)
    this.writeTotalRow(worksheet, rowIndex, tableB.total)

    return worksheet
  }
}
