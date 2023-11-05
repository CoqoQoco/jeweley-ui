//import settingRoutes from './setting-routes.js'

const Layout = () => import('@/layout/web/LayoutDashboard.vue')
//import Layout from '@/layout/web/LayoutDashboard.vue'

const Dashboard = () => import('@/views/dashboard/WelcomePage.vue')
//import Dashboard from '@/views/dashboard/WelcomePage.vue'
const Mold = () => import('@/views/production/order-plan/mold-design/MoldView.vue')

const PlanOrder = () => import('@/views/production/order-plan/plan/IndexView.vue')
//import PlanOrder from '@/views/production/order-plan/plan/IndexView.vue'

const PlanOrderTracking = () => import('@/views/production/order-plan/tracking/IndexView.vue')
//import PlanOrderTracking from '@/views/production/order-plan/tracking/IndexView.vue'

const PlanOrderTrackingView = () =>
  import('@/views/production/order-plan/tracking/components/ViewPlan.vue')
//import PlanOrderTrackingView from '@/views/production/order-plan/tracking/components/ViewPlan.vue'

// ----- master ------ //
const GemView = () => import('@/views/master/gem/GemView.vue')
const GemShapeView = () => import('@/views/master/gemShape/GemShapeView.vue')
const GoldSizeView = () => import('@/views/master/goldSize/GoldSizeView.vue')
const ProductTypeView = () => import('@/views/master/productType/ProductTypeView.vue')

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

  //----- Import Product -----
  // {
  //   path: '/import-product',
  //   component: Layout,
  //   redirect: '/import-product-excel',
  //   name: 'import-product',
  //   meta: {
  //     Displayname: {
  //       en: 'Import Product',
  //       th: 'นำเข้าใบผลิตสินค้า'
  //     },
  //     classIcon: 'bi bi-file-earmark-excel',
  //     majorShow: true
  //     //btLineShow: true
  //   },
  //   children: [
  //     {
  //       path: '/import-product-excel',
  //       name: 'import-product-excel',
  //       component: ImportProductionFile,
  //       meta: {
  //         Displayname: {
  //           en: 'import Excel',
  //           th: 'นำเข้าใบงานผลิต'
  //         },
  //         minorShow: true
  //       }
  //     },
  //     {
  //       path: '/import-product-track',
  //       name: 'import-product-track',
  //       component: Dashboard,
  //       meta: {
  //         Displayname: {
  //           en: 'import Track',
  //           th: 'ติดตามใบงานผลิต'
  //         },
  //         minorShow: true
  //       }
  //     }
  //   ]
  // },
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
            th: 'ออกเเบบเเม่พิมพ์'
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
        path: '/plan-order-tracking/:id',
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
      classIcon: 'bi bi-vector-pen',
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
