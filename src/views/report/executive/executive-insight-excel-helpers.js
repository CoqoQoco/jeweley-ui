// executive-insight-excel-helpers.js — pure row builders ของ 7 sheet "Production Insight" ที่เพิ่มต่อท้าย
// "Excel ทั้งหมด" ของหน้า /executive (สรุปปัญหา/เวลาผลิตรายแผนก/ส่งงานช้า/กำลังการผลิต/ทองและ Loss/
// ช่างและค่าแรง/วัตถุดิบ) — ห้าม import Vue/Pinia/i18n ที่นี่: ทุกฟังก์ชันรับ `t` (ฟังก์ชันแปล เช่น $t) มาจาก caller
// เพื่อเทสได้ด้วย stub — ข้อความ label อยู่ใต้ `view.executive.excel.insight.*`
//
// ตัวเลขตามธรรมเนียม sheet เดิมของไฟล์นี้: gram/percent = toFixed(2) string, เงิน = formatMoneyFull, วัน = ปัด 1
// ตำแหน่ง, จำนวนนับ = number ตรงๆ; ค่า null = '' (ช่องว่าง) ไม่ coerce เป็น 0
import { formatDate } from '@/services/utils/dayjs.js'
import { resolveFindingParams } from '@/components/insight/insight-helpers.js'
import { resolvePlanWorkersDisplay } from '@/views/production/insight/components/wip-plan-table-helpers.js'
import { resolveGemName, resolveGemShapeName, resolveGemStatusLabelKey } from '@/views/production/insight/components/materials-helpers.js'
import { formatOverBucketsRatio } from '@/views/production/insight/components/gold-helpers.js'
import { resolveGoldColumnValue, sortWorkersByWagesDesc } from '@/views/production/insight/components/workers-helpers.js'
import { formatMoneyFull } from './executive-helpers.js'

export const INSIGHT_EXCEL_TOPICS = ['wip', 'delivery', 'capacity', 'gold', 'workers', 'materials']

const PREFIX = 'view.executive.excel.insight'
const RULES_PREFIX = 'view.productionInsight.rules'

const label = (t, key) => t(`${PREFIX}.${key}`)

function gram(value) {
  return value != null ? Number(value).toFixed(2) : ''
}

function days(value) {
  return value != null ? Number(Number(value).toFixed(1)) : ''
}

function count(value) {
  return value != null ? value : ''
}

function money(value) {
  return value != null ? formatMoneyFull(value) : ''
}

function date(value) {
  return value ? formatDate(value) : ''
}

function deptName(t, key) {
  return key ? t(`view.executive.department.${key}`) : ''
}

function yesOrEmpty(t, flag) {
  return flag ? label(t, 'yes') : ''
}

function planNo(row) {
  return row?.woText || row?.woNumber || row?.wo || ''
}

function productText(row) {
  return [row?.productNumber, row?.productName].filter(Boolean).join(' ')
}

function workerNames(row) {
  return resolvePlanWorkersDisplay(row, Infinity).allNames.join(', ')
}

// "ช่วงเวลา: 01/07/2026 – 30/09/2026" — ใช้เป็นหัวบอกช่วงเวลาของทุก sheet ใหม่
export function formatExcelRangeText(t, start, end) {
  if (!start || !end) return label(t, 'rangeLabel')
  return `${label(t, 'rangeLabel')}: ${formatDate(start)} – ${formatDate(end)}`
}

// แถวบอกช่วงเวลา (texts เป็น string หรือ array) + แถวว่างคั่น — ใส่บนสุดของ sheet แบบตารางเดียวที่ใช้หัวคอลัมน์จริง
export function buildRangeLeadRows(texts, firstKey) {
  const list = (Array.isArray(texts) ? texts : [texts]).filter(Boolean)
  return [...list.map((text) => ({ [firstKey]: text })), {}]
}

