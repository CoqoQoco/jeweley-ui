import { defineStore } from 'pinia'
//import axiosConfig from '@/axios/axios-config.js'
import axiosHelper from '@/axios/axios-helper.js'

//const { jewelry } = axiosHelper

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
    month: null,

    // Loading state
    isLoading: false
  }),

  getters: {
    // Main dashboard getters
    getStockSummary: (state) => state.stockSummary,
    getCategories: (state) => state.categories,
    getLastActivities: (state) => state.lastActivities,
    getLastUpdated: (state) => state.dataAtDate,
    getCategoryChartData: (state) => state.categories,

    // Today getters
    getTodaySummary: (state) => state.todaySummary,
    getTodayTransactions: (state) => state.todayTransactions,

    // Weekly getters
    getWeeklySummary: (state) => state.weeklySummary,
    getDailyMovements: (state) => state.dailyMovements,

    // Monthly getters
    getMonthlySummary: (state) => state.monthlySummary,
    getWeeklyComparisons: (state) => state.weeklyComparisons,

    // Loading getter
    getIsLoading: (state) => state.isLoading
  },

  actions: {
    /**
     * Fetch main dashboard data
     */
    async fetchDashboard(filters = {}) {
      this.isLoading = true
      try {
        const response = await axiosHelper.jewelry.post('/StockProduct/Dashboard', {
          Dashboard: {
            productType: filters.productType || null,
            productionType: filters.productionType || null,
            productionTypeSize: filters.productionTypeSize || null,
            status: filters.status || null,
            startDate: filters.startDate || null,
            endDate: filters.endDate || null
          }
        })

        console.log('API Response:', response)

        if (response) {
          this.stockSummary = response.summary || this.stockSummary
          this.categories = response.categories || []
          this.lastActivities = response.lastActivities || []
          this.dataAtDate = response.dataAtDate || new Date()
        }
      } catch (error) {
        console.error('Error fetching product dashboard:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Fetch today's report
     */
    async fetchTodayReport(filters = {}) {
      this.isLoading = true
      try {
        const response = await axiosHelper.jewelry.post('/StockProduct/Dashboard/Today', {
          Dashboard: {
            productType: filters.productType || null,
            productionType: filters.productionType || null,
            productionTypeSize: filters.productionTypeSize || null,
            status: filters.status || null
          }
        })

        if (response) {
          this.todaySummary = response.summary || this.todaySummary
          this.todayTransactions = response.transactions || []
        }
      } catch (error) {
        console.error('Error fetching today report:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Fetch weekly report
     */
    async fetchWeeklyReport(filters = {}) {
      this.isLoading = true
      try {
        const response = await axiosHelper.jewelry.post('/StockProduct/Dashboard/Weekly', {
          Dashboard: {
            productType: filters.productType || null,
            productionType: filters.productionType || null,
            productionTypeSize: filters.productionTypeSize || null,
            status: filters.status || null
          }
        })

        if (response) {
          this.weeklySummary = response.summary || this.weeklySummary
          this.dailyMovements = response.dailyMovements || []
          this.weekStartDate = response.weekStartDate
          this.weekEndDate = response.weekEndDate
          this.weekNumber = response.weekNumber
        }
      } catch (error) {
        console.error('Error fetching weekly report:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Fetch monthly report
     */
    async fetchMonthlyReport(filters = {}) {
      this.isLoading = true
      try {
        const response = await axiosHelper.jewelry.post('/StockProduct/Dashboard/Monthly', {
          Dashboard: {
            productType: filters.productType || null,
            productionType: filters.productionType || null,
            productionTypeSize: filters.productionTypeSize || null,
            status: filters.status || null
          }
        })

        if (response) {
          this.monthlySummary = response.summary || this.monthlySummary
          this.weeklyComparisons = response.weeklyComparisons || []
          this.monthStartDate = response.monthStartDate
          this.monthEndDate = response.monthEndDate
          this.monthName = response.monthName
          this.year = response.year
          this.month = response.month
        }
      } catch (error) {
        console.error('Error fetching monthly report:', error)
        throw error
      } finally {
        this.isLoading = false
      }
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
