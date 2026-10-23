// SaleSummaryExcelBuilder — Excel คู่กับ SaleSummaryPdfBuilder (ใบสรุปตามประเภทสินค้า)
// ตัวเลขทั้งหมดมาจาก buildSaleSummaryGroups เหมือนฝั่ง PDF

import dayjs from 'dayjs'
import ExcelJS from 'exceljs'
import { roundHalfUp } from '@/services/utils/money.js'
import { COMPANY_INFO } from '@/config/company-info.js'
import { buildSaleSummaryGroups } from '@/services/helper/sale-summary/sale-summary-data.js'

const HEADER_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF8B0000' } }
const BAND_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } }
const COLUMNS = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

const stdBorder = () => ({
  top: { style: 'thin' },
  left: { style: 'thin' },
  bottom: { style: 'thin' },
  right: { style: 'thin' }
})

const MONEY_FMT = '#,##0.00'
const NUM_FMT = { 2: '#,##0.00', 3: '#,##0.000' }

const numValue = (value, decimals) => roundHalfUp(Number(value) || 0, decimals)

export class SaleSummaryExcelBuilder {
  constructor({
    items,
    customer,
    documentDate,
    documentTitle,
    documentNumber,
    currencyUnit,
    divisor,
    groupByGoldType,
    productTypeLabels
  } = {}) {
    this.items = Array.isArray(items) ? items : []
    this.customer = customer || {}
    this.documentDate = documentDate || dayjs()
    this.documentTitle = documentTitle || 'SUMMARY'
    this.documentNumber = documentNumber || ''
    this.currencyUnit = currencyUnit || 'THB'
    this.divisor = Number(divisor) || 1
    this.groupByGoldType = groupByGoldType || false
    this.productTypeLabels = productTypeLabels || {}

    this.companyInfo = COMPANY_INFO
    this.logoBase64 = null
  }

  async prepare() {
    try {
      const logoPath = new URL('@/assets/duangkaew-icon.png', import.meta.url).href
      this.logoBase64 = await this.loadImageAsBase64(logoPath)
    } catch {
      // logo load failure is non-critical — continue without logo
    }
  }

