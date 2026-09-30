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

// เตรียม params ก่อนส่งเข้า $t() — resolve deptKey (ถ้ามี) เป็นชื่อแผนกที่แปลแล้ว ผ่าน translateDept ที่
// caller (component) ส่งมา (เช่น key => this.$t('view.executive.department.' + key)) — ค่า param อื่น
// (count/percent/days/...) ปล่อยผ่านตรงๆ เพราะเป็นตัวเลข/ข้อความสำเร็จรูปจาก API อยู่แล้ว
export function resolveFindingParams(params, translateDept) {
  if (!params) return {}
  const resolved = { ...params }
  if (resolved.deptKey !== undefined && typeof translateDept === 'function') {
    resolved.deptKey = translateDept(resolved.deptKey)
  }
  return resolved
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
  'FC_STAGE_LEADTIME_RISING'
])

export function resolveHelpKey(code) {
  return HELP_KEY_CODES.has(code) ? `view.productionInsight.help.${code}` : ''
}
