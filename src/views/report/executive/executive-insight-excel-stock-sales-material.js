// executive-insight-excel-stock-sales-material.js — pure row builders ของ sheet "คลังสินค้า / ขายและเงิน / คลังวัตถุดิบ" ที่เพิ่มใน "Excel ทั้งหมด" ของหน้า /executive
// ข้อมูลมาจาก StockInsight/Overview, SalesInsight/Overview, MaterialInsight/Overview (snapshot ไม่มีช่วงเวลา · series ย้อนหลัง 12 เดือน)
// ข้อความ finding/action ผ่าน i18n ชุดเดียวกับแท็บ (config.i18nPrefix + config.filterFindings เช่น remap FC_STK_COVER_* / FC_SAL_COLLECTION_NONE) — ไม่เขียนซ้ำ
// ห้าม import Vue/Pinia/i18n: ทุกฟังก์ชันรับ `t` มาจาก caller · ตัวเลขตามธรรมเนียม sheet เดิม: น้ำหนัก/ปริมาณ = toFixed(2), เงิน = formatMoneyFull, จำนวนนับ = number, null = ''
import { formatDate } from '@/services/utils/dayjs.js'
import { resolveFindingParams, formatThaiMonthYear } from '@/components/insight/insight-helpers.js'
import { buildAgeRows, buildReceiptRows, buildCategoryRows } from './stock/stock-helpers.js'
import { AGING_KEYS, buildTopCustomerRows } from './sales/sales-helpers.js'
import { buildItemRows } from './material/material-helpers.js'
import { formatMoneyFull } from './executive-helpers.js'

const X = 'view.executive.excel.insight'
const SN = 'view.executive.excel.snapshot'
const STOCK = 'view.productionInsight.stockInsight'
const SALES = 'view.productionInsight.salesInsight'
const MATERIAL = 'view.productionInsight.materialInsight'

const fixed2 = (value) => (value != null ? Number(value).toFixed(2) : '')
const money = (value) => (value != null ? formatMoneyFull(value) : '')
const count = (value) => (value != null ? value : '')
const percent = (value) => (value != null ? Number(value).toFixed(2) : '')
const monthLabel = (month) => formatThaiMonthYear(String(month || '').slice(0, 7))
const col = (header, key) => ({ header, key })

// ข้อความ finding/action ด้วย lookup ของแท็บ (config.i18nPrefix) — translateDept/Metal ใช้ชุดเดียวกับ insight-tab-layout
export function renderSnapshotText(t, prefix, code, params) {
  const resolved = resolveFindingParams(
    params,
    (key) => t(`view.executive.department.${key}`),
    (workerType) => t(`view.productionInsight.gold.workerType.${workerType}`),
    (metal) => t(`view.productionInsight.gold.metalLabel.${metal}`)
  )
  return t(`${prefix}.${code}`, resolved)
}

// problems / forecasts / actions ของ 1 หมวดในแผ่นเดียว (คอลัมน์ ประเภท/ระดับ/ข้อความ/ผู้รับผิดชอบ) — config.filterFindings (ถ้ามี) ทำงานก่อนแปลข้อความ เหมือนบนจอ
export function buildSnapshotFindingsRows(overview, config, t) {
  const pick = (items) => (config.filterFindings ? config.filterFindings(items || []) : items || [])
  const kindLabel = (kind) => t(`${X}.kind.${kind}`)
  const rows = []
  const push = (kind, finding) =>
    rows.push({
      kind: kindLabel(kind),
      severity: finding.severity ? t(`${X}.severity.${finding.severity}`) : '',
      text: renderSnapshotText(t, config.i18nPrefix, finding.code, finding.params),
      owner: ''
    })
  pick(overview?.problems).forEach((f) => push('problem', f))
  pick(overview?.forecasts).forEach((f) => push('forecast', f))
  pick(overview?.actions).forEach((action) =>
    rows.push({
      kind: kindLabel('action'),
      severity: '',
      text: renderSnapshotText(t, config.i18nPrefix, action.code, action.params),
      owner: action.ownerRole ? t(`view.productionInsight.ownerRole.${action.ownerRole}`) : ''
    })
  )
  return rows
}

// บรรทัดหัว sheet: "ณ <เวลาประมวลผล> · <โลหะ/ชนิด>" + แถวว่างคั่น (ใช้คอลัมน์แรกของ sheet)
export function buildSnapshotLeadRows(overview, extraText, firstKey, t) {
  const asOf = overview?.asOf ? t('view.executive.asOf', { date: formatDate(overview.asOf) }) : ''
  const text = [asOf, extraText].filter(Boolean).join(' · ')
  return text ? [{ [firstKey]: text }, {}] : []
}

const findingColumns = (t) => [col(t(`${X}.colKind`), 'kind'), col(t(`${X}.colSeverity`), 'severity'), col(t(`${X}.colText`), 'text'), col(t(`${X}.colOwner`), 'owner')]