// sheet "สรุปปัญหา" รวม 6 หมวดที่แต่ละหมวดมีช่วงเวลาของตัวเอง: ทุกหมวดช่วงเดียวกัน = บรรทัดเดียว ไม่งั้นบรรทัดละหมวด
export function buildTopicRangeTexts(entries, t) {
  const texts = (entries || []).map((e) => ({ key: e.key, text: formatExcelRangeText(t, e.start, e.end) }))
  const distinct = [...new Set(texts.map((e) => e.text))]
  if (distinct.length <= 1) return distinct
  return texts.map((e) => `${t(`view.productionInsight.nav.${e.key}`)} - ${e.text}`)
}

// positional key c1..cN สำหรับ sheet หลายบล็อก (KPI + ตาราง / 2 ตาราง) — block = ชื่อบล็อก + หัวคอลัมน์ + แถว +
// แถวว่างคั่น ทุกค่าเป็น string/number
export function buildBlockRows(title, headers, rows) {
  const toRow = (cells) => Object.fromEntries(cells.map((cell, i) => [`c${i + 1}`, cell]))
  return [toRow([title]), toRow(headers), ...rows.map(toRow), {}]
}

export function buildPositionalColumns(rangeText, width) {
  return Array.from({ length: width }, (_, i) => ({ header: i === 0 ? rangeText : '', key: `c${i + 1}` }))
}

// ---- ข้อความ finding/action: ใช้ i18n + resolveFindingParams เดียวกับ insight-tab-layout.vue ----
export function renderInsightText(t, code, params) {
  const resolved = resolveFindingParams(
    params,
    (key) => t(`view.executive.department.${key}`),
    (workerType) => t(`view.productionInsight.gold.workerType.${workerType}`),
    (metal) => t(`view.productionInsight.gold.metalLabel.${metal}`),
    code === 'ACT_TALK_WORKER' ? 5 : undefined
  )
  return t(`${RULES_PREFIX}.${code}`, resolved)
}

// ---- 1. สรุปปัญหา ----
// topics: [{ key: 'wip'|..., problems, forecasts, actions }] — response ของ endpoint หลักของแต่ละหมวด
export function buildInsightFindingsExcelRows(topics, t) {
  const rows = []
  ;(topics || []).forEach((topic) => {
    const topicLabel = t(`view.productionInsight.nav.${topic.key}`)
    const pushFinding = (kind, finding) =>
      rows.push({
        topic: topicLabel,
        kind: label(t, `kind.${kind}`),
        severity: finding.severity ? label(t, `severity.${finding.severity}`) : '',
        text: renderInsightText(t, finding.code, finding.params),
        owner: ''
      })
    ;(topic.problems || []).forEach((f) => pushFinding('problem', f))
    ;(topic.forecasts || []).forEach((f) => pushFinding('forecast', f))
    ;(topic.actions || []).forEach((action) =>
      rows.push({
        topic: topicLabel,
        kind: label(t, 'kind.action'),
        severity: '',
        text: renderInsightText(t, action.code, action.params),
        owner: action.ownerRole ? t(`view.productionInsight.ownerRole.${action.ownerRole}`) : ''
      })
    )
  })
  return rows
}

// ---- 2. เวลาผลิตรายแผนก (StageLeadTime.departments + StageLeadTime.capacity.departments จับคู่ด้วย key) ----
export function buildStageLeadTimeExcelRows(leadDepartments, capacityDepartments, t) {
  const capacityByKey = new Map((capacityDepartments || []).map((d) => [d.key, d]))
  return (leadDepartments || []).map((d) => {
    const cap = capacityByKey.get(d.key)
    return {
      dept: deptName(t, d.key),
      standard: count(d.standardDays),
      medianTotal: days(d.median?.total),
      p90: days(d.p90?.total),
      wait: days(d.median?.wait),
      work: days(d.median?.work),
      overStandardPercent: d.overStandardPercent != null ? Number(d.overStandardPercent).toFixed(2) : '',
      exited: count(d.exitedCount),
      currentWaiting: count(d.currentWaitingCount),
      abnormal: count(d.abnormalCount),
      activeWip: count(cap?.activeWip),
      queueDaysCurrent: days(cap?.queueDaysCurrent),
      queueDaysAtStandard: days(cap?.queueDaysAtStandard),
      bottleneck: yesOrEmpty(t, cap?.isBottleneckCurrent)
    }
  })
}

