import { PERMISSIONS } from '@/services/permission/config.js'

const Layout = () => import('@/layout/web/LayoutDashboard.vue')

const PrintStation = () => import('@/views/print-station/index-view.vue')

// หน้าเว็บบนคอมที่บูธ — ต่อเครื่องพิมพ์ Bluetooth ไว้ ดึงงานพิมพ์จากคิว (มือถือ iOS ส่งเข้ามาเพราะสั่งพิมพ์เองไม่ได้)
// permission: reuse PERMISSIONS.SALE_VIEW (คนขายหน้าร้านที่ต้องเข้าหน้านี้มี role Sale ซึ่งมี SALE_VIEW อยู่แล้ว)
const routes = [
  {
    path: '/print-station',
    component: Layout,
    redirect: '/print-station',
    name: 'print-station-group',
    meta: {
      Displayname: {
        th: 'เครื่องพิมพ์กลาง',
        en: 'Print Station'
      },
      classIcon: 'bi bi-printer-fill',
      majorShow: true,
      permissions: [PERMISSIONS.SALE_VIEW]
    },
    children: [
      {
        path: '/print-station',
        name: 'print-station',
        component: PrintStation,
        meta: {
          Displayname: {
            th: 'เครื่องพิมพ์กลาง',
            en: 'Print Station'
          },
          minorShow: true,
          permissions: [PERMISSIONS.SALE_VIEW]
        }
      }
    ]
  }
]

export default routes
