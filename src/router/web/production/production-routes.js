const Layout = () => import('@/layout/web/LayoutDashboard.vue')
const ProductionDashboard = () => import('@/views/production/dashboard/index-view.vue')
const PlanOrder = () => import('@/views/production/plan-create/index-view.vue')
const PlanGoldOrder = () => import('@/views/production/plan-gold/index-view.vue')
const PlanGoldTracking = () => import('@/views/production/plan-tracking-gold/index-view.vue')
const PlanOrderTracking = () => import('@/views/production/plan-tracking/index-view.vue')
const PlanOrderTrackingStatus = () =>
  import('@/views/production/plan-tracking-status/index-view.vue')
const PlanOrderTrackingWorker = () =>
  import('@/views/production/plan-tracking-worker/index-view.vue')
const PlanOrderTrackingView = () => import('@/views/production/plan-view/index-view.vue')
const PlanOrderTransferTracking = () =>
  import('@/views/production/plan-tracking-transfer/index-view.vue')
//const ReportProduction = () => import('@/views/report-production/IndexView.vue')
//const ReportProductionGoldCost = () => import('@/views/report-production-gold-cost/IndexView.vue')

const PlanBOMReport = () => import('@/views/production/plan-bom/index-view.vue')
const PlanOrderPrice = () => import('@/views/production/plan-price/IndexView.vue')

import { PERMISSIONS } from '@/services/permission/config.js'
const routes = [
  {
    path: '/production',
    component: Layout,
    redirect: '/production-dashboard',
    name: 'prodution',
    meta: {
      Displayname: {
        en: 'Production Plan',
        th: 'งานผลิต'
      },
      classIcon: 'bi bi-hammer',
      majorShow: true,
      btsubLineShow: true,
      permissions: [PERMISSIONS.PRODUCTION_VIEW]
    },
    children: [
      {
        path: '/production-dashboard',
        name: 'production-dashboard',
        component: ProductionDashboard,
        meta: {
          Displayname: {
            en: 'Dashboard',
            th: 'แดชบอร์ด'
          },
          minorShow: true,
          permissions: [PERMISSIONS.PRODUCTION_VIEW]
        }
      },
      {
        path: '/plan-order',
        name: 'plan-order',
        component: PlanOrder,
        meta: {
          Displayname: {
            en: 'Plan Order',
            th: 'สร้างแผนงานผลิต'
          },
          minorShow: true,
          permissions: [PERMISSIONS.PRODUCTION_CREATE]
        }
      },
      {
        path: '/plan-gold-order',
        name: 'gold-gold-picking',
        component: PlanGoldOrder,
        meta: {
          Displayname: {
            en: 'Plan Gold Order',
            th: 'สร้างใบเบิกผสมทอง'
          },
          minorShow: true,
          permissions: [PERMISSIONS.PRODUCTION_CREATE]
        }
      },
      {
        path: '/plan-order-tracking',
        name: 'plan-order-tracking',
        component: PlanOrderTracking,
        meta: {
          Displayname: {
            en: 'Plan Order Tracking',
            th: 'ติดตามแผนงานผลิต'
          },
          minorShow: true,
          permissions: [PERMISSIONS.PRODUCTION_VIEW]
        }
      },
      {
        path: '/plan-order-transfer-tracking',
        name: 'plan-order-transfer-tracking',
        component: PlanOrderTransferTracking,
        meta: {
          Displayname: {
            en: 'Plan Order Transfer Tracking',
            th: 'ติดตามแผนโอนงาน'
          },
          minorShow: true,
          permissions: [PERMISSIONS.PRODUCTION_VIEW]
        }
      },
      {
        path: '/plan-order-tracking-view/:id',
        name: 'plan-order-tracking-view',
        component: PlanOrderTracking,
        meta: {
          Displayname: {
            en: 'Plan Order Tracking',
            th: 'ติดตามใบจ่าย-รับคืนงาน'
          },
          minorShow: false,
          permissions: [PERMISSIONS.PRODUCTION_EDIT]
        }
      },
      {
        path: '/plan-order-price-view/:id',
        name: 'plan-order-price-view',
        component: PlanOrderPrice,
        meta: {
          Displayname: {
            en: 'Plan Order Pirce',
            th: 'ประเมินราคาใบจ่าย-รับคืนงาน'
          },
          minorShow: false,
          permissions: [PERMISSIONS.PRODUCTION_EDIT]
        }
      },
      {
        path: '/plan-order-tracking-update/:id',
        name: 'plan-order-tracking-detail',
        component: PlanOrderTrackingView,
        meta: {
          Displayname: {
            en: 'Plan Detail',
            th: 'รายละเอียดงานผลิต'
          },
          minorShow: false,
          permissions: [PERMISSIONS.PRODUCTION_EDIT]
        }
      },
      {
        path: '/plan-order-status-tracking',
        name: 'plan-order-status-tracking',
        component: PlanOrderTrackingStatus,
        meta: {
          Displayname: {
            en: 'Plan Order Status Tracking',
            th: 'ตรวจสอบสถานะงาน'
          },
          minorShow: true,
          permissions: [PERMISSIONS.PRODUCTION_VIEW]
        }
      },
      {
        path: '/plan-order-worker-status-tracking',
        name: 'plan-order-worker-status-tracking',
        component: PlanOrderTrackingWorker,
        meta: {
          Displayname: {
            en: 'Plan Order Worker Status Tracking',
            th: 'ตรวจสอบสถานะช่าง'
          },
          minorShow: true,
          permissions: [PERMISSIONS.PRODUCTION_VIEW]
        }
      },
      {
        path: '/plan-gold-tracking',
        name: 'plan-gold-tracking',
        component: PlanGoldTracking,
        meta: {
          Displayname: {
            en: 'Plan Gold Tracking',
            th: 'ติดตามงานเบิกผสมทอง'
          },
          minorShow: true,
          permissions: [PERMISSIONS.PRODUCTION_VIEW]
        }
      },
      {
        path: '/plan-bom-report',
        name: 'plan-bom-report',
        component: PlanBOMReport,
        meta: {
          Displayname: {
            en: 'Plan BOM Tracking',
            th: 'รายงานวัถุดิบ'
          },
          minorShow: true,
          permissions: [PERMISSIONS.PRODUCTION_VIEW]
        }
      /* The `// report` section in the JavaScript code is a commented-out block of code that contains
      routes for generating production reports. These routes are currently disabled because they are
      commented out using `//`. This means that the routes for generating production reports are not
      active in the application at the moment. */
      },

      // report
      // {
      //   path: '/report-production',
      //   name: 'report-production',
      //   component: ReportProduction,
      //   meta: {
      //     Displayname: {
      //       en: 'Production Plan Report',
      //       th: 'รายงานผลิต'
      //     },
      //     minorShow: true,
      //     permissions: [PERMISSIONS.PRODUCTION_VIEW]
      //   }
      // },
      // {
      //   path: '/report-production-plan-gold',
      //   name: 'report-production-plan-gold',
      //   component: ReportProductionGoldCost,
      //   meta: {
      //     Displayname: {
      //       en: 'Plan Gold Report',
      //       th: 'รายงานใบเบิกผสมทอง'
      //     },
      //     minorShow: true,
      //     permissions: [PERMISSIONS.PRODUCTION_VIEW]
      //   }
      // }
    ]
  }
]
export default routes
