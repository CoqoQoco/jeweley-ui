import { PERMISSIONS } from '@/services/permission/config.js'
const Layout = () => import('@/layout/web/LayoutDashboard.vue')

// Sales Dashboard
const SalesDashboard = () => import('@/views/sale/dashboard/index-view.vue')

// Stock Basket
const StockBasketList = () => import('@/views/sale/stock-basket/index-view.vue')
const StockBasketView = () => import('@/views/sale/stock-basket/components/basket-view.vue')

// Sales Flow Components
const Quotation = () => import('@/views/sale/quotation/index-view.vue')
const QuotationList = () => import('@/views/sale/quotation-list/index-view.vue')
const SaleOrder = () => import('@/views/sale/sale-order/index-view.vue')
const SaleOrderList = () => import('@/views/sale/saleorder-list/index-view.vue')
const Invoice = () => import('@/views/sale/invoice/index-view.vue')
const InvoiceDetail = () => import('@/views/sale/invoice-detail/index-view.vue')

// Material Sale
const MaterialSaleList = () => import('@/views/sale/material-sale/index-view.vue')
const MaterialSaleCreate = () => import('@/views/sale/material-sale/create-view.vue')

// Billing Note
const BillingNoteList = () => import('@/views/sale/billing-note/index-view.vue')
const BillingNoteCreate = () => import('@/views/sale/billing-note/create-view.vue')
const BillingNoteDetail = () => import('@/views/sale/billing-note/detail-view.vue')

// Cost Stock - Appraisal
const CostStockEdit = () => import('@/views/sale/cost-stock/web/cost-edit/index-view.vue')

// Sale Document
const SaleDocument = () => import('@/views/sale/document/index-view.vue')
const SaleDocumentCatalogBuilder = () => import('@/views/sale/document/catalog-builder/index-view.vue')

