// gold-lens-helpers.js — pure logic ของ "มุมมอง (lens)" ในหมวด "ทองและ Loss" (ProductionInsight gold)
// ห้าม import Vue/i18n ที่นี่ (เหมือน gold-helpers.js / gold-stage-helpers.js)
//
// lens: all (ภาพรวม) | setting (ช่างฝัง, worker type 80 ↔ แผนก 'setting') | tang (ช่างแต่ง, worker type 50 ↔ แผนก 'trim')
// | dept (แยกตามแผนก) — แผนก rawPolish/plating ไม่ใช่ช่างฝัง/ช่างแต่ง จึงเห็นเฉพาะ lens all และ dept
import { GOLD_LENS_DEFAULT, resolveGoldLens } from '../insight-filters.js'

export const LENS_WORKER_TYPE = { setting: 80, tang: 50 }
export const LENS_DEPT_KEY = { setting: 'setting', tang: 'trim' }

const KPI_WORKER_TYPE_ORDER = [80, 50]

// block ที่ซ่อนใน lens dept (เนื้อหาเป็นระดับประเภทช่าง ไม่ใช่ระดับแผนก)
const HIDDEN_IN_DEPT_LENS = ['goldKpi', 'goldStageTrend', 'goldTrend', 'goldWorkers', 'goldOverSlips', 'goldUncovered']

// block ที่พับตั้งต้นใน lens all (รายละเอียดเชิงลึก เปิดดูเมื่ออยากรู้)
const COLLAPSED_IN_ALL_LENS = ['goldStageOutliers', 'goldStagePending', 'goldWorkers', 'goldOverSlips', 'goldUncovered']

export function lensOfCtx(ctx) {
  return resolveGoldLens(ctx?.filter?.lens)
}

// ประเภทช่างที่ส่งเข้า endpoint: lens ช่างฝัง/ช่างแต่ง ชนะค่าในแผงตัวกรอง ไม่งั้นใช้ค่าจากแผง (string → number)
export function resolveLensWorkerTypes(lens, drawerWorkerTypes = []) {
  const locked = LENS_WORKER_TYPE[lens]
  if (locked !== undefined) return [locked]
  return (drawerWorkerTypes || []).map(Number)
}

export function isLensWorkerTypeLocked(lens) {
  return LENS_WORKER_TYPE[lens] !== undefined
}

// แถว KPI ที่แสดง: all = ทั้ง 2 แถว, setting/tang = แถวเดียว, dept = ไม่มี (block ถูกซ่อนอยู่แล้ว)
export function resolveLensKpiWorkerTypes(lens) {
  if (lens === 'dept') return []
  const locked = LENS_WORKER_TYPE[lens]
  return locked !== undefined ? [locked] : [...KPI_WORKER_TYPE_ORDER]
}

// แผนกที่ lens ผูกไว้ (setting → ['setting'], tang → ['trim']) · lens dept = แผนกที่เลือกอยู่ · all = [] (ทุกแผนก)
export function resolveLensDeptKeys(lens, selectedDept) {
  const locked = LENS_DEPT_KEY[lens]
  if (locked) return [locked]
  if (lens === 'dept' && selectedDept) return [selectedDept]
  return []
}

// แผนกที่เลือกอยู่จริง: lens ช่างฝัง/ช่างแต่งล็อกแผนกของตัวเอง ไม่งั้นใช้ที่ผู้ใช้คลิก (state.stageDept)
export function resolveEffectiveStageDept(lens, stateDept) {
  return LENS_DEPT_KEY[lens] || stateDept || null
}

// ประเภทช่างของกราฟแนวโน้ม: lens ล็อกได้ ไม่งั้นตามปุ่ม toggle (state.trendWorkerType)
export function resolveEffectiveTrendWorkerType(lens, stateWorkerType) {
  return LENS_WORKER_TYPE[lens] ?? stateWorkerType
}

// แผนกที่ตารางรายแผนก/กราฟทุกแผนกแสดง — setting/tang เหลือแผนกเดียว, all/dept ครบทุกแผนก
export function filterDepartmentsByLens(departments, lens) {
  const locked = LENS_DEPT_KEY[lens]
  return (departments || []).filter((d) => !locked || d.deptKey === locked)
}

export function isGoldBlockVisible(blockId, lens) {
  return !(lens === 'dept' && HIDDEN_IN_DEPT_LENS.includes(blockId))
}

export function isGoldBlockCollapsedByDefault(blockId, lens) {
  return lens === GOLD_LENS_DEFAULT && COLLAPSED_IN_ALL_LENS.includes(blockId)
}

// ---- findings (ปัญหา/คาดการณ์/วิธีแก้) ตาม lens ----
// finding/action บอกว่าเกี่ยวกับใครผ่าน params: workerType (เลข 50/80) หรือ deptKey (string) — ที่ไม่มีทั้งคู่ (รวมทุกแผนก/
// topDeptKey/workerType 0) ถือเป็น "ทั่วไป" และคงไว้เสมอ (จัดประเภทไม่ได้ = ไม่ซ่อนเงียบๆ)
//   setting/tang → เหลือเฉพาะ workerType 80/50 หรือ deptKey setting/trim + ทั่วไป
//   dept → ตัด workerType (เป็นเรื่องประเภทช่าง) เหลือ deptKey ของแผนกที่เลือก (ยังไม่เลือก = ทุกแผนก) + ทั่วไป
//   all → ไม่กรอง
export function classifyFinding(item) {
  const params = item?.params || {}
  const workerType = Number(params.workerType)
  if (Number.isFinite(workerType) && workerType > 0) return { kind: 'workerType', value: workerType }
  if (typeof params.deptKey === 'string' && params.deptKey) return { kind: 'dept', value: params.deptKey }
  return { kind: 'generic', value: null }
}

export function filterFindingsByLens(items, lens, selectedDept) {
  const list = items || []
  if (lens === 'all' || !lens) return list
  const lockedType = LENS_WORKER_TYPE[lens]
  const lockedDept = LENS_DEPT_KEY[lens]
  return list.filter((item) => {
    const { kind, value } = classifyFinding(item)
    if (kind === 'generic') return true
    if (lockedType !== undefined) return kind === 'workerType' ? value === lockedType : value === lockedDept
    if (kind === 'workerType') return false
    return !selectedDept || value === selectedDept
  })
}

// deptKey ที่แสดงในตัวเลือกแผนกของ lens dept — gemSort ที่ไม่ได้ชั่งน้ำหนัก (notWeighed, ไม่มีตัวเลขให้ดู) ไม่แสดง
export function buildDeptPickerOptions(departments) {
  return (departments || [])
    .filter((d) => !(d.deptKey === 'gemSort' && d.notWeighed))
    .map((d) => d.deptKey)
}

// ต้นทางข้อมูลของแถบ SourceStripGeneric: PLAN (stage) หรือ SLIP — slip แยกช่างฝัง/ช่างแต่งเมื่อ lens ล็อกประเภทช่าง
export function resolveGoldSourceStrip(kind, lens) {
  if (kind === 'plan') return 'plan'
  if (lens === 'setting') return 'slip-setter'
  if (lens === 'tang') return 'slip-tang'
  return 'slip'
}
