// sales-helpers.js — pure logic ของ topic "ขายและเงิน" (SalesInsight/Overview + ตารางบิล/SO เดิม) ที่ sales.config.js ใช้ — ห้าม import Vue/i18n
import { formatThaiMonthYear } from '@/components/insight/insight-helpers.js'
import { resolveMetalShareHint } from '../executive-helpers.js'

export const SALES_INSIGHT_ENDPOINT = 'SalesInsight/Overview'
export const SALES_INSIGHT_MONTHS = 12
export const RECEIVABLES_ENDPOINT = 'ExecutiveReport/Receivables'
export const SO_WITHOUT_INVOICE_ENDPOINT = 'ExecutiveReport/SalesOrdersWithoutInvoice'

// ลำดับ = "ตามก่อน" (เลยกำหนดแย่สุด) — ตัวแรกคือค่าตั้งต้นของแท็บ "บิลที่ต้องตาม"
export const DUE_FILTERS = ['overdue', 'unpaid', 'noDue']
export const DEFAULT_DUE_FILTER = DUE_FILTERS[0]
// ค่า filter ที่ ExecutiveReport/Receivables รู้จัก
export const DUE_FILTER_API_VALUE = { overdue: 'overdue', unpaid: 'unpaid', noDue: 'noDueDate' }

export const PAYMENT_STATE_KEYS = ['received', 'unpaidNotDue', 'overdue']
export const AGING_KEYS = ['notDue', 'd1_30', 'd31_60', 'd61_90', 'gt90']

const S = 'view.productionInsight.salesInsight'
const money = (n) => new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(n) || 0)

// body ของ request — ส่งเฉพาะ key ที่ API รู้จัก (API ทิ้ง key แปลกปลอมเงียบๆ) · metal ถูกเติมโดย store · thresholds ไม่ส่ง = default
export function buildOverviewParams() {
  return { months: SALES_INSIGHT_MONTHS }
}

// FC_SAL_COLLECTION มี 2 แบบ (info = มีบิลถึงกำหนด / warning = มียอดค้างแต่ไม่มีบิลถึงกำหนดในหน้าต่าง) → แยก code เพื่อเลือกข้อความ
export function remapSalesFindings(items) {
  return (items || []).map((item) => (item?.code === 'FC_SAL_COLLECTION' && item.severity !== 'info' ? { ...item, code: 'FC_SAL_COLLECTION_NONE' } : item))
}

export function toneByThreshold(value, warn) {
  if (value === null || value === undefined || warn === null || warn === undefined) return 'main'
  return value >= warn ? 'warning' : 'green'
}

// ---- finding / KPI → แท็บ + ตัวสลับของแท็บ "บิลที่ต้องตาม" ----

const DUE_FILTER_BY_CODE = {
  SAL_OLDEST_OVERDUE: 'overdue',
  FC_SAL_BECOMING_OVERDUE: 'overdue',
  SAL_NO_DUE_DATE: 'noDue',
  FC_SAL_COLLECTION: 'unpaid',
  FC_SAL_COLLECTION_NONE: 'unpaid'
}

export const DUE_BLOCK_ID = { overdue: 'salDueOverdue', unpaid: 'salDueUnpaid', noDue: 'salDueNoDue' }

// params.dueFilter (การ์ด KPI) ชนะ → รองลงมาคือ findingCode (ส่งมากับ reportParams) → ค่าตั้งต้น
export function resolveDueFilter(params) {
  const explicit = params?.dueFilter
  if (DUE_FILTERS.includes(explicit)) return explicit
  return DUE_FILTER_BY_CODE[params?.findingCode] || DEFAULT_DUE_FILTER
}

// reportRef 'salDue' → แท็บ due + ตั้งตัวสลับ · อื่นๆ คืน null (ใช้การจับคู่ block id ตามปกติ: salAging→aging, salSo→so ...)
export function resolveSalesReportTarget(reportRef, params) {
  if (reportRef !== 'salDue') return null
  const dueFilter = resolveDueFilter(params)
  return { tab: 'due', reveal: { stateKey: 'dueFilter', value: dueFilter }, anchor: DUE_BLOCK_ID[dueFilter] }
}

// ---- แถว/ป้าย ----

