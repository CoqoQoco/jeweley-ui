// stock.config.js — config ของแท็บ "คลังสินค้า" (executive) สำหรับ InsightPage — endpoint StockInsight/Overview (ยิงครั้งเดียว ป้อน findings/KPI/ทุกแท็บ)
// โหมดแท็บ (opt-in): ⚠ ปัญหา / ◔ คาดการณ์ / ✓ วิธีแก้ + 6 แท็บข้อมูล แท็บละ 1-2 block · ข้อมูลเป็น snapshot ไม่มีช่วงเวลา (series ย้อนหลังคงที่ 12 เดือน)
// metal ถูกเติมโดย store (metal-scope) ทุก request · ctx.filter.metal ใช้เฉพาะตัดสินว่าจะโชว์ "จำนวนตามหน่วย" (รวมทุกโลหะ = หน่วยต่างกัน → "—")
// ข้อความ rules อยู่ที่ view.productionInsight.stockInsight.rules (ผ่าน config.i18nPrefix)
import { markRaw } from 'vue'

import * as col from '@/components/insight/page/columns.js'
import {
  STOCK_INSIGHT_ENDPOINT,
  CATEGORY_CHART_LIMIT,
  buildOverviewParams,
  remapStockFindings,
  toneByThreshold,
  buildAgeRows,
  buildReceiptRows,
  buildCategoryRows,
  buildTrendHint,
  buildMonthLabels
} from './stock-helpers.js'
import StockCostLinks from './stock-cost-links.vue'

const S = 'view.productionInsight.stockInsight'

const overviewOf = (ctx) => ctx.data.Overview || {}
const kpiOf = (ctx) => overviewOf(ctx).kpi || {}
const metalOf = (ctx) => ctx.filter?.metal || 'ALL'
const money = (row, t, raw) => (raw === null || raw === undefined ? '—' : `฿${new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 }).format(raw)}`)
const qtyColumn = () => col.number('qtyShown', `${S}.colQty`, 'count', { tip: `${S}.colQtyTip`, minWidth: '110px' })

const ageColumns = [
  col.text('label', `${S}.colAge`, { minWidth: '140px', strong: true }),
  col.days('count', `${S}.colCount`),
  col.days('noCostCount', `${S}.colNoCost`),
  col.number('costThb', `${S}.colCostThb`, 'count', { display: money, minWidth: '130px' }),
  qtyColumn()
]

const receiptColumns = [
  col.text('label', `${S}.colReceiptType`, { minWidth: '160px', strong: true }),
  col.days('count', `${S}.colCount`),
  col.days('noCostCount', `${S}.colNoCost`),
  col.number('costThb', `${S}.colCostThb`, 'count', { display: money, minWidth: '130px' }),
  qtyColumn()
]

const costReceiptColumns = [
  col.text('label', `${S}.colReceiptType`, { minWidth: '160px', strong: true }),
  col.days('count', `${S}.colCount`),
  col.days('noCostCount', `${S}.colNoCost`),
  col.percent('noCostPercent', `${S}.colNoCostPercent`, { digits: 1 }),
  col.number('costThb', `${S}.colCostThb`, 'count', { display: money, minWidth: '130px' })
]

const categoryColumns = [
  col.text('label', `${S}.colCategory`, { minWidth: '160px', strong: true }),
  col.days('count', `${S}.colCount`),
  col.days('noCostCount', `${S}.colNoCost`),
  col.days('agedOver1yCount', `${S}.colAged1y`),
  col.number('costThb', `${S}.colCostThb`, 'count', { display: money, minWidth: '130px' }),
  qtyColumn()
]

