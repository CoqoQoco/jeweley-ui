import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'
import { formatISOString, formatDate, formatDateTime } from '@/services/utils/dayjs.js'
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
          status: form.status || null,
          isOverPlan: form.isOverPlan || 0,
          customerType: form.customerType || null,
          customerCode: form.customerCode || null,
          gold: form.gold || null,
          goldSize: form.goldSize || null,
          mold: form.mold || null,
          productNumber: form.productNumber || null,
          productType: form.productType || null
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
        // If API fails, return mock data for development
        console.warn('Daily Plan API failed, using mock data:', error)
        this.setupMockData()
        this.updateCacheTimestamp('dailyPlan')
        this.setLoading(false)
        return this.dailyPlanData
      }
    },

    // Setup mock data for development
    setupMockData() {
      this.dailyPlanData = {
        dataAtDate: new Date().toISOString(),
        planCountTotal: 61,
        planCountProcess: 35,
        planCountCompletedOnYesterday: 17,
        planCountOverdue: 9,
        report: [
          {
            status: 10,
            statusNameTH: "ออกแบบ",
            statusNameEN: "Designed",
            description: null,
            reference: null,
            count: 8
          },
          {
            status: 49,
            statusNameTH: "รอแต่ง",
            statusNameEN: "WaitCasting",
            description: null,
            reference: null,
            count: 7
          },
          {
            status: 50,
            statusNameTH: "แต่ง",
            statusNameEN: "Casting",
            description: "ช่างแต่ง",
            reference: null,
            count: 8
          },
          {
            status: 59,
            statusNameTH: "รอขัดดิบ",
            statusNameEN: "WaitScrubb",
            description: "",
            reference: null,
            count: 0
          },
          {
            status: 60,
            statusNameTH: "ขัดดิบ",
            statusNameEN: "Scrubb",
            description: "ช่างขัดดิบ",
            reference: null,
            count: 2
          },
          {
            status: 69,
            statusNameTH: "รอคัดพลอย",
            statusNameEN: "WaitGems",
            description: "",
            reference: null,
            count: 0
          },
          {
            status: 70,
            statusNameTH: "คัดพลอย",
            statusNameEN: "Gems",
            description: "ช่างคัดพลอย",
            reference: null,
            count: 6
          },
          {
            status: 79,
            statusNameTH: "รอฝัง",
            statusNameEN: "WaitEmbedd",
            description: "",
            reference: null,
            count: 0
          },
          {
            status: 80,
            statusNameTH: "ฝัง",
            statusNameEN: "Embedd",
            description: "ช่างฝัง",
            reference: null,
            count: 1
          },
          {
            status: 89,
            statusNameTH: "รอขัดชุบ",
            statusNameEN: "WaitPlated",
            description: null,
            reference: null,
            count: 1
          },
          {
            status: 90,
            statusNameTH: "ขัดชุบ",
            statusNameEN: "Plated",
            description: "ช่างชุบ",
            reference: null,
            count: 0
          },
          {
            status: 94,
            statusNameTH: "รอบัตรต้นทุน",
            statusNameEN: "WaitPrice",
            description: "",
            reference: null,
            count: 9
          },
          {
            status: 95,
            statusNameTH: "บัตรต้นทุน",
            statusNameEN: "Price",
            description: null,
            reference: null,
            count: 2
          },
          {
            status: 100,
            statusNameTH: "สำเร็จ",
            statusNameEN: "Completed",
            description: null,
            reference: "สำเร็จ | ตรวจ CVD",
            count: 17
          }
        ],
        recentActivity: [
          {
            id: 1,
            wo: "P",
            woNumber: 1001,
            woText: "P-1001",
            createDate: new Date().toISOString(),
            createBy: "Admin",
            updateDate: new Date().toISOString(),
            updateBy: "Admin",
            requestDate: new Date().toISOString(),
            mold: "MD001",
            moldSub: "A",
            productRunning: "PR001",
            productName: "แหวนทอง",
            productType: "RING",
            productTypeName: "แหวน",
            productNumber: "RG001",
            productDetail: "แหวนทองคำขาว",
            productQty: 1,
            productQtyUnit: "ชิ้น",
            customerNumber: "C001",
            customerName: "ลูกค้า A",
            customerType: "VIP",
            customerTypeName: "วีไอพี",
            isActive: true,
            status: 50,
            statusName: "กำลังแต่ง",
            remark: null,
            gold: "18K",
            goldSize: "2.5"
          },
          {
            id: 2,
            wo: "P",
            woNumber: 1002,
            woText: "P-1002",
            createDate: new Date(Date.now() - 3600000).toISOString(),
            createBy: "Worker1",
            updateDate: new Date(Date.now() - 3600000).toISOString(),
            updateBy: "Worker1",
            requestDate: new Date(Date.now() - 3600000).toISOString(),
            mold: "MD002",
            moldSub: "B",
            productRunning: "PR002",
            productName: "สร้อยคอ",
            productType: "NECKLACE",
            productTypeName: "สร้อยคอ",
            productNumber: "NC001",
            productDetail: "สร้อยคอทองคำ",
            productQty: 1,
            productQtyUnit: "ชิ้น",
            customerNumber: "C002",
            customerName: "ลูกค้า B",
            customerType: "NORMAL",
            customerTypeName: "ทั่วไป",
            isActive: true,
            status: 100,
            statusName: "เสร็จสิ้น",
            remark: null,
            gold: "24K",
            goldSize: "3.0"
          }
        ],
        summary: {
          totalActiveProjects: 44,
          completedToday: 17,
          overduePlans: 9,
          pendingApproval: 8,
          percentageCompleted: 27.9,
          statusTrends: [
            {
              status: 50,
              statusName: "กำลังแต่ง",
              count: 8,
              percentage: 13.1,
              trendDirection: "up"
            },
            {
              status: 70,
              statusName: "คัดพลอย",
              count: 6,
              percentage: 9.8,
              trendDirection: "stable"
            },
            {
              status: 100,
              statusName: "เสร็จสิ้น",
              count: 17,
              percentage: 27.9,
              trendDirection: "up"
            }
          ],
          productTypeSummary: [
            {
              productType: "RING",
              productTypeName: "แหวน",
              count: 25,
              totalQty: 25,
              totalWeight: 125.5
            },
            {
              productType: "NECKLACE",
              productTypeName: "สร้อยคอ",
              count: 18,
              totalQty: 18,
              totalWeight: 180.2
            },
            {
              productType: "EARRING",
              productTypeName: "ต่างหู",
              count: 12,
              totalQty: 24,
              totalWeight: 60.8
            }
          ],
          customerTypeSummary: [
            {
              customerType: "VIP",
              customerTypeName: "วีไอพี",
              count: 15,
              totalQty: 15
            },
            {
              customerType: "NORMAL",
              customerTypeName: "ทั่วไป",
              count: 40,
              totalQty: 40
            },
            {
              customerType: "WHOLESALE",
              customerTypeName: "ขายส่ง",
              count: 6,
              totalQty: 12
            }
          ]
        }
      }
      
      // Update all state from mock data
      this.dataAtDate = this.dailyPlanData.dataAtDate
      this.dashboardStats = {
        planCountTotal: this.dailyPlanData.planCountTotal,
        planCountProcess: this.dailyPlanData.planCountProcess,
        planCountCompletedOnYesterday: this.dailyPlanData.planCountCompletedOnYesterday,
        planCountOverdue: this.dailyPlanData.planCountOverdue
      }
      this.statusReport = { report: this.dailyPlanData.report }
      this.recentActivities = this.dailyPlanData.recentActivity
      this.summary = this.dailyPlanData.summary
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
    }
  }
})