import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'
import { formatISOString } from '@/services/utils/dayjs.js'
import swAlert from '@/services/alert/sweetAlerts.js'
import { ExcelHelper } from '@/services/utils/excel-js.js'

export const usePlanBOMApiStore = defineStore('planBOM', {
  state: () => ({
    bomData: [],
    bomSummary: {
      totalItems: 0,
      totalCost: 0,
      lastUpdated: null
    },
    isLoading: false,
    error: null
  }),

  getters: {},

  actions: {
    async fetchTransaction({ id, skipLoading = false }) {
      try {
        const param = {
          id: id
        }
        return await api.jewelry.get('Production/Bom/Transaction', param, { skipLoading })
      } catch (error) {
        console.error('Error fetching transaction data:', error)
        throw error
      }
    },

    async fetchGet({ id }) {
      try {
        const param = {
          id: id
        }
        return await api.jewelry.get('Production/Bom/Get', param)
      } catch (error) {
        console.error('Error fetching get data:', error)
        throw error
      }
    },

    async fetchSave({ formValue, skipLoading = false }) {
      try {
        return await api.jewelry.post('Production/Bom/Save', formValue, { skipLoading })
      } catch (error) {
        console.error('Error fetching save data:', error)
        throw error
      }
    }
  }
})
