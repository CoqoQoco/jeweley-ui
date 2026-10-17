// gold.config.js — config ของหมวด "ทองและ Loss" สำหรับ InsightPage — เทียบเท่า gold-section.vue เดิม:
// note (เมื่อทั้งหน้าเป็น "รวม") → KPI 2 แถว (ช่างฝัง 80, ช่างแต่ง 50) → Loss ตามใบงานรายแผนก (ตาราง + รายละเอียดแผนก) →
// กราฟ % ส่วนต่างทุกแผนก → ใบงานผิดปกติ → ค้างไม่รับคืน → แนวโน้มทองและ Loss (+ตั้งเป้า) → อันดับช่าง → ใบงานที่ทองเกินเกณฑ์ → งานที่ยังไม่ครบ slip
// sources: Gold + GoldByStage ยิงแยก endpoint เสมอ (draftTargets ส่งทั้งคู่พร้อมกัน เมื่อกำลังแก้เป้า) · GoldLossTargets (GET เป้าที่บันทึกจริงครบ 2 scope)
// ตารางที่เหลือยิง endpoint ของตัวเองผ่าน PlanTableBlock · metal มาจาก filter.metal (goldSectionFilter ของ index-view: รวม = ทอง)
// onSourceLoaded: ส่ง Gold.workers ขึ้น index-view (workers-loaded) ให้เติมตัวเลือกช่างในตัวกรอง
import { isoOrNull, formatBucketDayMonth } from '@/components/insight/page/insight-page-helpers.js'
import { defineAsyncComponent, markRaw } from 'vue'
import { resolveGoldLens } from '../insight-filters.js'
import { formatBucketMonthLabels } from '@/components/insight/insight-helpers.js'
import { CHART_PALETTE } from '@/services/utils/chart-colors.js'
import { formatDate } from '@/services/utils/dayjs.js'
import { useMetalScopeStore } from '@/stores/modules/ui/metal-scope-store.js'
import * as col from '@/components/insight/page/columns.js'
import {
  resolveGoldLossStatVariant,
  resolveNetMoneyVariant,
  shouldShowGoldDraftChip,
  formatOverBucketsRatio,
  formatGoldPercent,
  formatGoldCount,
  formatGoldGram,
  formatNetMoneyLabel,
  resolveGoldKpiRow
} from './gold-helpers.js'
import {
  resolveStageDiffVariant,
  filterStageSeriesByDept,
  collectStageBuckets,
  alignStageSeriesToBuckets,
  formatStagePendingWithWorker,
  formatStagePendingQueue,
  resolveDefaultStageDeptKey
} from './gold-stage-helpers.js'
import { GOLD_TARGET_PRESET_NAME } from './gold-target-preset.js'
import {
  LENS_DEPT_KEY,
  LENS_WORKER_TYPE,
  lensOfCtx,
  resolveLensWorkerTypes,
  isLensWorkerTypeLocked,
  resolveLensKpiWorkerTypes,
  resolveLensDeptKeys,
  resolveEffectiveStageDept,
  resolveEffectiveTrendWorkerType,
  filterDepartmentsByLens,
  isGoldBlockVisible,
  isGoldBlockCollapsedByDefault,
  resolveGoldSourceStrip,
  filterFindingsByLens,
  buildDeptPickerOptions
} from './gold-lens-helpers.js'
import { buildWorkerModalPayload, canOpenStageWorker } from './gold-worker-modal-helpers.js'
import GoldDeptPicker from '../components/gold-dept-picker.vue'

// import แบบ lazy — modal ยืม block config จากไฟล์นี้ (flattenBlocks(goldConfig.blocks)) จึงห้าม import ตรงๆ ให้เกิด cycle
// markRaw: config นี้ถูกส่งผ่าน data()/props ของ view ซึ่งทำให้ถูกห่อ reactive — component ใน config ห้ามถูกห่อ (Vue warn + proxy churn)
const GoldWorkerModal = markRaw(defineAsyncComponent(() => import('../components/gold-worker-modal.vue')))
const GoldDeptPickerRaw = markRaw(GoldDeptPicker)

const G = 'view.productionInsight.gold'
const HELP = 'view.productionInsight.help'
const DEPT = 'view.executive.department'

const WORKER_TYPE_ORDER = [80, 50]
const DEFAULT_METAL = 'GOLD'

const metalOf = (ctx) => ctx.filter.metal || DEFAULT_METAL
const metalLabelOf = (ctx, t) => t(`${G}.metalLabel.${metalOf(ctx)}`)
const goldOf = (ctx) => ctx.data.Gold || {}
const stageDepartmentsOf = (ctx) => ctx.data.GoldByStage?.departments || []

