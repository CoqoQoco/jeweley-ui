// table-block-helpers.js — pure logic ของ TableBlock/PlanTableBlock
import { toTableColumns, headerSlotColumns } from '../columns.js'

export function buildBlockColumns(columns, t) {
  return toTableColumns(columns, t)
}

export function buildHeaderSlotColumns(columns) {
  return headerSlotColumns(columns)
}

// คลาส CSS ของแถวที่เลือก (selectable) — null/undefined state = ไม่มีแถวไหนถูกเลือก
// selectable: { stateKey, value(row)?, same(stateValue, row)? } — default เก็บ row[dataKey] แล้วเทียบเท่ากัน ·
// ใช้ value/same เมื่อต้องเก็บ object (เช่น { code, deptKey, name }) ใน state
export function isRowSelected(node, ctx, row) {
  if (!node.selectable) return false
  const selected = ctx.state?.[node.selectable.stateKey]
  if (selected === null || selected === undefined) return false
  if (node.selectable.same) return !!node.selectable.same(selected, row)
  return selected === row[node.dataKey || 'key']
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
  const value = node.selectable.value ? node.selectable.value(row) : row?.[node.dataKey || 'key']
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

// ตัวกรองฝั่ง client ใน toolbar (ไม่ยิง request): multiselect{ stateKey, filter(rows, value) } และ toggle{ stateKey, filter(rows, value) }
// กรองต่อเนื่องตามลำดับ multiselect → toggle บนแถวทุกตารางของ block
export function applyToolbarFilters(toolbar, rows, ctx) {
  let result = rows
  ;['multiselect', 'toggle'].forEach((kind) => {
    const config = toolbar?.[kind]
    if (config && typeof config.filter === 'function') result = config.filter(result, ctx.state?.[config.stateKey])
  })
  return result
}
