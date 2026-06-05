const Layout = () => import('@/layout/web/LayoutDashboard.vue')

const CatalogList = () => import('@/views/catalog/index-view.vue')
const CatalogDetail = () => import('@/views/catalog/detail-view.vue')

import { PERMISSIONS } from '@/services/permission/config.js'

const routes = [
  {
    path: '/catalog',
    component: Layout,
    redirect: '/catalog-list',
    name: 'catalog',
    meta: {
      Displayname: {
        en: 'Catalog',
        th: 'แคตตาล็อก'
      },
      classIcon: 'bi bi-journal-bookmark',
      majorShow: true,
      permissions: [PERMISSIONS.CATALOG_VIEW]
    },
    children: [
      {
        path: '/catalog-list',
        name: 'catalog-list',
        component: CatalogList,
        meta: {
          Displayname: {
            en: 'Catalog',
            th: 'จัดการแคตตาล็อก'
          },
          minorShow: true,
          permissions: [PERMISSIONS.CATALOG_VIEW]
        }
      },
      {
        path: '/catalog-detail/:id',
        name: 'catalog-detail',
        component: CatalogDetail,
        meta: {
          Displayname: {
            en: 'Catalog Detail',
            th: 'รายละเอียด Catalog'
          },
          minorShow: false,
          permissions: [PERMISSIONS.CATALOG_VIEW]
        }
      }
    ]
  }
]

export default routes
