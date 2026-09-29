// executive-helpers.js — pure logic สำหรับหน้า "ภาพรวมผู้บริหาร" (/executive)
// แยกออกจาก component เพื่อ unit test ได้โดยไม่ต้อง mount component จริง
import dayjs from 'dayjs'

import { formatDate } from '@/services/utils/dayjs.js'
import { aggregateMonthlyTotals, sumWorkerTotals, computeLossPercent } from '@/services/utils/gold-loss/slip-monthly-helpers.js'

// แถวเดือนล่าสุดของ Summary.goldLoss (API ExecutiveReport/Summary) — ใช้ร่วมกันทั้ง KPI tile
// (summary-view.vue) และ sheet "สรุป" ของ Excel export กันตัวเลขไม่ตรงกัน
const EMPTY_GOLD_LOSS_ROW = { month: '', slipCount: 0, issuedGram: 0, rawLossGram: 0, allowedGram: 0, overAllowedGram: 0, overSlipCount: 0, lossPercent: 0, allowedPercent: 0, overAllowedPercent: 0 }

export function resolveLatestGoldLossRow(rows) {
  const list = rows || []
  return list.length ? list[list.length - 1] : { ...EMPTY_GOLD_LOSS_ROW }
}

// ---- Tab navigation (TabViewGeneric — ผูก query string ?tab=) ----

export const EXECUTIVE_TABS = ['production', 'sales', 'stock']

// ค่า tab จาก query string — ค่าไม่ถูกต้อง/ไม่มี → fallback เป็น 'production' เสมอ
export function resolveActiveTab(tabValue) {
  return EXECUTIVE_TABS.includes(tabValue) ? tabValue : 'production'
}

// KPI tile ไหน กดแล้วต้องสลับไป tab ไหน
export const KPI_TAB_MAP = {
  stalePlans: 'production',
  receivablesOutstanding: 'sales',
  noDueDate: 'sales',
  soNoInvoice: 'sales',
  stockNoCost: 'stock',
  goldLossOverAllowed: 'production'
}

export function resolveKpiTab(kpiKey) {
  return KPI_TAB_MAP[kpiKey] || 'production'
}

// ---- Receivables donut (tab เงิน) ----
// ลำดับ series ต้องตรงกับ DONUT_SLICE_FILTER_MAP เสมอ:
// index 0 = รับแล้ว/บางส่วน (เขียว), 1 = ยังไม่รับ ยังไม่เลย/ไม่มีกำหนด (warning), 2 = ยังไม่รับ เลยกำหนด (แดง/critical)
export function buildReceivablesDonutSeries(receivablesSummary, labels = {}) {
  const r = receivablesSummary || {}
  return {
    series: [r.paidOrPartialThb || 0, r.unpaidNotOverdueThb || 0, r.overdueThb || 0],
    labels: [labels.paid || '', labels.unpaidNotDue || '', labels.overdue || '']
  }
}

// center label ของ donut — คืนตัวเลข/ข้อความดิบ ไม่ผูก i18n (caller ประกอบข้อความเองผ่าน $t)
export function buildDonutCenterLabel(receivablesSummary) {
  const r = receivablesSummary || {}
  return {
    totalAbbrev: formatMoneyAbbreviated(r.invoiceTotalThb),
    invoiceCount: r.invoiceCount || 0
  }
}

// plotOptions.pie.donut.labels ของกราฟโดนัท — ต้องมี name.show/value.show = true เสมอคู่กับ total.show
// gotcha ApexCharts (v3.41.1 renderInnerDataLabels): total.show คุมแค่ "เนื้อหา" ที่จะใช้ (name=total.label,
// val=total.formatter) แต่การสร้าง <text> element จริงถูกคุมแยกด้วย name.show/value.show — ถ้า false
// ทั้งคู่ ApexCharts จะไม่วาด element เลยแม้ total.show=true ทำให้ center label หายไปทั้งที่ config ถูกแล้ว
export function buildDonutCenterLabelsOptions(centerLabelText, centerValueText) {
  return {
    show: true,
    name: { show: true },
    value: { show: true },
    total: {
      show: true,
      showAlways: true,
      label: centerLabelText,
      formatter: () => centerValueText
    }
  }
}

// คลิก slice ของ donut → filter ของ ToggleGroup ฝั่ง tab เงิน (index ต้องตรงกับ buildReceivablesDonutSeries)
// 'all' (สีเขียว/รับแล้ว) ไม่ใช่ filter จริงใน ToggleGroup — caller เลือก ignore ได้ตามที่ระบุ
export const DONUT_SLICE_FILTER_MAP = ['all', 'unpaid', 'overdue']

export function resolveDonutSliceFilter(dataPointIndex) {
  return DONUT_SLICE_FILTER_MAP[dataPointIndex] ?? null
}

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

