import { PERMISSIONS } from '@/services/permission/config.js'
const Layout = () => import('@/layout/web/LayoutDashboard.vue')

// Sales Dashboard
const SalesDashboard = () => import('@/views/sale/dashboard/index-view.vue')

// Sales Flow Components
const Quotation = () => import('@/views/sale/quotation/index-view.vue')
const QuotationList = () => import('@/views/sale/quotation-list/index-view.vue')
const SaleOrder = () => import('@/views/sale/sale-order/index-view.vue')
const SaleOrderList = () => import('@/views/sale/saleorder-list/index-view.vue')
const ProductionOrder = () => import('@/views/sale/production-order/index-view.vue')
const StockReservation = () => import('@/views/sale/stock-reservation/index-view.vue')
const DeliveryNote = () => import('@/views/sale/delivery-note/index-view.vue')
const Invoice = () => import('@/views/sale/invoice/index-view.vue')
const InvoiceDetail = () => import('@/views/sale/invoice-detail/index-view.vue')
const PaymentDashboard = () => import('@/views/sale/payment-tracking/dashboard/index-view.vue')

// Fallback for incomplete components
const AccountView = () => import('@/views/setting/user-account/index-view.vue')

const routes = [
  {
    path: '/sale',
    component: Layout,
    redirect: '/sale/dashboard',
    name: 'sale',
    meta: {
      Displayname: {
        en: 'Sale',
        th: 'งานขาย'
      },
      classIcon: 'bi bi-receipt',
      majorShow: true,
      permissions: [PERMISSIONS.SALE_VIEW]
    },
    children: [
      // Sales Dashboard
      {
        path: '/sale/dashboard',
        name: 'sale-dashboard',
        component: SalesDashboard,
        meta: {
          Displayname: {
            en: 'Sales Dashboard',
            th: 'ภาพรวมงานขาย'
          },
          minorShow: true,
          permissions: [PERMISSIONS.SALE_VIEW]
        }
      },

      // Quotation Section
       {
        path: '/sale-quotation-list',
        name: 'sale-quotation-list',
        component: QuotationList,
        meta: {
          Displayname: {
            en: 'Quotation List',
            th: 'รายการใบเสนอราคา'
          },
          minorShow: true,
          permissions: [PERMISSIONS.SALE_VIEW]
        }
      },
      {
        path: '/sale-quotation',
        name: 'sale-quotation',
        component: Quotation,
        meta: {
          Displayname: {
            en: 'Quotation',
            th: 'เสนอราคา'
          },
          minorShow: true,
          permissions: [PERMISSIONS.SALE_CREATE]
        }
      },
     

      // Sales Order Section
      {
        path: '/sale-order-list',
        name: 'sale-order-list',
        component: SaleOrderList,
        meta: {
          Displayname: {
            en: 'Sale Order List',
            th: 'รายการใบสั่งขาย'
          },
          minorShow: true,
          permissions: [PERMISSIONS.SALE_VIEW]
        }
      },
      {
        path: '/sale-order',
        name: 'sale-order',
        component: SaleOrder,
        meta: {
          Displayname: {
            en: 'Sale Order',
            th: 'ใบสั่งขาย'
          },
          minorShow: true,
          permissions: [PERMISSIONS.SALE_CREATE]
        }
      },

      // Production Section
      // {
      //   path: '/sale/production-order',
      //   name: 'sale-production-order',
      //   component: ProductionOrder,
      //   meta: {
      //     Displayname: {
      //       en: 'Production Order',
      //       th: 'ใบสั่งผลิต'
      //     },
      //     minorShow: true,
      //     permissions: [PERMISSIONS.SALE_CREATE]
      //   }
      // },

      // Stock Management Section
      // {
      //   path: '/sale/stock-reservation',
      //   name: 'sale-stock-reservation',
      //   component: StockReservation,
      //   meta: {
      //     Displayname: {
      //       en: 'Stock Reservation',
      //       th: 'จองสต็อก'
      //     },
      //     minorShow: true,
      //     permissions: [PERMISSIONS.SALE_CREATE]
      //   }
      // },

      // Delivery Section
      // {
      //   path: '/sale/delivery-note',
      //   name: 'sale-delivery-note',
      //   component: DeliveryNote,
      //   meta: {
      //     Displayname: {
      //       en: 'Delivery Note',
      //       th: 'ใบส่งของ'
      //     },
      //     minorShow: true,
      //     permissions: [PERMISSIONS.SALE_CREATE]
      //   }
      // },

      // Invoice Section
      {
        path: '/sale/invoice',
        name: 'sale-invoice',
        component: Invoice,
        meta: {
          Displayname: {
            en: 'Invoice',
            th: 'ใบแจ้งหนี้'
          },
          minorShow: true,
          permissions: [PERMISSIONS.SALE_CREATE]
        }
      },
      {
        path: '/invoice-detail',
        name: 'invoice-detail',
        component: InvoiceDetail,
        meta: {
          Displayname: {
            en: 'Invoice Detail',
            th: 'รายละเอียด Invoice'
          },
          minorShow: false,
          permissions: [PERMISSIONS.SALE_VIEW]
        }
      },

      // Payment Section
      {
        path: '/sale/payment-dashboard',
        name: 'sale-payment-dashboard',
        component: PaymentDashboard,
        meta: {
          Displayname: {
            en: 'Payment Dashboard',
            th: 'ภาพรวมการชำระเงิน'
          },
          minorShow: true,
          permissions: [PERMISSIONS.SALE_VIEW]
        }
      },

      // Legacy Routes (for backward compatibility)
      // {
      //   path: '/sale-order',
      //   redirect: '/sale/sale-order'
      // },
      // {
      //   path: '/production-order',
      //   redirect: '/sale/production-order'
      // },
      // {
      //   path: '/Invoice',
      //   redirect: '/sale/invoice'
      // }
    ]
  }
]

export default routes
