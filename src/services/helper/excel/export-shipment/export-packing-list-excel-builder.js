// ExportPackingListExcelBuilder — Excel counterpart of ExportPackingListPdfBuilder
// One row per parcelNo group, item no. range + weight totals.

import dayjs from 'dayjs'
import ExcelJS from 'exceljs'
import { sumItems, fmtWeight } from '@/services/helper/pdf/export-shipment/export-shipment-shared.js'
import {
  EXCEL_HEADER_FILL,
  stdBorder,
  buildCompanyHeaderExcel,
  buildConsigneeBlockExcel,
  downloadWorkbook
} from './export-shipment-excel-shared.js'

export class ExportPackingListExcelBuilder {
  constructor(header, items) {
    this.header = header || {}
    this.items = Array.isArray(items) ? items : []
  }

  async prepare() {
    return this
  }

  buildParcels() {
    const map = new Map()

    this.items.forEach((it) => {
      const key = it.parcelNo !== null && it.parcelNo !== undefined && it.parcelNo !== '' ? String(it.parcelNo) : 'UNASSIGNED'
      if (!map.has(key)) map.set(key, { parcelNo: key, items: [] })
      map.get(key).items.push(it)
    })

    const parcels = [...map.values()].map((p) => {
      const itemNos = p.items.map((it) => Number(it.itemNo) || 0).filter((n) => n > 0)
      const min = itemNos.length ? Math.min(...itemNos) : null
      const max = itemNos.length ? Math.max(...itemNos) : null
      return {
        parcelNo: p.parcelNo,
        itemRange: min && max ? (min === max ? String(min) : `${min}-${max}`) : '-',
        qty: p.items.reduce((s, it) => s + (Number(it.qty) || 0), 0),
        netWeight: p.items.reduce((s, it) => s + (Number(it.netWeight) || 0), 0)
      }
    })

    parcels.sort((a, b) => {
      const na = Number(a.parcelNo)
      const nb = Number(b.parcelNo)
      if (!isNaN(na) && !isNaN(nb)) return na - nb
      return String(a.parcelNo).localeCompare(String(b.parcelNo))
    })

    return parcels
  }

  buildParcelsTable(worksheet, startRow) {
    let row = startRow
    const parcels = this.buildParcels()
    const totals = sumItems(this.items)

    const headers = ['PARCEL NO.', 'ITEM NO.', 'PCS', 'NET WEIGHT(GMS)']
    headers.forEach((text, idx) => {
      const col = String.fromCharCode(65 + idx)
      const cell = worksheet.getCell(`${col}${row}`)
      cell.value = text
      cell.font = { name: 'Arial', size: 9, bold: true }
      cell.fill = EXCEL_HEADER_FILL
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
      cell.border = stdBorder()
    })
    worksheet.getRow(row).height = 24
    row++

    parcels.forEach((p) => {
      const cells = [
        { col: 'A', value: p.parcelNo, align: 'center' },
        { col: 'B', value: p.itemRange, align: 'center' },
        { col: 'C', value: p.qty, align: 'right' },
        { col: 'D', value: fmtWeight(p.netWeight, 3), align: 'right' }
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

    worksheet.mergeCells(`A${row}:B${row}`)
    worksheet.getCell(`A${row}`).value = 'TOTAL'
    worksheet.getCell(`A${row}`).font = { name: 'Arial', size: 9, bold: true }
    ;['A', 'B'].forEach((c) => {
      worksheet.getCell(`${c}${row}`).fill = EXCEL_HEADER_FILL
      worksheet.getCell(`${c}${row}`).border = stdBorder()
    })

    const totalCells = [
      { col: 'C', value: totals.qty },
      { col: 'D', value: fmtWeight(totals.netWeight, 3) }
    ]
    totalCells.forEach(({ col, value }) => {
      const cell = worksheet.getCell(`${col}${row}`)
      cell.value = value
      cell.font = { name: 'Arial', size: 9, bold: true }
      cell.alignment = { horizontal: 'right' }
      cell.fill = EXCEL_HEADER_FILL
      cell.border = stdBorder()
    })
    row += 2

    const parcelCount = Number(this.header.parcelCount) || parcels.length
    worksheet.mergeCells(`A${row}:D${row}`)
    worksheet.getCell(`A${row}`).value = `TOTAL ${parcelCount} PARCEL(S)`
    worksheet.getCell(`A${row}`).font = { name: 'Arial', size: 10, bold: true }
    row++

    return row
  }

  autoFitColumns(worksheet) {
    const widths = { A: 16, B: 16, C: 10, D: 16 }
    Object.keys(widths).forEach((col) => {
      worksheet.getColumn(col).width = widths[col]
    })
  }

  async generateExcel() {
    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'DK Jewelry Management System'
    workbook.created = new Date()

    const worksheet = workbook.addWorksheet('PACKING LIST', {
      pageSetup: { paperSize: 9, orientation: 'portrait' }
    })

    let row = buildCompanyHeaderExcel(worksheet, 1, 'PACKING LIST', 'D')
    row = buildConsigneeBlockExcel(worksheet, this.header, row, 'REF NO', 'D')
    this.buildParcelsTable(worksheet, row)

    this.autoFitColumns(worksheet)

    return workbook
  }

  async downloadExcel(filename) {
    const workbook = await this.generateExcel()
    const name =
      filename ||
      `ExportPackingList_${this.header.documentNumber || this.header.customNumber || 'export'}_${dayjs().format('YYYYMMDD')}.xlsx`
    return downloadWorkbook(workbook, name)
  }
}