// ---- คลังสินค้า ----

export function buildStockSheets(overview, { t, config, metal, metalLabel }) {
  const lead = (firstKey) => buildSnapshotLeadRows(overview, metalLabel, firstKey, t)
  const ageRows = buildAgeRows(overview?.ageBuckets, t, metal)
  const receiptRows = buildReceiptRows(overview?.receiptTypes, t, metal)
  const categoryRows = buildCategoryRows(overview?.categories, t, metal)
  const showQty = metal !== 'ALL'

  const costColumns = [col(t(`${STOCK}.colCount`), 'count'), col(t(`${STOCK}.colNoCost`), 'noCostCount'), col(t(`${STOCK}.colCostThb`), 'costThb')]
  const qtyColumns = showQty ? [col(t(`${STOCK}.colQty`), 'qty')] : []
  const mapCost = (row) => ({ count: count(row.count), noCostCount: count(row.noCostCount), costThb: money(row.costThb), ...(showQty ? { qty: fixed2(row.qtyShown) } : {}) })

  return [
    { sheetName: t(`${SN}.stockFindings`), data: [...lead('kind'), ...buildSnapshotFindingsRows(overview, config, t)], columns: findingColumns(t) },
    {
      sheetName: t(`${SN}.stockAge`),
      data: [...lead('label'), ...ageRows.map((row) => ({ label: row.label, ...mapCost(row), noCostPercent: percent(row.noCostPercent) }))],
      columns: [col(t(`${STOCK}.colAge`), 'label'), ...costColumns, col(t(`${STOCK}.colNoCostPercent`), 'noCostPercent'), ...qtyColumns]
    },
    {
      sheetName: t(`${SN}.stockReceipt`),
      data: [...lead('label'), ...receiptRows.map((row) => ({ label: row.label, ...mapCost(row), noCostPercent: percent(row.noCostPercent) }))],
      columns: [col(t(`${STOCK}.colReceiptType`), 'label'), ...costColumns, col(t(`${STOCK}.colNoCostPercent`), 'noCostPercent'), ...qtyColumns]
    },
    {
      sheetName: t(`${SN}.stockCategory`),
      data: [...lead('label'), ...categoryRows.map((row) => ({ label: row.label, ...mapCost(row), agedOver1yCount: count(row.agedOver1yCount) }))],
      columns: [col(t(`${STOCK}.colCategory`), 'label'), ...costColumns, col(t(`${STOCK}.colAged1y`), 'agedOver1yCount'), ...qtyColumns]
    },
    {
      sheetName: t(`${SN}.stockSeries`),
      data: [
        ...lead('month'),
        ...(overview?.series || []).map((p) => ({
          month: monthLabel(p.month),
          inflowQty: fixed2(p.inflowQty),
          legacyImportQty: fixed2(p.legacyImportQty),
          saleQty: fixed2(p.saleQty),
          returnQty: fixed2(p.returnQty),
          outflowQty: fixed2(p.outflowQty),
          endStockQty: fixed2(p.endStockQty)
        }))
      ],
      columns: [
        col(t(`${SN}.colMonth`), 'month'),
        col(t(`${STOCK}.seriesInflow`), 'inflowQty'),
        col(t(`${STOCK}.seriesLegacy`), 'legacyImportQty'),
        col(t(`${SN}.colSaleQty`), 'saleQty'),
        col(t(`${SN}.colReturnQty`), 'returnQty'),
        col(t(`${STOCK}.seriesOutflow`), 'outflowQty'),
        col(t(`${STOCK}.seriesEndStock`), 'endStockQty')
      ]
    }
  ]
}

// ---- ขายและเงิน ----

export function buildSalesSheets(overview, { t, config, metalLabel }) {
  const lead = (firstKey) => buildSnapshotLeadRows(overview, metalLabel, firstKey, t)
  const byKey = Object.fromEntries((overview?.aging || []).map((a) => [a.key, a]))
  const agingRows = AGING_KEYS.filter((key) => byKey[key]).map((key) => ({ label: t(`${SALES}.agingBucket.${key}`), count: count(byKey[key].count), amountThb: money(byKey[key].amountThb) }))
  const topRows = buildTopCustomerRows(overview?.topCustomers).map((row) => ({ customerName: row.customerName, count: count(row.count), outstandingThb: money(row.outstandingThb), overdueThb: money(row.overdueThb) }))

  return [
    { sheetName: t(`${SN}.salesFindings`), data: [...lead('kind'), ...buildSnapshotFindingsRows(overview, config, t)], columns: findingColumns(t) },
    {
      sheetName: t(`${SN}.salesAging`),
      data: [...lead('label'), ...agingRows],
      columns: [col(t(`${SN}.colAgingBucket`), 'label'), col(t(`${SALES}.colBills`), 'count'), col(t(`${SALES}.colOutstanding`), 'amountThb')]
    },
    {
      sheetName: t(`${SN}.salesTopCustomers`),
      data: [...lead('customerName'), ...topRows],
      columns: [col(t(`${SALES}.colCustomer`), 'customerName'), col(t(`${SALES}.colBills`), 'count'), col(t(`${SALES}.colOutstanding`), 'outstandingThb'), col(t(`${SALES}.colOverdue`), 'overdueThb')]
    },
    {
      sheetName: t(`${SN}.salesSeries`),
      data: [...lead('month'), ...(overview?.series || []).map((p) => ({ month: monthLabel(p.month), invoiceCount: count(p.invoiceCount), grandTotalThb: money(p.grandTotalThb) }))],
      columns: [col(t(`${SN}.colMonth`), 'month'), col(t(`${SALES}.seriesBills`), 'invoiceCount'), col(t(`${SALES}.seriesSales`), 'grandTotalThb')]
    }
  ]
}

