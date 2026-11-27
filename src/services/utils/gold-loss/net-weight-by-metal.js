export function purityKey(gold, goldSize) {
  if (gold === 'SV') return 'SILVER'
  if (goldSize && String(goldSize).toLowerCase() === 'silver') return 'SILVER'
  return goldSize || gold || ''
}

export function splitNetWeightByMetal(typeSummaries) {
  let gold = null
  let silver = null
  for (const row of typeSummaries || []) {
    const type = row.goldType ?? row.goldSize ?? row.gold
    const net = Number(row.netWeight) || 0
    if (purityKey(row.gold, type) === 'SILVER') silver = (silver ?? 0) + net
    else gold = (gold ?? 0) + net
  }
  return { gold, silver }
}
