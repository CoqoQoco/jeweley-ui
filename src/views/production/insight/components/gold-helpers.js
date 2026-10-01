// gold-helpers.js — pure logic ของหมวด "ทองและ Loss" (ProductionInsight/Gold, GoldLossTargets) — ห้าม
// import Vue/i18n ที่นี่ (เหมือน wip-lead-time-helpers.js/delivery-helpers.js) ข้อความ resolve เป็นหน้าที่
// component เอง

// เทียบ %Loss จริงกับเป้า — ใช้เลือกสี StatCardGeneric (รองรับแค่ main/warning/green/grey ไม่มีโทนแดง) —
// ตรงข้ามความหมายกับ resolveOnTimeStatVariant ของ delivery: ยิ่ง "น้อย" ยิ่งดี (Loss สูง = แย่)
// lossPercent เป็น null เมื่อไม่มีข้อมูลในช่วงที่เลือก (ไม่มีใบงานเลย) คืน 'grey'
export function resolveGoldLossStatVariant(lossPercent, targetPercent) {
  if (lossPercent == null) return 'grey'
  if (!Number.isFinite(targetPercent)) return 'main'
  return lossPercent <= targetPercent ? 'green' : 'warning'
}

// ยอดสุทธิ (netMoney): บวก = "ช่างได้คืน" (ดี), ลบ = "หักช่าง" — ห้ามเรียกว่า loss ทั้งคู่ (ดู titleTip ของ
// component) — StatCardGeneric ไม่มีโทนแดง จึงใช้ warning แทนค่าลบ
export function resolveNetMoneyVariant(netMoney) {
  if (netMoney == null || netMoney === 0) return 'grey'
  return netMoney > 0 ? 'green' : 'warning'
}

// ชิป "ร่าง" ของแผง "ตั้งเป้า Loss" ควรโชว์เฉพาะคู่ (ประเภทช่าง, โลหะ) ที่ค่าที่กำลังพรีวิวจริงๆ ต่างจากค่าที่
// บันทึกไว้จริง — Gold คืน source:'draft' ให้ทุกแถวเมื่อส่ง draftTargets ไปด้วย (ปัญหาเดียวกับ
// wip-lead-time-helpers.shouldShowDraftChip/delivery-helpers.shouldShowDeliveryDraftChip) — เป้าแยกตาม
// โลหะด้วย (ทอง/เงิน คนละเป้ากัน) จึงต้องเทียบทั้ง workerType และ metal พร้อมกัน
export function shouldShowGoldDraftChip(workerType, metal, targetPercent, source, savedTargets) {
  if (source !== 'draft') return false
  // savedTargets อาจมีทั้ง scope SLIP/STAGE ปนกัน (GoldLossTargets คืนมารวมกัน) — STAGE item ไม่มี field
  // workerType เลย (มีแต่ deptKey) จึงไม่ match โดยธรรมชาติอยู่แล้ว แต่เช็ค scope ตรงๆ ไว้กันความชัดเจน
  const saved = (savedTargets || []).find((t) => (t.scope ?? 'SLIP') === 'SLIP' && t.workerType === workerType && t.metal === metal)
  const savedPercent = saved ? saved.targetPercent : null
  return (targetPercent ?? null) !== (savedPercent ?? null)
}

// แปลง series[] (Gold.series ของประเภทช่างที่เลือก) เป็น array ค่าฟิลด์เดียวสำหรับป้อน ApexCharts — เก็บ
// null เป็นช่องว่างของกราฟเสมอ (เหมือน wip-lead-time-helpers.mapSeriesField/delivery-helpers.mapDeliverySeriesField)
export function mapGoldSeriesField(series, field) {
  return (series || []).map((point) => point?.[field] ?? null)
}

// "2/3" ของ overBuckets/qualifyingBuckets (ตารางอันดับช่าง) — '—' เมื่อไม่มีช่วงที่ผ่านเกณฑ์นับเลย (กันหาร 0
// ความหมาย ไม่ใช่ "ไม่เกินเลย")
export function formatOverBucketsRatio(overBuckets, qualifyingBuckets) {
  if (!qualifyingBuckets) return '—'
  return `${overBuckets ?? 0}/${qualifyingBuckets}`
}

// draft map { "workerType-metal": percent } -> payload array ที่ Gold(draftTargets)/SaveGoldLossTargets(items)
// ต้องการ — key ผสม (composite) เพราะเป้าแยกทั้งตามประเภทช่างและโลหะ (4 ชุดคงที่ 80/50 × GOLD/SILVER) — กรอง
// entry ที่ percent ไม่ใช่ตัวเลขจริงออก (ช่องว่าง/กำลังพิมพ์อยู่) — scope:'SLIP' แปะทุก item เสมอ (targets
// แยก scope SLIP/STAGE แล้ว ตั้งแต่เพิ่มฟีเจอร์ "Loss รายแผนก" — ดู gold-stage-helpers.js ของฝั่ง STAGE)
export function buildGoldDraftTargetsPayload(draftMap) {
  return Object.entries(draftMap || {})
    .filter(([, percent]) => Number.isFinite(percent))
    .map(([key, targetPercent]) => {
      const [workerType, metal] = key.split('-')
      return { scope: 'SLIP', workerType: Number(workerType), metal, targetPercent }
    })
}

// สร้าง composite key เดียวกับที่ draftMap/savedMap ใช้เก็บต่อ (ประเภทช่าง, โลหะ) — ใช้ทั้งฝั่งอ่าน/เขียน
// กันสะกด key ผิดรูปแบบคนละที่ในไฟล์ component
export function buildGoldTargetKey(workerType, metal) {
  return `${workerType}-${metal}`
}

// มีการแก้ไขร่างต่างจากค่าที่บันทึกไว้จริงหรือไม่ (เทียบทีละประเภทช่าง) — ใช้เปิด/ปิดปุ่ม "บันทึกเป้า"
export function hasGoldDraftChanges(draftMap, savedMap) {
  const draft = draftMap || {}
  const saved = savedMap || {}
  const keys = new Set([...Object.keys(draft), ...Object.keys(saved)])
  for (const key of keys) {
    if ((draft[key] ?? null) !== (saved[key] ?? null)) return true
  }
  return false
}
