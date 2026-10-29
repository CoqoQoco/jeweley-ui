// stock-helpers.js — pure logic ของ topic "คลังสินค้า" (StockInsight/Overview) ที่ stock.config.js ใช้ — ห้าม import Vue/i18n
import { formatThaiMonthYear } from '@/components/insight/insight-helpers.js'

export const STOCK_INSIGHT_ENDPOINT = 'StockInsight/Overview'
export const STOCK_INSIGHT_MONTHS = 12
export const AGE_BUCKET_KEYS = ['lt1y', 'y1to2', 'y2to5', 'gt5y']
export const CATEGORY_CHART_LIMIT = 15

const S = 'view.productionInsight.stockInsight'

// body ของ request — ส่งเฉพาะ key ที่ API รู้จัก (API ทิ้ง key แปลกปลอมเงียบๆ) · metal ถูกเติมโดย store (metal-scope) · thresholds ไม่ส่ง = default
export function buildOverviewParams() {
  return { months: STOCK_INSIGHT_MONTHS }
}

const percentOf = (part, total) => (total > 0 ? Math.round((part / total) * 10000) / 100 : null)

// ป้ายสีของการ์ดตามเกณฑ์ที่ API ใช้จริง (thresholds ใน response): ถึง warn/critical = 'warning' · ต่ำกว่า = 'green' · ไม่มีข้อมูล = 'main'
export function toneByThreshold(value, warn) {
  if (value === null || value === undefined) return 'main'
  if (warn === null || warn === undefined) return 'main'
  if (value >= warn) return 'warning'
  return 'green'
}

// ข้อความ forecast ปริมาณสต็อกพอขาย: coverMonths = null (ไม่มียอดขายออกเลย) / direction low|high ใช้ข้อความคนละตัว (i18n ไม่มีเงื่อนไขในตัว)
// และ actions ปล่อยผ่านตามเดิม — เสียบผ่าน config.filterFindings
export function remapStockFindings(items) {
  return (items || []).map((item) => {
    if (item?.code !== 'FC_STK_COVER_MONTHS') return item
    const params = item.params || {}
    const code = params.coverMonths === null || params.coverMonths === undefined ? 'FC_STK_COVER_NONE' : params.direction === 'low' ? 'FC_STK_COVER_LOW' : 'FC_STK_COVER_HIGH'
    return { ...item, code }
  })
}

// แถวอายุสต็อก: เรียงตาม AGE_BUCKET_KEYS (API ส่ง 4 แถวเสมอ) · count/costThb เป็นชิ้น (API คูณจำนวนชิ้นแล้ว)
export function buildAgeRows(ageBuckets, t) {
  const byKey = Object.fromEntries((ageBuckets || []).map((b) => [b.key, b]))
  return AGE_BUCKET_KEYS.filter((key) => byKey[key]).map((key) => {
    const b = byKey[key]
    return {
      key,
      label: t(`${S}.ageBucket.${key}`),
      count: b.count || 0,
      noCostCount: b.noCostCount || 0,
      withCostCount: Math.max((b.count || 0) - (b.noCostCount || 0), 0),
      noCostPercent: percentOf(b.noCostCount || 0, b.count || 0),
      costThb: b.costThb ?? 0
    }
  })
}

export function buildReceiptRows(receiptTypes, t) {
  return (receiptTypes || []).map((r, index) => ({
    key: `${r.receiptType ?? 'null'}-${index}`,
    label: r.receiptType || t(`${S}.receiptUnknown`),
    count: r.count || 0,
    noCostCount: r.noCostCount || 0,
    noCostPercent: percentOf(r.noCostCount || 0, r.count || 0),
    costThb: r.costThb ?? 0
  }))
}

// หมวดสินค้า: เรียงตามจำนวนชิ้นมาก→น้อย · ชื่อว่าง = "ไม่ระบุ"
export function buildCategoryRows(categories, t) {
  return (categories || [])
    .map((c) => ({
      key: c.category || '(none)',
      label: c.categoryName || c.category || t(`${S}.categoryUnknown`),
      count: c.count || 0,
      noCostCount: c.noCostCount || 0,
      agedOver1yCount: c.agedOver1yCount || 0,
      costThb: c.costThb ?? 0
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'th'))
}

// หมายเหตุใต้กราฟแนวโน้ม: ขายสุทธิ = ขาย − คืน + ประวัติขายเริ่มเมื่อไร (ข้อมูลน้อย → คาดการณ์หลักฐานน้อย)
export function buildTrendHint(salesHistory, t) {
  const net = t(`${S}.trendHintNet`)
  const start = salesHistory?.startMonth ? formatThaiMonthYear(String(salesHistory.startMonth).slice(0, 7)) : null
  if (!start) return `${net} ${t(`${S}.trendHintNoHistory`)}`
  return `${net} ${t(`${S}.trendHintHistory`, { start, months: salesHistory.fullMonths ?? 0 })}`
}

// ป้ายเดือนของแกน x: "2026-06-01" → "มิ.ย. 2026"
export function buildMonthLabels(series) {
  return (series || []).map((p) => formatThaiMonthYear(String(p?.month || '').slice(0, 7)))
}
