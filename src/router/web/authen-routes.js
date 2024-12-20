// -------------- routes --------------
import mold from '../web/mold/mold-routes.js'
import production from '../web/production/production-routes.js'
import stockGem from '../web/stock/gem/stock-gem-routes.js'
import stockProduct from '../web/stock/product/stock-product-routes.js'
import settingRoutes from '../web/setting/setting-routes.js'

const Layout = () => import('@/layout/web/LayoutDashboard.vue')
//import Layout from '@/layout/web/LayoutDashboard.vue'

const Dashboard = () => import('@/views/dashboard/WelcomePage.vue')
const Customer = () => import('@/views/customer/IndexView.vue')

//worker
const WorkerList = () => import('@/views/worker/worker-list/IndexView.vue')
const WorkerDailyWages = () => import('@/views/worker/worker-daily-wages/IndexView.vue')

// ----- master ------ //
const GemView = () => import('@/views/master/gem/IndexView.vue')
const GemShapeView = () => import('@/views/master/gemShape/GemShapeView.vue')
const GoldSizeView = () => import('@/views/master/goldSize/GoldSizeView.vue')
const ProductTypeView = () => import('@/views/master/productType/ProductTypeView.vue')
const ZillView = () => import('@/views/master/zill/IndexView.vue')

const ReportProductionWages = () => import('@/views/report-production-wages/IndexView.vue')

import { PERMISSIONS } from '@/services/permission/config.js'
const routes = [
  //----- Main Dashboard ----
  // Main Dashboard
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
      majorShow: true
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

  // --------- Mold Design
  ...mold,
  // --------- Production
  ...production,
  // --------- stock
  ...stockProduct,
  ...stockGem,

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
      majorShow: true,
      permissions: [PERMISSIONS.CUSTOMER_VIEW]
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
          minorShow: false,
          permissions: [PERMISSIONS.CUSTOMER_VIEW]
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
      btsubLineShow: true,
      permissions: [PERMISSIONS.WORKER_VIEW]
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
          minorShow: true,
          permissions: [PERMISSIONS.WORKER_VIEW]
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
          minorShow: false,
          permissions: [PERMISSIONS.WORKER_VIEW]
        }
      }
    ]
  },

  // ------------ Report -------------------
  {
    path: '/report-production-worker-wages',
    component: Layout,
    redirect: '/report-production-worker-wages',
    name: 'report-production-worker-wages',
    meta: {
      Displayname: {
        en: 'Wages Report',
        th: 'รายงานช่าง'
      },
      classIcon: 'bi bi-file-spreadsheet',
      majorShow: true,
      permissions: [PERMISSIONS.WORKER_VIEW]
    },
    children: [
      {
        path: '/report-production-worker-wages',
        name: 'report-production-worker-wages',
        component: ReportProductionWages,
        meta: {
          Displayname: {
            en: 'Wages Report',
            th: 'รายงานช่าง'
          },
          minorShow: false,
          permissions: [PERMISSIONS.WORKER_VIEW]
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
      btsubLineShow: true,
      permissions: [PERMISSIONS.MASTER_VIEW]
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
          minorShow: true,
          permissions: [PERMISSIONS.MASTER_VIEW]
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
          minorShow: true,
          permissions: [PERMISSIONS.MASTER_VIEW]
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
          minorShow: true,
          permissions: [PERMISSIONS.MASTER_VIEW]
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
          minorShow: true,
          permissions: [PERMISSIONS.MASTER_VIEW]
        }
      },
      {
        path: '/master-zill',
        name: 'master-zull',
        component: ZillView,
        meta: {
          Displayname: {
            en: 'Zill',
            th: 'ข้อมูลซิล'
          },
          minorShow: true,
          permissions: [PERMISSIONS.MASTER_VIEW]
        }
      }
    ]
  },

  //----- Setting -----
  ...settingRoutes
]
export default routes
