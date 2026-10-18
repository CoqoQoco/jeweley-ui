// capacity.config.js — config ของหมวด "กำลังการผลิต" สำหรับ InsightPage — เทียบเท่า capacity-section.vue เดิม:
// KPI 5 ใบ → กราฟแนวโน้ม → ตารางรายแผนก (+กราฟรายละเอียด) → แยกตามสินค้า (ตาราง + กราฟ) → บัตรต้นทุน → สำเร็จ → จำลองเพิ่ม/ลดคน
// Capacity ยิงครั้งเดียว: start/end/bucket/unit/productTypes/golds/goldSizes/breakdownBy (= serverFilterKey เดิม) ·
// departmentKeys ไม่ส่ง/ไม่ refetch (กรองฝั่ง client เท่านั้น) · unit ใบ/ชิ้น เลือก field ฝั่ง client (response มีทั้งสองชุด)
//
// กติกา field (ยืนยันจาก API agent — ดู capacity-helpers.js): "ผลิตเสร็จ" = output (ไม่ใช่ completed) · "ปิดสำเร็จ" = completed ·
// exitsSeries แยก array จาก workersSeries (alignSeriesByBucket) · คิวเทียบเท่า/แผงจำลองนับเป็นใบเสมอ
import { markRaw } from 'vue'

import { isoOrNull } from '@/components/insight/page/insight-page-helpers.js'
import { formatBucketMonthLabels, formatUnitLabel } from '@/components/insight/insight-helpers.js'
import { CHART_PALETTE } from '@/services/utils/chart-colors.js'
import * as col from '@/components/insight/page/columns.js'
import { CAPACITY_BREAKDOWN_BY_VALUES, CAPACITY_BREAKDOWN_FILTER_FIELD } from '../insight-filters.js'
import CapacityWhatIfPanel from '../components/capacity-whatif-panel.vue'
import {
  mapCapacitySeriesField,
  alignSeriesByBucket,
  resolveNetVariant,
  resolveBottleneckVariant,
  resolveCostCardVariant,
  buildBottleneckSummary,
  resolveDefaultDeptKey,
  resolveCapacitySeriesFields,
  resolveCapacityKpiValues,
  resolveCapacityDeptValues,
  buildBreakdownChartData
} from './capacity-helpers.js'

// markRaw: config ถูกส่งผ่าน data()/props ของ view (reactive) — component ใน config ห้ามถูกห่อ proxy
const WhatIfPanel = markRaw(CapacityWhatIfPanel)

const C = 'view.productionInsight.capacity'
const HELP = 'view.productionInsight.help'

const countFormat = (value) => (value != null ? new Intl.NumberFormat('th-TH').format(value) : '—')
const oneDecimal = (value) => (value != null ? new Intl.NumberFormat('th-TH', { maximumFractionDigits: 1 }).format(value) : '—')

const capacityOf = (ctx) => ctx.data.Capacity || {}
const unitOf = (ctx) => (ctx.filter.unit === 'piece' ? 'piece' : 'plan')
const unitText = (ctx, t) => t(`${C}.unitLabel.${unitOf(ctx)}`)
const unitKey = (ctx) => (unitOf(ctx) === 'piece' ? 'Piece' : 'Plan')
const departmentsOf = (ctx) => capacityOf(ctx).departments || []
const costCardOf = (ctx) => capacityOf(ctx).costCardToDone || {}

// ตัวกรองแผนกฝั่ง client — ใช้กับตารางรายแผนก/กราฟรายละเอียด/แผงจำลอง (KPI/กราฟแนวโน้มเป็นภาพรวมทั้งบริษัท ไม่กรอง)
export function filterDepartments(departments, keys) {
  return keys && keys.length ? (departments || []).filter((d) => keys.includes(d.key)) : departments || []
}

const filteredDepartments = (ctx) => filterDepartments(departmentsOf(ctx), ctx.filter.departmentKeys)

// แผนกที่ถือว่าเลือกอยู่: ค่าที่คลิกถ้ายังอยู่ในรายการที่กรองแล้ว ไม่งั้นค่า default (คอขวด/คิวยาวสุด/แถวแรก)
export function resolveEffectiveDeptKey(departments, current) {
  return current && (departments || []).some((d) => d.key === current) ? current : resolveDefaultDeptKey(departments)
}

