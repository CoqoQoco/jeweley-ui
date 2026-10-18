// wip.config.js — config ของหมวด "งานค้างและคอขวด" สำหรับ InsightPage (src/components/insight/page) — เทียบเท่า
// wip-section.vue เดิม: blocks เรียงเหมือนเดิม (พัฒนาการงานค้าง → งานค้างแยกแผนก ‖ งานเข้า-ออก → เวลาผลิตรายแผนก +
// กราฟรายละเอียด + ผลต่อกำลังการผลิต → ใบงานค้าง → งานเสี่ยงเลยกำหนด → ใบที่อยู่ในแผนกนานผิดปกติ)
// block id = reportRef ที่ API ส่งมา (trend/departments/flow/leadTime/stalePlans/dueRisk/abnormalDwell) → "ดู ›" เลื่อนมาหาได้
import { markRaw } from 'vue'

import { formatRangeLabel } from '@/services/utils/range-presets.js'
import { formatDate } from '@/services/utils/dayjs.js'
import { isoOrNull } from '@/components/insight/page/insight-page-helpers.js'
import * as col from '@/components/insight/page/columns.js'
import ToggleGroupGeneric from '@/components/generic/ToggleGroupGeneric.vue'
import {
  resolveDeltaVariant,
  resolveDeltaColorToken,
  resolveDefaultSelectedDept,
  resolveTrendSummaryVariant,
  sortDepartmentsByDeltaDesc,
  prependRangeStartPoint,
  formatSparklineBucketDate
} from '@/components/insight/trend-helpers.js'
import {
  resolveMostOverStandardDept,
  resolveStandardChipVariant,
  hasAnySeriesValue,
  isSmallSplitSample,
  shouldShowDraftChip,
  mapSeriesField,
  buildCapacityDeltaText
} from '@/components/insight/lead-time-helpers.js'

const W = 'view.productionInsight.wip'
const TABS = 'view.productionInsight.wip.tabs'

// markRaw: config ถูกส่งผ่าน data()/props ของ view (reactive) — component ใน config ห้ามถูกห่อ proxy
const ToggleGroup = markRaw(ToggleGroupGeneric)

// ตารางใบงาน 3 อันในแท็บ "ใบงานที่ต้องตาม" แสดงทีละอัน — state.dueTable เลือกอันที่ mount/ยิง request
const DUE_TABLE_VALUES = ['stale', 'dueRisk', 'abnormal']
const HELP = 'view.productionInsight.help'
const EXEC = 'view.executive.production'

const countFormat = (value) => new Intl.NumberFormat('th-TH').format(value || 0)
const daysFormat = (value) => (value != null ? new Intl.NumberFormat('th-TH', { maximumFractionDigits: 1 }).format(value) : '—')
const deptLabel = (t, key) => (key ? t(`view.executive.department.${key}`) : '—')

export const signedCount = (value) => {
  if (!value) return '± 0'
  return `${value > 0 ? '+' : '−'}${countFormat(Math.abs(value))}`
}

export const signedPercent = (value) => {
  if (value === null || value === undefined) return '—'
  if (!value) return '0%'
  return `${value > 0 ? '+' : '−'}${countFormat(Math.abs(value))}%`
}

// ---- helper อ่านข้อมูลจาก ctx ----

const wipReport = (ctx) => ctx.data.Wip?.report || {}
const trendRes = (ctx) => ctx.data.WipTrend || {}
const leadRes = (ctx) => ctx.data.StageLeadTime || {}
const leadDepartments = (ctx) => leadRes(ctx).departments || []

// การ์ด sparkline: "รวม" ก่อน แล้วตามด้วยแผนก (เหมือน cardRows ของ wip-trend-panel เดิม)
export function buildTrendCardRows(res, t) {
  const rows = []
  if (res?.total) rows.push({ key: 'total', label: t(`${W}.trendTotalLabel`), ...res.total })
  ;(res?.departments || []).forEach((d) => rows.push({ key: d.key, label: deptLabel(t, d.key), ...d }))
  return rows
}

