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

// ป้ายของช่าง 1 คนในลิสต์ — รองรับ 3 รูปแบบ: สตริงชื่อดิบ (เช่น workerNames[] ของ ACT_CROSS_TRAIN), object
// {workerName} (ชื่อ field เดิมของ wip/gold/capacity), object {name} (ชื่อ field ของหมวด "ช่างและค่าแรง" —
// ยืนยันจาก API agent 2026-10-01 ว่า workers[]/concentration[].topWorkers[] ใช้ชื่อ field `name` ไม่ใช่
// `workerName`) — มี wagePerJob+medianPerJob ครบคู่ (เฉพาะ WRK_RATE_OUTLIER/ACT_REVIEW_RATE) ต่อท้ายเป็น
// "{ชื่อ} {ค่าแรง} ฿/งาน (ค่ากลาง {ค่ากลาง})" ตามตัวอย่างที่ API agent ให้ไว้ตรงๆ ("หนิง 1,290 ฿/งาน (ค่ากลาง 145)")
function formatWorkerEntryLabel(worker) {
  if (typeof worker === 'string') return worker
  const name = worker?.workerName ?? worker?.name ?? ''
  if (!name) return ''
  if (worker.wagePerJob != null && worker.medianPerJob != null) {
    return `${name} ${formatThaiNumber(worker.wagePerJob, 0)} ฿/งาน (ค่ากลาง ${formatThaiNumber(worker.medianPerJob, 0)})`
  }
  return name
}

// รวมชื่อช่างหลายคนเป็นสตริงเดียวฝังใน finding/action text เดียว (เช่น GOLD_REPEAT_OFFENDER/ACT_TALK_WORKER
// ที่รวมช่างหลายคนเป็น finding/action เดียวแทนที่จะแยกทีละคน) — โชว์สูงสุด maxNames คน ที่เหลือสรุปเป็น
// "และอีก N คน" ต่อท้าย (ไม่มี overflow ใช้ "และ" คั่นคนสุดท้ายตามไวยากรณ์ไทยปกติแทน) — count มาจาก API เอง
// (จำนวนจริงทั้งหมด ไม่ใช่แค่ workers.length ที่อาจถูกตัดมาสั้นกว่าแล้วตั้งแต่ response) — รับได้ทั้ง array ของ
// object (workers[]) หรือ array ของสตริงชื่อดิบ (workerNames[]) ผ่าน formatWorkerEntryLabel
export function formatWorkerNameList(workers, count, maxNames = DEFAULT_MAX_WORKER_NAMES) {
  const list = (workers || []).slice(0, maxNames).map(formatWorkerEntryLabel).filter(Boolean)
  if (!list.length) return ''
  const remaining = (count ?? (workers || []).length) - list.length
  if (remaining > 0) return `${list.join(', ')} และอีก ${remaining} คน`
  if (list.length === 1) return list[0]
  return `${list.slice(0, -1).join(', ')} และ ${list[list.length - 1]}`
}

// รวมแผนกคอขวดหลายแผนก (CAP_QUEUE_BOTTLENECK.depts[] ของหมวด "กำลังการผลิต") เป็นสตริงเดียวฝังใน finding
// text — API ส่งมาตัดเหลือ top 2 แล้ว (ไม่ต้องตัดซ้ำฝั่งนี้เหมือน workers[]) รูปแบบต่อแผนก: "{ชื่อแผนก} ~{คิว
// เทียบเท่า} วัน (รอ {งานรออยู่} ใบ)" ตามตัวอย่างที่ API agent ให้ไว้ตรงๆ
export function formatDeptQueueList(depts, translateDept) {
  const list = (depts || []).filter(Boolean)
  if (!list.length) return ''
  return list
    .map((d) => {
      const name = typeof translateDept === 'function' ? translateDept(d.deptKey) : d.deptKey
      const days = d.queueDays != null ? formatThaiNumber(d.queueDays, 0) : '—'
      const waiting = d.waitingNow != null ? formatThaiNumber(d.waitingNow, 0) : '—'
      return `${name} ~${days} วัน (รอ ${waiting} ใบ)`
    })
    .join(', ')
}

const THAI_MONTH_ABBR = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']

// "2026-06" -> "มิ.ย. 2026" (ปี ค.ศ. ตรงๆ ไม่แปลงเป็น พ.ศ. — Intl.DateTimeFormat('th-TH') เริ่มต้นจะแปลงเป็น
// พ.ศ. ให้อัตโนมัติซึ่งไม่ตรงกับตัวอย่างที่ API agent ให้ไว้) — ค่าที่ parse ไม่ได้คืนค่าเดิมกลับไปเฉยๆ
export function formatThaiMonthYear(yyyyMm) {
  const match = typeof yyyyMm === 'string' ? /^(\d{4})-(\d{2})$/.exec(yyyyMm) : null
  if (!match) return yyyyMm
  const [, year, month] = match
  const index = Number(month) - 1
  if (index < 0 || index > 11) return yyyyMm
  return `${THAI_MONTH_ABBR[index]} ${year}`
}

