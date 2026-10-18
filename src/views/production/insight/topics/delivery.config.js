// delivery.config.js — config ของหมวด "ส่งงานตรงเวลา" สำหรับ InsightPage — เทียบเท่า delivery-section.vue เดิม:
// KPI 6 ใบ → กล่อง "แนวโน้มส่งงานตรงเวลา" (กราฟ % ตรงเวลา + เป้า + ปุ่มตั้งเป้า) + "วางแผน vs ใช้จริง" → ลูกค้าที่ได้รับของช้าบ่อย →
// เสี่ยงเลยกำหนด → ส่งช้าในช่วงนี้ → ค้างหลังบัตรต้นทุน
// Delivery ยิงครั้งเดียวได้ findings/kpi/series/targetPercent/targetSource/lateCustomers/asOf · draftTargetPercent ส่งไปเฉพาะตอนกำลัง
// แก้เป้าใน TargetDrawer (preset deliveryTarget) · DeliveryTarget (GET) = เป้าที่บันทึกไว้จริง
import { markRaw } from 'vue'

import { isoOrNull, formatBucketDayMonth } from '@/components/insight/page/insight-page-helpers.js'
import * as col from '@/components/insight/page/columns.js'
import ToggleGroupGeneric from '@/components/generic/ToggleGroupGeneric.vue'
import { resolveOnTimeStatVariant, shouldShowDeliveryDraftChip } from './delivery-helpers.js'

const D = 'view.productionInsight.delivery'
const HELP = 'view.productionInsight.help'
const TABS = 'view.productionInsight.delivery.tabs'

// markRaw: config ถูกส่งผ่าน data()/props ของ view (reactive) — component ใน config ห้ามถูกห่อ proxy
const ToggleGroup = markRaw(ToggleGroupGeneric)

// ตารางใบงาน 3 อันในแท็บ "ใบงานที่ต้องตาม" แสดงทีละอัน เรียงแย่สุดก่อน (ค้าง/เสี่ยง → ส่งช้าแล้ว → ค้างหลังบัตรต้นทุน) — state.dueTable เลือกอันที่ mount/ยิง request
const DUE_TABLE_VALUES = ['atRisk', 'latePlans', 'stuckCostCard']

const countFormat = (value) => (value != null ? new Intl.NumberFormat('th-TH').format(value) : '—')
const oneDecimal = (value) => (value != null ? new Intl.NumberFormat('th-TH', { maximumFractionDigits: 1 }).format(value) : '—')

const deliveryOf = (ctx) => ctx.data.Delivery || {}
const kpiOf = (ctx) => deliveryOf(ctx).kpi || {}
const targetOf = (ctx) => deliveryOf(ctx).targetPercent ?? null

const atRiskColumns = [
  col.planLink(),
  col.mold(),
  col.product(),
  col.dept({ field: 'currentDeptKey', header: `${D}.atRiskColCurrentDept`, keyFields: ['currentDeptKey'], withStatus: false, minWidth: '110px' }),
  col.days('daysInCurrentDept', `${D}.atRiskColDaysInDept`, { tip: `${HELP}.atRiskColDaysInDept`, minWidth: '90px' }),
  col.date('requestDate', `${D}.atRiskColRequestDate`, { minWidth: '100px' }),
  col.days('remainingDays', `${D}.atRiskColRemainingDays`, { minWidth: '90px', negativeClass: true }),
  col.date('projectedFinishDate', `${D}.atRiskColProjectedFinish`),
  col.days('projectedLateDays', `${D}.atRiskColProjectedLate`, { tip: `${HELP}.atRiskColProjectedLate`, minWidth: '110px', emphasisWhen: (raw) => (raw ?? 0) > 0 }),
  col.lastUpdate(),
  col.workers()
]

const latePlansColumns = [
  col.planLink(),
  col.mold(),
  col.product(),
  col.date('requestDate', `${D}.latePlansColRequestDate`, { minWidth: '100px' }),
  col.date('doneDate', `${D}.latePlansColDoneDate`, { minWidth: '100px' }),
  col.days('lateDays', `${D}.latePlansColLateDays`, { minWidth: '90px', emphasisWhen: () => true })
]

const stuckColumns = [
  col.planLink(),
  col.mold(),
  col.product(),
  col.date('costCardDate', `${D}.stuckCostCardColDate`, { minWidth: '120px' }),
  col.days('daysSinceCostCard', `${D}.stuckCostCardColDays`, { minWidth: '90px' })
]

const lateCustomerColumns = [
  col.text('customerCode', `${D}.lateCustomersColCode`, { minWidth: '110px' }),
  col.text('customerName', `${D}.lateCustomersColName`, { minWidth: '180px' }),
  col.days('completedCount', `${D}.lateCustomersColCompleted`, { minWidth: '100px' }),
  col.days('lateCount', `${D}.lateCustomersColLateCount`, { minWidth: '80px' }),
  col.percent('latePercent', `${D}.lateCustomersColLatePercent`, { digits: 1, minWidth: '90px' }),
  col.number('lateMedianDays', `${D}.lateCustomersColLateMedianDays`, 'days', { minWidth: '110px' })
]

