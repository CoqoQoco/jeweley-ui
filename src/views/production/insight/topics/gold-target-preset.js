// gold-target-preset.js — preset `goldLossTargets` ของ TargetDrawer (ปุ่ม "ตั้งเป้า Loss" ของหมวดทองและ Loss)
// เทียบเท่า gold-target-panel.vue เดิม: 2 กลุ่มในแผงเดียว — (1) เป้า % Loss ตามใบ slip ต่อ (ประเภทช่าง, โลหะ) 4 แถว scope='SLIP'
// (2) เป้าตามแผนก (จ่าย − รับ) ต่อ (แผนก, โลหะ) 6 แถว scope='STAGE' — จัดกลุ่มย่อยตามโลหะ (ทอง → เงิน)
// draft = array เดียวรวม 2 scope (ส่งทั้ง Gold และ GoldByStage พร้อมกันเสมอ) · บันทึกครั้งเดียวรวม items 2 scope (SaveGoldLossTargets)
// key ของแถว = `${scope}:${workerType}-${metal}` (ไม่ซ้ำข้าม scope) · field ชื่อ workerType เสมอไม่ว่า scope ไหน (STAGE = รหัสแผนก 60/80/90)
import { hasStandardEditAccess } from '@/services/permission/standard-edit-access.js'
import { registerTargetPreset } from '@/components/insight/page/blocks/target-presets.js'
import {
  buildGoldDraftTargetsPayload,
  buildGoldTargetKey,
  hasGoldDraftChanges
} from './gold-helpers.js'
import {
  STAGE_TARGET_WORKER_TYPE_ORDER,
  resolveStageTargetDeptKey,
  buildGoldStageDraftTargetsPayload
} from './gold-stage-helpers.js'

const G = 'view.productionInsight.gold'
const W = 'view.productionInsight.wip'

export const GOLD_TARGET_PRESET_NAME = 'goldLossTargets'

const SLIP_WORKER_TYPE_ORDER = [80, 50]
const METAL_ORDER = ['GOLD', 'SILVER']
const SLIP_PREFIX = 'SLIP:'
const STAGE_PREFIX = 'STAGE:'

const percentText = (value) =>
  value != null
    ? `${new Intl.NumberFormat('th-TH', { maximumFractionDigits: 2 }).format(value)}%`
    : '—'

// แยก draft/saved map ที่ key มี prefix scope ออกเป็น map ของแต่ละ scope (key เดิม `${workerType}-${metal}`)
export function pickScopeMap(map, prefix) {
  const result = {}
  Object.entries(map || {}).forEach(([key, value]) => {
    if (key.startsWith(prefix)) result[key.slice(prefix.length)] = value
  })
  return result
}

function savedMapOf(targets, scope) {
  const map = {}
  ;(targets || [])
    .filter((target) => (target.scope ?? 'SLIP') === scope)
    .forEach((target) => {
      map[buildGoldTargetKey(target.workerType, target.metal)] = target.targetPercent
    })
  return map
}

function withPrefix(map, prefix) {
  const result = {}
  Object.entries(map).forEach(([key, value]) => {
    result[`${prefix}${key}`] = value
  })
  return result
}

export function buildGoldTargetSavedMap(ctx) {
  const targets = ctx.data.GoldLossTargets
  return {
    ...withPrefix(savedMapOf(targets, 'SLIP'), SLIP_PREFIX),
    ...withPrefix(savedMapOf(targets, 'STAGE'), STAGE_PREFIX)
  }
}

// ข้อความอ้างอิง "ตอนนี้จริง" มีเฉพาะแถวของโลหะที่หน้ากำลังดูอยู่ (Gold.kpi / GoldByStage.departments เป็นของโลหะเดียว)
export function buildGoldTargetRows(ctx, t) {
  const saved = buildGoldTargetSavedMap(ctx)
  const activeMetal = ctx.filter.metal
  const metalLabel = (metal) => t(`${G}.metalLabel.${metal}`)

  const slipRows = METAL_ORDER.flatMap((metal) =>
    SLIP_WORKER_TYPE_ORDER.map((workerType) => {
      const key = `${SLIP_PREFIX}${buildGoldTargetKey(workerType, metal)}`
      const label = t(`${G}.workerType.${workerType}`)
      return {
        key,
        scope: 'SLIP',
        workerType,
        metal,
        section: t(`${G}.targetSlipSectionTitle`),
        group: metalLabel(metal),
        label,
        historyLabel: `${label} — ${metalLabel(metal)}`,
        savedValue: saved[key] ?? null,
        currentPercent:
          metal === activeMetal
            ? (ctx.data.Gold?.kpi || []).find((k) => k.workerType === workerType)?.lossPercent ??
              null
            : null
      }
    })
  )

  const stageRows = METAL_ORDER.flatMap((metal) =>
    STAGE_TARGET_WORKER_TYPE_ORDER.map((workerType) => {
      const key = `${STAGE_PREFIX}${buildGoldTargetKey(workerType, metal)}`
      const deptKey = resolveStageTargetDeptKey(workerType)
      const label = t(`view.executive.department.${deptKey}`)
      return {
        key,
        scope: 'STAGE',
        workerType,
        metal,
        section: t(`${G}.targetStageSectionTitle`),
        group: metalLabel(metal),
        label,
        historyLabel: `${label} — ${metalLabel(metal)}`,
        savedValue: saved[key] ?? null,
        currentPercent:
          metal === activeMetal
            ? (ctx.data.GoldByStage?.departments || []).find((d) => d.deptKey === deptKey)
                ?.diffPercent ?? null
            : null
      }
    })
  )

  return [...slipRows, ...stageRows]
}

