// capacity-helpers.js — pure logic ของหมวด "กำลังการผลิต" (ProductionInsight/Capacity) — ห้าม import
// Vue/i18n ที่นี่ (เหมือน wip-lead-time-helpers.js/gold-helpers.js) ข้อความ/การแปล resolve เป็นหน้าที่ของ
// component เอง

// แปลง series[] (Capacity.series หรือ department.workersSeries/exitsSeries) เป็น array ค่าฟิลด์เดียวสำหรับ
// ป้อน ApexCharts — เก็บ null เป็นช่องว่างของกราฟเสมอ (ไม่ coerce เป็น 0) เหมือน mapSeriesField ของหมวดอื่น
export function mapCapacitySeriesField(series, field) {
  return (series || []).map((point) => point?.[field] ?? null)
}

// คำ ↔ field ของ Capacity.series/kpi ที่ใช้แสดง "ผลิตเสร็จ"/"ปิดสำเร็จ" — แยกเป็นค่าคงที่ตรวจได้ด้วย spec
// (เคยสลับฟิลด์ผิดมาแล้วครั้งหนึ่ง 2026-10-01) ยืนยันจาก API agent แล้ว: "ผลิตเสร็จ" = field `output`
// (เข้าบัตรต้นทุนครั้งแรก งานช่างจบ — ใช้ทั้ง KPI card และแท่งกราฟ) · "ปิดสำเร็จ" = field `completed`
// (ขั้นถัดไปหลังบัตรต้นทุน ใช้แค่แท่งกราฟ ไม่มี KPI card ของตัวเอง)
export const CAPACITY_PRODUCED_FIELD = 'output' // label "ผลิตเสร็จ" (KPI card 2 + กราฟแนวโน้มแท่งที่ 2)
export const CAPACITY_CLOSED_FIELD = 'completed' // label "ปิดสำเร็จ" (กราฟแนวโน้มแท่งที่ 3 เท่านั้น)

// จับคู่ series อื่นที่ไม่ได้อยู่ใน point เดียวกัน (เช่น department.exitsSeries แยก array จาก
// department.workersSeries — คนละ array แต่ต้องขึ้นกราฟแกน x เดียวกัน) เข้ากับ buckets ของ points หลัก
// (อ้างอิงด้วย bucketEnd) — bucketEnd ที่หาคู่ไม่เจอหรือ series ไม่มีจุดนั้นได้ null (ช่องว่างของกราฟ ไม่
// coerce เป็น 0) ใช้โดย capacity-department-chart.vue (exitsSeries ของแผนก)
export function alignSeriesByBucket(points, series, field) {
  const byBucket = {}
  ;(series || []).forEach((point) => {
    if (point?.bucketEnd != null) byBucket[point.bucketEnd] = point[field] ?? null
  })
  return (points || []).map((p) => (p?.bucketEnd != null ? (byBucket[p.bucketEnd] ?? null) : null))
}

// งานค้างสุทธิ/เดือน (netPerMonth = งานเข้า - ผลิตเสร็จ) บวก = งานค้างกำลังโตขึ้น (ไม่ดี) ลบ/0 = ทรงตัวหรือลดลง
export function resolveNetVariant(netPerMonth) {
  if (netPerMonth == null) return 'grey'
  return netPerMonth > 0 ? 'warning' : 'green'
}

// การ์ด "คอขวด" มีแผนกคอขวดอยู่ไหม — ว่าง = ไม่มีคอขวดเด่นชัดในช่วงนี้
export function resolveBottleneckVariant(bottleneckDepts) {
  return bottleneckDepts && bottleneckDepts.length ? 'warning' : 'green'
}

// ใบบัตรต้นทุนค้างนานเกิน 30 วัน มีอยู่ไหม — ใช้เลือกสีการ์ด "บัตรต้นทุน → สำเร็จ"
export function resolveCostCardVariant(pendingOver30d) {
  if (pendingOver30d == null) return 'grey'
  return pendingOver30d > 0 ? 'warning' : 'green'
}

