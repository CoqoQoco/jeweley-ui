// wip-lead-time-helpers.js — pure logic ของกล่อง "เวลาผลิตรายแผนก"/"ผลต่อกำลังการผลิต"/แผงมาตรฐาน
// (ProductionInsight/StageLeadTime, StageStandards, SaveStageStandards) ในหมวด "งานค้างและคอขวด" — ห้าม
// import Vue/i18n ที่นี่ ข้อความ resolve เป็นหน้าที่ component เอง (เหมือน wip-trend-helpers.js)

// เทียบมาตรฐาน (overStandardPercent จาก API): <=0 = ผ่าน (เขียว), 0-50% = เกิน (เหลือง), >=50% = วิกฤต (แดง)
export function resolveStandardChipVariant(overStandardPercent) {
  const pct = overStandardPercent || 0
  if (pct <= 0) return 'pass'
  if (pct >= 50) return 'critical'
  return 'warning'
}

const STANDARD_CHIP_COLOR_TOKEN = {
  pass: 'var(--base-green)',
  warning: 'var(--base-warning)',
  critical: 'var(--base-red)'
}

export function resolveStandardChipColorToken(variant) {
  return STANDARD_CHIP_COLOR_TOKEN[variant] || STANDARD_CHIP_COLOR_TOKEN.pass
}

// สัดส่วนรอ/ทำ ต่อแถว (สำหรับแท่ง stacked บางในตาราง) — ปัดเศษแล้วบวกกันได้ 100 เสมอ (workPercent = ส่วนที่
// เหลือจาก waitPercent ไม่ปัดแยกกันเอง กัน 100% เกิน/ขาดจาก rounding 2 จุด) — waitDays/workDays เป็น null
// ทั้งคู่ = ยังไม่มีข้อมูลแยกรอ/ทำ (ประวัติเก่าไม่เคยบันทึกแยก) ต่างจาก 0 จริงๆ (มีข้อมูลแต่ใช้เวลา 0 วัน) —
// คืน hasData:false ให้ caller โชว์ "—" + tip แทนแท่ง ไม่ใช่แท่งว่าง 0/0 (ห้าม render null เป็น 0)
export function calcWaitWorkShare(waitDays, workDays) {
  if (waitDays == null && workDays == null) return { waitPercent: 0, workPercent: 0, hasData: false }
  const wait = waitDays || 0
  const work = workDays || 0
  const total = wait + work
  if (!total) return { waitPercent: 0, workPercent: 0, hasData: true }
  const waitPercent = Math.round((wait / total) * 100)
  return { waitPercent, workPercent: 100 - waitPercent, hasData: true }
}

// splitSampleCount น้อย (แต่ไม่ใช่ 0) = ค่ากลาง/สัดส่วนรอ-ทำ คำนวณจากตัวอย่างน้อย ความน่าเชื่อถือต่ำ — ใช้ตัดสิน
// ว่าจะโชว์ hint "(n ใบ)" กำกับค่าในตารางหรือไม่ (0 = ไม่มีข้อมูลเลย ใช้เคส hasData:false ไปแล้ว ไม่ต้องซ้ำ)
export function isSmallSplitSample(count) {
  return Number.isFinite(count) && count > 0 && count < 10
}

// มีจุดข้อมูลที่ไม่ใช่ null อย่างน้อย 1 จุดในฟิลด์นี้ของ series หรือไม่ — ใช้ตัดสินใจซ่อน series
// รอ/ทำทั้งเส้นทางกราฟ (พร้อม legend) เมื่อทั้งช่วงที่เลือกไม่มีข้อมูลแยกรอ/ทำเลยสักจุด
export function hasAnySeriesValue(series, field) {
  return (series || []).some((point) => point?.[field] != null)
}

// ข้อความเทียบ "ตอนนี้ → ตามมาตรฐาน (+/-ต่าง)" ของการ์ดผลต่อกำลังการผลิต — formatFn ให้ caller ส่ง Intl
// formatter ของตัวเองมา (ไฟล์นี้ไม่ผูก locale ตายตัว)
export function buildCapacityDeltaText(currentValue, atStandardValue, formatFn) {
  const format = typeof formatFn === 'function' ? formatFn : (v) => String(v)
  const delta = (atStandardValue || 0) - (currentValue || 0)
  if (!delta) return `${format(currentValue)} → ${format(atStandardValue)} (± 0)`
  const sign = delta > 0 ? '+' : '−'
  return `${format(currentValue)} → ${format(atStandardValue)} (${sign}${format(Math.abs(delta))})`
}