// ชื่อเดือนไทยย่อของ Date ตัวเดียว (internal, ไม่ export) — คืนค่าว่างเมื่อ parse ไม่ได้
function thaiMonthAbbrOf(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return THAI_MONTH_ABBR[d.getMonth()]
}

// bucketEnds (array ของ string/Date ที่ `new Date()` parse ได้ เรียงตามลำดับเวลาเดิม) -> array ชื่อเดือนไทยย่อ
// เท่าความยาวเดิม — ใช้เป็น label แกน x ของกราฟรายเดือนทุกจุดในหมวด "กำลังการผลิต"/"ทองและ Loss" แทนรูปแบบ
// วัน/เดือนเดิม (`02-digit day + 02-digit month`)
//
// ⚠️ ต้องรับ "ทั้ง array" ไม่ใช่ bucketEnd ทีละจุด — เพราะ bucketEnd จาก API เป็น exclusive boundary (วันที่ 1
// ของเดือนถัดไป) การอ่านเดือนของแต่ละจุดต้องอิง bucketEnd ของ "จุดก่อนหน้า" (= จุดเริ่มของ bucket นี้จริงๆ) ไม่
// ใช่ลบ 1 วันจาก bucketEnd ของตัวเอง — วิธีลบ 1 วันใช้ได้กับ bucket เต็มเดือนทั่วไปเท่านั้น แต่พังกับ bucket
// สุดท้ายที่เป็นช่วงไม่เต็มเดือน (เช่น ถูกตัดที่วันนี้ = วันที่ 1 ของเดือนใหม่พอดี) เพราะ bucketEnd ของมันจะดัน
// ไปตรงกับ exclusive end ของเดือนก่อนหน้าโดยบังเอิญ ทำให้ได้ป้ายซ้ำกัน (ตัวอย่างจริงที่เจอบน prod: ช่วง 6
// เดือน จุดสุดท้ายตัดที่วันที่ 1 ตุลาคม ได้ป้าย "ก.ย. | ก.ย." ซ้ำกันทั้งคู่) — ใช้ bucketEnd ของจุดก่อนหน้าเป็น
// จุดเริ่มแทน ทำให้จุดสุดท้ายได้ป้ายเป็นเดือนของตัวเอง ("ต.ค.") แยกจากจุดก่อนหน้าอย่างถูกต้อง — จุดแรกไม่มีจุด
// ก่อนหน้าให้อิง จึงลบ 1 วันจาก bucketEnd ของตัวเอง (ใช้ได้แม่นยำเพราะจุดแรกมักเป็น bucket เต็มเดือนเสมอ) — ปี
// ไม่ใส่กำกับเพราะช่วงที่ดูมักไม่ข้ามปี (การ์ด/กราฟที่ต้องกำกับปีมี formatThaiMonthYear แยกอยู่แล้ว)
export function formatBucketMonthLabels(bucketEnds) {
  const list = bucketEnds || []
  return list.map((bucketEnd, index) => {
    if (index === 0) {
      if (!bucketEnd) return ''
      const end = new Date(bucketEnd)
      if (Number.isNaN(end.getTime())) return ''
      return thaiMonthAbbrOf(new Date(end.getTime() - 86400000))
    }
    return thaiMonthAbbrOf(list[index - 1])
  })
}

