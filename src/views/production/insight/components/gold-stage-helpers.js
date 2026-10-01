// gold-stage-helpers.js — pure logic ของส่วน "Loss ตามใบงานรายแผนก (จ่าย − รับ)" ในหมวด "ทองและ Loss"
// (ProductionInsight/GoldByStage) — ห้าม import Vue/i18n ที่นี่ (เหมือน gold-helpers.js)
//
// ยืนยันจาก API agent แล้ว (ตรวจจาก ProductionInsightRuleEngine.cs ฝั่ง backend ตรงๆ 2026-10-01): deptKey ของ
// GoldByStage.departments[]/series[] และ param deptKey/topDeptKey ของ finding/action เป็น **string key เดียว
// กับ wip/capacity** ('trim'/'rawPolish'/'gemSort'/'setting'/'plating') แปลผ่าน view.executive.department.*
// ตามปกติ (ไม่มี namespace แยกของตัวเอง — เดิมเข้าใจผิดว่าเป็นรหัสตัวเลขแยกชุด แก้แล้ว) — ตาราง/กราฟ/
// sub-note (scrap ของ trim, not-weighed ของ gemSort) ต้อง key ด้วย flag (`includesScrap`/`notWeighed`) หรือ
// string deptKey เท่านั้น ห้าม assume ตัวเลขใดๆ
//
// ส่วน**เป้า (target record, scope='STAGE')** ยังใช้ field `workerType` เป็น**ตัวเลข** 60/80/90 จริง (เลข
// สถานะเดิมของระบบ — 60=rawPolish/80=setting/90=plating ตรงกับ status 60=ขัดดิบ/80=ฝัง/90=ขัดชุบ) — map ผ่าน
// STAGE_TARGET_WORKER_TYPE_DEPT_KEY ด้านล่างแล้วแปลด้วย view.executive.department.* ตัวเดียวกัน ไม่สร้างคำแปล
// ซ้ำ (ไม่มีเป้าให้ trim/gemSort — ยืนยันจาก API agent ว่า GoldByStage ส่ง targetPercent null เสมอสำหรับ trim)
//
// departments[] ยังมี outlierCount (เฉพาะใบที่ระบุช่างได้แล้ว) + outlierUnassignedCount (ใบผิดปกติที่ยังไม่ได้
// จ่ายช่าง) แต่ยังไม่มีจุดแสดงผลใน UI ตอนนี้ (ตารางผิดปกติแยกเป็น panel ของตัวเองอยู่แล้ว ไม่ได้ใช้ field รวม
// นี้) — เก็บ field ไว้เผื่ออนาคตเฉยๆ

// workerType (ตัวเลขของ target record) -> deptKey (string ของ view.executive.department) — เรียงตามลำดับที่
// แผงตั้งเป้าแสดง
export const STAGE_TARGET_WORKER_TYPE_ORDER = [60, 80, 90]
export const STAGE_TARGET_WORKER_TYPE_DEPT_KEY = {
  60: 'rawPolish',
  80: 'setting',
  90: 'plating'
}

// คืน string deptKey (ใช้กับ view.executive.department.*) จาก workerType ตัวเลขของ target record — คืน null
// เมื่อไม่รู้จัก (กัน $t() ของ key ที่ไม่มีจริง)
export function resolveStageTargetDeptKey(workerType) {
  return STAGE_TARGET_WORKER_TYPE_DEPT_KEY[workerType] ?? null
}

// เทียบส่วนต่าง % (จ่าย−รับ) กับเป้า — ใช้เลือกสี StatCardGeneric/chip (รองรับแค่ main/warning/green/grey) —
// เหมือน resolveGoldLossStatVariant ของ slip-level (ยิ่งน้อยยิ่งดี) diffPercent เป็น null เมื่อแผนกนั้นไม่ได้
// ชั่งน้ำหนัก (notWeighed) หรือไม่มีข้อมูลในช่วงที่เลือก
export function resolveStageDiffVariant(diffPercent, targetPercent) {
  if (diffPercent == null) return 'grey'
  if (!Number.isFinite(targetPercent)) return 'main'
  return diffPercent <= targetPercent ? 'green' : 'warning'
}

// แปลง series[] (GoldByStage.series รวมทุกแผนกปนกัน) เป็น array ค่าฟิลด์เดียวสำหรับป้อน ApexCharts ของแผนก
// เดียว — เก็บ null เป็นช่องว่างของกราฟเสมอ (เหมือน mapGoldSeriesField)
export function mapGoldStageSeriesField(series, field) {
  return (series || []).map((point) => point?.[field] ?? null)
}

// กรอง series รวมให้เหลือเฉพาะแผนกเดียว — ใช้กับกราฟรายละเอียดหลังคลิกแถว (เรียงตาม order เดิมของ series)
export function filterStageSeriesByDept(series, deptKey) {
  return (series || []).filter((point) => point?.deptKey === deptKey)
}