export function buildTrendTableRows(res, t) {
  const rows = sortDepartmentsByDeltaDesc(res?.departments || []).map((d) => ({ ...d, label: deptLabel(t, d.key) }))
  if (res?.total) rows.push({ ...res.total, key: 'total', label: t(`${W}.trendTotalLabel`), isTotal: true })
  return rows
}

const selectedTrendRow = (ctx, t) => buildTrendCardRows(trendRes(ctx), t).find((row) => row.key === ctx.state.trendDept) || null

// จุดแกน x ของกราฟพัฒนาการ: bucket จริงใช้ label จาก API, จุดสังเคราะห์ต้นช่วงใช้ format วันที่
export function trendBucketLabel(buckets, bucketEnd, bucket) {
  const match = (buckets || []).find((b) => b.end === bucketEnd)
  return match ? match.label : formatSparklineBucketDate(bucketEnd, bucket)
}

export function leadBucketLabel(bucketEnd) {
  return bucketEnd ? new Intl.DateTimeFormat('th-TH', { day: '2-digit', month: '2-digit' }).format(new Date(bucketEnd)) : ''
}

const hasWaitWork = (points) => hasAnySeriesValue(points, 'medianWait') || hasAnySeriesValue(points, 'medianWork')

// ---- columns ----

const trendTableColumns = [
  col.dept({ field: 'label', header: `${W}.trendColDept`, keyFields: ['key'], withStatus: false, minWidth: '140px', align: undefined }),
  col.number('startWip', `${W}.trendColStart`, 'count', { tip: `${HELP}.trendColStart` }),
  col.number('endWip', `${W}.trendColEnd`, 'count', { tip: `${HELP}.trendColEnd` }),
  col.number('delta', `${W}.trendColChange`, 'count', {
    tip: `${HELP}.trendColChange`,
    display: (row) => signedCount(row.delta),
    color: (row) => resolveDeltaColorToken(resolveDeltaVariant(row.delta))
  }),
  col.number('deltaPercent', `${W}.trendColChangePercent`, 'count', {
    tip: `${HELP}.trendColChangePercent`,
    minWidth: '80px',
    display: (row) => signedPercent(row.deltaPercent),
    nullAs: '—',
    value: (row) => row.deltaPercent,
    color: (row) => resolveDeltaColorToken(resolveDeltaVariant(row.delta))
  }),
  col.number('inflow', `${W}.trendColInflow`, 'count', { tip: `${HELP}.trendColInflow` }),
  col.number('outflow', `${W}.trendColOutflow`, 'count', { tip: `${HELP}.trendColOutflow` }),
  col.number('net', `${W}.trendColNet`, 'count', { tip: `${HELP}.trendColNet` })
]

const noSplitDataTip = (row, t, ctx) => {
  const since = leadRes(ctx).splitDataSince
  return since ? t(`${W}.leadTimeNoSplitDataTip`, { date: formatDate(since) }) : t(`${W}.leadTimeNoSplitDataTipUnknown`)
}

const smallSampleSuffix = (row, t) => (isSmallSplitSample(row.splitSampleCount) ? `(${row.splitSampleCount} ${t(`${W}.planUnit`)})` : '')

