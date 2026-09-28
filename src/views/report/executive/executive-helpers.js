// executive-helpers.js — pure logic สำหรับหน้า "ภาพรวมผู้บริหาร" (/executive)
// แยกออกจาก component เพื่อ unit test ได้โดยไม่ต้อง mount component จริง
import dayjs from 'dayjs'

import { formatDate } from '@/services/utils/dayjs.js'

// % ทองที่หายเกินเกณฑ์ (overAllowedPercent) ตั้งแต่ค่านี้ขึ้นไป ถือว่า "เกินเกณฑ์" (ต้องขึ้น warning)
export const GOLD_LOSS_OVER_ALLOWED_THRESHOLD = 0.4

// KPI ที่อยู่ในสถานะไม่ดี (เช่น มีของค้าง/เลยกำหนด) → 'warning', ปกติ → goodVariant ('main' | 'green' ที่ caller ระบุ)
export function resolveKpiVariant(isBad, goodVariant = 'main') {
  return isBad ? 'warning' : goodVariant
}

// ยอดเงินแบบย่อสำหรับ KPI tile — ฿ + ตัวย่อ M/K
export function formatMoneyAbbreviated(value) {
  const num = Number(value) || 0
  const abs = Math.abs(num)

  if (abs >= 1_000_000) {
    return `฿${(num / 1_000_000).toFixed(2)}M`
  }
  if (abs >= 1_000) {
    return `฿${(num / 1_000).toFixed(1)}K`
  }
  return `฿${new Intl.NumberFormat('th-TH').format(num)}`
}

// ยอดเงินเต็มจำนวน ทศนิยม 2 ตำแหน่ง — สำหรับตาราง/Excel
export function formatMoneyFull(value) {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(value) || 0)
}

// น้ำหนักทอง (กรัม) ทศนิยม 2 ตำแหน่ง + thousands separator — ใช้แสดงในตาราง/subLabel (ไม่มีสัญลักษณ์สกุลเงิน)
export function formatGramAmount(value) {
  return formatMoneyFull(value)
}

// เปอร์เซ็นต์ทั่วไป (part/total*100) ปัดทศนิยม 1 ตำแหน่ง — กัน total=0 หาร 0
export function calcPercent(part, total) {
  const totalNum = Number(total) || 0
  if (totalNum <= 0) return 0
  const partNum = Number(part) || 0
  return Number(((partNum / totalNum) * 100).toFixed(1))
}

// % ทองหายเกินเกณฑ์หรือไม่ (ค่า percent เป็นตัวเลขเปอร์เซ็นต์ตรงๆ เช่น 0.45 = 0.45%)
export function isGoldLossOverThreshold(percent, threshold = GOLD_LOSS_OVER_ALLOWED_THRESHOLD) {
  return (Number(percent) || 0) >= threshold
}

// 'YYYY-MM' → 'MM/YYYY'
export function formatMonthLabel(monthStr) {
  if (!monthStr) return ''
  return dayjs(`${monthStr}-01`).format('MM/YYYY')
}

// ยอดเงินเต็มจำนวน + หน่วยสกุลเงินต่อท้าย — ใช้กับยอดที่แสดงเป็นสกุลของเอกสารเอง (ไม่ใช่ THB)
// เช่น "ค้างรับ (สกุลบิล)" กัน mixed-unit misread เมื่อวางคู่กับคอลัมน์ที่เป็น THB เสมอ
export function formatMoneyWithCurrency(value, currencyUnit) {
  const amount = formatMoneyFull(value)
  return currencyUnit ? `${amount} ${currencyUnit}` : amount
}

