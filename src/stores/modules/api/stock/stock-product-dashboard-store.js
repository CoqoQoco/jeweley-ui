import { defineStore } from 'pinia'
import axiosHelper from '@/axios/axios-helper.js'

export const useStockProductDashboardStore = defineStore('stockProductDashboard', {
  state: () => ({
    // Main dashboard data
    stockSummary: {
      totalProducts: 0,
      totalQuantity: 0,
      totalValue: 0,
      availableQuantity: 0,
      onProcessQuantity: 0,
      availableCount: 0,
      onProcessCount: 0
    },
    categories: [],
    lastActivities: [],
    dataAtDate: null,

    // Today report data
    todaySummary: {
      totalTransactions: 0,
      newStockItems: 0,
      totalValue: 0,
      priceChanges: 0,
      lowStockAlerts: 0
    },
    todayTransactions: [],

    // Weekly report data
    weeklySummary: {
      totalTransactions: 0,
      newStockItems: 0,
      totalValue: 0,
      priceChanges: 0,
      lowStockAlerts: 0
    },
    dailyMovements: [],
    weekStartDate: null,
    weekEndDate: null,
    weekNumber: '',

    // Monthly report data
    monthlySummary: {
      totalTransactions: 0,
      newStockItems: 0,
      totalValue: 0,
      priceChanges: 0,
      totalAvailableProducts: 0
    },
    weeklyComparisons: [],
    monthStartDate: null,
    monthEndDate: null,
    monthName: '',
    year: null,
    month: null
  }),

  getters: {
    // Main dashboard getters
    getStockSummary: (state) => state.stockSummary,
    getCategories: (state) => state.categories,
    getLastActivities: (state) => state.lastActivities,
    getLastUpdated: (state) => state.dataAtDate,

    // Chart data for CategoryChart (ChartGeneric expects { report: [...] })
    getCategoryChartData: (state) => {
      const categories = state.categories || []
      return {
        report: categories.map((cat) => {
          const label = `${cat.productTypeName} - ${cat.productionType} ${cat.productionTypeSize}`
          return {
            statusNameTH: label,
            statusNameEN: label,
            status: cat.productTypeName,
            description: `${cat.productionType} ${cat.productionTypeSize}`,
            count: cat.count,
            totalQuantity: cat.totalQuantity,
            totalOnProcessQuantity: cat.totalOnProcessQuantity,
            totalValue: cat.totalValue,
            averagePrice: cat.averagePrice
          }
        })
      }
    },

    // Today getters
    getTodaySummary: (state) => state.todaySummary,
    getTodayTransactions: (state) => state.todayTransactions,

    // Weekly getters
    getWeeklySummary: (state) => state.weeklySummary,
    getDailyMovements: (state) => state.dailyMovements,

    // Monthly getters
    getMonthlySummary: (state) => state.monthlySummary,
    getWeeklyComparisons: (state) => state.weeklyComparisons
  },

  actions: {
    // Build request filter shared by Dashboard/Today/Weekly/Monthly endpoints
    buildFilter(filters = {}) {
      return {
        productType: filters.productType || null,
        productionType: filters.productionType || null,
        productionTypeSize: filters.productionTypeSize || null,
        status: filters.status || null,
        startDate: filters.startDate || null,
        endDate: filters.endDate || null
      }
    },

    /**
     * Fetch main dashboard data
     */
    async fetchDashboard(filters = {}) {
      const response = await axiosHelper.jewelry.post('/StockProduct/Dashboard', {
        Dashboard: this.buildFilter(filters)
      })
      this.stockSummary = response?.summary || this.stockSummary
      this.categories = response?.categories || []
      this.lastActivities = response?.lastActivities || []
      this.dataAtDate = response?.dataAtDate || new Date()
    },

    /**
     * Fetch today's report
     */
    async fetchTodayReport(filters = {}) {
      const response = await axiosHelper.jewelry.post('/StockProduct/Dashboard/Today', {
        Dashboard: this.buildFilter(filters)
      })
      this.todaySummary = response?.summary || this.todaySummary
      this.todayTransactions = response?.transactions || []
    },

    /**
     * Fetch weekly report
     */
    async fetchWeeklyReport(filters = {}) {
      const response = await axiosHelper.jewelry.post('/StockProduct/Dashboard/Weekly', {
        Dashboard: this.buildFilter(filters)
      })
      this.weeklySummary = response?.summary || this.weeklySummary
      this.dailyMovements = response?.dailyMovements || []
      this.weekStartDate = response?.weekStartDate
      this.weekEndDate = response?.weekEndDate
      this.weekNumber = response?.weekNumber
    },

    /**
     * Fetch monthly report
     */
    async fetchMonthlyReport(filters = {}) {
      const response = await axiosHelper.jewelry.post('/StockProduct/Dashboard/Monthly', {
        Dashboard: this.buildFilter(filters)
      })
      this.monthlySummary = response?.summary || this.monthlySummary
      this.weeklyComparisons = response?.weeklyComparisons || []
      this.monthStartDate = response?.monthStartDate
      this.monthEndDate = response?.monthEndDate
      this.monthName = response?.monthName
      this.year = response?.year
      this.month = response?.month
    },

    /**
     * Refresh all dashboard data
     */
    async refreshAll(filters = {}) {
      await this.fetchDashboard(filters)
    },

    /**
     * Clear all data
     */
    clearData() {
      this.stockSummary = {
        totalProducts: 0,
        totalQuantity: 0,
        totalValue: 0,
        availableQuantity: 0,
        onProcessQuantity: 0,
        availableCount: 0,
        onProcessCount: 0
      }
      this.categories = []
      this.lastActivities = []
      this.todayTransactions = []
      this.dailyMovements = []
      this.weeklyComparisons = []
    }
  }
})