const effectiveDeptKey = (ctx) => resolveEffectiveDeptKey(filteredDepartments(ctx), ctx.state.capDept)

export function buildDepartmentRows(departments, unit, t) {
  return (departments || []).map((d) => ({ ...d, ...resolveCapacityDeptValues(d, unit), label: t(`view.executive.department.${d.key}`) }))
}

const BREAKDOWN_METRICS = ['inflowPieces', 'outputPieces']

export function formatSignedNet(value) {
  if (value == null) return '—'
  const formatted = countFormat(Math.abs(value))
  if (!value) return formatted
  return value > 0 ? `+${formatted}` : `−${formatted}`
}

// กลุ่มที่ตั้งเป็นตัวกรองอยู่ในมิติปัจจุบัน
export function activeBreakdownKeys(filter) {
  return filter[CAPACITY_BREAKDOWN_FILTER_FIELD[filter.breakdownBy]] || []
}

// คลิกแถวกลุ่ม = ตั้งตัวกรองของมิตินั้นทั้งแท็บ (เลือกกลุ่มเดียว) — คลิกกลุ่มที่เลือกอยู่ซ้ำ = เอาออก
export function buildGroupFilterPatch(filter, key) {
  const field = CAPACITY_BREAKDOWN_FILTER_FIELD[filter.breakdownBy]
  const current = activeBreakdownKeys(filter)
  const alreadyOnly = current.length === 1 && current[0] === key
  return { [field]: alreadyOnly ? [] : [key] }
}

// ---- columns ----

const deptColumns = [
  col.dept({ field: 'label', header: `${C}.deptColDept`, keyFields: ['key'], withStatus: false, bold: true, minWidth: '110px' }),
  col.number('exits', (t, ctx) => t(`${C}.deptColExits${unitKey(ctx)}`), 'count', { minWidth: '110px' }),
  col.number('workersMedian', `${C}.deptColWorkers`, 'count', { minWidth: '90px' }),
  col.number('perWorker', (t, ctx) => t(`${C}.deptColPerWorker${unitKey(ctx)}`), 'decimal', { minWidth: '90px' }),
  col.number('waiting', `${C}.deptColWaiting`, 'count', { minWidth: '80px' }),
  col.number('working', `${C}.deptColWorking`, 'count', { minWidth: '80px' }),
  col.number('activeWip', `${C}.deptColActiveWip`, 'count', { minWidth: '90px' }),
  col.number('queueDays', `${C}.deptColQueueDays`, 'days', {
    minWidth: '140px',
    unit: `${C}.daysUnit`,
    // คิวเทียบเท่านับเป็นใบงานเสมอ — บอกใน tip เมื่อตารางโชว์หน่วยชิ้น
    tip: (ctx, t) => (unitOf(ctx) === 'piece' ? `${t(`${HELP}.capacityQueueDays`)} ${t(`${C}.deptQueuePlanNote`)}` : t(`${HELP}.capacityQueueDays`)),
    badgeTone: 'danger',
    badge: (row, t) => (row.isBottleneck ? t(row.key === 'costCard' ? `${C}.deptBottleneckCostCardChip` : `${C}.deptBottleneckChip`) : '')
  })
]

const breakdownColumns = [
  col.stacked('name', (t, ctx) => t(`${C}.breakdownBy.${ctx.filter.breakdownBy}`), (row) => ({ primary: row.name }), { minWidth: '140px' }),
  // หน่วยของกลุ่ม: PC./PR. → ชิ้น/คู่, 'mixed' → ชิ้น/คู่, ว่าง → —
  col.text('unit', `${C}.breakdownColUnit`, { minWidth: '80px', render: (row, t) => (row.unit ? formatUnitLabel(row.unit, t) : '—') }),
  col.days('inflowPiecesPerMonth', `${C}.breakdownColInflow`, { minWidth: '110px' }),
  col.days('outputPiecesPerMonth', `${C}.breakdownColOutput`, { minWidth: '110px' }),
  col.number('netPiecesPerMonth', `${C}.breakdownColNet`, 'count', {
    minWidth: '100px',
    display: (row, t, raw) => formatSignedNet(raw),
    // สุทธิ > 0 = งานเข้ามากกว่าผลิตออก (งานค้างโต) เตือนสีเหลือง · < 0 = ค้างลด สีเขียว
    color: (row) => (row.netPiecesPerMonth > 0 ? 'var(--base-warning)' : row.netPiecesPerMonth < 0 ? 'var(--base-green)' : ''),
    bold: (row) => !!row.netPiecesPerMonth
  }),
  col.days('activeWipPieces', `${C}.breakdownColActiveWipPieces`, { minWidth: '110px' }),
  col.days('activeWipPlans', `${C}.breakdownColActiveWipPlans`, { minWidth: '110px' })
]

