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

export const useProductionMonthlyReportApiStore = defineStore('productionMonthlyReport', {
  state: () => ({
    // Raw API Response Data
    monthlyReportData: null,
    
    // Monthly Report Data
    planFinishByType: [],
    planFinishByProductType: [],
    planFinishByCustomerType: [],
    
    // Date Range
    startDate: null,
    endDate: null,
    
    // Cache timestamps
    cacheTimestamps: {
      monthlyReport: null
    },
    
    // Error handling
    error: null,
    isLoading: false
  }),

  getters: {
    // Raw Data
    getMonthlyReportData: (state) => state.monthlyReportData,
    getStartDate: (state) => state.startDate,
    getEndDate: (state) => state.endDate,
    
    // Plan Finish Data
    getPlanFinishByType: (state) => state.planFinishByType,
    getPlanFinishByProductType: (state) => state.planFinishByProductType,
    getPlanFinishByCustomerType: (state) => state.planFinishByCustomerType,
    
    // Chart Data Getters
    getTypeChartData: (state) => ({
      report: state.planFinishByType.map(item => ({
        statusNameTH: item.typeName || item.type,
        statusNameEN: item.type,
        count: item.count
      }))
    }),
    
    getProductTypeChartData: (state) => ({
      report: state.planFinishByProductType.map(item => ({
        statusNameTH: item.productTypeName || item.productType,
        statusNameEN: item.productType,
        count: item.count
      }))
    }),
    
    getCustomerTypeChartData: (state) => ({
      report: state.planFinishByCustomerType.map(item => ({
        statusNameTH: item.customerTypeName || item.customerType,
        statusNameEN: item.customerType,
        count: item.count
      }))
    }),
    
    // Cache validation
    isMonthlyReportCacheValid: (state) => isCacheValid(state.cacheTimestamps.monthlyReport),
    
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

    // Initialize search request for Monthly Report API
    initMonthlyReportRequest(form = {}) {
      // Create month-based date range
      let startDate = form.startDate
      let endDate = form.endDate

      // If a single month is selected, calculate the full month range
      if (form.selectedMonth) {
        const year = form.selectedMonth.getFullYear()
        const month = form.selectedMonth.getMonth() // 0-based
        startDate = new Date(year, month, 1)
        endDate = new Date(year, month + 1, 0) // Last day of month
      }

      return {
        search: {
          startDate: startDate ? formatISOString(startDate) : null,
          endDate: endDate ? formatISOString(endDate) : null
        }
      }
    },

    // Fetch Monthly Report Data (Main API call)
    async fetchMonthlyReport(forceFetch = false, form = {}) {
      if (!forceFetch && this.isMonthlyReportCacheValid) {
        return this.monthlyReportData
      }

      try {
        this.clearError()
        this.setLoading(true)

        const param = this.initMonthlyReportRequest(form)

        const res = await api.jewelry.post('Production/Plan/MonthlyReport', param)
        
        if (res) {
          // Store raw response
          this.monthlyReportData = res
          this.startDate = res.startDate
          this.endDate = res.endDate
          
          // Update monthly report data
          this.planFinishByType = res.planFinishByType || []
          this.planFinishByProductType = res.planFinishByProductType || []
          this.planFinishByCustomerType = res.planFinishByCustomerType || []
          
          this.updateCacheTimestamp('monthlyReport')
        }

        this.setLoading(false)
        return this.monthlyReportData
      } catch (error) {
        // If API fails, return mock data for development
        console.warn('Monthly Report API failed, using mock data:', error)
        this.setupMockData(form)
        this.updateCacheTimestamp('monthlyReport')
        this.setLoading(false)
        return this.monthlyReportData
      }
    },

    // Setup mock data for development
    setupMockData(form = {}) {
      let startDate = form.startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      let endDate = form.endDate || new Date()

      // If a single month is selected, calculate the full month range
      if (form.selectedMonth) {
        const year = form.selectedMonth.getFullYear()
        const month = form.selectedMonth.getMonth() // 0-based
        startDate = new Date(year, month, 1)
        endDate = new Date(year, month + 1, 0) // Last day of month
      }
      
      this.monthlyReportData = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        planFinishByType: [
          {
            type: '18K',
            typeName: 'ทองคำ 18K',
            count: 45,
            totalQty: 52,
            percentage: 37.5
          },
          {
            type: '24K',
            typeName: 'ทองคำ 24K',
            count: 32,
            totalQty: 38,
            percentage: 26.7
          },
          {
            type: '14K',
            typeName: 'ทองคำ 14K',
            count: 28,
            totalQty: 31,
            percentage: 23.3
          },
          {
            type: 'WHITE',
            typeName: 'ทองคำขาว',
            count: 15,
            totalQty: 18,
            percentage: 12.5
          }
        ],
        planFinishByProductType: [
          {
            productType: 'RING',
            productTypeName: 'แหวน',
            count: 58,
            totalQty: 65,
            percentage: 48.3
          },
          {
            productType: 'NECKLACE',
            productTypeName: 'สร้อยคอ',
            count: 35,
            totalQty: 42,
            percentage: 29.2
          },
          {
            productType: 'EARRING',
            productTypeName: 'ต่างหู',
            count: 18,
            totalQty: 24,
            percentage: 15.0
          },
          {
            productType: 'BRACELET',
            productTypeName: 'สร้อยข้อมือ',
            count: 9,
            totalQty: 12,
            percentage: 7.5
          }
        ],
        planFinishByCustomerType: [
          {
            customerType: 'NORMAL',
            customerTypeName: 'ลูกค้าทั่วไป',
            count: 67,
            totalQty: 78,
            percentage: 55.8
          },
          {
            customerType: 'VIP',
            customerTypeName: 'ลูกค้าวีไอพี',
            count: 35,
            totalQty: 42,
            percentage: 29.2
          },
          {
            customerType: 'WHOLESALE',
            customerTypeName: 'ลูกค้าขายส่ง',
            count: 18,
            totalQty: 23,
            percentage: 15.0
          }
        ]
      }
      
      // Update all state from mock data
      this.startDate = this.monthlyReportData.startDate
      this.endDate = this.monthlyReportData.endDate
      this.planFinishByType = this.monthlyReportData.planFinishByType
      this.planFinishByProductType = this.monthlyReportData.planFinishByProductType
      this.planFinishByCustomerType = this.monthlyReportData.planFinishByCustomerType
    },

    // Refresh monthly report data with filters
    async refreshMonthlyReport(form = {}) {
      return await this.fetchMonthlyReport(true, form)
    },

    // Reset all data
    resetMonthlyReportData() {
      this.monthlyReportData = null
      this.startDate = null
      this.endDate = null
      this.planFinishByType = []
      this.planFinishByProductType = []
      this.planFinishByCustomerType = []
      this.clearAllCache()
      this.clearError()
    }
  }
})