/**
 * rfid-bind-logic — ตรรกะหน้าผูกแท็ก RFID ต่อเนื่อง (ฟังก์ชันล้วน ไม่แตะ state/DOM)
 *
 * tray  = Map epc -> { epc, firstSeen, lastSeen, hits }   (แท็กที่เครื่องอ่านเห็นล่าสุด)
 * known = Map epc -> { state: 'free' | 'bound' | 'sold', piece? }  (ผลตรวจกับระบบ GetByEpcs)
 * blocked = Set epc  (เพิ่งเลิกผูก — ห้ามผูกซ้ำจนกว่าแท็กจะหายจากถาด)
 * unit  = แถว ListUnits (+ epc / boundDate เมื่อผูกแล้ว)
 */
import { isSoldPiece } from '../rfid-basket/rfid-basket-status.js'
import { formatISOString } from '@/services/utils/dayjs.js'

export const ON_TRAY_MS = 1500
export const MIN_STABLE_BATCHES = 2
// ผลตรวจแท็ก "ผูกกับชิ้นอื่น/ขายแล้ว" หมดอายุหลังเวลานี้ แล้วตรวจกับระบบใหม่ (ฝั่งอื่นอาจเลิกผูกไปแล้ว)
export const KNOWN_TTL_MS = 5000
export const MAX_SELECT_ALL = 2000
export const PAGE_FETCH_SIZE = 500

export function normalizeEpcValue(epc) {
  return String(epc ?? '')
    .replace(/\s+/g, '')
    .toUpperCase()
}

// ---------- ถาด ----------

// รวมผลอ่านรอบใหม่เข้าถาด คืน Map ใหม่
export function updateTray(tray, batch) {
  const next = new Map(tray)
  for (const item of batch) {
    const prev = next.get(item.epc)
    next.set(item.epc, {
      epc: item.epc,
      firstSeen: prev ? prev.firstSeen : item.firstSeen,
      lastSeen: item.lastSeen,
      hits: (prev ? prev.hits : 0) + item.hits
    })
  }
  return next
}

// แท็กที่ยังอยู่บนถาด = เห็นภายใน ON_TRAY_MS
export function onTrayEpcs(tray, now, windowMs = ON_TRAY_MS) {
  const out = []
  for (const entry of tray.values()) {
    if (now - entry.lastSeen <= windowMs) out.push(entry.epc)
  }
  return out
}

// ตัดแท็กที่หายจากถาดนานเกินกรอบเวลาออก (กัน Map โตไม่จบ)
export function pruneTray(tray, now, keepMs = ON_TRAY_MS * 4) {
  const next = new Map()
  for (const [epc, entry] of tray) {
    if (now - entry.lastSeen <= keepMs) next.set(epc, entry)
  }
  return next
}

// EPC บนถาดที่ยังไม่เคยตรวจ (และไม่ได้กำลังตรวจ)
export function isKnownStale(entry, now) {
  if (!entry || entry.session) return false
  if (entry.state !== 'bound' && entry.state !== 'sold') return false
  return now - (entry.checkedAt || 0) > KNOWN_TTL_MS
}

// ยังไม่เคยตรวจ หรือผลเดิมเป็น bound/sold ที่หมดอายุ (แท็กที่ผูกในรอบนี้ไม่หมดอายุ)
export function epcsNeedingCheck(onTray, known, pending, now = Date.now()) {
  return onTray.filter((epc) => !pending.has(epc) && (!known.has(epc) || isKnownStale(known.get(epc), now)))
}

// ผล GetByEpcs -> Map epc -> known entry. EPC ที่ส่งไปแต่ไม่อยู่ในคำตอบถือว่า free (ยังไม่ผูก)
export function classifyCheckResult(result, sentEpcs = [], now = Date.now()) {
  const out = new Map()
  for (const epc of sentEpcs) out.set(normalizeEpcValue(epc), { state: 'free', checkedAt: now })
  for (const piece of result?.items || []) {
    const epc = normalizeEpcValue(piece.epc)
    out.set(epc, { state: isSoldPiece(piece) ? 'sold' : 'bound', piece, checkedAt: now })
  }
  return out
}

