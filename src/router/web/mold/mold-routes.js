const Layout = () => import('@/layout/web/LayoutDashboard.vue')
const MoldDesignCreate = () => import('@/views/mold/create-design/IndexView.vue')
const MoldDesignCreateNew = () => import('@/views/mold/create-design-new/IndexView.vue')
const MoldRededign = () => import('@/views/mold/plan-re-model/IndexView.vue')
const MoldPlanList = () => import('@/views/mold/plan-list/IndexView.vue')
const MoldPlanData = () => import('@/views/mold/plan-data/IndexView.vue')
const MoldDesiged = () => import('@/views/mold/tracking/IndexView.vue')
const MoldList = () => import('@/views/mold/mold-list/IndexView.vue')
const MoldpickingList = () => import('@/views/mold/picking-list/IndexView.vue')

import { PERMISSIONS } from '@/services/permission/config.js'
const routes = [
  {
    path: '/mold',
    component: Layout,
    redirect: 'design-lis',
    name: 'mold',
    meta: {
      Displayname: {
        en: 'Plan Design',
        th: 'งานเเม่พิมพ์'
      },
      classIcon: 'bi bi-palette',
      majorShow: true,
      btsubLineShow: true,
      permissions: [PERMISSIONS.MOLD_VIEW]
    },
    children: [
      {
        path: 'design-create',
        name: 'design-create',
        component: MoldDesignCreate,
        meta: {
          Displayname: {
            en: 'Design Mold',
            th: 'สร้างเเบบเเม่พิมพ์'
          },
          minorShow: true,
          permissions: [PERMISSIONS.MOLD_CREATE]
        }
      },
       {
        path: 'design-create-new',
        name: 'design-create-new',
        component: MoldDesignCreateNew,
        meta: {
          Displayname: {
            en: 'Design Mold',
            th: 'สร้างเเบบเเม่พิมพ์ (ใหม่)'
          },
          minorShow: true,
          permissions: [PERMISSIONS.MOLD_CREATE]
        }
      },
      {
        path: 'plan-re-model',
        name: 'plan-re-model',
        component: MoldRededign,
        meta: {
          Displayname: {
            en: 'Re-design Mold',
            th: 'แปลงเเบบเเละจัดเก็บ'
          },
          minorShow: true,
          permissions: [PERMISSIONS.MOLD_CREATE]
        }
      },
      {
        path: 'plan-list',
        name: 'plan-list',
        component: MoldPlanList,
        meta: {
          Displayname: {
            en: 'Plan List',
            th: 'ติดตามแบบเเม่พิมพ์'
          },
          minorShow: true,
          permissions: [PERMISSIONS.MOLD_VIEW]
        }
      },
      {
        path: 'plan-data/:id',
        name: 'plan-data',
        component: MoldPlanData,
        meta: {
          minorShow: false,
          permissions: [PERMISSIONS.MOLD_EDIT]
        }
      },
      {
        path: 'mold-list',
        name: 'mold-list',
        component: MoldList,
        meta: {
          Displayname: {
            en: 'Tracking Mold',
            th: 'เเบบเเม่พิมพ์สำเร็จ'
          },
          minorShow: true,
          permissions: [PERMISSIONS.MOLD_VIEW]
        }
      },
      // {
      //   path: 'picking-list-mold',
      //   name: 'picking-list-mold',
      //   component: MoldDesiged,
      //   meta: {
      //     Displayname: {
      //       en: 'Picking Mold',
      //       th: 'เบิกเม่พิมพ์สำเร็จ'
      //     },
      //     minorShow: true
      //   }
      // },
      {
        path: 'picking-list-mold-summery',
        name: 'picking-list-mold-summery',
        component: MoldpickingList,
        meta: {
          Displayname: {
            en: 'Picking Mold Summery',
            th: 'ติดตามเบิกเเม่พิมพ์'
          },
          minorShow: true,
          permissions: [PERMISSIONS.MOLD_EDIT]
        }
      },
      // {
      //   path: 'report-plan-mold',
      //   name: 'report-plan-mold',
      //   component: MoldDesiged,
      //   meta: {
      //     Displayname: {
      //       en: 'Picking Mold Summery',
      //       th: 'รายงานแบบเเม่พิมพ์'
      //     },
      //     minorShow: true,
      //     permissions: [PERMISSIONS.MOLD_VIEW]
      //   }
      // },
      // {
      //   path: 'report-picking-list-mold',
      //   name: 'report-picking-list-mold',
      //   component: MoldDesiged,
      //   meta: {
      //     Displayname: {
      //       en: 'Picking Mold Summery',
      //       th: 'รายงานเบิกเเม่พิมพ์'
      //     },
      //     minorShow: true,
      //     permissions: [PERMISSIONS.MOLD_VIEW]
      //   }
      // }
    ]
  }
]
export default routes
