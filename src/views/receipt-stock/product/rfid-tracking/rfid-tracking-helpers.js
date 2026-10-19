export const RECENT_FEED_CAP = 30

export function pieceKey(item) {
  return `${item.stockNumber}|${item.productCode}`
}

export function mapPieces(items) {
  return (items || []).map((item) => ({
    ...item,
    rowKey: pieceKey(item),
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