export const stockConfig = markRaw({
  titleKey: `${S}.title`,
  i18nPrefix: `${S}.rules`,
  findings: { source: 'Overview' },
  filterFindings: remapStockFindings,

  tabs: [
    { key: 'overview', label: `${S}.tabs.overview` },
    { key: 'trend', label: `${S}.tabs.trend` },
    { key: 'age', label: `${S}.tabs.age` },
    { key: 'cost', label: `${S}.tabs.cost` },
    { key: 'receipt', label: `${S}.tabs.receipt` },
    { key: 'category', label: `${S}.tabs.category` }
  ],

  sources: {
    Overview: { endpoint: STOCK_INSIGHT_ENDPOINT, params: () => buildOverviewParams() }
  },

  blocks: [
    {
      type: 'kpi',
      id: 'stkKpi',
      tab: 'overview',
      source: 'Overview',
      title: `${S}.kpiGroupTitle`,
      icon: 'bi-speedometer2',
      gridColumns: 4,
      asOf: (ctx) => overviewOf(ctx).asOf,
      cards: [
        {
          id: 'inStock',
          icon: 'bi-box-seam',
          label: `${S}.kpi.inStock`,
          value: (ctx) => kpiOf(ctx).inStockCount,
          sub: (ctx, t) => (kpiOf(ctx).inStockQty == null ? '' : t(`${S}.kpi.inStockSub`, { qty: new Intl.NumberFormat('th-TH').format(kpiOf(ctx).inStockQty) })),
          reportRef: 'stkCategory'
        },
        {
          id: 'noCost',
          icon: 'bi-cash-coin',
          label: `${S}.kpi.noCost`,
          value: (ctx) => kpiOf(ctx).noCostPercent,
          format: 'percent',
          sub: (ctx, t) => t(`${S}.kpi.noCostSub`, { count: new Intl.NumberFormat('th-TH').format(kpiOf(ctx).noCostCount || 0) }),
          tone: (ctx) => toneByThreshold(kpiOf(ctx).noCostPercent, overviewOf(ctx).thresholds?.noCostWarnPercent),
          reportRef: 'stkCost'
        },
        {
          id: 'cost',
          icon: 'bi-currency-exchange',
          label: `${S}.kpi.cost`,
          value: (ctx) => kpiOf(ctx).costThb,
          format: 'money0',
          sub: (ctx, t) => t(`${S}.kpi.costSub`),
          reportRef: 'stkCost'
        },
        {
          id: 'aged',
          icon: 'bi-hourglass-bottom',
          label: `${S}.kpi.aged`,
          value: (ctx) => kpiOf(ctx).agedOver1yPercent,
          format: 'percent',
          sub: (ctx, t) =>
            t(`${S}.kpi.agedSub`, { count: new Intl.NumberFormat('th-TH').format(kpiOf(ctx).agedOver1yCount || 0), percent5: new Intl.NumberFormat('th-TH', { maximumFractionDigits: 1 }).format(kpiOf(ctx).agedOver5yPercent || 0) }),
          tone: (ctx) => toneByThreshold(kpiOf(ctx).agedOver5yPercent, overviewOf(ctx).thresholds?.aged5yWarnPercent),
          reportRef: 'stkAge'
        }
      ]
    },

    {
      type: 'donut',
      id: 'stkCostShare',
      tab: 'overview',
      source: 'Overview',
      title: `${S}.costDonutTitle`,
      icon: 'bi-pie-chart',
      height: 280,
      center: { label: `${S}.centerTotal` },
      slices: (ctx) => [
        { label: `${S}.sliceWithCost`, value: Math.max((kpiOf(ctx).inStockCount || 0) - (kpiOf(ctx).noCostCount || 0), 0), color: 'token:green' },
        { label: `${S}.sliceNoCost`, value: kpiOf(ctx).noCostCount || 0, color: 'token:warning' }
      ]
    },

    {
      type: 'trend',
      id: 'stkTrend',
      tab: 'trend',
      source: 'Overview',
      title: `${S}.trendTitle`,
      icon: 'bi-graph-up-arrow',
      height: 340,
      columnWidth: '60%',
      axisTitles: [`${S}.axisFlow`, `${S}.axisStock`],
      points: (ctx) => overviewOf(ctx).series || [],
      categories: (points) => buildMonthLabels(points),
      series: [
        { field: 'inflowQty', type: 'bar', label: `${S}.seriesInflow`, color: 'green', axis: 0, format: 'count' },
        { field: 'legacyImportQty', type: 'bar', label: `${S}.seriesLegacy`, color: 'sub', axis: 0, format: 'count' },
        { field: 'outflowQty', type: 'bar', label: `${S}.seriesOutflow`, color: 'warning', axis: 0, format: 'count' },
        { field: 'endStockQty', type: 'line', label: `${S}.seriesEndStock`, color: 'primary', axis: 1, format: 'count' }
      ],
      hint: (ctx, t) => buildTrendHint(overviewOf(ctx).salesHistory, t)
    },

    {
      type: 'bar',
      id: 'stkAge',
      tab: 'age',
      source: 'Overview',
      title: `${S}.ageChartTitle`,
      icon: 'bi-bar-chart',
      stacked: true,
      height: 300,
      dataLabels: true,
      rows: (ctx) => buildAgeRows(overviewOf(ctx).ageBuckets, (key, params) => ctx.t(key, params), metalOf(ctx)),
      category: (row) => row.label,
      series: [
        { label: `${S}.seriesWithCost`, value: (row) => row.withCostCount, color: 'token:green' },
        { label: `${S}.seriesNoCost`, value: (row) => row.noCostCount, color: 'token:warning' }
      ]
    },

    {
      type: 'table',
      id: 'stkAgeTable',
      tab: 'age',
      source: 'Overview',
      title: `${S}.ageTableTitle`,
      icon: 'bi-table',
      sections: [{ rows: (ctx) => buildAgeRows(overviewOf(ctx).ageBuckets, (key, params) => ctx.t(key, params), metalOf(ctx)), columns: ageColumns, dataKey: 'key' }]
    },

    {
      type: 'bar',
      id: 'stkCost',
      tab: 'cost',
      source: 'Overview',
      title: `${S}.costChartTitle`,
      icon: 'bi-cash-coin',
      height: 280,
      dataLabels: true,
      valueFormat: 'percent',
      rows: (ctx) => buildAgeRows(overviewOf(ctx).ageBuckets, (key, params) => ctx.t(key, params), metalOf(ctx)),
      category: (row) => row.label,
      series: [{ label: `${S}.colNoCostPercent`, value: (row) => row.noCostPercent ?? 0, color: 'token:warning' }]
    },

    {
      type: 'table',
      id: 'stkCostReceipt',
      tab: 'cost',
      source: 'Overview',
      title: `${S}.costReceiptTitle`,
      icon: 'bi-table',
      sections: [{ rows: (ctx) => buildReceiptRows(overviewOf(ctx).receiptTypes, (key, params) => ctx.t(key, params), metalOf(ctx)), columns: costReceiptColumns, dataKey: 'key' }]
    },

    { type: 'slot', id: 'stkCostLinks', tab: 'cost', component: markRaw(StockCostLinks) },

    {
      type: 'donut',
      id: 'stkReceiptShare',
      tab: 'receipt',
      source: 'Overview',
      title: `${S}.receiptChartTitle`,
      icon: 'bi-pie-chart',
      height: 280,
      center: { label: `${S}.centerTotal` },
      slices: (ctx) => buildReceiptRows(overviewOf(ctx).receiptTypes, (key, params) => ctx.t(key, params), metalOf(ctx)).map((row) => ({ label: row.label, value: row.count }))
    },

    {
      type: 'table',
      id: 'stkReceipt',
      tab: 'receipt',
      source: 'Overview',
      title: `${S}.receiptTitle`,
      icon: 'bi-table',
      sections: [{ rows: (ctx) => buildReceiptRows(overviewOf(ctx).receiptTypes, (key, params) => ctx.t(key, params), metalOf(ctx)), columns: receiptColumns, dataKey: 'key' }]
    },

    {
      type: 'bar',
      id: 'stkCategory',
      tab: 'category',
      source: 'Overview',
      title: `${S}.categoryChartTitle`,
      icon: 'bi-bar-chart',
      horizontal: true,
      dataLabels: true,
      rows: (ctx) => buildCategoryRows(overviewOf(ctx).categories, (key, params) => ctx.t(key, params), metalOf(ctx)).slice(0, CATEGORY_CHART_LIMIT),
      category: (row) => row.label,
      series: [{ label: `${S}.seriesCount`, value: (row) => row.count, color: 'token:green' }]
    },

    {
      type: 'table',
      id: 'stkCategoryTable',
      tab: 'category',
      source: 'Overview',
      title: `${S}.categoryTableTitle`,
      icon: 'bi-table',
      sections: [{ rows: (ctx) => buildCategoryRows(overviewOf(ctx).categories, (key, params) => ctx.t(key, params), metalOf(ctx)), columns: categoryColumns, dataKey: 'key' }]
    }
  ]
})

export default stockConfig
