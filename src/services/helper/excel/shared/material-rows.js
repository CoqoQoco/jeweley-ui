import { formatItemStyleCode } from '@/services/utils/item-code.js'

export const MATERIALS_SHEET_NAME = 'Materials'

const MATERIAL_TYPES = ['Gold', 'Diamond', 'Gem']

// แตกวัตถุดิบของแต่ละรายการเป็น 1 แถวต่อ 1 material — น้ำหนักเป็น Number ดิบ (ไม่ปัด) เพื่อให้ผู้ใช้ SUM ใน Excel เอง
// no = ลำดับรายการ (เริ่ม 1) ตรงกับคอลัมน์ No. ของ sheet แรก; รายการที่ไม่มี material ถูกข้าม
export function buildMaterialRows(items) {
  const rows = []
  ;(items || []).forEach((item, index) => {
    if (!item || !Array.isArray(item.materials)) return
    item.materials.forEach((m) => {
      if (!m || !MATERIAL_TYPES.includes(m.type)) return
      const weight = Number(m.weight) || 0
      const qty = m.qty == null || m.qty === '' ? NaN : Number(m.qty)
      rows.push({
        no: index + 1,
        style: formatItemStyleCode(item),
        description: item.description || item.productNumber || '',
        type: m.type,
        code: m.typeCode || '',
        qty: m.type !== 'Gold' && Number.isFinite(qty) ? qty : null,
        gold: m.type === 'Gold' ? weight : null,
        diamond: m.type === 'Diamond' ? weight : null,
        gem: m.type === 'Gem' ? weight : null
      })
    })
  })
  return rows
}

// เขียน sheet "Materials" — 1 แถวต่อ 1 material + แถว Total ด้วยสูตร =SUM(...)
export function writeMaterialsSheet(workbook, items, options = {}) {
  const headerColor = options.headerColor || 'FF921313'
  const rows = buildMaterialRows(items)
  const worksheet = workbook.addWorksheet(MATERIALS_SHEET_NAME)
  const thinBorder = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  }

  const headers = [
    'No.',
    'Style/Product',
    'Description',
    'Type',
    'Code',
    'Qty',
    'Gold (gms)',
    'Diamond (cts)',
    'Gem (cts)'
  ]
  headers.forEach((header, index) => {
    const cell = worksheet.getCell(1, index + 1)
    cell.value = header
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: headerColor } }
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
    cell.border = thinBorder
  })
  worksheet.getRow(1).height = 25

  const numericCols = [6, 7, 8, 9]
  rows.forEach((r, i) => {
    const rowIndex = i + 2
    const values = [r.no, r.style, r.description, r.type, r.code, r.qty, r.gold, r.diamond, r.gem]
    values.forEach((value, colIndex) => {
      const cell = worksheet.getCell(rowIndex, colIndex + 1)
      cell.value = value
      cell.font = { name: 'Arial', size: 9 }
      cell.border = thinBorder
      const isNumeric = numericCols.includes(colIndex + 1)
      cell.alignment = { vertical: 'top', horizontal: isNumeric || colIndex === 0 ? 'right' : 'left' }
      if (colIndex >= 6) cell.numFmt = '#,##0.00'
    })
  })

  // Total row — สูตร SUM จริง (ใส่ result ไว้ให้ viewer ที่ไม่คำนวณสูตรเห็นค่า)
  const totalRow = rows.length + 2
  const lastDataRow = rows.length + 1
  const sumOf = (key) => rows.reduce((s, r) => s + (r[key] || 0), 0)
  const totals = [
    { col: 6, key: 'qty', letter: 'F', numFmt: '#,##0' },
    { col: 7, key: 'gold', letter: 'G', numFmt: '#,##0.00' },
    { col: 8, key: 'diamond', letter: 'H', numFmt: '#,##0.00' },
    { col: 9, key: 'gem', letter: 'I', numFmt: '#,##0.00' }
  ]
  for (let col = 1; col <= 9; col++) {
    const cell = worksheet.getCell(totalRow, col)
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: headerColor } }
    cell.alignment = { vertical: 'middle', horizontal: col === 1 ? 'right' : 'left' }
    cell.border = thinBorder
  }
  worksheet.getCell(totalRow, 1).value = 'Total'
  totals.forEach(({ col, key, letter, numFmt }) => {
    const cell = worksheet.getCell(totalRow, col)
    const result = sumOf(key)
    cell.value = rows.length
      ? { formula: `SUM(${letter}2:${letter}${lastDataRow})`, result }
      : result
    cell.numFmt = numFmt
    cell.alignment = { vertical: 'middle', horizontal: 'right' }
  })
  worksheet.getRow(totalRow).height = 25

  const widths = [6, 20, 30, 10, 16, 8, 14, 14, 14]
  widths.forEach((w, i) => {
    worksheet.getColumn(i + 1).width = w
  })
  worksheet.views = [{ state: 'frozen', ySplit: 1 }]
  worksheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: 9 } }

  return worksheet
}
