import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'

export const useStockBalanceApiStore = defineStore('stockBalance', {
  state: () => ({
    balanceMap: {}
  }),
  actions: {
    async fetchByStockNumbers(stockNumbers) {
      if (!stockNumbers?.length) return {}
      const res = await api.jewelry.post('StockBalance/ByStockNumbers', { stockNumbers })
      const map = {}
      for (const row of res || []) {
        map[row.stockNumber] = row
      }
      this.balanceMap = { ...this.balanceMap, ...map }
      return map
    }
  }
})
