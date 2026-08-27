import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'

const emptyDailyPlan = () => ({
  dataAtDate: null,
  planCountTotal: 0,
  planCountProcess: 0,
  planCountCompletedOnYesterday: 0,
  planCountOverdue: 0,
  report: [],
  recentActivity: []
})

const emptyCompletedSeries = () => ({
  rows: [],
  total: 0,
  daysElapsed: 0,
  daysInPeriod: 0
})

const emptyListResult = () => ({ data: [], total: 0 })

export const useHomeDashboardStore = defineStore('homeDashboard', {
  state: () => ({
    dailyPlan: emptyDailyPlan(),
    completedSeries: emptyCompletedSeries(),
    wipByStage: [],
    stockGem: null,
    stockProduct: null,
    scrapWeight: null,
    myJobs: emptyListResult(),
    prePlanWaitingCount: 0,
    prePlanMyCount: 0,
    stockProductToday: null,
    ticketOpenCount: 0,
    ticketMyUnreadCount: 0,
    ticketMyList: emptyListResult(),
    customerProductionStatus: emptyListResult()
  }),

  actions: {
    async fetchMyJobs() {
      const res = await api.jewelry.post(
        'User/ListMyJob',
        { take: 5, skip: 0, sort: null, search: { isActive: true } },
        { skipLoading: true, skipError: true }
      )
      this.myJobs = res ? { data: res.data || [], total: res.total || 0 } : emptyListResult()
    },

    async fetchPrePlanWaitingCount() {
      const res = await api.jewelry.get('ProductionPrePlan/WaitingCount', {}, { skipLoading: true, skipError: true })
      this.prePlanWaitingCount = res?.count ?? 0
    },

    async fetchPrePlanMyCount() {
      const res = await api.jewelry.post(
        'ProductionPrePlan/Search',
        { take: 1, skip: 0, sort: null, includeCompleted: false },
        { skipLoading: true, skipError: true }
      )
      this.prePlanMyCount = res?.total ?? 0
    },

    async fetchDailyPlan() {
      const res = await api.jewelry.post(
        'Production/Plan/DailyPlan',
        {
          search: {
            start: null,
            end: null,
            sendStart: null,
            sendEnd: null,
            createStart: null,
            createEnd: null,
            text: null,
            woText: null,
            status: null,
            isOverPlan: 0,
            customerType: null,
            customerCode: null,
            gold: null,
            goldSize: null,
            mold: null,
            productNumber: null,
            productType: null
          }
        },
        { skipLoading: true, skipError: true }
      )
      this.dailyPlan = res
        ? {
            dataAtDate: res.dataAtDate || null,
            planCountTotal: res.planCountTotal || 0,
            planCountProcess: res.planCountProcess || 0,
            planCountCompletedOnYesterday: res.planCountCompletedOnYesterday || 0,
            planCountOverdue: res.planCountOverdue || 0,
            report: res.report || [],
            recentActivity: res.recentActivity || []
          }
        : emptyDailyPlan()
    },

    async fetchWipByStage() {
      const res = await api.jewelry.post(
        'Production/Plan/StatusDetailList',
        { take: 0, skip: 0, sort: [], search: {} },
        { skipLoading: true, skipError: true }
      )
      const rows = res?.data || []
      const grouped = rows.reduce((acc, row) => {
        const key = row.typeStatusName || '-'
        acc[key] = (acc[key] || 0) + 1
        return acc
      }, {})
      this.wipByStage = Object.entries(grouped).map(([name, count]) => ({ name, count }))
    },

    async fetchCompletedDailySeries() {
      const res = await api.jewelry.post('Production/Plan/CompletedDailySeries', {}, { skipLoading: true, skipError: true })
      this.completedSeries = res
        ? {
            rows: res.rows || [],
            total: res.total || 0,
            daysElapsed: res.daysElapsed || 0,
            daysInPeriod: res.daysInPeriod || 0
          }
        : emptyCompletedSeries()
    },

    async fetchStockProductToday() {
      const res = await api.jewelry.post('StockProduct/Dashboard/Today', { Dashboard: {} }, { skipLoading: true, skipError: true })
      this.stockProductToday = res || null
    },

    async fetchStockGem() {
      const res = await api.jewelry.post(
        'StockGem/Dashboard',
        { dashboard: { startDate: null, endDate: null, groupName: null, shape: null, grade: null, groupBy: 'group' } },
        { skipLoading: true, skipError: true }
      )
      this.stockGem = res || null
    },

    async fetchStockProduct() {
      const res = await api.jewelry.post(
        '/StockProduct/Dashboard',
        { Dashboard: { productType: null, productionType: null, productionTypeSize: null, status: null, startDate: null, endDate: null } },
        { skipLoading: true, skipError: true }
      )
      this.stockProduct = res || null
    },

    async fetchScrapWeight() {
      const res = await api.jewelry.get('ProductionPlanCost/ScrapWeightDashboard', {}, { skipLoading: true, skipError: true })
      this.scrapWeight = res || null
    },

    async fetchTicketOpenCount() {
      const res = await api.jewelry.post('Ticket/CountOpen', {}, { skipLoading: true, skipError: true })
      this.ticketOpenCount = typeof res === 'number' ? res : 0
    },

    async fetchTicketMyUnreadCount() {
      const res = await api.jewelry.post('Ticket/CountMyUnread', {}, { skipLoading: true, skipError: true })
      this.ticketMyUnreadCount = typeof res === 'number' ? res : 0
    },

    async fetchTicketMyList() {
      const res = await api.jewelry.post('Ticket/MyTicket', { take: 5, skip: 0 }, { skipLoading: true, skipError: true })
      this.ticketMyList = res ? { data: res.data || [], total: res.total || 0 } : emptyListResult()
    },

    // SaleReport/CustomerProductionStatus ถูกพัฒนาคู่ขนานโดย agent อื่น — อาจ 404 ระหว่าง local dev
    // skipError: true กัน swAlert modal ที่ axios-helper ยิงอัตโนมัติ; .catch(() => null) กัน promise
    // reject หลุดออกไปด้วย (ไม่ใช่ try-catch ครอบ) — ป้องกันสองชั้นเพื่อ degrade แบบ empty state เสมอ
    async fetchCustomerProductionStatus(onlyMyCustomers = true) {
      const res = await api.jewelry
        .post('SaleReport/CustomerProductionStatus', { onlyMyCustomers, take: 5, skip: 0 }, { skipLoading: true, skipError: true })
        .catch(() => null)
      this.customerProductionStatus = res ? { data: res.data || [], total: res.total || 0 } : emptyListResult()
    },

    // Orchestrator — เรียกเฉพาะ endpoint ของ widget ที่ผ่าน permission filter แล้วเท่านั้น
    // (flags มาจาก PermissionService ที่ index-view.vue คำนวณไว้)
    async loadDashboard(flags = {}) {
      const tasks = [this.fetchMyJobs(), this.fetchTicketMyUnreadCount(), this.fetchTicketMyList()]

      if (flags.canApprovePrePlan) tasks.push(this.fetchPrePlanWaitingCount())
      if (flags.canViewPrePlan) tasks.push(this.fetchPrePlanMyCount())
      if (flags.canViewProduction) {
        tasks.push(this.fetchDailyPlan())
        tasks.push(this.fetchWipByStage())
        tasks.push(this.fetchCompletedDailySeries())
      }
      if (flags.canViewStockProductGr) tasks.push(this.fetchStockProductToday())
      if (flags.canManageTicket) tasks.push(this.fetchTicketOpenCount())
      if (flags.canViewStockGem) tasks.push(this.fetchStockGem())
      if (flags.canViewStockProduct) tasks.push(this.fetchStockProduct())
      if (flags.canViewReport) tasks.push(this.fetchScrapWeight())
      if (flags.canViewSale) tasks.push(this.fetchCustomerProductionStatus(true))

      await Promise.allSettled(tasks)
    }
  }
})