// ชิป "ร่าง" ในตารางควรโชว์เฉพาะแผนกที่ค่าที่กำลังพรีวิวจริงๆ ต่างจากค่าที่บันทึกไว้จริง — StageLeadTime คืน
// standardSource:'draft' ให้ทุกแผนกเมื่อส่ง draftStandards ไปด้วย (ไม่ใช่แค่แผนกที่ผู้ใช้แก้จริงในแผง) ต้อง
// เทียบ standardDays ของแถวกับค่าที่บันทึกจริงจาก StageStandards (savedStandards) เองฝั่ง FE ถึงจะรู้ว่าแผนก
// นี้มีการเปลี่ยนแปลงจริงหรือแค่ "ร่าง" เฉยๆ ที่ค่าเท่าเดิม
export function shouldShowDraftChip(deptKey, standardDays, standardSource, savedStandards) {
  if (standardSource !== 'draft') return false
  const saved = (savedStandards || []).find((s) => s.deptKey === deptKey)
  const savedDays = saved ? saved.standardDays : null
  return (standardDays ?? null) !== (savedDays ?? null)
}

// แผนกที่ "เกินมาตรฐานมากที่สุด" — default selected row ของกราฟรายละเอียด (ไม่มีใครเกินเลยก็ยังตกไปที่
// แผนกแรกในลิสต์ ไม่ปล่อยว่าง)
export function resolveMostOverStandardDept(departments) {
  if (!departments || !departments.length) return null
  const mostOver = departments.reduce(
    (max, d) => ((d.overStandardPercent ?? -Infinity) > (max?.overStandardPercent ?? -Infinity) ? d : max),
    null
  )
  return mostOver?.key || departments[0].key
}

// แปลง series[] (StageLeadTime departments[].series) เป็น array ค่าฟิลด์เดียวสำหรับป้อน ApexCharts — เก็บ
// null ไว้เป็นช่องว่างของกราฟเสมอ (ApexCharts รองรับ null ในตัวอยู่แล้ว ทั้ง line/area/bar) ห้าม coerce เป็น
// 0 เพราะ API ส่ง null เมื่อ count ของช่วงนั้นเป็น 0 (ไม่มีข้อมูลจริงในช่วงนั้น) ความหมายต่างจาก 0 จริงๆ
// (มีข้อมูลแต่ค่าเป็นศูนย์) — ใช้ทั้ง sparkline ในตาราง (wip-lead-time-table.vue) และกราฟรายละเอียด
// (wip-lead-time-chart.vue)
export function mapSeriesField(series, field) {
  return (series || []).map((point) => point?.[field] ?? null)
}

// draft map { deptKey: days } -> payload array ที่ StageLeadTime(draftStandards)/SaveStageStandards(items)
// ต้องการ — กรอง entry ที่ days ไม่ใช่ตัวเลขจริงออก (ช่องว่าง/กำลังพิมพ์อยู่ ยังไม่ใช่ค่าที่ใช้ได้)
export function buildDraftStandardsPayload(draftMap) {
  return Object.entries(draftMap || {})
    .filter(([, days]) => Number.isFinite(days))
    .map(([deptKey, standardDays]) => ({ deptKey, standardDays }))
}

// มีการแก้ไขร่างต่างจากค่าที่บันทึกไว้จริงหรือไม่ (เทียบทีละแผนก) — ใช้เปิด/ปิดปุ่ม "บันทึกมาตรฐาน" +
// debounce ยิง StageLeadTime ใหม่เฉพาะตอนมีการเปลี่ยนแปลงจริง (กัน re-fetch เปล่าๆ ตอนเปิดแผงครั้งแรก)
export function hasDraftChanges(draftMap, savedMap) {
  const draft = draftMap || {}
  const saved = savedMap || {}
  const keys = new Set([...Object.keys(draft), ...Object.keys(saved)])
  for (const key of keys) {
    if ((draft[key] ?? null) !== (saved[key] ?? null)) return true
  }
  return false
}
