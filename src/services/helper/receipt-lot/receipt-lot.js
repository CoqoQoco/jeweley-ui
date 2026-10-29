// receipt-lot.js — ตัวช่วยกลางของการรับสินค้าแบบ "เติมเข้าล็อตเดิม" (งานผลิต / งานนอก)

export function isSilverMetal(value) {
  const t = String(value ?? '').trim().toUpperCase()
  if (!t) return false
  return t === 'SV' || t === 'SILVER' || t.startsWith('SIL')
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
