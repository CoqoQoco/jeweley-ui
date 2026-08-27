<template>
  <div class="app-container home-dashboard">
    <component
      v-for="widget in visibleWidgets"
      :is="widget.component"
      :key="widget.key"
      class="home-dashboard-widget"
      v-bind="widgetProps[widget.key] || {}"
      v-on="widgetListeners[widget.key] || {}"
    />
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/modules/authen/authen-store.js'
import { useHomeDashboardStore } from '@/stores/modules/api/dashboard/home-dashboard-store.js'
import { PermissionService } from '@/services/permission/permission.js'
import { PERMISSIONS } from '@/services/permission/config.js'

import { DASHBOARD_WIDGETS } from './dashboard-registry.js'

export default {
  name: 'HomeDashboardView',

  setup() {
    const authStore = useAuthStore()
    const homeDashboardStore = useHomeDashboardStore()
    return { authStore, homeDashboardStore }
  },

  computed: {
    permissionService() {
      return new PermissionService(this.authStore.getUser, this.authStore.permissions)
    },

    // flags ที่ store.loadDashboard() ใช้ตัดสินใจว่าจะยิง endpoint ไหนบ้าง
    flags() {
      const p = this.permissionService
      return {
        canApprovePrePlan: p.hasPermission(PERMISSIONS.PRE_PLAN_APPROVE),
        canViewPrePlan: p.hasPermission(PERMISSIONS.PRE_PLAN_VIEW),
        canCreatePrePlan: p.hasPermission(PERMISSIONS.PRE_PLAN_CREATE),
        canViewProduction: p.hasPermission(PERMISSIONS.PRODUCTION_VIEW),
        canViewStockProductGr: p.hasPermission(PERMISSIONS.STOCK_PRODUCT_GR_PRODUCTION),
        canCreateGR: p.hasPermission(PERMISSIONS.STOCK_PRODUCT_GR_PRODUCTION_CREATE),
        canManageTicket: p.hasPermission(PERMISSIONS.TICKET_MANAGE),
        canViewStockGem: p.hasPermission(PERMISSIONS.STOCK_GEM_VIEW),
        canViewStockProduct: p.hasPermission(PERMISSIONS.STOCK_PRODUCT),
        canViewReport: p.hasPermission(PERMISSIONS.REPORT_VIEW),
        canViewSale: p.hasPermission(PERMISSIONS.SALE_VIEW),
        canCreateQuotation: p.hasPermission(PERMISSIONS.SALE_CREATE),
        canCreateCustomer: p.hasPermission(PERMISSIONS.CUSTOMER_CREATE)
      }
    },

    visibleWidgets() {
      return DASHBOARD_WIDGETS.filter((w) => this.permissionService.hasAnyPermission(w.permissions)).sort(
        (a, b) => a.order - b.order
      )
    },

    scrapWeightMonthTotal() {
      const scrap = this.homeDashboardStore.scrapWeight
      if (!scrap) return 0
      const currentMonth = new Date().getMonth() + 1
      const melt = (scrap.meltScrapData || []).find((m) => m.month === currentMonth)
      const cast = (scrap.castScrapData || []).find((m) => m.month === currentMonth)
      return (melt?.totalWeight || 0) + (cast?.totalWeight || 0)
    },

    actionCardsData() {
      const s = this.homeDashboardStore
      return {
        prePlanWaitingCount: s.prePlanWaitingCount,
        prePlanMyCount: s.prePlanMyCount,
        planTotal: s.dailyPlan.planCountTotal,
        planProcess: s.dailyPlan.planCountProcess,
        planCompletedYesterday: s.dailyPlan.planCountCompletedOnYesterday,
        planOverdue: s.dailyPlan.planCountOverdue,
        pendingGR: s.stockProductToday?.summary?.newStockItems ?? 0,
        ticketOpenCount: s.ticketOpenCount,
        ticketMyTotal: s.ticketMyList.total,
        ticketMyUnreadCount: s.ticketMyUnreadCount,
        scrapWeightMonth: this.scrapWeightMonthTotal
      }
    },

    quickActionsFlags() {
      return {
        canCreatePrePlan: this.flags.canCreatePrePlan,
        canCreateCustomer: this.flags.canCreateCustomer,
        canCreateGR: this.flags.canCreateGR,
        canCreateQuotation: this.flags.canCreateQuotation,
        canSearchStockProduct: this.flags.canViewStockProduct
      }
    },

    widgetProps() {
      return {
        'quick-actions': { flags: this.quickActionsFlags },
        'action-cards': { data: this.actionCardsData, flags: this.flags },
        'my-jobs': { jobs: this.homeDashboardStore.myJobs.data },
        'wip-by-stage': { rows: this.homeDashboardStore.wipByStage },
        'completed-trend': { rows: this.homeDashboardStore.completedSeries.rows },
        'recent-activities': { activities: this.homeDashboardStore.dailyPlan.recentActivity || [] },
        'stock-summary': {
          flags: { canViewStockGem: this.flags.canViewStockGem, canViewStockProduct: this.flags.canViewStockProduct },
          gem: this.homeDashboardStore.stockGem?.summary || {},
          product: this.homeDashboardStore.stockProduct?.summary || {}
        }
      }
    },

    widgetListeners() {
      return {
        'greeting-bar': { refresh: this.loadDashboard }
      }
    }
  },

  mounted() {
    this.loadDashboard()
  },

  methods: {
    loadDashboard() {
      this.homeDashboardStore.loadDashboard(this.flags)
    }
  }
}
</script>

<style lang="scss" scoped>
.home-dashboard {
  display: flex;
  flex-direction: column;
  gap: var(--sp-lg);
}
</style>
