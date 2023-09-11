import Dashboard from '@/views/dashboard/WelcomePage.vue'
import Layout from '@/layout/web/LayoutDashboard.vue'
const routes = [
  //----- Main Dashboard -----
  {
    path: '/ data-setting',
    component: Layout,
    redirect: '/user-account',
    name: 'data-setting',
    meta: {
      Displayname: {
        en: 'Data Setting',
        th: 'จัดการข้อมูล'
      },
      classIcon: 'bi bi-tools',
      majorShow: true,
      tpLineShow: true
    },
    children: [
      {
        path: '/user-account',
        name: 'user-account',
        component: Dashboard,
        meta: {
          Displayname: {
            en: 'User Account',
            th: 'จัดการบัญชีผู้ใช้'
          },
          minorShow: true
        }
      },
      {
        path: '/system-admin',
        name: 'system-admin',
        component: Dashboard,
        meta: {
          Displayname: {
            en: 'System Admin',
            th: 'ผู้ดูแลลระบบ'
          },
          minorShow: true
        }
      }
    ]
  }
]
export default routes