// ---------- ตัดสินใจ ----------

export function findCandidates(onTray, known, blocked) {
  return onTray.filter((epc) => known.get(epc)?.state === 'free' && !blocked.has(epc))
}

// streak = { epc, count } — นับ batch ติดกันที่มี candidate ใบเดียวเดิม
// isBatch=false (tick ตามเวลา): ไม่เพิ่มนับ แต่ถ้า candidate เปลี่ยน/หาย → รีเซ็ต
export function nextStreak(prev, candidates, isBatch) {
  if (candidates.length !== 1) return { epc: '', count: 0 }
  const epc = candidates[0]
  if (prev.epc === epc) return { epc, count: isBatch ? prev.count + 1 : prev.count }
  return { epc, count: isBatch ? 1 : 0 }
}

// status: done | waiting | pending | multi | taken | sold
// ignore = แท็กที่ผูกในรอบนี้และยังค้างบนถาด ไม่ต้องเตือนว่า "ผูกกับชิ้นอื่นแล้ว"
export function evaluateTray({ onTray, known, blocked, current, inFlight, streak, autoBind, ignore = new Set() }) {
  if (!current) return { status: 'done', candidates: [], bindEpc: null, other: null }
  const candidates = findCandidates(onTray, known, blocked)
  if (candidates.length > 1) return { status: 'multi', candidates, bindEpc: null, other: null }
  if (candidates.length === 1) {
    const epc = candidates[0]
    const stable = streak.epc === epc && streak.count >= MIN_STABLE_BATCHES
    const bindEpc = autoBind && stable && !inFlight ? epc : null
    return { status: 'pending', candidates, bindEpc, other: null }
  }
  const soldEpc = onTray.find((epc) => known.get(epc)?.state === 'sold')
  if (soldEpc) return { status: 'sold', candidates, bindEpc: null, other: known.get(soldEpc).piece, otherEpc: soldEpc }
  const takenEpc = onTray.find((epc) => known.get(epc)?.state === 'bound' && !ignore.has(epc))
  if (takenEpc) return { status: 'taken', candidates, bindEpc: null, other: known.get(takenEpc).piece, otherEpc: takenEpc }
  return { status: 'waiting', candidates, bindEpc: null, other: null }
}

// กดยืนยันเอง (ปิดออโต้): ผูกได้เมื่อมี candidate พอดี 1 ใบและไม่มี bind ค้าง
export function manualBindEpc(decision, inFlight) {
  if (inFlight || decision.status !== 'pending') return null
  return decision.candidates[0] || null
}

// ปล่อยแท็กที่ถูกบล็อกหลังเลิกผูก เมื่อหายจากถาดนานเกินกรอบเวลา
export function releaseBlocked(blocked, tray, now, goneMs = ON_TRAY_MS) {
  const next = new Set()
  for (const epc of blocked) {
    const entry = tray.get(epc)
    if (entry && now - entry.lastSeen <= goneMs) next.add(epc)
  }
  return next
}

// ---------- คิว ----------

export const isUnitBound = (unit) => !!unit && !!unit.epc

export function queueKey(unit) {
  return unit.unitId
}

export function countBound(queue) {
  return queue.filter(isUnitBound).length
}

// ชิ้นถัดไปที่ยังไม่ผูก: หาจาก fromIndex+1 ไปท้ายคิว แล้ววนกลับต้นคิว คืน -1 ถ้าครบ
export function nextUnboundIndex(queue, fromIndex) {
  for (let i = fromIndex + 1; i < queue.length; i++) if (!isUnitBound(queue[i])) return i
  for (let i = 0; i <= fromIndex && i < queue.length; i++) if (!isUnitBound(queue[i])) return i
  return -1
}

export function firstUnboundIndex(queue) {
  return queue.findIndex((unit) => !isUnitBound(unit))
}

export function markBound(queue, unitId, epc, boundDate = null) {
  return queue.map((unit) => (unit.unitId === unitId ? { ...unit, epc, boundDate } : unit))
}

