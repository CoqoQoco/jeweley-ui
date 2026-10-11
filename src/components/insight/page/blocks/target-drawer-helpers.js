// target-drawer-helpers.js — pure logic ของ TargetDrawer (draft map ↔ payload)

// draft ที่ส่งขึ้น page state: ว่างเมื่อไม่มีการเปลี่ยนแปลงจากค่าที่บันทึก (ปิด preview)
export function buildDraftEmission(preset, draftMap, savedMap) {
  return preset.hasChanges(draftMap, savedMap) ? preset.buildPayload(draftMap) : []
}

export function validateRemark(remark) {
  return !!(remark && remark.trim())
}

export function formatReferenceDays(value) {
  return value != null ? new Intl.NumberFormat('th-TH', { maximumFractionDigits: 1 }).format(value) : '—'
}