// ---- lens (มุมมอง) — ค่าที่ lens ล็อกชนะค่าในแผงตัวกรอง/state ของ block (ดู gold-lens-helpers.js) ----

const lensDepartmentsOf = (ctx) => filterDepartmentsByLens(stageDepartmentsOf(ctx), lensOfCtx(ctx))
const effectiveStageDeptOf = (ctx) => resolveEffectiveStageDept(lensOfCtx(ctx), ctx.state.stageDept)
const effectiveTrendWorkerTypeOf = (ctx) =>
  resolveEffectiveTrendWorkerType(lensOfCtx(ctx), ctx.state.trendWorkerType)
const sourceStripOf = (kind) => (ctx) => resolveGoldSourceStrip(kind, lensOfCtx(ctx))

// block ที่ซ่อนตาม lens (dept ซ่อนเนื้อหาระดับประเภทช่าง)
const lensVisibility = (id) => ({ visible: (ctx) => isGoldBlockVisible(id, lensOfCtx(ctx)) })

// block ที่พับตั้งต้นใน lens ภาพรวม — เปลี่ยน lens = ล้างการพับ/กางที่ผู้ใช้กดเอง
const lensCollapsible = (id) => ({
  ...lensVisibility(id),
  collapsible: true,
  collapsedByDefault: (ctx) => isGoldBlockCollapsedByDefault(id, lensOfCtx(ctx)),
  collapseResetKey: lensOfCtx
})

const NET_MONEY_COLOR = { green: 'var(--base-green)', warning: 'var(--base-warning)', grey: '' }
const netMoneyColumn = (header, minWidth) =>
  col.number('netMoney', header, 'count', {
    minWidth,
    display: (row, t) => formatNetMoneyLabel(row.netMoney, t),
    color: (row) => NET_MONEY_COLOR[resolveNetMoneyVariant(row.netMoney)],
    bold: (row) => resolveNetMoneyVariant(row.netMoney) !== 'grey'
  })

const workerTypeColumn = (header) =>
  col.text('workerTypeLabel', header, {
    minWidth: '100px',
    render: (row, t) => t(`${G}.workerType.${row.workerType}`)
  })

const redBold = { color: () => 'var(--base-red)', bold: true }

// ---- เปิด modal เจาะข้อมูลช่าง (state.workerModal) ----
// ตาราง "อันดับช่าง": แถวมี workerType เอง · ตารางช่างในรายละเอียดแผนก: อนุมานประเภทจากแผนกที่เลือก (ctx.selected) —
// แผนกที่ไม่มีประเภทช่างที่ออก slip (rawPolish/plating ฯลฯ) กดไม่ได้
const openWorkerModal = (payload, ctx) => {
  if (payload) ctx.setState('workerModal', payload)
}
const rankingWorkerClick = (row, ctx) => openWorkerModal(buildWorkerModalPayload(row), ctx)
const stageWorkerClick = (row, ctx) =>
  openWorkerModal(buildWorkerModalPayload(row, ctx.selected?.deptKey), ctx)

// ---- KPI ----

// 1 แถวการ์ดต่อประเภทช่าง (% Loss จริง เทียบยอมให้/เป้า · ทองเกินเกณฑ์ + มูลค่า · งานเข้า slip %)
const kpiRow = (workerType) => {
  const rowOf = (ctx) => resolveGoldKpiRow(goldOf(ctx).kpi, workerType)
  return {
    id: `kpi${workerType}`,
    label: `${G}.workerType.${workerType}`,
    cards: [
      {
        id: `loss${workerType}`,
        icon: 'bi-percent',
        label: `${G}.kpiLossPercent`,
        value: (ctx) => formatGoldPercent(rowOf(ctx).lossPercent),
        format: 'text',
        sub: (ctx, t) =>
          t(`${G}.kpiLossPercentSub`, {
            allowed: formatGoldPercent(rowOf(ctx).allowedPercent, false),
            target: formatGoldPercent(rowOf(ctx).targetPercent, false)
          }),
        tone: (ctx) => resolveGoldLossStatVariant(rowOf(ctx).lossPercent, rowOf(ctx).targetPercent),
        reportRef: 'goldKpi'
      },
      {
        id: `excess${workerType}`,
        icon: 'bi-exclamation-triangle',
        label: (ctx, t) => t(`${G}.kpiExcessGram`, { metal: metalLabelOf(ctx, t) }),
        value: (ctx) => formatGoldGram(rowOf(ctx).excessGram, ctx.t),
        format: 'text',
        sub: (ctx, t) =>
          t(`${G}.kpiExcessGramSub`, { money: formatGoldCount(rowOf(ctx).excessMoney) }),
        tone: (ctx) => (rowOf(ctx).excessGram > 0 ? 'warning' : 'green'),
        reportRef: 'goldOverSlips'
      },
      {
        id: `coverage${workerType}`,
        icon: 'bi-receipt',
        label: `${G}.kpiCoveragePercent`,
        value: (ctx) => formatGoldPercent(rowOf(ctx).coveragePercent),
        format: 'text',
        sub: (ctx, t) =>
          t(`${G}.kpiCoveragePercentSub`, {
            jobs: formatGoldCount(rowOf(ctx).coverageJobs),
            total: formatGoldCount(rowOf(ctx).coverageTotalJobs)
          }),
        tone: (ctx) =>
          rowOf(ctx).coveragePercent != null && rowOf(ctx).coveragePercent < 100
            ? 'warning'
            : 'green',
        reportRef: 'goldUncovered'
      }
    ]
  }
}