export function markUnbound(queue, unitId) {
  return queue.map((unit) => {
    if (unit.unitId !== unitId) return unit
    const next = { ...unit }
    delete next.epc
    delete next.boundDate
    return next
  })
}

// รวมชิ้นที่เลือกเข้าคิว: append = ต่อท้ายคิวเดิม (ตัดชิ้นซ้ำ) · replace = คิวใหม่ทั้งหมด
export function mergeQueue(existing, incoming, mode) {
  if (mode === 'replace') return dedupeUnits(incoming)
  const seen = new Set(existing.map(queueKey))
  return [...existing, ...dedupeUnits(incoming).filter((unit) => !seen.has(queueKey(unit)))]
}

export function dedupeUnits(units) {
  const seen = new Set()
  const out = []
  for (const unit of units) {
    const key = queueKey(unit)
    if (seen.has(key)) continue
    seen.add(key)
    out.push(unit)
  }
  return out
}

// ชิ้นที่ยังไม่ผูกในคิวเดิม ที่จะหายไปเมื่อเริ่มคิวใหม่
export function unboundCount(queue) {
  return queue.filter((unit) => !isUnitBound(unit)).length
}

// ---------- เลขที่แสดง ----------

// เลขเด่น = เลขที่พิมพ์บนป้าย (เลขผลิตเก่าถ้ามี มิฉะนั้นเลขใหม่)
export function labelNumber(unit) {
  return unit?.stockNumberOrigin || unit?.stockNumber || ''
}

export function labelSecondary(unit) {
  return unit?.stockNumberOrigin && unit.stockNumber && unit.stockNumber !== unit.stockNumberOrigin ? unit.stockNumber : ''
}

// "3/6" (ชิ้นที่ n จากล็อต N) — ไม่มี lotQty คืนแค่เลขชิ้น
export function unitOfLot(unit) {
  if (!unit || unit.unitNo === null || unit.unitNo === undefined) return ''
  const qty = Number(unit.lotQty)
  return qty > 1 ? `${unit.unitNo}/${Number.isInteger(qty) ? qty : qty.toFixed(2)}` : ''
}

export function productName(unit, locale = 'th') {
  if (!unit) return ''
  const th = unit.productNameTh || ''
  const en = unit.productNameEn || ''
  return (locale === 'en' ? en || th : th || en) || ''
}

// ---------- ยิงป้าย ----------

function lotKey(unit) {
  return `${unit.stockNumber}|${unit.productCode}`
}

// ผล ResolveLabel -> การกระทำของหน้า
//   notFound | allBound | multi { lots } | jump { unitId } | append { unit }
export function decideLabelResult(items, queue) {
  if (!items || !items.length) return { kind: 'notFound' }
  const lots = new Map()
  for (const unit of items) {
    if (!lots.has(lotKey(unit))) lots.set(lotKey(unit), [])
    lots.get(lotKey(unit)).push(unit)
  }
  const open = [...lots.values()]
    .map((units) => ({ units, free: units.filter((u) => !isUnitBound(u)).sort((a, b) => a.unitNo - b.unitNo) }))
    .filter((lot) => lot.free.length > 0)
  if (!open.length) return { kind: 'allBound' }
  if (open.length > 1) {
    return {
      kind: 'multi',
      lots: open.map((lot) => ({ key: lotKey(lot.free[0]), unit: lot.free[0], freeCount: lot.free.length, units: lot.free }))
    }
  }
  return decideUnit(open[0].free[0], queue)
}

// เลือกล็อตจากรายการ multi แล้วตัดสินต่อ
export function decideUnit(unit, queue) {
  const inQueue = queue.some((q) => q.unitId === unit.unitId)
  return inQueue ? { kind: 'jump', unitId: unit.unitId } : { kind: 'append', unit }
}

// ---------- ตัวกรองหน้าเพิ่มสินค้าเข้าคิว ----------

export const DEFAULT_FILTERS = {
  stockNumber: '',
  stockNumberOrigin: '',
  productNumber: '',
  locationCodes: [],
  receiptPreset: '',
  tagStatus: 'unbound',
  productType: [],
  gold: [],
  goldSize: [],
  materials: [],
  receiptNumber: '',
  woText: '',
  wo: '',
  woNumber: '',
  mold: '',
  productName: '',
  size: '',
  receiptType: []
}

