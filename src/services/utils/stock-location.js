// ล็อตเดียวหลายคลัง (TK202610290003) — helper กลางสำหรับอ่าน locations[] และสร้าง payload MoveUnits
export function getLocationCount(item) {
  const n = Number(item?.locationCount)
  if (Number.isFinite(n) && n > 0) return n
  const len = Array.isArray(item?.locations) ? item.locations.length : 0
  return len > 0 ? len : 1
}

export function isMultiLocation(item) {
  return getLocationCount(item) > 1
}

// ล็อตเดียวที่ต้องให้เลือกวิธีย้าย: qty > 1 หรือกระจายหลายคลัง
export function needsMoveChoice(item) {
  const qty = Number(item?.qty)
  return (Number.isFinite(qty) && qty > 1) || isMultiLocation(item)
}

// คลังที่เหลือจริง (qty > 0) เรียงตามจำนวนมากไปน้อย
export function getLocationRows(item) {
  const rows = Array.isArray(item?.locations) ? item.locations : []
  return rows.filter((r) => Number(r?.qty) > 0)
}

export function getExtraLocationCount(item) {
  return Math.max(getLocationCount(item) - 1, 0)
}

// plan: { stockNumber, mode: 'whole' | 'qty' | 'units', fromLocationCode?, qty?, unitIds? }
export function buildMoveUnitsItem(plan) {
  const item = { stockNumber: plan.stockNumber }
  if (plan.mode === 'units') {
    item.unitIds = [...(plan.unitIds || [])]
  } else if (plan.mode === 'qty') {
    item.fromLocationCode = plan.fromLocationCode
    item.qty = Number(plan.qty)
  }
  return item
}

export function buildMoveUnitsPayload({ targetLocationCode, remark, plans }) {
  return {
    targetLocationCode,
    remark: remark || undefined,
    items: (plans || []).map(buildMoveUnitsItem)
  }
}

// ตรวจแผนก่อนยิง — คืน null ถ้าผ่าน หรือ error key ('qty' | 'units')
export function validateMovePlan(plan, maxQty) {
  if (plan.mode === 'qty') {
    const q = Number(plan.qty)
    if (!plan.fromLocationCode || !Number.isInteger(q) || q < 1 || (maxQty != null && q > maxQty)) return 'qty'
  }
  if (plan.mode === 'units' && !(plan.unitIds || []).length) return 'units'
  return null
}

// SO / invoice: ส่ง locationCode เฉพาะเมื่อ user เลือกเอง (ว่าง = server เลือก) — ไม่เปลี่ยน payload ล็อตคลังเดียว
export function withLocationCode(payload, locationCode) {
  return locationCode ? { ...payload, locationCode } : payload
}
