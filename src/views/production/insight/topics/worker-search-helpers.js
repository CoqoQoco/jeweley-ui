// worker-search-helpers.js — pure logic ของกล่อง "ค้นหาช่าง" บนแถบเครื่องมือหน้า Production Insight (หมวดช่างและค่าแรง / ทองและ Loss)
// ห้าม import Vue/i18n ที่นี่ · แถว = แถว ProductionInsight/Workers ({ code, name, deptKey, employmentType, ... })
import { buildWorkersTablePayload } from './worker-profile-helpers.js'

export const WORKER_SEARCH_LIMIT = 50

// รหัสคิวรองาน (เช่น CG9K = "รอจ่ายขัดชุบ 9K") ไม่ใช่คน — backend แยกด้วยชื่อ (name_th) ขึ้นต้น "รอ" (IProductionWorkerLookupService) Workers ไม่มี flag isQueue
export function isQueueWorker(row) {
  return String(row?.name ?? '')
    .trim()
    .startsWith('รอ')
}

// ตัวเลือกของกล่องค้นหา: ตัดแถวไม่มีรหัส/แผนก + คิวรองาน, dedupe ด้วย (code, deptKey) — คนเดียวทำ 2 แผนกจะเป็น 2 ตัวเลือก (ป้ายบอกแผนก)
// t(key, params) = ฟังก์ชันแปลภาษา (ส่งเข้ามาเพื่อให้ helper ไม่ผูก i18n)
export function buildWorkerSearchOptions(workers, t) {
  const seen = new Set()
  const options = []
  ;(workers || []).forEach((row) => {
    if (!row?.code || !row?.deptKey || isQueueWorker(row)) return
    const key = `${row.code}|${row.deptKey}`
    if (seen.has(key)) return
    seen.add(key)
    const name = row.name || ''
    const dept = t(`view.executive.department.${row.deptKey}`)
    options.push({
      key,
      code: row.code,
      name,
      deptKey: row.deptKey,
      employmentType: row.employmentType || null,
      label: t('view.productionInsight.workerSearch.optionLabel', { name: name || row.code, code: row.code, dept })
    })
  })
  return options
}

function matchRank(option, query) {
  const code = String(option.code).toLowerCase()
  const name = option.name.toLowerCase()
  if (code === query) return 0
  if (code.startsWith(query)) return 1
  if (name.startsWith(query)) return 2
  if (code.includes(query) || name.includes(query)) return 3
  return -1
}

// ค้นด้วยชื่อหรือรหัส (ไม่สนตัวพิมพ์, substring) → เรียง: รหัสตรงเป๊ะ → รหัสขึ้นต้น → ชื่อขึ้นต้น → อื่นๆ แล้วตามชื่อ (th) · ตัดที่ limit
export function searchWorkerOptions(options, query, limit = WORKER_SEARCH_LIMIT) {
  const q = String(query ?? '')
    .trim()
    .toLowerCase()
  if (!q) return []
  return (options || [])
    .map((option) => ({ option, rank: matchRank(option, q) }))
    .filter((entry) => entry.rank >= 0)
    .sort((a, b) => a.rank - b.rank || a.option.name.localeCompare(b.option.name, 'th') || a.option.label.localeCompare(b.option.label, 'th'))
    .slice(0, limit)
    .map((entry) => entry.option)
}

// payload เดียวกับการกดชื่อช่างในตาราง "ช่างและค่าแรง" (ประเภท gold derive จากแผนก setting→80 / trim→50)
export function buildWorkerSearchPayload(option) {
  return buildWorkersTablePayload({ code: option?.code, name: option?.name, deptKey: option?.deptKey, employmentType: option?.employmentType })
}

// key ของ cache รายชื่อ = ช่วงเวลาที่ใช้ยิง Workers (ไม่ผูกตัวกรองแผนก/ประเภทการจ้างของหน้า)
export function buildWorkerSearchRangeKey(filter, isoOrNull) {
  return JSON.stringify([isoOrNull(filter?.start), isoOrNull(filter?.end)])
}

export function buildWorkerSearchRequestBody(filter, isoOrNull) {
  return { start: isoOrNull(filter?.start), end: isoOrNull(filter?.end) }
}