const ADVANCED_KEYS = ['productType', 'gold', 'goldSize', 'materials', 'receiptNumber', 'woText', 'mold', 'productName', 'size', 'receiptType']

export function hasFilterValue(value) {
  if (Array.isArray(value)) return value.length > 0
  return value !== null && value !== undefined && String(value).trim() !== ''
}

export function activeAdvancedKeys(filters) {
  return ADVANCED_KEYS.filter((key) => hasFilterValue(filters[key]))
}

// วันที่รับเข้า: today / 7d / 30d -> { from, to } (ISO +07:00 เวลาไทย) นับจากต้นวัน
export function receiptRange(preset, now = new Date()) {
  const days = { today: 0, '7d': 6, '30d': 29 }[preset]
  if (days === undefined) return {}
  const from = new Date(now)
  from.setHours(0, 0, 0, 0)
  from.setDate(from.getDate() - days)
  const to = new Date(now)
  to.setHours(23, 59, 59, 999)
  return { receiptDateFrom: formatISOString(from), receiptDateTo: formatISOString(to) }
}

// ตัวกรองหน้าจอ -> body ของ StockRfid/ListUnits (ส่งเฉพาะ key ที่มีค่า)
export function buildListRequest(filters, { skip = 0, take = 50 } = {}, now = new Date()) {
  const body = { tagStatus: filters.tagStatus || 'unbound', skip, take }
  const text = ['stockNumber', 'stockNumberOrigin', 'productNumber', 'receiptNumber', 'woText', 'mold', 'productName', 'size']
  for (const key of text) if (hasFilterValue(filters[key])) body[key] = String(filters[key]).trim()
  if (hasFilterValue(filters.wo) && /^\d+$/.test(String(filters.woNumber).trim())) {
    body.wo = String(filters.wo).trim()
    body.woNumber = Number(filters.woNumber)
  }
  const lists = ['locationCodes', 'productType', 'gold', 'goldSize', 'materials', 'receiptType']
  for (const key of lists) if (hasFilterValue(filters[key])) body[key] = [...filters[key]]
  if (body.materials && body.materials.length >= 2) body.materialMatchAll = true
  Object.assign(body, receiptRange(filters.receiptPreset, now))
  return body
}

// ---------- เก็บคิวใน localStorage ----------

export function queueStorageKey(username) {
  return `rfid-bind-queue:${username || 'anonymous'}`
}

export function parseStoredQueue(raw) {
  if (!Array.isArray(raw)) return []
  return dedupeUnits(raw.filter((unit) => unit && unit.unitId !== undefined && unit.unitId !== null && unit.stockNumber))
}

export const RESTORE_CHUNK = 500
export const CHECK_BACKOFF_MS = 3000

// เปลี่ยนชุดที่เลือกจากตาราง: ติ๊กหัวตารางออก (ผลเป็นว่าง) ให้เอาออกเฉพาะแถวของหน้าปัจจุบัน ไม่ล้างข้ามหน้า
export function applySelectionChange(previous, next, pageItems) {
  if (next.length > 0) return next
  const pageIds = new Set(pageItems.map((unit) => unit.unitId))
  return previous.filter((unit) => !pageIds.has(unit.unitId))
}

// EPC ที่ยังอยู่ในช่วงพักหลังตรวจไม่สำเร็จ ห้ามส่งซ้ำ
export function epcsOutsideBackoff(epcs, backoff, now) {
  return epcs.filter((epc) => !(backoff.get(epc) > now))
}

// เลขแผนผลิตจากช่องสแกน "<wo>/<woNumber>" (ตัด prefix WO ได้) -> { wo, woNumber, label } หรือ null
export function parsePlanCode(text) {
  const match = /^(?:wo\s*)?(\d+)\s*\/\s*(\d+)$/i.exec(String(text ?? '').trim())
  if (!match) return null
  return { wo: match[1], woNumber: Number(match[2]), label: `${match[1]}/${Number(match[2])}` }
}