  async loadImageAsBase64(path) {
    const response = await fetch(path)
    const blob = await response.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  _money(value) {
    return numValue(value, 2)
  }

  fillBand(worksheet, row, columns) {
    columns.forEach((col) => {
      worksheet.getCell(`${col}${row}`).fill = BAND_FILL
    })
  }

  // === HEADER SECTION ===

  buildHeader(worksheet, startRow) {
    let row = startRow

    // แถวที่ 1: พื้นที่โลโก้ (A) | ชื่อบริษัท (B-D) | ชื่อเอกสาร (E-G)
    worksheet.getRow(row).height = 35
    this.fillBand(worksheet, row, COLUMNS)

    worksheet.mergeCells(`B${row}:D${row}`)
    const companyNameCell = worksheet.getCell(`B${row}`)
    companyNameCell.value = 'Duang Kaew Jewelry'
    companyNameCell.font = { name: 'Arial', size: 20, bold: true, color: { argb: 'FF8B0000' } }
    companyNameCell.alignment = { vertical: 'middle', horizontal: 'left' }

    worksheet.mergeCells(`E${row}:G${row}`)
    const titleCell = worksheet.getCell(`E${row}`)
    titleCell.value = this.documentTitle
    titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FF393939' } }
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' }

    row++

    // แถวที่ 2: สโลแกน | เลขที่เอกสาร
    worksheet.getRow(row).height = 20
    this.fillBand(worksheet, row, COLUMNS)

    worksheet.mergeCells(`B${row}:D${row}`)
    const sloganCell = worksheet.getCell(`B${row}`)
    sloganCell.value = 'The first step is always the hardest'
    sloganCell.font = { name: 'Arial', size: 10, color: { argb: 'FF8B0000' } }
    sloganCell.alignment = { vertical: 'middle', horizontal: 'left' }

    const noLabelCell = worksheet.getCell(`E${row}`)
    noLabelCell.value = 'No.:'
    noLabelCell.font = { name: 'Arial', size: 9, color: { argb: 'FF393939' } }
    noLabelCell.alignment = { vertical: 'middle', horizontal: 'right' }

    worksheet.mergeCells(`F${row}:G${row}`)
    const noValueCell = worksheet.getCell(`F${row}`)
    noValueCell.value = this.documentNumber
    noValueCell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF8B0000' } }
    noValueCell.alignment = { vertical: 'middle', horizontal: 'left' }

    row++

    // แถวที่ 3: วันที่เอกสาร
    this.fillBand(worksheet, row, COLUMNS)

    const dateLabelCell = worksheet.getCell(`E${row}`)
    dateLabelCell.value = 'Date:'
    dateLabelCell.font = { name: 'Arial', size: 9, color: { argb: 'FF393939' } }
    dateLabelCell.alignment = { vertical: 'middle', horizontal: 'right' }

    worksheet.mergeCells(`F${row}:G${row}`)
    const dateValueCell = worksheet.getCell(`F${row}`)
    dateValueCell.value = dayjs(this.documentDate).format('MMMM DD, YYYY')
    dateValueCell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF8B0000' } }
    dateValueCell.alignment = { vertical: 'middle', horizontal: 'left' }

    row++
    row++ // เว้นบรรทัด

    return row
  }

  // === COMPANY & CUSTOMER INFO ===

  buildCompanyAndCustomerInfo(worksheet, startRow) {
    let row = startRow

    const setPair = (leftText, rightText, isTitle) => {
      worksheet.mergeCells(`A${row}:C${row}`)
      const left = worksheet.getCell(`A${row}`)
      left.value = leftText
      left.font = isTitle
        ? { name: 'Arial', size: 11, bold: true, color: { argb: 'FF8B0000' } }
        : { name: 'Arial', size: 9, color: { argb: 'FF393939' } }

      worksheet.mergeCells(`D${row}:G${row}`)
      const right = worksheet.getCell(`D${row}`)
      right.value = rightText
      right.font = isTitle
        ? { name: 'Arial', size: 11, bold: true, color: { argb: 'FF8B0000' } }
        : { name: 'Arial', size: 9, color: { argb: 'FF393939' } }

      row++
    }

    setPair(`From: ${this.companyInfo.name}`, `Invoice To: ${this.customer.name || ''}`, true)
    setPair(`Address: ${this.companyInfo.address}`, `Address: ${this.customer.address || ''}`)
    setPair(
      `TEL: ${this.companyInfo.phone}`,
      `TEL: ${this.customer.phone || this.customer.tel || ''}`
    )
    setPair(`FAX: ${this.companyInfo.fax}`, `E-mail: ${this.customer.email || ''}`)
    setPair(`E-Mail: ${this.companyInfo.email}`, `Currency: ${this.currencyUnit}`)

    row++ // เว้นบรรทัด

    return row
  }

  // === SUMMARY TABLE ===

  buildSummaryTable(worksheet, startRow) {
    let row = startRow
    const { groups, totals } = buildSaleSummaryGroups(this.items, {
      divisor: this.divisor,
      groupByGoldType: this.groupByGoldType,
      productTypeLabels: this.productTypeLabels
    })

    const headers = [
      this.groupByGoldType ? 'PRODUCT TYPE - GOLD TYPE' : 'PRODUCT TYPE',
      'PCS',
      'DIAMOND (CTS)',
      'STONE (CTS)',
      'GOLD (GMS)',
      'NET WT. (GMS)',
      `AMOUNT (${this.currencyUnit})`
    ]

    headers.forEach((text, index) => {
      const cell = worksheet.getCell(`${COLUMNS[index]}${row}`)
      cell.value = text
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } }
      cell.fill = HEADER_FILL
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
      cell.border = stdBorder()
    })
    worksheet.getRow(row).height = 25
    row++

