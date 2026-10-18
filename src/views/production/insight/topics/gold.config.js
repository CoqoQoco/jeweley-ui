// gold.config.js — config ของหมวด "ทองและ Loss" สำหรับ InsightPage — เทียบเท่า gold-section.vue เดิม:
// note (เมื่อทั้งหน้าเป็น "รวม") → KPI 2 แถว (ช่างฝัง 80, ช่างแต่ง 50) → Loss ตามใบงานรายแผนก (ตาราง + รายละเอียดแผนก) →
// กราฟ % ส่วนต่างทุกแผนก → ใบงานผิดปกติ → ค้างไม่รับคืน → แนวโน้มทองและ Loss (+ตั้งเป้า) → อันดับช่าง → ใบงานที่ทองเกินเกณฑ์ → งานที่ยังไม่ครบ slip
// sources: Gold + GoldByStage ยิงแยก endpoint เสมอ (draftTargets ส่งทั้งคู่พร้อมกัน เมื่อกำลังแก้เป้า) · GoldLossTargets (GET เป้าที่บันทึกจริงครบ 2 scope)
// ตารางที่เหลือยิง endpoint ของตัวเองผ่าน PlanTableBlock · metal มาจาก filter.metal (goldSectionFilter ของ index-view: รวม = ทอง)
// onSourceLoaded: ส่ง Gold.workers ขึ้น index-view (workers-loaded) ให้เติมตัวเลือกช่างในตัวกรอง
import { isoOrNull, formatBucketDayMonth } from '@/components/insight/page/insight-page-helpers.js'
import { markRaw } from 'vue'
import { formatBucketMonthLabels } from '@/components/insight/insight-helpers.js'
import { CHART_PALETTE } from '@/services/utils/chart-colors.js'
import { formatDate } from '@/services/utils/dayjs.js'
import { useMetalScopeStore } from '@/stores/modules/ui/metal-scope-store.js'
import * as col from '@/components/insight/page/columns.js'
import ToggleGroupGeneric from '@/components/generic/ToggleGroupGeneric.vue'
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
  lensOfCtx,
  resolveGoldLens,
  resolveLensWorkerTypes,
  resolveLensKpiWorkerTypes,
  resolveLensDeptKeys,
  resolveGoldSourceStrip,
  buildDeptPickerOptions
} from './gold-lens-helpers.js'
import { GOLD_DUE_TABLES, GOLD_DUE_TABLE_DEFAULT, GOLD_DUE_SCOPES, resolveGoldReportTarget } from './gold-tab-helpers.js'
import { buildWorkerModalPayload, canOpenStageWorker } from './worker-profile-helpers.js'
import { workerProfileSlot } from './worker-profile-slot.js'
import GoldDeptPicker from '../components/gold-dept-picker.vue'

// import แบบ lazy — modal ยืม block config จากไฟล์นี้ (flattenBlocks(goldConfig.blocks)) จึงห้าม import ตรงๆ ให้เกิด cycle
// markRaw: config นี้ถูกส่งผ่าน data()/props ของ view ซึ่งทำให้ถูกห่อ reactive — component ใน config ห้ามถูกห่อ (Vue warn + proxy churn)
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

// lens (scope ประเภทช่าง) ในหน้าหลักไม่มี (ไม่ใช่ตัวกรองของหน้า) — มีเฉพาะ filter ของ modal เจาะข้อมูลช่างที่ล็อกประเภทช่างด้วย lens
// (KPI เหลือแถวเดียว) · แท็บ due ใช้ state.dueScope แทน (ดู scopeOf ด้านล่าง)
const LENS_BY_TYPE = { 80: 'setting', 50: 'tang' }
const sourceStripOf = (kind) => (ctx) => resolveGoldSourceStrip(kind, lensOfCtx(ctx))

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
        reportRef: 'goldKpi',
        reportParams: { workerType }
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
        reportRef: 'goldOverSlips',
        reportParams: { workerType }
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
        reportRef: 'goldUncovered',
        reportParams: { workerType }
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
  stageDepartmentsOf(ctx).find((d) => d.deptKey === ctx.state.stageDept) || null

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

