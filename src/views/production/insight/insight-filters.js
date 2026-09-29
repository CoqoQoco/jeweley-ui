// insight-filters.js — pure logic ของ ProductionInsightView (Dashboard v2 archetype)
// ห้าม import Vue/Pinia/i18n ที่นี่ — เพื่อ unit test ได้โดยไม่ต้อง mount component จริง
// (labels/master-data resolution ทำใน component แล้วส่งผลลัพธ์ที่ resolve แล้วเข้ามาเป็น argument)
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

const THAI_TIMEZONE = 'Asia/Bangkok'
// จำนวนเดือนที่เห็นเป็น default (เดือนปัจจุบัน + ย้อนหลัง 5 เดือน) — เหมือน pattern ของ gold-loss-dashboard
const DEFAULT_MONTHS_BACK = 6

export const SECTION_VALUES = ['overview', 'wip', 'capacity', 'monthly', 'gold']

// filter key ที่มีผลจริงกับแต่ละหมวด — ใช้ dim chip ที่ไม่เกี่ยวกับหมวดที่เปิดอยู่ (ActiveFilterChipsGeneric)
// 'gold' หมวด ใช้ข้อมูลจากใบเบิกทอง (Worker/ReportGoldLoss*ByWorker) ซึ่งกรองด้วยช่วงวันที่/ช่างเท่านั้น
// ไม่มีมิติ ทอง/ขนาดทอง/ประเภทสินค้า/ประเภทลูกค้า (มิติเหล่านั้นเป็นของชิ้นงาน ไม่ใช่ของใบเบิกทองดิบ)
export const SECTION_GLOBAL_FILTER_RELEVANCE = {
  overview: ['start', 'end', 'gold', 'goldSize', 'productType', 'customerType'],
  wip: ['start', 'end', 'gold', 'goldSize', 'productType', 'customerType'],
  capacity: ['start', 'end', 'gold', 'goldSize', 'productType', 'customerType'],
  monthly: ['start', 'end', 'gold', 'goldSize', 'productType', 'customerType'],
  gold: ['start', 'end']
}

const ARRAY_FILTER_KEYS = ['gold', 'goldSize', 'productType', 'customerType']

// ---- section (ToggleGroupGeneric ชั้น 2) ----

export function resolveActiveSection(value) {
  return SECTION_VALUES.includes(value) ? value : 'overview'
}

export function isFilterKeyRelevantToSection(key, section) {
  const keys = SECTION_GLOBAL_FILTER_RELEVANCE[section] || SECTION_GLOBAL_FILTER_RELEVANCE.overview
  // ActiveFilterChipsGeneric ใช้ key 'dateRange' ตัวเดียวแทนช่วงวันที่ (start+end รวมกันเป็น chip เดียว)
  // — ถือว่า relevant เมื่อ 'start' (หรือ 'end') อยู่ใน relevance list ของหมวดนั้น
  if (key === 'dateRange') return keys.includes('start') || keys.includes('end')
  return keys.includes(key)
}

// ---- default filter (6 เดือนล่าสุดรวมเดือนปัจจุบัน, ขอบเดือนตามเวลาไทย) ----

export function buildDefaultDateRange() {
  const now = dayjs().tz(THAI_TIMEZONE)
  return {
    start: now.subtract(DEFAULT_MONTHS_BACK - 1, 'month').startOf('month').toDate(),
    end: now.endOf('day').toDate()
  }
}

export function buildDefaultFilter() {
  return {
    ...buildDefaultDateRange(),
    gold: [],
    goldSize: [],
    productType: [],
    customerType: []
  }
}

// ---- URL query <-> filter state ----

function parseArrayParam(value) {
  if (!value) return []
  return String(value)
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
}

export function parseFilterQuery(query = {}) {
  const defaults = buildDefaultDateRange()
  return {
    start: query.start ? dayjs(query.start).toDate() : defaults.start,
    end: query.end ? dayjs(query.end).toDate() : defaults.end,
    gold: parseArrayParam(query.gold),
    goldSize: parseArrayParam(query.goldSize),
    productType: parseArrayParam(query.productType),
    customerType: parseArrayParam(query.customerType)
  }
}

// คืนเฉพาะ key ของ query ที่ไฟล์นี้เป็นเจ้าของ (caller merge กับ query เดิม เช่น executive ?tab= เอง)
export function filterToQuery(filter = {}) {
  const query = {}
  if (filter.start) query.start = dayjs(filter.start).format('YYYY-MM-DD')
  if (filter.end) query.end = dayjs(filter.end).format('YYYY-MM-DD')
  ARRAY_FILTER_KEYS.forEach((key) => {
    if (filter[key] && filter[key].length) query[key] = filter[key].join(',')
  })
  return query
}

// key ของ query ที่ต้องลบทิ้งเมื่อ filter กลับไปเป็นค่าว่าง (array filter เท่านั้น — start/end เขียนทับได้เสมอ)
export function clearedFilterQueryKeys(filter = {}) {
  return ARRAY_FILTER_KEYS.filter((key) => !filter[key] || !filter[key].length)
}

export function sectionToQuery(section) {
  return { view: resolveActiveSection(section) }
}

// ---- Active filter chips (ActiveFilterChipsGeneric) ----
// items: Array<{ key, label, value, alwaysShow? }> — value/label ต้อง resolve เป็นข้อความจริงมาก่อนแล้ว
// (i18n + master data resolution เป็นหน้าที่ของ component ผู้เรียก ไม่ใช่ไฟล์นี้)
export function buildActiveChips(items = [], section = 'overview') {
  return items
    .filter((item) => item.alwaysShow || (item.value !== null && item.value !== undefined && item.value !== ''))
    .map((item) => ({
      key: item.key,
      label: item.label || '',
      value: item.value,
      dimmed: !isFilterKeyRelevantToSection(item.key, section)
    }))
}

export function formatChipDateRange(start, end) {
  if (!start || !end) return ''
  return `${dayjs(start).format('DD/MM/YYYY')} – ${dayjs(end).format('DD/MM/YYYY')}`
}
