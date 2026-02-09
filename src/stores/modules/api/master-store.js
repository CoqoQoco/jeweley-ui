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
    gem: [],
    gemShape: [],
    customerType: [],
    productType: [],
    workerType: [],
    diamondGrade: [],
    error: null,
    cacheTimestamps: {
      planStatus: null,
      gold: null,
      goldSize: null,
      gem: [],
      gemShape: [],
      customerType: null,
      productType: null,
      workerType: null,
      diamondGrade: null
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
    isGemCacheValid: (state) => isCacheValid(state.cacheTimestamps.Gem),
    isGemShapeCacheValid: (state) => isCacheValid(state.cacheTimestamps.GemShape),
    isCustomerTypeCacheValid: (state) => isCacheValid(state.cacheTimestamps.customerType),
    isProductTypeCacheValid: (state) => isCacheValid(state.cacheTimestamps.productType),
    isWorkerTypeCacheValid: (state) => isCacheValid(state.cacheTimestamps.workerType),
    isDiamondGradeCacheValid: (state) => isCacheValid(state.cacheTimestamps.diamondGrade)
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
      this.gem = []
      this.gemShape = []
      this.customerType = []
      this.productType = []
      this.workerType = []
      this.diamondGrade = []
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
        if (forceFetch || !this.isGemCacheValid) {
          fetchPromises.push(api.jewelry.get('Master/MasterGem', null, { skipLoading: true }))
          fetchKeys.push('gem')
        }
        if (forceFetch || !this.isGemShapeCacheValid) {
          fetchPromises.push(api.jewelry.get('Master/MasterGemShape', null, { skipLoading: true }))
          fetchKeys.push('gemShape')
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
        if (forceFetch || !this.isWorkerTypeCacheValid) {
          fetchPromises.push(
            api.jewelry.get('Worker/GetWorkerProductionType', null, { skipLoading: true })
          )
          fetchKeys.push('workerType')
        }
        if (forceFetch || !this.isDiamondGradeCacheValid) {
          fetchPromises.push(
            api.jewelry.get('Master/MasterDiamondGrade', null, { skipLoading: true })
          )
          fetchKeys.push('diamondGrade')
        }

        // If all caches are valid and no force fetch, return early
        if (fetchPromises.length === 0) {
          loadingStore.hideLoading()
          return {
            planStatus: this.planStatus,
            gold: this.gold,
            goldSize: this.goldSize,
            gem: this.gem,
            gemShape: this.gemShape,
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
          gem: this.gem,
          gemShape: this.gemShape,
          customerType: this.customerType,
          productType: this.productType
        }
      } catch (error) {
        return this.handleError(error, 'Error fetching master data')
      }
    },

    async fetchWithCache(key, url, errorMessage, forceFetch = false) {
      if (!forceFetch && this.isCacheValid(key)) {
        return this[key]
      }

      try {
        this.clearError()
        const response = await api.jewelry.get(url, null, { skipLoading: true })
        this[key] = response || []
        this.updateCacheTimestamp(key)
        return response
      } catch (error) {
        return this.handleError(error, errorMessage)
      }
    },

    // Individual fetch methods with cache check
    // async fetchWithCache(key, url, errorMessage) {
    //   if (!forceFetch && this.isCacheValid(key)) {
    //     return this[key]
    //   }

    //   try {
    //     this.clearError()
    //     const response = await api.jewelry.get(url)
    //     this[key] = response || []
    //     this.updateCacheTimestamp(key)
    //     return response
    //   } catch (error) {
    //     return this.handleError(error, errorMessage)
    //   }
    // },

    // Updated individual fetch methods
    async fetchPlanStatus() {
      return this.fetchWithCache(
        'planStatus',
        'ProductionPlan/GetProductionPlanStatus',
        'Error fetching status'
      )
    },

    async fetchGold() {
      return this.fetchWithCache('gold', 'Master/MasterGold', 'Error fetching gold')
    },

    async fetchGoldSize() {
      return this.fetchWithCache('goldSize', 'Master/MasterGoldSize', 'Error fetching gold size')
    },

    async fetchGem() {
      return this.fetchWithCache('gem', 'Master/MasterGem', 'Error fetching gem')
    },

    async fetchGemShape() {
      return this.fetchWithCache('gemShape', 'Master/MasterGemShape', 'Error fetching gem shape')
    },

    async fetchCustomerType() {
      return this.fetchWithCache(
        'customerType',
        'Master/MasterCustomerType',
        'Error fetching customer type'
      )
    },

    async fetchProductType() {
      return this.fetchWithCache(
        'productType',
        'Master/MasterProductType',
        'Error fetching product type'
      )
    },
    async fetchWorkerType() {
      return this.fetchWithCache(
        'workerType',
        'Worker/GetWorkerProductionType',
        'Error fetching product type'
      )
    },
    async fetchDiamondGrade() {
      return this.fetchWithCache(
        'diamondGrade',
        'Master/MasterDiamondGrade',
        'Error fetching diamond grade'
      )
    },

    // master edit
    async fetchListMaster({ take, skip, sort, form }) {
      const param = {
        take: take,
        skip: skip,
        sort: sort,
        search: {
          type: form.type,
          text: form.text,

          goldCode: form.goldCode,
          goldSizeCode: form.goldSizeCode
        }
      }

      return await api.jewelry.post('Master/ListMaster', param)
    },
    async updateListMaster({ form }) {
      const param = {
        type: 'GEM',
        id: form.id,
        code: form.code,
        nameTh: form.nameTh,
        nameEn: form.nameEn,
        color: form.color
      }

      return await api.jewelry.post('Master/UpdateMasterModel', param)
    },
    async createListMaster({ form }) {
      const param = {
        type: 'GEM',
        id: form.id,
        code: form.code,
        nameTh: form.nameTh,
        nameEn: form.nameEn,
        color: form.color
      }

      return await api.jewelry.post('Master/CreateMasterModel', param)
    },
    async updateMaster({ formValue, skipLoading = false }) {
      return await api.jewelry.post('Master/UpdateMasterModel', formValue, { skipLoading })
    },
    async createMaster({ formValue, skipLoading = false }) {
      return await api.jewelry.post('Master/CreateMasterModel', formValue, { skipLoading })
    }
  }
})
