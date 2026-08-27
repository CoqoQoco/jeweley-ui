// ExportSummaryExcelBuilder — Excel counterpart of ExportSummaryPdfBuilder
// Totals grouped by PRODUCT TYPE - GOLD TYPE (same parsing rule as the PDF builder).

import dayjs from 'dayjs'
import ExcelJS from 'exceljs'
import { sumItems, fmtWeight, fmtDocMoney } from '@/services/helper/pdf/export-shipment/export-shipment-shared.js'
import {
  EXCEL_HEADER_FILL,
  stdBorder,
  buildCompanyHeaderExcel,
  buildConsigneeBlockExcel,
  downloadWorkbook
} from './export-shipment-excel-shared.js'

const GOLD_TYPE_RE = /^\d+K$/i

function parseGroup(description) {
  const desc = (description || '').trim()
  if (!desc) return { goldType: 'N/A', productType: 'OTHER' }

  const tokens = desc.split(/\s+/)
  let idx = 0
  let goldType = 'N/A'
  if (tokens[0] && GOLD_TYPE_RE.test(tokens[0])) {
    goldType = tokens[0].toUpperCase()
    idx = 1
  }
  const productType = (tokens[idx] || 'OTHER').toUpperCase()
  return { goldType, productType }
}

export class ExportSummaryExcelBuilder {
  constructor(header, items) {
    this.header = header || {}
    this.items = Array.isArray(items) ? items : []
  }

  async prepare() {
    return this
  }

  buildGroups() {
    const map = new Map()

    this.items.forEach((it) => {
      const { goldType, productType } = parseGroup(it.description)
      const key = `${productType}|${goldType}`
      if (!map.has(key)) {
        map.set(key, {
          label: `${productType} - ${goldType}`,
          qty: 0,
          netWeight: 0,
          goldWeight: 0,
          stoneWeight: 0,
          diamondWeight: 0,
          amount: 0
        })
      }
      const g = map.get(key)
      g.qty += Number(it.qty) || 0
      g.netWeight += Number(it.netWeight) || 0
      g.goldWeight += Number(it.goldWeight) || 0
      g.stoneWeight += Number(it.stoneWeight) || 0
      g.diamondWeight += Number(it.diamondWeight) || 0
      g.amount += Number(it.amount) || 0
    })

    return [...map.values()].sort((a, b) => a.label.localeCompare(b.label))
  }

  buildGroupsTable(worksheet, startRow) {
    let row = startRow
    const currency = this.header.currency || 'USD'
    const groups = this.buildGroups()
    const totals = sumItems(this.items)

    const headers = ['PRODUCT TYPE - GOLD TYPE', 'PCS', 'NET WT.(GMS)', 'GOLD(GMS)', 'STONE(CTS)', 'DIAMOND(CTS)', `AMOUNT (${currency})`]
    headers.forEach((text, idx) => {
      const col = String.fromCharCode(65 + idx)
      const cell = worksheet.getCell(`${col}${row}`)
      cell.value = text
      cell.font = { name: 'Arial', size: 9, bold: true }
      cell.fill = EXCEL_HEADER_FILL
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
      cell.border = stdBorder()
    })
    worksheet.getRow(row).height = 26
    row++

    groups.forEach((g) => {
      const cells = [
        { col: 'A', value: g.label, align: 'left' },
        { col: 'B', value: g.qty, align: 'right' },
        { col: 'C', value: fmtWeight(g.netWeight, 3), align: 'right' },
        { col: 'D', value: fmtWeight(g.goldWeight, 2), align: 'right' },
        { col: 'E', value: fmtWeight(g.stoneWeight, 2), align: 'right' },
        { col: 'F', value: fmtWeight(g.diamondWeight, 3), align: 'right' },
        { col: 'G', value: fmtDocMoney(g.amount, currency), align: 'right' }
      ]
      cells.forEach(({ col, value, align }) => {
        const cell = worksheet.getCell(`${col}${row}`)
        cell.value = value
        cell.font = { name: 'Arial', size: 9 }
        cell.alignment = { horizontal: align }
        cell.border = stdBorder()
      })
      row++
    })

    const totalCells = [
      { col: 'A', value: 'GRAND TOTAL', align: 'left' },
      { col: 'B', value: totals.qty, align: 'right' },
      { col: 'C', value: fmtWeight(totals.netWeight, 3), align: 'right' },
      { col: 'D', value: fmtWeight(totals.goldWeight, 2), align: 'right' },
      { col: 'E', value: fmtWeight(totals.stoneWeight, 2), align: 'right' },
      { col: 'F', value: fmtWeight(totals.diamondWeight, 3), align: 'right' },
      { col: 'G', value: fmtDocMoney(totals.amount, currency), align: 'right' }
    ]
    totalCells.forEach(({ col, value, align }) => {
      const cell = worksheet.getCell(`${col}${row}`)
      cell.value = value
      cell.font = { name: 'Arial', size: 9, bold: true }
      cell.alignment = { horizontal: align }
      cell.fill = EXCEL_HEADER_FILL
      cell.border = stdBorder()
    })
    row++

    return row
  }

  autoFitColumns(worksheet) {
    const widths = { A: 28, B: 10, C: 14, D: 12, E: 12, F: 12, G: 15 }
    Object.keys(widths).forEach((col) => {
      worksheet.getColumn(col).width = widths[col]
    })
  }

  async generateExcel() {
    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'DK Jewelry Management System'
    workbook.created = new Date()

    const worksheet = workbook.addWorksheet('SUMMARY', {
      pageSetup: { paperSize: 9, orientation: 'landscape' }
    })

    let row = buildCompanyHeaderExcel(worksheet, 1, 'SUMMARY', 'G')
    row = buildConsigneeBlockExcel(worksheet, this.header, row, 'REF NO', 'G')
    this.buildGroupsTable(worksheet, row)

    this.autoFitColumns(worksheet)

    return workbook
  }

  async downloadExcel(filename) {
    const workbook = await this.generateExcel()
    const name =
      filename || `ExportSummary_${this.header.documentNumber || this.header.customNumber || 'export'}_${dayjs().format('YYYYMMDD')}.xlsx`
    return downloadWorkbook(workbook, name)
  }
}
