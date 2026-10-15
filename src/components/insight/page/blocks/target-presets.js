// target-presets.js — preset ของ TargetDrawer (ตั้งค่าเป้า/มาตรฐานรายแถว: draft → preview → บันทึกพร้อมหมายเหตุ → ประวัติ)
// แต่ละ preset ผูก source/ฟังก์ชัน store/ชื่อ draft param/ข้อความ i18n — เพิ่มเป้าอื่น (เช่น เป้าส่งตรงเวลา) = เพิ่ม preset ใหม่
import { buildDraftStandardsPayload, hasDraftChanges } from '@/components/insight/lead-time-helpers.js'
import { hasStandardEditAccess } from '@/services/permission/standard-edit-access.js'
import { formatReferenceDays } from './target-drawer-helpers.js'

const W = 'view.productionInsight.wip'

export function buildSavedMap(list, keyField, valueField) {
  const map = {}
  ;(list || []).forEach((item) => {
    map[item[keyField]] = item[valueField]
  })
  return map
}

export const TARGET_PRESETS = {
  stageStandards: {
    // ชื่อ state ของ page ที่เก็บ draft (source StageLeadTime อ่านเป็น draftStandards ใน params) · source ที่เก็บค่าที่บันทึกจริง
    draftStateKey: 'draftStandards',
    savedSource: 'StageStandards',
    reloadSources: ['StageLeadTime', 'StageStandards'],
    keyField: 'deptKey',
    valueField: 'standardDays',
    min: 1,
    max: 365,
    debounceMs: 400,
    width: '440px',
    canEdit: () => hasStandardEditAccess(),
    // แถวใน drawer = แผนกของ StageLeadTime + ค่ามาตรฐานจริง/ค่าอ้างอิง (ค่ากลาง · P90)
    rows(ctx, t) {
      const saved = buildSavedMap(ctx.data.StageStandards, 'deptKey', 'standardDays')
      return (ctx.data.StageLeadTime?.departments || []).map((d) => ({
        key: d.key,
        label: t(`view.executive.department.${d.key}`),
        savedValue: saved[d.key] ?? d.standardDays,
        reference: { median: d.median?.total, p90: d.p90?.total }
      }))
    },
    savedMap: (ctx) => buildSavedMap(ctx.data.StageStandards, 'deptKey', 'standardDays'),
    emptyDraft: [],
    savedText: (row) => row.savedValue ?? '—',
    referenceText: (row, ctx, t) => t(`${W}.standardsReferenceText`, { median: formatReferenceDays(row.reference.median), p90: formatReferenceDays(row.reference.p90) }),
    buildPayload: buildDraftStandardsPayload,
    hasChanges: hasDraftChanges,
    save: (store, { items, remark }) => store.saveStageStandards({ items, remark }),
    history: (store, key) => store.fetchStageStandardHistory(key),
    historyColumns: [
      { field: 'effectiveFrom', header: `${W}.standardsHistoryColDate`, minWidth: '120px', date: true },
      { field: 'standardDays', header: `${W}.standardsHistoryColDays`, minWidth: '80px', align: 'right' },
      { field: 'createBy', header: `${W}.standardsHistoryColBy`, minWidth: '120px' },
      { field: 'remark', header: `${W}.standardsHistoryColRemark`, minWidth: '180px' }
    ],
    historyDataKey: 'effectiveFrom',
    text: {
      button: `${W}.standardsButton`,
      buttonTip: 'view.productionInsight.help.standardsButton',
      title: `${W}.standardsPanelTitle`,
      readOnly: `${W}.standardsReadOnlyNote`,
      reference: `${W}.standardsReferenceText`,
      remarkLabel: `${W}.standardsRemarkLabel`,
      remarkPlaceholder: `${W}.standardsRemarkPlaceholder`,
      remarkRequired: `${W}.standardsRemarkRequired`,
      saveBtn: `${W}.standardsSaveBtn`,
      cancelBtn: `${W}.standardsCancelDraftBtn`,
      saveSuccess: `${W}.standardsSaveSuccess`,
      historyLink: `${W}.standardsHistoryLink`,
      historyTitle: `${W}.standardsHistoryTitle`,
      historyEmpty: `${W}.standardsHistoryEmpty`
    }
  }
}

