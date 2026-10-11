// table-block-helpers.js — pure logic ของ TableBlock/PlanTableBlock
import { toTableColumns, headerSlotColumns } from '../columns.js'

export function buildBlockColumns(columns, t) {
  return toTableColumns(columns, t)
}

export function buildHeaderSlotColumns(columns) {
  return headerSlotColumns(columns)
}

// คลาส CSS ของแถวที่เลือก (selectable) — null/undefined state = ไม่มีแถวไหนถูกเลือก
export function isRowSelected(node, ctx, row) {
  if (!node.selectable) return false
  const selected = ctx.state?.[node.selectable.stateKey]
  return selected !== null && selected !== undefined && selected === row[node.dataKey || 'key']
}

// คลาส highlight ต่อเซลล์ — config.highlight(row, col, ctx) → true/คืนชื่อคลาส
export function resolveCellHighlight(node, row, col, ctx) {
  if (typeof node.highlight !== 'function') return ''
  const result = node.highlight(row, col, ctx)
  if (!result) return ''
  return typeof result === 'string' ? result : 'insight-table__cell--emphasis'
}

// ผล row-click → { stateKey, value } ที่ต้องตั้ง (null = ไม่ต้องทำอะไร)
export function resolveRowSelection(node, event) {
  if (!node.selectable) return null
  const row = event?.data
  const value = row?.[node.dataKey || 'key']
  if (value === undefined || value === null) return null
  return { stateKey: node.selectable.stateKey, value }
}

// ชื่อ slot ของ DataTableWithPaging
export const cellSlotName = (col) => `${col.field}Template`
export const headerSlotName = (col) => `header-${col.field}`

// block เดียวมีได้หลายส่วนในกรอบเดียวกัน: sections[] ของ { kind:'table', rows, columns, dataKey } หรือ
// { kind:'text', text(ctx,t), tone:'note'|'subtitle'|'plain' } — ไม่ประกาศ sections = ตารางเดียวจาก rows/columns ของ node
export function resolveTableSections(node) {
  if (node.sections) return node.sections.map((section) => ({ kind: 'table', ...section }))
  return [{ kind: 'table', rows: node.rows, columns: node.columns, dataKey: node.dataKey }]
}
