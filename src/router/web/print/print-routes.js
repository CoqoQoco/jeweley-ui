import { PERMISSIONS } from '@/services/permission/config.js'

const Layout = () => import('@/layout/web/LayoutDashboard.vue')

const PrintStation = () => import('@/views/print-station/index-view.vue')
const LabelStation = () => import('@/views/label-station/index-view.vue')

// กลุ่มเครื่องพิมพ์กลาง — เมนูย่อย: เครื่องพิมพ์ใบเสร็จ (คอมที่บูธ ต่อเครื่องพิมพ์ Bluetooth ดึงงานพิมพ์จากคิว
// มือถือ iOS ส่งเข้ามาเพราะสั่งพิมพ์เองไม่ได้) และเครื่องพิมพ์ป้ายวัตถุดิบ (label station)
// permission ใบเสร็จ: reuse PERMISSIONS.SALE_VIEW (role Sale มีอยู่แล้ว)
// permission ป้ายวัตถุดิบ: PERMISSIONS.LABEL_STATION_VIEW (role LabelStation + Dev เท่านั้น)
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
      permissions: [PERMISSIONS.SALE_VIEW, PERMISSIONS.LABEL_STATION_VIEW]
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
      },
      {
        path: '/label-station',
        name: 'label-station',
        component: LabelStation,
        menuId: 'LABEL-STATION',
        meta: {
          Displayname: {
            th: 'เครื่องพิมพ์ป้ายวัตถุดิบ',
            en: 'Label Station'
          },
          classIcon: 'bi bi-upc-scan',
          minorShow: true,
          permissions: [PERMISSIONS.LABEL_STATION_VIEW]
        }
      }
    ]
  }
]

export default routes
