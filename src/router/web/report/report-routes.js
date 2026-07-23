const Layout = () => import('@/layout/web/LayoutDashboard.vue')

// ---- production reports ----
const ProductionDashboard = () => import('@/views/production/dashboard/index-view.vue')
const reportPlanCompletedWithAllGold = () =>
  import('@/views/production/report/plan-completed-all-gold/index-view.vue')
const PlanBOMReport = () => import('@/views/production/plan-bom/index-view.vue')
const GoldCostReport = () => import('@/views/production/report/gold-cost-report/index-view.vue')
const WipByStageReport = () => import('@/views/production/report/wip-by-stage-report/index-view.vue')
const TransferReport = () => import('@/views/production/report/transfer-report/index-view.vue')
const GoldLossMonthlyReport = () =>
  import('@/views/production/report/gold-loss-monthly-report/index-view.vue')
const GoldLossByStageReport = () =>
  import('@/views/production/report/gold-loss-by-stage-report/index-view.vue')
const ProductionPriceReport = () =>
  import('@/views/production/report/production-price-report/index-view.vue')
const LeadTimeReport = () =>
  import('@/views/production/report/lead-time-report/index-view.vue')
const CastLossTrendReport = () =>
  import('@/views/production/report/cast-loss-trend-report/index-view.vue')
const PrePlanFunnelReport = () =>
  import('@/views/production/report/preplan-funnel-report/index-view.vue')

// ---- stock product reports ----
const ProductDashboard = () => import('@/views/receipt-stock/product/dashboard/dashboard-view.vue')
const ReportGR = () => import('@/views/receipt-stock/product/report-gr/index-view.vue')
const StorageMoveReport = () => import('@/views/stock/storage-move-report/index-view.vue')
const StockBalanceSummaryReport = () =>
  import('@/views/receipt-stock/product/balance-summary/index-view.vue')

// ---- stock gem reports ----
const stockGemDashboard = () => import('@/views/receipt-stock/gem/dashboard/dashboard-view.vue')
const GemOnhandReport = () => import('@/views/receipt-stock/gem/report/index-view.vue')
const GemMovementReport = () => import('@/views/receipt-stock/gem/movement-report/index-view.vue')
const MaterialValuationReport = () => import('@/views/receipt-stock/material-valuation/index-view.vue')

// ---- sale reports ----
const PaymentDashboard = () => import('@/views/sale/payment-tracking/dashboard/index-view.vue')

// ---- worker reports ----
const ReportProductionWages = () => import('@/views/report-production-wages/index-view.vue')
const WorkerWagesByPersonReport = () =>
  import('@/views/production/report/worker-wages-by-person-report/index-view.vue')
const GoldLossTangByWorkerReport = () =>
  import('@/views/production/report/gold-loss-tang-by-worker-report/index-view.vue')
const WagesByProcessReport = () =>
  import('@/views/production/report/wages-by-process-report/index-view.vue')
const WagesMonthlyTrendReport = () =>
  import('@/views/production/report/wages-monthly-trend-report/index-view.vue')

import { PERMISSIONS } from '@/services/permission/config.js'

