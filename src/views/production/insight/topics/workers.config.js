// workers.config.js — config ของหมวด "ช่างและค่าแรง" สำหรับ InsightPage — เทียบเท่า workers-section.vue เดิม:
// KPI 4 ใบ → กราฟค่าแรงรายเดือนแยกแผนก (stacked) + เส้นค่าแรงต่อใบงาน → ตารางช่างรายคน (ตัวกรองฝั่ง client, คลิกแถว = กราฟรายเดือนของช่าง)
// → งานที่ยังไม่บันทึกค่าแรง · Workers ยิงครั้งเดียว (start/end/departmentKeys/employmentTypes) · concentration ไม่แสดงเหมือนเดิม
// WorkerMonthly ยิงเฉพาะเมื่อมีช่างที่เลือก (source.enabled) ด้วย code+deptKey+start+end ใน key เดียว
import { isoOrNull } from '@/components/insight/page/insight-page-helpers.js'
import { formatBucketMonthLabels } from '@/components/insight/insight-helpers.js'
import { CHART_PALETTE } from '@/services/utils/chart-colors.js'
import * as col from '@/components/insight/page/columns.js'
import { WORKERS_EMPLOYMENT_TYPE_VALUES } from '../insight-filters.js'
import {
  collectWageBuckets,
  collectWageDeptKeys,
  filterWorkersByDept,
  filterWorkersByEmploymentType,
  resolveGoldColumnValue,
  formatWorkersMoney,
  formatWorkersPercent,
  buildWagesSubLabel,
  buildActiveWorkersSubLabel,
  buildWorkersTableRows,
  buildWagesTrendSeriesDefs,
  resolveSelectedWorker
} from './workers-helpers.js'

const W = 'view.productionInsight.workers'

const workersOf = (ctx) => ctx.data.Workers?.workers || []
const kpiOf = (ctx) => ctx.data.Workers?.kpi || {}

const emphasisColor = (flag) => (row) => (row[flag] ? 'var(--base-warning)' : '')
const emphasisBold = (flag) => (row) => !!row[flag]
const moneyDisplay = (row, t, raw) => formatWorkersMoney(raw)

const tableColumns = [
  col.stacked('name', `${W}.colWorker`, (row) => ({ primary: row.name, secondary: row.code })),
  col.dept({ field: 'deptLabel', header: `${W}.colDept`, keyFields: ['deptKey'], withStatus: false, minWidth: '100px' }),
  col.chip(
    'employmentType',
    `${W}.colEmploymentType`,
    () => 'neutral',
    (row, t) => t(`${W}.employmentType.${row.employmentType || 'UNKNOWN'}`),
    { color: () => 'var(--base-sub-color)', borderColor: () => 'var(--color-border)' }
  ),
  col.days('jobs', `${W}.colJobs`, { minWidth: '80px' }),
  col.days('plans', `${W}.colPlans`, { minWidth: '80px' }),
  col.number('wages', `${W}.colWages`, 'count', { display: moneyDisplay, minWidth: '110px' }),
  col.number('wagePerJob', `${W}.colWagePerJob`, 'count', { display: moneyDisplay, minWidth: '100px', color: emphasisColor('isRateOutlier'), bold: emphasisBold('isRateOutlier') }),
  col.number('shareOfDeptJobs', `${W}.colShareOfDeptJobs`, 'count', {
    display: (row, t, raw) => formatWorkersPercent(raw),
    minWidth: '100px',
    color: emphasisColor('isConcentrated'),
    bold: emphasisBold('isConcentrated')
  }),
  // ทอง: goldLossPercent (จากใบ slip, ติด "s") ก่อน ไม่งั้น goldDiffPercent · gemSort/ไม่มีข้อมูล = "—"
  col.number('gold', `${W}.colGold`, 'count', {
    value: (row) => resolveGoldColumnValue(row)?.percent ?? null,
    display: (row, t, raw) => formatWorkersPercent(raw),
    sup: (row) => (resolveGoldColumnValue(row)?.fromSlip ? 's' : ''),
    minWidth: '90px'
  })
]

const unpaidColumns = [
  col.planLink(),
  col.dept({ field: 'deptLabel', header: `${W}.colDept`, keyFields: ['deptKey'], withStatus: false, minWidth: '100px' }),
  col.stacked('workerCode', `${W}.colWorker`, (row) => ({ primary: row.workerCode || '—', secondary: row.workerName }), { strong: false }),
  col.date('jobDate', `${W}.unpaidColJobDate`),
  col.number('checkGram', `${W}.unpaidColCheckGram`, 'decimal', { minWidth: '100px' })
]

