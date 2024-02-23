//import settingRoutes from './setting-routes.js'

const Layout = () => import('@/layout/web/LayoutDashboard.vue')
//import Layout from '@/layout/web/LayoutDashboard.vue'

const Dashboard = () => import('@/views/dashboard/WelcomePage.vue')
const Customer = () => import('@/views/customer/IndexView.vue')
//import Dashboard from '@/views/dashboard/WelcomePage.vue'
const Mold = () => import('@/views/production/mold/MoldView.vue')

const PlanOrder = () => import('@/views/production/plan-create/IndexView.vue')
//import PlanOrder from '@/views/production/order-plan/plan/IndexView.vue'
//const GoldPickinglist = () => import('@/views/production/gold-pickinglist/IndexView.vue')

const PlanOrderTracking = () => import('@/views/production/tracking/IndexView.vue')
//import PlanOrderTracking from '@/views/production/order-plan/tracking/IndexView.vue'

const PlanOrderTrackingView = () => import('@/views/production/plan-update/IndexView.vue')
//import PlanOrderTrackingView from '@/views/production/order-plan/tracking/components/ViewPlan.vue'

//worker
const WorkerList = () => import('@/views/worker/worker-list/IndexView.vue')
const WorkerDailyWages = () => import('@/views/worker/worker-daily-wages/IndexView.vue')

//production-cost
const GoldCost = () => import('@/views/production-cost/goldCost/IndexView.vue')

// ----- master ------ //
const GemView = () => import('@/views/master/gem/GemView.vue')
const GemShapeView = () => import('@/views/master/gemShape/GemShapeView.vue')
const GoldSizeView = () => import('@/views/master/goldSize/GoldSizeView.vue')
const ProductTypeView = () => import('@/views/master/productType/ProductTypeView.vue')

const Report = () => import('@/views/report-production/IndexView.vue')

// ----- test ----- //
//import TestAPI from '@/views/test-api/ViewTest.vue'

//import MoldDesign from '@/views/production/order-plan/mold-design/MoldView.vue'
//import PickingList from '@/views/production/order-plan/picking-list/PickingListView.vue'
//test commit

//import ImportProductionFile from '@/views/import-production/import/NewImportFile.vue'

