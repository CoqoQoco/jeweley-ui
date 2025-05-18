//import Dashboard from '@/views/dashboard/WelcomePage.vue'
import Layout from '@/layout/web/LayoutDashboard.vue'

import account from '@/views/setting/user-account/index-view.vue'
import EditAccount from '@/views/setting/edit-account/index-view.vue'
import EditAccountView from '@/views/setting/edit-account/view/account-view.vue'
import testApi from '@/views/Admin/dev/call-api/index-view.vue'

import { PERMISSIONS } from '@/services/permission/config.js'
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
        component: account,
        meta: {
          Displayname: {
            en: 'User Account',
            th: 'ข้อมูลบุคคล'
          },
          minorShow: true
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
          permissions: [PERMISSIONS.USER_EDIT]
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
          permissions: [PERMISSIONS.USER_DEV]
        }
      },
       {
        path: '/test-api',
        name: 'test-api',
        component: testApi,
        meta: {
          Displayname: {
            en: 'API TEST',
            th: 'API TEST'
          },
          minorShow: true,
           permissions: [PERMISSIONS.USER_EDIT]
        }
      },
    ]
  }
]
export default routes
