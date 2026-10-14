// goods-receipt-report.js — ตัวช่วยกลางของรายงานรับสินค้า (งานผลิต / งานนอก)
// ใช้ร่วมกันระหว่างตารางหน้าจอ, Excel และ PDF เพื่อให้คอลัมน์/ตัวเลขตรงกันทุกที่

import { formatDate } from '@/services/utils/dayjs.js'

export const STONE_GROUPS = ['diamond', 'ruby', 'sapphire', 'emerald', 'other']

const I18N_BASE = 'view.receiptStock.product.reportGr.'

const STONE_LABEL_KEYS = {
  diamond: 'stoneDiamond',
  ruby: 'stoneRuby',
  sapphire: 'stoneSapphire',
  emerald: 'stoneEmerald',
  other: 'stoneOther'
}

// field ในตาราง -> key ใน aggregates + จำนวนทศนิยมที่แสดง
const TOTAL_FIELDS = {
  goldWeight: { key: 'goldWeight', decimals: 2 },
  qty: { key: 'totalQty', decimals: 0 },
  productPrice: { key: 'totalSales', decimals: 2 }
}
STONE_GROUPS.forEach((group) => {
  TOTAL_FIELDS[`${group}Qty`] = { key: `${group}Qty`, decimals: 0 }
  TOTAL_FIELDS[`${group}Weight`] = { key: `${group}Weight`, decimals: 3 }
})