const rangeBody = (f) => ({ start: isoOrNull(f.start), end: isoOrNull(f.end) })
const workerFilterBody = (f) => ({
  workerTypes: resolveLensWorkerTypes(resolveGoldLens(f.lens), f.workerTypes),
  workerCodes: f.workerCodes
})

// ---- ตัวสร้าง block ของแท็บ (ใช้ซ้ำในแท็บช่างแต่ง/ช่างฝัง) ----

// KPI: แท็บภาพรวม = 2 แถว (rows ตาม lens — หน้าหลักไม่มี lens = ทั้ง 2 แถว, modal ใช้ lens ล็อกเหลือแถวเดียว) · แท็บช่างแต่ง/ช่างฝัง = แถวของประเภทนั้นแถวเดียว
const kpiBlock = ({ id, tab, workerType = null }) => ({
  type: 'kpi',
  id,
  tab,
  source: 'Gold',
  sourceStrip: workerType ? resolveGoldSourceStrip('slip', LENS_BY_TYPE[workerType]) : sourceStripOf('slip'),
  title: (ctx, t) => `${t('view.productionInsight.nav.gold')} — ${metalLabelOf(ctx, t)}`,
  icon: 'bi-gem',
  gridColumns: 3,
  asOf: (ctx) => goldOf(ctx).asOf,
  rows: workerType ? [KPI_ROWS[workerType]] : (ctx) => resolveLensKpiWorkerTypes(lensOfCtx(ctx)).map((type) => KPI_ROWS[type])
})

// กราฟแนวโน้มทองและ Loss ของประเภทช่างเดียว (ตั้งเป้าได้) — ไม่มีปุ่มสลับ 80/50 (ประเภทล็อกตามแท็บ)
const trendBlock = ({ id, tab, workerType }) => {
  const targetOf = (ctx) => (goldOf(ctx).targets || []).find((target) => target.workerType === workerType) || {}
  const draftChip = (ctx) => {
    const target = targetOf(ctx)
    return shouldShowGoldDraftChip(workerType, metalOf(ctx), target.targetPercent, target.source, ctx.data.GoldLossTargets)
  }
  return {
    type: 'trend',
    id,
    tab,
    source: 'Gold',
    sourceStrip: resolveGoldSourceStrip('slip', LENS_BY_TYPE[workerType]),
    title: `${G}.trendTitle`,
    titleTip: (ctx, t) => t(`${HELP}.goldMoneySemantics`, { metal: metalLabelOf(ctx, t) }),
    icon: 'bi-graph-up-arrow',
    columnWidth: '45%',
    axisTitles: [`${G}.gramUnit`, () => '%'],
    toolbar: {
      inline: true,
      hint: `${G}.trendHint`,
      chip: (ctx, t) => (draftChip(ctx) ? t(`${G}.targetDraftChip`) : ''),
      actions: [{ type: 'targetDrawer', preset: GOLD_TARGET_PRESET_NAME }]
    },
    points: (ctx) => (goldOf(ctx).series || []).filter((p) => p.workerType === workerType),
    categories: (points) => points.map((p) => formatBucketDayMonth(p.bucketEnd)),
    series: (ctx, points, t) => [
      { name: t(`${G}.seriesRawLoss`, { metal: metalLabelOf(ctx, t) }), type: 'bar', field: 'rawLossGram', color: 'primary', axis: 0, format: 'gram' },
      { name: t(`${G}.seriesAllowedLoss`, { metal: metalLabelOf(ctx, t) }), type: 'bar', field: 'allowedGram', color: 'sub', axis: 0, format: 'gram' },
      { name: t(`${G}.seriesLossPercent`), type: 'line', field: 'lossPercent', color: 'red', axis: 1, format: 'percent2' },
      { name: t(`${G}.seriesAllowedPercent`), type: 'line', field: 'allowedPercent', color: 'green', axis: 1, dashed: true, format: 'percent2' }
    ],
    targetLine: { value: (ctx) => targetOf(ctx).targetPercent, label: `${G}.seriesTarget`, color: 'warning', axis: 1 }
  }
}

