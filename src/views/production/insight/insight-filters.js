// insight-filters.js — pure logic ของ ProductionInsightView (Dashboard v2, Revision 2: per-topic tabs)
// ห้าม import Vue/Pinia/i18n ที่นี่ — เพื่อ unit test ได้โดยไม่ต้อง mount component จริง
//
// Revision 2: ไม่มีตัวกรองข้ามหมวดร่วมกันอีกต่อไป (dateRange/gold/goldSize/productType/customerType เดิม
// ไม่มี endpoint ใหม่ตัวไหนรับพารามิเตอร์พวกนี้เลย) — แต่ละ topic tab ถือ filter ของตัวเองอิสระ ตอนนี้
// implement จริงแค่หมวด "wip" (งานค้างและคอขวด) — หมวดอื่นเพิ่ม default/parse/query ของตัวเองทีหลังตอน
// implement จริงตามรูปแบบเดียวกับ wip ด้านล่าง
//
// ช่วงเวลา (rangePreset/start/end/bucket) ประกอบร่วมกับ range-presets.js (infra กลาง ใช้ query key ไม่มี
// prefix — range/start/end) — ฟังก์ชันด้านล่างห่อรวมให้ caller (index-view.vue) เห็น filters.wip เป็น
// object เดียว ไม่ต้องยุ่งกับ 2 โมดูลแยกกันเอง
import { buildDefaultRangeState, parseRangeQuery, rangeToQuery, clearedRangeQueryKeys } from '@/services/utils/range-presets.js'

export const SECTION_VALUES = ['wip', 'delivery', 'capacity', 'gold', 'workers', 'materials']
export const DEFAULT_SECTION = 'wip'

export function resolveActiveSection(value) {
  return SECTION_VALUES.includes(value) ? value : DEFAULT_SECTION
}

// ---- WIP tab filter (departmentKeys / staleDays / riskWindowDays / growthThresholdPercent / range) ----

export const WIP_DEFAULT_STALE_DAYS = 180
export const WIP_DEFAULT_RISK_WINDOW_DAYS = 30
export const WIP_DEFAULT_GROWTH_THRESHOLD_PERCENT = 20

export function buildDefaultWipFilter() {
  const range = buildDefaultRangeState()
  return {
    departmentKeys: [],
    staleDays: WIP_DEFAULT_STALE_DAYS,
    riskWindowDays: WIP_DEFAULT_RISK_WINDOW_DAYS,
    growthThresholdPercent: WIP_DEFAULT_GROWTH_THRESHOLD_PERCENT,
    rangePreset: range.preset,
    start: range.start,
    end: range.end,
    bucket: range.bucket
  }
}

function parseArrayParam(value) {
  if (!value) return []
  return String(value)
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
}

