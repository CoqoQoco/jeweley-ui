// target-drawer-helpers.js — pure logic ของ TargetDrawer (draft map ↔ payload)
import { formatDate } from '@/services/utils/dayjs.js'

// draft ที่ส่งขึ้น page state: ว่างเมื่อไม่มีการเปลี่ยนแปลงจากค่าที่บันทึก (ปิด preview)
// ไม่มีการเปลี่ยนแปลง = preset.emptyDraft (รายการ: [] · ค่าเดียว: null)
export function buildDraftEmission(preset, draftMap, savedMap) {
  return preset.hasChanges(draftMap, savedMap) ? preset.buildPayload(draftMap) : emptyDraftOf(preset)
}

export function emptyDraftOf(preset) {
  return preset.emptyDraft === undefined ? [] : preset.emptyDraft
}

export function validateRemark(remark) {
  return !!(remark && remark.trim())
}

// เซลล์ของตารางประวัติ: date → วันที่ · suffix (เช่น '%') ต่อท้ายค่า · อื่นๆ ค่าดิบ
export function formatHistoryCell(col, row) {
  const value = row?.[col.field]
  if (col.date) return value ? formatDate(value) : ''
  if (col.suffix) return value == null ? '' : `${value}${col.suffix}`
  return value ?? ''
}

export function formatReferenceDays(value) {
  return value != null ? new Intl.NumberFormat('th-TH', { maximumFractionDigits: 1 }).format(value) : '—'
}
