import { describe, it, expect } from 'vitest'
import { createI18n } from 'vue-i18n'

import productionInsightTh from '@/language/view/production-insight/th.js'
import productionInsightEn from '@/language/view/production-insight/en.js'
import executiveTh from '@/language/view/executive/th.js'
import executiveEn from '@/language/view/executive/en.js'
import { stockConfig } from './stock/stock.config.js'
import { salesConfig } from './sales/sales.config.js'
import { materialGoldConfig } from './material/material.config.js'
import { renderSnapshotText, buildSnapshotFindingsRows, buildStockSheets, buildSalesSheets, buildMaterialSheets, buildSnapshotInsightSheets } from './executive-insight-excel-stock-sales-material.js'

const makeT = (locale, pi, ex) => createI18n({ legacy: false, locale, messages: { [locale]: { view: { productionInsight: pi, executive: ex } } } }).global.t
const th = makeT('th', productionInsightTh, executiveTh)
const en = makeT('en', productionInsightEn, executiveEn)

const stock = {
  asOf: '2026-10-22T09:00:00',
  problems: [{ code: 'STK_NO_COST_HIGH', severity: 'critical', params: { noCostCount: 23915, inStockCount: 29286, percent: 81.66 }, reportRef: 'stkCost' }],
  forecasts: [{ code: 'FC_STK_COVER_MONTHS', severity: 'warning', params: { coverMonths: null, avgMonthlyOutflow: 0, endStockQty: 29286, direction: 'high', historyMonths: 4, windowMonths: 3 }, reportRef: 'stkTrend' }],
  actions: [{ code: 'ACT_PRICE_NO_COST', ownerRole: 'productionManager', params: { noCostCount: 23915, percent: 81.66 } }],
  ageBuckets: [
    { key: 'gt5y', count: 100, noCostCount: 90, costThb: 1000.5, qty: 120.456 },
    { key: 'lt1y', count: 40, noCostCount: 4, costThb: 2000, qty: 41 }
  ],
  receiptTypes: [{ receiptType: null, count: 10, noCostCount: 10, qty: 10, costThb: 0 }],
  categories: [{ category: 'RING', categoryName: 'แหวน', count: 5, qty: 5, costThb: 10, noCostCount: 1, agedOver1yCount: 2 }],
  series: [{ month: '2026-09-01', inflowQty: 5, legacyImportQty: 0, saleQty: 3, returnQty: 1, outflowQty: 2, endStockQty: 100.126 }]
}

const sales = {
  asOf: '2026-10-22T09:00:00',
  problems: [{ code: 'SAL_NO_DUE_DATE', severity: 'warning', params: { count: 12000, percent: 4 }, reportRef: 'salDue' }],
  forecasts: [{ code: 'FC_SAL_COLLECTION', severity: 'warning', params: { amountThb: 0, count: 0, windowDays: 30 }, reportRef: 'salDue' }],
  actions: [{ code: 'ACT_SET_DUE_DATE', ownerRole: 'saleManager', params: { count: 12000 } }],
  aging: [{ key: 'gt90', count: 2, amountThb: 500 }, { key: 'notDue', count: 8, amountThb: 1234.5 }],
  topCustomers: [{ customerCode: 'C1', customerName: 'บริษัท ก', count: 3, outstandingThb: 1000, overdueThb: 400 }],
  series: [{ month: '2026-09-01', invoiceCount: 120, grandTotalThb: 6000000 }]
}

const material = {
  asOf: '2026-10-22T09:00:00',
  problems: [{ code: 'MAT_ZERO_STOCK', severity: 'critical', params: { count: 1, topItems: ['YG ไซส์ 2'] }, reportRef: 'matItems' }],
  forecasts: [],
  actions: [{ code: 'ACT_REORDER_MATERIAL', ownerRole: 'planner', params: { zeroCount: 1, belowCount: 0, stockoutCount: 0 } }],
  items: [
    { itemKey: 'a', code: 'YG', sizeCode: 'S1', sizeName: 'ไซส์ 1', label: 'YG ไซส์ 1', onHand: 100.456, avgMonthlyUsage: 30, coverDays: 100.04, autoMin: 10, effectiveMin: 20, minSource: 'override', status: 'ok', isDead: false, lastMovementDate: '2026-10-01T00:00:00', daysSinceMove: 21 },
    { itemKey: 'b', code: 'WG', sizeCode: null, label: 'WG', onHand: 0, avgMonthlyUsage: 0, coverDays: null, autoMin: 0, effectiveMin: 5, minSource: 'floor', status: 'zero', isDead: false, neverConsumed: true, lastMovementDate: null }
  ],
  series: [{ month: '2026-09-01', inflow: 50, consumed: 30, returned: 2, other: 0, endStock: 320.5 }]
}