// จับคู่ bottleneckDepts[] (array ของ key) กับ departments[] เพื่อดึงคิวเทียบเท่า (วัน) มาโชว์คู่กันในการ์ด
// KPI — คืน [{key, queueDays}] ตามลำดับเดิมของ bottleneckDepts (key ที่หาไม่เจอใน departments ได้ queueDays
// เป็น null แต่ยังโชว์ชื่อแผนกได้ปกติ)
export function buildBottleneckSummary(bottleneckDepts, departments) {
  if (!bottleneckDepts || !bottleneckDepts.length) return []
  return bottleneckDepts.map((key) => ({ key, queueDays: departments?.find((d) => d.key === key)?.queueDays ?? null }))
}

// แผนก default ที่เลือกแสดงกราฟรายละเอียด (capacity-department-panel.vue) — แผนกคอขวด (isBottleneck) ถ้ามี
// ไม่งั้นแผนกที่คิวเทียบเท่ายาวที่สุด ไม่งั้นแผนกแรกในลิสต์ — คืน null เมื่อไม่มีแผนกเลย
export function resolveDefaultDeptKey(departments) {
  if (!departments || !departments.length) return null
  const bottleneck = departments.find((d) => d.isBottleneck)
  if (bottleneck) return bottleneck.key
  const longestQueue = departments.reduce(
    (max, d) => ((d.queueDays ?? -Infinity) > (max?.queueDays ?? -Infinity) ? d : max),
    null
  )
  return longestQueue?.key || departments[0].key
}

// แผนกที่ไม่รวมในแผงจำลอง "เพิ่ม/ลดคน" — บัตรต้นทุนไม่ใช่งานที่ขับเคลื่อนด้วยจำนวนช่างแบบเดียวกับแผนกผลิต
// (วิเคราะห์แยกไว้ที่ส่วน "บัตรต้นทุน → สำเร็จ" อยู่แล้ว) + แผนกที่ไม่มีช่างเลย (workersMedian 0/null เช่น
// ออกแบบ) ก็ไม่มีฐานให้จำลองคำนวณได้เช่นกัน (จะกลายเป็นหารด้วย 0) — รวมเป็นเงื่อนไขเดียว ใช้ทั้งตอนสร้างแถว
// และตอนทำ note รายชื่อแผนกที่ไม่รวม (ดู resolveWhatIfExcludedDeptKeys)
export const WHATIF_EXCLUDED_DEPT_KEY = 'costCard'

export function isWhatIfExcludedDept(dept) {
  return dept.key === WHATIF_EXCLUDED_DEPT_KEY || !dept.workersMedian
}

// ค่าเริ่มต้นของแผงจำลอง = จำนวนช่างค่ากลางปัจจุบันของแต่ละแผนก (ยกเว้นแผนกที่ไม่รวม)
export function buildWhatIfDefaultMap(departments) {
  const map = {}
  ;(departments || [])
    .filter((d) => !isWhatIfExcludedDept(d))
    .forEach((d) => {
      map[d.key] = d.workersMedian ?? 0
    })
  return map
}

// รายชื่อ key ของแผนกที่ไม่รวมในแผงจำลอง (ใช้ทำ note ใต้ตาราง) — เรียงตามลำดับเดิมของ departments
export function resolveWhatIfExcludedDeptKeys(departments) {
  return (departments || []).filter((d) => isWhatIfExcludedDept(d)).map((d) => d.key)
}

