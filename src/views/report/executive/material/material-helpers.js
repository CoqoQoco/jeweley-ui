// material-helpers.js — pure logic ของแท็บ "คลังวัตถุดิบ" (MaterialInsight) — ห้าม import Vue/i18n
// ปัจจุบันรองรับ kind GOLD (หน่วย g) · GEM (พลอย) จะเพิ่มภายหลังเป็น config แยก
import { formatThaiMonthYear } from '@/components/insight/insight-helpers.js'
import { resolvePresetRange } from '@/services/utils/range-presets.js'
import { isoOrNull } from '@/components/insight/page/insight-page-helpers.js'

export const MATERIAL_ENDPOINT = 'MaterialInsight/Overview'
export const MATERIAL_MONTHS = 12
export const MATERIAL_KINDS = ['GOLD']
export const DEFAULT_MATERIAL_KIND = 'GOLD'

const S = 'view.productionInsight.materialInsight'

// ---- kind ใน URL: ?kind=gold (default ไม่เขียน) ----

export function parseKindQuery(value) {
  const kind = String(value || '').toUpperCase()
  return MATERIAL_KINDS.includes(kind) ? kind : DEFAULT_MATERIAL_KIND
}

export function kindToQuery(kind) {
  return kind && kind !== DEFAULT_MATERIAL_KIND ? { kind: kind.toLowerCase() } : {}
}

// body ของ Overview — ส่งเฉพาะ key ที่ API รู้จัก (API ทิ้ง key แปลกปลอมเงียบๆ) · ไม่ส่ง thresholds (ใช้ policy ที่บันทึกไว้)
export function buildOverviewParams(kind = DEFAULT_MATERIAL_KIND) {
  return { kind, months: MATERIAL_MONTHS }
}

// ---- ทองค้างที่ช่าง (จากใบงานผลิต) ----
// คลังทองไม่ดูแลยอดที่อยู่ในกระบวนการ (onProcess = 0 เสมอ) → ดึงจาก ProductionInsight/GoldByStage: ทองที่ค้างกับช่างรายแผนก (pendingWithWorker*) ย้อนหลัง 3 เดือน (ช่วงเดียวกับค่าตั้งต้นของหมวดทอง)
export const GOLD_STAGE_ENDPOINT = 'ProductionInsight/GoldByStage'

export function buildGoldStageParams(now = new Date()) {
  const range = resolvePresetRange('3m', now)
  return { start: isoOrNull(range.start), end: isoOrNull(range.end), metal: 'GOLD' }
}

// Σ ทอง (g) และ Σ จำนวนใบงานที่ค้างกับช่างทุกแผนก · ไม่มีข้อมูล (ยิงพลาด/ยังไม่โหลด) = null
export function sumPendingWithWorker(goldStage) {
  const departments = goldStage?.departments
  if (!Array.isArray(departments)) return null
  return departments.reduce(
    (sum, dept) => ({ gram: sum.gram + (Number(dept.pendingWithWorkerGram) || 0), count: sum.count + (Number(dept.pendingWithWorkerCount) || 0) }),
    { gram: 0, count: 0 }
  )
}

export function buildWithWorkerLine(goldStage, t) {
  const total = sumPendingWithWorker(goldStage)
  return total && total.count > 0 ? t(`${S}.withWorkerLine`, { weight: formatGram(total.gram), count: new Intl.NumberFormat('th-TH').format(total.count) }) : ''
}

// ---- รูปแบบตัวเลข ----

export function formatGram(value, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—'
  return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: digits }).format(Number(value))
}

export function formatDays(value) {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('th-TH', { maximumFractionDigits: 1 }).format(Number(value))
}

// ---- รายการ: เรียง/กรอง ----

// negative = ยอดคงเหลือติดลบ (ledger ยังไม่มียอดยกมา/รับเข้า — ไม่ใช่ของหมด) อยู่ถัดจาก zero เพราะต้องแก้ข้อมูลก่อน
export const STATUS_ORDER = ['zero', 'negative', 'below', 'near', 'dead', 'ok']
export const ITEM_FILTERS = ['all', 'zero', 'negative', 'below', 'near', 'dead']
export const DEFAULT_ITEM_FILTER = 'all'

