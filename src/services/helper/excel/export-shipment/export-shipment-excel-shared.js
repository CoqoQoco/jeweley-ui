// export-shipment-excel-shared.js
// Shared company header / CONSIGNED TO block + cell helpers reused by the 3 ExportShipment
// Excel builders (Invoice / Summary / Packing List) so they stay 1:1 with their PDF counterpart.

import dayjs from 'dayjs'
import { EXPORT_SHIPMENT_COMPANY } from '@/services/helper/pdf/export-shipment/export-shipment-shared.js'

export const EXCEL_HEADER_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F0F0' } }

export function stdBorder() {
  return {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  }
}

/**
 * Company name/address/tel-fax/email + document title — merged across the full width.
 * @param {number} lastCol - last column letter used by the sheet (e.g. 'J' for invoice, 'G' for summary)
 */
export function buildCompanyHeaderExcel(worksheet, startRow, title, lastCol = 'J') {
  let row = startRow
  const lines = [
    { text: EXPORT_SHIPMENT_COMPANY.name, size: 13, bold: true },
    { text: EXPORT_SHIPMENT_COMPANY.address, size: 9 },
    { text: EXPORT_SHIPMENT_COMPANY.telFax, size: 9 },
    { text: EXPORT_SHIPMENT_COMPANY.email, size: 9 },
    { text: title, size: 14, bold: true }
  ]
  lines.forEach(({ text, size, bold }) => {
    worksheet.mergeCells(`A${row}:${lastCol}${row}`)
    const cell = worksheet.getCell(`A${row}`)
    cell.value = text
    cell.font = { name: 'Arial', size, bold: !!bold }
    cell.alignment = { horizontal: 'center' }
    row++
  })
  row++
  return row
}

/**
 * CONSIGNED TO / reference no. + date block — matches buildConsigneeBlock() in the PDF shared file.
 * @param {string} refLabel - 'INVOICE NO' | 'REF NO'
 * @param {string} lastCol - last column letter used by the sheet
 */
export function buildConsigneeBlockExcel(worksheet, header, startRow, refLabel = 'INVOICE NO', lastCol = 'J') {
  const h = header || {}
  const midCol = String.fromCharCode(65 + Math.floor((lastCol.charCodeAt(0) - 65) * 0.6))
  const midColNext = String.fromCharCode(midCol.charCodeAt(0) + 1)
  let row = startRow

  worksheet.mergeCells(`A${row}:${midCol}${row}`)
  worksheet.getCell(`A${row}`).value = 'CONSIGNED TO : ' + (h.consigneeName || '')
  worksheet.getCell(`A${row}`).font = { name: 'Arial', size: 10, bold: true }
  worksheet.mergeCells(`${midColNext}${row}:${lastCol}${row}`)
  worksheet.getCell(`${midColNext}${row}`).value = `${refLabel}: ` + (h.customNumber || '')
  worksheet.getCell(`${midColNext}${row}`).font = { name: 'Arial', size: 10, bold: true }
  row++

  worksheet.mergeCells(`A${row}:${midCol}${row}`)
  worksheet.getCell(`A${row}`).value = 'C/O ' + (h.eventName || '')
  worksheet.getCell(`A${row}`).font = { name: 'Arial', size: 9 }
  worksheet.mergeCells(`${midColNext}${row}:${lastCol}${row}`)
  worksheet.getCell(`${midColNext}${row}`).value = 'DATE: ' + (h.documentDate ? dayjs(h.documentDate).format('MMMM DD, YYYY') : '')
  worksheet.getCell(`${midColNext}${row}`).font = { name: 'Arial', size: 10, bold: true }
  row++

  worksheet.mergeCells(`A${row}:${lastCol}${row}`)
  worksheet.getCell(`A${row}`).value = h.consigneeAddress || ''
  worksheet.getCell(`A${row}`).font = { name: 'Arial', size: 9 }
  row++

  worksheet.mergeCells(`A${row}:${lastCol}${row}`)
  worksheet.getCell(`A${row}`).value = 'BOOTH NO. ' + (h.boothNo || '')
  worksheet.getCell(`A${row}`).font = { name: 'Arial', size: 9 }
  row++

  worksheet.mergeCells(`A${row}:${lastCol}${row}`)
  worksheet.getCell(`A${row}`).value = `Attn: ${h.attnName || ''}   Passport No. ${h.attnPassport || ''}   Tel: ${h.attnTel || ''}`
  worksheet.getCell(`A${row}`).font = { name: 'Arial', size: 9 }
  row += 2

  return row
}

export async function downloadWorkbook(workbook, filename) {
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  return true
}
