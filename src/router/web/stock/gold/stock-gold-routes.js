// เพิ่มเป็นลูกของ major เดิม /stock-raw-material (ดู stock-gem-routes.js) — ไม่สร้าง major ใหม่
const stockGoldList = () => import('@/views/stock/gold/index-view.vue')
const stockGoldTransection = () => import('@/views/receipt-stock/gold/transaction/index-view.vue')
const stockGoldInbound = () => import('@/views/receipt-stock/gold/inbound/index-view.vue')

import { PERMISSIONS } from '@/services/permission/config.js'

const stockGoldChildren = [
  {
    path: '/stock-gold-list',
    name: 'stock-gold-list',
    component: stockGoldList,
    menuId: 'STOCK-GOLD-LIST',
    meta: {
      Displayname: {
        en: 'Stock Gold',
        th: 'ตรวจคลังทอง'
      },
      minorShow: true,
      permissions: [PERMISSIONS.STOCK_GOLD_VIEW]
    }
  },

  {
    path: '/stock-gold-transection',
    name: 'stock-gold-transection',
    component: stockGoldTransection,
    menuId: 'STOCK-GOLD-TRANSECTION',
    meta: {
      Displayname: {
        en: 'Gold Transection',
        th: 'รายการเคลื่อนไหวทอง'
      },
      minorShow: true,
      permissions: [PERMISSIONS.STOCK_GOLD_VIEW]
    }
  },

  {
    path: '/stock-gold-inbound',
    name: 'stock-gold-inbound',
    component: stockGoldInbound,
    menuId: 'STOCK-GOLD-INBOUND',
    meta: {
      Displayname: {
        en: 'Gold Inbound',
        th: 'รับทองเข้าคลัง'
      },
      minorShow: true,
      permissions: [PERMISSIONS.STOCK_GOLD_CREATE]
    }
  }
]

export default stockGoldChildren