const KPI_ROWS = Object.fromEntries(WORKER_TYPE_ORDER.map((workerType) => [workerType, kpiRow(workerType)]))

// ---- Loss ตามใบงานรายแผนก ----

const isNotWeighed = (row) => !!row.notWeighed
// แผนกที่ไม่ได้ชั่งน้ำหนัก (notWeighed) ปล่อยเซลล์ตัวเลขว่าง (ไม่ใช่ '—')
const blankWhenNotWeighed = (row) => (isNotWeighed(row) ? '' : null)
const isOverTarget = (row) =>
  resolveStageDiffVariant(row.diffPercent, row.targetPercent) === 'warning'

const pendingLines = (row, ctx, t) => {
  const formatGram = (value) =>
    value != null ? new Intl.NumberFormat('th-TH', { maximumFractionDigits: 2 }).format(value) : '—'
  const lines = []
  if (formatStagePendingWithWorker(row, formatGoldCount, formatGram)) {
    lines.push({
      label: t(`${G}.stagePendingWithWorker`, {
        count: formatGoldCount(row.pendingWithWorkerCount),
        gram: formatGram(row.pendingWithWorkerGram)
      })
    })
  }
  if (formatStagePendingQueue(row, formatGoldCount, formatGram)) {
    lines.push({
      label: t(`${G}.stagePendingQueue`, {
        count: formatGoldCount(row.pendingQueueCount),
        gram: formatGram(row.pendingQueueGram)
      })
    })
  }
  return lines
}

const stageColumns = [
  col.text('label', `${G}.stageColDept`, {
    minWidth: '110px',
    strong: true,
    cellTip: (row, t) => (row.includesScrap ? t(`${G}.stageTrimScrapNote`) : '')
  }),
  col.number('sendGram', `${G}.stageColSend`, 'decimal', {
    tip: `${HELP}.goldStageSendGram`,
    minWidth: '90px',
    value: (row) => row.returnedSendGram,
    altText: blankWhenNotWeighed
  }),
  col.number('receivedGram', `${G}.stageColReceived`, 'decimal', {
    minWidth: '90px',
    altText: blankWhenNotWeighed
  }),
  col.number('diffGram', `${G}.stageColDiffGram`, 'decimal', {
    minWidth: '90px',
    altText: blankWhenNotWeighed
  }),
  col.percent('diffPercent', `${G}.stageColDiffPercent`, {
    tip: `${HELP}.goldStageDiffPercent`,
    minWidth: '110px',
    align: undefined,
    altText: (row, t) => (isNotWeighed(row) ? t(`${G}.stageNotWeighed`) : null),
    color: (row) => (isOverTarget(row) ? 'var(--base-red)' : ''),
    bold: isOverTarget
  }),
  col.percent('targetPercent', `${G}.stageColTarget`, {
    minWidth: '80px',
    altText: blankWhenNotWeighed
  }),
  col.percent('slipLossPercent', `${G}.stageColSlipPercent`, {
    minWidth: '100px',
    altText: blankWhenNotWeighed
  }),
  col.chipList('pending', `${G}.stageColPending`, pendingLines, {
    minWidth: '120px',
    align: 'right',
    small: true,
    altText: blankWhenNotWeighed
  })
]

