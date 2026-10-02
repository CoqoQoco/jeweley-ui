// wip-plan-table-helpers.js — pure logic ใช้ร่วมกันระหว่างตาราง plan ทุกตัวในหมวด insight (wip-stale/
// wip-due-risk/wip-abnormal-dwell/delivery-at-risk — คอลัมน์ "ช่าง" ใช้ผ่าน plan-workers-cell.vue +
// resolvePlanWorkersDisplay) — มีคอลัมน์ "แผนก/สถานะ" ที่ไม่ซ้ำคำ + บรรทัดผู้อัปเดตล่าสุดด้วย
// ห้าม import Vue/i18n ที่นี่ — ข้อความ fallback (เช่น "สร้างใบงาน") ให้ caller ส่ง $t(...) เข้ามาเป็น param

const DEFAULT_MAX_WORKER_ITEMS = 3

// รวมข้อมูลช่างของแถวตาราง plan ให้เป็นรูปแบบเดียวกันเสมอ ไม่ว่า API จะส่ง `workerItems`
// ([{code,name,isQueue}], field ใหม่ ยืนยันจาก API agent 2026-10-01) หรือยังส่งแค่ `workers` (เดิม, string[]
// ล้วนไม่มี code/isQueue — คงอยู่เป็น fallback) — ใช้ workerItems ก่อนเสมอถ้ามีและไม่ว่าง ไม่งั้น fallback ไป
// ครอบ workers เป็น shape เดียวกัน (code:null, isQueue:false ทุกตัว) — เรียงช่างจริง (isQueue=false) ไว้ก่อน
// รายการรอคิว (isQueue=true) เสมอไม่ว่าลำดับเดิมจาก API จะเป็นอย่างไร แล้วตัดเหลือ maxShown รายการแรก ที่เหลือ
// สรุปเป็นตัวเลข moreCount — allNames คืนรายชื่อเต็มเรียงลำดับเดียวกัน (ไม่ตัด) ให้ caller ใช้ทำ title tooltip
export function resolvePlanWorkersDisplay(data, maxShown = DEFAULT_MAX_WORKER_ITEMS) {
  const items =
    Array.isArray(data?.workerItems) && data.workerItems.length
      ? data.workerItems.filter(Boolean)
      : (data?.workers || []).filter(Boolean).map((name) => ({ code: null, name, isQueue: false }))

  const real = items.filter((w) => !w.isQueue)
  const queued = items.filter((w) => w.isQueue)
  const ordered = [...real, ...queued]

  return {
    shown: ordered.slice(0, maxShown),
    moreCount: Math.max(0, ordered.length - maxShown),
    allNames: ordered.map((w) => w.name).filter(Boolean)
  }
}

// คืนชื่อสถานะเฉพาะเมื่อ "ต่างจาก" ชื่อแผนก (กันโชว์ซ้ำคำ เช่น "ออกแบบ / ออกแบบ") — คืนค่าว่างเมื่อไม่มี
// สถานะ หรือสถานะซ้ำกับชื่อแผนกเป๊ะ (caller ใช้ค่าว่างเพื่อไม่ render บรรทัดที่ 2 เลย)
export function resolveStatusLine(departmentLabel, statusName) {
  if (!statusName) return ''
  return statusName !== departmentLabel ? statusName : ''
}

// บรรทัดที่ 2 ของคอลัมน์ "อัปเดตล่าสุด" — "{ผู้อัปเดต} · {การทำรายการ}" (lastAction ว่าง = ยังไม่มี
// ประวัติสถานะ ใช้ createdFallbackLabel ที่ caller แปลมาแล้วแทน เช่น "สร้างใบงาน")
export function buildLastActionLine(lastUpdateBy, lastAction, createdFallbackLabel) {
  const who = lastUpdateBy || '—'
  const action = lastAction || createdFallbackLabel
  return `${who} · ${action}`
}

export const PLAN_DETAIL_ROUTE_NAME = 'plan-order-tracking-detail'
export const EXECUTIVE_PLAN_DETAIL_ROUTE_NAME = 'executive-plan-detail'

// ตัดสินใจว่าเลขที่ใบงานในตารางจะ render เป็นลิงก์เปิด detail (แท็บใหม่) หรือข้อความอ่านอย่างเดียว — pure
// ล้วน ไม่พึ่ง Vue Router จริง (แค่คืน route location object ให้ caller ส่งเข้า `$router.resolve()` เอง)
// เพื่อให้เทสได้โดยไม่ต้อง mock router — canEdit/canViewExecutive ให้ caller เช็คจาก PermissionService มาก่อนแล้ว
// ลำดับความสำคัญ: มี production:edit → detail ตัวเต็ม (แก้ไขได้) ชนะเสมอ, ไม่มี edit แต่มี executive:view
// (boss) → detail แบบอ่านอย่างเดียว, ไม่มีทั้งคู่ → ไม่มีลิงก์
export function resolvePlanLinkState(planId, canEdit, canViewExecutive) {
  if (!planId) return { canOpen: false, routeLocation: null }
  if (canEdit) return { canOpen: true, routeLocation: { name: PLAN_DETAIL_ROUTE_NAME, params: { id: planId } } }
  if (canViewExecutive) return { canOpen: true, routeLocation: { name: EXECUTIVE_PLAN_DETAIL_ROUTE_NAME, params: { id: planId } } }
  return { canOpen: false, routeLocation: null }
}
