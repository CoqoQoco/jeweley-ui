// executive-insight-excel-stock-sales-material.js — pure row builders ของ sheet "คลังสินค้า / ขายและเงิน / คลังวัตถุดิบ" ที่เพิ่มใน "Excel ทั้งหมด" ของหน้า /executive
// ข้อมูลมาจาก StockInsight/Overview, SalesInsight/Overview, MaterialInsight/Overview (snapshot ไม่มีช่วงเวลา · series ย้อนหลัง 12 เดือน)
// ข้อความ finding/action ผ่าน i18n ชุดเดียวกับแท็บ (config.i18nPrefix + config.filterFindings เช่น remap FC_STK_COVER_* / FC_SAL_COLLECTION_NONE) — ไม่เขียนซ้ำ
// ห้าม import Vue/Pinia/i18n: ทุกฟังก์ชันรับ `t` มาจาก caller · ตัวเลขตามธรรมเนียม sheet เดิม: น้ำหนัก/ปริมาณ = toFixed(2), เงิน = formatMoneyFull, จำนวนนับ = number, null = ''
import { formatDate } from '@/services/utils/dayjs.js'
import { resolveFindingParams, formatThaiMonthYear, formatQtyList } from '@/components/insight/insight-helpers.js'
import { buildAgeRows, buildReceiptRows, buildCategoryRows } from './stock/stock-helpers.js'
import { AGING_KEYS, buildTopCustomerRows } from './sales/sales-helpers.js'
import { buildItemRows, qtyUnitLabelKey } from './material/material-helpers.js'
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
    (metal) => t(`view.productionInsight.gold.metalLabel.${metal}`),
    undefined,
    undefined,
    (entries) => formatQtyList(entries, (key) => t(key))
  )
  return t(`${prefix}.${code}`, resolved)
}

