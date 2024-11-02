import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'
import { useLoadingStore } from '@/stores/modules/master/loading-store.js'

export const useMasterApiStore = defineStore('master', {
  state: () => ({
    planStatus: [],
    gold: [],
    goldSize: [],
    customerType: [],
    productType: [],
    error: null,
    overPlanOptions: [
      { id: 0, description: 'ทั้งหมด' },
      { id: 1, description: 'เกินกำหนด' }
    ]
  }),

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

  actions: {
    handleError(error, message) {
      console.error(message, error)
      this.error = error
      const loadingStore = useLoadingStore()
      loadingStore.hideLoading()
      throw error
    },

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

    // Fetch all master data concurrently
    async fetchAllMasterData() {
      const loadingStore = useLoadingStore()
      try {
        this.clearError()
        loadingStore.showLoading()

        const [planStatus, gold, goldSize, customerType, productType] = await Promise.all([
          api.jewelry.get('ProductionPlan/GetProductionPlanStatus', null, { skipLoading: true }),
          api.jewelry.get('Master/MasterGold', null, { skipLoading: true }),
          api.jewelry.get('Master/MasterGoldSize', null, { skipLoading: true }),
          api.jewelry.get('Master/MasterCustomerType', null, { skipLoading: true }),
          api.jewelry.get('Master/MasterProductType', null, { skipLoading: true })
        ])

        // Update state
        this.planStatus = planStatus || []
        this.gold = gold || []
        this.goldSize = goldSize || []
        this.customerType = customerType || []
        this.productType = productType || []

        loadingStore.hideLoading()
        return {
          planStatus,
          gold,
          goldSize,
          customerType,
          productType
        }
      } catch (error) {
        return this.handleError(error, 'Error fetching master data')
      }
    },

    // Individual fetch methods
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
