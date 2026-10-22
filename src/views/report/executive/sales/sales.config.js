// sales.config.js — config ของแท็บ "ขายและเงิน" (executive) สำหรับ InsightPage — SalesInsight/Overview ยิงครั้งเดียวป้อน findings/KPI/โดนัท/อายุหนี้/แนวโน้ม
// ตารางบิลที่ต้องตาม + SO ที่ยังไม่ออกบิล ยังใช้ endpoint เดิม (ExecutiveReport/Receivables, SalesOrdersWithoutInvoice) แบบ paged ผ่าน planTable —
// เลือกดูทีละตารางด้วยตัวสลับ (เลยกำหนด → ยังไม่รับเงิน → ไม่มีวันครบกำหนด) ตารางที่ไม่ได้เลือกไม่ mount/ไม่ยิง
// metal ถูกเติมโดย store (metal-scope) · ctx.filter.metal ใช้แสดงสัดส่วนโลหะใต้ยอดบิล · ข้อความ rules อยู่ที่ view.productionInsight.salesInsight.rules (config.i18nPrefix)
import { markRaw } from 'vue'

import * as col from '@/components/insight/page/columns.js'
import ToggleGroupGeneric from '@/components/generic/ToggleGroupGeneric.vue'
import { formatMoneyFull, formatMoneyAbbreviated } from '../executive-helpers.js'
import {
  SALES_INSIGHT_ENDPOINT,
  RECEIVABLES_ENDPOINT,
  SO_WITHOUT_INVOICE_ENDPOINT,
  DUE_FILTERS,
  DEFAULT_DUE_FILTER,
  DUE_FILTER_API_VALUE,
  DUE_FILTER_LABEL_KEY,
  buildOverviewParams,
  remapSalesFindings,
  toneByThreshold,
  resolveSalesReportTarget,
  resolvePaymentSliceFilter,
  buildPaymentSlices,
  sumPaymentCount,
  buildAgingRows,
  buildTopCustomerRows,
  mapInvoiceRows,
  mapSoRows,
  dueFilterCounts,
  buildTrendHint,
  buildMonthLabels
} from './sales-helpers.js'

const S = 'view.productionInsight.salesInsight'
const M = 'view.executive.money'

const overviewOf = (ctx) => ctx.data.Overview || {}
const kpiOf = (ctx) => overviewOf(ctx).kpi || {}
const metalOf = (ctx) => ctx.filter?.metal || 'ALL'
const countText = (value) => new Intl.NumberFormat('th-TH').format(value || 0)
const money = (row, t, raw) => formatMoneyFull(raw)

const openInvoice = (row, ctx) => ctx.navigate({ name: 'invoice-detail', query: { invoiceNumber: row.running } })
const openSalesOrder = (row, ctx) => ctx.navigate({ name: 'sale-order', query: { soNumber: row.soNumber } })

const invoiceColumns = [
  col.text('invoiceNo', `${M}.colInvoiceNumber`, { minWidth: '130px', onClick: openInvoice, actionTitle: `${S}.openInvoiceTitle` }),
  col.text('customerName', `${M}.colCustomerName`, { minWidth: '160px' }),
  col.date('createDate', `${M}.colCreateDate`),
  col.date('dueDate', `${M}.colDueDate`, { nullAs: '-' }),
  col.number('grandTotalThb', `${M}.colGrandTotalThb`, 'count', { display: money, suffix: (row) => row.metalHint, minWidth: '140px' }),
  col.text('outstandingText', `${M}.colOutstanding`, { minWidth: '130px', align: 'right' }),
  col.text('stateText', `${M}.colPaymentState`),
  col.text('salePerson', `${M}.colSalePerson`)
]

const soColumns = [
  col.text('soNumber', `${M}.colSoNumber`, { minWidth: '130px', onClick: openSalesOrder, actionTitle: `${S}.openSoTitle` }),
  col.text('customerName', `${M}.colCustomerName`, { minWidth: '160px' }),
  col.date('soDate', `${M}.colSoDate`),
  col.date('deliveryDate', `${M}.colDeliveryDate`, { nullAs: '-' }),
  col.number('grandTotalThb', `${M}.colGrandTotalThb`, 'count', { display: money, suffix: (row) => row.metalHint, minWidth: '140px' }),
  col.text('overdueText', `${M}.colOverdue`),
  col.text('salePerson', `${M}.colSalePerson`)
]

const topCustomerColumns = [
  col.text('customerName', `${S}.colCustomer`, { minWidth: '180px', strong: true }),
  col.days('count', `${S}.colBills`),
  col.number('outstandingThb', `${S}.colOutstanding`, 'count', { display: money, minWidth: '140px' }),
  col.number('overdueThb', `${S}.colOverdue`, 'count', { display: money, minWidth: '140px' })
]