// ---- 3. ส่งงานช้า (DeliveryAtRiskPlans ทั้งหมด + DeliveryLatePlans ในช่วง) ----
export function buildDeliveryPlansExcelRows(atRiskRows, lateRows, t) {
  const atRisk = (atRiskRows || []).map((row) => ({
    type: label(t, 'deliveryTypeAtRisk'),
    wo: planNo(row),
    product: productText(row),
    dueDate: date(row.requestDate),
    finishDate: date(row.projectedFinishDate),
    lateDays: count(row.projectedLateDays),
    dept: deptName(t, row.currentDeptKey),
    workers: workerNames(row)
  }))
  const late = (lateRows || []).map((row) => ({
    type: label(t, 'deliveryTypeLate'),
    wo: planNo(row),
    product: productText(row),
    dueDate: date(row.requestDate),
    finishDate: date(row.doneDate),
    lateDays: count(row.lateDays),
    dept: '',
    workers: workerNames(row)
  }))
  return [...atRisk, ...late]
}

// ---- 4. กำลังการผลิต (KPI block + ตารางรายแผนก) ----
export const CAPACITY_EXCEL_WIDTH = 8

export function buildCapacityExcelRows(kpi, costCardToDone, departments, t) {
  const k = kpi || {}
  const cc = costCardToDone || {}
  const bottleneckNames = (k.bottleneckDepts || []).map((key) => deptName(t, key)).join(', ')
  const kpiRows = [
    [label(t, 'capKpiInflow'), count(k.inflowPerMonth)],
    [label(t, 'capKpiInflowPieces'), count(k.inflowPiecesPerMonth)],
    [label(t, 'capKpiOutput'), count(k.outputPerMonth)],
    [label(t, 'capKpiNet'), count(k.netPerMonth)],
    [label(t, 'capKpiBacklogMonths'), days(k.backlogMonths)],
    [label(t, 'capKpiActiveWip'), count(k.activeWip)],
    [label(t, 'capKpiBottleneck'), bottleneckNames],
    [label(t, 'capKpiCostCardMedian'), days(cc.medianDays)],
    [label(t, 'capKpiCostCardP90'), days(cc.p90Days)],
    [label(t, 'capKpiCostCardPending'), count(cc.pendingNow)]
  ]
  const deptRows = (departments || []).map((d) => [
    deptName(t, d.key),
    count(d.exitsPerMonth),
    count(d.workersMedian),
    d.plansPerWorker != null ? Number(Number(d.plansPerWorker).toFixed(2)) : '',
    count(d.waitingNow),
    count(d.workingNow),
    days(d.queueDays),
    yesOrEmpty(t, d.isBottleneck)
  ])
  return [
    ...buildBlockRows(label(t, 'capBlockKpi'), [label(t, 'colItem'), label(t, 'colValue')], kpiRows),
    ...buildBlockRows(
      label(t, 'capBlockDepartments'),
      [
        label(t, 'colDept'),
        label(t, 'capColExits'),
        label(t, 'capColWorkers'),
        label(t, 'capColPlansPerWorker'),
        label(t, 'capColWaiting'),
        label(t, 'capColWorking'),
        label(t, 'capColQueueDays'),
        label(t, 'colBottleneck')
      ],
      deptRows
    )
  ]
}

// ---- 5. ทองและ Loss (ช่าง GOLD + GoldByStage.departments) ----
export const GOLD_EXCEL_WIDTH = 12

