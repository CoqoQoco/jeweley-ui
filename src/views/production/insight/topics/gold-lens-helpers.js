// gold-lens-helpers.js — pure logic ของ "scope ประเภทช่าง" (lens) ในหมวด "ทองและ Loss" — ห้าม import Vue/i18n
//
// lens: all (ทั้งหมด) | setting (ช่างฝัง, worker type 80 ↔ แผนก 'setting') | tang (ช่างแต่ง, worker type 50 ↔ แผนก 'trim')
// ตอนนี้ lens ไม่ใช่ตัวกรองของหน้าแล้ว: ใช้ 2 ที่ — (1) scope ในแท็บ "ใบงานที่ต้องตาม" (state.dueScope) และ (2) filter ของ modal เจาะข้อมูลช่าง
// (buildWorkerModalFilter ตั้ง lens ตามประเภทช่าง) · แผนก rawPolish/plating ไม่ใช่ช่างฝัง/ช่างแต่ง
export const GOLD_LENS_VALUES = ['all', 'setting', 'tang']
export const GOLD_LENS_DEFAULT = 'all'

export function resolveGoldLens(value) {
  return GOLD_LENS_VALUES.includes(value) ? value : GOLD_LENS_DEFAULT
}

export const LENS_WORKER_TYPE = { setting: 80, tang: 50 }
export const LENS_DEPT_KEY = { setting: 'setting', tang: 'trim' }

const KPI_WORKER_TYPE_ORDER = [80, 50]

export function lensOfCtx(ctx) {
  return resolveGoldLens(ctx?.filter?.lens)
}

// ประเภทช่างที่ส่งเข้า endpoint: lens ช่างฝัง/ช่างแต่งชนะค่าในแผงตัวกรอง ไม่งั้นใช้ค่าจากแผง (string → number)
export function resolveLensWorkerTypes(lens, drawerWorkerTypes = []) {
  const locked = LENS_WORKER_TYPE[lens]
  if (locked !== undefined) return [locked]
  return (drawerWorkerTypes || []).map(Number)
}

// แถว KPI ที่แสดง: all = ทั้ง 2 แถว (ช่างฝังก่อน), setting/tang = แถวเดียว
export function resolveLensKpiWorkerTypes(lens) {
  const locked = LENS_WORKER_TYPE[lens]
  return locked !== undefined ? [locked] : [...KPI_WORKER_TYPE_ORDER]
}

// แผนกที่ lens ผูกไว้ (setting → ['setting'], tang → ['trim'], all → [] = ทุกแผนก)
export function resolveLensDeptKeys(lens) {
  const locked = LENS_DEPT_KEY[lens]
  return locked ? [locked] : []
}

// deptKey ที่แสดงในตัวเลือกแผนก — gemSort ที่ไม่ได้ชั่งน้ำหนัก (notWeighed, ไม่มีตัวเลขให้ดู) ไม่แสดง
export function buildDeptPickerOptions(departments) {
  return (departments || []).filter((d) => !(d.deptKey === 'gemSort' && d.notWeighed)).map((d) => d.deptKey)
}

// ต้นทางข้อมูลของแถบ SourceStripGeneric: PLAN (stage) หรือ SLIP — slip แยกช่างฝัง/ช่างแต่งเมื่อรู้ประเภทช่าง
export function resolveGoldSourceStrip(kind, lens) {
  if (kind === 'plan') return 'plan'
  if (lens === 'setting') return 'slip-setter'
  if (lens === 'tang') return 'slip-tang'
  return 'slip'
}
