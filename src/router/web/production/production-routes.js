const Layout = () => import('@/layout/web/LayoutDashboard.vue')
const PlanOrder = () => import('@/views/production/plan-create/IndexView.vue')
const PlanGoldOrder = () => import('@/views/production/plan-gold/IndexView.vue')
const PlanGoldTracking = () => import('@/views/production/tracking-plan-gold/IndexView.vue')
const PlanOrderTracking = () => import('@/views/production/plan-tracking/IndexView.vue')
const PlanOrderTrackingStatus = () => import('@/views/production/tracking-status/IndexView.vue')
const PlanOrderTrackingWorker = () => import('@/views/production/tracking-worker/IndexView.vue')
const PlanOrderTrackingView = () => import('@/views/production/plan-update/IndexView.vue')
const ReportProduction = () => import('@/views/report-production/IndexView.vue')
const ReportProductionGoldCost = () => import('@/views/report-production-gold-cost/IndexView.vue')

const PlanOrderPrice = () => import('@/views/production/plan-price/IndexView.vue')

const routes = [
  {
    path: '/production',
    component: Layout,
    redirect: '/mold',
    name: 'prodution',
    meta: {
      Displayname: {
        en: 'Production Plan',
        th: 'งานผลิต'
      },
      classIcon: 'bi bi-hammer',
      majorShow: true,
      btsubLineShow: true
    },
    children: [
      {
        path: '/plan-order',
        name: 'plan-order',
        component: PlanOrder,
        meta: {
          Displayname: {
            en: 'Plan Order',
            th: 'สร้างแผนงานผลิต'
          },
          minorShow: true
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
          minorShow: true
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
          minorShow: true
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
          minorShow: false
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
          minorShow: false
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
          minorShow: false
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
          minorShow: true
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
          minorShow: true
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
          minorShow: true
        }
      },

      // report
      {
        path: '/report-production',
        name: 'report-production',
        component: ReportProduction,
        meta: {
          Displayname: {
            en: 'Production Plan Report',
            th: 'รายงานผลิต'
          },
          minorShow: true
        }
      },
      {
        path: '/report-production-plan-gold',
        name: 'report-production-plan-gold',
        component: ReportProductionGoldCost,
        meta: {
          Displayname: {
            en: 'Plan Gold Report',
            th: 'รายงานใบเบิกผสมทอง'
          },
          minorShow: true
        }
      }
    ]
  }
]
export default routes
