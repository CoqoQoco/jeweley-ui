// materials-helpers.js — pure logic ของหมวด "วัตถุดิบที่กระทบการผลิต" (ProductionInsight/Materials — พลอย
// อย่างเดียว ตามที่ user ยืนยัน) — ห้าม import Vue/i18n ที่นี่ (เหมือน workers-helpers.js/capacity-helpers.js)

export const MATERIALS_GEM_STATUS_VALUES = ['ready', 'short', 'unmatched']

// ชื่อพลอย/รูปทรงจาก master data (useMasterApiStore().gem/gemShape) — ตามที่สั่ง "translate ผ่าน gem master
// ถ้ามี store/helper อยู่แล้ว ไม่งั้นโชว์ code ดิบ" — gem master ใช้ field `nameTh` (ยืนยันจาก
// plan-bom-view.vue), gemShape master ใช้ field `description` (ยืนยันจาก gems-section.vue) — คนละ field
// name กัน ไม่ใช่ `nameTh` ทั้งคู่
export function resolveGemName(masterGemList, code) {
  if (!code) return ''
  const match = (masterGemList || []).find((g) => g.code === code)
  return match?.nameTh || code
}

export function resolveGemShapeName(masterGemShapeList, code) {
  if (!code) return ''
  const match = (masterGemShapeList || []).find((s) => s.code === code)
  return match?.description || code
}

// เปอร์เซ็นต์จับคู่สเปกได้ (KPI card 4) — คืน null เมื่อไม่มีข้อมูล (totalLines ว่าง/เป็น 0) กัน 0/0 = NaN
export function resolveMatchedLinesPercent(matchedLines, totalLines) {
  if (!totalLines) return null
  return (matchedLines / totalLines) * 100
}

// สีชิปสถานะพลอยต่อรายการ/ต่อแผน (gemStatus ของ MaterialWaitingPlans, status ของ MaterialGemDemand) — ใช้
// token เดียวกับที่อื่นในแอป (green=พร้อม, warning=ไม่พอ, grey=ไม่พบสเปก)
export function resolveGemStatusVariant(status) {
  if (status === 'ready') return 'green'
  if (status === 'short') return 'warning'
  if (status === 'unmatched') return 'grey'
  return 'grey'
}

// key ของ i18n namespace materials.gemStatus.* — status='unmatched' แยก 2 แบบตาม unmatchedReason (ยืนยันจาก
// API agent 2026-10-02): 'gem' = ไม่รู้จักชนิดพลอยเลย ('ไม่พบสเปก (ชนิด)'), 'spec' = รู้จักชนิดแต่รูปทรง/ขนาด
// ไม่ตรง ('ไม่พบสเปก (ขนาด/รูปทรง)') — ไม่ใช่ unmatchedReason ที่รู้จัก (หรือไม่มีค่า) fallback ไปคีย์ 'unmatched'
// เดิม (ข้อความกลางๆ "ไม่พบสเปก" เฉยๆ)
export function resolveGemStatusLabelKey(status, unmatchedReason) {
  if (status === 'unmatched') {
    if (unmatchedReason === 'gem') return 'unmatchedGem'
    if (unmatchedReason === 'spec') return 'unmatchedSpec'
    return 'unmatched'
  }
  return status || 'unmatched'
}
