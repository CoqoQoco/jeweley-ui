// delivery-helpers.js — pure logic ของหมวด "ส่งงานตรงเวลา" (ProductionInsight/Delivery, DeliveryTarget) —
// ห้าม import Vue/i18n ที่นี่ (เหมือน wip-lead-time-helpers.js/wip-trend-helpers.js) ข้อความ resolve เป็น
// หน้าที่ component เอง

// เทียบ %ตรงเวลาปัจจุบันกับเป้า — ใช้เลือกสี StatCardGeneric (รองรับแค่ main/warning/green/grey ไม่มีโทนแดง)
// onTimePercent เป็น null เมื่อไม่มีใบเสร็จในช่วงที่เลือก (ยังสรุป %ไม่ได้) คืน 'grey'
export function resolveOnTimeStatVariant(onTimePercent, targetPercent) {
  if (onTimePercent == null) return 'grey'
  if (!Number.isFinite(targetPercent)) return 'main'
  return onTimePercent >= targetPercent ? 'green' : 'warning'
}

// ชิป "ร่าง" ของแผง "ตั้งเป้าส่งตรงเวลา" ควรโชว์เฉพาะตอนค่าที่กำลังพรีวิวจริงๆ ต่างจากค่าที่บันทึกไว้จริง —
// Delivery คืน targetSource:'draft' ทุกครั้งที่ส่ง draftTargetPercent ไปด้วย แม้ค่าจะเท่าเดิม (ปัญหาเดียวกับ
// wip-lead-time-helpers.shouldShowDraftChip ฝั่งตาราง StageLeadTime)
export function shouldShowDeliveryDraftChip(targetSource, targetPercent, savedTargetPercent) {
  if (targetSource !== 'draft') return false
  return (targetPercent ?? null) !== (savedTargetPercent ?? null)
}

// แปลง series[] (Delivery.series) เป็น array ค่าฟิลด์เดียวสำหรับป้อน ApexCharts — เก็บ null เป็นช่องว่างของ
// กราฟเสมอ (เหมือน wip-lead-time-helpers.mapSeriesField) ห้าม coerce เป็น 0 — ใช้ทั้งกราฟ %ตรงเวลาและกราฟ
// วางแผน vs ใช้จริง (2 กราฟใช้ series ชุดเดียวกัน คนละฟิลด์)
export function mapDeliverySeriesField(series, field) {
  return (series || []).map((point) => point?.[field] ?? null)
}