export function formatReportNumber(value, decimals = 0) {
  const num = Number(value)
  const safe = Number.isFinite(num) ? num : 0
  return safe.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

// วันที่แบบ พ.ศ. dd/mm/yyyy (เหมือน billing-note)
export function formatThaiDate(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}/${mm}/${d.getFullYear() + 543}`
}

export function buildReportLabels(t) {
  const label = (key) => t(`${I18N_BASE}${key}`)
  const stones = {}
  STONE_GROUPS.forEach((group) => {
    stones[group] = label(STONE_LABEL_KEYS[group])
  })
  return {
    stones,
    receiptDate: label('colReceiptDate'),
    mold: label('mold'),
    stockNumber: label('stockNumber'),
    productNumber: label('productNumber'),
    detail: label('colDetail'),
    wo: label('wo'),
    vendor: label('colVendor'),
    poNumber: label('colPoNumber'),
    goldType: label('colGoldType'),
    goldWeight: label('colGoldWeight'),
    qtyShort: label('qtyShort'),
    weightShort: label('weightShort'),
    qty: label('colQty'),
    salesPrice: label('colSalesPrice'),
    grandTotal: label('grandTotal'),
    pdfTitle: label('pdfTitle'),
    pdfStyleNo: label('pdfStyleNo'),
    pdfGold: label('pdfGold'),
    pdfGoldTypeShort: label('pdfGoldTypeShort'),
    pdfPage: label('pdfPage'),
    pdfDate: label('pdfDate'),
    pdfPeriod: label('pdfPeriod'),
    modeProduction: label('modeProduction'),
    modeOutsource: label('modeOutsource')
  }
}

function numberColumn(field, header, minWidth = '90px') {
  return { field, header, sortable: false, minWidth, align: 'right' }
}

function stoneColumns(labels) {
  const columns = []
  STONE_GROUPS.forEach((group) => {
    const name = labels.stones[group]
    columns.push({ ...numberColumn(`${group}Qty`, `${name} ${labels.qtyShort}`, '90px'), format: 'number' })
    columns.push({
      ...numberColumn(`${group}Weight`, `${name} ${labels.weightShort}`, '100px'),
      format: 'decimal3'
    })
  })
  return columns
}

// คอลัมน์ตารางหน้าจอ — production เก็บคอลัมน์เดิมไว้ครบ, outsource มี vendor/PO แทน WO
export function buildReportColumns(t, mode) {
  const label = (key) => t(`${I18N_BASE}${key}`)
  const labels = buildReportLabels(t)
  const text = (field, header, extra = {}) => ({
    field,
    header,
    sortable: true,
    minWidth: '150px',
    ...extra
  })

  const head = [
    text('receiptDate', label('colReceiptDate'), { format: 'datetime' }),
    text('stockNumber', label('stockNumber')),
    text('productNumber', label('productNumber')),
    text('productNameEn', label('productNameEn')),
    text('productNameTh', label('productNameTh')),
    text('productTypeName', label('colProductTypeName'))
  ]

  const middle =
    mode === 'outsource'
      ? [
          text('size', label('size')),
          text('mold', label('mold')),
          text('vendor', label('colVendor')),
          text('poNumber', label('colPoNumber')),
          text('location', label('colLocation'))
        ]
      : [
          text('studEarring', label('colStudEarring')),
          text('size', label('size')),
          text('mold', label('mold')),
          text('productionType', label('colProductionType')),
          text('productionTypeSize', label('colProductionTypeSize')),
          text('woText', label('wo')),
          text('location', label('colLocation'))
        ]

  const gold = [
    text('goldType', labels.goldType, { minWidth: '110px' }),
    { ...numberColumn('goldWeight', labels.goldWeight, '100px'), sortable: false, format: 'decimal2' }
  ]

  const tail = [
    { ...numberColumn('qty', labels.qty, '80px'), format: 'number' },
    { ...numberColumn('productPrice', labels.salesPrice, '110px'), format: 'decimal2' },
    text('createBy', label('colCreateBy')),
    text('remark', label('colRemark'))
  ]

  return [...head, ...middle, ...gold, ...stoneColumns(labels), ...tail]
}

// แถว Grand Total สำหรับ footer ของตาราง — คืน cells ที่รวมช่องหน้า (ก่อนคอลัมน์ตัวเลขแรก) เป็น colspan เดียว
export function buildGrandTotalCells(columns, aggregates, label) {
  const firstIndex = columns.findIndex((col) => TOTAL_FIELDS[col.field])
  if (firstIndex < 0) {
    return [{ key: 'label', colspan: columns.length, text: label, align: 'left' }]
  }

  const cells = []
  if (firstIndex > 0) {
    cells.push({ key: 'label', colspan: firstIndex, text: label, align: 'left' })
  }
  columns.slice(firstIndex).forEach((col) => {
    const def = TOTAL_FIELDS[col.field]
    cells.push({
      key: col.field,
      colspan: 1,
      text: def ? formatReportNumber(aggregates?.[def.key], def.decimals) : '',
      align: def ? 'right' : 'left'
    })
  })
  return cells
}

function woText(item) {
  if (item.woText) return item.woText
  return item.wo ? `${item.wo}-${item.woNumber ?? ''}` : ''
}

// แถวข้อมูลแบบ normalize ใช้ร่วมกันใน Excel + PDF
export function buildReportRows(items, mode) {
  return (Array.isArray(items) ? items : []).map((item) => {
    const row = {
      receiptDate: formatDate(item.receiptDate),
      mold: item.mold || '',
      productNumber: item.productNumber || '',
      detail: item.productNameTh || item.productNameEn || '',
      wo: mode === 'outsource' ? '' : woText(item),
      vendor: mode === 'outsource' ? item.vendor || '' : '',
      poNumber: mode === 'outsource' ? item.poNumber || '' : '',
      goldType: item.goldType || '',
      goldWeight: Number(item.goldWeight) || 0,
      qty: Number(item.qty) || 0,
      productPrice: Number(item.productPrice) || 0
    }
    STONE_GROUPS.forEach((group) => {
      row[`${group}Qty`] = Number(item[`${group}Qty`]) || 0
      row[`${group}Weight`] = Number(item[`${group}Weight`]) || 0
    })
    return row
  })
}

export function buildReportTotals(aggregates) {
  const agg = aggregates || {}
  const totals = {
    goldWeight: Number(agg.goldWeight) || 0,
    qty: Number(agg.totalQty) || 0,
    productPrice: Number(agg.totalSales) || 0
  }
  STONE_GROUPS.forEach((group) => {
    totals[`${group}Qty`] = Number(agg[`${group}Qty`]) || 0
    totals[`${group}Weight`] = Number(agg[`${group}Weight`]) || 0
  })
  return totals
}

// แถวสำหรับ ExcelHelper.exportToExcel (key = หัวคอลัมน์) + แถว Grand Total ท้ายตาราง
export function buildExcelRows(items, aggregates, labels, mode) {
  const rows = buildReportRows(items, mode)
  const totals = buildReportTotals(aggregates)

  const toExcel = (row, first) => {
    const out = {
      [labels.receiptDate]: first.receiptDate,
      [labels.mold]: first.mold,
      [labels.productNumber]: first.productNumber,
      [labels.detail]: first.detail
    }
    if (mode === 'outsource') {
      out[labels.vendor] = first.vendor
      out[labels.poNumber] = first.poNumber
    } else {
      out[labels.wo] = first.wo
    }
    out[labels.goldType] = first.goldType
    out[labels.goldWeight] = row.goldWeight
    STONE_GROUPS.forEach((group) => {
      const name = labels.stones[group]
      out[`${name} ${labels.qtyShort}`] = row[`${group}Qty`]
      out[`${name} ${labels.weightShort}`] = row[`${group}Weight`]
    })
    out[labels.qty] = row.qty
    out[labels.salesPrice] = row.productPrice
    return out
  }

  const blank = {
    receiptDate: labels.grandTotal,
    mold: '',
    productNumber: '',
    detail: '',
    wo: '',
    vendor: '',
    poNumber: '',
    goldType: ''
  }

  return [...rows.map((row) => toExcel(row, row)), toExcel(totals, blank)]
}
