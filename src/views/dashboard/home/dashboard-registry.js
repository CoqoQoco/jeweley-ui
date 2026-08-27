// dashboard-registry.js — จุดเดียวที่รู้ว่า widget ไหนต้องการ permission อะไร
// index-view.vue กรอง array นี้ผ่าน PermissionService.hasAnyPermission() แล้ว render เฉพาะที่ผ่าน
//
// permissions: [] = ทุก role เห็น (gate ภายใน widget เองถ้าจำเป็น เช่น action-cards, quick-actions)
//
// ⚠️ เพิ่ม/แก้ widget = ต้องแก้ครบ 3 จุด ไม่งั้น widget โผล่แต่ไม่มีข้อมูล
//    หรือยิง API ทั้งที่ผู้ใช้ไม่มีสิทธิ์:
//      1) ไฟล์นี้                          — key + permissions + order
//      2) home/index-view.vue              — flags + widgetProps ของ key นั้น
//      3) home-dashboard-store.js          — fetch ต้องอยู่หลัง if (flags.…)
//    (.claude/hooks/remind-on-change.sh เตือนให้อัตโนมัติเมื่อแตะไฟล์กลุ่มนี้)

import { PERMISSIONS } from '@/services/permission/config.js'

import GreetingBar from './components/greeting-bar.vue'
import QuickActions from './components/quick-actions.vue'
import ActionCards from './components/action-cards.vue'
import MyJobs from './components/my-jobs.vue'
import WipByStage from './components/wip-by-stage.vue'
import CompletedTrend from './components/completed-trend.vue'
import RecentActivities from './components/recent-activities.vue'
import StockSummary from './components/stock-summary.vue'
import CustomerProductionStatus from './components/customer-production-status.vue'
import FavoriteReports from './components/favorite-reports.vue'

export const DASHBOARD_WIDGETS = [
  { key: 'greeting-bar', component: GreetingBar, permissions: [], order: 0 },
  { key: 'quick-actions', component: QuickActions, permissions: [], order: 10 },
  { key: 'action-cards', component: ActionCards, permissions: [], order: 20 },
  { key: 'my-jobs', component: MyJobs, permissions: [], order: 30 },
  { key: 'wip-by-stage', component: WipByStage, permissions: [PERMISSIONS.PRODUCTION_VIEW], order: 40 },
  { key: 'completed-trend', component: CompletedTrend, permissions: [PERMISSIONS.PRODUCTION_VIEW], order: 50 },
  { key: 'recent-activities', component: RecentActivities, permissions: [PERMISSIONS.PRODUCTION_VIEW], order: 60 },
  {
    key: 'stock-summary',
    component: StockSummary,
    permissions: [PERMISSIONS.STOCK_GEM_VIEW, PERMISSIONS.STOCK_PRODUCT],
    order: 70
  },
  {
    key: 'customer-production-status',
    component: CustomerProductionStatus,
    permissions: [PERMISSIONS.SALE_VIEW],
    order: 80
  },
  { key: 'favorite-reports', component: FavoriteReports, permissions: [PERMISSIONS.REPORT_VIEW], order: 90 }
]
