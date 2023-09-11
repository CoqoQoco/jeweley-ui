//import settingRoutes from './setting-routes.js'

import Layout from '@/layout/web/LayoutDashboard.vue'
import Dashboard from '@/views/dashboard/WelcomePage.vue'
import PickingList from '@/views/production/order-plan/picking-list/PickingListView.vue'
import PickingListTrack from '@/views/production/order-plan/tracking/IndexView.vue'

// ----- test ----- //
import TestAPI from '@/views/test-api/ViewTest.vue'

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
        th: 'ใบจ่าย-รับคืน'
      },
      classIcon: 'bi bi-vector-pen',
      majorShow: true,
      btsubLineShow: true
    },
    children: [
      {
        path: '/picking-list',
        name: 'picking-list',
        component: PickingList,
        meta: {
          Displayname: {
            en: 'Picking List',
            th: 'สร้างใบจ่าย/รับคืนงาน'
          },
          minorShow: true
        }
      },
      // {
      //   path: '/mold',
      //   name: 'mold',
      //   component: Dashboard,
      //   meta: {
      //     Displayname: {
      //       en: 'Mold',
      //       th: 'เเม่พิมพ์ [ออกแบบ/ผลิต]'
      //     },
      //     minorShow: true
      //   }
      // },
      {
        path: '/pickinglist-tag',
        name: 'pickinglist-tag',
        component: PickingListTrack,
        meta: {
          Displayname: {
            en: 'Pickinglist Tag',
            th: 'ติดตามงานผลิต'
          },
          minorShow: true
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
        component: TestAPI,
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
