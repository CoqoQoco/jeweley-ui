// columns.js — column library ของ InsightPage (TableBlock/PlanTableBlock) — แต่ละ factory คืน "column definition"
// (plain object) ที่ ColumnCell.vue เรนเดอร์ และ toTableColumns() แปลงเป็น columns ของ DataTableWithPaging
// ทุก column รองรับ `tip` (i18n key) → หัวคอลัมน์ขึ้นไอคอน ⓘ — ห้าม import Vue/i18n ที่นี่ (t ส่งเข้ามาเป็น param)
//
// ใช้ซ้ำ helper เดิม (wip-plan-table-helpers / wip-lead-time-helpers) ไม่เขียน logic ซ้ำ
import { formatDate } from '@/services/utils/dayjs.js'
import { resolveStatusLine, buildLastActionLine, resolvePlanWorkersDisplay } from '@/components/insight/plan-table-helpers.js'
import { calcWaitWorkShare, resolveStandardChipColorToken } from '@/components/insight/lead-time-helpers.js'

export const COLUMN_KINDS = ['planLink', 'text', 'product', 'dept', 'workers', 'lastUpdate', 'date', 'number', 'percent', 'chip', 'chipList', 'stacked', 'sparkline', 'shareBar']

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
// chipList: หลายบรรทัดต่อ 1 เซลล์ (ป้าย + ชิปสถานะต่อบรรทัด) — items(row, ctx, t) → [{ label, chipText, variant }]
// variant 'green'|'warning'|'grey' (ชิปสีตาม token) · ไม่มีรายการ = '—'
export const chipList = (field, header, itemsFn, o = {}) => ({ kind: 'chipList', field, header, items: itemsFn, minWidth: '200px', ...o })
// stacked: 2 บรรทัดในเซลล์ (หลัก + รอง) — lines(row) → { primary, secondary } · strong = ตัวหลักตัวหนา
export const stacked = (field, header, linesFn, o = {}) => ({ kind: 'stacked', field, header, lines: linesFn, strong: true, minWidth: '150px', ...o })
export const sparkline = (field, header, valuesFn, o = {}) => ({ kind: 'sparkline', field, header, values: valuesFn, minWidth: '100px', ...o })
export const text = (field, header, o = {}) => ({ kind: 'text', field, header, minWidth: '110px', ...o })
export const shareBar = (field, header, o = {}) => ({ kind: 'shareBar', field, header, minWidth: '90px', ...o })

// ---- table columns ----

export function needsHeaderSlot(col) {
  return !!col.tip
}

// columns ของ DataTableWithPaging — คอลัมน์ที่มี tip ต้องเคลียร์ header เป็น '' (หัวโชว์ผ่าน slot #header-<field> แทน
// ไม่งั้นหัวขึ้นซ้ำ 2 จุด — กับดักเดิมของ BaseDataTable)
export function toTableColumns(cols, t, ctx) {
  return (cols || []).map((col) => ({
    field: col.field,
    header: needsHeaderSlot(col) ? '' : resolveHeader(col, t, ctx),
    sortable: false,
    minWidth: col.minWidth,
    align: col.align
  }))
}

// header = i18n key หรือ function(t, ctx) (เช่นหัวที่ประกอบจาก 2 key: "รอ / ทำ")
export function resolveHeader(col, t, ctx) {
  if (typeof col.header === 'function') return col.header(t, ctx)
  return col.header ? t(col.header) : ''
}

