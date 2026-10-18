// gold-tab-helpers.js — pure logic ของโหมดแท็บในหมวด "ทองและ Loss" (ห้าม import Vue/i18n): ค่าคงที่ของแท็บ "ใบงานที่ต้องตาม" +
// ตัวแปลง finding / การ์ด KPI → แท็บปลายทาง (config.tabFor) — pattern เดียวกับที่หมวดอื่น (เช่น workers) นำไปใช้ได้: คืน { tab, reveal[], anchor? }
//
// ตารางการกระโดด (ref + params.workerType / params.deptKey):
//   goldKpi      + workerType 80/50 → แท็บ setting/tang (การ์ดแถวของประเภทนั้น) · ไม่มี workerType → overview
//   goldTrend    + workerType 80/50 → setting/tang (กราฟของประเภทนั้น) · ไม่มี → setting (ช่างฝังเป็นแถวแรกของ KPI)
//   goldWorkers  + workerType 80/50 → setting/tang (ตารางอันดับ) · ไม่มี → setting
//   goldStage    + deptKey (มีในข้อมูล) → dept และตั้ง stageDept = deptKey · ไม่มี/ไม่รู้จัก → dept (แผนกที่เลือกอยู่)
//   goldOverSlips / goldUncovered / goldStageOutliers / goldStagePending → due, dueTable = ตารางนั้น,
//     dueScope = จาก workerType (80 → setting, 50 → tang) ไม่มี → all (ตั้งทุกครั้ง กันค่าค้างจากการกระโดดก่อนหน้า)
export const GOLD_DUE_TABLES = ['overSlips', 'uncovered', 'outliers', 'pending']
export const GOLD_DUE_TABLE_DEFAULT = GOLD_DUE_TABLES[0]
export const GOLD_DUE_SCOPES = ['all', 'setting', 'tang']

const DUE_TABLE_BY_REF = { goldOverSlips: 'overSlips', goldUncovered: 'uncovered', goldStageOutliers: 'outliers', goldStagePending: 'pending' }
const TAB_BY_WORKER_TYPE = { 80: 'setting', 50: 'tang' }
const SUFFIX_BY_TAB = { setting: 'Setting', tang: 'Tang' }

export function parseWorkerType(params) {
  const value = Number(params?.workerType)
  return value === 80 || value === 50 ? value : null
}

export function resolveGoldReportTarget(reportRef, params = {}, departments = []) {
  const workerType = parseWorkerType(params)
  const typeTab = workerType ? TAB_BY_WORKER_TYPE[workerType] : null

  if (reportRef === 'goldKpi') {
    return typeTab ? { tab: typeTab, anchor: `goldKpi${SUFFIX_BY_TAB[typeTab]}` } : { tab: 'overview' }
  }
  if (reportRef === 'goldTrend' || reportRef === 'goldWorkers') {
    const tab = typeTab || 'setting'
    return { tab, anchor: `${reportRef}${SUFFIX_BY_TAB[tab]}` }
  }
  if (reportRef === 'goldStage') {
    const deptKey = params?.deptKey
    const valid = typeof deptKey === 'string' && (departments || []).some((d) => d.deptKey === deptKey)
    return { tab: 'dept', reveal: valid ? [{ stateKey: 'stageDept', value: deptKey }] : [] }
  }
  if (DUE_TABLE_BY_REF[reportRef]) {
    return {
      tab: 'due',
      reveal: [
        { stateKey: 'dueTable', value: DUE_TABLE_BY_REF[reportRef] },
        { stateKey: 'dueScope', value: typeTab || 'all' }
      ]
    }
  }
  return null
}
