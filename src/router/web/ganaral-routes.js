import Layout from '@/layout/web/LayoutDashboard.vue'
import Dashboard from '@/views/dashboard/DashboardView.vue'

const routes = [
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
      //classIcon: 'k-icon k-i-home',
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
  {
    path: '/test',
    component: Layout,
    redirect: '/test-1',
    name: 'test',
    meta: {
      Displayname: {
        en: 'test',
        th: 'หน้าแรก'
      },
      //classIcon: 'k-icon k-i-home',
      majorShow: true
    },
    children: [
      {
        path: '/test-1',
        name: 'test1',
        component: Dashboard,
        meta: {
          Displayname: {
            en: 'test-1',
            th: 'หน้าแรก'
          },
          minorShow: true
        }
      },
      {
        path: '/test-2',
        name: 'test2',
        component: Dashboard,
        meta: {
          Displayname: {
            en: 'test-2',
            th: 'หน้าแรก'
          },
          minorShow: true
        }
      }
    ]
  }
]
export default routes
