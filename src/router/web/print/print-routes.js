import { PERMISSIONS } from '@/services/permission/config.js'

const Layout = () => import('@/layout/web/LayoutDashboard.vue')

const PrintStation = () => import('@/views/print-station/index-view.vue')

// กลุ่มเครื่องพิมพ์กลาง — เครื่องพิมพ์ใบเสร็จ (คอมที่บูธ ต่อเครื่องพิมพ์ Bluetooth ดึงงานพิมพ์จากคิว
// มือถือ iOS ส่งเข้ามาเพราะสั่งพิมพ์เองไม่ได้)
// permission ใบเสร็จ: reuse PERMISSIONS.SALE_VIEW (role Sale มีอยู่แล้ว)
// หน้าเครื่องพิมพ์ป้ายวัตถุดิบ (/label-station) เป็น public page ใช้คีย์เครื่อง — ดู public-routes.js
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
            th: 'เครื่องพิมพ์ใบเสร็จ',
            en: 'Receipt Printer'
          },
          minorShow: true,
          permissions: [PERMISSIONS.SALE_VIEW]
        }
      }
    ]
  }
]

export default routes