// การ์ด KPI "ทองช่างแต่ง loss เดือนนี้" — เขียวเมื่อ loss% เดือนล่าสุดยังอยู่ในเกณฑ์ที่ยอมให้ (<=)
// เหลือง (warning) เมื่อเกินเกณฑ์ — เทียบ lossPercent/allowedPercent ของแถวเดือนล่าสุดจาก Summary.goldLoss ตรงๆ
export function resolveGoldLossKpiVariant(lossPercent, allowedPercent) {
  return (Number(lossPercent) || 0) <= (Number(allowedPercent) || 0) ? 'green' : 'warning'
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
  const goldLoss = resolveLatestGoldLossRow(s.goldLoss)

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
    { label: labels.stockAgedOver1yCount, value: stock.agedOver1yCount || 0 },
    { label: labels.goldLossPercent, value: `${goldLoss.lossPercent || 0}%` },
    { label: labels.goldLossAllowedPercent, value: `${goldLoss.allowedPercent || 0}%` },
    { label: labels.goldLossOverSlipCount, value: goldLoss.overSlipCount || 0 },
    { label: labels.goldLossOverAllowedGram, value: formatGramAmount(goldLoss.overAllowedGram) }
  ]
}

// sheet "ใบงานค้าง" — StalePlans rows
// createdFallbackLabel — ข้อความแทน lastAction เมื่อยังไม่มีประวัติสถานะ (caller ส่ง $t(...) มาแปลแล้ว
// เช่น "สร้างใบงาน") — ไฟล์นี้เป็น pure function ห้าม import i18n ตรงๆ
export function buildStalePlansExcelRows(rows, departmentLabels = {}, createdFallbackLabel = '') {
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
    lastUpdateBy: row.lastUpdateBy || '',
    lastAction: row.lastAction || createdFallbackLabel,
    lastActionDate: row.lastActionDate ? formatDate(row.lastActionDate) : '',
    workers: (row.workers || []).filter(Boolean).join(', '),
    daysSinceMove: row.daysSinceMove || 0
  }))
}

// sheet "บิลค้างรับ" — Receivables rows (filter='all')
export function buildReceivablesExcelRows(rows, paymentStateLabels = {}) {
  return (rows || []).map((row) => ({
    // บาง invoice (โดยเฉพาะที่มาจากงานเก่า) ไม่มี dkInvoiceNumber — fallback ไปใช้ running แทนเพื่อไม่ให้ช่องว่างเปล่า
    dkInvoiceNumber: row.dkInvoiceNumber || row.running || '',
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

// sheet "ทองรายเดือน" — รวมยอดรายเดือนทั้ง 2 แผนก (ช่างแต่ง/ช่างฝัง) ในช่วง monthKeys ที่ระบุ
// (rows ต้องเป็น shape กลางที่ normalize แล้ว — normalizeTangRow/normalizeSetterRow จาก slip-monthly-helpers.js)
export function buildGoldLossMonthlyExcelRows(monthKeys, tangRows, setterRows, deptLabels = {}) {
  const tangTotals = aggregateMonthlyTotals(tangRows || [])
  const setterTotals = aggregateMonthlyTotals(setterRows || [])

  const rows = []
  ;(monthKeys || []).forEach((key) => {
    ;[
      { dept: deptLabels.tang, totals: tangTotals.get(key) },
      { dept: deptLabels.setter, totals: setterTotals.get(key) }
    ].forEach(({ dept, totals }) => {
      const t = totals || { issued: 0, loss: 0, allowed: 0 }
      rows.push({
        month: formatMonthLabel(key),
        dept: dept || '',
        issuedGram: Number(t.issued || 0).toFixed(2),
        lossGram: Number(t.loss || 0).toFixed(2),
        allowedGram: Number(t.allowed || 0).toFixed(2),
        lossPercent: computeLossPercent(t.loss, t.issued).toFixed(2)
      })
    })
  })
  return rows
}

// sheet "ทองรายช่าง" — อันดับ loss ต่อช่างทั้ง 2 แผนก (rank แยกเริ่ม 1 ใหม่ต่อแผนก) ไม่ตัด top N
// (ต่างจากกราฟที่ตัด 12 คนแรก) ในช่วงที่ caller กรองมาแล้ว (เดือนนี้/3 เดือน)
export function buildGoldLossByWorkerExcelRows(tangRows, setterRows, deptLabels = {}) {
  const buildDeptRows = (rows, dept) =>
    sumWorkerTotals(rows || []).map((w, index) => ({
      rank: index + 1,
      dept,
      workerCode: w.workerCode || '',
      workerName: w.workerName || '',
      issuedGram: Number(w.totalIssued || 0).toFixed(2),
      lossGram: Number(w.totalLoss || 0).toFixed(2),
      allowedGram: Number(w.totalAllowed || 0).toFixed(2),
      lossPercent: computeLossPercent(w.totalLoss, w.totalIssued).toFixed(2)
    }))

  return [...buildDeptRows(tangRows, deptLabels.tang), ...buildDeptRows(setterRows, deptLabels.setter)]
}
