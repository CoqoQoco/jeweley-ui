const Layout = () => import('@/layout/web/LayoutDashboard.vue')

const Dashboard = () => import('@/views/dashboard/WelcomePage.vue')
const List = () => import('@/views/stock/product/list/IndexView.vue')

const GRProductionList = () =>
  import('@/views/receipt-stock/product/gr-production-list/IndexView.vue')
const GRProduction = () => import('@/views/receipt-stock/product/gr-production/IndexView.vue')

const Barcode = () => import('@/views/receipt-stock/product/test-barcode/IndexView.vue')

import { PERMISSIONS } from '@/services/permission/config.js'

const routes = [
  {
    path: '/stock-product',
    component: Layout,
    redirect: '/stock-product-list',
    name: 'stock-product',
    sectionid: 'STOCK-PRODUCT',
    meta: {
      Displayname: {
        en: 'Stock Product',
        th: 'คลังสินค้า'
      },
      classIcon: 'bi bi-gem',
      majorShow: true,
      btsubLineShow: true,
      permissions: [PERMISSIONS.STOCK_PRODUCT]
    },
    children: [
      // stock product
      {
        path: '/stock-product-list',
        name: 'stock-product-list',
        component: List,
        menuId: 'List',
        meta: {
          Displayname: {
            en: 'Stock Product',
            th: 'ตรวจคลัง'
          },
          minorShow: true,
          menuId: `stock-product`,
          permissions: [PERMISSIONS.STOCK_PRODUCT]
        }
      },

      //gr product
      {
        path: '/goods-receipt-production-list',
        name: 'goods-receipt-production-list',
        component: GRProductionList,
        menuId: 'create',
        meta: {
          Displayname: {
            en: 'Goods Receipt Production',
            th: 'รับสินค้างานผลิต'
          },
          minorShow: true,
          permissions: [PERMISSIONS.STOCK_PRODUCT_GR_PRODUCTION]
        }
      },
      {
        path: '/goods-receipt-production/:id',
        name: 'goods-receipt-production',
        component: GRProduction,
        meta: {
          Displayname: {
            en: 'Goods Receipt Production',
            th: 'รับสินค้างานผลิต'
          },
          minorShow: false,
          permissions: [PERMISSIONS.STOCK_PRODUCT_GR_PRODUCTION_CREATE]
        }
      },

      {
        path: '/goods-receipt-outsource',
        name: 'goods-receipt-outsource',
        component: Dashboard,
        meta: {
          Displayname: {
            en: 'Goods Receipt Outsource',
            th: 'รับสินค้างานนอก'
          },
          minorShow: true,
          permissions: [PERMISSIONS.STOCK_PRODUCT_GR_PRODUCTION_CREATE]
        }
      },

      {
        path: '/goods-receipt-report',
        name: 'goods-receipt-report',
        component: Dashboard,
        meta: {
          Displayname: {
            en: 'Report',
            th: 'รายงานรับสินค้า'
          },
          minorShow: true,
          permissions: [PERMISSIONS.STOCK_PRODUCT]
        }
      },

      {
        path: '/goods-receipt-barcode',
        name: 'goods-receipt-barcode',
        component: Barcode,
        meta: {
          Displayname: {
            en: '',
            th: 'Barcode'
          },
          minorShow: true,
          permissions: [PERMISSIONS.STOCK_PRODUCT_GR_PRODUCTION_CREATE]
        }
      },
    ]
  }
]
export default routes