// แยกข้อมูลเดือนปิดงาน (13 เดือน, เดือนสุดท้าย = เดือนปัจจุบันที่ยังไม่ครบ) เป็น 2 series
// เพื่อให้ ApexCharts ให้สีต่างกันตาม series (เดือนที่ปิดครบ vs เดือนปัจจุบัน) แทนการใช้ colors เป็น
// callback function ร่วมกับ plotOptions.bar.distributed:true ซึ่งพบว่า ApexCharts ไม่เรียก callback นั้น
// แล้ว cycle สี palette ปกติทุกแท่งแทน (ทุกเดือนได้สีต่างกันหมด ไม่ใช่แค่เดือนปัจจุบัน)
// แนวทางนี้ทุกแท่งในแต่ละ series ได้สีเดียวกันตาม colors[seriesIndex] เสมอ (พฤติกรรม ApexCharts มาตรฐาน)
export function buildMonthlyCompletedSeriesData(monthlyCompleted) {
  const rows = monthlyCompleted || []
  const lastIndex = rows.length - 1
  const completed = rows.map((row, index) => (index === lastIndex ? null : row.completedCount || 0))
  const current = rows.map((row, index) => (index === lastIndex ? row.completedCount || 0 : null))
  return { completed, current }
}

// ---- Excel sheet row builders (pure — รับ raw API rows + labels ที่ resolve แล้ว, คืน flat object พร้อมลง ExcelHelper) ----

// sheet "สรุป" — label/value ของทุก KPI ใน Summary + asOf (labels ต้อง resolve เป็นข้อความจริงมาจาก caller ผ่าน $t())
export function buildSummaryExcelRows(summary, labels = {}) {
  const s = summary || {}
  const production = s.production || {}
  const receivables = s.receivables || {}
  const salesOrders = s.salesOrders || {}
  const stock = s.stock || {}

  return [
    { label: labels.asOf, value: s.asOf ? formatDate(s.asOf) : '' },
    { label: labels.productionOpenCount, value: production.openCount || 0 },
    { label: labels.productionMoved30d, value: production.moved30dCount || 0 },
    { label: labels.productionStale180d, value: production.stale180dCount || 0 },
    { label: labels.productionMeltedOpen, value: production.meltedOpenCount || 0 },
    { label: labels.invoiceCount, value: receivables.invoiceCount || 0 },
    { label: labels.invoiceTotalThb, value: formatMoneyFull(receivables.invoiceTotalThb) },
    { label: labels.paidOrPartialThb, value: formatMoneyFull(receivables.paidOrPartialThb) },
    { label: labels.unpaidCount, value: receivables.unpaidCount || 0 },
    { label: labels.unpaidThb, value: formatMoneyFull(receivables.unpaidThb) },
    { label: labels.overdueCount, value: receivables.overdueCount || 0 },
    { label: labels.overdueThb, value: formatMoneyFull(receivables.overdueThb) },
    { label: labels.unpaidNotOverdueThb, value: formatMoneyFull(receivables.unpaidNotOverdueThb) },
    { label: labels.noDueDateCount, value: receivables.noDueDateCount || 0 },
    { label: labels.soOpenCount, value: salesOrders.openCount || 0 },
    { label: labels.soNoInvoiceCount, value: salesOrders.noInvoiceCount || 0 },
    { label: labels.soNoInvoiceThb, value: formatMoneyFull(salesOrders.noInvoiceThb) },
    { label: labels.soOverdueNoInvoiceCount, value: salesOrders.overdueNoInvoiceCount || 0 },
    { label: labels.soNoDeliveryDateCount, value: salesOrders.noDeliveryDateCount || 0 },
    { label: labels.stockInStockCount, value: stock.inStockCount || 0 },
    { label: labels.stockNoCostCount, value: stock.noCostCount || 0 },
    { label: labels.stockCostThb, value: formatMoneyFull(stock.costThb) },
    { label: labels.stockAgedOver1yCount, value: stock.agedOver1yCount || 0 }
  ]
}

