import { defineStore } from 'pinia'
import axiosHelper from '@/axios/axios-helper.js'

export const useStockGemDashboardStore = defineStore('stockGemDashboard', {
  state: () => ({
    isLoading: false,
    dashboardData: null,
    todayReport: null,
    weeklyReport: null,
    monthlyReport: null,
    lastUpdated: null,
    error: null
  }),

  getters: {
    // Loading state
    getIsLoading: (state) => state.isLoading,
    getLastUpdated: (state) => state.lastUpdated,
    getError: (state) => state.error,

    // Dashboard data getters
    getDashboardData: (state) => state.dashboardData,
    getTodayReport: (state) => state.todayReport,
    getWeeklyReport: (state) => state.weeklyReport,
    getMonthlyReport: (state) => state.monthlyReport,

    // Main dashboard summary
    getStockSummary: (state) => state.dashboardData?.summary || {},
    getCategories: (state) => state.dashboardData?.categories || [],
    getTrends: (state) => state.dashboardData?.trends || [],
    getTopMovements: (state) => state.dashboardData?.topMovements || [],
    getPriceAlerts: (state) => state.dashboardData?.priceAlerts || [],
    getLastActivities: (state) => state.dashboardData?.lastActivities || [],

    // Today report getters
    getTodaySummary: (state) => state.todayReport?.summary || {},
    getTodayTransactions: (state) => state.todayReport?.transactions || [],
    getTodayPriceChanges: (state) => state.todayReport?.priceChanges || [],
    getTodayNewStocks: (state) => state.todayReport?.newStocks || [],
    getTodayLowStocks: (state) => state.todayReport?.lowStocks || [],

    // Weekly report getters
    getWeeklySummary: (state) => state.weeklyReport?.summary || {},
    getDailyMovements: (state) => state.weeklyReport?.dailyMovements || [],
    getWeeklyTopMovements: (state) => state.weeklyReport?.topMovements || [],
    getWeeklyPerformance: (state) => state.weeklyReport?.performance || [],
    getWeeklyTrendAnalysis: (state) => state.weeklyReport?.trendAnalysis || [],

    // Monthly report getters
    getMonthlySummary: (state) => state.monthlyReport?.summary || {},
    getWeeklyComparisons: (state) => state.monthlyReport?.weeklyComparisons || [],
    getMonthlyTopPerformers: (state) => state.monthlyReport?.topPerformers || [],
    getMonthlyInventoryAnalysis: (state) => state.monthlyReport?.inventoryAnalysis || [],
    getMonthlyPriceAnalysis: (state) => state.monthlyReport?.priceAnalysis || [],
    getMonthlySupplierAnalysis: (state) => state.monthlyReport?.supplierAnalysis || [],

    // Computed summary stats for dashboard cards
    getTotalGemTypes: (state) => state.dashboardData?.summary?.totalGemTypes || 0,
    getTotalQuantity: (state) => state.dashboardData?.summary?.totalQuantity || 0,
    getTotalValue: (state) => state.dashboardData?.summary?.totalValue || 0,
    getLowStockCount: (state) => state.dashboardData?.summary?.lowStockCount || 0,
    getAvailableQuantity: (state) => state.dashboardData?.summary?.availableQuantity || 0,

    // Chart data for visualization
    getCategoryChartData: (state) => {
      const categories = state.dashboardData?.categories || []

      return {
        report: categories.map((cat) => ({
          statusNameTH: `${cat.groupName}`,
          statusNameEN: `${cat.groupName}`,
          status: cat.id || cat.groupName, // เพิ่ม status สำหรับ tooltip
          description: `Group: ${cat.groupName}, Shape: ${cat.shape}`,
          count: cat.totalQuantity, // แท่งที่ 1
          count2: cat.totalOnProcessQuantity, // แท่งที่ 2
          count3: cat.totalQuantityWeight, // แท่งที่ 3
          count4: cat.totalOnProcessQuantityWeight // แท่งที่ 4
        }))
      }
    },

    getTrendChartData: (state) => {
      const trends = state.dashboardData?.trends || []
      return {
        labels: trends.map((trend) => trend.date),
        datasets: [
          {
            label: 'Quantity In',
            data: trends.map((trend) => trend.totalQuantityIn),
            backgroundColor: '#038387',
            borderColor: '#038387'
          },
          {
            label: 'Quantity Out',
            data: trends.map((trend) => trend.totalQuantityOut),
            backgroundColor: '#ff4d4d',
            borderColor: '#ff4d4d'
          }
        ]
      }
    }
  },

  actions: {
    // Fetch main dashboard data
    async fetchDashboard(filters = {}) {
      this.isLoading = true
      this.error = null

      try {
        const requestData = {
          dashboard: {
            startDate: filters.startDate || null,
            endDate: filters.endDate || null,
            groupName: filters.groupName || null,
            shape: filters.shape || null,
            grade: filters.grade || null
          }
        }

        const response = await axiosHelper.jewelry.post('StockGem/Dashboard', requestData)

        console.log('Dashboard data response:', response)

        this.dashboardData = { ...response }
        this.lastUpdated = new Date()
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        this.error = error.message || 'Failed to fetch dashboard data'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Fetch today's report
    async fetchTodayReport(filters = {}) {
      this.isLoading = true
      this.error = null

      try {
        const requestData = {
          dashboard: {
            groupName: filters.groupName || null,
            shape: filters.shape || null,
            grade: filters.grade || null
          }
        }

        const response = await axiosHelper.jewelry.post('StockGem/Dashboard/Today', requestData)

        this.todayReport = response
        this.lastUpdated = new Date()
      } catch (error) {
        console.error('Error fetching today report:', error)
        this.error = error.message || 'Failed to fetch today report'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Fetch weekly report
    async fetchWeeklyReport(filters = {}) {
      this.isLoading = true
      this.error = null

      try {
        const requestData = {
          dashboard: {
            groupName: filters.groupName || null,
            shape: filters.shape || null,
            grade: filters.grade || null
          }
        }

        const response = await axiosHelper.jewelry.post('StockGem/Dashboard/Weekly', requestData)

        this.weeklyReport = response
        this.lastUpdated = new Date()
      } catch (error) {
        console.error('Error fetching weekly report:', error)
        this.error = error.message || 'Failed to fetch weekly report'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Fetch monthly report
    async fetchMonthlyReport(filters = {}) {
      this.isLoading = true
      this.error = null

      try {
        const requestData = {
          dashboard: {
            groupName: filters.groupName || null,
            shape: filters.shape || null,
            grade: filters.grade || null
          }
        }

        const response = await axiosHelper.jewelry.post('StockGem/Dashboard/Monthly', requestData)

        this.monthlyReport = response
        this.lastUpdated = new Date()
      } catch (error) {
        console.error('Error fetching monthly report:', error)
        this.error = error.message || 'Failed to fetch monthly report'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Refresh all dashboard data
    async refreshAll(filters = {}) {
      try {
        await Promise.all([
          this.fetchDashboard(filters),
          this.fetchTodayReport(filters),
          this.fetchWeeklyReport(filters),
          this.fetchMonthlyReport(filters)
        ])
      } catch (error) {
        console.error('Error refreshing all dashboard data:', error)
        throw error
      }
    },

    // Clear all data
    clearData() {
      this.dashboardData = null
      this.todayReport = null
      this.weeklyReport = null
      this.monthlyReport = null
      this.lastUpdated = null
      this.error = null
    },

    // Set loading state
    setLoading(loading) {
      this.isLoading = loading
    },

    // Set error state
    setError(error) {
      this.error = error
    }
  }
})