export function buildPaymentSlices(paymentStates) {
  const byKey = Object.fromEntries((paymentStates || []).map((p) => [p.key, p]))
  const colors = { received: 'token:green', unpaidNotDue: 'token:warning', overdue: 'token:red' }
  const labels = { received: 'view.executive.money.seriesPaid', unpaidNotDue: 'view.executive.money.seriesUnpaidNotDue', overdue: 'view.executive.money.seriesOverdue' }
  return PAYMENT_STATE_KEYS.map((key) => ({ label: labels[key], value: byKey[key]?.amountThb || 0, color: colors[key] }))
}

export function sumPaymentCount(paymentStates) {
  return (paymentStates || []).reduce((sum, p) => sum + (p.count || 0), 0)
}

// donut → ตัวสลับ: ชิ้น 1 = ยังไม่รับ (ยังไม่เลย/ไม่มีกำหนด), 2 = เลยกำหนด; ชิ้น 0 (รับแล้ว) ไม่ใช่ตัวกรองจริง
export function resolvePaymentSliceFilter(index) {
  return { 1: 'unpaid', 2: 'overdue' }[index] ?? null
}

export function buildAgingRows(aging, t) {
  const byKey = Object.fromEntries((aging || []).map((a) => [a.key, a]))
  return AGING_KEYS.filter((key) => byKey[key]).map((key) => ({
    key,
    label: t(`${S}.agingCategory`, { label: t(`${S}.agingBucket.${key}`), count: byKey[key].count || 0 }),
    amountThb: byKey[key].amountThb || 0,
    count: byKey[key].count || 0
  }))
}

export function buildTopCustomerRows(topCustomers) {
  return (topCustomers || []).map((c, index) => ({
    key: `${c.customerCode ?? 'none'}-${index}`,
    customerName: c.customerName || c.customerCode || '—',
    count: c.count || 0,
    outstandingThb: c.outstandingThb || 0,
    overdueThb: c.overdueThb || 0
  }))
}

// แถวบิลจาก ExecutiveReport/Receivables: เลขที่ = dkInvoiceNumber ถ้ามี ไม่งั้น running · metalHint = สัดส่วนโลหะเมื่อเลือกโลหะเดียวและบิลมีหลายโลหะปน
export function mapInvoiceRows(items, metal, t) {
  return (items || []).map((row) => {
    const share = resolveMetalShareHint(row, metal)
    return {
      ...row,
      rowKey: row.running,
      invoiceNo: row.dkInvoiceNumber || row.running,
      metalHint: share == null ? '' : t('view.executive.metalScope.shareHint', { metal: t(`view.executive.metalScope.options.${metal}`), percent: share }),
      outstandingText: row.outstanding == null ? '—' : `${money(row.outstanding)}${row.currencyUnit ? ` ${row.currencyUnit}` : ''}`,
      stateText: row.paymentState ? t(`view.executive.money.paymentState.${row.paymentState}`) : '—'
    }
  })
}

export function mapSoRows(items, metal, t) {
  return (items || []).map((row) => {
    const share = resolveMetalShareHint(row, metal)
    return {
      ...row,
      rowKey: row.soNumber,
      metalHint: share == null ? '' : t('view.executive.metalScope.shareHint', { metal: t(`view.executive.metalScope.options.${metal}`), percent: share }),
      overdueText: row.isOverdue ? t('view.executive.money.yes') : t('view.executive.money.no')
    }
  })
}

// ป้ายตัวสลับ "บิลที่ต้องตาม" พร้อมจำนวนจาก KPI ของ Overview (นับเหมือนการ์ดสรุปด้านบน: noDue = บิลทุกใบที่ไม่มีวันครบกำหนด)
export function dueFilterCounts(kpi) {
  return { overdue: kpi?.overdueCount ?? 0, unpaid: kpi?.outstandingCount ?? 0, noDue: kpi?.noDueDateAllCount ?? 0 }
}

export const DUE_FILTER_LABEL_KEY = { overdue: 'view.executive.money.tabOverdue', unpaid: 'view.executive.money.tabUnpaid', noDue: 'view.executive.money.tabNoDueDate' }

export function buildTrendHint(salesHistory, t) {
  const start = salesHistory?.startMonth ? formatThaiMonthYear(String(salesHistory.startMonth).slice(0, 7)) : null
  return start ? t(`${S}.trendHint`, { start, months: salesHistory.fullMonths ?? 0 }) : t(`${S}.trendHintNone`)
}

export function buildMonthLabels(series) {
  return (series || []).map((p) => formatThaiMonthYear(String(p?.month || '').slice(0, 7)))
}