// problems / forecasts / actions ของ 1 หมวดในแผ่นเดียว (คอลัมน์ ประเภท/ระดับ/ข้อความ/ผู้รับผิดชอบ) — config.filterFindings (ถ้ามี) ทำงานก่อนแปลข้อความ เหมือนบนจอ
export function buildSnapshotFindingsRows(overview, config, t) {
  const pick = (items) => (config.filterFindings ? config.filterFindings(items || [], undefined, undefined, overview) : items || [])
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

export function buildStockSheets(overview, { t, config, metalLabel }) {
  const lead = (firstKey) => buildSnapshotLeadRows(overview, metalLabel, firstKey, t)
  const ageRows = buildAgeRows(overview?.ageBuckets, t)
  const receiptRows = buildReceiptRows(overview?.receiptTypes, t)
  const categoryRows = buildCategoryRows(overview?.categories, t)

  const costColumns = [col(t(`${STOCK}.colCount`), 'count'), col(t(`${STOCK}.colNoCost`), 'noCostCount'), col(t(`${STOCK}.colCostThb`), 'costThb')]
  const mapCost = (row) => ({ count: count(row.count), noCostCount: count(row.noCostCount), costThb: money(row.costThb) })

  return [
    { sheetName: t(`${SN}.stockFindings`), data: [...lead('kind'), ...buildSnapshotFindingsRows(overview, config, t)], columns: findingColumns(t) },
    {
      sheetName: t(`${SN}.stockAge`),
      data: [...lead('label'), ...ageRows.map((row) => ({ label: row.label, ...mapCost(row), noCostPercent: percent(row.noCostPercent) }))],
      columns: [col(t(`${STOCK}.colAge`), 'label'), ...costColumns, col(t(`${STOCK}.colNoCostPercent`), 'noCostPercent')]
    },
    {
      sheetName: t(`${SN}.stockReceipt`),
      data: [...lead('label'), ...receiptRows.map((row) => ({ label: row.label, ...mapCost(row), noCostPercent: percent(row.noCostPercent) }))],
      columns: [col(t(`${STOCK}.colReceiptType`), 'label'), ...costColumns, col(t(`${STOCK}.colNoCostPercent`), 'noCostPercent')]
    },
    {
      sheetName: t(`${SN}.stockCategory`),
      data: [...lead('label'), ...categoryRows.map((row) => ({ label: row.label, ...mapCost(row), agedOver1yCount: count(row.agedOver1yCount) }))],
      columns: [col(t(`${STOCK}.colCategory`), 'label'), ...costColumns, col(t(`${STOCK}.colAged1y`), 'agedOver1yCount')]
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

// ---- คลังวัตถุดิบ (พลอย: หลายหน่วย เม็ด/กะรัต + มูลค่า THB) ----

const qtyCell = (value, unit) => (value != null ? (unit === 'pcs' ? String(Math.round(Number(value))) : Number(value).toFixed(2)) : '')

export function buildMaterialGemSheets(overview, { t, config, kindLabel }) {
  const lead = (firstKey) => buildSnapshotLeadRows(overview, kindLabel, firstKey, t)
  const unitLabel = (unit) => t(qtyUnitLabelKey(unit))
  const itemRows = buildItemRows(overview?.items, 'all', t).map((row) => ({
    code: row.code,
    type: row.groupName || '',
    unit: unitLabel(row.unit),
    onHand: qtyCell(row.onHand, row.unit),
    onProcess: qtyCell(row.onProcess, row.unit),
    value: money(row.value),
    avgMonthlyUsage: qtyCell(row.avgMonthlyUsage, row.unit),
    coverDays: row.coverDays != null ? Number(Number(row.coverDays).toFixed(1)) : '',
    autoMin: qtyCell(row.autoMin, row.unit),
    effectiveMin: qtyCell(row.effectiveMin, row.unit),
    minSource: row.minSourceText,
    status: row.statusText,
    lastMove: row.neverConsumed || !row.lastMovementDate ? t(`${MATERIAL}.neverMoved`) : formatDate(row.lastMovementDate)
  }))
  const seriesRows = (overview?.seriesByUnit || []).flatMap((entry) =>
    (entry.points || []).map((p) => ({
      unit: unitLabel(entry.unit),
      month: monthLabel(p.month),
      inflow: qtyCell(p.inflow, entry.unit),
      consumed: qtyCell(p.consumed, entry.unit),
      returned: qtyCell(p.returned, entry.unit),
      other: qtyCell(p.other, entry.unit),
      endStock: qtyCell(p.endStock, entry.unit)
    }))
  )
  const valueRows = (overview?.valueSeries || []).map((p) => ({ month: monthLabel(p.month), inflowValue: money(p.inflowValue), consumedValue: money(p.consumedValue), returnedValue: money(p.returnedValue), endStockValue: money(p.endStockValue) }))

  return [
    { sheetName: t(`${SN}.materialGemFindings`), data: [...lead('kind'), ...buildSnapshotFindingsRows(overview, config, t)], columns: findingColumns(t) },
    {
      sheetName: t(`${SN}.materialGemItems`),
      data: [...lead('code'), ...itemRows],
      columns: [
        col(t(`${SN}.colMaterialCode`), 'code'),
        col(t(`${MATERIAL}.gem.colType`), 'type'),
        col(t(`${SN}.colUnit`), 'unit'),
        col(t(`${MATERIAL}.gem.colOnHand`), 'onHand'),
        col(t(`${MATERIAL}.gem.colOnProcess`), 'onProcess'),
        col(t(`${MATERIAL}.gem.colValue`), 'value'),
        col(t(`${MATERIAL}.gem.colAvgMonthly`), 'avgMonthlyUsage'),
        col(t(`${MATERIAL}.colCoverDays`), 'coverDays'),
        col(t(`${MATERIAL}.gem.colAutoMin`), 'autoMin'),
        col(t(`${MATERIAL}.gem.colEffectiveMin`), 'effectiveMin'),
        col(t(`${SN}.colMinSource`), 'minSource'),
        col(t(`${MATERIAL}.colStatus`), 'status'),
        col(t(`${MATERIAL}.colLastMove`), 'lastMove')
      ]
    },
    {
      sheetName: t(`${SN}.materialGemSeries`),
      data: [...lead('unit'), ...seriesRows],
      columns: [
        col(t(`${SN}.colUnit`), 'unit'),
        col(t(`${SN}.colMonth`), 'month'),
        col(t(`${MATERIAL}.seriesInflow`), 'inflow'),
        col(t(`${MATERIAL}.seriesConsumed`), 'consumed'),
        col(t(`${MATERIAL}.seriesReturned`), 'returned'),
        col(t(`${MATERIAL}.seriesOther`), 'other'),
        col(t(`${MATERIAL}.seriesEndStock`), 'endStock')
      ]
    },
    {
      sheetName: t(`${SN}.materialGemValue`),
      data: [...lead('month'), ...valueRows],
      columns: [
        col(t(`${SN}.colMonth`), 'month'),
        col(t(`${MATERIAL}.seriesInflow`), 'inflowValue'),
        col(t(`${MATERIAL}.seriesConsumed`), 'consumedValue'),
        col(t(`${MATERIAL}.seriesReturned`), 'returnedValue'),
        col(t(`${MATERIAL}.seriesEndStock`), 'endStockValue')
      ]
    }
  ]
}

// รวมทั้ง 3 หมวด (วัตถุดิบมีทอง + พลอยแยกกัน): ข้อมูลที่ยังไม่มี (null/undefined) ข้ามหมวดนั้น — ลำดับ sheet: คลังสินค้า → ขายและเงิน → คลังวัตถุดิบ
export function buildSnapshotInsightSheets(data, ctx) {
  const sheets = []
  if (data?.stock) sheets.push(...buildStockSheets(data.stock, { t: ctx.t, config: ctx.stockConfig, metalLabel: ctx.metalLabel }))
  if (data?.sales) sheets.push(...buildSalesSheets(data.sales, { t: ctx.t, config: ctx.salesConfig, metalLabel: ctx.metalLabel }))
  if (data?.material) sheets.push(...buildMaterialSheets(data.material, { t: ctx.t, config: ctx.materialConfig, kindLabel: ctx.materialKindLabel }))
  if (data?.materialGem) sheets.push(...buildMaterialGemSheets(data.materialGem, { t: ctx.t, config: ctx.materialGemConfig, kindLabel: ctx.materialGemKindLabel }))
  return sheets
}