function parsePositiveIntOr(value, fallback) {
  const n = parseInt(value, 10)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

export function parseWipFilterQuery(query = {}) {
  const range = parseRangeQuery(query)
  return {
    departmentKeys: parseArrayParam(query.wipDept),
    staleDays: parsePositiveIntOr(query.wipStaleDays, WIP_DEFAULT_STALE_DAYS),
    riskWindowDays: parsePositiveIntOr(query.wipRiskWindow, WIP_DEFAULT_RISK_WINDOW_DAYS),
    growthThresholdPercent: parsePositiveIntOr(query.wipGrowth, WIP_DEFAULT_GROWTH_THRESHOLD_PERCENT),
    rangePreset: range.preset,
    start: range.start,
    end: range.end,
    bucket: range.bucket
  }
}

// คืนเฉพาะ key ของ query ที่ไฟล์นี้เป็นเจ้าของ (caller merge กับ query เดิม เช่น executive ?tab= เอง) —
// ละเว้น key ที่ยังเป็นค่า default (กัน URL รก เมื่อผู้ใช้ยังไม่แตะตัวกรองเลย)
export function wipFilterToQuery(filter = {}) {
  const query = { ...rangeToQuery({ preset: filter.rangePreset, start: filter.start, end: filter.end }) }
  if (filter.departmentKeys && filter.departmentKeys.length) query.wipDept = filter.departmentKeys.join(',')
  if (filter.staleDays && filter.staleDays !== WIP_DEFAULT_STALE_DAYS) query.wipStaleDays = String(filter.staleDays)
  if (filter.riskWindowDays && filter.riskWindowDays !== WIP_DEFAULT_RISK_WINDOW_DAYS) query.wipRiskWindow = String(filter.riskWindowDays)
  if (filter.growthThresholdPercent && filter.growthThresholdPercent !== WIP_DEFAULT_GROWTH_THRESHOLD_PERCENT) {
    query.wipGrowth = String(filter.growthThresholdPercent)
  }
  return query
}

// key ของ query ที่ต้องลบทิ้งเมื่อ filter กลับไปเป็นค่า default
export function clearedWipFilterQueryKeys(filter = {}) {
  const keys = [...clearedRangeQueryKeys({ preset: filter.rangePreset, start: filter.start, end: filter.end })]
  if (!filter.departmentKeys || !filter.departmentKeys.length) keys.push('wipDept')
  if (!filter.staleDays || filter.staleDays === WIP_DEFAULT_STALE_DAYS) keys.push('wipStaleDays')
  if (!filter.riskWindowDays || filter.riskWindowDays === WIP_DEFAULT_RISK_WINDOW_DAYS) keys.push('wipRiskWindow')
  if (!filter.growthThresholdPercent || filter.growthThresholdPercent === WIP_DEFAULT_GROWTH_THRESHOLD_PERCENT) keys.push('wipGrowth')
  return keys
}

// ---- Delivery tab filter (departmentKeys / riskHorizonDays / range) ----

export const DELIVERY_DEFAULT_RISK_HORIZON_DAYS = 30

export function buildDefaultDeliveryFilter() {
  const range = buildDefaultRangeState()
  return {
    departmentKeys: [],
    riskHorizonDays: DELIVERY_DEFAULT_RISK_HORIZON_DAYS,
    rangePreset: range.preset,
    start: range.start,
    end: range.end,
    bucket: range.bucket
  }
}

export function parseDeliveryFilterQuery(query = {}) {
  const range = parseRangeQuery(query)
  return {
    departmentKeys: parseArrayParam(query.dlvDept),
    riskHorizonDays: parsePositiveIntOr(query.dlvRiskHorizon, DELIVERY_DEFAULT_RISK_HORIZON_DAYS),
    rangePreset: range.preset,
    start: range.start,
    end: range.end,
    bucket: range.bucket
  }
}

export function deliveryFilterToQuery(filter = {}) {
  const query = { ...rangeToQuery({ preset: filter.rangePreset, start: filter.start, end: filter.end }) }
  if (filter.departmentKeys && filter.departmentKeys.length) query.dlvDept = filter.departmentKeys.join(',')
  if (filter.riskHorizonDays && filter.riskHorizonDays !== DELIVERY_DEFAULT_RISK_HORIZON_DAYS) query.dlvRiskHorizon = String(filter.riskHorizonDays)
  return query
}

export function clearedDeliveryFilterQueryKeys(filter = {}) {
  const keys = [...clearedRangeQueryKeys({ preset: filter.rangePreset, start: filter.start, end: filter.end })]
  if (!filter.departmentKeys || !filter.departmentKeys.length) keys.push('dlvDept')
  if (!filter.riskHorizonDays || filter.riskHorizonDays === DELIVERY_DEFAULT_RISK_HORIZON_DAYS) keys.push('dlvRiskHorizon')
  return keys
}

// ---- Gold tab filter (workerTypes / workerCodes / olderThanDays / metal / range) ----
// workerCodes options มาจาก Gold.workers (ข้อมูลที่เพิ่งโหลดมา) ไม่ใช่ list คงที่แบบ department ของ wip/
// delivery — index-view.vue เก็บ options ที่ gold-section.vue emit ขึ้นมาหลังยิง Gold สำเร็จ — metal คุมทั้ง
// หมวด (KPI/กราฟ/ตารางทั้งหมด) แก้ได้ทั้งจากแผงตัวกรองนี้และ ToggleGroupGeneric ข้างหัวข้อ KPI (state เดียวกัน)

export const GOLD_DEFAULT_OLDER_THAN_DAYS = 14
export const GOLD_DEFAULT_METAL = 'GOLD'
export const GOLD_METAL_VALUES = ['GOLD', 'SILVER']

function resolveMetal(value) {
  return GOLD_METAL_VALUES.includes(value) ? value : GOLD_DEFAULT_METAL
}

export function buildDefaultGoldFilter() {
  const range = buildDefaultRangeState()
  return {
    workerTypes: [],
    workerCodes: [],
    olderThanDays: GOLD_DEFAULT_OLDER_THAN_DAYS,
    metal: GOLD_DEFAULT_METAL,
    rangePreset: range.preset,
    start: range.start,
    end: range.end,
    bucket: range.bucket
  }
}

export function parseGoldFilterQuery(query = {}) {
  const range = parseRangeQuery(query)
  return {
    workerTypes: parseArrayParam(query.gldWorkerType),
    workerCodes: parseArrayParam(query.gldWorkerCode),
    olderThanDays: parsePositiveIntOr(query.gldOlderThan, GOLD_DEFAULT_OLDER_THAN_DAYS),
    metal: resolveMetal(query.gldMetal),
    rangePreset: range.preset,
    start: range.start,
    end: range.end,
    bucket: range.bucket
  }
}

export function goldFilterToQuery(filter = {}) {
  const query = { ...rangeToQuery({ preset: filter.rangePreset, start: filter.start, end: filter.end }) }
  if (filter.workerTypes && filter.workerTypes.length) query.gldWorkerType = filter.workerTypes.join(',')
  if (filter.workerCodes && filter.workerCodes.length) query.gldWorkerCode = filter.workerCodes.join(',')
  if (filter.olderThanDays && filter.olderThanDays !== GOLD_DEFAULT_OLDER_THAN_DAYS) query.gldOlderThan = String(filter.olderThanDays)
  if (filter.metal && filter.metal !== GOLD_DEFAULT_METAL) query.gldMetal = filter.metal
  return query
}

export function clearedGoldFilterQueryKeys(filter = {}) {
  const keys = [...clearedRangeQueryKeys({ preset: filter.rangePreset, start: filter.start, end: filter.end })]
  if (!filter.workerTypes || !filter.workerTypes.length) keys.push('gldWorkerType')
  if (!filter.workerCodes || !filter.workerCodes.length) keys.push('gldWorkerCode')
  if (!filter.olderThanDays || filter.olderThanDays === GOLD_DEFAULT_OLDER_THAN_DAYS) keys.push('gldOlderThan')
  if (!filter.metal || filter.metal === GOLD_DEFAULT_METAL) keys.push('gldMetal')
  return keys
}

// ---- Active filter chips (ActiveFilterChipsGeneric) ----
// items: Array<{ key, label, value, alwaysShow? }> — value/label ต้อง resolve เป็นข้อความจริงมาก่อนแล้ว
// (i18n resolution เป็นหน้าที่ของ component ผู้เรียก ไม่ใช่ไฟล์นี้) — ไม่มี concept "dimmed" ข้ามหมวดอีก
// ต่อไปเพราะแต่ละหมวดถือ filter อิสระของตัวเอง (สลับหมวด = เปลี่ยนชุด chip ทั้งชุด ไม่ใช่แค่ทำให้จาง)
// ไม่มี chip ของช่วงเวลาที่นี่ — RangePresetGeneric ในแถบเครื่องมือแสดงช่วงที่ใช้อยู่แล้ว ไม่ต้องซ้ำ
export function buildActiveChips(items = []) {
  return items
    .filter((item) => item.alwaysShow || (item.value !== null && item.value !== undefined && item.value !== ''))
    .map((item) => ({ key: item.key, label: item.label || '', value: item.value }))
}
