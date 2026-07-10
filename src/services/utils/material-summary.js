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
  if (m.type === 'Diamond') {
    return code ? `DIAMOND (${code})` : 'DIAMOND'
  }
  // Gem
  return code ? code.toUpperCase() : 'GEM'
}

export function summarizeMaterials(materials = []) {
  const list = Array.isArray(materials) ? materials : []
  const order = { Gold: 0, Diamond: 1, Gem: 2 }
  const groups = new Map()
  for (const m of list) {
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
      const wUnit = g.weightUnit || (g.type === 'Gold' ? 'g.' : 'ct.')
      const qUnit = g.qtyUnit || 'pcs'
      const pcs = Math.round(g.qty)
      return {
        type: g.type,
        name: g.name,
        qty: g.type === 'Gold' || !pcs ? '' : `${pcs} ${qUnit}`,
        weight: `${g.weight.toFixed(2)} ${wUnit}`
      }
    })
}