const stageWorkerColumns = [
  col.text('workerCode', `${G}.workersColWorkerCode`, {
    minWidth: '100px',
    onClick: stageWorkerClick,
    actionWhen: (row, ctx) => canOpenStageWorker(row, ctx?.selected?.deptKey),
    actionTitle: `${G}.workerModal.openTitle`
  }),
  col.number('rows', `${G}.stageWorkerColRows`, 'count', { minWidth: '90px' }),
  col.number('returnedSendGram', `${G}.stageWorkerColReturned`, 'decimal', { minWidth: '110px' }),
  col.number('diffGram', `${G}.stageColDiffGram`, 'decimal', { minWidth: '90px' }),
  col.percent('diffPercent', `${G}.stageColDiffPercent`, { minWidth: '80px' })
]

const selectedStageRow = (ctx) =>
  stageDepartmentsOf(ctx).find((d) => d.deptKey === effectiveStageDeptOf(ctx)) || null

// ---- ตารางใบงาน (PlanTableBlock) ----

const workerStacked = (header, isQueueAware) =>
  col.stacked(
    'workerCode',
    header,
    (row) => ({
      primary: row.workerCode || '—',
      secondary: row.workerName,
      ...(isQueueAware && row.isQueue ? { primaryIcon: 'bi-hourglass-split', muted: true } : {})
    }),
    {
      strong: false,
      minWidth: '120px'
    }
  )

const deptColumn = (header, field = 'deptLabel') =>
  col.dept({ field, header, keyFields: ['deptKey'], withStatus: false, minWidth: '90px' })

const outlierColumns = [
  col.planLink(),
  deptColumn(`${G}.stageColDept`),
  workerStacked(`${G}.workersColWorkerCode`, false),
  col.date('date', `${G}.stageOutlierColDate`),
  col.number('sendGram', `${G}.stageColSend`, 'decimal'),
  col.number('checkGram', `${G}.stageOutlierColCheck`, 'decimal'),
  col.number('diffGram', `${G}.stageColDiffGram`, 'decimal'),
  col.percent('diffPercent', `${G}.stageColDiffPercent`, { ...redBold, minWidth: '90px' }),
  col.percent('deptMedianPercent', `${G}.stageOutlierColDeptMedian`, { minWidth: '110px' })
]

const pendingColumns = [
  col.planLink(),
  deptColumn(`${G}.stageColDept`),
  workerStacked(`${G}.workersColWorkerCode`, true),
  col.date('sentDate', `${G}.stagePendingColSentDate`),
  col.number('sendGram', `${G}.stageColSend`, 'decimal'),
  col.number('daysSince', `${G}.stagePendingColDaysSince`, 'count', { minWidth: '100px' })
]

const overSlipsColumns = [
  col.text('documentNo', `${G}.overSlipsColDocumentNo`, {
    minWidth: '120px',
    cellTip: (row, t) => (row.workerType === 80 ? t(`${G}.overSlipsSettingRowHint`) : '')
  }),
  workerTypeColumn(`${G}.overSlipsColWorkerType`),
  col.text('workerName', `${G}.overSlipsColWorker`, { minWidth: '140px' }),
  col.text('requestRange', `${G}.overSlipsColRequestRange`, {
    minWidth: '160px',
    render: (row) =>
      `${row.requestDateStart ? formatDate(row.requestDateStart) : '—'} - ${
        row.requestDateEnd ? formatDate(row.requestDateEnd) : '—'
      }`
  }),
  col.number('rawLossGram', `${G}.overSlipsColRawLoss`, 'decimal', { minWidth: '100px' }),
  col.number('allowedGram', `${G}.overSlipsColAllowedLoss`, 'decimal', { minWidth: '100px' }),
  col.number('excessGram', `${G}.overSlipsColExcessGram`, 'decimal', {
    ...redBold,
    minWidth: '90px'
  }),
  col.number('excessMoney', `${G}.overSlipsColExcessMoney`, 'count', { minWidth: '110px' }),
  netMoneyColumn(`${G}.overSlipsColNetMoney`, '140px')
]

const uncoveredColumns = [
  col.planLink(),
  deptColumn(`${G}.uncoveredColDept`, 'deptKey'),
  col.text('workerName', `${G}.uncoveredColWorker`, {
    minWidth: '150px',
    secondary: (row) => row.workerCode,
    cellTip: (row, t) => t(`${G}.uncoveredWorkerHint`)
  }),
  col.date('jobDate', `${G}.uncoveredColJobDate`, { minWidth: '100px' }),
  col.number('sendGram', `${G}.uncoveredColSendGram`, 'decimal'),
  col.number('checkGram', `${G}.uncoveredColCheckGram`, 'decimal'),
  col.number('diffGram', `${G}.uncoveredColDiffGram`, 'decimal'),
  col.number('daysSince', `${G}.uncoveredColDaysSince`, 'count')
]