// ตัวสลับตาราง "บิลที่ต้องตาม" (component เป็น markRaw — config ผ่าน data()/props แล้วถูกห่อ reactive)
const ToggleGroup = markRaw(ToggleGroupGeneric)

const dueSwitch = {
  type: 'slot',
  id: 'salDueSwitch',
  tab: 'due',
  component: ToggleGroup,
  props: (ctx) => {
    const counts = dueFilterCounts(kpiOf(ctx))
    return {
      modelValue: ctx.state.dueFilter,
      ariaLabel: ctx.t(`${S}.tabs.dueSwitchAria`),
      options: DUE_FILTERS.map((value) => ({ value, label: ctx.t(DUE_FILTER_LABEL_KEY[value], { count: countText(counts[value]) }) }))
    }
  },
  events: { 'update:modelValue': (ctx, value) => ctx.setState('dueFilter', value) }
}

// ตารางบิล 1 ตัวต่อ 1 ตัวกรอง — เห็นเฉพาะตัวที่เลือก (visible) · refresh ใน filter เปลี่ยน → ยิงใหม่ด้วย body เดิม (keyParams)
const dueTable = (filterKey, id, titleKey) => ({
  type: 'planTable',
  id,
  tab: 'due',
  title: titleKey,
  icon: filterKey === 'overdue' ? 'bi-exclamation-triangle' : 'bi-receipt',
  accent: filterKey === 'overdue' ? 'warning' : undefined,
  endpoint: RECEIVABLES_ENDPOINT,
  dataKey: 'rowKey',
  reveal: { stateKey: 'dueFilter', value: filterKey },
  visible: (ctx) => ctx.state.dueFilter === filterKey,
  params: () => ({ filter: DUE_FILTER_API_VALUE[filterKey] }),
  keyParams: (f) => ({ filter: DUE_FILTER_API_VALUE[filterKey], refresh: f.refresh }),
  mapRows: (items, ctx, t) => mapInvoiceRows(items, metalOf(ctx), t),
  columns: invoiceColumns
})

