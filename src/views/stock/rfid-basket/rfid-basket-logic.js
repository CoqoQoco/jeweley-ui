/**
 * rfid-basket-logic — ตรรกะตะกร้าอ่านแท็ก (พอร์ตจาก dk-mobile basket-logic.ts) ฟังก์ชันล้วน ไม่แตะ state
 *
 * entry = { epc, rssi?, hits, firstSeen, lastSeen, check: 'unchecked'|'found'|'unbound', piece? }
 */
import { formatDecimal } from '@/services/utils/decimal.js'
import { isSoldPiece } from './rfid-basket-status.js'

export const CHECK_BATCH_SIZE = 100
export const CHECK_DEBOUNCE_MS = 600
export const NEW_BADGE_MS = 4000

function hasValue(value) {
  return value !== undefined && value !== null
}

function isStronger(next, current) {
  return hasValue(next) && (!hasValue(current) || next > current)
}

// รวมผลอ่านที่สะสมไว้ทีเดียว: EPC ใหม่ขึ้นบนสุด (ตัวแรกที่อ่านเจออยู่ล่างสุดของกลุ่มใหม่) EPC เดิมอยู่ที่เดิม
export function applyReads(entries, batch) {
  if (!batch.length) return entries
  const items = new Map(batch.map((item) => [item.epc, item]))
  const known = new Set()
  const updated = entries.map((entry) => {
    known.add(entry.epc)
    const item = items.get(entry.epc)
    if (!item) return entry
    return {
      ...entry,
      rssi: isStronger(item.rssi, entry.rssi) ? item.rssi : entry.rssi,
      hits: entry.hits + item.hits,
      lastSeen: item.lastSeen
    }
  })
  const fresh = []
  for (const item of batch) {
    if (known.has(item.epc)) continue
    fresh.unshift({
      epc: item.epc,
      rssi: hasValue(item.rssi) ? item.rssi : undefined,
      hits: item.hits,
      firstSeen: item.firstSeen,
      lastSeen: item.lastSeen,
      check: 'unchecked'
    })
  }
  return [...fresh, ...updated]
}

export function removeEntry(entries, epc) {
  return entries.filter((entry) => entry.epc !== epc)
}

export function uncheckedEpcs(entries) {
  return entries.filter((entry) => entry.check === 'unchecked').map((entry) => entry.epc)
}

export function allEpcs(entries) {
  return entries.map((entry) => entry.epc)
}

export function chunkEpcs(epcs, size = CHECK_BATCH_SIZE) {
  const chunks = []
  for (let i = 0; i < epcs.length; i += size) chunks.push(epcs.slice(i, i + size))
  return chunks
}

// found -> piece, notFound -> unbound. EPC ที่ส่งไปตรวจแต่ไม่อยู่ในคำตอบทั้งสองส่วน (backend ทิ้งแท็กที่รูปแบบไม่ถูกต้อง)
// ถือว่าตรวจแล้วและไม่ผูก ไม่ปล่อยค้าง "ยังไม่ตรวจ" จนถูกส่งซ้ำไม่จบ — sentEpcs = EPC ที่ส่งไปในรอบนั้น
export function applyCheckResult(entries, result, sentEpcs = []) {
  const pieces = new Map()
  for (const piece of result?.items || []) pieces.set(String(piece.epc).toUpperCase(), piece)
  const unbound = new Set((result?.notFound || []).map((epc) => String(epc).toUpperCase()))
  const sent = new Set(sentEpcs)
  return entries.map((entry) => {
    const piece = pieces.get(entry.epc)
    if (piece) return { ...entry, check: 'found', piece }
    if (unbound.has(entry.epc) || sent.has(entry.epc)) return { ...entry, check: 'unbound', piece: undefined }
    return entry
  })
}

export function countEntries(entries) {
  const bound = entries.filter((entry) => entry.check === 'found').length
  const unbound = entries.filter((entry) => entry.check === 'unbound').length
  return { total: entries.length, bound, unbound, unchecked: entries.length - bound - unbound }
}

// สรุปสินค้าที่ผูกแล้ว (ไม่รวมชิ้นที่ขายแล้ว): products = stockNumber + productCode ไม่ซ้ำ,
// pieces = จำนวนชิ้นที่อยู่ในตะกร้า (unitId ไม่ซ้ำ ถ้าไม่มี unitId นับ 1 ต่อแท็ก)
export function summarizeBound(entries) {
  const products = new Set()
  const pieces = new Set()
  for (const entry of entries) {
    if (entry.check !== 'found' || !entry.piece || isSoldPiece(entry.piece)) continue
    products.add(`${entry.piece.stockNumber}|${entry.piece.productCode}`)
    const unitId = entry.piece.unitId
    pieces.add(unitId !== undefined && unitId !== null ? `u${unitId}` : `e${entry.epc}`)
  }
  return { products: products.size, pieces: pieces.size }
}

// จำนวนในล็อต: เลขเต็มไม่มีทศนิยม มีเศษแสดง 2 ตำแหน่ง
export function formatLotQty(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return ''
  return formatDecimal(n, Number.isInteger(n) ? 0 : 2)
}

export function filterEntries(entries, filter) {
  if (filter === 'bound') return entries.filter((entry) => entry.check === 'found')
  if (filter === 'unbound') return entries.filter((entry) => entry.check === 'unbound')
  if (filter === 'unchecked') return entries.filter((entry) => entry.check === 'unchecked')
  return [...entries]
}

// "…" + 12 ตัวท้ายแบ่งกลุ่มละ 4; EPC สั้นแสดงเต็ม
export function shortEpc(epc) {
  if (epc.length <= 12) return epc
  return `…${epc.slice(-12).match(/.{4}/g).join(' ')}`
}

// หนึ่ง EPC ต่อบรรทัด
export function epcListText(entries) {
  return entries.map((entry) => entry.epc).join('\n')
}

export function isNewEntry(entry, now) {
  return now - entry.firstSeen < NEW_BADGE_MS
}

export function formatElapsed(totalSec) {
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
