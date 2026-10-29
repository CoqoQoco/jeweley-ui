export const RECENT_FEED_CAP = 30

export function lotKey(item) {
  return `${item.stockNumber}|${item.productCode}`
}

// 1 ล็อตมีหลายแถว (1 แถว = 1 ชิ้น) → key ต้องไม่ซ้ำต่อชิ้น (unitId); ไม่มี unitId (ข้อมูลเก่า) ใช้ key ล็อต
export function pieceKey(item) {
  return item.unitId !== null && item.unitId !== undefined ? `u${item.unitId}` : lotKey(item)
}

// "3/6" — ไม่มีเลขชิ้น คืน '-'
export function formatUnitLabel(unitNo, total) {
  if (unitNo === null || unitNo === undefined) return '-'
  return total ? `${unitNo}/${total}` : String(unitNo)
}

export function mapPieces(items) {
  const list = items || []
  const lotSizes = new Map()
  list.forEach((item) => lotSizes.set(lotKey(item), (lotSizes.get(lotKey(item)) || 0) + 1))
  return list.map((item) => ({
    ...item,
    rowKey: pieceKey(item),
    unitLabel: formatUnitLabel(item.unitNo, lotSizes.get(lotKey(item))),
    isBound: !!item.epc,
    boundBy: item.boundBy || '-',
    epc: item.epc || '-'
  }))
}

export function filterPieces(pieces, filter) {
  if (filter === 'bound') return pieces.filter((p) => p.isBound)
  if (filter === 'unbound') return pieces.filter((p) => !p.isBound)
  return pieces
}

// คืน { [rowKey]: true } ของชิ้นที่สถานะผูก/EPC เปลี่ยนจากรอบก่อน (prev = null → ยังไม่มีรอบก่อน ไม่ถือว่าเปลี่ยน)
export function diffChangedKeys(prevPieces, nextPieces) {
  const changed = {}
  if (!prevPieces) return changed
  const prevMap = new Map(prevPieces.map((p) => [p.rowKey, p]))
  nextPieces.forEach((p) => {
    const before = prevMap.get(p.rowKey)
    if (before && (before.isBound !== p.isBound || before.epc !== p.epc)) changed[p.rowKey] = true
  })
  return changed
}

// รวมรายการ feed: ใหม่อยู่บนสุด, ไม่ซ้ำ id, ตัดเหลือ cap
// incoming = ผลจาก ListRecent (sinceId → เรียงเก่า→ใหม่, ไม่มี sinceId → ใหม่→เก่า)
export function mergeRecent(current, incoming, { initial = false, cap = RECENT_FEED_CAP } = {}) {
  const newestFirst = initial ? [...incoming] : [...incoming].reverse()
  const incomingIds = new Set(newestFirst.map((i) => i.id))
  const kept = initial ? [] : current.filter((i) => !incomingIds.has(i.id))
  return [...newestFirst, ...kept].slice(0, cap)
}