// รวม bucketEnd ทั้งหมดที่ปรากฏใน series (ไม่ซ้ำ, เรียงตามลำดับเดิม) — ใช้เป็นแกน x ร่วมกันของกราฟรวมทุกแผนก
// เพราะ series เป็น array แบนรวมทุกแผนกปนกัน ไม่ได้แยกเป็นจุดต่อ bucket สำเร็จรูป
export function collectStageBuckets(series) {
  const seen = new Set()
  const buckets = []
  ;(series || []).forEach((point) => {
    if (point?.bucketEnd != null && !seen.has(point.bucketEnd)) {
      seen.add(point.bucketEnd)
      buckets.push(point.bucketEnd)
    }
  })
  return buckets
}

// จับคู่แผนกหนึ่งเข้ากับชุด bucket กลาง (จาก collectStageBuckets) ให้ได้ array ค่าเดียวกันความยาวเท่ากันทุก
// แผนก (bucket ที่แผนกนั้นไม่มีจุด = null ช่องว่าง ไม่ coerce เป็น 0) — ใช้กับกราฟรวมทุกแผนก (เส้นละแผนก)
export function alignStageSeriesToBuckets(series, deptKey, buckets, field) {
  const byBucket = {}
  filterStageSeriesByDept(series, deptKey).forEach((point) => {
    if (point?.bucketEnd != null) byBucket[point.bucketEnd] = point[field] ?? null
  })
  return (buckets || []).map((bucketEnd) => byBucket[bucketEnd] ?? null)
}

// คอลัมน์ "ค้างไม่รับคืน" แยก 2 บรรทัดตามคู่ field ที่ backend ส่งมา (ยืนยันจาก API agent 2026-10-01):
// pendingWithWorkerCount/Gram = ค้างอยู่ที่ตัวช่างแล้วแต่ยังไม่รับคืน, pendingQueueCount/Gram = ยังไม่ได้จ่าย
// ให้ช่างเลย รอคิวอยู่ (แยกจาก pendingCount/pendingGram เดิมที่รวมทั้งคู่ปนกัน — เลิกใช้แล้ว) — คืนค่าว่างต่อ
// บรรทัดเมื่อฝั่งนั้นไม่มีค้างเลย (caller โชว์ "—" รวมเมื่อว่างทั้งคู่)
export function formatStagePendingWithWorker(dept, formatCountFn, formatGramFn) {
  if (!dept?.pendingWithWorkerCount) return ''
  return `${formatCountFn(dept.pendingWithWorkerCount)} · ${formatGramFn(dept.pendingWithWorkerGram)}`
}

export function formatStagePendingQueue(dept, formatCountFn, formatGramFn) {
  if (!dept?.pendingQueueCount) return ''
  return `${formatCountFn(dept.pendingQueueCount)} · ${formatGramFn(dept.pendingQueueGram)}`
}

// draft map { "deptKey-metal": percent } -> payload array ที่ GoldByStage(draftTargets)/SaveGoldLossTargets
// (items) ต้องการ — คู่ขนานกับ buildGoldDraftTargetsPayload ของฝั่ง slip แต่เป็น scope:'STAGE' — ⚠️ field ชื่อ
// `workerType` เหมือนฝั่ง slip เป๊ะ (ไม่ใช่ `deptKey`) แม้ scope จะเป็น STAGE — ยืนยันจาก API agent ตรงๆ
// (ใช้ workerType เป็น field รหัสตัวเลขร่วมกันทั้ง 2 scope เฉพาะใน target record เท่านั้น — ส่วน
// GoldByStage.departments[]/series[]/outlier/pending ยังใช้ deptKey ตามปกติ ไม่ปนกับอันนี้)
export function buildGoldStageDraftTargetsPayload(draftMap) {
  return Object.entries(draftMap || {})
    .filter(([, percent]) => Number.isFinite(percent))
    .map(([key, targetPercent]) => {
      const [deptKey, metal] = key.split('-')
      return { scope: 'STAGE', workerType: Number(deptKey), metal, targetPercent }
    })
}

// แผนก default ที่เลือกแสดงรายละเอียด (กราฟ+ตารางช่าง) — แผนกที่ diffPercent เกินเป้ามากที่สุด (เปอร์เซ็นต์
// เกินเป้าสูงสุด) ไม่งั้นแผนกแรกในลิสต์ — ข้ามแผนกที่ notWeighed (ไม่มี diffPercent ให้เทียบ)
export function resolveDefaultStageDeptKey(departments) {
  if (!departments || !departments.length) return null
  const comparable = departments.filter((d) => d.diffPercent != null && Number.isFinite(d.targetPercent))
  if (comparable.length) {
    const mostOver = comparable.reduce((max, d) => (d.diffPercent - d.targetPercent > max.diffPercent - max.targetPercent ? d : max), comparable[0])
    return mostOver.deptKey
  }
  return departments[0].deptKey
}
