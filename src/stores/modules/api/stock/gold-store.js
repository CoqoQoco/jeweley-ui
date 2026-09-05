import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'

export const useStockGoldApiStore = defineStore('stockGold', {
  state: () => ({}),

  actions: {
    async listBalance({ take = 10, skip = 0, sort = [], search = {} } = {}) {
      return await api.jewelry.post('StockGold/Balance', { take, skip, sort, search })
    },

    async listTransection({ take = 10, skip = 0, sort = [], search = {} } = {}) {
      return await api.jewelry.post('StockGold/Transection', { take, skip, sort, search })
    },

    async inbound(payload) {
      return await api.jewelry.post('StockGold/Inbound', payload)
    },

    async openingBalance(payload) {
      return await api.jewelry.post('StockGold/OpeningBalance', payload)
    },

    async adjust(payload) {
      return await api.jewelry.post('StockGold/Adjust', payload)
    }
  }
})