export const salesConfig = markRaw({
  titleKey: `${S}.title`,
  i18nPrefix: `${S}.rules`,
  findings: { source: 'Overview' },
  filterFindings: remapSalesFindings,
  // reportRef salDue มี 3 ตาราง → เลือกตามตัวสลับ (ดู sales-helpers) · ref อื่นจับคู่ block id ตามปกติ
  tabFor: (reportRef, params) => resolveSalesReportTarget(reportRef, params),

  tabs: [
    { key: 'overview', label: `${S}.tabs.overview` },
    { key: 'aging', label: `${S}.tabs.aging` },
    { key: 'due', label: `${S}.tabs.due` },
    { key: 'trend', label: `${S}.tabs.trend` },
    { key: 'so', label: `${S}.tabs.so` }
  ],

  sources: {
    Overview: { endpoint: SALES_INSIGHT_ENDPOINT, params: () => buildOverviewParams() }
  },

  state: {
    dueFilter: { initial: DEFAULT_DUE_FILTER }
  },

  blocks: [
    {
      type: 'kpi',
      id: 'salKpi',
      tab: 'overview',
      source: 'Overview',
      title: `${S}.kpiGroupTitle`,
      icon: 'bi-speedometer2',
      gridColumns: 4,
      asOf: (ctx) => overviewOf(ctx).asOf,
      cards: [
        {
          id: 'outstanding',
          icon: 'bi-receipt',
          label: `${S}.kpi.outstanding`,
          value: (ctx) => kpiOf(ctx).outstandingThb,
          format: 'money0',
          sub: (ctx, t) => t(`${S}.kpi.outstandingSub`, { count: countText(kpiOf(ctx).outstandingCount) }),
          reportRef: 'salDue',
          reportParams: { dueFilter: 'unpaid' }
        },
        {
          id: 'overdue',
          icon: 'bi-exclamation-triangle',
          label: `${S}.kpi.overdue`,
          value: (ctx) => kpiOf(ctx).overdueThb,
          format: 'money0',
          sub: (ctx, t) => t(`${S}.kpi.overdueSub`, { count: countText(kpiOf(ctx).overdueCount), percent: new Intl.NumberFormat('th-TH', { maximumFractionDigits: 1 }).format(kpiOf(ctx).overduePercent || 0) }),
          tone: (ctx) => toneByThreshold(kpiOf(ctx).overduePercent, overviewOf(ctx).thresholds?.overdueWarnPercent),
          reportRef: 'salDue',
          reportParams: { dueFilter: 'overdue' }
        },
        {
          id: 'paid',
          icon: 'bi-check2-circle',
          label: `${S}.kpi.paid`,
          value: (ctx) => kpiOf(ctx).paidPercent,
          format: 'percent',
          sub: (ctx, t) => t(`${S}.kpi.paidSub`, { total: formatMoneyAbbreviated(kpiOf(ctx).totalGrandThb) }),
          tone: () => 'green',
          reportRef: 'salPayment'
        },
        {
          id: 'so',
          icon: 'bi-cart-x',
          label: `${S}.kpi.so`,
          value: (ctx) => kpiOf(ctx).soNotInvoicedThb,
          format: 'money0',
          sub: (ctx, t) => t(`${S}.kpi.soSub`, { count: countText(kpiOf(ctx).soNotInvoicedCount) }),
          tone: (ctx) => (kpiOf(ctx).soNotInvoicedCount > 0 ? 'warning' : 'green'),
          reportRef: 'salSo'
        }
      ]
    },

    {
      type: 'donut',
      id: 'salPayment',
      tab: 'overview',
      source: 'Overview',
      title: `${S}.paymentChartTitle`,
      icon: 'bi-pie-chart',
      height: 280,
      valueFormat: 'moneyAbbr',
      center: {
        label: (ctx, t) => t(`${S}.paymentCenterLabel`, { count: countText(sumPaymentCount(overviewOf(ctx).paymentStates)) }),
        value: (total) => formatMoneyAbbreviated(total)
      },
      slices: (ctx) => buildPaymentSlices(overviewOf(ctx).paymentStates),
      // คลิกชิ้น "ยังไม่รับ"/"เลยกำหนด" → ไปแท็บบิลที่ต้องตามพร้อมตัวกรองนั้น (ชิ้น "รับแล้ว" ไม่ใช่ตัวกรอง)
      onSliceClick: (index, ctx) => {
        const dueFilter = resolvePaymentSliceFilter(index)
        if (dueFilter) ctx.goToReport('salDue', { dueFilter })
      }
    },

    {
      type: 'bar',
      id: 'salAging',
      tab: 'aging',
      source: 'Overview',
      title: `${S}.agingChartTitle`,
      icon: 'bi-bar-chart',
      height: 300,
      valueFormat: 'moneyAbbr',
      dataLabels: true,
      rows: (ctx) => buildAgingRows(overviewOf(ctx).aging, ctx.t),
      category: (row) => row.label,
      series: [{ label: `${S}.seriesOutstanding`, value: (row) => row.amountThb, color: 'token:warning' }]
    },

    {
      type: 'table',
      id: 'salTopCustomers',
      tab: 'aging',
      source: 'Overview',
      title: `${S}.topCustomersTitle`,
      icon: 'bi-people',
      sections: [{ rows: (ctx) => buildTopCustomerRows(overviewOf(ctx).topCustomers), columns: topCustomerColumns, dataKey: 'key' }]
    },

    dueSwitch,
    dueTable('overdue', 'salDueOverdue', `${S}.dueOverdueTitle`),
    dueTable('unpaid', 'salDueUnpaid', `${S}.dueUnpaidTitle`),
    dueTable('noDue', 'salDueNoDue', `${S}.dueNoDueTitle`),

    {
      type: 'trend',
      id: 'salTrend',
      tab: 'trend',
      source: 'Overview',
      title: `${S}.trendTitle`,
      icon: 'bi-graph-up-arrow',
      height: 340,
      columnWidth: '55%',
      axisTitles: [`${S}.axisSales`, `${S}.axisBills`],
      points: (ctx) => overviewOf(ctx).series || [],
      categories: (points) => buildMonthLabels(points),
      series: [
        { field: 'grandTotalThb', type: 'bar', label: `${S}.seriesSales`, color: 'green', axis: 0, format: 'money' },
        { field: 'invoiceCount', type: 'line', label: `${S}.seriesBills`, color: 'primary', axis: 1, format: 'count' }
      ],
      hint: (ctx, t) => buildTrendHint(overviewOf(ctx).salesHistory, t)
    },

    {
      type: 'planTable',
      id: 'salSo',
      tab: 'so',
      title: `${S}.soTitle`,
      icon: 'bi-cart-x',
      accent: 'warning',
      endpoint: SO_WITHOUT_INVOICE_ENDPOINT,
      dataKey: 'rowKey',
      params: () => ({}),
      keyParams: (f) => ({ refresh: f.refresh }),
      mapRows: (items, ctx, t) => mapSoRows(items, metalOf(ctx), t),
      columns: soColumns
    }
  ]
})

export default salesConfig
