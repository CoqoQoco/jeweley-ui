// dashboard-registry.js — จุดเดียวที่รู้ว่า widget ไหนต้องการ permission อะไร
// index-view.vue กรอง array นี้ผ่าน PermissionService.hasAnyPermission() แล้ว render เฉพาะที่ผ่าน
//
// permissions: [] = ทุก role เห็น (gate ภายใน widget เองถ้าจำเป็น เช่น action-cards, quick-actions)
//
// 2026-09-08: ถอด widget ข้อมูลออกชั่วคราว เหลือแค่ greeting-bar ตามคำสั่ง — ไฟล์ widget อื่น
// (quick-actions, action-cards, my-jobs, wip-by-stage, completed-trend, recent-activities,
// stock-summary, customer-production-status, favorite-reports) ยังอยู่ครบใน home/components/
// เผื่อเอากลับมาใช้ หน้านี้จะถูกเปลี่ยนเป็นหน้าประกาศข่าว (announcement) ต่อไป
//
// ⚠️ เพิ่ม/แก้ widget = ต้องแก้ครบ 3 จุด ไม่งั้น widget โผล่แต่ไม่มีข้อมูล
//    หรือยิง API ทั้งที่ผู้ใช้ไม่มีสิทธิ์:
//      1) ไฟล์นี้                          — key + permissions + order
//      2) home/index-view.vue              — flags + widgetProps ของ key นั้น
//      3) home-dashboard-store.js          — fetch ต้องอยู่หลัง if (flags.…)
//    (.claude/hooks/remind-on-change.sh เตือนให้อัตโนมัติเมื่อแตะไฟล์กลุ่มนี้)

import GreetingBar from './components/greeting-bar.vue'

export const DASHBOARD_WIDGETS = [{ key: 'greeting-bar', component: GreetingBar, permissions: [], order: 0 }]
