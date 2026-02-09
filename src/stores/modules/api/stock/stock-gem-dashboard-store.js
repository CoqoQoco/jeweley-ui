import { defineStore } from 'pinia'
import axiosHelper from '@/axios/axios-helper.js'
import { formatDate } from '@/services/utils/dayjs.js'
import { ExcelHelper } from '@/services/utils/excel-js.js'

export const useStockGemDashboardStore = defineStore('stockGemDashboard', {
  state: () => ({
    isLoading: false,
    dashboardData: null,
    todayReport: null,
    weeklyReport: null,
    monthlyReport: null,
    monthlyGemTransactionSummaries: null,
    transactionTypeSummaries: null, // Store for GetTransactionSummariesByType API
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
    getMonthlyGemTransactionSummaries: (state) => state.monthlyGemTransactionSummaries || [],
    getTransactionTypeSummaries: (state) => state.transactionTypeSummaries || [],

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

    // Fetch transaction summaries by type (updated API)
    async fetchTransactionSummariesByType(dateRange = {}) {
      this.isLoading = true
      this.error = null

      try {
        // Ensure start and end dates are provided
        const startDate = dateRange.startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        const endDate = dateRange.endDate || new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)

        const requestData = {
          startDate: typeof startDate === 'string' ? startDate : startDate.toISOString(),
          endDate: typeof endDate === 'string' ? endDate : endDate.toISOString(),
          groupName: dateRange.groupName || null,
          shape: dateRange.shape || null,
          grade: dateRange.grade || null
        }

        const response = await axiosHelper.jewelry.post('StockGem/Dashboard/Monthly/GemTransactionSummaries', {
          dashboard: requestData
        })

        // Store raw response in the new state property
        this.transactionTypeSummaries = response || []
        this.lastUpdated = new Date()
        
        return response
      } catch (error) {
        console.error('Error fetching transaction summaries by type:', error)
        this.error = error.message || 'Failed to fetch transaction summaries by type'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Transform new API response structure for existing UI compatibility
    transformTransactionTypeResponse(transactionTypes) {
      const transformedData = []
      
      transactionTypes.forEach(transactionType => {
        // For Type 7 (เบิกออกคลัง), group by production type
        if (transactionType.type === 7 && transactionType.gemDetails) {
          const productionGroups = {}
          
          transactionType.gemDetails.forEach(gem => {
            const productionKey = gem.productionType || 'Other'
            
            if (!productionGroups[productionKey]) {
              productionGroups[productionKey] = {
                groupName: `${transactionType.typeName} - ${gem.productionTypeName || gem.productionType || 'อื่นๆ'}`,
                shape: transactionType.typeName,
                grade: gem.productionTypeName || gem.productionType || 'อื่นๆ',
                totalTransactions: 0,
                totalQuantityUsed: 0,
                totalWeightUsed: 0,
                inboundTransactions: 0,
                outboundTransactions: 0,
                inboundQuantity: 0,
                outboundQuantity: 0,
                inboundWeight: 0,
                outboundWeight: 0,
                processBorrowTransactions: 0,
                processBorrowReturnTransactions: 0,
                processBorrowOutboundTransactions: 0,
                processBorrowQuantity: 0,
                processBorrowReturnQuantity: 0,
                processBorrowOutboundQuantity: 0,
                currentQuantity: 0,
                currentWeight: 0,
                transactionsByType: []
              }
            }
            
            productionGroups[productionKey].totalTransactions += gem.transactionCount
            productionGroups[productionKey].totalQuantityUsed += gem.totalQuantity
            productionGroups[productionKey].totalWeightUsed += gem.totalWeight
            productionGroups[productionKey].outboundTransactions += gem.transactionCount
            productionGroups[productionKey].outboundQuantity += gem.totalQuantity
            productionGroups[productionKey].outboundWeight += gem.totalWeight
            productionGroups[productionKey].processBorrowOutboundTransactions += gem.transactionCount
            productionGroups[productionKey].processBorrowOutboundQuantity += gem.totalQuantity
            productionGroups[productionKey].processBorrowOutboundWeight += gem.totalWeight
            productionGroups[productionKey].currentQuantity += gem.currentQuantity
            productionGroups[productionKey].currentWeight += gem.currentWeight
          })
          
          Object.values(productionGroups).forEach(group => {
            group.transactionsByType = [{
              type: transactionType.type,
              typeName: transactionType.typeName,
              count: group.totalTransactions,
              totalQuantity: group.totalQuantityUsed,
              totalWeight: group.totalWeightUsed,
              totalCost: 0
            }]
            transformedData.push(group)
          })
        } else {
          // For other transaction types
          const totalQuantity = transactionType.gemDetails?.reduce((sum, gem) => sum + gem.totalQuantity, 0) || 0
          const totalWeight = transactionType.gemDetails?.reduce((sum, gem) => sum + gem.totalWeight, 0) || 0
          const currentQuantity = transactionType.gemDetails?.reduce((sum, gem) => sum + gem.currentQuantity, 0) || 0
          const currentWeight = transactionType.gemDetails?.reduce((sum, gem) => sum + gem.currentWeight, 0) || 0
          
          const transformedTransaction = {
            groupName: transactionType.typeName,
            shape: `Type ${transactionType.type}`,
            grade: transactionType.typeName,
            totalTransactions: transactionType.totalTransactions,
            totalQuantityUsed: totalQuantity,
            totalWeightUsed: totalWeight,
            inboundTransactions: [1, 2, 3, 6].includes(transactionType.type) ? transactionType.totalTransactions : 0,
            outboundTransactions: [4, 5, 7].includes(transactionType.type) ? transactionType.totalTransactions : 0,
            inboundQuantity: [1, 2, 3, 6].includes(transactionType.type) ? totalQuantity : 0,
            outboundQuantity: [4, 5, 7].includes(transactionType.type) ? totalQuantity : 0,
            inboundWeight: [1, 2, 3, 6].includes(transactionType.type) ? totalWeight : 0,
            outboundWeight: [4, 5, 7].includes(transactionType.type) ? totalWeight : 0,
            processBorrowTransactions: transactionType.type === 5 ? transactionType.totalTransactions : 0,
            processBorrowReturnTransactions: transactionType.type === 6 ? transactionType.totalTransactions : 0,
            processBorrowOutboundTransactions: transactionType.type === 7 ? transactionType.totalTransactions : 0,
            processBorrowQuantity: transactionType.type === 5 ? totalQuantity : 0,
            processBorrowReturnQuantity: transactionType.type === 6 ? totalQuantity : 0,
            processBorrowOutboundQuantity: transactionType.type === 7 ? totalQuantity : 0,
            currentQuantity: currentQuantity,
            currentWeight: currentWeight,
            transactionsByType: [{
              type: transactionType.type,
              typeName: transactionType.typeName,
              count: transactionType.totalTransactions,
              totalQuantity: totalQuantity,
              totalWeight: totalWeight,
              totalCost: 0
            }]
          }
          
          transformedData.push(transformedTransaction)
        }
      })
      
      return transformedData
    },

    // Legacy method for compatibility - redirects to new method
    async fetchMonthlyGemTransactionSummaries(filters = {}) {
      const dateRange = {
        startDate: filters.startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        endDate: filters.endDate || new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
        groupName: filters.groupName,
        shape: filters.shape,
        grade: filters.grade
      }
      
      return await this.fetchTransactionSummariesByType(dateRange)
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
      this.monthlyGemTransactionSummaries = null
      this.transactionTypeSummaries = null
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
    },

    // Export transaction summaries to Excel
    async exportTransactionSummariesByType({ dateRange, selectedTransactionType, transactionTypeName }) {
      try {
        // Fetch the data if not already loaded
        if (!this.transactionTypeSummaries || this.transactionTypeSummaries.length === 0) {
          await this.fetchTransactionSummariesByType(dateRange)
        }

        const selectedTypeData = this.transactionTypeSummaries.find(
          (type) => type.type === selectedTransactionType
        )

        if (!selectedTypeData || !selectedTypeData.gemDetails) {
          throw new Error('No data available for export')
        }

        // Map data for Excel export
        const dataExcel = selectedTypeData.gemDetails.map((item) => {
          const baseData = {
            'Group Name': item.groupName,
            'Transactions': item.transactionCount,
            'Quantity': item.totalQuantity,
            'Weight': item.totalWeight,
            'Current Stock (Qty)': item.currentQuantity,
            'Current Stock (Weight)': item.currentWeight,
            'Last Transaction': formatDate(item.lastTransactionDate)
          }

          // Add production type column for type 7
          if (selectedTransactionType === 7) {
            return {
              'Group Name': item.groupName,
              'Production Type': item.productionTypeName || '-',
              'Transactions': item.transactionCount,
              'Quantity': item.totalQuantity,
              'Weight': item.totalWeight,
              'Current Stock (Qty)': item.currentQuantity,
              'Current Stock (Weight)': item.currentWeight,
              'Last Transaction': formatDate(item.lastTransactionDate)
            }
          }

          return baseData
        })

        const startDateObj = typeof dateRange.startDate === 'string' ? new Date(dateRange.startDate) : dateRange.startDate
        const monthYear = formatDate(startDateObj, 'MM-YYYY')
        const options = {
          filename: `gem-transactions-${transactionTypeName}-${monthYear}_[${formatDate(new Date())}].xlsx`,
          sheetName: transactionTypeName,
          styles: {
            ...ExcelHelper.defaultStyles,
            headerFill: {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: '038387' } // Teal color
            }
          },
          columnWidths: {
            'Group Name': 25,
            'Production Type': 20,
            'Transactions': 15,
            'Quantity': 15,
            'Weight': 15,
            'Current Stock (Qty)': 20,
            'Current Stock (Weight)': 22,
            'Last Transaction': 20
          }
        }

        // Export to Excel
        ExcelHelper.exportToExcel(dataExcel, options)
        
        return true
      } catch (error) {
        console.error('Error exporting transaction summaries:', error)
        throw error
      }
    }
  }
})