export function buildGoldExcelRows(workers, stageDepartments, t) {
  const workerRows = (workers || []).map((w) => [
    t(`view.productionInsight.gold.workerType.${w.workerType}`),
    w.workerCode || '',
    w.workerName || '',
    count(w.slipCount),
    gram(w.receivedGram),
    gram(w.lossPercent),
    gram(w.allowedPercent),
    gram(w.targetPercent),
    gram(w.excessGram),
    money(w.excessMoney),
    money(w.netMoney),
    formatOverBucketsRatio(w.overBuckets, w.qualifyingBuckets)
  ])
  const stageRows = (stageDepartments || []).map((d) => {
    const dept = deptName(t, d.deptKey)
    if (d.notWeighed) return [dept, label(t, 'goldNotWeighed'), '', '', '', '', '', '', '']
    return [
      dept,
      gram(d.returnedSendGram),
      gram(d.receivedGram),
      gram(d.diffGram),
      gram(d.diffPercent),
      gram(d.targetPercent),
      gram(d.slipLossPercent),
      d.pendingWithWorkerCount ? `${d.pendingWithWorkerCount} / ${gram(d.pendingWithWorkerGram)}` : '',
      d.pendingQueueCount ? `${d.pendingQueueCount} / ${gram(d.pendingQueueGram)}` : ''
    ]
  })
  return [
    ...buildBlockRows(
      label(t, 'goldBlockWorkers'),
      [
        label(t, 'goldColWorkerType'),
        label(t, 'colWorkerCode'),
        label(t, 'colWorkerName'),
        label(t, 'goldColSlipCount'),
        label(t, 'goldColReceivedGram'),
        label(t, 'goldColLossPercent'),
        label(t, 'goldColAllowedPercent'),
        label(t, 'goldColTargetPercent'),
        label(t, 'goldColExcessGram'),
        label(t, 'goldColExcessMoney'),
        label(t, 'goldColNetMoney'),
        label(t, 'goldColOverRatio')
      ],
      workerRows
    ),
    ...buildBlockRows(
      label(t, 'goldBlockStage'),
      [
        label(t, 'colDept'),
        label(t, 'goldColSendGram'),
        label(t, 'goldColReceivedGram'),
        label(t, 'goldColDiffGram'),
        label(t, 'goldColDiffPercent'),
        label(t, 'goldColTargetPercent'),
        label(t, 'goldColSlipPercent'),
        label(t, 'goldColPendingWorker'),
        label(t, 'goldColPendingQueue')
      ],
      stageRows
    )
  ]
}

// ---- 6. ช่างและค่าแรง (Workers.workers เรียงค่าแรงมาก→น้อย) ----
export function buildWorkersExcelRows(workers, t) {
  return sortWorkersByWagesDesc(workers).map((w) => {
    const goldColumn = resolveGoldColumnValue(w)
    return {
      name: w.name || '',
      code: w.code || '',
      dept: deptName(t, w.deptKey),
      employmentType: t(`view.productionInsight.workers.employmentType.${w.employmentType || 'UNKNOWN'}`),
      jobs: count(w.jobs),
      plans: count(w.plans),
      wages: money(w.wages),
      wagePerJob: money(w.wagePerJob),
      shareOfDeptJobs: w.shareOfDeptJobs != null ? Number(w.shareOfDeptJobs).toFixed(1) : '',
      gold: goldColumn ? gram(goldColumn.percent) : ''
    }
  })
}

// ---- 7. วัตถุดิบ (MaterialWaitingPlans ทั้งหมด) ----
export function formatGemLine(gem, masterGem, masterGemShape, t) {
  const metal = gem.metal ? t(`view.productionInsight.gold.metalLabel.${gem.metal}`) : ''
  const parts = [resolveGemName(masterGem, gem.gem), resolveGemShapeName(masterGemShape, gem.shape), gem.size, metal].filter(Boolean)
  const status =
    gem.status === 'short'
      ? t('view.productionInsight.materials.gemStatusShortWithAvailable', { available: gem.available ?? 0 })
      : t(`view.productionInsight.materials.gemStatus.${resolveGemStatusLabelKey(gem.status, gem.unmatchedReason)}`)
  return `${parts.join(' ')} ×${gem.qty ?? ''} [${status}]`
}

export function buildMaterialsWaitingExcelRows(rows, masterGem, masterGemShape, t) {
  return (rows || []).map((row) => ({
    wo: planNo(row),
    product: productText(row),
    waitingDays: count(row.waitingDays),
    gems: (row.gems || []).map((gem) => formatGemLine(gem, masterGem, masterGemShape, t)).join('; '),
    gemStatus: row.gemStatus ? t(`view.productionInsight.materials.gemStatus.${resolveGemStatusLabelKey(row.gemStatus)}`) : '',
    dueDate: date(row.dueDate)
  }))
}