const routes = [
  // ------------------ report: production -------------------
  {
    path: '/report-production',
    component: Layout,
    redirect: '/production-dashboard',
    name: 'report-production',
    meta: {
      Displayname: {
        en: 'Production Reports',
        th: 'รายงานฝ่ายผลิต'
      },
      classIcon: 'bi bi-clipboard-data',
      majorShow: true,
      btsubLineShow: true,
      menuSection: 'report',
      permissions: [PERMISSIONS.PRODUCTION_VIEW]
    },
    children: [
      {
        path: '/production-dashboard',
        name: 'production-dashboard',
        component: ProductionDashboard,
        meta: {
          Displayname: {
            en: 'Dashboard',
            th: 'แดชบอร์ด'
          },
          minorShow: true,
          permissions: [PERMISSIONS.PRODUCTION_VIEW]
        }
      },
      {
        path: '/report-plan-completed-with-all-gold',
        name: 'report-plan-completed-with-all-gold',
        component: reportPlanCompletedWithAllGold,
        meta: {
          Displayname: {
            en: 'Completed Plan Report',
            th: 'รายงานแผนผลิตสำเร็จ'
          },
          minorShow: true,
          permissions: [PERMISSIONS.PRODUCTION_VIEW]
        }
      },
      {
        path: '/plan-bom-report',
        name: 'plan-bom-report',
        component: PlanBOMReport,
        meta: {
          Displayname: {
            en: 'BOM Report',
            th: 'รายงานวัตถุดิบ'
          },
          minorShow: true,
          permissions: [PERMISSIONS.PRODUCTION_VIEW]
        }
      },
      {
        path: '/report-gold-cost',
        name: 'report-gold-cost',
        component: GoldCostReport,
        meta: {
          Displayname: {
            en: 'Gold Cost Report',
            th: 'รายงานใบเบิกผสมทอง'
          },
          minorShow: true,
          permissions: [PERMISSIONS.PRODUCTION_VIEW]
        }
      },
      {
        path: '/report-wip-by-stage',
        name: 'report-wip-by-stage',
        component: WipByStageReport,
        meta: {
          Displayname: {
            en: 'Work In Process Report',
            th: 'รายงานงานระหว่างผลิต'
          },
          minorShow: true,
          permissions: [PERMISSIONS.PRODUCTION_VIEW]
        }
      },
      {
        path: '/report-transfer',
        name: 'report-transfer',
        component: TransferReport,
        meta: {
          Displayname: {
            en: 'Job Transfer Report',
            th: 'รายงานการโอนงาน'
          },
          minorShow: true,
          permissions: [PERMISSIONS.PRODUCTION_VIEW]
        }
      },
      {
        path: '/report-gold-loss-monthly',
        name: 'report-gold-loss-monthly',
        component: GoldLossMonthlyReport,
        meta: {
          Displayname: {
            en: 'Monthly Gold Loss Report',
            th: 'รายงาน Gold Loss รายเดือน'
          },
          minorShow: true,
          permissions: [PERMISSIONS.PRODUCTION_VIEW]
        }
      },
      {
        path: '/report-gold-loss-by-stage',
        name: 'report-gold-loss-by-stage',
        component: GoldLossByStageReport,
        meta: {
          Displayname: {
            en: 'Gold Loss by Stage Report',
            th: 'รายงาน Gold Loss แยกตาม Stage'
          },
          minorShow: true,
          permissions: [PERMISSIONS.PRODUCTION_VIEW]
        }
      },
      {
        path: '/report-production-price',
        name: 'report-production-price',
        component: ProductionPriceReport,
        meta: {
          Displayname: {
            en: 'Production Valuation Report',
            th: 'รายงานประเมินราคางานผลิต'
          },
          minorShow: true,
          permissions: [PERMISSIONS.PRODUCTION_VIEW]
        }
      },
      {
        path: '/report-lead-time',
        name: 'report-lead-time',
        component: LeadTimeReport,
        meta: {
          Displayname: {
            en: 'Production Lead Time Report',
            th: 'รายงาน Lead-time การผลิต'
          },
          minorShow: true,
          permissions: [PERMISSIONS.PRODUCTION_VIEW]
        }
      },
      {
        path: '/report-cast-loss-trend',
        name: 'report-cast-loss-trend',
        component: CastLossTrendReport,
        meta: {
          Displayname: {
            en: 'Cast Loss Trend Report',
            th: 'รายงาน Cast Loss Trend รายเดือน'
          },
          minorShow: true,
          permissions: [PERMISSIONS.PRODUCTION_VIEW]
        }
      },
      {
        path: '/report-preplan-funnel',
        name: 'report-preplan-funnel',
        component: PrePlanFunnelReport,
        meta: {
          Displayname: {
            en: 'Pre-Plan Funnel Report',
            th: 'รายงาน Pre-Plan Funnel'
          },
          minorShow: true,
          permissions: [PERMISSIONS.PRODUCTION_VIEW]
        }
      }
    ]
  },

  // ------------------ report: stock product -------------------
  {
    path: '/report-stock-product',
    component: Layout,
    redirect: '/stock-product-dashboard',
    name: 'report-stock-product',
    meta: {
      Displayname: {
        en: 'Stock Product Reports',
        th: 'รายงานคลังสินค้า'
      },
      classIcon: 'bi bi-bar-chart-line',
      majorShow: true,
      btsubLineShow: true,
      menuSection: 'report',
      permissions: [PERMISSIONS.STOCK_PRODUCT]
    },
    children: [
      {
        path: '/stock-product-dashboard',
        name: 'stock-product-dashboard',
        component: ProductDashboard,
        menuId: 'Dashboard',
        meta: {
          Displayname: {
            en: 'Dashboard',
            th: 'แดชบอร์ด'
          },
          minorShow: true,
          menuId: 'stock-product-dashboard',
          permissions: [PERMISSIONS.STOCK_PRODUCT]
        }
      },
      {
        path: '/goods-receipt-report',
        name: 'goods-receipt-report',
        component: ReportGR,
        meta: {
          Displayname: {
            en: 'Goods Receipt Report',
            th: 'รายงานรับสินค้า'
          },
          minorShow: true,
          permissions: [PERMISSIONS.STOCK_PRODUCT]
        }
      },
      {
        path: '/storage-move-report',
        name: 'storage-move-report',
        component: StorageMoveReport,
        meta: {
          Displayname: {
            en: 'Storage Location Move Report',
            th: 'รายงานการย้าย Storage Location'
          },
          minorShow: true,
          permissions: [PERMISSIONS.STOCK_PRODUCT]
        }
      },
      {
        path: '/stock-balance-summary-report',
        name: 'stock-balance-summary-report',
        component: StockBalanceSummaryReport,
        meta: {
          Displayname: {
            en: 'Stock Balance Summary Report',
            th: 'สรุปยอดคงเหลือคลัง'
          },
          minorShow: true,
          permissions: [PERMISSIONS.STOCK_PRODUCT]
        }
      }
    ]
  },

  // ------------------ report: stock gem (raw material) -------------------
  {
    path: '/report-stock-gem',
    component: Layout,
    redirect: '/stock-gem-dashboard',
    name: 'report-stock-gem',
    meta: {
      Displayname: {
        en: 'Raw Material Reports',
        th: 'รายงานคลังวัตถุดิบ'
      },
      classIcon: 'bi bi-bar-chart-line',
      majorShow: true,
      btsubLineShow: true,
      menuSection: 'report',
      permissions: [PERMISSIONS.STOCK_GEM_VIEW]
    },
    children: [
      {
        path: '/stock-gem-dashboard',
        name: 'stock-gem-dashboard',
        component: stockGemDashboard,
        menuId: 'DASHBOARD',
        meta: {
          Displayname: {
            en: 'Dashboard',
            th: 'แดชบอร์ด'
          },
          minorShow: true,
          permissions: [PERMISSIONS.STOCK_GEM_VIEW]
        }
      },
      {
        path: '/stock-gem-report',
        name: 'stock-gem-report',
        component: GemOnhandReport,
        meta: {
          Displayname: {
            en: 'Gem Stock On-hand Valuation Report',
            th: 'รายงานพลอย-เพชรคงคลัง (มูลค่า)'
          },
          minorShow: true,
          permissions: [PERMISSIONS.STOCK_GEM_VIEW]
        }
      },
      {
        path: '/stock-gem-movement-report',
        name: 'stock-gem-movement-report',
        component: GemMovementReport,
        meta: {
          Displayname: {
            en: 'Gem Receipt-Issue Ledger Report',
            th: 'รายงานรับ-จ่ายพลอย'
          },
          minorShow: true,
          permissions: [PERMISSIONS.STOCK_GEM_VIEW]
        }
      },
      {
        path: '/material-valuation-report',
        name: 'material-valuation-report',
        component: MaterialValuationReport,
        meta: {
          Displayname: {
            en: 'Material Valuation Report',
            th: 'มูลค่าวัตถุดิบคงคลังแยกชนิด'
          },
          minorShow: true,
          permissions: [PERMISSIONS.STOCK_GEM_VIEW]
        }
      }
    ]
  },

  // ------------------ report: sale -------------------
  {
    path: '/report-sale',
    component: Layout,
    redirect: '/sale/payment-dashboard',
    name: 'report-sale',
    meta: {
      Displayname: {
        en: 'Sale Reports',
        th: 'รายงานฝ่ายขาย'
      },
      classIcon: 'bi bi-graph-up-arrow',
      majorShow: true,
      btsubLineShow: true,
      menuSection: 'report',
      permissions: [PERMISSIONS.SALE_VIEW]
    },
    children: [
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
      }
    ]
  },

  // ------------------ report: worker -------------------
  {
    path: '/report-worker',
    component: Layout,
    redirect: '/report-production-worker-wages',
    name: 'report-worker',
    meta: {
      Displayname: {
        en: 'Worker Reports',
        th: 'รายงานช่าง'
      },
      classIcon: 'bi bi-file-spreadsheet',
      majorShow: true,
      btsubLineShow: true,
      menuSection: 'report',
      permissions: [PERMISSIONS.WORKER_VIEW]
    },
    children: [
      {
        path: '/report-production-worker-wages',
        name: 'report-production-worker-wages',
        component: ReportProductionWages,
        meta: {
          Displayname: {
            en: 'Wages Report',
            th: 'รายงานค่าแรงช่าง'
          },
          minorShow: false,
          permissions: [PERMISSIONS.WORKER_VIEW]
        }
      },
      {
        path: '/report-worker-wages-by-person',
        name: 'report-worker-wages-by-person',
        component: WorkerWagesByPersonReport,
        meta: {
          Displayname: {
            en: 'Worker Wages Summary',
            th: 'รายงานค่าแรงช่างต่อคน'
          },
          minorShow: true,
          permissions: [PERMISSIONS.WORKER_VIEW]
        }
      },
      {
        path: '/report-gold-loss-tang-by-worker',
        name: 'report-gold-loss-tang-by-worker',
        component: GoldLossTangByWorkerReport,
        meta: {
          Displayname: {
            en: 'Gold Loss by Worker Report',
            th: 'รายงาน Gold Loss ช่างแต่งต่อคน'
          },
          minorShow: true,
          permissions: [PERMISSIONS.WORKER_VIEW]
        }
      },
      {
        path: '/report-worker-wages-by-process',
        name: 'report-worker-wages-by-process',
        component: WagesByProcessReport,
        meta: {
          Displayname: {
            en: 'Wages by Process Report',
            th: 'รายงานค่าแรงแยกตามประเภทงาน'
          },
          minorShow: true,
          permissions: [PERMISSIONS.WORKER_VIEW]
        }
      },
      {
        path: '/report-worker-wages-trend',
        name: 'report-worker-wages-trend',
        component: WagesMonthlyTrendReport,
        meta: {
          Displayname: {
            en: 'Wages Monthly Trend Report',
            th: 'รายงานแนวโน้มค่าแรงรายเดือน'
          },
          minorShow: true,
          permissions: [PERMISSIONS.WORKER_VIEW]
        }
      }
    ]
  }
]

export default routes
