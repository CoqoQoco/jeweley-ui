import Dashboard from '@/views/dashboard/WelcomePage.vue'
import Layout from '@/layout/web/LayoutDashboard.vue'

import EditAccount from '@/views/setting/edit-account/IndexView.vue'
import EditAccountView from '@/views/setting/edit-account/view/AccountView.vue'
const routes = [
  //----- Main Dashboard -----
  {
    path: '/setting',
    component: Layout,
    redirect: '/adjust-user-accout',
    name: 'data-setting',
    meta: {
      Displayname: {
        en: 'Setting',
        th: 'ตั้งค่าระบบ'
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
            th: 'ข้อมูลส่วนบุคคล'
          },
          minorShow: true,
          menuId: `user-account`
        }
      },
      {
        path: '/edit-accout',
        name: 'edit-account',
        component: EditAccount,
        meta: {
          Displayname: {
            en: 'Edit Account',
            th: 'จัดการบัญชีผู้ใช้'
          },
          minorShow: true,
          menuId: `edit-account`
        }
      },
      {
        path: '/edit-accout/:id',
        name: 'edit-account-view',
        component: EditAccountView,
        meta: {
          Displayname: {
            en: 'Edit Account',
            th: 'จัดการบัญชีผู้ใช้'
          },
          minorShow: false,
          menuId: `edit-account-view`
        }
      }
    ]
  }
]
export default routes