export const workersConfig = {
  titleKey: 'view.productionInsight.nav.workers',
  findings: { source: 'Workers' },

  sources: {
    Workers: {
      endpoint: 'ProductionInsight/Workers',
      params: (f) => ({ start: isoOrNull(f.start), end: isoOrNull(f.end), departmentKeys: f.departmentKeys, employmentTypes: f.employmentTypes })
    },
    // ยิงเมื่อคลิกแถวช่างเท่านั้น (ต้องส่ง deptKey คู่ code — ช่างคนเดียวอาจทำหลายแผนก) · เปลี่ยนช่วงเวลาตอนมีช่างที่เลือก = ยิงใหม่ 1 ครั้ง
    WorkerMonthly: {
      endpoint: 'ProductionInsight/WorkerMonthly',
      enabled: (f, s) => !!s.selectedWorker,
      params: (f, s) => ({ code: s.selectedWorker.code, deptKey: s.selectedWorker.deptKey, start: isoOrNull(f.start), end: isoOrNull(f.end) })
    }
  },

  state: {
    // ไม่ auto-select (ช่างมีหลายสิบ-ร้อยคน) · โหลด Workers ใหม่แล้วช่างที่เลือกหายไป = เคลียร์การเลือก
    selectedWorker: { initial: null, resetOn: { source: 'Workers', value: (data, current) => resolveSelectedWorker(current, data?.workers) } },
    tableDept: { initial: () => [] },
    tableType: { initial: 'ALL' }
  },

  blocks: [
    {
      type: 'kpi',
      id: 'wrkKpi',
      source: 'Workers',
      title: `${W}.kpiGroupTitle`,
      icon: 'bi-speedometer2',
      gridColumns: 4,
      asOf: (ctx) => ctx.data.Workers?.asOf,
      cards: [
        {
          id: 'wages',
          icon: 'bi-cash-stack',
          label: `${W}.kpiWagesPerMonth`,
          value: (ctx) => kpiOf(ctx).wagesPerMonth,
          format: 'money0',
          sub: (ctx, t) => buildWagesSubLabel(kpiOf(ctx), t),
          reportRef: 'wrkTrend'
        },
        {
          id: 'wagePerPlan',
          icon: 'bi-receipt',
          label: `${W}.kpiWagePerPlan`,
          value: (ctx) => kpiOf(ctx).wagePerOutputPlan,
          format: 'money0',
          sub: (ctx, t) => t(`${W}.kpiWagePerPlanSub`),
          reportRef: 'wrkTrend'
        },
        {
          id: 'activeWorkers',
          icon: 'bi-people',
          label: `${W}.kpiActiveWorkers`,
          value: (ctx) => kpiOf(ctx).activeWorkers,
          sub: (ctx, t) => buildActiveWorkersSubLabel(kpiOf(ctx), t),
          reportRef: 'wrkTable'
        },
        {
          id: 'outsideShare',
          icon: 'bi-truck',
          label: `${W}.kpiOutsideShare`,
          value: (ctx) => kpiOf(ctx).outsideWageShare,
          format: 'percent',
          reportRef: 'wrkTable'
        }
      ]
    },

    {
      type: 'trend',
      id: 'wrkTrend',
      source: 'Workers',
      title: `${W}.trendTitle`,
      icon: 'bi-graph-up-arrow',
      stacked: true,
      yFormat: 'money',
      axisTitles: [`${W}.wagesUnit`, `${W}.wagesUnit`],
      points: (ctx) => collectWageBuckets(ctx.data.Workers?.series),
      categories: (points) => formatBucketMonthLabels(points),
      series: (ctx, points, t) => buildWagesTrendSeriesDefs(ctx.data.Workers?.series, ctx.data.Workers?.seriesTotal, t, CHART_PALETTE)
    },

    {
      type: 'table',
      id: 'wrkTable',
      source: 'Workers',
      title: `${W}.tableTitle`,
      icon: 'bi-people',
      // ตัวกรองแผนก/ประเภทฝั่ง client เท่านั้น (กรองบนจอ ไม่ยิง request) — แยกชั้นจากตัวกรองหลักที่ส่งไป server
      toolbar: {
        multiselect: {
          stateKey: 'tableDept',
          placeholder: `${W}.tableFilterDept`,
          options: (ctx, t) => collectWageDeptKeys(workersOf(ctx)).map((key) => ({ value: key, label: t(`view.executive.department.${key}`) })),
          filter: (rows, value) => filterWorkersByDept(rows, value)
        },
        toggle: {
          stateKey: 'tableType',
          aria: `${W}.tableFilterType`,
          options: [{ value: 'ALL', label: 'common.label.all' }, ...WORKERS_EMPLOYMENT_TYPE_VALUES.map((value) => ({ value, label: `${W}.employmentType.${value}` }))],
          filter: (rows, value) => filterWorkersByEmploymentType(rows, value)
        }
      },
      sections: [
        { rows: (ctx) => buildWorkersTableRows(workersOf(ctx), ctx.t), columns: tableColumns, dataKey: 'rowKey' },
        { kind: 'text', tone: 'foot', text: (ctx, t) => t(`${W}.tableWageComparableNote`) }
      ],
      selectable: {
        stateKey: 'selectedWorker',
        value: (row) => ({ code: row.code, deptKey: row.deptKey, name: row.name }),
        same: (selected, row) => selected.code === row.code && selected.deptKey === row.deptKey
      },
      detail: {
        type: 'detail',
        source: 'WorkerMonthly',
        icon: 'bi-graph-up',
        selected: (ctx) => ctx.state.selectedWorker,
        title: (ctx, t, row) => t(`${W}.detailTitle`, { name: row.name }),
        trend: {
          height: 260,
          columnWidth: '45%',
          axisTitles: [`${W}.jobsUnit`, `${W}.wagesUnit`],
          points: (ctx) => ctx.data.WorkerMonthly?.series || [],
          categories: (points) => formatBucketMonthLabels(points.map((p) => p?.bucketEnd)),
          series: [
            { field: 'jobs', type: 'bar', label: `${W}.detailSeriesJobs`, color: 'primary', axis: 0, format: 'count' },
            { field: 'wages', type: 'line', label: `${W}.detailSeriesWages`, color: 'warning', axis: 1, format: 'money' }
          ]
        }
      }
    },

    {
      type: 'planTable',
      id: 'wrkUnpaid',
      title: `${W}.unpaidTitle`,
      icon: 'bi-exclamation-circle',
      accent: 'warning',
      endpoint: 'ProductionInsight/UnpaidPieceJobs',
      params: (f) => ({ start: isoOrNull(f.start), end: isoOrNull(f.end), departmentKeys: f.departmentKeys }),
      columns: unpaidColumns
    }
  ]
}

export default workersConfig