const workersColumns = [
  workerTypeColumn(`${G}.workersColWorkerType`),
  col.text('workerCode', `${G}.workersColWorkerCode`, {
    minWidth: '90px',
    onClick: rankingWorkerClick,
    actionTitle: `${G}.workerModal.openTitle`
  }),
  col.text('workerName', `${G}.workersColWorkerName`, { minWidth: '140px' }),
  col.number('slipCount', `${G}.workersColSlipCount`, 'count', { minWidth: '80px' }),
  col.number('receivedGram', `${G}.workersColReceivedGram`, 'decimal', { minWidth: '100px' }),
  col.percent('lossPercent', `${G}.workersColLossPercent`, { minWidth: '90px' }),
  col.percent('allowedPercent', `${G}.workersColAllowedPercent`, { minWidth: '90px' }),
  col.percent('targetPercent', `${G}.workersColTargetPercent`, { minWidth: '80px' }),
  col.number('excessGram', `${G}.workersColExcessGram`, 'decimal', { minWidth: '90px' }),
  col.number('excessMoney', `${G}.workersColExcessMoney`, 'count', { minWidth: '110px' }),
  netMoneyColumn(`${G}.workersColNetMoney`, '140px'),
  col.text('overRatio', `${G}.workersColOverRatio`, {
    tip: `${HELP}.workersColOverRatio`,
    minWidth: '90px',
    align: 'right',
    render: (row) => formatOverBucketsRatio(row.overBuckets, row.qualifyingBuckets)
  })
]

// ---- แนวโน้มทองและ Loss ----

const selectedTrendTarget = (ctx) =>
  (goldOf(ctx).targets || []).find(
    (target) => target.workerType === effectiveTrendWorkerTypeOf(ctx)
  ) || {}

const showDraftChip = (ctx) => {
  const target = selectedTrendTarget(ctx)
  return shouldShowGoldDraftChip(
    effectiveTrendWorkerTypeOf(ctx),
    metalOf(ctx),
    target.targetPercent,
    target.source,
    ctx.data.GoldLossTargets
  )
}

const rangeBody = (f) => ({ start: isoOrNull(f.start), end: isoOrNull(f.end) })
const workerFilterBody = (f) => ({
  workerTypes: resolveLensWorkerTypes(resolveGoldLens(f.lens), f.workerTypes),
  workerCodes: f.workerCodes
})