describe('renderSnapshotText', () => {
  it('uses the tab rule namespace and formats counts and money like the on-screen findings', () => {
    expect(renderSnapshotText(th, stockConfig.i18nPrefix, 'STK_NO_COST_HIGH', stock.problems[0].params)).toContain('23,915 จาก 29,286')
    expect(renderSnapshotText(th, salesConfig.i18nPrefix, 'SAL_NO_DUE_DATE', sales.problems[0].params)).toContain('12,000')
  })
})

describe('buildSnapshotFindingsRows', () => {
  it('puts problems, forecasts and actions in one list with kind / severity / owner; the stock cover forecast uses the remapped (null cover) text', () => {
    const rows = buildSnapshotFindingsRows(stock, stockConfig, th)
    expect(rows.map((r) => r.kind)).toEqual(['ปัญหา', 'คาดการณ์', 'วิธีแก้'])
    expect(rows[0].severity).toBe('วิกฤต')
    expect(rows[1].text).toBe(th('view.productionInsight.stockInsight.rules.FC_STK_COVER_NONE', { endStockQty: '29,286', windowMonths: 3, historyMonths: 4, avgMonthlyOutflow: 0 }))
    expect(rows[1].text).toContain('ข้อมูลขาย 4 เดือน')
    expect(rows[2].owner).toBe('ผู้จัดการฝ่ายผลิต')
    expect(rows[2].severity).toBe('')
  })

  it('sales: a warning collection forecast uses the "nothing due" text and the sale manager owner label', () => {
    const rows = buildSnapshotFindingsRows(sales, salesConfig, th)
    expect(rows[1].text).toBe(th('view.productionInsight.salesInsight.rules.FC_SAL_COLLECTION_NONE', { windowDays: 30 }))
    expect(rows[2].owner).toBe('ผู้จัดการฝ่ายขาย')
  })

  it('material has no remap; topItems is joined; works in English too; empty input gives no rows', () => {
    const rows = buildSnapshotFindingsRows(material, materialGoldConfig, en)
    expect(rows[0].text).toContain('YG ไซส์ 2')
    expect(rows[0].kind).toBe('Problem')
    expect(buildSnapshotFindingsRows(undefined, stockConfig, th)).toEqual([])
  })
})

describe('stock sheets', () => {
  it('has five sheets in order; money 2 decimals, quantities 2 decimals; qty column only for a single metal', () => {
    const sheets = buildStockSheets(stock, { t: th, config: stockConfig, metal: 'GOLD', metalLabel: 'ทอง' })
    expect(sheets.map((s) => s.sheetName)).toEqual(['คลังสินค้า-สรุปปัญหา', 'คลังสินค้า-อายุสต็อก', 'คลังสินค้า-ประเภทรับ', 'คลังสินค้า-หมวดสินค้า', 'คลังสินค้า-รายเดือน'])
    sheets.forEach((s) => expect(s.sheetName.length).toBeLessThanOrEqual(31))
    const age = sheets[1]
    expect(age.data[0].label).toContain('ทอง')
    const first = age.data.find((r) => r.label === 'น้อยกว่า 1 ปี')
    expect(first).toMatchObject({ count: 40, noCostCount: 4, costThb: '2,000.00', qty: '41.00', noCostPercent: '10.00' })
    expect(age.columns.map((c) => c.key)).toEqual(['label', 'count', 'noCostCount', 'costThb', 'noCostPercent', 'qty'])
    expect(sheets[2].data.find((r) => r.label === '-')).toBeTruthy()
    expect(sheets[4].data.find((r) => r.month && r.month.startsWith('ก.ย.'))).toMatchObject({ month: 'ก.ย. 2026', endStockQty: '100.13' })
    const all = buildStockSheets(stock, { t: th, config: stockConfig, metal: 'ALL', metalLabel: 'รวม' })
    expect(all[1].columns.map((c) => c.key)).not.toContain('qty')
  })

  it('every header is a translated string (no raw keys) in both languages', () => {
    ;[th, en].forEach((t) => {
      const sheets = buildStockSheets(stock, { t, config: stockConfig, metal: 'GOLD', metalLabel: 'x' })
      sheets.forEach((s) => s.columns.forEach((c) => expect(c.header, `${s.sheetName}.${c.key}`).not.toMatch(/^view\./)))
    })
  })
})

