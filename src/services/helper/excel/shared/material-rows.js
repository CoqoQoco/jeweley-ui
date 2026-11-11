import { formatItemStyleCode } from '@/services/utils/item-code.js'
import { classifyMaterial, getDocMaterialMode, getMaterialLabel } from '@/services/helper/sale-material-columns.js'

export const MATERIALS_SHEET_NAME = 'Materials'

const WEIGHT_FMT = '#,##0.000'
const QTY_FMT = '#,##0'

// รวม material ชนิดเดียวกันของสินค้า 1 ชิ้น — น้ำหนัก/qty บวกรวม, code ตัดซ้ำเรียงตามที่พบ; ไม่มีชนิดนั้น → null
function aggregateType(materials, kind, mode) {
  const list = materials.filter((m) => m && classifyMaterial(m, mode) === kind)
  if (!list.length) return { code: null, qty: null, weight: null }
  const codes = []
  let weight = 0
  let qty = 0
  list.forEach((m) => {
    const label = m.type === 'Gold' || m.type === 'Diamond' ? m.typeCode : getMaterialLabel(m)
    if (label && !codes.includes(label)) codes.push(label)
    weight += Number(m.weight) || 0
    const q = m.qty == null || m.qty === '' ? NaN : Number(m.qty)
    if (Number.isFinite(q)) qty += q
  })
  return { code: codes.join(' / '), qty, weight }
}

// 1 สินค้า = 1 แถว — ตัวเลขเป็น Number ดิบ (ไม่ปัด) เพื่อให้ผู้ใช้ SUM ใน Excel เอง
// no = ลำดับรายการ (เริ่ม 1) ตรงกับคอลัมน์ No. ของ sheet แรก; รายการที่ไม่มี material ที่รู้จักถูกข้าม
export function buildMaterialRows(items) {
  const rows = []
  const mode = getDocMaterialMode(items)
  ;(items || []).forEach((item, index) => {
    if (!item || !Array.isArray(item.materials)) return
    const known = item.materials.filter((m) => m && classifyMaterial(m, mode) !== 'other')
    if (!known.length) return
    const gold = aggregateType(known, 'metal', mode)
    const diamond = aggregateType(known, 'second', mode)
    const gem = aggregateType(known, 'gem', mode)
    rows.push({
      no: index + 1,
      style: formatItemStyleCode(item),
      description: item.description || item.productNumber || '',
      goldCode: gold.code,
      gold: gold.weight,
      diamondCode: diamond.code,
      diamondQty: diamond.qty,
      diamond: diamond.weight,
      gemCode: gem.code,
      gemQty: gem.qty,
      gem: gem.weight
    })
  })
  return rows
}

// เขียน sheet "Materials" — 1 แถวต่อ 1 สินค้า + แถว Total ด้วยสูตร =SUM(...)
export function writeMaterialsSheet(workbook, items, options = {}) {
  const headerColor = options.headerColor || 'FF921313'
  const rows = buildMaterialRows(items)
  const silver = getDocMaterialMode(items) === 'silver'
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
    silver ? 'Silver Code' : 'Gold Code',
    silver ? 'Silver (gms)' : 'Gold (gms)',
    silver ? 'CZ Code' : 'Diamond Code',
    silver ? 'CZ Qty' : 'Diamond Qty',
    silver ? 'CZ (cts)' : 'Diamond (cts)',
    'Gem Code',
    'Gem Qty',
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

  const numericCols = [5, 7, 8, 10, 11]
  const qtyCols = [7, 10]
  const weightCols = [5, 8, 11]
  rows.forEach((r, i) => {
    const rowIndex = i + 2
    const values = [
      r.no, r.style, r.description,
      r.goldCode, r.gold,
      r.diamondCode, r.diamondQty, r.diamond,
      r.gemCode, r.gemQty, r.gem
    ]
    values.forEach((value, colIndex) => {
      const col = colIndex + 1
      const cell = worksheet.getCell(rowIndex, col)
      cell.value = value
      cell.font = { name: 'Arial', size: 9 }
      cell.border = thinBorder
      cell.alignment = { vertical: 'top', horizontal: numericCols.includes(col) || col === 1 ? 'right' : 'left' }
      if (weightCols.includes(col)) cell.numFmt = WEIGHT_FMT
      else if (qtyCols.includes(col)) cell.numFmt = QTY_FMT
    })
  })

  // Total row — สูตร SUM จริง (ใส่ result ไว้ให้ viewer ที่ไม่คำนวณสูตรเห็นค่า)
  const totalRow = rows.length + 2
  const lastDataRow = rows.length + 1
  const sumOf = (key) => rows.reduce((s, r) => s + (r[key] || 0), 0)
  const totals = [
    { col: 5, key: 'gold', letter: 'E', numFmt: WEIGHT_FMT },
    { col: 7, key: 'diamondQty', letter: 'G', numFmt: QTY_FMT },
    { col: 8, key: 'diamond', letter: 'H', numFmt: WEIGHT_FMT },
    { col: 10, key: 'gemQty', letter: 'J', numFmt: QTY_FMT },
    { col: 11, key: 'gem', letter: 'K', numFmt: WEIGHT_FMT }
  ]
  for (let col = 1; col <= 11; col++) {
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

  const widths = [6, 20, 30, 16, 14, 18, 12, 14, 18, 12, 14]
  widths.forEach((w, i) => {
    worksheet.getColumn(i + 1).width = w
  })
  worksheet.views = [{ state: 'frozen', ySplit: 1 }]
  worksheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: 11 } }

  return worksheet
}