// ตารางอันดับช่างของประเภทเดียว (คลิกแถว/ปุ่มรหัส = เปิด modal เจาะข้อมูลช่าง)
const rankingBlock = ({ id, tab, workerType }) => ({
  type: 'table',
  id,
  tab,
  source: 'Gold',
  sourceStrip: resolveGoldSourceStrip('slip', LENS_BY_TYPE[workerType]),
  title: `${G}.workersTitle`,
  titleTip: (ctx, t) => t(`${HELP}.goldMoneySemantics`, { metal: metalLabelOf(ctx, t) }),
  icon: 'bi-people',
  emptyText: `${G}.workersEmpty`,
  onRowClick: rankingWorkerClick,
  dataKey: 'rowKey',
  rows: (ctx) =>
    (goldOf(ctx).workers || [])
      .filter((row) => row.workerType === workerType)
      .map((row) => ({ ...row, rowKey: `${row.workerType}-${row.workerCode}` })),
  columns: workersColumns
})

// scope ของแท็บ "ใบงานที่ต้องตาม": state.dueScope (หน้าหลัก) หรือ filter.lens (modal ที่ไม่มี dueScope) — lens ชนะค่าประเภทช่างในแผงตัวกรอง
const scopeOf = (f, s) => resolveGoldLens(s?.dueScope ?? f.lens)
const scopedWorkerBody = (f, s) => ({
  workerTypes: resolveLensWorkerTypes(scopeOf(f, s), f.workerTypes),
  workerCodes: f.workerCodes
})

// ตารางใบงาน 4 อันในแท็บ due แสดงทีละอัน — dueTable เลือกอันที่ mount/ยิง request (เรียงแย่สุดก่อน)
const dueBlock = (table, node) => ({
  ...node,
  tab: 'due',
  reveal: { stateKey: 'dueTable', value: table },
  visible: (ctx) => ctx.state.dueTable === table
})

// เลือก component toggle เป็น markRaw (config ผ่าน data()/props ของ view → reactive)
const ToggleGroup = markRaw(ToggleGroupGeneric)

const dueSwitchBlock = ({ id, stateKey, values, labelOf, ariaKey }) => ({
  type: 'slot',
  id,
  tab: 'due',
  component: ToggleGroup,
  props: (ctx) => ({
    modelValue: ctx.state[stateKey],
    ariaLabel: ctx.t(ariaKey),
    options: values.map((value) => ({ value, label: ctx.t(labelOf(value)) }))
  }),
  events: { 'update:modelValue': (ctx, value) => ctx.setState(stateKey, value) }
})