// Export Shipment
const ExportShipmentList = () => import('@/views/sale/export-shipment/index-view.vue')
const ExportShipmentBuilder = () => import('@/views/sale/export-shipment/builder-view.vue')

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

      // Cost Stock - Appraisal Section
      {
        path: '/sale/cost-stock-edit',
        name: 'cost-stock-edit',
        component: CostStockEdit,
        meta: {
          Displayname: {
            en: 'Stock Appraisal',
            th: 'ตีราคาสินค้า'
          },
          minorShow: true,
          permissions: [PERMISSIONS.SALE_CREATE]
        }
      },

      // Quotation Section
       {
        path: '/sale-quotation-list',
        name: 'sale-quotation-list',
        component: QuotationList,
        meta: {
          Displayname: {
            en: 'Quotation',
            th: 'ใบเสนอราคา'
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
          minorShow: false,
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
            en: 'Sale Order (Product)',
            th: 'ใบสั่งขาย (สินค้า)'
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
            en: 'Sale Order (Product)',
            th: 'ใบสั่งขาย (สินค้า)'
          },
          minorShow: false,
          permissions: [PERMISSIONS.SALE_CREATE]
        }
      },

      // Material Sale Section
      {
        path: '/sale/material-sale',
        name: 'sale-material-sale',
        component: MaterialSaleList,
        meta: {
          Displayname: {
            en: 'Sale Order (Material)',
            th: 'ใบสั่งขาย (วัตถุดิบ)'
          },
          minorShow: true,
          permissions: [PERMISSIONS.SALE_VIEW]
        }
      },
      {
        path: '/sale/material-sale/create',
        name: 'sale-material-sale-create',
        component: MaterialSaleCreate,
        meta: {
          Displayname: {
            en: 'Create Material Sale',
            th: 'สร้างใบขายวัตถุดิบ'
          },
          minorShow: false,
          permissions: [PERMISSIONS.SALE_CREATE]
        }
      },
      {
        path: '/sale/material-sale/:running',
        name: 'sale-material-sale-detail',
        component: MaterialSaleCreate,
        meta: {
          Displayname: {
            en: 'Material Sale Detail',
            th: 'รายละเอียดใบขายวัตถุดิบ'
          },
          minorShow: false,
          permissions: [PERMISSIONS.SALE_VIEW]
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

      // Billing Note Section
      {
        path: '/sale/billing-note',
        name: 'sale-billing-note',
        component: BillingNoteList,
        meta: {
          Displayname: {
            en: 'Billing Note',
            th: 'ใบวางบิล'
          },
          minorShow: true,
          permissions: [PERMISSIONS.SALE_VIEW]
        }
      },
      {
        path: '/sale/billing-note/create',
        name: 'sale-billing-note-create',
        component: BillingNoteCreate,
        meta: {
          Displayname: {
            en: 'Create Billing Note',
            th: 'สร้างใบวางบิล'
          },
          minorShow: false,
          permissions: [PERMISSIONS.SALE_CREATE]
        }
      },
      {
        path: '/sale/billing-note/edit/:running',
        name: 'sale-billing-note-edit',
        component: BillingNoteCreate,
        meta: {
          Displayname: {
            en: 'Edit Billing Note',
            th: 'แก้ไขใบวางบิล'
          },
          minorShow: false,
          permissions: [PERMISSIONS.SALE_CREATE]
        }
      },
      {
        path: '/sale/billing-note/:running',
        name: 'sale-billing-note-detail',
        component: BillingNoteDetail,
        meta: {
          Displayname: {
            en: 'Billing Note Detail',
            th: 'รายละเอียดใบวางบิล'
          },
          minorShow: false,
          permissions: [PERMISSIONS.SALE_VIEW]
        }
      },

      // Sale Document
      {
        path: '/sale/document',
        name: 'sale-document',
        component: SaleDocument,
        meta: {
          Displayname: {
            en: 'Sale Document',
            th: 'เอกสารสินค้า'
          },
          minorShow: true,
          permissions: [PERMISSIONS.SALE_VIEW]
        }
      },
      {
        path: '/sale/document/catalog/create',
        name: 'sale-document-catalog-create',
        component: SaleDocumentCatalogBuilder,
        meta: {
          Displayname: {
            en: 'Create Catalog',
            th: 'สร้างเอกสาร Lookbook'
          },
          minorShow: false,
          permissions: [PERMISSIONS.SALE_VIEW]
        }
      },
      {
        path: '/sale/document/catalog/edit/:id',
        name: 'sale-document-catalog-edit',
        component: SaleDocumentCatalogBuilder,
        meta: {
          Displayname: {
            en: 'Edit Catalog',
            th: 'แก้ไขเอกสาร Lookbook'
          },
          minorShow: false,
          permissions: [PERMISSIONS.SALE_VIEW]
        }
      },

      // Export Shipment Section
      {
        path: '/sale/export-shipment',
        name: 'sale-export-shipment',
        component: ExportShipmentList,
        meta: {
          Displayname: {
            en: 'Export Shipment',
            th: 'เอกสารส่งออก-งานแฟร์'
          },
          minorShow: true,
          permissions: [PERMISSIONS.SALE_VIEW]
        }
      },
      {
        path: '/sale/export-shipment/create',
        name: 'sale-export-shipment-create',
        component: ExportShipmentBuilder,
        meta: {
          Displayname: {
            en: 'Create Export Shipment',
            th: 'สร้างเอกสารส่งออก'
          },
          minorShow: false,
          permissions: [PERMISSIONS.SALE_CREATE]
        }
      },
      {
        path: '/sale/export-shipment/:running',
        name: 'sale-export-shipment-edit',
        component: ExportShipmentBuilder,
        meta: {
          Displayname: {
            en: 'Export Shipment Detail',
            th: 'รายละเอียดเอกสารส่งออก'
          },
          minorShow: false,
          permissions: [PERMISSIONS.SALE_VIEW]
        }
      },

      // Stock Basket Section
      {
        path: '/sale/stock-basket',
        name: 'sale-stock-basket',
        component: StockBasketList,
        meta: {
          Displayname: {
            en: 'Stock Basket',
            th: 'ตะกร้าสินค้า'
          },
          minorShow: false,
          permissions: [PERMISSIONS.SALE_VIEW]
        }
      },
      {
        path: '/sale/stock-basket/:running',
        name: 'sale-stock-basket-detail',
        component: StockBasketView,
        meta: {
          Displayname: {
            en: 'Stock Basket Detail',
            th: 'รายละเอียดตะกร้าสินค้า'
          },
          minorShow: false,
          permissions: [PERMISSIONS.SALE_CREATE]
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
