// workers-helpers.js — pure logic ของหมวด "ช่างและค่าแรง" (ProductionInsight/Workers) — ห้าม import Vue/i18n
// ที่นี่ (เหมือน capacity-helpers.js/gold-stage-helpers.js)

const DEFAULT_TOP_DEPTS_SHOWN = 2

// เรียง kpi.wagesByDept[] จากสัดส่วนมากไปน้อย ตัดเหลือ maxShown แผนกแรก — ใช้ทำ sub-label การ์ด "ค่าแรงในระบบ/
// เดือน" (เช่น "ฝัง x% · แต่ง y%") โดยไม่ hardcode ว่าแผนกไหนคือ 2 แผนกที่ใช้แรงงานมากสุด (ข้อมูลจริงเปลี่ยนได้)
export function topWagesByDept(wagesByDept, maxShown = DEFAULT_TOP_DEPTS_SHOWN) {
  return [...(wagesByDept || [])].sort((a, b) => (b?.share ?? 0) - (a?.share ?? 0)).slice(0, maxShown)
}

// ค่าคอลัมน์ "ทอง" ของตารางช่าง — goldLossPercent (มาจากใบ slip จริง) ชนะ goldDiffPercent (มาจากแผนกจ่าย-รับ)
// เสมอถ้ามีทั้งคู่ — fromSlip ใช้ทำเครื่องหมาย "s" กำกับใน UI ให้รู้ที่มา — คืน null เมื่อไม่มีทั้งคู่ (caller
// โชว์ "—") — คัดพลอย (gemSort) ไม่ได้ชั่งน้ำหนักทองเลย (เหมือนตาราง gold-stage) โชว์ "—" เสมอแม้ backend จะส่ง
// goldDiffPercent=0 มา (จ่าย=รับ โดยปริยายเพราะไม่มีข้อมูลจริงให้เทียบ ไม่ใช่ diff จริงที่น่าสนใจ — ยืนยัน
// bug จริงที่เจอบน prod 2026-10-02) — เผื่อกรณีเดียวกันเกิดกับแผนกอื่นถ้า backend ส่ง sendGram/checkGram มา
// ด้วยในอนาคต (ปัจจุบัน workers[] ไม่มี 2 field นี้) ก็ถือว่าไม่ได้ชั่งจริงเหมือนกัน
export function resolveGoldColumnValue(worker) {
  if (!worker) return null
  if (worker.deptKey === 'gemSort') return null
  if (worker.sendGram != null && worker.checkGram != null && worker.sendGram === worker.checkGram) return null
  if (worker.goldLossPercent != null) return { percent: worker.goldLossPercent, fromSlip: true }
  if (worker.goldDiffPercent != null) return { percent: worker.goldDiffPercent, fromSlip: false }
  return null
}

// เรียง workers[] ตามค่าแรงมากไปน้อย — ค่าเริ่มต้นของตารางช่าง (ไม่ sortable แบบ interactive เหมือนคอลัมน์
// อื่นในตารางนี้ — แค่จัดลำดับให้เห็นช่างค่าแรงสูงสุดก่อนเสมอ)
export function sortWorkersByWagesDesc(workers) {
  return [...(workers || [])].sort((a, b) => (b?.wages ?? 0) - (a?.wages ?? 0))
}

// ตัวกรองช่างในตาราง (ช่องหัวกล่อง "ประเภท") เป็น client-side ล้วน กรองเฉพาะ workers[] ที่โหลดมาแล้ว ไม่ยิง
// request ใหม่ — แยกจากตัวกรอง employmentTypes ของแผงตัวกรองหลัก (ส่งไป server กรองทั้งก้อน kpi/series/
// workers/concentration) — ว่างหรือ 'ALL' = ไม่กรอง
export function filterWorkersByEmploymentType(workers, employmentType) {
  if (!employmentType || employmentType === 'ALL') return workers || []
  return (workers || []).filter((w) => w?.employmentType === employmentType)
}

// ตัวกรองแผนกในตาราง (ช่องหัวกล่อง "แผนก") เป็น client-side ล้วนเช่นกัน
export function filterWorkersByDept(workers, departmentKeys) {
  if (!departmentKeys || !departmentKeys.length) return workers || []
  return (workers || []).filter((w) => departmentKeys.includes(w?.deptKey))
}

// รวม buckets ที่ปรากฏทั้งหมดใน series[] (รวมทุกแผนกปนกัน) ไม่ซ้ำ เรียงตามลำดับที่เจอก่อน — ใช้เป็นแกน x ร่วม
// ของกราฟแนวโน้มค่าแรงรายแผนก (เหมือน collectStageBuckets ของ gold-stage-helpers.js)
export function collectWageBuckets(series) {
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

// จับคู่แผนกหนึ่งเข้ากับชุด bucket กลาง (จาก collectWageBuckets) ให้ได้ array ค่าเดียวกันความยาวเท่ากันทุก
// แผนก (bucket ที่แผนกนั้นไม่มีจุด = null ช่องว่าง ไม่ coerce เป็น 0)
export function alignWageSeriesToBuckets(series, deptKey, buckets) {
  const byBucket = {}
  ;(series || []).forEach((point) => {
    if (point?.deptKey === deptKey && point.bucketEnd != null) byBucket[point.bucketEnd] = point.wages ?? null
  })
  return (buckets || []).map((bucketEnd) => byBucket[bucketEnd] ?? null)
}

// แปลง seriesTotal[] (รวมทุกแผนกเป็นยอดเดียวต่อ bucket) เป็น array ค่าฟิลด์เดียวสำหรับป้อน ApexCharts
export function mapWorkersSeriesTotalField(seriesTotal, field) {
  return (seriesTotal || []).map((point) => point?.[field] ?? null)
}

// รวม deptKey ที่ปรากฏทั้งหมดใน series[] ไม่ซ้ำ เรียงตามลำดับที่เจอก่อน — ใช้ทำเส้น/แท่งแยกต่อแผนกของกราฟ
// แนวโน้มค่าแรงรายแผนก (ไม่ hardcode รายชื่อแผนกตายตัว กันพังเมื่อ backend เพิ่ม/ลดแผนกในอนาคต)
export function collectWageDeptKeys(series) {
  const seen = new Set()
  const keys = []
  ;(series || []).forEach((point) => {
    if (point?.deptKey != null && !seen.has(point.deptKey)) {
      seen.add(point.deptKey)
      keys.push(point.deptKey)
    }
  })
  return keys
}
