// columns.js — column library ของ InsightPage (TableBlock/PlanTableBlock) — แต่ละ factory คืน "column definition"
// (plain object) ที่ ColumnCell.vue เรนเดอร์ และ toTableColumns() แปลงเป็น columns ของ DataTableWithPaging
// ทุก column รองรับ `tip` (i18n key) → หัวคอลัมน์ขึ้นไอคอน ⓘ — ห้าม import Vue/i18n ที่นี่ (t ส่งเข้ามาเป็น param)
//
// ใช้ซ้ำ helper เดิม (wip-plan-table-helpers / wip-lead-time-helpers) ไม่เขียน logic ซ้ำ
import { formatDate } from '@/services/utils/dayjs.js'
import { resolveStatusLine, buildLastActionLine, resolvePlanWorkersDisplay } from '@/components/insight/plan-table-helpers.js'
import { calcWaitWorkShare, resolveStandardChipColorToken } from '@/components/insight/lead-time-helpers.js'

export const COLUMN_KINDS = ['planLink', 'text', 'product', 'dept', 'workers', 'lastUpdate', 'date', 'number', 'percent', 'chip', 'sparkline', 'shareBar']

const EXEC = 'view.executive.production'
const INSIGHT_WIP = 'view.productionInsight.wip'
const HELP = 'view.productionInsight.help'

// ---- factory ----

export const planLink = (o = {}) => ({ kind: 'planLink', field: 'wo', header: `${EXEC}.colWo`, minWidth: '130px', ...o })
export const mold = (o = {}) => ({ kind: 'text', field: 'mold', header: `${EXEC}.colMold`, minWidth: '110px', ...o })
export const product = (o = {}) => ({ kind: 'product', field: 'product', header: `${EXEC}.colProduct`, minWidth: '160px', ...o })
// dept: keyFields = field ของแถวที่เก็บ deptKey (ตามลำดับ) · withStatus = บรรทัดที่ 2 แสดง statusName ถ้าไม่ซ้ำชื่อแผนก
export const dept = (o = {}) => ({ kind: 'dept', field: 'department', header: `${EXEC}.colDepartment`, minWidth: '140px', keyFields: ['departmentKey'], withStatus: true, ...o })
export const workers = (o = {}) => ({
  kind: 'workers',
  field: 'workers',
  header: `${INSIGHT_WIP}.colWorkers`,
  tip: `${HELP}.staleColWorkers`,
  minWidth: '140px',
  ...o
})
export const lastUpdate = (o = {}) => ({
  kind: 'lastUpdate',
  field: 'lastAction',
  header: `${INSIGHT_WIP}.colLastAction`,
  tip: `${HELP}.staleColLastAction`,
  createdFallback: `${INSIGHT_WIP}.lastActionCreated`,
  minWidth: '160px',
  ...o
})
export const date = (field, header, o = {}) => ({ kind: 'date', field, header, minWidth: '110px', ...o })
export const days = (field, header, o = {}) => ({ kind: 'number', field, header, format: 'count', align: 'right', minWidth: '80px', ...o })
export const number = (field, header, format = 'count', o = {}) => ({ kind: 'number', field, header, format, align: 'right', minWidth: '90px', ...o })
export const percent = (field, header, o = {}) => ({ kind: 'percent', field, header, align: 'right', minWidth: '80px', ...o })
export const chip = (field, header, variantFn, textFn, o = {}) => ({ kind: 'chip', field, header, variant: variantFn, text: textFn, minWidth: '100px', ...o })
export const sparkline = (field, header, valuesFn, o = {}) => ({ kind: 'sparkline', field, header, values: valuesFn, minWidth: '100px', ...o })
export const text = (field, header, o = {}) => ({ kind: 'text', field, header, minWidth: '110px', ...o })
export const shareBar = (field, header, o = {}) => ({ kind: 'shareBar', field, header, minWidth: '90px', ...o })

// ---- table columns ----

export function needsHeaderSlot(col) {
  return !!col.tip
}

// columns ของ DataTableWithPaging — คอลัมน์ที่มี tip ต้องเคลียร์ header เป็น '' (หัวโชว์ผ่าน slot #header-<field> แทน
// ไม่งั้นหัวขึ้นซ้ำ 2 จุด — กับดักเดิมของ BaseDataTable)
export function toTableColumns(cols, t) {
  return (cols || []).map((col) => ({
    field: col.field,
    header: needsHeaderSlot(col) ? '' : resolveHeader(col, t),
    sortable: false,
    minWidth: col.minWidth,
    align: col.align
  }))
}

// header = i18n key หรือ function(t) (เช่นหัวที่ประกอบจาก 2 key: "รอ / ทำ")
export function resolveHeader(col, t) {
  if (typeof col.header === 'function') return col.header(t)
  return col.header ? t(col.header) : ''
}

export function headerSlotColumns(cols) {
  return (cols || []).filter(needsHeaderSlot)
}

// ---- cell resolution (pure) ----

export function getByPath(row, path) {
  if (!path) return undefined
  return String(path)
    .split('.')
    .reduce((obj, key) => (obj == null ? undefined : obj[key]), row)
}

