import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'
import { formatISOString } from '@/services/utils/dayjs.js'
import { useLoadingStore } from '@/stores/modules/master/loading-store.js'

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes cache for dashboard data

// Helper function to check if cache is valid
const isCacheValid = (timestamp) => {
  if (!timestamp) return false
  return Date.now() - timestamp < CACHE_DURATION
}

export const useProductionDailyApiStore = defineStore('productionDaily', {
  state: () => ({
    // Raw API Response Data
    dailyPlanData: null,
    dataAtDate: null,
    
    // Dashboard Statistics from API response
    dashboardStats: {
      planCountTotal: 0,
      planCountProcess: 0,
      planCountCompletedOnYesterday: 0,
      planCountOverdue: 0
    },
    
    // Production Status Report for Charts
    statusReport: {
      report: []
    },
    
    // Recent Activities from API
    recentActivities: [],
    
    // Summary Data from API
    summary: {
      totalActiveProjects: 0,
      completedToday: 0,
      overduePlans: 0,
      pendingApproval: 0,
      percentageCompleted: 0,
      statusTrends: [],
      productTypeSummary: [],
      customerTypeSummary: []
    },
    
    // Cache timestamps
    cacheTimestamps: {
      dailyPlan: null
    },

    // Completed Daily Series (run-rate forecast source — frontend calculates the forecast)
    completedDailySeries: {
      rows: [],
      total: 0,
      daysElapsed: 0,
      daysInPeriod: 0
    },

    // Error handling
    error: null,
    isLoading: false
  }),

  getters: {
    // Raw Data
    getDailyPlanData: (state) => state.dailyPlanData,
    getDataAtDate: (state) => state.dataAtDate,
    
    // Dashboard Statistics
    getDashboardStats: (state) => state.dashboardStats,
    getTotalPlans: (state) => state.dashboardStats.planCountTotal,
    getInProgressPlans: (state) => state.dashboardStats.planCountProcess,
    getCompletedPlans: (state) => state.dashboardStats.planCountCompletedOnYesterday,
    getPendingPlans: (state) => state.dashboardStats.planCountOverdue,
    getCompletionRate: (state) => {
      const total = state.dashboardStats.planCountTotal
      const completed = state.dashboardStats.planCountCompletedOnYesterday
      return total > 0 ? Math.round((completed / total) * 100 * 100) / 100 : 0
    },
    
    // Status Report for Charts
    getStatusReport: (state) => state.statusReport,
    getStatusReportData: (state) => state.statusReport.report,
    
    // Recent Activities
    getRecentActivities: (state) => state.recentActivities,
    getRecentActivitiesLimited: (state) => (limit = 10) => 
      state.recentActivities.slice(0, limit),
    
    // Summary Data
    getSummary: (state) => state.summary,
    getStatusTrends: (state) => state.summary.statusTrends,
    getProductTypeSummary: (state) => state.summary.productTypeSummary,
    getCustomerTypeSummary: (state) => state.summary.customerTypeSummary,
    
    // Enhanced getters for dashboard cards
    getTotalActiveProjects: (state) => state.summary.totalActiveProjects,
    getCompletedToday: (state) => state.summary.completedToday,
    getOverduePlans: (state) => state.summary.overduePlans,
    getPendingApproval: (state) => state.summary.pendingApproval,
    getPercentageCompleted: (state) => state.summary.percentageCompleted,
    
    // Cache validation
    isDailyPlanCacheValid: (state) => isCacheValid(state.cacheTimestamps.dailyPlan),

    // Completed Daily Series
    getCompletedDailySeriesRows: (state) => state.completedDailySeries.rows,

    // Error and Loading
    getError: (state) => state.error,
    getIsLoading: (state) => state.isLoading
  },

  actions: {
    // Cache management
    updateCacheTimestamp(key) {
      this.cacheTimestamps[key] = Date.now()
    },

    clearCache(key) {
      this.cacheTimestamps[key] = null
    },

    clearAllCache() {
      Object.keys(this.cacheTimestamps).forEach((key) => {
        this.cacheTimestamps[key] = null
      })
    },

    // Error handling
    handleError(error, message) {
      console.error(message, error)
      this.error = error
      this.isLoading = false
      const loadingStore = useLoadingStore()
      loadingStore.hideLoading()
      throw error
    },

    clearError() {
      this.error = null
    },

    // Set loading state
    setLoading(loading) {
      this.isLoading = loading
    },

    // Initialize search request for DailyPlan API
    initDailyPlanRequest(form = {}) {
      return {
        search: {
          start: form.start ? formatISOString(form.start) : null,
          end: form.end ? formatISOString(form.end) : null,
          sendStart: form.sendStart ? formatISOString(form.sendStart) : null,
          sendEnd: form.sendEnd ? formatISOString(form.sendEnd) : null,
          createStart: form.createStart ? formatISOString(form.createStart) : null,
          createEnd: form.createEnd ? formatISOString(form.createEnd) : null,
          text: form.text || null,
          woText: form.woText || null,
          status: form.status?.length ? form.status : null,
          isOverPlan: form.isOverPlan || 0,
          customerType: form.customerType?.length ? form.customerType : null,
          customerCode: form.customerCode || null,
          gold: form.gold?.length ? form.gold : null,
          goldSize: form.goldSize?.length ? form.goldSize : null,
          mold: form.mold || null,
          productNumber: form.productNumber || null,
          productType: form.productType?.length ? form.productType : null
        }
      }
    },

    // Fetch Daily Plan Data (Main API call)
    async fetchDailyPlan(forceFetch = false, form = {}) {
      if (!forceFetch && this.isDailyPlanCacheValid) {
        return this.dailyPlanData
      }

      try {
        this.clearError()
        this.setLoading(true)

        const param = this.initDailyPlanRequest(form)

        const res = await api.jewelry.post('Production/Plan/DailyPlan', param)
        
        if (res) {
          // Store raw response
          this.dailyPlanData = res
          this.dataAtDate = res.dataAtDate
          
          // Update dashboard stats
          this.dashboardStats = {
            planCountTotal: res.planCountTotal || 0,
            planCountProcess: res.planCountProcess || 0,
            planCountCompletedOnYesterday: res.planCountCompletedOnYesterday || 0,
            planCountOverdue: res.planCountOverdue || 0
          }
          
          // Update status report for charts
          this.statusReport = {
            report: res.report || []
          }
          
          // Update recent activities
          this.recentActivities = res.recentActivity || []
          
          // Update summary
          this.summary = res.summary || {
            totalActiveProjects: 0,
            completedToday: 0,
            overduePlans: 0,
            pendingApproval: 0,
            percentageCompleted: 0,
            statusTrends: [],
            productTypeSummary: [],
            customerTypeSummary: []
          }
          
          this.updateCacheTimestamp('dailyPlan')
        }

        this.setLoading(false)
        return this.dailyPlanData
      } catch (error) {
        this.resetDashboardData()
        this.error = error
        this.setLoading(false)
        return this.dailyPlanData
      }
    },

    // Refresh dashboard data with filters
    async refreshDashboard(form = {}) {
      return await this.fetchDailyPlan(true, form)
    },

    // Fetch filtered data
    async fetchFilteredData(filters = {}) {
      return await this.fetchDailyPlan(true, filters)
    },

    // Get recent activities with proper formatting
    getFormattedRecentActivities(limit = 5) {
      return this.recentActivities.slice(0, limit).map(activity => ({
        id: activity.id,
        type: this.getActivityType(activity.status),
        title: this.getActivityTitle(activity),
        description: this.getActivityDescription(activity),
        date: new Date(activity.updateDate),
        planId: activity.woText,
        userName: activity.updateBy,
        rawData: activity
      }))
    },

    // Helper methods for activity formatting
    getActivityType(status) {
      if (status === 100) return 'complete'
      if (status >= 50 && status < 100) return 'update'
      if (status === 10) return 'create'
      return 'update'
    },

    getActivityTitle(activity) {
      switch (activity.status) {
        case 10: return 'สร้างแผนงานผลิตใหม่'
        case 100: return 'งานเสร็จสิ้น'
        default: return 'อัปเดตสถานะงาน'
      }
    },

    getActivityDescription(activity) {
      return `${activity.woText} - ${activity.productName} (${activity.statusName})`
    },

    // Reset all data
    resetDashboardData() {
      this.dailyPlanData = null
      this.dataAtDate = null
      this.dashboardStats = {
        planCountTotal: 0,
        planCountProcess: 0,
        planCountCompletedOnYesterday: 0,
        planCountOverdue: 0
      }
      this.statusReport = { report: [] }
      this.recentActivities = []
      this.summary = {
        totalActiveProjects: 0,
        completedToday: 0,
        overduePlans: 0,
        pendingApproval: 0,
        percentageCompleted: 0,
        statusTrends: [],
        productTypeSummary: [],
        customerTypeSummary: []
      }
      this.clearAllCache()
      this.clearError()
    },

    // Fetch scrap weight dashboard data
    async fetchScrapWeightDashboard(year = null) {
      try {
        this.setLoading(true)
        const response = await api.jewelry.get(
          'ProductionPlanCost/ScrapWeightDashboard',
          year ? { year } : null
        )
        this.setLoading(false)
        return response
      } catch (error) {
        // Swallow — do not rethrow (handleError rethrows and would break the
        // refreshDashboard() await chain). Caller renders its own empty state.
        console.error('Failed to fetch scrap weight dashboard data', error)
        this.setLoading(false)
        return null
      }
    },

    // Fetch completed plan count per day (current month) — used as run-rate forecast source
    // Accepts the shared filter set (everything except status/isOverPlan/start/end) —
    // start/end are intentionally never sent; the backend always defaults to the current month.
    async fetchCompletedDailySeries(form = {}) {
      try {
        const param = {
          search: {
            text: form.text || null,
            mold: form.mold || null,
            productNumber: form.productNumber || null,
            gold: form.gold?.length ? form.gold : null,
            goldSize: form.goldSize?.length ? form.goldSize : null,
            productType: form.productType?.length ? form.productType : null,
            customerType: form.customerType?.length ? form.customerType : null,
            customerCode: form.customerCode || null
          }
        }

        const res = await api.jewelry.post('Production/Plan/CompletedDailySeries', param)

        if (res) {
          this.completedDailySeries = {
            rows: res.rows || [],
            total: res.total || 0,
            daysElapsed: res.daysElapsed || 0,
            daysInPeriod: res.daysInPeriod || 0
          }
        }

        return res
      } catch (error) {
        // Swallow — the dashboard-level error band (from fetchDailyPlan) is
        // already the user-facing signal; the forecast panel renders its own
        // "not enough data" empty state when rows is empty.
        console.error('Failed to fetch completed daily series', error)
        this.completedDailySeries = {
          rows: [],
          total: 0,
          daysElapsed: 0,
          daysInPeriod: 0
        }
        return null
      }
    }
  }
})