import { isSilverMetal } from '@/services/helper/sale-material-columns.js'

const num = (v) => Number(v) || 0

// ชื่อวัสดุ (Latin) จาก typeCode — เรนเดอร์ได้ใน AcherusGrotesque
function resolveName(m) {
  const code = (m.typeCode || m.typeName || '').trim()
  if (m.type === 'Gold') {
    const u = code.toUpperCase()
    if (u === 'WG') return 'WHITE GOLD'
    if (u === 'YG') return 'YELLOW GOLD'
    if (u === 'PG' || u === 'RG') return 'PINK GOLD'
    return code ? code.toUpperCase() : 'GOLD'
  }
  if (m.type === 'Silver') {
    return code ? code.toUpperCase() : 'SILVER'
  }
  if (m.type === 'Diamond') {
    return code ? `DIAMOND (${code})` : 'DIAMOND'
  }
  // Gem — type_code บางเคสในข้อมูลจริงเป็นเกรดเพชรที่ติดมาผิด (เช่น 'G,VS1') ไม่ใช่ชื่อพลอย
  // ใช้ typeOrigin (ชื่อพลอยจริง เช่น 'Morganite') ก่อนเสมอ แล้วค่อย fallback ไป typeCode
  const gemName = (m.typeOrigin || m.typeCode || '').trim()
  return gemName ? gemName.toUpperCase() : 'GEM'
}

export function summarizeMaterials(materials = []) {
  const list = Array.isArray(materials) ? materials : []
  const order = { Gold: 0, Silver: 1, Diamond: 2, Gem: 3 }
  const groups = new Map()
  for (const raw of list) {
    const m = isSilverMetal(raw) && raw.type !== 'Silver' ? { ...raw, type: 'Silver', typeCode: raw.typeCode?.trim() ? raw.typeCode : raw.typeOrigin } : raw
    if (!(m.type in order)) continue
    const name = resolveName(m)
    const key = `${m.type}|${name}`
    const g = groups.get(key) || { type: m.type, name, qty: 0, weight: 0, qtyUnit: '', weightUnit: '' }
    g.qty += num(m.qty)
    g.weight += num(m.weight)
    if (!g.qtyUnit && m.qtyUnit) g.qtyUnit = m.qtyUnit
    if (!g.weightUnit && m.weightUnit) g.weightUnit = m.weightUnit
    groups.set(key, g)
  }
  return [...groups.values()]
    .sort((a, b) => order[a.type] - order[b.type])
    .map((g) => {
      const wUnit = g.weightUnit || (g.type === 'Gold' || g.type === 'Silver' ? 'g.' : 'ct.')
      const qUnit = g.qtyUnit || 'pcs'
      const pcs = Math.round(g.qty)
      return {
        type: g.type,
        name: g.name,
        qty: g.type === 'Gold' || g.type === 'Silver' || !pcs ? '' : `${pcs} ${qUnit}`,
        weight: `${g.weight.toFixed(2)} ${wUnit}`
      }
    })
}
