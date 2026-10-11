// wip-trend-helpers.js — pure logic ของ wip-trend-panel.vue/wip-trend-card.vue (การ์ดพัฒนาการงานค้าง
// แยกแผนก + ตารางเปรียบเทียบ) — ห้าม import Vue/i18n ที่นี่ ข้อความ resolve เป็นหน้าที่ component เอง
//
// กติกาสี/ไอคอนตามที่ user ตัดสินใจ: งานค้าง "เพิ่มขึ้น" (delta บวก) = แย่ลง -> สีแดง (critical token) ▲
// งานค้าง "ลดลง" (delta ลบ) = ดีขึ้น -> สีเขียว ▼ — กลับด้านจากธรรมเนียม dashboard ทั่วไปเพราะตัวชี้วัดนี้
// "ยิ่งมากยิ่งแย่"
import dayjs from 'dayjs'

export function resolveDeltaVariant(delta) {
  if (!delta) return 'equal'
  return delta > 0 ? 'increase' : 'decrease'
}

const DELTA_COLOR_TOKEN = {
  increase: 'var(--base-red)',
  decrease: 'var(--base-green)',
  equal: 'var(--base-sub-color)'
}

export function resolveDeltaColorToken(variant) {
  return DELTA_COLOR_TOKEN[variant] || DELTA_COLOR_TOKEN.equal
}

const DELTA_ICON = {
  increase: 'bi-caret-up-fill',
  decrease: 'bi-caret-down-fill',
  equal: 'bi-dash-lg'
}

export function resolveDeltaIcon(variant) {
  return DELTA_ICON[variant] || DELTA_ICON.equal
}

function formatAbsNumber(value) {
  return new Intl.NumberFormat('th-TH').format(Math.abs(value || 0))
}

// "+n (+x%)" / "−n (−x%)" / "± 0" — deltaPercent เป็น optional (ตารางเปรียบเทียบมีให้เสมอ แต่ที่อื่น
// อาจไม่มี) ไม่ใส่วงเล็บ % เมื่อไม่มีค่า
export function formatDeltaText(delta, deltaPercent) {
  const variant = resolveDeltaVariant(delta)
  if (variant === 'equal') return '± 0'
  const sign = variant === 'increase' ? '+' : '−'
  const pctText = deltaPercent !== null && deltaPercent !== undefined ? ` (${sign}${formatAbsNumber(deltaPercent)}%)` : ''
  return `${sign}${formatAbsNumber(delta)}${pctText}`
}

// การ์ดเริ่มต้นที่เลือกไว้ = แผนกที่ delta (งานค้างเพิ่ม) มากที่สุด — ไม่รวมการ์ด "รวม"
export function resolveDefaultSelectedDept(departments) {
  if (!departments || !departments.length) return null
  return departments.reduce((max, d) => ((d.delta ?? -Infinity) > (max?.delta ?? -Infinity) ? d : max), null)?.key || null
}

// ประโยคสรุป: เข้ามากกว่าออก (งานค้างเพิ่ม) / ออกมากกว่าเข้า (งานค้างลด) / เท่ากัน — คืน key ของ i18n variant
// ให้ component ไปต่อ $t() เอง (ไม่ผูกข้อความไว้ที่นี่)
export function resolveTrendSummaryVariant(inflow, outflow) {
  if ((inflow || 0) > (outflow || 0)) return 'inflowGreater'
  if ((outflow || 0) > (inflow || 0)) return 'outflowGreater'
  return 'equal'
}

// เรียงตารางเปรียบเทียบตาม delta มาก -> น้อย (งานค้างเพิ่มขึ้นมากสุดอยู่บนสุด) — ไม่ mutate array เดิม
export function sortDepartmentsByDeltaDesc(departments) {
  return [...(departments || [])].sort((a, b) => (b.delta || 0) - (a.delta || 0))
}

// วันที่ของจุดข้อมูล sparkline ในการ์ด — รูปแบบตาม granularity ของ bucket (week=DD/MM, month=YYYY-MM)
// คืนค่าว่างเมื่อไม่มี bucketEnd — ไม่มีข้อความภาษาปนอยู่ (component ต่อ $t() key เอง เหมือน
// resolveTrendSummaryVariant ด้านบน)
export function formatSparklineBucketDate(bucketEnd, bucket) {
  if (!bucketEnd) return ''
  return bucket === 'month' ? dayjs(bucketEnd).format('YYYY-MM') : dayjs(bucketEnd).format('DD/MM')
}

// จุดแรก/จุดสุดท้ายของ sparkline (ต้นช่วง/ปลายช่วง) — ใช้กรอง dataLabels ให้โชว์เฉพาะ 2 จุดนี้ ไม่ใช่ทุกจุด
export function isSparklineEdgePoint(index, length) {
  if (!length) return false
  return index === 0 || index === length - 1
}

// ApexCharts markers.discrete สำหรับไฮไลต์จุดแรก/จุดสุดท้าย — series 1 จุดได้ marker เดียว (กัน overlap
// ตำแหน่งเดียวกัน 2 marker ซ้อนกัน)
export function buildSparklineDiscreteMarkers(seriesLength, color) {
  if (!seriesLength) return []
  const marker = (dataPointIndex) => ({ seriesIndex: 0, dataPointIndex, fillColor: color, strokeColor: color, size: 4 })
  if (seriesLength === 1) return [marker(0)]
  return [marker(0), marker(seriesLength - 1)]
}

// series[0] จาก backend คือ "สิ้นสุด bucket แรก" ไม่ใช่ "ต้นช่วงจริง" ทำให้จุดแรกที่โชว์ในการ์ด/กราฟ
// รายละเอียด ไม่เท่ากับเลข "ต้นช่วง" ที่การ์ดโชว์ (เช่น ต้นช่วง 3,382 แต่จุดแรกในกราฟ 3,369) — เติมจุด
// สังเคราะห์ { bucketEnd: rangeStart, wip: startWip } ไว้หน้าสุดเสมอ ให้จุดแรกในกราฟ = ตัวเลข "ต้นช่วง"
// เป๊ะ — inflow/outflow ของจุดนี้เป็น null (ไม่มีข้อมูลจริงก่อนหน้าจุดนี้ ไม่ใช่ 0 จริงๆ — caller ที่ map
// เป็นตัวเลขกราฟ (`p.inflow || 0`) จะกลาย 0 เองอยู่แล้วเวลาวาดแท่ง)
export function prependRangeStartPoint(series, rangeStart, startWip) {
  if (!rangeStart || !Number.isFinite(startWip)) return series || []
  const synthetic = { bucketEnd: rangeStart, wip: startWip, inflow: null, outflow: null, isSynthetic: true }
  return [synthetic, ...(series || [])]
}