// ---- คลังวัตถุดิบ (ทอง g) ----

export function buildMaterialSheets(overview, { t, config, kindLabel }) {
  const lead = (firstKey) => buildSnapshotLeadRows(overview, kindLabel, firstKey, t)
  const itemRows = buildItemRows(overview?.items, 'all', t).map((row) => ({
    code: row.code,
    size: row.sizeName || row.sizeCode || '',
    onHand: fixed2(row.onHand),
    avgMonthlyUsage: fixed2(row.avgMonthlyUsage),
    coverDays: row.coverDays != null ? Number(Number(row.coverDays).toFixed(1)) : '',
    autoMin: fixed2(row.autoMin),
    effectiveMin: fixed2(row.effectiveMin),
    minSource: row.minSourceText,
    status: row.statusText,
    lastMove: row.neverConsumed || !row.lastMovementDate ? t(`${MATERIAL}.neverMoved`) : formatDate(row.lastMovementDate)
  }))

  return [
    { sheetName: t(`${SN}.materialFindings`), data: [...lead('kind'), ...buildSnapshotFindingsRows(overview, config, t)], columns: findingColumns(t) },
    {
      sheetName: t(`${SN}.materialItems`),
      data: [...lead('code'), ...itemRows],
      columns: [
        col(t(`${SN}.colMaterialCode`), 'code'),
        col(t(`${MATERIAL}.colSize`), 'size'),
        col(t(`${MATERIAL}.colOnHand`), 'onHand'),
        col(t(`${MATERIAL}.colAvgMonthly`), 'avgMonthlyUsage'),
        col(t(`${MATERIAL}.colCoverDays`), 'coverDays'),
        col(t(`${MATERIAL}.colAutoMin`), 'autoMin'),
        col(t(`${MATERIAL}.colEffectiveMin`), 'effectiveMin'),
        col(t(`${SN}.colMinSource`), 'minSource'),
        col(t(`${MATERIAL}.colStatus`), 'status'),
        col(t(`${MATERIAL}.colLastMove`), 'lastMove')
      ]
    },
    {
      sheetName: t(`${SN}.materialSeries`),
      data: [
        ...lead('month'),
        ...(overview?.series || []).map((p) => ({ month: monthLabel(p.month), inflow: fixed2(p.inflow), consumed: fixed2(p.consumed), returned: fixed2(p.returned), other: fixed2(p.other), endStock: fixed2(p.endStock) }))
      ],
      columns: [
        col(t(`${SN}.colMonth`), 'month'),
        col(t(`${MATERIAL}.seriesInflow`), 'inflow'),
        col(t(`${MATERIAL}.seriesConsumed`), 'consumed'),
        col(t(`${MATERIAL}.seriesReturned`), 'returned'),
        col(t(`${MATERIAL}.seriesOther`), 'other'),
        col(t(`${MATERIAL}.seriesEndStock`), 'endStock')
      ]
    }
  ]
}

// รวมทั้ง 3 หมวด: ข้อมูลที่ยังไม่มี (null/undefined) ข้ามหมวดนั้น — ลำดับ sheet: คลังสินค้า → ขายและเงิน → คลังวัตถุดิบ
export function buildSnapshotInsightSheets(data, ctx) {
  const sheets = []
  if (data?.stock) sheets.push(...buildStockSheets(data.stock, { t: ctx.t, config: ctx.stockConfig, metal: ctx.metal, metalLabel: ctx.metalLabel }))
  if (data?.sales) sheets.push(...buildSalesSheets(data.sales, { t: ctx.t, config: ctx.salesConfig, metalLabel: ctx.metalLabel }))
  if (data?.material) sheets.push(...buildMaterialSheets(data.material, { t: ctx.t, config: ctx.materialConfig, kindLabel: ctx.materialKindLabel }))
  return sheets
}
