// ชื่ออังกฤษของ typeCode โลหะ (mirror tbm_gold) — ใช้พิมพ์บนป้ายแทนคำคงที่ "Gold"/"Silver"
const GOLD_TYPE_NAME_EN = {
  WG: 'White Gold',
  YG: 'Yellow Gold',
  PG: 'Pink Gold',
  NG: 'Y/P Gold',
  MG: 'W/P Gold',
  SV: 'Silver'
}

export function goldTypeNameEn(typeCode) {
  const code = String(typeCode ?? '')
    .trim()
    .toUpperCase()
  return GOLD_TYPE_NAME_EN[code] || ''
}

// คำท้ายข้อความที่ต้องใช้: ชื่อจาก typeCode ถ้ามี ไม่งั้น fallback เป็น type เดิม (Gold/Silver)
export function resolveGoldTypeWord(type, typeCode) {
  return goldTypeNameEn(typeCode) || type || ''
}

// แทนคำท้าย "Gold"/"Silver" ของข้อความที่บันทึกไว้แล้ว (เช่น "1.72 g. Gold") ด้วยชื่อจาก typeCode
// ไม่มี typeCode / ไม่รู้จัก / ไม่มีคำท้าย (silver plan ที่ตัดคำออก) = คืนข้อความเดิม
export function applyGoldTypeName(text, typeCode) {
  const name = goldTypeNameEn(typeCode)
  if (!text || !name) return text
  return text.replace(/(\s)(Gold|Silver)$/i, `$1${name}`)
}