// ช่วงวันที่รับเข้าของแท็บแผน ('' = ทั้งหมด) ใช้ชื่อ key เดียวกับ ListPlans
export function planRangeFor(preset, now = new Date()) {
  return receiptRange(preset, now)
}

// ต่อชิ้นของแผนท้ายคิว (ตัดซ้ำ) -> { queue, added, firstIndex } firstIndex = ชิ้นแรกที่ยังไม่ผูกของแผนในคิวใหม่ (-1 ถ้าไม่มี)
export function mergePlanUnits(queue, units) {
  const next = mergeQueue(queue, units, 'append')
  const ids = new Set(units.map((unit) => unit.unitId))
  return {
    queue: next,
    added: next.length - queue.length,
    firstIndex: next.findIndex((unit) => ids.has(unit.unitId) && !isUnitBound(unit))
  }
}

// ตัด prefix "WO" ออกจากช่องค้นแผน (เหมือน parsePlanCode)
export function normalizePlanSearch(text) {
  return String(text ?? '')
    .trim()
    .replace(/^wo\s*/i, '')
}

// ชิ้นปัจจุบันเปลี่ยนจากการสแกนแผน/เพิ่มจาก modal: แท็กทุกใบที่อยู่บนถาดตอนนี้ห้ามผูกกับชิ้นใหม่
// จนกว่าจะยกออกแล้ววางใหม่ (รวมแท็กที่ยังไม่ได้ตรวจกับระบบ) -> Set ใหม่
export function blockEpcsOnTray(blocked, onTray) {
  const next = new Set(blocked)
  for (const epc of onTray) next.add(epc)
  return next
}

// "6906025/21" จากชิ้น (มี wo + woNumber) ไม่มีคืนค่าว่าง
export function planTextOf(unit) {
  if (!unit || !unit.wo || unit.woNumber === null || unit.woNumber === undefined || unit.woNumber === '') return ''
  return `${unit.wo}/${unit.woNumber}`
}

// แผนอยู่ในคิวครบหรือยัง: ชิ้นที่ยังไม่ผูกของแผนในคิว >= จำนวนที่ยังไม่ผูกตาม ListPlans
export function isPlanQueued(queue, plan) {
  const inQueue = queue.filter((unit) => unit.wo === plan.wo && String(unit.woNumber) === String(plan.woNumber) && !isUnitBound(unit)).length
  return plan.unboundUnits > 0 ? inQueue >= plan.unboundUnits : inQueue > 0
}

// หลังผูกสำเร็จ: ขยับไปชิ้นถัดไปเฉพาะเมื่อชิ้นปัจจุบันยังเป็นชิ้นที่เพิ่งผูก (ถ้าผู้ใช้ย้ายไปชิ้นอื่นระหว่างรอ ให้อยู่ที่เดิม)
export function indexAfterBound(queue, currentIndex, boundUnitId) {
  if (queue[currentIndex]?.unitId !== boundUnitId) return currentIndex
  return nextUnboundIndex(queue, currentIndex)
}

// หลังเพิ่มเข้าคิวจาก modal: ต่อท้าย + ชิ้นปัจจุบันยังไม่ผูก -> คงชิ้นเดิม ไม่เช่นนั้นไปชิ้นแรกที่ยังไม่ผูก
export function indexAfterMerge(queue, previousUnitId, mode) {
  if (mode === 'append' && previousUnitId !== undefined && previousUnitId !== null) {
    const index = queue.findIndex((unit) => unit.unitId === previousUnitId)
    if (index >= 0 && !isUnitBound(queue[index])) return index
  }
  return firstUnboundIndex(queue)
}

// ตรวจซ้ำ (TTL) แล้วแท็กจาก bound/sold กลายเป็น free ขณะยังอยู่บนถาด -> ต้องยกออกแล้ววางใหม่ก่อนผูก
export function shouldBlockAfterRecheck(previous, next) {
  return !!previous && !previous.session && (previous.state === 'bound' || previous.state === 'sold') && next.state === 'free'
}
