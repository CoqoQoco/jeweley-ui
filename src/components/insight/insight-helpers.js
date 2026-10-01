// insight-helpers.js — pure logic ใช้ร่วมกันทุก topic tab ของ Production Insight (Revision 2: per-topic tabs)
// ใช้โดย insight-tab-layout.vue / insight-finding-list.vue — ห้าม import Vue/i18n ที่นี่ (component เป็นคน
// inject ฟังก์ชันแปล/เรียก $t เอง เพื่อให้ไฟล์นี้ unit test ได้โดยไม่ต้อง mount component จริง)

export const FINDING_SEVERITIES = ['critical', 'warning', 'info']
export const STATUS_VALUES = ['critical', 'warning', 'ok']

const FINDING_SEVERITY_ICON = {
  critical: 'bi-exclamation-octagon-fill',
  warning: 'bi-exclamation-triangle-fill',
  info: 'bi-check-circle-fill'
}

export function resolveFindingSeverityIcon(severity) {
  return FINDING_SEVERITY_ICON[severity] || FINDING_SEVERITY_ICON.info
}

const STATUS_ICON = {
  critical: 'bi-exclamation-octagon-fill',
  warning: 'bi-exclamation-triangle-fill',
  ok: 'bi-check-circle-fill'
}

export function resolveStatusIcon(status) {
  return STATUS_ICON[status] || STATUS_ICON.ok
}

const STATUS_RANK = { ok: 0, warning: 1, critical: 2 }

// คืน status ที่ "แย่กว่า" ระหว่าง 2 ค่า — ใช้รวม status จากหลายแหล่งให้เหลือ badge เดียว (ค่าว่าง/ไม่รู้จัก
// ถือว่าไม่แย่ไปกว่าอีกค่า)
export function worstStatus(a, b) {
  if (!a) return b || ''
  if (!b) return a || ''
  return (STATUS_RANK[a] ?? 0) >= (STATUS_RANK[b] ?? 0) ? a : b
}

const DEFAULT_MAX_WORKER_NAMES = 3

// รวมชื่อช่างหลายคนเป็นสตริงเดียวฝังใน finding/action text เดียว (เช่น GOLD_REPEAT_OFFENDER/ACT_TALK_WORKER
// ที่รวมช่างหลายคนเป็น finding/action เดียวแทนที่จะแยกทีละคน) — โชว์สูงสุด maxNames คน ที่เหลือสรุปเป็น
// "และอีก N คน" ต่อท้าย (ไม่มี overflow ใช้ "และ" คั่นคนสุดท้ายตามไวยากรณ์ไทยปกติแทน) — count มาจาก API เอง
// (จำนวนจริงทั้งหมด ไม่ใช่แค่ workers.length ที่อาจถูกตัดมาสั้นกว่าแล้วตั้งแต่ response)
export function formatWorkerNameList(workers, count, maxNames = DEFAULT_MAX_WORKER_NAMES) {
  const list = (workers || []).slice(0, maxNames).map((w) => w.workerName).filter(Boolean)
  if (!list.length) return ''
  const remaining = (count ?? (workers || []).length) - list.length
  if (remaining > 0) return `${list.join(', ')} และอีก ${remaining} คน`
  if (list.length === 1) return list[0]
  return `${list.slice(0, -1).join(', ')} และ ${list[list.length - 1]}`
}

// param ตัวเลขที่ชื่อ key ลงท้ายด้วยคำเหล่านี้ (case-sensitive ตรงตัว — กันชนกับ param ชื่อสั้นเดิมของ wip เช่น
// "percent"/"count" ที่ไม่ขึ้นต้นด้วยตัวพิมพ์ใหญ่) ต้องใส่ตัวคั่นหลักพัน/ปัดทศนิยมอัตโนมัติก่อนฝังใน
// finding/action text เสมอ — ตาราง/การ์ด KPI จัด format ค่าเองอยู่แล้วคนละจุด ไม่เกี่ยวกับฟังก์ชันนี้
const NUMERIC_SUFFIX_MAX_FRACTION_DIGITS = {
  Money: 0,
  Gram: 2,
  Percent: 2
}

function formatThaiNumber(value, maximumFractionDigits) {
  return new Intl.NumberFormat('th-TH', { maximumFractionDigits }).format(value)
}

function applyNumericSuffixFormatting(resolved) {
  Object.keys(resolved).forEach((key) => {
    const value = resolved[key]
    if (typeof value !== 'number') return
    const suffix = Object.keys(NUMERIC_SUFFIX_MAX_FRACTION_DIGITS).find((s) => key.endsWith(s))
    if (suffix) resolved[key] = formatThaiNumber(value, NUMERIC_SUFFIX_MAX_FRACTION_DIGITS[suffix])
  })
  return resolved
}

