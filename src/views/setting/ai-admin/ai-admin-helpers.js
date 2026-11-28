import dayjs from 'dayjs'

import { formatISOString } from '@/services/utils/dayjs.js'
import { GUIDE_TOOLS } from '@/views/report/executive/ai-guide/ai-guide-content.js'

export const PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100
export const MAX_SCOPE_CHIPS = 3

// ลำดับคอลัมน์สลับ: ลูกหนี้ → ต้นทุน/กำไร → ลูกค้า → ช่าง
export const GRANT_COLUMNS = [
  { scope: 'data:receivables', field: 'receivables' },
  { scope: 'data:cost', field: 'cost' },
  { scope: 'data:customer-names', field: 'customerNames' },
  { scope: 'data:worker-names', field: 'workerNames' }
]

export const GUIDE_TOOL_VALUES = GUIDE_TOOLS

export const scopeKey = (scope) => `view.aiConnector.scope.${String(scope).replace(/[:-]/g, '_')}`

export function findGrant(user, scope) {
  return (user?.grants || []).find((grant) => grant.scope === scope) || { scope, enabled: false, canGrant: false }
}

export function isSelfUser(row, authUser) {
  if (!row || !authUser) return false
  const ownId = authUser.id ?? authUser.userId
  if (ownId != null && row.userId != null && String(ownId) === String(row.userId)) return true
  return !!authUser.username && String(authUser.username).toLowerCase() === String(row.username || '').toLowerCase()
}

// API ตอบ error เป็นข้อความล้วน — รองรับ { message } ด้วย
export function extractErrorText(error, fallback = '') {
  const data = error?.response?.data
  if (typeof data === 'string' && data.trim()) return data
  if (data && typeof data.message === 'string' && data.message) return data.message
  return fallback
}

export const isConflict = (error) => error?.response?.status === 409

export function countActiveSuspensions(users = []) {
  return users.filter((user) => user.suspended).length
}

export function splitScopeChips(scopes = [], max = MAX_SCOPE_CHIPS) {
  const list = Array.isArray(scopes) ? scopes : []
  return { visible: list.slice(0, max), hidden: list.slice(max) }
}

const toIso = (date, edge) => (date ? formatISOString(dayjs(date)[edge]('day').toDate()) : null)

export function buildAccessLogParams({ skip = 0, take = PAGE_SIZE, sort = [], userIds = [], tools = [], start = null, end = null } = {}) {
  return {
    skip,
    take: Math.min(take, MAX_PAGE_SIZE),
    sort,
    userIds: Array.isArray(userIds) ? userIds : [],
    tools: Array.isArray(tools) ? tools : [],
    dateFrom: toIso(start, 'startOf'),
    dateTo: toIso(end, 'endOf')
  }
}

export function isLogFilterEmpty({ userIds = [], tools = [], start = null, end = null } = {}) {
  return !userIds.length && !tools.length && !start && !end
}

export function buildSuspensionParams({ skip = 0, take = PAGE_SIZE, sort = [] } = {}) {
  return { skip, take: Math.min(take, MAX_PAGE_SIZE), sort }
}

export const resolveLogResult = (row) => (row?.success ? 'success' : 'error')

// ข้อความไทยล้วน — code เก็บไว้ที่ title ของ UI ไม่แสดงในข้อความ
export const formatLogError = (row, fallback = '') => row?.errorMessageTh || fallback
