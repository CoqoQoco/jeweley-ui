// range-presets.js — pure logic ของ RangePresetGeneric (src/components/generic/RangePresetGeneric.vue)
// ห้าม import Vue/i18n ที่นี่ — ใช้ร่วมกันได้ทุกหน้าที่มีตัวเลือกช่วงเวลาแบบ [1M][3M][6M][1Y] + custom
//
// ขอบเขตวันคำนวณตามเวลาไทย (Asia/Bangkok) เสมอ ไม่ใช่ timezone เครื่อง
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

const THAI_TIMEZONE = 'Asia/Bangkok'
const CUSTOM_RANGE_WEEK_BUCKET_MAX_DAYS = 92

export const RANGE_PRESET_VALUES = ['1m', '3m', '6m', '1y']
export const DEFAULT_RANGE_PRESET = '3m'

// ป้ายกำกับปุ่ม preset — เป็นตัวย่อสากล (เหมือนกันทั้ง th/en, ไม่ต้องแปล) ไม่ใช่ข้อความไทย
export const RANGE_PRESET_LABELS = {
  '1m': '1M',
  '3m': '3M',
  '6m': '6M',
  '1y': '1Y'
}

const PRESET_CONFIG = {
  '1m': { amount: 1, unit: 'month', bucket: 'week' },
  '3m': { amount: 3, unit: 'month', bucket: 'week' },
  '6m': { amount: 6, unit: 'month', bucket: 'month' },
  '1y': { amount: 1, unit: 'year', bucket: 'month' }
}

// preset -> { start, end, bucket } — start/end เป็น Date object ขอบเขตวันตามเวลาไทย, end = ตอนนี้ (สิ้นวัน)
export function resolvePresetRange(preset, now = new Date()) {
  const config = PRESET_CONFIG[preset]
  if (!config) return null
  const nowTh = dayjs(now).tz(THAI_TIMEZONE)
  return {
    start: nowTh.subtract(config.amount, config.unit).startOf('day').toDate(),
    end: nowTh.endOf('day').toDate(),
    bucket: config.bucket
  }
}

// ช่วง custom (จาก DateRangeGeneric ในแผงตัวกรอง) ≤ 92 วัน ใช้ bucket รายสัปดาห์ ไม่งั้นรายเดือน
export function resolveCustomBucket(start, end) {
  if (!start || !end) return 'week'
  const days = Math.abs(dayjs(end).diff(dayjs(start), 'day'))
  return days <= CUSTOM_RANGE_WEEK_BUCKET_MAX_DAYS ? 'week' : 'month'
}

// state เต็ม { preset, start, end, bucket } ของ default (3 เดือนล่าสุด ตามที่ user ตัดสินใจ)
export function buildDefaultRangeState(now = new Date()) {
  const resolved = resolvePresetRange(DEFAULT_RANGE_PRESET, now)
  return { preset: DEFAULT_RANGE_PRESET, ...resolved }
}

// preset (1m/3m/6m/1y) หรือ 'custom' + start/end ที่รู้อยู่แล้ว -> { preset, start, end, bucket } ตัวเดียว
// ที่ใช้ยิง API ได้เลย (custom ไม่ resolve start/end ใหม่ ใช้ค่าที่ส่งมาตรงๆ แค่คำนวณ bucket ให้)
export function resolveRangeState(preset, start, end, now = new Date()) {
  if (preset === 'custom') {
    return { preset: 'custom', start, end, bucket: resolveCustomBucket(start, end) }
  }
  const resolved = resolvePresetRange(preset, now)
  if (!resolved) return buildDefaultRangeState(now)
  return { preset, ...resolved }
}

export function formatRangeLabel(start, end) {
  if (!start || !end) return ''
  return `${dayjs(start).format('DD/MM/YYYY')} – ${dayjs(end).format('DD/MM/YYYY')}`
}

// ---- URL query <-> range state ----
// query key ไม่มี prefix (range/start/end) ตั้งใจให้เป็น infra กลางข้ามหน้าในอนาคต แยกจาก query key
// เฉพาะของแต่ละ tab (เช่น wipDept/wipStaleDays ของ insight-filters.js)

export function parseRangeQuery(query = {}, now = new Date()) {
  if (query.start && query.end) {
    const start = dayjs(query.start).toDate()
    const end = dayjs(query.end).toDate()
    return { preset: 'custom', start, end, bucket: resolveCustomBucket(start, end) }
  }
  if (query.range && RANGE_PRESET_VALUES.includes(query.range)) {
    return { preset: query.range, ...resolvePresetRange(query.range, now) }
  }
  return buildDefaultRangeState(now)
}

export function rangeToQuery(rangeState = {}) {
  if (rangeState.preset === 'custom') {
    const query = {}
    if (rangeState.start) query.start = dayjs(rangeState.start).format('YYYY-MM-DD')
    if (rangeState.end) query.end = dayjs(rangeState.end).format('YYYY-MM-DD')
    return query
  }
  if (rangeState.preset && rangeState.preset !== DEFAULT_RANGE_PRESET) {
    return { range: rangeState.preset }
  }
  return {}
}

// key ของ query ที่ต้องลบทิ้งเมื่อ range state ไม่ต้องการมันแล้ว (สลับ preset<->custom หรือกลับ default)
export function clearedRangeQueryKeys(rangeState = {}) {
  if (rangeState.preset === 'custom') return ['range']
  if (!rangeState.preset || rangeState.preset === DEFAULT_RANGE_PRESET) return ['range', 'start', 'end']
  return ['start', 'end']
}