const rankOf = (status) => {
  const index = STATUS_ORDER.indexOf(status)
  return index === -1 ? STATUS_ORDER.length : index
}

// รุนแรงก่อน (หมด → ต่ำกว่าขั้นต่ำ → ใกล้หมด → ค้างนิ่ง → ปกติ) แล้ว "พอใช้กี่วัน" น้อยก่อน (ไม่มีค่า = ท้าย) แล้วตามชื่อ
export function sortItemsBySeverity(items) {
  return [...(items || [])].sort((a, b) => {
    const byStatus = rankOf(a.status) - rankOf(b.status)
    if (byStatus) return byStatus
    const ca = a.coverDays ?? Number.POSITIVE_INFINITY
    const cb = b.coverDays ?? Number.POSITIVE_INFINITY
    if (ca !== cb) return ca < cb ? -1 : 1
    return String(a.label || '').localeCompare(String(b.label || ''), 'th')
  })
}

// ค้างนิ่งนับด้วย isDead (ของตายอาจซ้อนกับ below/near) · ที่เหลือตาม status
export function filterItems(items, filter) {
  if (!filter || filter === 'all') return items || []
  if (filter === 'dead') return (items || []).filter((item) => item.isDead)
  return (items || []).filter((item) => item.status === filter)
}

// จำนวนต่อตัวเลือกของตัวสลับ จาก KPI (ตรงกับที่ finding ใช้)
export function itemFilterCounts(kpi) {
  return { all: kpi?.itemCount ?? 0, zero: kpi?.zeroCount ?? 0, negative: kpi?.negativeCount ?? 0, below: kpi?.belowMinCount ?? 0, near: kpi?.nearMinCount ?? 0, dead: kpi?.deadCount ?? 0 }
}

const STATUS_VARIANT = { zero: 'fail', negative: 'warning', below: 'warning', near: 'warning', dead: 'grey', ok: 'pass' }
export const STATUS_COLOR = { fail: 'var(--base-red)', warning: 'var(--base-warning)', grey: 'var(--base-sub-color)', pass: 'var(--base-green)' }

export function resolveStatusVariant(status) {
  return STATUS_VARIANT[status] || 'pass'
}

function lastMoveText(item, t) {
  if (item.neverConsumed || !item.lastMovementDate) return t(`${S}.neverMoved`)
  const date = new Date(item.lastMovementDate)
  const label = Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' })
  return item.daysSinceMove == null ? label : `${label} · ${t(`${S}.daysAgo`, { days: item.daysSinceMove })}`
}

// แถวตารางรายการ — ฟิลด์เดิมของ item อยู่ครบ (ปุ่มแก้ไขส่งทั้งแถวเข้า modal) + ฟิลด์แสดงผล
export function buildItemRows(items, filter, t) {
  return sortItemsBySeverity(filterItems(items, filter)).map((item) => ({
    ...item,
    rowKey: item.itemKey,
    minSourceText: t(`${S}.minSource.${item.minSource || 'auto'}`),
    statusText: t(`${S}.status.${item.status || 'ok'}`),
    onHandHint: item.onHand < 0 ? t(`${S}.negativeHint`) : '',
    lastMoveText: lastMoveText(item, t),
    editText: ''
  }))
}

// ---- ยอดติดลบ (ledger ไม่มียอดยกมา/รับเข้า) ----

// แจ้งเตือน: มีรายการติดลบและยังไม่เคยบันทึกการรับเข้าเลย
export function shouldShowNegativeNotice(kpi) {
  return (kpi?.negativeCount || 0) > 0 && !kpi?.inboundRecorded
}

// ทุกรายการติดลบ (มีรายการอยู่และติดลบหมด) → ยอดรวม/โดนัทไม่มีความหมาย
export function areAllItemsNegative(kpi) {
  return (kpi?.itemCount || 0) > 0 && (kpi?.negativeCount || 0) >= kpi.itemCount
}

// MAT_NEGATIVE_BALANCE มี 2 ข้อความ: ยังไม่เคยมีรับเข้าเลย / มีรับเข้าแล้วแต่ยอดยังติดลบ → แยก code (i18n ไม่มีเงื่อนไขในตัว) · ที่เหลือปล่อยผ่าน
export function remapMaterialFindings(items) {
  return (items || []).map((item) => (item?.code === 'MAT_NEGATIVE_BALANCE' && item.params?.ledgerHasInbound ? { ...item, code: 'MAT_NEGATIVE_BALANCE_INBOUND' } : item))
}

