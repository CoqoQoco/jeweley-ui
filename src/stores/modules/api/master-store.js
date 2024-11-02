import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'
import { useLoadingStore } from '@/stores/modules/master/loading-store.js'

const CACHE_DURATION = 30 * 60 * 1000 // 5 minutes in milliseconds

// Helper function to check if cache is valid
const isCacheValid = (timestamp) => {
  if (!timestamp) return false
  return Date.now() - timestamp < CACHE_DURATION
}

export const useMasterApiStore = defineStore('master', {
  state: () => ({
    planStatus: [],
    gold: [],
    goldSize: [],
    customerType: [],
    productType: [],
    error: null,
    cacheTimestamps: {
      planStatus: null,
      gold: null,
      goldSize: null,
      customerType: null,
      productType: null
    },
    overPlanOptions: [
      { id: 0, description: 'ทั้งหมด' },
      { id: 1, description: 'เกินกำหนด' }
    ]
  }),

  getters: {
    // Original getters remain the same...
    getOverPlanOptions: (state) => state.overPlanOptions,
    getError: (state) => state.error,

    // Status
    getPlanStatus: (state) => state.planStatus,
    getPlanStatusById: (state) => (id) => state.planStatus.find((item) => item.id === id),
    getPlanStatusByCode: (state) => (code) => state.planStatus.find((item) => item.code === code),

    // Additional getters for cache status
    isCacheValid: (state) => (key) => isCacheValid(state.cacheTimestamps[key]),

    // Cache validation getters for each type
    isPlanStatusCacheValid: (state) => isCacheValid(state.cacheTimestamps.planStatus),
    isGoldCacheValid: (state) => isCacheValid(state.cacheTimestamps.gold),
    isGoldSizeCacheValid: (state) => isCacheValid(state.cacheTimestamps.goldSize),
    isCustomerTypeCacheValid: (state) => isCacheValid(state.cacheTimestamps.customerType),
    isProductTypeCacheValid: (state) => isCacheValid(state.cacheTimestamps.productType)
  },

  actions: {
    // Update cache timestamp
    updateCacheTimestamp(key) {
      this.cacheTimestamps[key] = Date.now()
    },

    // Clear specific cache
    clearCache(key) {
      this.cacheTimestamps[key] = null
    },

    // Clear all cache
    clearAllCache() {
      Object.keys(this.cacheTimestamps).forEach((key) => {
        this.cacheTimestamps[key] = null
      })
    },

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
      this.clearAllCache()
    },

    // Fetch all master data concurrently with cache check
    async fetchAllMasterData(forceFetch = false) {
      const loadingStore = useLoadingStore()
      try {
        this.clearError()
        loadingStore.showLoading()

        const fetchPromises = []
        const fetchKeys = []

        // Check each data type and only fetch if needed
        if (forceFetch || !this.isPlanStatusCacheValid) {
          fetchPromises.push(
            api.jewelry.get('ProductionPlan/GetProductionPlanStatus', null, { skipLoading: true })
          )
          fetchKeys.push('planStatus')
        }
        if (forceFetch || !this.isGoldCacheValid) {
          fetchPromises.push(api.jewelry.get('Master/MasterGold', null, { skipLoading: true }))
          fetchKeys.push('gold')
        }
        if (forceFetch || !this.isGoldSizeCacheValid) {
          fetchPromises.push(api.jewelry.get('Master/MasterGoldSize', null, { skipLoading: true }))
          fetchKeys.push('goldSize')
        }
        if (forceFetch || !this.isCustomerTypeCacheValid) {
          fetchPromises.push(
            api.jewelry.get('Master/MasterCustomerType', null, { skipLoading: true })
          )
          fetchKeys.push('customerType')
        }
        if (forceFetch || !this.isProductTypeCacheValid) {
          fetchPromises.push(
            api.jewelry.get('Master/MasterProductType', null, { skipLoading: true })
          )
          fetchKeys.push('productType')
        }

        // If all caches are valid and no force fetch, return early
        if (fetchPromises.length === 0) {
          loadingStore.hideLoading()
          return {
            planStatus: this.planStatus,
            gold: this.gold,
            goldSize: this.goldSize,
            customerType: this.customerType,
            productType: this.productType
          }
        }

        // Fetch only needed data
        const results = await Promise.all(fetchPromises)

        // Update state and cache timestamps for fetched data
        results.forEach((result, index) => {
          const key = fetchKeys[index]
          this[key] = result || []
          this.updateCacheTimestamp(key)
        })

        loadingStore.hideLoading()
        return {
          planStatus: this.planStatus,
          gold: this.gold,
          goldSize: this.goldSize,
          customerType: this.customerType,
          productType: this.productType
        }
      } catch (error) {
        return this.handleError(error, 'Error fetching master data')
      }
    },

    // Individual fetch methods with cache check
    async fetchWithCache(key, url, errorMessage) {
      if (!forceFetch && this.isCacheValid(key)) {
        return this[key]
      }

      try {
        this.clearError()
        const response = await api.jewelry.get(url)
        this[key] = response || []
        this.updateCacheTimestamp(key)
        return response
      } catch (error) {
        return this.handleError(error, errorMessage)
      }
    },

    // Updated individual fetch methods
    async fetchPlanStatus(forceFetch = false) {
      return this.fetchWithCache(
        'planStatus',
        'ProductionPlan/GetProductionPlanStatus',
        'Error fetching status'
      )
    },

    async fetchGold(forceFetch = false) {
      return this.fetchWithCache('gold', 'Master/MasterGold', 'Error fetching gold')
    },

    async fetchGoldSize(forceFetch = false) {
      return this.fetchWithCache('goldSize', 'Master/MasterGoldSize', 'Error fetching gold size')
    },

    async fetchCustomerType(forceFetch = false) {
      return this.fetchWithCache(
        'customerType',
        'Master/MasterCustomerType',
        'Error fetching customer type'
      )
    },

    async fetchProductType(forceFetch = false) {
      return this.fetchWithCache(
        'productType',
        'Master/MasterProductType',
        'Error fetching product type'
      )
    }
  }
})
