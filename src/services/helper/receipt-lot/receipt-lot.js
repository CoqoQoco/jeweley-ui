// receipt-lot.js — ตัวช่วยกลางของการรับสินค้าแบบ "เติมเข้าล็อตเดิม" (งานผลิต / งานนอก)

export function isSilverMetal(value) {
  const t = String(value ?? '').trim().toUpperCase()
  if (!t) return false
  return t === 'SV' || t === 'SILVER' || t.startsWith('SIL')
}

// ชนิดของใบผลิตจาก GetPlan อยู่ในฟิลด์ gold (ไม่ใช่ type)
export function isSilverPlanData(plan) {
  return isSilverMetal(plan?.gold)
}

export const SILVER_PRODUCTION_TYPE = 'SV'

export function hasSilverMaterial(materials) {
  return Array.isArray(materials) && materials.some((m) => String(m?.type ?? '').trim().toUpperCase() === 'SILVER')
}

// สีทองที่ใช้ตัดสินงานเงิน — ว่างแต่มีวัสดุ Silver -> SV; ถ้าผู้ใช้เลือกสีทองไว้แล้วไม่ทับ
export function resolveProductionType(row) {
  const current = row?.productionType
  if (String(current ?? '').trim()) return current
  return hasSilverMaterial(row?.materials) ? SILVER_PRODUCTION_TYPE : current
}

function normalizeLocation(value) {
  return String(value ?? '').trim().toUpperCase()
}

// คืน key ของข้อความ error (หรือ null ถ้าผ่าน) — ทอง 1 รหัส = 1 ชิ้น, เงินต้องเป็นจำนวนเต็ม >= 1
export function validateReceiptQty({ isSilver, qty }) {
  if (qty === null || qty === undefined || qty === '') return 'required'
  const num = Number(qty)
  if (!Number.isFinite(num)) return 'required'
  if (isSilver) {
    return Number.isInteger(num) && num >= 1 ? null : 'silverQty'
  }
  return num === 1 ? null : 'goldQty'
}

// ล็อตนี้เติมได้ไหม — reason: 'location' | 'metal' | null
export function evaluateTopUp({ lot, rowLocation, rowIsSilver }) {
  if (!lot) return { canTopUp: false, reason: null }
  if (normalizeLocation(lot.locationCode) !== normalizeLocation(rowLocation)) {
    return { canTopUp: false, reason: 'location' }
  }
  if (isSilverMetal(lot.productionType) !== !!rowIsSilver) {
    return { canTopUp: false, reason: 'metal' }
  }
  return { canTopUp: true, reason: null }
}

// ค่าเริ่มต้นหลังค้นหา: เงิน + เจอล็อตเดียวที่เติมได้ -> เติม; นอกนั้น (รวมทอง) -> สร้างเลขใหม่ (null)
export function pickDefaultLot({ lots, rowLocation, rowIsSilver }) {
  if (!rowIsSilver || !Array.isArray(lots) || lots.length !== 1) return null
  return evaluateTopUp({ lot: lots[0], rowLocation, rowIsSilver }).canTopUp ? lots[0] : null
}

export function normalizeProductNumber(value) {
  return String(value ?? '').trim().toUpperCase()
}

function isSoldLot(lot) {
  return String(lot?.status ?? '').trim().toUpperCase() === 'SOLD'
}

// ล็อตที่เติมได้จากผลแนะนำตามรหัสสินค้า (เงินเท่านั้น)
export function filterTopUpCandidates({ lots, rowLocation, rowIsSilver }) {
  if (!rowIsSilver || !Array.isArray(lots)) return []
  return lots.filter((lot) => evaluateTopUp({ lot, rowLocation, rowIsSilver }).canTopUp)
}

// ขนาด: trim + upper + ตัด '#' นำหน้า; '', '#', '0', null = ว่าง
export function normalizeSize(value) {
  const t = String(value ?? '').trim().toUpperCase().replace(/^#/, '').trim()
  return t === '0' ? '' : t
}

// ขนาด/แป้น/ก้านต่างหูต้องตรงกันเป๊ะหลัง normalize (ว่างทั้งคู่ = ตรง, ว่างฝั่งเดียว = ไม่ตรง)
export function isSameSpec({ lot, rowSize, rowStud, rowStem }) {
  return (
    normalizeSize(lot?.size) === normalizeSize(rowSize) &&
    normalizeSize(lot?.studEarring) === normalizeSize(rowStud) &&
    normalizeSize(lot?.earringStemSize) === normalizeSize(rowStem)
  )
}

// เลือกล็อตอัตโนมัติจากผลแนะนำ: เงินเท่านั้น, ต้องตรงทั้งคลัง/โลหะ/ขนาด/แป้น/ก้าน,
// ถ้าล็อตเงินของรหัสนี้มีหลายขนาด -> ไม่เลือกให้ (ให้ผู้ใช้เลือกเอง),
// ล็อตที่ยังไม่ SOLD มีล็อตเดียว -> เลือก, ไม่มีล็อตที่ยังไม่ SOLD และมี SOLD ล็อตเดียว -> เลือก,
// นอกนั้น (กำกวม/สเปกไม่ตรง) -> null
export function pickSuggestedLot({ lots, rowLocation, rowIsSilver, rowSize, rowStud, rowStem }) {
  const silverLots = filterTopUpCandidates({ lots, rowLocation, rowIsSilver })
  if (new Set(silverLots.map((lot) => normalizeSize(lot.size))).size > 1) return null

  const candidates = silverLots.filter((lot) => isSameSpec({ lot, rowSize, rowStud, rowStem }))
  const active = candidates.filter((lot) => !isSoldLot(lot))
  if (active.length === 1) return active[0]
  if (active.length > 1) return null
  const sold = candidates.filter(isSoldLot)
  return sold.length === 1 ? sold[0] : null
}
