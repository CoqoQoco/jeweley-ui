import { defineStore } from 'pinia'
import api from '@/services/utils/api.js'

export const useMasterApiStore = defineStore('master', {
  // State
  state: () => ({
    // Status
    planStatus: [],
    // Master Data
    gold: [],
    goldSize: [],
    customerType: [],
    productType: [],
    // UI States
    error: null,
    // Constants
    overPlanOptions: [
      { id: 0, description: 'ทั้งหมด' },
      { id: 1, description: 'เกินกำหนด' }
    ]
  }),

  // Getters
  getters: {
    getOverPlanOptions: (state) => state.overPlanOptions,
    getError: (state) => state.error,

    // Status
    getPlanStatus: (state) => state.planStatus,
    getPlanStatusById: (state) => (id) => state.planStatus.find((item) => item.id === id),
    getPlanStatusByCode: (state) => (code) => state.planStatus.find((item) => item.code === code),

    // Gold
    getGold: (state) => state.gold,
    getGoldById: (state) => (id) => state.gold.find((item) => item.id === id),
    getGoldByCode: (state) => (code) => state.gold.find((item) => item.code === code),

    // Gold Size
    getGoldSize: (state) => state.goldSize,
    getGoldSizeById: (state) => (id) => state.goldSize.find((item) => item.id === id),
    getGoldSizeByCode: (state) => (code) => state.goldSize.find((item) => item.code === code),

    // Customer Type
    getCustomerType: (state) => state.customerType,
    getCustomerTypeById: (state) => (id) => state.customerType.find((item) => item.id === id),
    getCustomerTypeByCode: (state) => (code) =>
      state.customerType.find((item) => item.code === code),

    // Product Type
    getProductType: (state) => state.productType,
    getProductTypeById: (state) => (id) => state.productType.find((item) => item.id === id),
    getProductTypeByCode: (state) => (code) => state.productType.find((item) => item.code === code)
  },

  // Actions
  actions: {
    // Error Handler
    handleError(error, message) {
      console.error(message, error)
      this.error = error
      throw error
    },

    // Clear States
    clearError() {
      this.error = null
    },

    clearAll() {
      this.planStatus = []
      this.gold = []
      this.goldSize = []
      this.customerType = []
      this.productType = []
      this.error = null
    },

    // API Calls
    async fetchPlanStatus() {
      try {
        this.clearError()
        const response = await api.jewelry.get('ProductionPlan/GetProductionPlanStatus')
        this.planStatus = response || []
        return response
      } catch (error) {
        return this.handleError(error, 'Error fetching status')
      }
    },

    async fetchGold() {
      try {
        this.clearError()
        const response = await api.jewelry.get('Master/MasterGold')
        this.gold = response || []
        return response
      } catch (error) {
        return this.handleError(error, 'Error fetching gold')
      }
    },

    async fetchGoldSize() {
      try {
        this.clearError()
        const response = await api.jewelry.get('Master/MasterGoldSize')
        this.goldSize = response || []
        return response
      } catch (error) {
        return this.handleError(error, 'Error fetching gold size')
      }
    },

    async fetchCustomerType() {
      try {
        this.clearError()
        const response = await api.jewelry.get('Master/MasterCustomerType')
        this.customerType = response || []
        return response
      } catch (error) {
        return this.handleError(error, 'Error fetching customer type')
      }
    },

    async fetchProductType() {
      try {
        this.clearError()
        const response = await api.jewelry.get('Master/MasterProductType')
        this.productType = response || []
        return response
      } catch (error) {
        return this.handleError(error, 'Error fetching product type')
      }
    }
  }
})