export function readValue(col, row) {
  return typeof col.value === 'function' ? col.value(row) : getByPath(row, col.path || col.field)
}

const NUMBER_FORMATS = {
  count: { maximumFractionDigits: 0 },
  decimal: { maximumFractionDigits: 2 },
  days: { maximumFractionDigits: 1 }
}

export function formatNumberValue(value, format = 'count') {
  if (value === null || value === undefined || Number.isNaN(value)) return null
  if (format === 'signed') {
    if (!value) return '± 0'
    return `${value > 0 ? '+' : '−'}${new Intl.NumberFormat('th-TH').format(Math.abs(value))}`
  }
  return new Intl.NumberFormat('th-TH', NUMBER_FORMATS[format] || NUMBER_FORMATS.count).format(value)
}

export function formatPercentValue(value) {
  if (value === null || value === undefined) return null
  return `${new Intl.NumberFormat('th-TH', { maximumFractionDigits: 2 }).format(value)}%`
}

// row.label (ถ้ามี — เช่น แถว "รวม" ของตารางพัฒนาการ หรือแถวที่ config แปลชื่อแผนกไว้แล้ว) ชนะการแปล department.*
export function resolveDeptLabel(row, col, t) {
  if (row.label) return row.label
  const key = (col.keyFields || ['departmentKey']).map((f) => row[f]).find(Boolean)
  return key ? t(`view.executive.department.${key}`) : ''
}

// คืน object บอกว่า cell ต้องแสดงอะไร — ColumnCell.vue แค่ map เป็น template
export function resolveCell(col, row, t, ctx) {
  switch (col.kind) {
    case 'number': {
      const raw = readValue(col, row)
      const formatted = formatNumberValue(raw, col.format)
      const missing = formatted === null
      const fallback = col.nullAs ?? '—'
      return {
        kind: 'number',
        text: missing ? String(fallback) : withUnit(col.display ? col.display(row, t, raw) : formatted, col, t),
        color: !missing && col.color ? col.color(row) : '',
        badgeTone: col.badgeTone || 'warning',
        tip: missing && col.nullTip ? resolveColText(col.nullTip, row, t, ctx) : '',
        suffix: !missing && col.suffix ? col.suffix(row, t) : '',
        badge: col.badge ? col.badge(row, t, ctx) : '',
        negative: !missing && col.negativeClass && raw < 0,
        asAction: !missing && !!col.onClick && (col.actionWhen ? col.actionWhen(row, raw) : raw > 0)
      }
    }
    case 'percent':
      return { kind: 'percent', text: formatPercentValue(readValue(col, row)) ?? '—' }
    case 'date': {
      const raw = readValue(col, row)
      return { kind: 'date', text: raw ? formatDate(raw) : col.nullAs ?? '—' }
    }
    case 'product':
      return { kind: 'product', primary: row.productNumber || '', secondary: row.productName || '' }
    case 'dept': {
      const label = resolveDeptLabel(row, col, t) || (col.keyFields || []).map((f) => row[f]).find(Boolean) || ''
      return { kind: 'dept', text: label, sub: col.withStatus ? resolveStatusLine(label, row.statusName) : '' }
    }
    case 'lastUpdate':
      return {
        kind: 'lastUpdate',
        text: row.lastActionDate ? formatDate(row.lastActionDate) : '—',
        sub: buildLastActionLine(row.lastUpdateBy, row.lastAction, t(col.createdFallback)),
        title: row.lastActionRemark || ''
      }
    case 'chip': {
      const variant = col.variant ? col.variant(row) : 'pass'
      return { kind: 'chip', text: col.text ? col.text(row, t) : '', color: col.color ? col.color(variant, row) : resolveStandardChipColorToken(variant) }
    }
    case 'shareBar': {
      const share = calcWaitWorkShare(col.wait(row), col.work(row))
      return {
        kind: 'shareBar',
        hasData: share.hasData,
        waitPercent: share.waitPercent,
        workPercent: share.workPercent,
        title: share.hasData ? `${t(col.waitLabel)} ${share.waitPercent}% / ${t(col.workLabel)} ${share.workPercent}%` : '',
        tip: !share.hasData && col.nullTip ? resolveColText(col.nullTip, row, t, ctx) : ''
      }
    }
    case 'sparkline':
      return { kind: 'sparkline', values: col.values(row) || [] }
    case 'workers':
      return { kind: 'workers', display: resolvePlanWorkersDisplay(row) }
    case 'planLink':
      return { kind: 'planLink', label: row.woText || row.woNumber || row.wo || '' }
    default: {
      const raw = readValue(col, row)
      return { kind: 'text', text: raw === null || raw === undefined || raw === '' ? col.nullAs ?? '' : String(raw) }
    }
  }
}

// col.unit (i18n key เช่น "วัน") ต่อท้ายค่าที่มีข้อมูลเท่านั้น (ค่าว่างไม่ต่อหน่วย)
function withUnit(text, col, t) {
  return col.unit ? `${text} ${t(col.unit)}` : text
}

function resolveColText(spec, row, t, ctx) {
  return typeof spec === 'function' ? spec(row, t, ctx) : t(spec)
}
