import { PERMISSIONS } from '@/services/permission/config.js'
const Layout = () => import('@/layout/web/LayoutDashboard.vue')

const Quotation = () => import('@/views/sale/quotation/index-view.vue')
const AccountView = () => import('@/views/setting/user-account/index-view.vue')

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
        path: '/sale-quotation-new',
        name: 'sale-quotation-new',
        component: AccountView,
        meta: {
          Displayname: {
            en: 'Quotation',
            th: 'เสนอราคา (ใหม่)'
          },
          minorShow: true,
          permissions: [PERMISSIONS.SALE_CREATE]
        }
      },
      {
        path: '/production-order',
        name: 'production-order',
        component: AccountView,
        meta: {
          Displayname: {
            en: 'Production Order',
            th: 'ใบสั่งผลิต'
          },
          minorShow: true,
          permissions: [PERMISSIONS.SALE_CREATE]
        }
      },
      {
        path: '/sale-order',
        name: 'sale-order',
        component: AccountView,
        meta: {
          Displayname: {
            en: 'Sale Order',
            th: 'ใบสั่งขาย'
          },
          minorShow: true,
          permissions: [PERMISSIONS.SALE_CREATE]
        }
      },
      {
        path: '/Invoice',
        name: 'Invoice',
        component: AccountView,
        meta: {
          Displayname: {
            en: 'Invoice',
            th: 'ใบเเจ้งนี้'
          },
          minorShow: true,
          permissions: [PERMISSIONS.SALE_CREATE]
        }
      }
    ]
  }
]

export default routes