// param ตัวเลขที่ชื่อ key ลงท้ายด้วยคำเหล่านี้ (case-sensitive ตรงตัว — กันชนกับ param ชื่อสั้นเดิมของ wip เช่น
// "percent"/"count" ที่ไม่ขึ้นต้นด้วยตัวพิมพ์ใหญ่) ต้องใส่ตัวคั่นหลักพัน/ปัดทศนิยมอัตโนมัติก่อนฝังใน
// finding/action text เสมอ — ตาราง/การ์ด KPI จัด format ค่าเองอยู่แล้วคนละจุด ไม่เกี่ยวกับฟังก์ชันนี้
const NUMERIC_SUFFIX_MAX_FRACTION_DIGITS = {
  Money: 0,
  Gram: 2,
  Percent: 2,
  // Wages (FC_WAGES_NEXT_MONTH.projectedWages/avgWages ของหมวด "ช่างและค่าแรง") จัดรูปแบบเหมือน Money เป๊ะ
  // (ไม่มีทศนิยม มีตัวคั่นหลักพัน) — ชื่อ param ไม่ได้ลงท้าย Money ตรงๆ เพราะ API agent ตั้งชื่อมาแบบนี้
  Wages: 0
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

// เตรียม params ก่อนส่งเข้า $t() — resolve deptKey/topDeptKey/workerType/metal (ถ้ามี) เป็นชื่อที่แปลแล้ว ผ่าน
// translateDept/translateWorkerType/translateMetal ที่ caller (component) ส่งมา (เช่น
// key => this.$t('view.executive.department.' + key)) — deptKey/topDeptKey ใช้ translator ตัวเดียวกัน
// (translateDept ต้องแยกแยะเองว่าเป็น string key ของ wip หรือรหัสตัวเลขของ gold stage) รวม workers[] (ถ้ามี) เป็นสตริงรายชื่อเดียว
// (maxWorkerNames ต่าง code กันได้ เช่น ACT_TALK_WORKER โชว์ได้ถึง 5 คน ส่วน finding ทั่วไปโชว์แค่ 3) แล้วใส่
// ตัวคั่นหลักพัน/ปัดทศนิยมให้ param ที่ชื่อลงท้าย Money/Gram/Percent อัตโนมัติ — ค่า param อื่น (count/days/...)
// ปล่อยผ่านตรงๆ
export function resolveFindingParams(params, translateDept, translateWorkerType, translateMetal, maxWorkerNames = DEFAULT_MAX_WORKER_NAMES) {
  if (!params) return {}
  const resolved = { ...params }
  if (resolved.deptKey !== undefined && typeof translateDept === 'function') {
    resolved.deptKey = translateDept(resolved.deptKey)
  }
  // topDeptKey (GOLD_STAGE_PENDING_RETURN) ใช้ translator ตัวเดียวกับ deptKey เป๊ะ (ตามที่ API agent สั่ง
  // "extend the resolver to *DeptKey / topDeptKey") — translateDept ที่ caller ส่งมาต้องแยกแยะเองว่าเป็น
  // deptKey ตัวหนังสือของ wip (string) หรือรหัสแผนกตัวเลขของ gold stage (number) — ดู
  // insight-tab-layout.vue translateDept
  if (resolved.topDeptKey !== undefined && typeof translateDept === 'function') {
    resolved.topDeptKey = translateDept(resolved.topDeptKey)
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
  // workerNames (ACT_CROSS_TRAIN ของหมวด "ช่างและค่าแรง") เป็น array ของสตริงชื่อดิบล้วน (ไม่มี count แยก —
  // array ที่ส่งมาคือรายชื่อเต็มเสมอ ไม่มีการตัดสั้นลงแบบ workers[]+count) ใช้ joiner ตัวเดียวกับ workers[]
  if (resolved.workerNames !== undefined) {
    resolved.workerNames = formatWorkerNameList(resolved.workerNames, resolved.workerNames.length, maxWorkerNames)
  }
  if (resolved.depts !== undefined) {
    resolved.depts = formatDeptQueueList(resolved.depts, translateDept)
  }
  if (resolved.peakMonth !== undefined) {
    resolved.peakMonth = formatThaiMonthYear(resolved.peakMonth)
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
  'FC_GOLD_LOSS_RISING',
  'CAP_BACKLOG_MONTHS',
  'CAP_QUEUE_BOTTLENECK',
  'CAP_INFLOW_OVER_OUTPUT',
  'CAP_COSTCARD_SLOW',
  'FC_BACKLOG_PROJECTED',
  'FC_PEAK_RISK',
  'GOLD_STAGE_ABOVE_TARGET',
  'GOLD_STAGE_PENDING_RETURN',
  'GOLD_STAGE_OUTLIER_JOBS',
  'FC_GOLD_STAGE_RISING',
  'WRK_CONCENTRATION',
  'WRK_RATE_OUTLIER',
  'WRK_WAGE_PER_PLAN_RISING',
  'WRK_UNPAID_JOBS',
  'WRK_GOLD_REPEAT',
  'FC_WAGES_NEXT_MONTH',
  'FC_KEY_PERSON_RISK',
  'MAT_GEM_WAITING',
  'MAT_READY_NOT_ISSUED',
  'MAT_GEM_SHORT',
  'MAT_SPEC_UNMATCHED',
  'FC_GEM_SHORT_UPCOMING',
  'FC_GEM_STOCKOUT'
])

export function resolveHelpKey(code) {
  return HELP_KEY_CODES.has(code) ? `view.productionInsight.help.${code}` : ''
}