const pendingColumns = [
  col.planLink(),
  col.mold(),
  col.product(),
  col.date('costCardDate', `${C}.costCardPendingColDate`, { minWidth: '120px' }),
  col.days('daysSinceCostCard', `${C}.costCardPendingColDays`, { minWidth: '90px' })
]

export const capacityConfig = markRaw({
  titleKey: 'view.productionInsight.nav.capacity',

  // โหมดแท็บ (opt-in) — 7 แท็บข้อมูล แต่ละแท็บมีของน้อยๆ · Capacity (findings + KPI + กราฟ + ตารางทั้งหมด) ยิงตั้งแต่โหลดหน้าเสมอ ·
  // ตารางใบงานที่รอบัตรต้นทุนเป็น planTable ของตัวเอง ยิงเมื่อเปิดแท็บ costpending
  tabs: [
    { key: 'overview', label: `${C}.tabs.overview` },
    { key: 'trend', label: `${C}.tabs.trend` },
    { key: 'dept', label: `${C}.tabs.dept` },
    { key: 'breakdown', label: `${C}.tabs.breakdown` },
    { key: 'costcard', label: `${C}.tabs.costcard` },
    { key: 'costpending', label: `${C}.tabs.costpending` },
    { key: 'whatif', label: `${C}.tabs.whatif` }
  ],
  findings: { source: 'Capacity' },

  sources: {
    Capacity: {
      endpoint: 'ProductionInsight/Capacity',
      params: (f) => ({
        start: isoOrNull(f.start),
        end: isoOrNull(f.end),
        bucket: f.bucket,
        unit: f.unit,
        productTypes: f.productTypes,
        golds: f.golds,
        goldSizes: f.goldSizes,
        breakdownBy: f.breakdownBy
      })
    }
  },

  // ตัวเลือก MultiSelect ของตัวกรองสินค้า/ทอง/Gold size มาจาก Capacity.filterOptions (ไม่สนตัวกรองสินค้า) — ส่งขึ้น index-view
  onSourceLoaded: (name, data, emit) => {
    if (name === 'Capacity' && data?.filterOptions) emit('filter-options-loaded', data.filterOptions)
  },

  state: {
    capDept: { initial: null },
    breakdownMetric: { initial: 'inflowPieces' }
  },

  blocks: [
    {
      type: 'kpi',
      id: 'capKpi',
      tab: 'overview',
      source: 'Capacity',
      title: `${C}.kpiGroupTitle`,
      titleTip: `${HELP}.capacityKpiDefinitions`,
      icon: 'bi-speedometer2',
      gridColumns: 3,
      asOf: (ctx) => capacityOf(ctx).asOf,
      cards: [
        {
          id: 'inflow',
          icon: 'bi-box-arrow-in-down',
          label: `${C}.kpiInflow`,
          value: (ctx) => resolveCapacityKpiValues(capacityOf(ctx).kpi, ctx.filter.unit).inflow,
          // หน่วยหลักเป็นใบ → ชิ้นเป็นรอง / หน่วยหลักเป็นชิ้น → ใบงานเป็นรอง
          sub: (ctx, t) => {
            const kpi = capacityOf(ctx).kpi || {}
            return unitOf(ctx) === 'piece' ? t(`${C}.kpiInflowSubPlans`, { plans: countFormat(kpi.inflowPerMonth) }) : t(`${C}.kpiInflowSub`, { pieces: countFormat(kpi.inflowPiecesPerMonth) })
          },
          reportRef: 'capTrend'
        },
        {
          id: 'output',
          icon: 'bi-box-arrow-up-right',
          label: `${C}.kpiCompleted`,
          value: (ctx) => resolveCapacityKpiValues(capacityOf(ctx).kpi, ctx.filter.unit).output,
          sub: (ctx, t) => {
            const net = resolveCapacityKpiValues(capacityOf(ctx).kpi, ctx.filter.unit).net
            if (net == null) return t(`${C}.kpiNetSubUnknown`)
            const amount = countFormat(Math.abs(net))
            return t(net > 0 ? `${C}.kpiNetSubUp` : `${C}.kpiNetSubDown`, { amount, unit: unitText(ctx, t) })
          },
          tone: (ctx) => resolveNetVariant(resolveCapacityKpiValues(capacityOf(ctx).kpi, ctx.filter.unit).net),
          reportRef: 'capTrend'
        },
        {
          id: 'backlog',
          icon: 'bi-stack',
          label: `${C}.kpiBacklog`,
          value: (ctx) => resolveCapacityKpiValues(capacityOf(ctx).kpi, ctx.filter.unit).backlogMonths,
          format: 'days',
          unit: `${C}.monthsUnit`,
          sub: (ctx, t) => t(`${C}.kpiBacklogSub`, { activeWip: countFormat(resolveCapacityKpiValues(capacityOf(ctx).kpi, ctx.filter.unit).activeWip), unit: unitText(ctx, t) }),
          reportRef: 'capDepartments'
        },
        {
          id: 'bottleneck',
          icon: 'bi-exclamation-triangle',
          label: `${C}.kpiBottleneck`,
          // จับคู่ queueDays จาก departments เต็ม (ไม่กรองตามตัวกรองแผนก) — kpi.bottleneckDepts เป็นแค่ array ของ key
          value: (ctx) => buildBottleneckSummary(capacityOf(ctx).kpi?.bottleneckDepts, departmentsOf(ctx)).length,
          sub: (ctx, t) => {
            const summary = buildBottleneckSummary(capacityOf(ctx).kpi?.bottleneckDepts, departmentsOf(ctx))
            if (!summary.length) return t(`${C}.kpiBottleneckSubNone`)
            return summary
              .map((b) => {
                const name = t(`view.executive.department.${b.key}`)
                return b.queueDays == null ? name : t(`${C}.kpiBottleneckDeptItem`, { name, days: oneDecimal(b.queueDays) })
              })
              .join(', ')
          },
          tone: (ctx) => resolveBottleneckVariant(capacityOf(ctx).kpi?.bottleneckDepts),
          reportRef: 'capDepartments'
        },
        {
          id: 'costCard',
          icon: 'bi-clipboard-check',
          label: `${C}.kpiCostCard`,
          value: (ctx) => costCardOf(ctx).medianDays,
          format: 'days',
          unit: `${C}.daysUnit`,
          sub: (ctx, t) => t(`${C}.kpiCostCardSub`, { p90: oneDecimal(costCardOf(ctx).p90Days), pending: countFormat(costCardOf(ctx).pendingNow) }),
          tone: (ctx) => resolveCostCardVariant(costCardOf(ctx).pendingOver30d),
          reportRef: 'capCostCard'
        }
      ]
    },

    {
      type: 'trend',
      id: 'capTrend',
      tab: 'trend',
      source: 'Capacity',
      title: `${C}.trendTitle`,
      icon: 'bi-graph-up-arrow',
      columnWidth: '55%',
      axisTitles: [(ctx, t) => unitText(ctx, t), (ctx, t) => unitText(ctx, t)],
      points: (ctx) => capacityOf(ctx).series || [],
      categories: (points) => formatBucketMonthLabels(points.map((p) => p.bucketEnd)),
      // ชุดข้อมูลตามหน่วย: ใบ = inflow/output/completed/activeWipEnd · ชิ้น = *Pieces (resolveCapacitySeriesFields)
      series: (ctx, points, t) => {
        const fields = resolveCapacitySeriesFields(ctx.filter.unit)
        const inflowName = unitOf(ctx) === 'piece' ? t(`${C}.seriesInflowPieces`) : t(`${C}.seriesInflow`)
        return [
          { name: inflowName, type: 'bar', color: 'primary', axis: 0, data: mapCapacitySeriesField(points, fields.inflow) },
          { name: t(`${C}.seriesCompleted`), type: 'bar', color: 'green', axis: 0, data: mapCapacitySeriesField(points, fields.output) },
          { name: t(`${C}.seriesOutput`), type: 'bar', color: 'sub', axis: 0, data: mapCapacitySeriesField(points, fields.completed) },
          { name: t(`${C}.seriesActiveWip`), type: 'line', color: 'warning', axis: 1, data: mapCapacitySeriesField(points, fields.activeWipEnd) }
        ]
      },
      hint: (ctx, t) => (unitOf(ctx) === 'piece' ? t(`${C}.trendPieceUnitHint`) : '')
    },

    {
      type: 'table',
      id: 'capDepartments',
      tab: 'dept',
      source: 'Capacity',
      title: `${C}.deptTitle`,
      titleTip: `${HELP}.capacityQueueDays`,
      icon: 'bi-diagram-3',
      notes: [`${C}.deptSelectHint`],
      rows: (ctx) => buildDepartmentRows(filteredDepartments(ctx), ctx.filter.unit, ctx.t),
      columns: deptColumns,
      dataKey: 'key',
      selectable: { stateKey: 'capDept', current: effectiveDeptKey },
      detail: {
        type: 'detail',
        source: 'Capacity',
        icon: 'bi-graph-up',
        selected: (ctx) => filteredDepartments(ctx).find((d) => d.key === effectiveDeptKey(ctx)) || null,
        title: (ctx, t, row) => t(`${C}.deptDetailTitle`, { name: t(`view.executive.department.${row.key}`) }),
        trend: {
          height: 280,
          columnWidth: '45%',
          axisTitles: [`${C}.planUnit`, `${C}.workersUnit`],
          // workersSeries = bucket หลัก, exitsSeries แยก array → จับคู่ด้วย bucketEnd (หาคู่ไม่เจอ = ช่องว่าง)
          points: (ctx) => ctx.selected.workersSeries || [],
          categories: (points) => formatBucketMonthLabels(points.map((p) => p.bucketEnd)),
          series: (ctx, points, t) => [
            { name: t(`${C}.seriesExits`), type: 'bar', color: 'primary', axis: 0, data: alignSeriesByBucket(points, ctx.selected.exitsSeries, 'exits') },
            { name: t(`${C}.seriesWorkers`), type: 'line', color: 'warning', axis: 1, data: mapCapacitySeriesField(points, 'workers') }
          ]
        }
      }
    },

    {
      group: true,
      id: 'capBreakdown',
      tab: 'breakdown',
      blocks: [
        {
          type: 'table',
          source: 'Capacity',
          title: `${C}.breakdownTitle`,
          icon: 'bi-tags',
          toolbar: {
            // มิติการแยกเป็นตัวกรองของหน้า (breakdownBy) ไม่ใช่ state — เปลี่ยนแล้ว Capacity ยิงใหม่ 1 ครั้ง
            toggle: {
              aria: `${C}.breakdownByAriaLabel`,
              options: CAPACITY_BREAKDOWN_BY_VALUES.map((value) => ({ value, label: `${C}.breakdownBy.${value}` })),
              value: (ctx) => ctx.filter.breakdownBy,
              onChange: (ctx, value) => ctx.updateFilter({ breakdownBy: value })
            }
          },
          sections: [
            { kind: 'text', tone: 'hint', text: (ctx, t) => t(`${C}.breakdownUnitNote`) },
            { kind: 'text', tone: 'hint', text: (ctx, t) => t(`${C}.breakdownClickHint`) },
            { rows: (ctx) => capacityOf(ctx).breakdown?.rows || [], columns: breakdownColumns, dataKey: 'key' }
          ],
          // แถวกลุ่มที่ตั้งเป็นตัวกรองอยู่ (activeKeys) มีพื้นหลัง highlight
          rowClass: (row, ctx) => ({ 'insight-table__row--selected': activeBreakdownKeys(ctx.filter).includes(row.key) }),
          onRowClick: (row, ctx) => ctx.updateFilter(buildGroupFilterPatch(ctx.filter, row.key))
        },
        {
          type: 'trend',
          chartType: 'bar',
          source: 'Capacity',
          title: (ctx, t) => t(`${C}.breakdownChartTitle`, { by: t(`${C}.breakdownBy.${ctx.filter.breakdownBy}`) }),
          icon: 'bi-bar-chart-line',
          stacked: true,
          legend: 'bottom',
          toolbar: {
            toggle: {
              stateKey: 'breakdownMetric',
              aria: `${C}.breakdownMetricAriaLabel`,
              options: BREAKDOWN_METRICS.map((value) => ({ value, label: `${C}.breakdownMetric.${value}` }))
            }
          },
          // top 6 กลุ่ม (ตามผลรวม metric) + "อื่น ๆ" รวมที่เหลือ เป็นแท่ง stacked รายเดือน
          points: (ctx) => buildBreakdownChartData(capacityOf(ctx).breakdown?.series, capacityOf(ctx).breakdown?.rows, ctx.state.breakdownMetric, ctx.t(`${C}.breakdownOther`)).bucketEnds,
          categories: (points) => formatBucketMonthLabels(points),
          series: (ctx) =>
            buildBreakdownChartData(capacityOf(ctx).breakdown?.series, capacityOf(ctx).breakdown?.rows, ctx.state.breakdownMetric, ctx.t(`${C}.breakdownOther`)).series.map((s, index) => ({
              name: s.name,
              type: 'bar',
              axis: 0,
              colorValue: CHART_PALETTE[index % CHART_PALETTE.length],
              data: s.data
            }))
        }
      ]
    },

    {
      group: true,
      id: 'capCostCard',
      tab: 'costcard',
      card: { title: `${C}.costCardTitle`, titleTip: `${HELP}.capacityCostCardDefinition`, icon: 'bi-clipboard-check', accent: 'main' },
      blocks: [
        {
          type: 'kpi',
          variant: 'summary',
          bare: true,
          source: 'Capacity',
          items: (ctx, t) => {
            const cc = costCardOf(ctx)
            const days = (value) => (value != null ? `${oneDecimal(value)} ${t(`${C}.daysUnit`)}` : '—')
            const hasBreakdown = cc.pendingActive != null && cc.pendingStale != null
            return [
              { label: t(`${C}.costCardMedian`), value: days(cc.medianDays) },
              { label: t(`${C}.costCardP90`), value: days(cc.p90Days) },
              {
                label: t(`${C}.costCardPendingNow`),
                value: countFormat(cc.pendingNow),
                sub: hasBreakdown ? t(`${C}.costCardPendingBreakdown`, { active: countFormat(cc.pendingActive), stale: countFormat(cc.pendingStale) }) : ''
              },
              { label: t(`${C}.costCardPendingOver30d`), value: countFormat(cc.pendingOver30d) }
            ]
          }
        },
        {
          type: 'trend',
          bare: true,
          source: 'Capacity',
          height: 280,
          columnWidth: '45%',
          axisTitles: [`${C}.planUnit`, `${C}.daysUnit`],
          points: (ctx) => costCardOf(ctx).series || [],
          categories: (points) => formatBucketMonthLabels(points.map((p) => p.bucketEnd)),
          series: [
            { field: 'count', type: 'bar', label: `${C}.costCardSeriesCount`, color: 'sub', axis: 0, format: 'count' },
            { field: 'medianDays', type: 'line', label: `${C}.costCardMedian`, color: 'primary', axis: 1, format: 'days' },
            { field: 'p90Days', type: 'line', label: `${C}.costCardP90`, color: 'warning', axis: 1, format: 'days', dashed: true }
          ]
        }
      ]
    },

    {
      // ตารางใบงานที่รอบัตรต้นทุน — แยกออกจากกลุ่ม capCostCard (ซึ่งคง id เดิมที่ API ส่งเป็น reportRef) เป็นแท็บของตัวเอง
      type: 'planTable',
      id: 'capCostPending',
      tab: 'costpending',
      title: `${C}.costCardPendingTableTitle`,
      icon: 'bi-hourglass-split',
      endpoint: 'ProductionInsight/CostCardPendingPlans',
      params: () => ({}),
      columns: pendingColumns
    },

    {
      // แผงจำลองเพิ่ม/ลดคน = เครื่องมือ (ไม่มี finding ลิงก์มา) — ใช้ข้อมูล Capacity ที่โหลดอยู่แล้ว
      type: 'slot',
      id: 'capWhatIf',
      tab: 'whatif',
      component: WhatIfPanel,
      props: (ctx) => ({ departments: filteredDepartments(ctx), loading: !!ctx.loading.Capacity })
    }
  ]
})

export default capacityConfig
