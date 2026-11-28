const keyOf = (code, wo, woNumber) => `${code}|${wo}|${woNumber}`

// แถวเบิกใหม่ (ยังไม่เคยบันทึก) ที่เลือกใบงานแล้ว -> รายการส่ง CheckDuplicateOutbound (ไม่ซ้ำ)
export function buildCheckItems(gemsReturn) {
  const seen = new Set()
  const items = []
  for (const gem of gemsReturn || []) {
    for (const out of gem.gemsOutbound || []) {
      const plan = out.productionPlan
      if (out.isAlreadyOutbound || !plan?.wo) continue
      const key = keyOf(gem.code, plan.wo, plan.woNumber)
      if (seen.has(key)) continue
      seen.add(key)
      items.push({ code: gem.code, wo: plan.wo, woNumber: plan.woNumber })
    }
  }
  return items
}

// รวมผลเบิกเดิม + ยอดที่กำลังจะเบิกครั้งนี้ เป็นแถวสำหรับ modal ยืนยัน
export function buildDuplicateRows(gemsReturn, duplicates) {
  const rows = new Map()
  for (const d of duplicates || []) {
    const key = keyOf(d.code, d.wo, d.woNumber)
    if (!rows.has(key)) {
      rows.set(key, { key, code: d.code, plan: `${d.wo}-${d.woNumber}`, wo: d.wo, woNumber: d.woNumber, previous: [], nowQty: 0, nowWeight: 0 })
    }
    rows.get(key).previous.push({
      running: d.outboundRunning,
      date: d.outboundDate,
      qty: d.qty,
      weight: d.weight
    })
  }
  for (const gem of gemsReturn || []) {
    for (const out of gem.gemsOutbound || []) {
      const plan = out.productionPlan
      if (out.isAlreadyOutbound || !plan?.wo) continue
      const row = rows.get(keyOf(gem.code, plan.wo, plan.woNumber))
      if (!row) continue
      row.nowQty += Number(out.issueQty) || 0
      row.nowWeight += Number(out.issueQtyWeight) || 0
    }
  }
  return [...rows.values()]
}
