import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'

export const useStockMoveLocationApiStore = defineStore('stockMoveLocationApi', {
  state: () => ({
    dataSearch: { data: [], total: 0 }
  }),

  actions: {
    async fetchDataSearch({ take = 10, skip = 0, sort = [], formValue = {} } = {}) {
      const res = await api.jewelry.post('StockProduct/List', {
        take,
        skip,
        sort,
        search: { ...formValue }
      })
      if (res) {
        this.dataSearch = { ...res }
      } else {
        this.dataSearch = { data: [], total: 0 }
      }
    },

    async moveLocation({ stockNumbers, targetLocationCode, remark }) {
      return await api.jewelry.post('StockMovement/Move', {
        stockNumbers,
        targetLocationCode,
        remark: remark || undefined
      })
    }
  }
})