const D = 'view.productionInsight.delivery'

const percentText = (value) => (value != null ? `${new Intl.NumberFormat('th-TH', { maximumFractionDigits: 1 }).format(value)}%` : '—')

// preset ค่าเดียว (scalar) ระดับทั้งบริษัท — เป้า % ส่งตรงเวลา: แถวเดียว key 'value' ไม่มี deptKey · draft state เป็น number|null
// (null = ไม่มี draft) ส่งไปกับ source Delivery เป็น draftTargetPercent · บันทึกพร้อมหมายเหตุ (SaveDeliveryTarget)
TARGET_PRESETS.deliveryTarget = {
  mode: 'scalar',
  draftStateKey: 'draftTargetPercent',
  savedSource: 'DeliveryTarget',
  reloadSources: ['Delivery', 'DeliveryTarget'],
  min: 0,
  max: 100,
  debounceMs: 400,
  width: '400px',
  emptyDraft: null,
  canEdit: () => hasStandardEditAccess(),
  rows: (ctx, t) => [{ key: 'value', label: t(`${D}.targetLabel`), savedValue: ctx.data.DeliveryTarget?.targetPercent ?? null, reference: null }],
  savedMap: (ctx) => ({ value: ctx.data.DeliveryTarget?.targetPercent ?? null }),
  hasChanges: (draftMap, savedMap) => (draftMap.value ?? null) !== (savedMap.value ?? null),
  buildPayload: (draftMap) => draftMap.value,
  savedText: (row) => `${row.savedValue ?? '—'}%`,
  // % ตรงเวลาจริงในช่วงที่เลือกตอนนี้ (Delivery.kpi.onTimePercent) เป็นข้อความอ้างอิง
  referenceText: (row, ctx, t) => t(`${D}.targetReferenceText`, { percent: percentText(ctx.data.Delivery?.kpi?.onTimePercent) }),
  save: (store, { items, remark }) => store.saveDeliveryTarget({ targetPercent: items, remark }),
  history: (store) => store.fetchDeliveryTargetHistory(),
  historyColumns: [
    { field: 'effectiveFrom', header: `${D}.targetHistoryColDate`, minWidth: '120px', date: true },
    { field: 'targetPercent', header: `${D}.targetHistoryColPercent`, minWidth: '80px', align: 'right', suffix: '%' },
    { field: 'createBy', header: `${D}.targetHistoryColBy`, minWidth: '120px' },
    { field: 'remark', header: `${D}.targetHistoryColRemark`, minWidth: '180px' }
  ],
  historyDataKey: 'effectiveFrom',
  text: {
    button: `${D}.targetButton`,
    title: `${D}.targetPanelTitle`,
    readOnly: `${D}.targetReadOnlyNote`,
    remarkLabel: `${W}.standardsRemarkLabel`,
    remarkPlaceholder: `${D}.targetRemarkPlaceholder`,
    remarkRequired: `${W}.standardsRemarkRequired`,
    saveBtn: `${D}.targetSaveBtn`,
    cancelBtn: `${D}.targetCancelDraftBtn`,
    saveSuccess: `${D}.targetSaveSuccess`,
    historyLink: `${D}.targetHistoryLink`,
    historyTitle: `${D}.targetHistoryTitle`,
    historyEmpty: `${D}.targetHistoryEmpty`
  }
}

// preset ของ topic ที่ตั้งค่าเป้าซับซ้อน (เช่น หลายกลุ่ม/หลาย scope) ประกาศในโฟลเดอร์ topic แล้วลงทะเบียนตอน import config
// — กัน component กลางต้อง import จาก views
export function registerTargetPreset(name, preset) {
  TARGET_PRESETS[name] = preset
}

export function getTargetPreset(name) {
  return TARGET_PRESETS[name] || null
}
