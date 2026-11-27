/**
 * stock-tag-logic — ตรรกะโหมดอ่านแท็ก + ป้ายสถานะแท็กของหน้าตรวจคลัง (ฟังก์ชันล้วน)
 *
 * entry = รูปแบบเดียวกับ rfid-basket-logic: { epc, check: 'unchecked'|'found'|'unbound', piece? }
 */
import { isSoldPiece } from '../../rfid-basket/rfid-basket-status.js'

export const MAX_TAG_PIECES = 500

function pieceKey(piece) {
  return `${piece.stockNumber}|${piece.productCode}`
}

// ชิ้นที่อ่านเจอ -> คู่ { stockNumber, productCode } ไม่ซ้ำ (ลำดับตามที่อ่าน) ไม่เกิน MAX_TAG_PIECES
export function piecesFromEntries(entries, max = MAX_TAG_PIECES) {
  const seen = new Set()
  const pieces = []
  for (const entry of entries) {
    const piece = entry.check === 'found' ? entry.piece : null
    if (!piece || !piece.stockNumber || piece.productCode === undefined || piece.productCode === null) continue
    const key = pieceKey(piece)
    if (seen.has(key)) continue
    seen.add(key)
    pieces.push({ stockNumber: piece.stockNumber, productCode: piece.productCode })
    if (pieces.length >= max) break
  }
  return pieces
}

// key เปรียบเทียบว่าชุดคู่เปลี่ยนไหม (ไม่สนลำดับ)
export function piecesSignature(pieces) {
  return pieces.map(pieceKey).sort().join(',')
}

// อ่านได้ N · พบสินค้า M (ล็อตไม่ซ้ำ) · ไม่รู้จัก K · แท็กของชิ้นที่ขายแล้ว S · pending = ยังไม่ตรวจ
export function summarizeTagReads(entries) {
  const lots = new Set()
  let unknown = 0
  let sold = 0
  let pending = 0
  for (const entry of entries) {
    if (entry.check === 'found' && entry.piece) {
      lots.add(pieceKey(entry.piece))
      if (isSoldPiece(entry.piece)) sold += 1
    } else if (entry.check === 'unbound') {
      unknown += 1
    } else {
      pending += 1
    }
  }
  return { read: entries.length, found: lots.size, unknown, sold, pending }
}

// ป้ายคอลัมน์ "แท็ก": kind = bound | unbound | partial | none (none = ไม่มีข้อมูล/ไม่มีชิ้นให้ผูก)
export function tagBadgeState(row) {
  const total = Number(row?.tagTotalUnits)
  const bound = Number(row?.tagBoundUnits ?? 0)
  if (row?.tagTotalUnits === undefined || row?.tagTotalUnits === null || !Number.isFinite(total) || total <= 0) {
    return { kind: 'none', bound: 0, total: 0 }
  }
  const safeBound = Number.isFinite(bound) ? Math.min(Math.max(bound, 0), total) : 0
  if (safeBound >= total) return { kind: 'bound', bound: safeBound, total }
  if (safeBound === 0) return { kind: 'unbound', bound: 0, total }
  return { kind: 'partial', bound: safeBound, total }
}

// ลิงก์ไปหน้าผูกแท็กของชิ้นนี้
export function bindLocation(stockNumber, productCode) {
  const query = { stock: stockNumber }
  if (productCode) query.productCode = productCode
  return { path: '/stock/rfid-bind', query }
}
