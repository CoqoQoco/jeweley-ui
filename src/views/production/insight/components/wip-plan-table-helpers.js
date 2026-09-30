// wip-plan-table-helpers.js — pure logic ใช้ร่วมกันระหว่าง wip-stale-plans-panel.vue และ
// wip-due-risk-panel.vue (คอลัมน์ "ช่าง" + คอลัมน์ "แผนก/สถานะ" ที่ไม่ซ้ำคำ + บรรทัดผู้อัปเดตล่าสุด)
// ห้าม import Vue/i18n ที่นี่ — ข้อความ fallback (เช่น "สร้างใบงาน") ให้ caller ส่ง $t(...) เข้ามาเป็น param

// ตัดรายชื่อช่างที่แสดงเหลือ maxShown คนแรก ที่เหลือสรุปเป็นตัวเลข "+n" — title คืนรายชื่อเต็มเสมอ
// (ไม่ว่าจะถูกตัดหรือไม่) ให้ caller ใส่เป็น title tooltip ของ cell
export function summarizeWorkers(workers, maxShown = 2) {
  const list = (workers || []).filter(Boolean)
  if (!list.length) return { shown: '', moreCount: 0, title: '' }
  return {
    shown: list.slice(0, maxShown).join(', '),
    moreCount: Math.max(0, list.length - maxShown),
    title: list.join(', ')
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

// ตัดสินใจว่าเลขที่ใบงานในตารางจะ render เป็นลิงก์เปิด detail (แท็บใหม่) หรือข้อความอ่านอย่างเดียว — pure
// ล้วน ไม่พึ่ง Vue Router จริง (แค่คืน route location object ให้ caller ส่งเข้า `$router.resolve()` เอง)
// เพื่อให้เทสได้โดยไม่ต้อง mock router — hasPermission ให้ caller เช็คจาก PermissionService มาก่อนแล้ว
export function resolvePlanLinkState(planId, hasPermission) {
  if (!planId || !hasPermission) {
    return { canOpen: false, routeLocation: null }
  }
  return { canOpen: true, routeLocation: { name: PLAN_DETAIL_ROUTE_NAME, params: { id: planId } } }
}
