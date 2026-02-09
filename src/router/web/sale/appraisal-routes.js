import { PERMISSIONS } from '@/services/permission/config.js'
const Layout = () => import('@/layout/web/LayoutDashboard.vue')

// Appraisal Components
const Appraisal = () => import('@/views/sale/appraisal/index-view.vue')
const AppraisalList = () => import('@/views/sale/appraisal-list/index-view.vue')

const routes = [
  {
    path: '/appraisal',
    component: Layout,
    redirect: '/appraisal/new',
    name: 'appraisal',
    meta: {
      Displayname: {
        en: 'Appraisal',
        th: 'ตีราคาสินค้า'
      },
      classIcon: 'bi bi-calculator',
      majorShow: true,
      permissions: [PERMISSIONS.SALE_VIEW]
    },
    children: [
      // Create New Appraisal
      {
        path: '/appraisal/new',
        name: 'appraisal-new',
        component: Appraisal,
        meta: {
          Displayname: {
            en: 'New Appraisal',
            th: 'ตีราคาสินค้าใหม่'
          },
          minorShow: true,
          permissions: [PERMISSIONS.SALE_CREATE]
        }
      },
      // Appraisal List
      {
        path: '/appraisal/list',
        name: 'appraisal-list',
        component: AppraisalList,
        meta: {
          Displayname: {
            en: 'Appraisal List',
            th: 'รายการตีราคา'
          },
          minorShow: true,
          permissions: [PERMISSIONS.SALE_VIEW]
        }
      }
    ]
  }
]

export default routes