// tip ของหัวคอลัมน์ = i18n key หรือ function(ctx, t) (ข้อความที่ขึ้นกับ filter)
export function resolveTipText(col, ctx, t) {
  return typeof col.tip === 'function' ? col.tip(ctx, t) : t(col.tip)
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

export function formatPercentValue(value, digits = 2) {
  if (value === null || value === undefined) return null
  return `${new Intl.NumberFormat('th-TH', { maximumFractionDigits: digits }).format(value)}%`
}

// row.label (ถ้ามี — เช่น แถว "รวม" ของตารางพัฒนาการ หรือแถวที่ config แปลชื่อแผนกไว้แล้ว) ชนะการแปล department.*
export function resolveDeptLabel(row, col, t) {
  if (row.label) return row.label
  const key = (col.keyFields || ['departmentKey']).map((f) => row[f]).find(Boolean)
  return key ? t(`view.executive.department.${key}`) : ''
}

// คืน object บอกว่า cell ต้องแสดงอะไร — ColumnCell.vue แค่ map เป็น template
export function resolveCell(col, row, t, ctx) {
  // altText(row, t): string = แสดงข้อความนี้แทนค่า (เช่น "ไม่ได้ชั่งน้ำหนัก"; '' = เซลล์ว่าง) · null/undefined = แสดงค่าปกติ
  if (col.altText) {
    const alt = col.altText(row, t)
    if (alt !== null && alt !== undefined) return { kind: 'note', text: alt }
  }
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
        // bold = true หรือ fn(row) (เน้นเฉพาะแถวที่เข้าเงื่อนไข) · sup = ตัวยกกำกับท้ายค่า (เช่น "s")
        bold: !missing && (typeof col.bold === 'function' ? !!col.bold(row) : !!col.bold),
        sup: !missing && col.sup ? col.sup(row) : '',
        badgeTone: col.badgeTone || 'warning',
        tip: missing && col.nullTip ? resolveColText(col.nullTip, row, t, ctx) : '',
        suffix: !missing && col.suffix ? col.suffix(row, t) : '',
        badge: col.badge ? col.badge(row, t, ctx) : '',
        // emphasisWhen(raw,row) เน้นค่า (แดง+หนา) เมื่อเงื่อนไขเป็นจริง · negativeClass = เน้นเมื่อค่าติดลบ
        negative: !missing && (col.emphasisWhen ? !!col.emphasisWhen(raw, row) : !!col.negativeClass && raw < 0),
        asAction: !missing && !!col.onClick && (col.actionWhen ? col.actionWhen(row, raw) : raw > 0)
      }
    }
    case 'percent':
      return {
        kind: 'percent',
        text: formatPercentValue(readValue(col, row), col.digits ?? 2) ?? '—',
        color: col.color ? col.color(row) : '',
        bold: typeof col.bold === 'function' ? !!col.bold(row) : !!col.bold
      }
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
      const color = col.color ? col.color(variant, row) : resolveStandardChipColorToken(variant)
      return { kind: 'chip', text: col.text ? col.text(row, t) : '', color, borderColor: col.borderColor ? col.borderColor(variant, row) : color }
    }
    case 'stacked': {
      const lines = col.lines(row) || {}
      // lines.primaryIcon (bi-*) + lines.muted = บรรทัดหลักแบบจาง/เอียงนำด้วยไอคอน (เช่น แถวคิวที่ยังไม่มีช่างรับ)
      // onClick/actionWhen เหมือนเซลล์ข้อความ: บรรทัดหลักเป็นปุ่มกดได้ (บรรทัดรองยังเป็นข้อความ)
      const asAction = !!col.onClick && (col.actionWhen ? col.actionWhen(row, ctx) : true)
      return { kind: 'stacked', primary: lines.primary ?? '', secondary: lines.secondary ?? '', strong: !!col.strong, primaryIcon: lines.primaryIcon || '', muted: !!lines.muted, asAction }
    }
    case 'chipList': {
      const lines = (col.items ? col.items(row, ctx, t) : []) || []
      return { kind: 'chipList', lines, small: !!col.small }
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
      // render(row, t) = ข้อความที่ประกอบเอง (เช่น ชื่อหน่วยที่แปลแล้ว) แทนการอ่านค่าตรงๆ
      // secondary(row) = ข้อความรองตัวเล็กต่อท้ายในบรรทัดเดียวกัน · cellTip(row, t) = ไอคอน ⓘ ต่อท้ายค่า · strong = ตัวหนา
      const extras = {}
      const secondary = col.secondary ? col.secondary(row) : ''
      const tip = col.cellTip ? col.cellTip(row, t) : ''
      if (secondary) extras.secondary = secondary
      if (tip) extras.tip = tip
      if (col.strong) extras.strong = true
      // onClick(row, ctx) = เซลล์ข้อความเป็นปุ่มกดได้ (เข้าถึงด้วยคีย์บอร์ดได้ ต่างจากคลิกแถว) · actionWhen(row, ctx) กำหนดว่าแถวไหนกดได้ (default ทุกแถว)
      if (col.onClick && (col.actionWhen ? col.actionWhen(row, ctx) : true)) extras.asAction = true
      if (col.render) return { kind: 'text', text: col.render(row, t), ...extras }
      const raw = readValue(col, row)
      return { kind: 'text', text: raw === null || raw === undefined || raw === '' ? col.nullAs ?? '' : String(raw), ...extras }
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