    const firstGroupRow = row
    groups.forEach((group) => {
      const values = [
        { value: group.label, align: 'left' },
        { value: group.qty, align: 'right', numFmt: '#,##0' },
        { value: numValue(group.diamondWeight, 3), align: 'right', numFmt: NUM_FMT[3] },
        { value: numValue(group.stoneWeight, 2), align: 'right', numFmt: NUM_FMT[2] },
        { value: numValue(group.goldWeight, 2), align: 'right', numFmt: NUM_FMT[2] },
        { value: numValue(group.netWeight, 3), align: 'right', numFmt: NUM_FMT[3] },
        { value: this._money(group.amount), align: 'right', numFmt: MONEY_FMT }
      ]
      values.forEach(({ value, align, numFmt }, index) => {
        const cell = worksheet.getCell(`${COLUMNS[index]}${row}`)
        cell.value = value
        if (numFmt) cell.numFmt = numFmt
        cell.font = { name: 'Arial', size: 9, color: { argb: 'FF393939' } }
        cell.alignment = { vertical: 'middle', horizontal: align }
        cell.border = stdBorder()
      })
      row++
    })

    const lastGroupRow = row - 1
    const sumOf = (col, result) =>
      groups.length
        ? { formula: `SUM(${col}${firstGroupRow}:${col}${lastGroupRow})`, result }
        : result
    const totalValues = [
      { value: 'GRAND TOTAL', align: 'left' },
      { value: sumOf('B', totals.qty), align: 'right', numFmt: '#,##0' },
      {
        value: sumOf('C', numValue(totals.diamondWeight, 3)),
        align: 'right',
        numFmt: NUM_FMT[3]
      },
      { value: sumOf('D', numValue(totals.stoneWeight, 2)), align: 'right', numFmt: NUM_FMT[2] },
      { value: sumOf('E', numValue(totals.goldWeight, 2)), align: 'right', numFmt: NUM_FMT[2] },
      { value: sumOf('F', numValue(totals.netWeight, 3)), align: 'right', numFmt: NUM_FMT[3] },
      { value: sumOf('G', this._money(totals.amount)), align: 'right', numFmt: MONEY_FMT }
    ]
    totalValues.forEach(({ value, align, numFmt }, index) => {
      const cell = worksheet.getCell(`${COLUMNS[index]}${row}`)
      cell.value = value
      if (numFmt) cell.numFmt = numFmt
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF8B0000' } }
      cell.fill = BAND_FILL
      cell.alignment = { vertical: 'middle', horizontal: align }
      cell.border = stdBorder()
    })
    row++

    return row
  }

  autoFitColumns(worksheet) {
    const columnWidths = { A: 30, B: 10, C: 16, D: 14, E: 14, F: 16, G: 20 }
    Object.keys(columnWidths).forEach((col) => {
      worksheet.getColumn(col).width = columnWidths[col]
    })
  }

  async generateExcel() {
    await this.prepare()

    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'DK Jewelry Management System'
    workbook.created = new Date()

    const worksheet = workbook.addWorksheet('SUMMARY', {
      pageSetup: { paperSize: 9, orientation: 'portrait' }
    })

    let currentRow = 1
    currentRow = this.buildHeader(worksheet, currentRow)
    currentRow = this.buildCompanyAndCustomerInfo(worksheet, currentRow)
    this.buildSummaryTable(worksheet, currentRow)

    this.autoFitColumns(worksheet)

    if (this.logoBase64) {
      const rawBase64 = this.logoBase64.replace(/^data:image\/\w+;base64,/, '')
      const logoId = workbook.addImage({ base64: rawBase64, extension: 'png' })
      worksheet.addImage(logoId, {
        tl: { col: 0.1, row: 0.1 },
        ext: { width: 40, height: 40 }
      })
    }

    return workbook
  }

  async downloadExcel() {
    const workbook = await this.generateExcel()
    const fileName = `Summary_${this.documentNumber || 'document'}_${dayjs().format('YYYYMMDD')}.xlsx`

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    return true
  }
}