describe('sales sheets', () => {
  it('four sheets: findings, aging in bucket order, top customers, monthly series with money formatted', () => {
    const sheets = buildSalesSheets(sales, { t: th, config: salesConfig, metalLabel: 'ทอง' })
    expect(sheets.map((s) => s.sheetName)).toEqual(['ขายและเงิน-สรุปปัญหา', 'ขายและเงิน-อายุหนี้', 'ขายและเงิน-ลูกค้าค้างสูง', 'ขายและเงิน-รายเดือน'])
    const aging = sheets[1].data.filter((r) => r.count !== undefined)
    expect(aging.map((r) => r.amountThb)).toEqual(['1,234.50', '500.00'])
    expect(sheets[2].data.find((r) => r.customerName === 'บริษัท ก')).toMatchObject({ count: 3, outstandingThb: '1,000.00', overdueThb: '400.00' })
    expect(sheets[3].data.find((r) => r.month && r.month.startsWith('ก.ย.'))).toMatchObject({ month: 'ก.ย. 2026', invoiceCount: 120, grandTotalThb: '6,000,000.00' })
    sheets.forEach((s) => s.columns.forEach((c) => expect(c.header).not.toMatch(/^view\./)))
  })
})

describe('material sheets', () => {
  it('items sheet carries code, size, weights (2 decimals), cover days, min + source, status and last movement; never-issued items say so', () => {
    const sheets = buildMaterialSheets(material, { t: th, config: materialGoldConfig, kindLabel: 'ทอง/โลหะ' })
    expect(sheets.map((s) => s.sheetName)).toEqual(['วัตถุดิบ-สรุปปัญหา', 'วัตถุดิบ-รายการ', 'วัตถุดิบ-รายเดือน'])
    const items = sheets[1].data.filter((r) => r.code && r.code !== undefined && r.status)
    expect(items.map((r) => r.code)).toEqual(['WG', 'YG'])
    const yg = items.find((r) => r.code === 'YG')
    expect(yg).toMatchObject({ size: 'ไซส์ 1', onHand: '100.46', avgMonthlyUsage: '30.00', coverDays: 100, autoMin: '10.00', effectiveMin: '20.00', minSource: 'ตั้งเอง', status: 'ปกติ' })
    expect(yg.lastMove).toMatch(/\d/)
    expect(items.find((r) => r.code === 'WG')).toMatchObject({ coverDays: '', minSource: 'ค่าพื้น', status: 'หมด', lastMove: 'ไม่เคยเบิก' })
    expect(sheets[2].data.find((r) => r.month && r.month.startsWith('ก.ย.'))).toMatchObject({ month: 'ก.ย. 2026', consumed: '30.00', endStock: '320.50' })
    sheets.forEach((s) => s.columns.forEach((c) => expect(c.header).not.toMatch(/^view\./)))
  })
})

describe('buildSnapshotInsightSheets', () => {
  const ctx = { t: th, metal: 'GOLD', metalLabel: 'ทอง', stockConfig, salesConfig, materialConfig: materialGoldConfig, materialKindLabel: 'ทอง/โลหะ' }

  it('concatenates stock, sales, material (12 sheets, unique names) and skips a category whose data is missing', () => {
    const sheets = buildSnapshotInsightSheets({ stock, sales, material }, ctx)
    expect(sheets).toHaveLength(12)
    expect(new Set(sheets.map((s) => s.sheetName)).size).toBe(12)
    expect(buildSnapshotInsightSheets({ stock, sales: null, material: undefined }, ctx)).toHaveLength(5)
    expect(buildSnapshotInsightSheets(undefined, ctx)).toEqual([])
  })
})
