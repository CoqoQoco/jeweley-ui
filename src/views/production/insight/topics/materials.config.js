// materials.config.js — config ของหมวด "วัตถุดิบที่กระทบการผลิต" (พลอยอย่างเดียว) สำหรับ InsightPage — เทียบเท่า
// materials-section.vue เดิม: KPI 4 ใบ → กราฟงานเข้า/เวลาเข้า→เบิก → ใบงานรอเบิกพลอย → ความต้องการเทียบสต็อก → พลอยใกล้หมด
// Materials ยิงครั้งเดียวได้ทั้ง findings/kpi/series/asOf (params แค่ start/end) · ตาราง 3 ตารางเป็น snapshot ไม่มี start/end
// ตัวกรองของแต่ละตาราง (gemStatus/status/coverDays) เป็น state ของหน้า ไม่ผ่านแผงตัวกรองหลัก
import { markRaw } from 'vue'

import { isoOrNull } from '@/components/insight/page/insight-page-helpers.js'
import { formatBucketMonthLabels } from '@/components/insight/insight-helpers.js'
import * as col from '@/components/insight/page/columns.js'
import {
  MATERIALS_GEM_STATUS_VALUES,
  resolveMatchedLinesPercent,
  resolveGemStatusVariant,
  resolveGemStatusLabelKey,
  buildGemChipItems,
  mapGemDemandRows,
  GEM_STATUS_COLOR,
  GEM_STATUS_BORDER
} from './materials-helpers.js'

const M = 'view.productionInsight.materials'

const countFormat = (value) => (value != null ? new Intl.NumberFormat('th-TH').format(value) : '—')
const daysPlain = (value) => (value != null ? new Intl.NumberFormat('th-TH', { maximumFractionDigits: 1 }).format(value) : '—')

const kpiOf = (ctx) => ctx.data.Materials?.kpi || {}

const statusToggle = (stateKey, aria) => ({
  stateKey,
  aria,
  options: [{ value: '', label: 'common.label.all' }, ...MATERIALS_GEM_STATUS_VALUES.map((value) => ({ value, label: `${M}.gemStatus.${value}` }))]
})

const gemStatusChip = (field, header) =>
  col.chip(
    field,
    header,
    (row) => resolveGemStatusVariant(row.status),
    (row, t) => t(`${M}.gemStatus.${resolveGemStatusLabelKey(row.status, row.unmatchedReason)}`),
    { color: (variant) => GEM_STATUS_COLOR[variant], borderColor: (variant) => GEM_STATUS_BORDER[variant], minWidth: '100px' }
  )

const waitingColumns = [
  col.planLink(),
  col.product({ minWidth: '150px' }),
  col.date('requestDate', `${M}.waitingColRequestDate`, { minWidth: '100px' }),
  col.date('enteredGemSortDate', `${M}.waitingColEnteredDate`, { minWidth: '110px' }),
  col.days('waitingDays', `${M}.waitingColWaitingDays`, { minWidth: '90px' }),
  col.chipList('gems', `${M}.waitingColGems`, (row, ctx, t) => buildGemChipItems(row, ctx.masters, t), { minWidth: '220px' }),
  col.date('dueDate', `${M}.waitingColDueDate`, { minWidth: '100px' }),
  col.workers({ tip: undefined })
]

const demandColumns = [
  col.text('gemLabel', `${M}.demandColGem`, { minWidth: '180px' }),
  col.days('waitingPlans', `${M}.demandColWaitingPlans`),
  col.days('upcomingPlans', `${M}.demandColUpcomingPlans`),
  col.days('requiredQty', `${M}.demandColRequiredQty`),
  col.days('available', `${M}.demandColAvailable`),
  col.days('usedPerMonth', `${M}.demandColUsedPerMonth`, { minWidth: '100px' }),
  col.days('coverDays', `${M}.demandColCoverDays`),
  gemStatusChip('status', `${M}.demandColStatus`)
]

const lowCoverColumns = [
  col.text('code', `${M}.lowCoverColCode`, { minWidth: '110px' }),
  col.text('groupName', `${M}.lowCoverColGroup`, { minWidth: '140px' }),
  col.text('shape', `${M}.lowCoverColShape`, { minWidth: '90px' }),
  col.text('size', `${M}.lowCoverColSize`, { minWidth: '80px' }),
  col.text('grade', `${M}.lowCoverColGrade`, { minWidth: '80px' }),
  col.days('quantity', `${M}.lowCoverColQuantity`),
  col.days('used90d', `${M}.lowCoverColUsed90d`),
  col.days('coverDays', `${M}.lowCoverColCoverDays`, { color: () => 'var(--base-warning)', bold: true })
]

export const DEFAULT_COVER_DAYS = 30