export const goldConfig = markRaw({
  titleKey: 'view.productionInsight.nav.gold',
  findings: { source: 'Gold' },
  // finding/action ตาม lens (ดู gold-lens-helpers.js filterFindingsByLens) — ไม่แก้ที่ backend
  filterFindings: (items, filter, state) => {
    const lens = resolveGoldLens(filter.lens)
    return filterFindingsByLens(items, lens, resolveEffectiveStageDept(lens, state.stageDept))
  },
  helpParams: (filter) => ({ days: filter.olderThanDays }),

  sources: {
    Gold: {
      endpoint: 'ProductionInsight/Gold',
      params: (f, s) => ({
        ...rangeBody(f),
        bucket: f.bucket,
        ...workerFilterBody(f),
        metal: f.metal,
        draftTargets: s.draftTargets && s.draftTargets.length ? s.draftTargets : undefined
      })
    },
    GoldByStage: {
      endpoint: 'ProductionInsight/GoldByStage',
      params: (f, s) => ({
        ...rangeBody(f),
        metal: f.metal,
        draftTargets: s.draftTargets && s.draftTargets.length ? s.draftTargets : undefined
      })
    },
    GoldLossTargets: {
      endpoint: 'ProductionInsight/GoldLossTargets',
      method: 'get',
      params: () => null
    }
  },

  onSourceLoaded: (name, data, emit) => {
    if (name === 'Gold') emit('workers-loaded', data?.workers || [])
  },

  state: {
    // draft ของแผง "ตั้งเป้า Loss" — array เดียวรวม 2 scope (ส่งทั้ง Gold และ GoldByStage)
    draftTargets: { initial: () => [] },
    trendWorkerType: { initial: 80 },
    // แผนกที่เลือกดูรายละเอียด: default = แผนกที่เกินเป้ามากสุด · คงไว้ถ้ายังมีในข้อมูลใหม่ (draft preview ไม่ทำให้เด้งไปแผนกอื่น)
    stageDept: {
      initial: null,
      resetOn: {
        source: 'GoldByStage',
        value: (data, current) => {
          const departments = data?.departments || []
          return current != null && departments.some((d) => d.deptKey === current)
            ? current
            : resolveDefaultStageDeptKey(departments)
        }
      }
    },
    includeQueue: { initial: false },
    // ช่างที่เปิดใน modal เจาะข้อมูล ({ workerType, workerCode, workerName }) · null = ปิด
    workerModal: { initial: null }
  },

  blocks: [
    {
      type: 'note',
      // ทั้งหน้าเลือก "รวม" แต่แท็บนี้ดูได้ทีละโลหะ (แสดงทอง) — API บังคับ metalForced หรือ scope ของหน้าเป็น ALL
      visible: (ctx) => !!goldOf(ctx).metalForced || useMetalScopeStore().metal === 'ALL',
      text: `${G}.metalAllNote`
    },

    {
      type: 'kpi',
      id: 'goldKpi',
      source: 'Gold',
      ...lensVisibility('goldKpi'),
      sourceStrip: sourceStripOf('slip'),
      title: (ctx, t) => `${t('view.productionInsight.nav.gold')} — ${metalLabelOf(ctx, t)}`,
      icon: 'bi-gem',
      gridColumns: 3,
      asOf: (ctx) => goldOf(ctx).asOf,
      rows: (ctx) => resolveLensKpiWorkerTypes(lensOfCtx(ctx)).map((workerType) => KPI_ROWS[workerType])
    },

    {
      // ตัวเลือกแผนกของ lens dept — state.stageDept ตัวเดียวกับการคลิกแถวในตารางรายแผนก
      type: 'slot',
      id: 'goldDeptPicker',
      visible: (ctx) => lensOfCtx(ctx) === 'dept',
      component: GoldDeptPickerRaw,
      props: (ctx) => ({
        options: buildDeptPickerOptions(stageDepartmentsOf(ctx)).map((deptKey) => ({
          value: deptKey,
          label: ctx.t(`${DEPT}.${deptKey}`)
        })),
        modelValue: effectiveStageDeptOf(ctx) || ''
      }),
      events: { 'update:modelValue': (ctx, deptKey) => ctx.setState('stageDept', deptKey) }
    },

    {
      type: 'table',
      id: 'goldStage',
      source: 'GoldByStage',
      sourceStrip: 'plan',
      title: `${G}.stageTitle`,
      titleTip: `${HELP}.goldStageDefinition`,
      icon: 'bi-arrow-left-right',
      dataKey: 'deptKey',
      rows: (ctx) =>
        lensDepartmentsOf(ctx).map((d) => ({ ...d, label: ctx.t(`${DEPT}.${d.deptKey}`) })),
      columns: stageColumns,
      selectable: { stateKey: 'stageDept', current: effectiveStageDeptOf },
      detail: {
        source: 'GoldByStage',
        icon: 'bi-graph-up',
        selected: selectedStageRow,
        title: (ctx, t) =>
          t(`${G}.stageDetailTitle`, { name: t(`${DEPT}.${ctx.selected.deptKey}`) }),
        blocks: [
          {
            type: 'trend',
            bare: true,
            source: 'GoldByStage',
            height: 260,
            yFormat: 'percent2',
            points: (ctx) =>
              filterStageSeriesByDept(ctx.data.GoldByStage?.series, ctx.selected.deptKey),
            categories: (points) => formatBucketMonthLabels(points.map((p) => p.bucketEnd)),
            series: [
              { field: 'diffPercent', label: `${G}.stageSeriesDiffPercent`, color: 'primary' }
            ],
            targetLine: {
              value: (ctx) => ctx.selected.targetPercent,
              label: `${G}.stageSeriesTarget`,
              color: 'warning'
            }
          },
          {
            type: 'table',
            bare: true,
            source: 'GoldByStage',
            subtitle: `${G}.stageWorkerTitle`,
            onRowClick: stageWorkerClick,
            dataKey: 'workerCode',
            rows: (ctx) => ctx.selected.workers || [],
            columns: stageWorkerColumns
          }
        ]
      }
    },

    {
      // เส้นละแผนก (CHART_PALETTE) — แผนกที่ includesScrap (แต่ง) ซ่อนตอนเริ่ม กด legend เปิดได้
      type: 'trend',
      id: 'goldStageTrend',
      source: 'GoldByStage',
      ...lensVisibility('goldStageTrend'),
      title: (ctx, t) => {
        const locked = LENS_DEPT_KEY[lensOfCtx(ctx)]
        return locked
          ? t(`${G}.stageTrendTitleOne`, { name: t(`${DEPT}.${locked}`) })
          : t(`${G}.stageTrendTitle`)
      },
      icon: 'bi-graph-up-arrow',
      height: 300,
      yFormat: 'percent2',
      // ตัว lens ช่างฝัง/ช่างแต่งเหลือเส้นเดียว — แกน x เอาเฉพาะ bucket ของแผนกนั้น
      points: (ctx) => {
        const locked = LENS_DEPT_KEY[lensOfCtx(ctx)]
        const series = ctx.data.GoldByStage?.series
        return collectStageBuckets(locked ? filterStageSeriesByDept(series, locked) : series)
      },
      categories: (points) => formatBucketMonthLabels(points),
      series: (ctx, points, t) => {
        const visibleDepartments = lensDepartmentsOf(ctx)
        return visibleDepartments.map((d) => ({
          name: t(`${DEPT}.${d.deptKey}`),
          type: 'line',
          // สีอิงลำดับแผนกทั้งหมด (ไม่ใช่ลำดับหลังกรอง) ให้แผนกเดิมได้สีเดิมทุก lens
          colorValue: CHART_PALETTE[stageDepartmentsOf(ctx).indexOf(d)],
          data: alignStageSeriesToBuckets(
            ctx.data.GoldByStage?.series,
            d.deptKey,
            points,
            'diffPercent'
          ),
          // ซ่อนตอนเริ่มเฉพาะเมื่อมีหลายเส้น (เส้นเดียวที่ถูกซ่อน = กราฟว่าง)
          hidden: visibleDepartments.length > 1 && !!d.includesScrap
        }))
      },
      hint: (ctx, t) => (lensDepartmentsOf(ctx).length > 1 ? t(`${G}.stageTrendTrimHiddenNote`) : '')
    },

    {
      type: 'planTable',
      id: 'goldStageOutliers',
      ...lensCollapsible('goldStageOutliers'),
      title: `${G}.stageOutlierTitle`,
      icon: 'bi-exclamation-triangle',
      accent: 'warning',
      notes: [`${G}.stageOutlierCriteriaNote`],
      endpoint: 'ProductionInsight/GoldStageOutlierJobs',
      params: (f, s) => ({
        metal: f.metal,
        ...rangeBody(f),
        departmentKeys: resolveLensDeptKeys(resolveGoldLens(f.lens), s.stageDept)
      }),
      mapRows: (items, ctx, t) =>
        items.map((row) => ({ ...row, deptLabel: t(`${DEPT}.${row.deptKey}`) })),
      columns: outlierColumns
    },

    {
      type: 'planTable',
      id: 'goldStagePending',
      ...lensCollapsible('goldStagePending'),
      title: `${G}.stagePendingTitle`,
      icon: 'bi-hourglass-split',
      accent: 'warning',
      endpoint: 'ProductionInsight/GoldStagePendingReturn',
      // ซ่อนแถวคิวที่ยังไม่ได้จ่ายช่างเป็นค่าเริ่มต้น (includeQueue=false) — ติ๊กเพื่อดู
      toolbar: {
        checkbox: { stateKey: 'includeQueue', label: `${G}.stagePendingIncludeQueueToggle` }
      },
      params: (f, s) => ({
        metal: f.metal,
        ...rangeBody(f),
        departmentKeys: resolveLensDeptKeys(resolveGoldLens(f.lens), s.stageDept),
        olderThanDays: f.olderThanDays,
        includeQueue: !!s.includeQueue
      }),
      mapRows: (items, ctx, t) =>
        items.map((row) => ({ ...row, deptLabel: t(`${DEPT}.${row.deptKey}`) })),
      columns: pendingColumns
    },

    {
      type: 'trend',
      id: 'goldTrend',
      source: 'Gold',
      ...lensVisibility('goldTrend'),
      sourceStrip: sourceStripOf('slip'),
      title: `${G}.trendTitle`,
      titleTip: (ctx, t) => t(`${HELP}.goldMoneySemantics`, { metal: metalLabelOf(ctx, t) }),
      icon: 'bi-graph-up-arrow',
      columnWidth: '45%',
      axisTitles: [`${G}.gramUnit`, () => '%'],
      toolbar: {
        inline: true,
        toggle: {
          stateKey: 'trendWorkerType',
          // lens ช่างฝัง/ช่างแต่งล็อกประเภทช่างอยู่แล้ว → ซ่อนปุ่มสลับ
          visible: (ctx) => !isLensWorkerTypeLocked(lensOfCtx(ctx)),
          aria: `${G}.trendToggleAriaLabel`,
          options: WORKER_TYPE_ORDER.map((workerType) => ({
            value: workerType,
            label: `${G}.workerType.${workerType}`
          }))
        },
        hint: `${G}.trendHint`,
        chip: (ctx, t) => (showDraftChip(ctx) ? t(`${G}.targetDraftChip`) : ''),
        actions: [{ type: 'targetDrawer', preset: GOLD_TARGET_PRESET_NAME }]
      },
      points: (ctx) =>
        (goldOf(ctx).series || []).filter((p) => p.workerType === effectiveTrendWorkerTypeOf(ctx)),
      categories: (points) => points.map((p) => formatBucketDayMonth(p.bucketEnd)),
      series: (ctx, points, t) => [
        {
          name: t(`${G}.seriesRawLoss`, { metal: metalLabelOf(ctx, t) }),
          type: 'bar',
          field: 'rawLossGram',
          color: 'primary',
          axis: 0,
          format: 'gram'
        },
        {
          name: t(`${G}.seriesAllowedLoss`, { metal: metalLabelOf(ctx, t) }),
          type: 'bar',
          field: 'allowedGram',
          color: 'sub',
          axis: 0,
          format: 'gram'
        },
        {
          name: t(`${G}.seriesLossPercent`),
          type: 'line',
          field: 'lossPercent',
          color: 'red',
          axis: 1,
          format: 'percent2'
        },
        {
          name: t(`${G}.seriesAllowedPercent`),
          type: 'line',
          field: 'allowedPercent',
          color: 'green',
          axis: 1,
          dashed: true,
          format: 'percent2'
        }
      ],
      targetLine: {
        value: (ctx) => selectedTrendTarget(ctx).targetPercent,
        label: `${G}.seriesTarget`,
        color: 'warning',
        axis: 1
      }
    },

    {
      type: 'table',
      id: 'goldWorkers',
      source: 'Gold',
      ...lensCollapsible('goldWorkers'),
      sourceStrip: sourceStripOf('slip'),
      title: `${G}.workersTitle`,
      titleTip: (ctx, t) => t(`${HELP}.goldMoneySemantics`, { metal: metalLabelOf(ctx, t) }),
      icon: 'bi-people',
      emptyText: `${G}.workersEmpty`,
      onRowClick: rankingWorkerClick,
      dataKey: 'rowKey',
      rows: (ctx) => {
        const lockedType = LENS_WORKER_TYPE[lensOfCtx(ctx)]
        return (goldOf(ctx).workers || [])
          .filter((row) => lockedType === undefined || row.workerType === lockedType)
          .map((row) => ({ ...row, rowKey: `${row.workerType}-${row.workerCode}` }))
      },
      columns: workersColumns
    },

    {
      type: 'planTable',
      id: 'goldOverSlips',
      ...lensCollapsible('goldOverSlips'),
      title: (ctx, t) => t(`${G}.overSlipsTitle`, { metal: metalLabelOf(ctx, t) }),
      titleTip: (ctx, t) => t(`${HELP}.goldMoneySemantics`, { metal: metalLabelOf(ctx, t) }),
      icon: 'bi-exclamation-triangle',
      accent: 'warning',
      endpoint: 'ProductionInsight/GoldOverSlips',
      dataKey: 'slipId',
      params: (f) => ({ ...workerFilterBody(f), metal: f.metal, ...rangeBody(f) }),
      columns: overSlipsColumns
    },

    {
      type: 'planTable',
      id: 'goldUncovered',
      ...lensCollapsible('goldUncovered'),
      title: `${G}.uncoveredTitle`,
      icon: 'bi-receipt',
      accent: 'warning',
      notes: [`${G}.uncoveredRangeNote`],
      endpoint: 'ProductionInsight/GoldUncoveredJobs',
      params: (f) => ({
        ...workerFilterBody(f),
        olderThanDays: f.olderThanDays,
        metal: f.metal,
        ...rangeBody(f)
      }),
      columns: uncoveredColumns
    },

    {
      type: 'slot',
      id: 'goldWorkerModal',
      component: GoldWorkerModal,
      props: (ctx) => ({
        isShow: !!ctx.state.workerModal,
        worker: ctx.state.workerModal,
        pageFilter: ctx.filter
      }),
      events: {
        closeModal: (ctx) => ctx.setState('workerModal', null),
        'apply-filter': (ctx, patch) => {
          ctx.updateFilter(patch)
          ctx.setState('workerModal', null)
        }
      }
    }
  ]
})

export default goldConfig