// บันทึก: items ทุกแถวที่เป็นตัวเลขของทั้ง 2 scope (SLIP ก่อน STAGE)
export function buildGoldTargetSavePayload(draftMap) {
  return [
    ...buildGoldDraftTargetsPayload(pickScopeMap(draftMap, SLIP_PREFIX)),
    ...buildGoldStageDraftTargetsPayload(pickScopeMap(draftMap, STAGE_PREFIX))
  ]
}

// preview (draft ที่ส่งไป Gold/GoldByStage): เฉพาะ scope ที่ถูกแก้จากค่าที่บันทึก — ทั้งสองถูกส่งไปทั้ง 2 endpoint เหมือนเดิม
export function buildGoldTargetDraftPayload(draftMap, savedMap) {
  const slipChanged = hasGoldDraftChanges(
    pickScopeMap(draftMap, SLIP_PREFIX),
    pickScopeMap(savedMap, SLIP_PREFIX)
  )
  const stageChanged = hasGoldDraftChanges(
    pickScopeMap(draftMap, STAGE_PREFIX),
    pickScopeMap(savedMap, STAGE_PREFIX)
  )
  return [
    ...(slipChanged ? buildGoldDraftTargetsPayload(pickScopeMap(draftMap, SLIP_PREFIX)) : []),
    ...(stageChanged ? buildGoldStageDraftTargetsPayload(pickScopeMap(draftMap, STAGE_PREFIX)) : [])
  ]
}

export const GOLD_LOSS_TARGETS_PRESET = {
  draftStateKey: 'draftTargets',
  savedSource: 'GoldLossTargets',
  reloadSources: ['Gold', 'GoldByStage', 'GoldLossTargets'],
  min: 0,
  max: 100,
  debounceMs: 400,
  width: '440px',
  emptyDraft: [],
  canEdit: () => hasStandardEditAccess(),
  rows: buildGoldTargetRows,
  savedMap: buildGoldTargetSavedMap,
  savedText: (row) => `${row.savedValue ?? '—'}%`,
  referenceText: (row, ctx, t) =>
    row.currentPercent != null
      ? t(`${G}.targetReferenceText`, { percent: percentText(row.currentPercent) })
      : '',
  hasChanges: hasGoldDraftChanges,
  buildPayload: buildGoldTargetSavePayload,
  buildDraftPayload: buildGoldTargetDraftPayload,
  save: (store, { items, remark }) => store.saveGoldLossTargets({ items, remark }),
  history: (store, key, row) =>
    store.fetchGoldLossTargetHistory(row.workerType, row.metal, row.scope),
  historyColumns: [
    { field: 'effectiveFrom', header: `${G}.targetHistoryColDate`, minWidth: '120px', date: true },
    {
      field: 'targetPercent',
      header: `${G}.targetHistoryColPercent`,
      minWidth: '80px',
      align: 'right',
      suffix: '%'
    },
    { field: 'createBy', header: `${G}.targetHistoryColBy`, minWidth: '120px' },
    { field: 'remark', header: `${G}.targetHistoryColRemark`, minWidth: '180px' }
  ],
  historyDataKey: 'effectiveFrom',
  text: {
    button: `${G}.targetButton`,
    title: `${G}.targetPanelTitle`,
    readOnly: `${G}.targetReadOnlyNote`,
    remarkLabel: `${W}.standardsRemarkLabel`,
    remarkPlaceholder: `${W}.standardsRemarkPlaceholder`,
    remarkRequired: `${W}.standardsRemarkRequired`,
    saveBtn: `${G}.targetSaveBtn`,
    cancelBtn: `${G}.targetCancelDraftBtn`,
    saveSuccess: `${G}.targetSaveSuccess`,
    historyLink: `${G}.targetHistoryLink`,
    historyTitle: `${G}.targetHistoryTitle`,
    historyEmpty: `${G}.targetHistoryEmpty`
  }
}

registerTargetPreset(GOLD_TARGET_PRESET_NAME, GOLD_LOSS_TARGETS_PRESET)
