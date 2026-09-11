import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'

export const useSaleChannelApiStore = defineStore('saleChannelApiStore', {
  state: () => ({
    activeList: []
  }),
  actions: {
    async fetchActiveList({ skipLoading = false } = {}) {
      const response = await api.jewelry.post('SaleChannel/Active', {}, { skipLoading })
      this.activeList = response || []
      return this.activeList
    },

    async fetchCurrent({ skipLoading = false } = {}) {
      return await api.jewelry.post('SaleChannel/Current', {}, { skipLoading })
    }
  }
})
