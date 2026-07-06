import { PERMISSIONS } from '@/services/permission/config.js'

const Layout = () => import('@/layout/web/LayoutDashboard.vue')

const routes = [
  {
    path: '/downloads',
    component: Layout,
    redirect: '/downloads',
    name: 'downloads-group',
    meta: {
      Displayname: {
        th: 'ดาวน์โหลดโปรแกรม',
        en: 'Downloads'
      },
      classIcon: 'bi bi-download',
      majorShow: true,
      permissions: [PERMISSIONS.USER_VIEW],
      menuSection: 'system'
    },
    children: [
      {
        path: '/downloads',
        name: 'downloads',
        component: () => import('@/views/downloads/index-view.vue'),
        meta: {
          Displayname: {
            th: 'ดาวน์โหลดโปรแกรม',
            en: 'Downloads'
          },
          minorShow: false,
          permissions: [PERMISSIONS.USER_VIEW]
        }
      }
    ]
  }
]

export default routes