// ใบออก/เดือนถ้าจำลองจำนวนช่างใหม่ = อัตราส่วนใบ/ช่าง "ไม่ปัดเศษ" (exitsPerMonth ÷ workersMedian ของจริง — ไม่
// ใช้ field plansPerWorker ที่ API ปัดเศษมาให้แล้ว เพราะคูณย้อนกลับไม่ตรง exitsPerMonth เป๊ะ ทำให้สถานการณ์
// "ไม่เปลี่ยนอะไรเลย" ดันได้เลขไม่เท่าเดิม) × จำนวนช่างที่จำลอง — คืน null เมื่อคำนวณไม่ได้ (โชว์ "—" แทนเลข 0
// ที่ทำให้เข้าใจผิดว่าออกศูนย์ใบ)
export function calcWhatIfExits(exitsPerMonth, workersMedian, workers) {
  if (exitsPerMonth == null || !workersMedian || !Number.isFinite(workers)) return null
  return (exitsPerMonth / workersMedian) * workers
}

// คิวเทียบเท่า (วัน) ถ้าจำลองจำนวนช่างใหม่ = งานค้างที่ยังขยับ (activeWip) ÷ ใบออกต่อวันใหม่ — exits<=0 หรือ
// activeWip ไม่มี = คำนวณไม่ได้ (คืน null ไม่ใช่ Infinity)
export function calcWhatIfQueueDays(activeWip, exitsPerMonth) {
  if (activeWip == null || !exitsPerMonth || exitsPerMonth <= 0) return null
  return activeWip / (exitsPerMonth / 30)
}

// ประกอบแถวของแผงจำลองทั้งหมด (ยกเว้นแผนกที่ isWhatIfExcludedDept) จาก departments[] จริง + workersMap (draft
// ของผู้ใช้) — เมื่อจำนวนช่างที่จำลอง "เท่าค่าปัจจุบันเป๊ะ" (ไม่เปลี่ยนอะไรเลย) คืนค่า exitsPerMonth/queueDays
// ของ API ตรงๆ แทนการคำนวณใหม่ (กันสถานการณ์ไม่เปลี่ยนแปลงแล้วได้เลขไม่เท่าเดิมจาก rounding ของสูตร)
export function buildWhatIfRows(departments, workersMap) {
  return (departments || [])
    .filter((d) => !isWhatIfExcludedDept(d))
    .map((d) => {
      const workers = workersMap?.[d.key] ?? d.workersMedian ?? 0
      const noChange = workers === d.workersMedian
      const exitsNew = noChange ? (d.exitsPerMonth ?? null) : calcWhatIfExits(d.exitsPerMonth, d.workersMedian, workers)
      const queueDaysNew = noChange ? (d.queueDays ?? null) : calcWhatIfQueueDays(d.activeWip, exitsNew)
      return {
        key: d.key,
        workersMedian: d.workersMedian ?? 0,
        workers,
        exitsPerMonth: d.exitsPerMonth ?? null,
        exitsNew,
        queueDaysNow: d.queueDays ?? null,
        queueDaysNew,
        isBottleneckNow: !!d.isBottleneck
      }
    })
}

// รวมคิวเทียบเท่าทุกแผนก (ใช้เป็นตัวแทน "เวลาผลิตรวม" โดยประมาณ — งานไม่ได้ผ่านทุกแผนกจริง จึงเป็นค่า ≈ เท่านั้น)
// ข้ามแถวที่คำนวณไม่ได้ (null) แทนที่จะปัดเป็น 0 — คืน null เมื่อไม่มีแถวไหนคำนวณได้เลย
export function sumWhatIfField(rows, field) {
  const values = (rows || []).map((r) => r[field]).filter((v) => v != null)
  if (!values.length) return null
  return values.reduce((sum, v) => sum + v, 0)
}

// แผนกที่มีคิวเทียบเท่ายาวที่สุด (คอขวด) จากฟิลด์ที่ระบุ — ไม่นับแถวที่คำนวณไม่ได้ (null)
export function resolveWhatIfBottleneck(rows, field) {
  const candidates = (rows || []).filter((r) => r[field] != null)
  if (!candidates.length) return null
  return candidates.reduce((max, r) => (r[field] > max[field] ? r : max), candidates[0]).key
}