// โหมดแท็บ (opt-in) — 5 แท็บข้อมูล แท็บละ 1 block · Materials (findings + KPI + กราฟ) ยิงตั้งแต่โหลดหน้า · ตาราง 3 ตารางยิง endpoint ของตัวเองตอนเปิดแท็บ (mount ตอนเปิด)
export const materialsConfig = markRaw({
  titleKey: 'view.productionInsight.nav.materials',
  tabs: [
    { key: 'overview', label: `${M}.tabs.overview` },
    { key: 'trend', label: `${M}.tabs.trend` },
    { key: 'waiting', label: `${M}.tabs.waiting` },
    { key: 'demand', label: `${M}.tabs.demand` },
    { key: 'lowcover', label: `${M}.tabs.lowcover` }
  ],
  findings: { source: 'Materials' },
  masters: ['fetchGem', 'fetchGemShape'],

  sources: {
    Materials: {
      endpoint: 'ProductionInsight/Materials',
      params: (f) => ({ start: isoOrNull(f.start), end: isoOrNull(f.end), bucket: 'month' })
    }
  },

  state: {
    waitingStatus: { initial: '' },
    demandStatus: { initial: '' },
    coverDays: { initial: DEFAULT_COVER_DAYS }
  },

  blocks: [
    {
      type: 'kpi',
      id: 'matKpi',
      tab: 'overview',
      source: 'Materials',
      title: `${M}.kpiGroupTitle`,
      icon: 'bi-speedometer2',
      asOf: (ctx) => ctx.data.Materials?.asOf,
      footNote: `${M}.statusEstimateNote`,
      cards: [
        {
          id: 'waiting',
          icon: 'bi-hourglass-split',
          label: `${M}.kpiWaitingPlans`,
          value: (ctx) => kpiOf(ctx).waitingPlans,
          sub: (ctx, t) => t(`${M}.kpiWaitingPlansSub`, { days: daysPlain(kpiOf(ctx).waitingMedianDays) }),
          reportRef: 'matWaiting'
        },
        {
          id: 'issue',
          icon: 'bi-clock-history',
          label: `${M}.kpiIssueMedian`,
          value: (ctx) => kpiOf(ctx).issueMedianDays,
          format: 'days',
          unit: `${M}.daysUnit`,
          sub: (ctx, t) => t(`${M}.kpiIssueMedianSub`, { days: daysPlain(kpiOf(ctx).issueP90Days) }),
          reportRef: 'matTrend'
        },
        {
          id: 'short',
          icon: 'bi-exclamation-triangle',
          label: `${M}.kpiShortLines`,
          value: (ctx) => kpiOf(ctx).shortLines,
          sub: (ctx, t) => t(`${M}.kpiShortLinesSub`, { plans: countFormat(kpiOf(ctx).shortPlans) }),
          tone: () => 'warning',
          reportRef: 'matDemand'
        },
        {
          id: 'matched',
          icon: 'bi-check2-square',
          label: `${M}.kpiMatchedPercent`,
          value: (ctx) => resolveMatchedLinesPercent(kpiOf(ctx).matchedLines, kpiOf(ctx).totalLines),
          format: 'percent0',
          sub: (ctx, t) => t(`${M}.kpiMatchedPercentSub`, { matched: countFormat(kpiOf(ctx).matchedLines), total: countFormat(kpiOf(ctx).totalLines) }),
          reportRef: 'matWaiting'
        }
      ]
    },

    {
      type: 'trend',
      id: 'matTrend',
      tab: 'trend',
      source: 'Materials',
      title: `${M}.trendTitle`,
      icon: 'bi-graph-up-arrow',
      points: (ctx) => ctx.data.Materials?.series || [],
      categories: (points) => formatBucketMonthLabels(points.map((p) => p?.bucketEnd)),
      columnWidth: '45%',
      axisTitles: [`${M}.plansUnit`, `${M}.daysUnit`],
      series: [
        { field: 'entered', type: 'bar', label: `${M}.seriesEntered`, color: 'primary', axis: 0, format: 'count' },
        { field: 'issueMedianDays', type: 'line', label: `${M}.seriesIssueMedian`, color: 'green', axis: 1, format: 'days' },
        { field: 'issueP90Days', type: 'line', label: `${M}.seriesIssueP90`, color: 'warning', axis: 1, format: 'days', dashed: true }
      ]
    },

    {
      type: 'planTable',
      id: 'matWaiting',
      tab: 'waiting',
      title: `${M}.waitingTitle`,
      icon: 'bi-hourglass-split',
      accent: 'warning',
      endpoint: 'ProductionInsight/MaterialWaitingPlans',
      params: (f, s) => ({ gemStatus: s.waitingStatus }),
      toolbar: { toggle: statusToggle('waitingStatus', `${M}.waitingStatusFilter`) },
      columns: waitingColumns
    },

    {
      type: 'planTable',
      id: 'matDemand',
      tab: 'demand',
      title: `${M}.demandTitle`,
      icon: 'bi-boxes',
      endpoint: 'ProductionInsight/MaterialGemDemand',
      params: (f, s) => ({ status: s.demandStatus }),
      toolbar: { toggle: statusToggle('demandStatus', `${M}.demandStatusFilter`) },
      dataKey: 'rowKey',
      mapRows: (items, ctx, t) => mapGemDemandRows(items, ctx.masters, t),
      columns: demandColumns
    },

    {
      type: 'planTable',
      id: 'matLowCover',
      tab: 'lowcover',
      title: `${M}.lowCoverTitle`,
      icon: 'bi-exclamation-circle',
      accent: 'warning',
      endpoint: 'ProductionInsight/MaterialGemLowCover',
      params: (f, s) => ({ coverDays: s.coverDays || DEFAULT_COVER_DAYS }),
      toolbar: { number: { stateKey: 'coverDays', label: `${M}.lowCoverFilterDays`, min: 1 } },
      dataKey: 'code',
      columns: lowCoverColumns
    }
  ]
})

export default materialsConfig