// ---- กลุ่ม / ขนาด ----

export function buildGroupRows(groups) {
  return [...(groups || [])]
    .map((g) => ({ key: g.code, code: g.code, label: g.name || g.code, itemCount: g.itemCount || 0, onHand: g.onHand || 0, negativeCount: g.negativeCount || 0 }))
    .sort((a, b) => b.onHand - a.onHand || a.label.localeCompare(b.label, 'th'))
}

// รวมรายการตามขนาด (client-side) — ไม่มีขนาด = '-'
export function aggregateBySize(items) {
  const map = new Map()
  ;(items || []).forEach((item) => {
    const key = item.sizeCode || '-'
    const row = map.get(key) || { key, label: item.sizeName || key, itemCount: 0, onHand: 0 }
    row.itemCount += 1
    row.onHand += item.onHand || 0
    map.set(key, row)
  })
  return [...map.values()].sort((a, b) => b.onHand - a.onHand || a.label.localeCompare(b.label, 'th'))
}

// กราฟแท่งตามกลุ่ม: ไม่พล็อตกลุ่มที่ยอดติดลบ (แท่งติดลบทำให้อ่านผิด) — ยังอยู่ในตารางพร้อมสีแดง
export function buildGroupBarRows(groups) {
  return buildGroupRows(groups).filter((g) => g.onHand > 0)
}

// ชิ้นของโดนัท: ยอดคงเหลือตามกลุ่ม (ติดลบ/ศูนย์ไม่ใส่ — โดนัทแสดงเฉพาะที่มีของ)
export function buildGroupSlices(groups) {
  return buildGroupRows(groups)
    .filter((g) => g.onHand > 0)
    .map((g) => ({ label: g.label, value: g.onHand }))
}

// ---- finding / KPI → แท็บ + ตัวสลับ ----

const FILTER_BY_CODE = { MAT_ZERO_STOCK: 'zero', MAT_NEGATIVE_BALANCE: 'negative', MAT_BELOW_MIN: 'below', MAT_NEAR_MIN: 'near', MAT_DEAD_STOCK: 'dead' }

// itemFilter จากการ์ด KPI ชนะ → รองลงมา findingCode → 'all' · 'attention' (การ์ด หมด+ต่ำกว่าขั้นต่ำ) = หมดถ้ามี ไม่งั้นต่ำกว่าขั้นต่ำ
export function resolveItemFilter(params, kpi) {
  const explicit = params?.itemFilter
  if (explicit === 'attention') return (kpi?.zeroCount || 0) > 0 ? 'zero' : 'below'
  if (ITEM_FILTERS.includes(explicit)) return explicit
  return FILTER_BY_CODE[params?.findingCode] || DEFAULT_ITEM_FILTER
}

export const ITEMS_BLOCK_ID = { readOnly: 'matItems', editable: 'matItemsEdit' }

// matItems / matOnProcess → แท็บรายการ + ตัวสลับ · anchor = ตารางที่มองเห็นอยู่ (มีสิทธิ์แก้ = ตารางที่มีปุ่ม) · ref อื่น = null (จับคู่ block id)
export function resolveMaterialReportTarget(reportRef, params, ctx) {
  if (reportRef !== 'matItems' && reportRef !== 'matOnProcess') return null
  const kpi = ctx?.data?.Overview?.kpi
  const value = reportRef === 'matOnProcess' ? DEFAULT_ITEM_FILTER : resolveItemFilter(params, kpi)
  return { tab: 'items', reveal: { stateKey: 'itemsFilter', value }, anchor: ctx?.filter?.canManage ? ITEMS_BLOCK_ID.editable : ITEMS_BLOCK_ID.readOnly }
}

// ---- hint ประวัติการเบิกใช้ ----

export function buildUsageHint(usageHistory, t) {
  const start = usageHistory?.startMonth ? formatThaiMonthYear(String(usageHistory.startMonth).slice(0, 7)) : null
  return start ? t(`${S}.usageHint`, { start, months: usageHistory.fullMonths ?? 0 }) : t(`${S}.usageHintNone`)
}