const routes = [
  //----- Main Dashboard ----
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    name: 'dashboard',
    meta: {
      Displayname: {
        en: 'Home',
        th: 'หน้าแรก'
      },
      classIcon: 'bi bi-house-door-fill',
      majorShow: true,
      btLineShow: true
    },
    children: [
      {
        path: '/dashboard',
        name: 'dashboard',
        component: Dashboard,
        meta: {
          Displayname: {
            en: 'Home',
            th: 'หน้าแรก'
          },
          minorShow: false
        }
      }
    ]
  },

  //----- Mold && Picking List -----
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
      classIcon: 'bi bi-vector-pen',
      majorShow: true,
      btsubLineShow: true
    },
    children: [
      {
        path: '/plan-mold',
        name: 'plan-mold',
        component: Mold,
        meta: {
          Displayname: {
            en: 'Plan Mold',
            th: 'สร้างเเบบเเม่พิมพ์'
          },
          minorShow: true
        }
      },
      {
        path: '/plan-order',
        name: 'plan-order',
        component: PlanOrder,
        meta: {
          Displayname: {
            en: 'Plan Order',
            th: 'สร้างใบจ่าย-รับคืนงาน'
          },
          minorShow: true
        }
      },
      // {
      //   path: '/gold-pickink-list',
      //   name: 'gold-pickink-list',
      //   component: GoldPickinglist,
      //   meta: {
      //     Displayname: {
      //       en: 'Gold Pickinglist',
      //       th: 'ใบผสมทอง'
      //     },
      //     minorShow: true
      //   }
      // },
      {
        path: '/plan-order-tracking',
        name: 'plan-order-tracking',
        component: PlanOrderTracking,
        meta: {
          Displayname: {
            en: 'Plan Order Tracking',
            th: 'ติดตามงานผลิต'
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
            th: 'ติดตามงานผลิต'
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
      }
      // {
      //   path: '/production-report',
      //   name: 'production-report',
      //   component: Dashboard,
      //   meta: {
      //     Displayname: {
      //       en: 'Production Report',
      //       th: 'รายงานการผลิต'
      //     },
      //     minorShow: true
      //   }
      // }
    ]
  },

  // ------ cost sheet -------
  {
    path: '/production-cost',
    component: Layout,
    redirect: '/production-cost-gold-picking',
    name: 'production-cost-gold-picking',
    meta: {
      Displayname: {
        en: 'Production Picking Material',
        th: 'งานเบิกผลิต'
      },
      classIcon: 'bi bi-currency-exchange',
      majorShow: true,
      btsubLineShow: true
    },
    children: [
      {
        path: '/gold-cost-picking',
        name: 'gold-cost-picking',
        component: GoldCost,
        meta: {
          Displayname: {
            en: 'Gold Picking',
            th: 'เบิกผสมทอง'
          },
          minorShow: true
        }
      },
      {
        path: '/plan-material-picking',
        name: 'plan-material-picking',
        component: Report,
        meta: {
          Displayname: {
            en: 'Material Picking',
            th: 'เบิกวัตถุดิบ'
          },
          minorShow: true
        }
      },
      {
        path: '/plan-cost',
        name: 'plan-cost',
        component: Report,
        meta: {
          Displayname: {
            en: 'Plan Cost',
            th: 'สรุปราคาผลิต'
          },
          minorShow: true
        }
      }
    ]
  },

  // ------------------ customer -------------------
  {
    path: '/customer',
    component: Layout,
    redirect: '/customer',
    name: 'customer',
    meta: {
      Displayname: {
        en: 'Customer Data',
        th: 'ข้อมูลลูกค้า'
      },
      classIcon: 'bi bi-person-lines-fill',
      majorShow: true
    },
    children: [
      {
        path: '/customer',
        name: 'customer',
        component: Customer,
        meta: {
          Displayname: {
            en: 'Customer Data',
            th: 'ข้อมูลลูกค้า'
          },
          minorShow: false
        }
      }
    ]
  },

  // ------ worker-------
  {
    path: '/worker',
    component: Layout,
    redirect: '/worker',
    name: 'worker',
    meta: {
      Displayname: {
        en: 'Woker',
        th: 'ข้อมูลพนักงาน'
      },
      classIcon: 'bi bi-person-gear',
      majorShow: true,
      btsubLineShow: true
    },
    children: [
      {
        path: '/worker-name',
        name: 'worker-name',
        component: WorkerList,
        meta: {
          Displayname: {
            en: 'Worker Name',
            th: 'ข้อมูลพนักงาน (ช่าง)'
          },
          minorShow: true
        }
      },
      {
        path: '/worker-daily-wages/:id',
        name: 'worker-daily-wages',
        component: WorkerDailyWages,
        meta: {
          Displayname: {
            en: 'Worker Wages',
            th: 'ตรวจสอบค่าเเรงช่าง'
          },
          minorShow: false
        }
      },
      {
        path: '/worker-salary',
        name: 'worker-salary',
        component: Report,
        meta: {
          Displayname: {
            en: 'Worker Salary',
            th: 'รายงานค่าเเรงช่าง'
          },
          minorShow: true
        }
      }
    ]
  },

  // ------------ Report -------------------
  {
    path: '/report-production',
    component: Layout,
    redirect: '/report-production',
    name: 'report-production',
    meta: {
      Displayname: {
        en: 'Report',
        th: 'รายงานผลิต'
      },
      classIcon: 'bi bi-file-spreadsheet',
      majorShow: true
    },
    children: [
      {
        path: '/report-production',
        name: 'report-production',
        component: Report,
        meta: {
          Displayname: {
            en: 'Report',
            th: 'รายงานผลิต'
          },
          minorShow: false
        }
      }
    ]
  },

  // --------------------- master data -----------------------------
  {
    path: '/master',
    component: Layout,
    redirect: '/gem',
    name: 'master',
    meta: {
      Displayname: {
        en: 'Master Date',
        th: 'จัดการข้อมูลกลาง'
      },
      classIcon: 'bi bi-database',
      majorShow: true,
      btsubLineShow: true
    },
    children: [
      {
        path: '/master-gem',
        name: 'master-gem',
        component: GemView,
        meta: {
          Displayname: {
            en: 'Gem',
            th: 'ข้อมูลพลอย'
          },
          minorShow: true
        }
      },
      {
        path: '/master-gem-shape',
        name: 'master-gem-shape',
        component: GemShapeView,
        meta: {
          Displayname: {
            en: 'Gem Shape',
            th: 'ข้อมูลรูปร่างพลอย'
          },
          minorShow: true
        }
      },
      {
        path: '/master-gold-size',
        name: 'master-gold-size',
        component: GoldSizeView,
        meta: {
          Displayname: {
            en: 'Gold Size',
            th: 'ข้อมูลขนาดทอง'
          },
          minorShow: true
        }
      },
      {
        path: '/master-product-type',
        name: 'master-product-type',
        component: ProductTypeView,
        meta: {
          Displayname: {
            en: 'Product Type',
            th: 'ข้อมูลประเภทสินค้า'
          },
          minorShow: true
        }
      }
    ]
  },

  //----- Setting -----
  //...settingRoutes,

  //---- Logout -----
  {
    path: '/logout',
    component: Layout,
    redirect: '/logout',
    name: 'logout',
    meta: {
      Displayname: {
        en: 'Logout',
        th: 'ออกจากระบบ'
      },
      classIcon: 'bi bi-power',
      majorShow: true
    },
    children: [
      {
        path: '/logout',
        name: 'logout',
        component: Dashboard,
        meta: {
          Displayname: {
            en: 'Logout',
            th: 'ออกจากระบบ'
          },
          minorShow: false
        }
      }
    ]
  }
]
export default routes