// เตรียม params ก่อนส่งเข้า $t() — resolve deptKey/workerType/metal (ถ้ามี) เป็นชื่อที่แปลแล้ว ผ่าน
// translateDept/translateWorkerType/translateMetal ที่ caller (component) ส่งมา (เช่น
// key => this.$t('view.executive.department.' + key)) รวม workers[] (ถ้ามี) เป็นสตริงรายชื่อเดียว
// (maxWorkerNames ต่าง code กันได้ เช่น ACT_TALK_WORKER โชว์ได้ถึง 5 คน ส่วน finding ทั่วไปโชว์แค่ 3) แล้วใส่
// ตัวคั่นหลักพัน/ปัดทศนิยมให้ param ที่ชื่อลงท้าย Money/Gram/Percent อัตโนมัติ — ค่า param อื่น (count/days/...)
// ปล่อยผ่านตรงๆ
export function resolveFindingParams(params, translateDept, translateWorkerType, translateMetal, maxWorkerNames = DEFAULT_MAX_WORKER_NAMES) {
  if (!params) return {}
  const resolved = { ...params }
  if (resolved.deptKey !== undefined && typeof translateDept === 'function') {
    resolved.deptKey = translateDept(resolved.deptKey)
  }
  if (resolved.workerType !== undefined && typeof translateWorkerType === 'function') {
    resolved.workerType = translateWorkerType(resolved.workerType)
  }
  if (resolved.metal !== undefined && typeof translateMetal === 'function') {
    resolved.metal = translateMetal(resolved.metal)
  }
  if (resolved.workers !== undefined) {
    resolved.workers = formatWorkerNameList(resolved.workers, resolved.count, maxWorkerNames)
  }
  return applyNumericSuffixFormatting(resolved)
}

// key เสถียรสำหรับ v-for — รวม code + params กันชนกันเมื่อ code เดียวกันเกิดซ้ำหลายแถว (เช่น
// WIP_DEPT_STALE_TOP อาจมีได้มากกว่า 1 แผนกในอนาคต)
export function buildFindingKey(code, params) {
  return `${code}:${JSON.stringify(params || {})}`
}

export function formatInsightNumber(value) {
  return new Intl.NumberFormat('th-TH').format(value || 0)
}

export function formatInsightPercent(value) {
  return `${new Intl.NumberFormat('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 1 }).format(value || 0)}%`
}

// code -> i18n key ของคำอธิบาย ("วิธีคำนวณ/เกณฑ์ด่วน" ต่อ finding) ใต้ namespace view.productionInsight.help
// — ไม่ใช่ทุก code จะมีคำอธิบาย (เช่น code ชั่วคราวของหมวด placeholder) คืนค่าว่างเมื่อไม่มี ให้ caller
// ไม่ render ไอคอน ⓘ เลย (กัน vue-i18n โชว์ key ดิบเวลาไม่เจอคำแปล)
const HELP_KEY_CODES = new Set([
  'WIP_STALE',
  'WIP_OVERDUE',
  'WIP_DEPT_STALE_TOP',
  'WIP_MELTED_OPEN',
  'WIP_DEPT_GROWING',
  'FC_BECOMING_STALE',
  'FC_DUE_SOON_AT_RISK',
  'FC_BOTTLENECK',
  'STAGE_OVER_STANDARD',
  'STAGE_ABNORMAL_DWELL',
  'STAGE_WAIT_DOMINANT',
  'FC_STAGE_LEADTIME_RISING',
  'DLV_ONTIME_BELOW_TARGET',
  'DLV_LEAD_UNDERESTIMATED',
  'DLV_OPEN_OVERDUE',
  'DLV_STUCK_AFTER_COSTCARD',
  'FC_DLV_AT_RISK',
  'FC_DLV_ONTIME_DECLINING',
  'GOLD_EXCESS_OVER_ALLOWANCE',
  'GOLD_LOSS_ABOVE_TARGET',
  'GOLD_ALLOWANCE_ABOVE_TARGET',
  'GOLD_MOST_WORKERS_OVER',
  'GOLD_REPEAT_OFFENDER',
  'GOLD_SLIP_COVERAGE_LOW',
  'FC_GOLD_EXCESS_PROJECTED',
  'FC_GOLD_LOSS_RISING'
])

export function resolveHelpKey(code) {
  return HELP_KEY_CODES.has(code) ? `view.productionInsight.help.${code}` : ''
}