const leadTimeColumns = [
  col.dept({ field: 'label', header: `${W}.leadTimeColDept`, keyFields: ['key'], withStatus: false, bold: true, minWidth: '110px' }),
  col.number('standardDays', `${W}.leadTimeColStandard`, 'days', {
    tip: `${HELP}.leadTimeColStandard`,
    align: undefined,
    badgeTone: 'warning',
    badge: (row, t, ctx) => (shouldShowDraftChip(row.key, row.standardDays, row.standardSource, ctx.data.StageStandards || []) ? t(`${W}.leadTimeStandardDraftChip`) : '')
  }),
  col.number('medianTotal', `${W}.leadTimeColMedianTotal`, 'days', { tip: `${HELP}.leadTimeColMedianTotal`, path: 'median.total' }),
  col.number('wait', `${W}.leadTimeColWait`, 'days', { tip: `${HELP}.leadTimeColWait`, path: 'median.wait', nullTip: noSplitDataTip, suffix: smallSampleSuffix }),
  col.number('work', `${W}.leadTimeColWork`, 'days', { tip: `${HELP}.leadTimeColWork`, path: 'median.work', nullTip: noSplitDataTip, suffix: smallSampleSuffix }),
  col.shareBar('share', `${W}.leadTimeColShareHeader`, {
    tip: `${HELP}.leadTimeColShare`,
    wait: (row) => row.median?.wait,
    work: (row) => row.median?.work,
    waitLabel: `${W}.leadTimeColWait`,
    workLabel: `${W}.leadTimeColWork`,
    nullTip: noSplitDataTip
  }),
  col.number('p90', `${W}.leadTimeColP90`, 'days', { tip: `${HELP}.leadTimeColP90`, path: 'p90.total', minWidth: '80px' }),
  col.chip(
    'vsStandard',
    `${W}.leadTimeColVsStandard`,
    (row) => resolveStandardChipVariant(row.overStandardPercent),
    (row, t) =>
      resolveStandardChipVariant(row.overStandardPercent) === 'pass'
        ? t(`${W}.leadTimeChipPass`)
        : t(`${W}.leadTimeChipOver`, { percent: Math.round(row.overStandardPercent || 0) }),
    { tip: `${HELP}.leadTimeColVsStandard`, minWidth: '100px' }
  ),
  col.number('exited', `${W}.leadTimeColExited`, 'count', { tip: `${HELP}.leadTimeColExited`, path: 'exitedCount', nullAs: '0', minWidth: '80px' }),
  col.number('abnormal', `${W}.leadTimeColAbnormal`, 'count', {
    tip: `${HELP}.leadTimeColAbnormal`,
    path: 'abnormalCount',
    nullAs: '0',
    minWidth: '110px',
    actionTitle: `${HELP}.leadTimeColAbnormal`,
    // คลิกตัวเลข = โฟกัสตารางใบที่อยู่ในแผนกนานผิดปกติเฉพาะแผนกนี้ (ตั้ง state ที่ตาราง abnormalDwell อ่านใน params)
    onClick: (row, ctx) => {
      ctx.setState('abnormalFocus', row.key)
      // ตารางอยู่คนละแท็บ → สลับไปแท็บ "ใบงานที่ต้องตาม" + เลือกตารางนิ่งผิดปกติ แล้วเลื่อนไปหา
      ctx.goToReport?.('abnormalDwell')
    }
  }),
  col.number('currentWaiting', `${W}.leadTimeColCurrentWaiting`, 'count', { tip: `${HELP}.leadTimeColCurrentWaiting`, path: 'currentWaitingCount', minWidth: '100px' }),
  col.sparkline('trend', `${W}.leadTimeColTrend`, (row) => mapSeriesField(row.series, 'medianTotal'), { tip: `${HELP}.leadTimeColTrend` })
]

