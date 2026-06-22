import { PERMISSIONS } from '@/services/permission/config.js'

const Layout = () => import('@/layout/web/LayoutDashboard.vue')
const GraphView = () => import('@/views/graph/index-view.vue')

const routes = [
  {
    path: '/graph',
    component: Layout,
    redirect: '/graph/frontend',
    name: 'graph-group',
    meta: {
      Displayname: {
        th: 'Project Graph',
        en: 'Project Graph'
      },
      classIcon: 'bi bi-diagram-3',
      majorShow: true,
      permissions: [PERMISSIONS.TICKET_MANAGE]
    },
    children: [
      {
        path: '/graph/frontend',
        name: 'graph-frontend',
        component: GraphView,
        meta: {
          Displayname: {
            th: 'กราฟ Frontend',
            en: 'Frontend Graph'
          },
          minorShow: false,
          permissions: [PERMISSIONS.TICKET_MANAGE],
          graphTarget: 'frontend'
        }
      },
      {
        path: '/graph/backend',
        name: 'graph-backend',
        component: GraphView,
        meta: {
          Displayname: {
            th: 'กราฟ Backend',
            en: 'Backend Graph'
          },
          minorShow: false,
          permissions: [PERMISSIONS.TICKET_MANAGE],
          graphTarget: 'backend'
        }
      }
    ]
  }
]

export default routes
