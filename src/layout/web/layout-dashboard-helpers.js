// layout-dashboard-helpers.js — pure logic ของ LayoutDashboard.vue (router-view :key) — ห้าม import Vue ที่นี่
//
// router-view :key ปกติใช้ $route.fullPath (รวม query) บังคับให้ Vue destroy+remount ทั้งหน้าเมื่อ query
// เปลี่ยน (เช่น สลับ record ที่ query เป็นตัวบอก id) — แต่หน้าที่ sync state ของตัวเองลง query บ่อยๆ (เช่น
// /executive ที่ฝัง ProductionInsightView — syncStateToQuery เขียน query ทุกครั้งที่ตัวกรอง/ช่วงเวลาเปลี่ยน)
// จะโดน remount ทั้งหน้าซ้ำซ้อนเองทุกครั้งที่ query เปลี่ยน แม้เปลี่ยนจาก action ภายในหน้านั้นเอง ไม่ใช่การ
// เปลี่ยนหน้าจริง — ทำให้ endpoint ทุกตัวในหน้า (รวมตัวที่ไม่เกี่ยวกับช่วงเวลาเลยอย่าง ExecutiveReport/Summary)
// ยิงซ้ำ 2 รอบทุกครั้งที่ผู้ใช้สลับช่วง/ตัวกรอง (bug จริงที่เจอบน prod 2026-10-01)
//
// route ที่ติด meta.queryStableKey:true จึง key ด้วย path เฉยๆ (ไม่รวม query) กันปัญหานี้เฉพาะ route นั้น —
// route อื่นที่ไม่ได้ตั้ง flag นี้ยังใช้ fullPath เหมือนเดิมทุกประการ (ไม่กระทบพฤติกรรมเดิมของหน้าอื่นเลย)
export function resolveRouteViewKey(route) {
  if (!route) return ''
  return route.meta?.queryStableKey ? route.path : route.fullPath
}