export const deliveryConfig = markRaw({
  titleKey: 'view.productionInsight.nav.delivery',

  // โหมดแท็บ (opt-in) — แต่ละแท็บข้อมูลมีของน้อยๆ · Delivery (findings + KPI + กราฟ + ลูกค้า) ยิงตั้งแต่โหลดหน้าเสมอ
  tabs: [
    { key: 'overview', label: `${TABS}.overview` },
    { key: 'trend', label: `${TABS}.trend` },
    { key: 'customers', label: `${TABS}.customers` },
    { key: 'due', label: `${TABS}.due` }
  ],
  findings: { source: 'Delivery' },

  // เสริม params ที่ finding เองไม่มี (riskHorizonDays จาก filter ปัจจุบัน) ให้ข้อความ help.<CODE> resolve ได้
  helpParams: (filter) => ({ days: filter.riskHorizonDays }),

  sources: {
    Delivery: {
      endpoint: 'ProductionInsight/Delivery',
      // draftTargetPercent (ร่างเป้าใน TargetDrawer) ส่งเฉพาะตอนมี draft — null/undefined = ไม่ส่ง
      params: (f, s) => ({
        start: isoOrNull(f.start),
        end: isoOrNull(f.end),
        bucket: f.bucket,
        riskHorizonDays: f.riskHorizonDays,
        draftTargetPercent: s.draftTargetPercent ?? undefined
      })
    },
    // เป้าที่บันทึกจริง ใช้เฉพาะในแท็บแนวโน้ม (ชิป "ร่าง" + แผงตั้งเป้า) → ยิงเมื่อเปิดแท็บนั้น
    DeliveryTarget: { tab: 'trend', endpoint: 'ProductionInsight/DeliveryTarget', method: 'get', params: () => null }
  },

  state: {
    draftTargetPercent: { initial: null },
    dueTable: { initial: 'atRisk' }
  },

  blocks: [
    {
      type: 'kpi',
      tab: 'overview',
      source: 'Delivery',
      title: `${D}.kpiGroupTitle`,
      icon: 'bi-truck',
      gridColumns: 3,
      asOf: (ctx) => deliveryOf(ctx).asOf,
      cards: [
        {
          id: 'onTime',
          icon: 'bi-percent',
          label: `${D}.kpiOnTimePercent`,
          value: (ctx) => kpiOf(ctx).onTimePercent,
          format: 'percent',
          sub: (ctx, t) => {
            const completed = countFormat(kpiOf(ctx).completedCount)
            const onTime = countFormat(kpiOf(ctx).onTimeCount)
            const target = targetOf(ctx)
            return target == null ? t(`${D}.kpiOnTimeSubNoTarget`, { completed, onTime }) : t(`${D}.kpiOnTimeSubTarget`, { target: oneDecimal(target), completed, onTime })
          },
          tone: (ctx) => resolveOnTimeStatVariant(kpiOf(ctx).onTimePercent, targetOf(ctx)),
          reportRef: 'deliveryTrend'
        },
        {
          id: 'lateMedian',
          icon: 'bi-hourglass-split',
          label: `${D}.kpiLateMedianDays`,
          value: (ctx) => kpiOf(ctx).lateMedianDays,
          format: 'days',
          unit: `${D}.daysUnit`,
          tone: () => 'warning',
          reportRef: 'latePlans'
        },
        {
          id: 'leadCompare',
          icon: 'bi-signpost-split',
          label: `${D}.kpiLeadCompare`,
          value: (ctx) => kpiOf(ctx).actualLeadMedianDays,
          format: 'days',
          unit: `${D}.daysUnit`,
          sub: (ctx, t) => t(`${D}.kpiLeadCompareSub`, { planned: oneDecimal(kpiOf(ctx).plannedLeadMedianDays), suggested: oneDecimal(kpiOf(ctx).suggestedLeadDays) }),
          reportRef: 'deliveryTrend'
        },
        {
          id: 'openOverdue',
          icon: 'bi-exclamation-circle',
          label: `${D}.kpiOpenOverdue`,
          value: (ctx) => kpiOf(ctx).openOverdueActiveCount,
          sub: (ctx, t) => t(`${D}.kpiOpenOverdueSub`, { all: countFormat(kpiOf(ctx).openOverdueCount), open: countFormat(kpiOf(ctx).openCount) }),
          tone: () => 'warning',
          reportRef: 'atRisk'
        },
        {
          id: 'atRisk',
          icon: 'bi-exclamation-triangle',
          label: `${D}.kpiAtRisk`,
          value: (ctx) => kpiOf(ctx).atRiskCount,
          tone: () => 'warning',
          reportRef: 'atRisk'
        },
        {
          id: 'stuck',
          icon: 'bi-clipboard-x',
          label: `${D}.kpiStuckCostCard`,
          value: (ctx) => kpiOf(ctx).stuckAfterCostCardCount,
          tone: () => 'warning',
          reportRef: 'stuckCostCard'
        }
      ]
    },

    {
      group: true,
      id: 'deliveryTrend',
      tab: 'trend',
      blocks: [
        {
          type: 'trend',
          chartType: 'bar',
          source: 'Delivery',
          title: `${D}.ontimeChartTitle`,
          titleTip: `${HELP}.deliveryDefinitions`,
          icon: 'bi-graph-up-arrow',
          height: 280,
          toolbar: {
            hint: `${D}.trendHint`,
            // ชิป "ร่าง": Delivery คืน targetSource:'draft' ทุกครั้งที่ส่ง draft (แม้ค่าเท่าที่บันทึก) จึงเทียบกับเป้าที่บันทึกจริงเอง
            chip: (ctx, t) => (shouldShowDeliveryDraftChip(deliveryOf(ctx).targetSource, targetOf(ctx), ctx.data.DeliveryTarget?.targetPercent) ? t(`${D}.targetDraftChip`) : ''),
            actions: [{ type: 'targetDrawer', preset: 'deliveryTarget' }]
          },
          points: (ctx) => deliveryOf(ctx).series || [],
          categories: (points) => points.map((p) => formatBucketDayMonth(p.bucketEnd)),
          yFormat: 'percent',
          yMax: 100,
          series: [{ field: 'onTimePercent', type: 'bar', label: `${D}.seriesOnTime`, color: 'primary' }],
          targetLine: { value: (ctx) => targetOf(ctx), label: `${D}.seriesTarget` }
        },
        {
          type: 'trend',
          source: 'Delivery',
          title: `${D}.leadChartTitle`,
          icon: 'bi-bar-chart-line',
          height: 280,
          points: (ctx) => deliveryOf(ctx).series || [],
          categories: (points) => points.map((p) => formatBucketDayMonth(p.bucketEnd)),
          yFormat: 'days',
          series: [
            { field: 'plannedLeadMedianDays', type: 'line', label: `${D}.seriesPlanned`, color: 'sub', dashed: true },
            { field: 'actualLeadMedianDays', type: 'line', label: `${D}.seriesActual`, color: 'primary' }
          ]
        }
      ]
    },

    {
      type: 'table',
      id: 'lateCustomers',
      tab: 'customers',
      source: 'Delivery',
      title: `${D}.lateCustomersTitle`,
      icon: 'bi-people',
      accent: 'warning',
      emptyText: `${D}.lateCustomersEmpty`,
      rows: (ctx) => deliveryOf(ctx).lateCustomers || [],
      dataKey: 'customerCode',
      columns: lateCustomerColumns
    },

    {
      // สลับตารางใบงาน 3 อัน (แสดงทีละอัน) — ค่า = state.dueTable
      type: 'slot',
      id: 'dueSwitch',
      tab: 'due',
      component: ToggleGroup,
      props: (ctx) => ({
        modelValue: ctx.state.dueTable,
        ariaLabel: ctx.t(`${TABS}.dueSwitchAria`),
        options: DUE_TABLE_VALUES.map((value) => ({ value, label: ctx.t(`${TABS}.dueOptions.${value}`) }))
      }),
      events: { 'update:modelValue': (ctx, value) => ctx.setState('dueTable', value) }
    },

    {
      type: 'planTable',
      id: 'atRisk',
      tab: 'due',
      reveal: { stateKey: 'dueTable', value: 'atRisk' },
      visible: (ctx) => ctx.state.dueTable === 'atRisk',
      title: `${D}.atRiskTitle`,
      icon: 'bi-hourglass-split',
      accent: 'warning',
      notes: ['view.productionInsight.wip.asOfTodayNote'],
      endpoint: 'ProductionInsight/DeliveryAtRiskPlans',
      params: (f) => ({ riskHorizonDays: f.riskHorizonDays, departmentKeys: f.departmentKeys }),
      columns: atRiskColumns
    },

    {
      type: 'planTable',
      id: 'latePlans',
      tab: 'due',
      reveal: { stateKey: 'dueTable', value: 'latePlans' },
      visible: (ctx) => ctx.state.dueTable === 'latePlans',
      title: `${D}.latePlansTitle`,
      icon: 'bi-clock-history',
      accent: 'warning',
      endpoint: 'ProductionInsight/DeliveryLatePlans',
      params: (f) => ({ start: isoOrNull(f.start), end: isoOrNull(f.end) }),
      columns: latePlansColumns
    },

    {
      type: 'planTable',
      id: 'stuckCostCard',
      tab: 'due',
      reveal: { stateKey: 'dueTable', value: 'stuckCostCard' },
      visible: (ctx) => ctx.state.dueTable === 'stuckCostCard',
      title: `${D}.stuckCostCardTitle`,
      icon: 'bi-clipboard-x',
      accent: 'warning',
      notes: ['view.productionInsight.wip.asOfTodayNote'],
      endpoint: 'ProductionInsight/StuckAfterCostCardPlans',
      params: () => ({}),
      columns: stuckColumns
    }
  ]
})

export default deliveryConfig
