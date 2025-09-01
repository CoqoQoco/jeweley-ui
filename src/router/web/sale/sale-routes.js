import { PERMISSIONS } from '@/services/permission/config.js'
const Layout = () => import('@/layout/web/LayoutDashboard.vue')

const Quotation = () => import('@/views/sale/quotation/index-view.vue')

const routes = [
  {
    path: '/sale',
    component: Layout,
    redirect: '/sale-quotation',
    name: 'sale',
    meta: {
      Displayname: {
        en: 'Sale',
        th: 'งานขาย'
      },
      classIcon: 'bi bi-receipt',
      majorShow: true,
      //btsubLineShow: true,
      permissions: [PERMISSIONS.SALE_VIEW]
    },
    children: [
      {
        path: '/sale-quotation',
        name: 'sale-quotation',
        component: Quotation,
        meta: {
          Displayname: {
            en: 'Quotation',
            th: 'เสนอราคา'
          },
          minorShow: true,
          permissions: [PERMISSIONS.SALE_CREATE]
        }
      },
      {
        path: '/sale-quotation',
        name: 'sale-quotation',
        component: Quotation,
        meta: {
          Displayname: {
            en: 'Quotation',
            th: 'เสนอราคา'
          },
          minorShow: true,
          permissions: [PERMISSIONS.SALE_CREATE]
        }
      }
    ]
  }
]

export default routes
