import dayjs from 'dayjs'

import { formatISOString } from '@/services/utils/dayjs.js'

export const EXPIRY_SOON_DAYS = 7
export const MAX_VISIBLE_SCOPE_CHIPS = 3
export const DEFAULT_LOG_RANGE_DAYS = 7
export const LOG_PAGE_SIZE = 20
export const PAT_EXPIRY_DAYS = [30, 60, 90]

// expired = หมดแล้ว · soon = เหลือ ≤ 7 วัน · ok = ปกติ · none = ไม่มีวันหมดอายุ
export function getExpiryStatus(expiresAt, now = new Date()) {
  if (!expiresAt) return { status: 'none', daysLeft: null }
  const diffMs = new Date(expiresAt).getTime() - new Date(now).getTime()
  if (diffMs <= 0) return { status: 'expired', daysLeft: 0 }
  const daysLeft = Math.ceil(diffMs / 86400000)
  return { status: daysLeft <= EXPIRY_SOON_DAYS ? 'soon' : 'ok', daysLeft }
}

export function splitScopeChips(scopes = [], max = MAX_VISIBLE_SCOPE_CHIPS) {
  const list = Array.isArray(scopes) ? scopes : []
  return { visible: list.slice(0, max), hidden: list.slice(max) }
}

// ข้อความ "ปกปิดข้อมูลอ่อนไหว n รายการ" — ไม่มีการปกปิด = ข้อความว่าง (ไม่ต้องแสดง)
export function buildMaskedLabel(maskedCount, translate) {
  const count = Number(maskedCount) || 0
  return count > 0 ? translate('view.aiConnector.log.maskedCount', { count }) : ''
}

export function buildDefaultLogRange(now = new Date()) {
  const end = dayjs(now).endOf('day').toDate()
  const start = dayjs(now).subtract(DEFAULT_LOG_RANGE_DAYS - 1, 'day').startOf('day').toDate()
  return { start, end }
}

export function buildAccessLogParams({ skip = 0, take = LOG_PAGE_SIZE, range, tokenIds = [] } = {}) {
  const { start, end } = range?.start && range?.end ? range : buildDefaultLogRange()
  return {
    skip,
    take: Math.min(take, 100),
    from: formatISOString(dayjs(start).startOf('day').toDate()),
    to: formatISOString(dayjs(end).endOf('day').toDate()),
    tokenIds: Array.isArray(tokenIds) ? tokenIds : [],
    clientIds: []
  }
}

export function isLogFilterDefault(range, tokenIds, now = new Date()) {
  if (tokenIds?.length) return false
  const base = buildDefaultLogRange(now)
  return dayjs(range?.start).isSame(base.start, 'day') && dayjs(range?.end).isSame(base.end, 'day')
}

// ชื่อเชื่อมแต่ละรายการ: OAuth = ชื่อแอป (client) · PAT = ชื่อรหัสที่ตั้งเอง
export function buildConnectionOptions(items = []) {
  return items.map((item) => ({ value: item.id, label: item.name }))
}

// translate คืน key เดิมเมื่อไม่มีคำแปล → ใช้ code ดิบแทน (ไม่พึ่ง $te ซึ่งไม่ได้ inject ใน legacy:false)
export function formatScopeName(code, translate) {
  const key = `view.aiConnector.scope.${String(code).replace(/[:-]/g, '_')}`
  const text = translate(key)
  return text && text !== key ? text : code
}

export function resolveLogResult(row) {
  return row?.success ? 'success' : 'error'
}

export const CONNECT_APPS = ['claude', 'chatgpt', 'gemini', 'other']
const CONNECT_STEP_COUNT = { claude: 3, chatgpt: 3, gemini: 5, other: 3 }

export function buildConnectStepKeys(app) {
  const count = CONNECT_STEP_COUNT[app] || CONNECT_STEP_COUNT.other
  return Array.from({ length: count }, (_, i) => `view.aiConnector.connect.${CONNECT_STEP_COUNT[app] ? app : 'other'}Step${i + 1}`)
}