export function buildMonthLabels(series) {
  return (series || []).map((p) => formatThaiMonthYear(String(p?.month || '').slice(0, 7)))
}

// ---- ขั้นต่ำ (Min/Save, Min/Delete) ----

export const NOTE_MAX = 500
export const LEAD_TIME_MAX = 365

const toNumberOrNull = (value) => {
  if (value === '' || value === null || value === undefined) return null
  const n = Number(value)
  return Number.isFinite(n) ? n : NaN
}

export function createMinForm(item) {
  return {
    minQty: item?.overrideMin ?? item?.effectiveMin ?? 0,
    leadTimeDays: item?.overrideLeadTimeDays ?? '',
    note: ''
  }
}

// คืน { key: 'errorKey' } — ว่าง = ผ่าน (errorKey เป็นส่วนท้ายของ view.productionInsight.materialInsight.error.*)
export function validateMinForm(form) {
  const errors = {}
  const minQty = toNumberOrNull(form.minQty)
  if (minQty === null || Number.isNaN(minQty) || minQty < 0) errors.minQty = 'minQty'
  const lead = toNumberOrNull(form.leadTimeDays)
  if (lead !== null && (Number.isNaN(lead) || !Number.isInteger(lead) || lead < 0 || lead > LEAD_TIME_MAX)) errors.leadTimeDays = 'leadTimeDays'
  if (String(form.note || '').length > NOTE_MAX) errors.note = 'note'
  return errors
}

export function buildMinSaveBody(kind, itemKey, form) {
  const note = String(form.note || '').trim()
  return { kind, itemKey, minQty: Number(form.minQty), leadTimeDays: toNumberOrNull(form.leadTimeDays), note: note || null }
}

export function buildMinDeleteBody(kind, itemKey) {
  return { kind, itemKey }
}

// สูตรขั้นต่ำอัตโนมัติ (อธิบายในโมดัล): ใช้เฉลี่ย/วัน × (lead + safety)
export function describeAutoMin(item, policy) {
  const lead = item?.leadTimeDays ?? policy?.leadTimeDays ?? 0
  const safety = policy?.safetyDays ?? 0
  return { avgDailyUsage: item?.avgDailyUsage ?? 0, leadDays: lead, safetyDays: safety, autoMin: item?.autoMin ?? 0 }
}

// ---- เกณฑ์ (Policy/Save) — ทองใช้ 7 field นี้ ----

export const POLICY_FIELDS = [
  { key: 'windowMonths', min: 1, max: 24, integer: true },
  { key: 'leadTimeDays', min: 0, max: 365, integer: true },
  { key: 'safetyDays', min: 0, max: 365, integer: true },
  { key: 'floorQty', min: 0, max: Number.MAX_SAFE_INTEGER, integer: false },
  { key: 'nearPercent', min: 100, max: 1000, integer: false },
  { key: 'deadStockDays', min: 1, max: 3650, integer: true },
  { key: 'minHistoryMonths', min: 1, max: 12, integer: true }
]

export function createPolicyForm(policy) {
  return Object.fromEntries(POLICY_FIELDS.map((f) => [f.key, policy?.[f.key] ?? '']))
}

export function validatePolicyForm(form) {
  const errors = {}
  POLICY_FIELDS.forEach((field) => {
    const n = toNumberOrNull(form[field.key])
    if (n === null || Number.isNaN(n) || n < field.min || n > field.max || (field.integer && !Number.isInteger(n))) errors[field.key] = field.key
  })
  return errors
}

// ส่งเฉพาะ field ที่ค่าต่างจาก policy ปัจจุบัน (null = คงเดิมที่ฝั่ง API จึงไม่ต้องส่ง field อื่น)
export function buildPolicySaveBody(kind, form, current) {
  const body = { kind }
  POLICY_FIELDS.forEach((field) => {
    const next = toNumberOrNull(form[field.key])
    if (next !== null && !Number.isNaN(next) && next !== Number(current?.[field.key])) body[field.key] = next
  })
  return body
}

export function hasPolicyChanges(body) {
  return Object.keys(body).some((key) => key !== 'kind')
}