export const goldConfig = markRaw({
  titleKey: 'view.productionInsight.nav.gold',
  findings: { source: 'Gold' },
  helpParams: (filter) => ({ days: filter.olderThanDays }),

  // โหมดแท็บ (opt-in) — 5 แท็บข้อมูล (แท็บคงที่ 3 อัน ปัญหา/คาดการณ์/วิธีแก้ แสดง finding ทั้งหมดของหมวด) · Gold + GoldByStage ยิงตั้งแต่โหลดหน้าเสมอ
  tabs: [
    { key: 'overview', label: `${G}.tabs.overview` },
    { key: 'tang', label: `${G}.tabs.tang` },
    { key: 'setting', label: `${G}.tabs.setting` },
    { key: 'dept', label: `${G}.tabs.dept` },
    { key: 'due', label: `${G}.tabs.due` }
  ],

  // finding / การ์ด KPI → แท็บ (ดู gold-tab-helpers.js) — คืน null = ใช้การจับคู่ block id ตามปกติ
  tabFor: (reportRef, params, ctx) => resolveGoldReportTarget(reportRef, params, stageDepartmentsOf(ctx)),

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
    // เป้าที่บันทึกจริง ใช้เฉพาะแท็บช่างแต่ง/ช่างฝัง (ชิป "ร่าง" + แผงตั้งเป้า) → ยิงเมื่อเปิดแท็บใดแท็บหนึ่งนั้น
    GoldLossTargets: {
      tab: ['tang', 'setting'],
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
    // แผนกที่เลือกดูรายละเอียดในแท็บ dept: default = แผนกที่เกินเป้ามากสุด · คงไว้ถ้ายังมีในข้อมูลใหม่ (draft preview ไม่ทำให้เด้งไปแผนกอื่น)
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
    // แท็บ due: ตารางที่แสดง (ทีละอัน) + scope ประเภทช่าง (all/setting/tang = lens เดิม)
    dueTable: { initial: GOLD_DUE_TABLE_DEFAULT },
    dueScope: { initial: 'all' },
    // ช่างที่เปิดใน modal เจาะข้อมูล ({ workerType, workerCode, workerName }) · null = ปิด
    workerModal: { initial: null }
  },

  blocks: [
    {
      type: 'note',
      tab: 'overview',
      // ทั้งหน้าเลือก "รวม" แต่แท็บนี้ดูได้ทีละโลหะ (แสดงทอง) — API บังคับ metalForced หรือ scope ของหน้าเป็น ALL
      visible: (ctx) => !!goldOf(ctx).metalForced || useMetalScopeStore().metal === 'ALL',
      text: `${G}.metalAllNote`
    },

    kpiBlock({ id: 'goldKpi', tab: 'overview' }),

    kpiBlock({ id: 'goldKpiTang', tab: 'tang', workerType: 50 }),
    trendBlock({ id: 'goldTrendTang', tab: 'tang', workerType: 50 }),
    rankingBlock({ id: 'goldWorkersTang', tab: 'tang', workerType: 50 }),

    kpiBlock({ id: 'goldKpiSetting', tab: 'setting', workerType: 80 }),
    trendBlock({ id: 'goldTrendSetting', tab: 'setting', workerType: 80 }),
    rankingBlock({ id: 'goldWorkersSetting', tab: 'setting', workerType: 80 }),

    {
      // ตัวเลือกแผนกของแท็บ dept — state.stageDept ตัวเดียวกับการคลิกแถวในตารางรายแผนก
      type: 'slot',
      id: 'goldDeptPicker',
      tab: 'dept',
      component: GoldDeptPickerRaw,
      props: (ctx) => ({
        options: buildDeptPickerOptions(stageDepartmentsOf(ctx)).map((deptKey) => ({
          value: deptKey,
          label: ctx.t(`${DEPT}.${deptKey}`)
        })),
        modelValue: ctx.state.stageDept || ''
      }),
      events: { 'update:modelValue': (ctx, deptKey) => ctx.setState('stageDept', deptKey) }
    },

    {
      type: 'table',
      id: 'goldStage',
      tab: 'dept',
      source: 'GoldByStage',
      sourceStrip: 'plan',
      title: `${G}.stageTitle`,
      titleTip: `${HELP}.goldStageDefinition`,
      icon: 'bi-arrow-left-right',
      dataKey: 'deptKey',
      rows: (ctx) => stageDepartmentsOf(ctx).map((d) => ({ ...d, label: ctx.t(`${DEPT}.${d.deptKey}`) })),
      columns: stageColumns,
      selectable: { stateKey: 'stageDept' },
      detail: {
        source: 'GoldByStage',
        icon: 'bi-graph-up',
        selected: selectedStageRow,
        title: (ctx, t) => t(`${G}.stageDetailTitle`, { name: t(`${DEPT}.${ctx.selected.deptKey}`) }),
        blocks: [
          {
            type: 'trend',
            bare: true,
            source: 'GoldByStage',
            height: 260,
            yFormat: 'percent2',
            points: (ctx) => filterStageSeriesByDept(ctx.data.GoldByStage?.series, ctx.selected.deptKey),
            categories: (points) => formatBucketMonthLabels(points.map((p) => p.bucketEnd)),
            series: [{ field: 'diffPercent', label: `${G}.stageSeriesDiffPercent`, color: 'primary' }],
            targetLine: { value: (ctx) => ctx.selected.targetPercent, label: `${G}.stageSeriesTarget`, color: 'warning' }
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
      tab: 'dept',
      source: 'GoldByStage',
      title: `${G}.stageTrendTitle`,
      icon: 'bi-graph-up-arrow',
      height: 300,
      yFormat: 'percent2',
      points: (ctx) => collectStageBuckets(ctx.data.GoldByStage?.series),
      categories: (points) => formatBucketMonthLabels(points),
      series: (ctx, points, t) =>
        stageDepartmentsOf(ctx).map((d, index) => ({
          name: t(`${DEPT}.${d.deptKey}`),
          type: 'line',
          colorValue: CHART_PALETTE[index],
          data: alignStageSeriesToBuckets(ctx.data.GoldByStage?.series, d.deptKey, points, 'diffPercent'),
          hidden: !!d.includesScrap
        })),
      hint: (ctx, t) => t(`${G}.stageTrendTrimHiddenNote`)
    },

    dueSwitchBlock({ id: 'dueSwitch', stateKey: 'dueTable', values: GOLD_DUE_TABLES, labelOf: (value) => `${G}.tabs.dueOptions.${value}`, ariaKey: `${G}.tabs.dueSwitchAria` }),
    dueSwitchBlock({ id: 'dueScopeSwitch', stateKey: 'dueScope', values: GOLD_DUE_SCOPES, labelOf: (value) => `${G}.lens.${value}`, ariaKey: `${G}.tabs.dueScopeAria` }),

    dueBlock('overSlips', {
      type: 'planTable',
      id: 'goldOverSlips',
      title: (ctx, t) => t(`${G}.overSlipsTitle`, { metal: metalLabelOf(ctx, t) }),
      titleTip: (ctx, t) => t(`${HELP}.goldMoneySemantics`, { metal: metalLabelOf(ctx, t) }),
      icon: 'bi-exclamation-triangle',
      accent: 'warning',
      endpoint: 'ProductionInsight/GoldOverSlips',
      dataKey: 'slipId',
      params: (f, s) => ({ ...scopedWorkerBody(f, s), metal: f.metal, ...rangeBody(f) }),
      columns: overSlipsColumns
    }),

    dueBlock('uncovered', {
      type: 'planTable',
      id: 'goldUncovered',
      title: `${G}.uncoveredTitle`,
      icon: 'bi-receipt',
      accent: 'warning',
      notes: [`${G}.uncoveredRangeNote`],
      endpoint: 'ProductionInsight/GoldUncoveredJobs',
      params: (f, s) => ({
        ...scopedWorkerBody(f, s),
        olderThanDays: f.olderThanDays,
        metal: f.metal,
        ...rangeBody(f)
      }),
      columns: uncoveredColumns
    }),

    dueBlock('outliers', {
      type: 'planTable',
      id: 'goldStageOutliers',
      title: `${G}.stageOutlierTitle`,
      icon: 'bi-exclamation-triangle',
      accent: 'warning',
      notes: [`${G}.stageOutlierCriteriaNote`],
      endpoint: 'ProductionInsight/GoldStageOutlierJobs',
      params: (f, s) => ({
        metal: f.metal,
        ...rangeBody(f),
        departmentKeys: resolveLensDeptKeys(scopeOf(f, s))
      }),
      mapRows: (items, ctx, t) => items.map((row) => ({ ...row, deptLabel: t(`${DEPT}.${row.deptKey}`) })),
      columns: outlierColumns
    }),

    dueBlock('pending', {
      type: 'planTable',
      id: 'goldStagePending',
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
        departmentKeys: resolveLensDeptKeys(scopeOf(f, s)),
        olderThanDays: f.olderThanDays,
        includeQueue: !!s.includeQueue
      }),
      mapRows: (items, ctx, t) => items.map((row) => ({ ...row, deptLabel: t(`${DEPT}.${row.deptKey}`) })),
      columns: pendingColumns
    })
  ],

  // อยู่นอกแท็บ — mount เสมอ เพราะ modal เจาะข้อมูลช่างเปิดได้จากหลายแท็บ (ตารางอันดับช่างแต่ง/ช่างฝัง + ตารางช่างในรายละเอียดแผนก)
  floating: [
    workerProfileSlot({
      id: 'goldWorkerModal',
      // ตัวกรองรหัสช่างของหน้าทำให้รายชื่อช่างเหลือบางคน → เทียบอันดับไม่ได้ ให้โปรไฟล์ยิงเพื่อนร่วมประเภทเอง
      peers: (ctx) => (ctx.filter.workerCodes?.length ? null : (ctx.data.Gold?.workers ?? null)),
      showApplyFilter: true
    })
  ]
})

export default goldConfig