const capacityDeptColumns = [
  col.dept({ field: 'label', header: `${W}.leadTimeColDept`, keyFields: ['key'], withStatus: false, minWidth: '110px' }),
  col.number('activeWip', `${W}.capacityColDeptActiveWip`, 'count', { minWidth: '100px' }),
  col.number('exitedCount', `${W}.capacityColDeptExited`, 'count', { minWidth: '100px' }),
  col.number('exitedPerDay', `${W}.capacityColDeptExitedPerDay`, 'decimal', { minWidth: '140px' }),
  col.number('queueDaysCurrent', `${W}.capacityColDeptQueueDaysCurrent`, 'days', {
    unit: `${W}.leadTimeDaysUnit`,
    minWidth: '160px',
    badgeTone: 'danger',
    badge: (row, t) => (row.isBottleneckCurrent ? t(`${W}.capacityBottleneckChip`) : '')
  }),
  col.number('medianTotal', `${W}.capacityColDeptMedianTotal`, 'days', { unit: `${W}.leadTimeDaysUnit`, minWidth: '130px' }),
  col.number('standardDays', `${W}.capacityColDeptStandard`, 'days', { unit: `${W}.leadTimeDaysUnit`, minWidth: '110px' }),
  col.number('atStandardPerDay', `${W}.capacityColDeptAtStandardPerDay`, 'decimal', { minWidth: '170px' }),
  col.number('queueDaysAtStandard', `${W}.capacityColDeptQueueDaysAtStandard`, 'days', {
    unit: `${W}.leadTimeDaysUnit`,
    minWidth: '180px',
    badgeTone: 'danger',
    badge: (row, t) => (row.isBottleneckAtStandard ? t(`${W}.capacityBottleneckChip`) : '')
  })
]

const capacitySummaryColumns = [
  col.text('label', null, { minWidth: '160px' }),
  col.text('now', `${W}.capacityColNow`, { minWidth: '120px' }),
  col.text('atStandard', `${W}.capacityColAtStandard`, { minWidth: '120px' })
]

export function buildCapacitySummaryRows(capacity, t) {
  const days = (value) => (value != null ? `${daysFormat(value)} ${t(`${W}.leadTimeDaysUnit`)}` : '—')
  const current = capacity?.current || {}
  const atStandard = capacity?.atStandard || {}
  return [
    { key: 'lead', label: t(`${W}.capacityTotalLeadDays`), now: days(current.totalLeadDays), atStandard: days(atStandard.totalLeadDays) },
    { key: 'throughput', label: t(`${W}.capacityThroughput`), now: current.monthlyThroughput != null ? countFormat(current.monthlyThroughput) : '—', atStandard: atStandard.monthlyThroughput != null ? countFormat(atStandard.monthlyThroughput) : '—' },
    { key: 'bottleneck', label: t(`${W}.capacityBottleneck`), now: deptLabel(t, current.bottleneckDept), atStandard: deptLabel(t, atStandard.bottleneckDept) }
  ]
}

// ---- plan table columns ----

const baseStaleColumns = [
  col.planLink(),
  col.mold(),
  col.product(),
  col.dept(),
  col.date('createDate', `${EXEC}.colOpenDate`),
  col.lastUpdate(),
  col.workers(),
  col.days('daysSinceMove', `${EXEC}.colDays`, { tip: `${HELP}.staleColDays`, minWidth: '80px' })
]

const dueRiskColumns = [
  col.planLink(),
  col.mold(),
  col.product(),
  col.dept({ minWidth: '140px' }),
  col.lastUpdate(),
  col.workers(),
  col.date('dueDate', `${W}.dueRiskColDueDate`),
  col.days('daysToDue', `${W}.dueRiskColDaysToDue`, { minWidth: '90px', negativeClass: true })
]

const abnormalColumns = [
  col.planLink(),
  col.mold(),
  col.product(),
  col.dept({ minWidth: '120px', keyFields: ['deptKey', 'departmentKey'], withStatus: false }),
  col.days('daysInDept', `${W}.abnormalDwellColDays`, { tip: `${HELP}.abnormalDwellColDays`, minWidth: '90px' }),
  col.text('waitWork', (t) => `${t(`${W}.leadTimeColWait`)} / ${t(`${W}.leadTimeColWork`)}`, {
    align: 'right',
    minWidth: '90px',
    value: (row) => `${row.waitDays ?? '—'} / ${row.workDays ?? '—'}`
  }),
  col.days('standardDays', `${W}.abnormalDwellColStandard`, { tip: `${HELP}.abnormalDwellColStandard`, minWidth: '90px' }),
  col.lastUpdate(),
  col.workers()
]

// ---- config ----