// sheet "ใบงานค้าง" — StalePlans rows
export function buildStalePlansExcelRows(rows, departmentLabels = {}) {
  return (rows || []).map((row) => ({
    wo: row.woText || row.woNumber || row.wo || '',
    mold: row.mold || '',
    productNumber: row.productNumber || '',
    productName: row.productName || '',
    productQty: row.productQty || 0,
    department: departmentLabels[row.departmentKey] || row.departmentKey || '',
    status: row.statusName || '',
    createDate: row.createDate ? formatDate(row.createDate) : '',
    lastMoveDate: row.lastMoveDate ? formatDate(row.lastMoveDate) : '',
    daysSinceMove: row.daysSinceMove || 0
  }))
}

// sheet "บิลค้างรับ" — Receivables rows (filter='all')
export function buildReceivablesExcelRows(rows, paymentStateLabels = {}) {
  return (rows || []).map((row) => ({
    dkInvoiceNumber: row.dkInvoiceNumber || '',
    soRunning: row.soRunning || '',
    customerCode: row.customerCode || '',
    customerName: row.customerName || '',
    createDate: row.createDate ? formatDate(row.createDate) : '',
    dueDate: row.dueDate ? formatDate(row.dueDate) : '',
    currencyUnit: row.currencyUnit || '',
    grandTotal: formatMoneyFull(row.grandTotal),
    grandTotalThb: formatMoneyFull(row.grandTotalThb),
    paidAmount: formatMoneyFull(row.paidAmount),
    outstanding: formatMoneyFull(row.outstanding),
    paymentState: paymentStateLabels[row.paymentState] || row.paymentState || '',
    isOverdue: row.isOverdue ? 'Y' : 'N',
    daysOverdue: row.daysOverdue || 0,
    salePerson: row.salePerson || '',
    saleChannelCode: row.saleChannelCode || ''
  }))
}

// sheet "SO ยังไม่ออกบิล" — SalesOrdersWithoutInvoice rows
export function buildSalesOrdersExcelRows(rows) {
  return (rows || []).map((row) => ({
    soNumber: row.soNumber || '',
    customerCode: row.customerCode || '',
    customerName: row.customerName || '',
    soDate: row.soDate ? formatDate(row.soDate) : '',
    deliveryDate: row.deliveryDate ? formatDate(row.deliveryDate) : '',
    currencyUnit: row.currencyUnit || '',
    grandTotal: formatMoneyFull(row.grandTotal),
    grandTotalThb: formatMoneyFull(row.grandTotalThb),
    isOverdue: row.isOverdue ? 'Y' : 'N',
    salePerson: row.salePerson || '',
    saleChannelCode: row.saleChannelCode || ''
  }))
}

// sheet "คลังตามอายุ" — ageBuckets + receiptTypes รวมเป็นตารางเดียว (คอลัมน์ section แยกหมวด)
export function buildStockAgingExcelRows(ageBuckets, receiptTypes, bucketLabels = {}, sectionLabels = {}) {
  const bucketRows = (ageBuckets || []).map((bucket) => ({
    section: sectionLabels.ageBucket || 'ageBucket',
    key: bucketLabels[bucket.key] || bucket.key || '',
    count: bucket.count || 0,
    noCostCount: bucket.noCostCount || 0,
    costThb: formatMoneyFull(bucket.costThb)
  }))

  const receiptRows = (receiptTypes || []).map((receiptType) => ({
    section: sectionLabels.receiptType || 'receiptType',
    key: receiptType.receiptType || '',
    count: receiptType.count || 0,
    noCostCount: receiptType.noCostCount || 0,
    costThb: ''
  }))

  return [...bucketRows, ...receiptRows]
}

// sheet "ทองช่างแต่ง" — goldLoss rows (จาก Summary.goldLoss)
export function buildGoldLossExcelRows(rows) {
  return (rows || []).map((row) => ({
    month: formatMonthLabel(row.month),
    slipCount: row.slipCount || 0,
    issuedGram: Number(row.issuedGram || 0).toFixed(2),
    rawLossGram: Number(row.rawLossGram || 0).toFixed(2),
    overAllowedGram: Number(row.overAllowedGram || 0).toFixed(2),
    overAllowedPercent: Number(row.overAllowedPercent || 0).toFixed(2)
  }))
}
