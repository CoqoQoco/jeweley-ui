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
        if (!map[row.stockNumber]) {
          map[row.stockNumber] = { rows: [], qtyOnHand: 0, qtyReserved: 0, qtyAvailable: 0 }
        }
        map[row.stockNumber].rows.push({
          locationCode: row.locationCode,
          location: row.locationCode,
          qtyOnHand: row.qtyOnHand ?? 0,
          qtyReserved: row.qtyReserved ?? 0,
          qtyAvailable: row.qtyAvailable ?? 0
        })
        map[row.stockNumber].qtyOnHand += row.qtyOnHand ?? 0
        map[row.stockNumber].qtyReserved += row.qtyReserved ?? 0
        map[row.stockNumber].qtyAvailable += row.qtyAvailable ?? 0
      }
      this.balanceMap = { ...this.balanceMap, ...map }
      return map
    }
  }
})