export const wipConfig = markRaw({
  titleKey: 'view.productionInsight.nav.wip',

  // โหมดแท็บ (opt-in) — แท็บข้อมูลหลังแท็บคงที่ 3 อัน (ปัญหา/คาดการณ์/วิธีแก้) · block ระดับบนสุดระบุ tab · source ผูก tab ยิงเมื่อเปิดแท็บนั้น
  tabs: [
    { key: 'trend', label: `${TABS}.trend` },
    { key: 'dept', label: `${TABS}.dept` },
    { key: 'leadtime', label: `${TABS}.leadtime` },
    { key: 'due', label: `${TABS}.due` }
  ],
  findings: { source: 'Wip' },

  // เสริม params ที่ finding เองไม่มี (ค่าจาก filter ปัจจุบัน) ให้ข้อความ help.<CODE> resolve ได้
  helpParams: (filter) => ({
    staleDays: filter.staleDays,
    riskWindowDays: filter.riskWindowDays,
    thresholdPercent: filter.growthThresholdPercent
  }),

  sources: {
    Wip: {
      endpoint: 'ProductionInsight/Wip',
      params: (f) => ({
        staleDays: f.staleDays,
        riskWindowDays: f.riskWindowDays,
        start: isoOrNull(f.start),
        end: isoOrNull(f.end),
        growthThresholdPercent: f.growthThresholdPercent
      })
    },
    WipTrend: {
      tab: 'trend',
      endpoint: 'ProductionInsight/WipTrend',
      params: (f) => ({ start: isoOrNull(f.start), end: isoOrNull(f.end), bucket: f.bucket })
    },
    // draftStandards ส่งเฉพาะตอนกำลังแก้ค่าใน TargetDrawer (ยังไม่บันทึก) ให้ตาราง/การ์ดคำนวณ preview ใหม่
    StageLeadTime: {
      tab: 'leadtime',
      endpoint: 'ProductionInsight/StageLeadTime',
      params: (f, s) => ({
        start: isoOrNull(f.start),
        end: isoOrNull(f.end),
        bucket: f.bucket,
        draftStandards: s.draftStandards && s.draftStandards.length ? s.draftStandards : undefined
      })
    },
    StageStandards: { tab: 'leadtime', endpoint: 'ProductionInsight/StageStandards', method: 'get', params: () => null }
  },

  state: {
    trendDept: {
      initial: null,
      // โหลด WipTrend ใหม่ทุกครั้ง = เลือกแผนกที่เพิ่มขึ้นมากสุด (หรือ "รวม") ใหม่ — เหมือน wip-trend-panel เดิม
      resetOn: { source: 'WipTrend', value: (data) => resolveDefaultSelectedDept(data?.departments || []) || (data?.total ? 'total' : null) }
    },
    leadDept: {
      initial: null,
      // คงแผนกที่เลือกไว้ถ้ายังอยู่ในผล ไม่งั้นเลือกแผนกที่เกินมาตรฐานมากสุด
      resetOn: {
        source: 'StageLeadTime',
        value: (data, current) => {
          const departments = data?.departments || []
          return !current || !departments.some((d) => d.key === current) ? resolveMostOverStandardDept(departments) : current
        }
      }
    },
    draftStandards: { initial: () => [] },
    abnormalFocus: { initial: '' },
    dueRiskMode: { initial: 'overdue' },
    dueTable: { initial: 'stale' }
  },

  blocks: [
    {
      group: true,
      id: 'trend',
      tab: 'trend',
      blocks: [
        {
          type: 'sparkCards',
          source: 'WipTrend',
          title: `${W}.trendCardsTitle`,
          titleTip: `${HELP}.trendCardsTitle`,
          icon: 'bi-graph-up-arrow',
          notes: [`${W}.trendCardsHint`],
          items: (ctx, t) => buildTrendCardRows(trendRes(ctx), t),
          selectedState: 'trendDept',
          bucket: (ctx) => ctx.filter.bucket,
          rangeStart: (ctx) => ctx.filter.start
        },
        {
          type: 'detail',
          source: 'WipTrend',
          icon: 'bi-bar-chart-line',
          titleTip: `${HELP}.trendDetailChart`,
          selected: (ctx) => selectedTrendRow(ctx, ctx.t),
          title: (ctx, t, row) => {
            const range = formatRangeLabel(ctx.filter.start, ctx.filter.end)
            return row.key === 'total' ? t(`${W}.trendDetailTitleTotal`, { range }) : t(`${W}.trendDetailTitleDept`, { name: row.label, range })
          },
          trend: {
            points: (ctx) => prependRangeStartPoint(ctx.selected.series, ctx.filter.start, ctx.selected.startWip),
            categories: (points, ctx) => points.map((p) => trendBucketLabel(trendRes(ctx).buckets, p.bucketEnd, ctx.filter.bucket)),
            series: [
              { field: 'wip', type: 'line', label: `${W}.trendSeriesWip`, color: 'primary', nullAs: 0 },
              { field: 'inflow', type: 'bar', label: `${W}.trendSeriesInflow`, color: 'green', nullAs: 0 },
              { field: 'outflow', type: 'bar', label: `${W}.trendSeriesOutflow`, color: 'red', nullAs: 0, negate: true }
            ],
            tooltipAbs: true,
            summary: (ctx, t) => {
              const row = ctx.selected
              const inflow = row.inflow || 0
              const outflow = row.outflow || 0
              const net = row.net ?? inflow - outflow
              return t(`${W}.trendSummary.${resolveTrendSummaryVariant(inflow, outflow)}`, {
                inflow: countFormat(inflow),
                outflow: countFormat(outflow),
                net: signedCount(net)
              })
            }
          }
        },
        {
          type: 'table',
          source: 'WipTrend',
          title: `${W}.trendTableTitle`,
          icon: 'bi-table',
          rows: (ctx) => buildTrendTableRows(trendRes(ctx), ctx.t),
          columns: trendTableColumns
        }
      ]
    },

    {
      row: true,
      tab: 'dept',
      blocks: [
        {
          type: 'chart',
          chartType: 'barH',
          id: 'departments',
          source: 'Wip',
          title: `${EXEC}.byDepartmentTitle`,
          titleTip: `${HELP}.departmentWipChart`,
          icon: 'bi-diagram-3',
          notes: [`${W}.asOfTodayNote`],
          rows: (ctx) => wipReport(ctx).departments || [],
          category: (row, ctx, t) => deptLabel(t, row.key),
          series: [
            { label: `${EXEC}.seriesMoved30d`, value: (row) => row.moved30d || 0 },
            { label: `${EXEC}.seriesMoved30to180d`, value: (row) => row.moved30to180d || 0 },
            { label: `${EXEC}.seriesStale180d`, value: (row) => row.stale180d || 0 }
          ],
          stacked: true,
          colors: ['token:green', 'token:warning', 'token:red'],
          bar: { barHeight: '65%' },
          minHeight: 240,
          rowHeight: 44,
          pad: 60
        },
        {
          type: 'chart',
          chartType: 'barH',
          id: 'flow',
          source: 'Wip',
          title: (ctx, t) => t(`${W}.flowTitleRanged`, { range: formatRangeLabel(ctx.filter.start, ctx.filter.end) }),
          titleTip: `${HELP}.flowChart`,
          icon: 'bi-arrow-left-right',
          rows: (ctx) => wipReport(ctx).flow || [],
          category: (row, ctx, t) => {
            const inflow = row.inflow ?? row.inflow90d ?? 0
            const outflow = row.outflow ?? row.outflow90d ?? 0
            const net = row.net ?? inflow - outflow
            return `${deptLabel(t, row.key)} (${t(`${W}.flowNet`)} ${net > 0 ? '+' : ''}${countFormat(net)})`
          },
          series: [
            { label: `${W}.flowInflow`, value: (row) => row.inflow ?? row.inflow90d ?? 0 },
            { label: `${W}.flowOutflow`, value: (row) => row.outflow ?? row.outflow90d ?? 0 }
          ],
          colors: ['palette:0', 'palette:1'],
          bar: { columnWidth: '60%' },
          minHeight: 260,
          rowHeight: 40,
          pad: 80
        }
      ]
    },

    {
      type: 'table',
      id: 'leadTime',
      tab: 'leadtime',
      source: 'StageLeadTime',
      title: `${W}.leadTimeTitle`,
      titleTip: `${HELP}.leadTimeTitle`,
      icon: 'bi-hourglass-split',
      toolbar: { hint: `${W}.leadTimeSelectHint`, actions: [{ type: 'targetDrawer', preset: 'stageStandards' }] },
      rows: (ctx) => leadDepartments(ctx).map((d) => ({ ...d, label: deptLabel(ctx.t, d.key) })),
      columns: leadTimeColumns,
      dataKey: 'key',
      selectable: { stateKey: 'leadDept' },
      detail: {
        type: 'detail',
        source: 'StageLeadTime',
        icon: 'bi-graph-up',
        titleTip: `${HELP}.leadTimeDetailChart`,
        selected: (ctx) => leadDepartments(ctx).find((d) => d.key === ctx.state.leadDept) || null,
        title: (ctx, t, row) => t(`${W}.leadTimeDetailTitle`, { name: deptLabel(t, row.key) }),
        trend: {
          points: (ctx) => ctx.selected.series || [],
          categories: (points) => points.map((p) => leadBucketLabel(p.bucketEnd)),
          stacked: true,
          yFormat: 'days',
          series: [
            { field: 'medianTotal', type: 'line', label: `${W}.leadTimeSeriesMedian`, color: 'primary' },
            { field: 'p90Total', type: 'line', label: `${W}.leadTimeSeriesP90`, color: 'sub', dashed: true },
            { field: 'medianWait', type: 'bar', label: `${W}.leadTimeSeriesWait`, color: 'warning', opacity: 0.85, visible: hasWaitWork },
            { field: 'medianWork', type: 'bar', label: `${W}.leadTimeSeriesWork`, color: 'green', opacity: 0.85, visible: hasWaitWork }
          ],
          targetLine: { value: (ctx) => (Number.isFinite(ctx.selected.standardDays) ? ctx.selected.standardDays : null), label: `${W}.leadTimeSeriesStandard` },
          hint: (ctx, t) => (hasWaitWork(ctx.selected.series || []) ? '' : t(`${W}.leadTimeChartNoWaitWorkHint`))
        }
      }
    },

    {
      type: 'table',
      id: 'capacity',
      tab: 'leadtime',
      source: 'StageLeadTime',
      title: `${W}.capacityTitle`,
      titleTip: `${HELP}.capacityTitle`,
      icon: 'bi-speedometer',
      sections: [
        { rows: (ctx) => buildCapacitySummaryRows(leadRes(ctx).capacity, ctx.t), columns: capacitySummaryColumns, dataKey: 'key' },
        {
          kind: 'text',
          text: (ctx, t) => {
            const capacity = leadRes(ctx).capacity || {}
            const days = (value) => (value != null ? `${daysFormat(value)} ${t(`${W}.leadTimeDaysUnit`)}` : '—')
            const lead = buildCapacityDeltaText(capacity.current?.totalLeadDays, capacity.atStandard?.totalLeadDays, days)
            const throughput = buildCapacityDeltaText(capacity.current?.monthlyThroughput, capacity.atStandard?.monthlyThroughput, countFormat)
            return `${t(`${W}.capacityTotalLeadDays`)}: ${lead} · ${t(`${W}.capacityThroughput`)}: ${throughput}`
          }
        },
        { kind: 'text', tone: 'note', icon: 'bi-info-circle', text: (ctx, t) => t(`${HELP}.capacityModelExplanation`) },
        { kind: 'text', tone: 'subtitle', text: (ctx, t) => t(`${W}.capacityDeptTableTitle`) },
        { rows: (ctx) => (leadRes(ctx).capacity?.departments || []).map((d) => ({ ...d, label: deptLabel(ctx.t, d.key) })), columns: capacityDeptColumns, dataKey: 'key' }
      ]
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
      id: 'stalePlans',
      tab: 'due',
      reveal: { stateKey: 'dueTable', value: 'stale' },
      visible: (ctx) => ctx.state.dueTable === 'stale',
      title: `${W}.stalePlansTitle`,
      icon: 'bi-table',
      notes: [`${W}.asOfTodayNote`],
      endpoint: 'ProductionInsight/StalePlans',
      params: (f) => ({ minDays: f.staleDays, departmentKeys: f.departmentKeys }),
      columns: baseStaleColumns
    },

    {
      type: 'planTable',
      id: 'dueRisk',
      tab: 'due',
      reveal: { stateKey: 'dueTable', value: 'dueRisk' },
      visible: (ctx) => ctx.state.dueTable === 'dueRisk',
      title: `${W}.dueRiskTitle`,
      icon: 'bi-hourglass-split',
      accent: 'warning',
      notes: [`${W}.asOfTodayNote`],
      endpoint: 'ProductionInsight/DueRiskPlans',
      params: (f, s) => ({ mode: s.dueRiskMode, departmentKeys: f.departmentKeys, riskWindowDays: f.riskWindowDays }),
      // riskWindowDays มีผลเฉพาะโหมด dueSoon — ใส่ใน key เฉพาะตอนนั้น (ไม่ยิงเปล่าตอนแก้ค่านี้ระหว่างดูโหมด overdue)
      keyParams: (f, s) => [s.dueRiskMode, f.departmentKeys, s.dueRiskMode === 'dueSoon' ? f.riskWindowDays : null],
      toolbar: {
        toggle: {
          stateKey: 'dueRiskMode',
          aria: `${W}.dueRiskModeLabel`,
          options: [
            { value: 'overdue', label: `${W}.dueRiskModeOverdue`, title: `${HELP}.dueRiskModeOverdue` },
            {
              value: 'dueSoon',
              label: (ctx, t) => t(`${W}.dueRiskModeDueSoon`, { days: ctx.filter.riskWindowDays }),
              title: (ctx, t) => t(`${HELP}.dueRiskModeDueSoon`, { days: ctx.filter.riskWindowDays })
            }
          ]
        }
      },
      columns: dueRiskColumns
    },

    {
      type: 'planTable',
      id: 'abnormalDwell',
      tab: 'due',
      reveal: { stateKey: 'dueTable', value: 'abnormal' },
      visible: (ctx) => ctx.state.dueTable === 'abnormal',
      title: `${W}.abnormalDwellTitle`,
      titleTip: `${HELP}.STAGE_ABNORMAL_DWELL`,
      icon: 'bi-hourglass-bottom',
      accent: 'warning',
      notes: [`${W}.asOfTodayNote`, `${W}.abnormalDwellStaleExcludedNote`],
      endpoint: 'ProductionInsight/AbnormalDwellPlans',
      // คลิกเลข "ค้างนานผิดปกติ" ในตาราง lead time = override ตัวกรองแผนกชั่วคราวเฉพาะแผนกนั้น (ไม่แตะ filter จริง)
      params: (f, s) => ({ departmentKeys: s.abnormalFocus ? [s.abnormalFocus] : f.departmentKeys, multiplier: 2 }),
      focus: {
        stateKey: 'abnormalFocus',
        clearTip: `${W}.abnormalDwellClearFilter`,
        chipText: (ctx, t, value) => t(`${W}.abnormalDwellFilterChip`, { name: deptLabel(t, value) })
      },
      columns: abnormalColumns
    }
  ]
})

export default wipConfig
