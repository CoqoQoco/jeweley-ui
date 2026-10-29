import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'

export const useReceiptLotApiStore = defineStore('receiptLot', {
  actions: {
    async fetchSearch(keyword) {
      const res = await api.jewelry.post(
        'ReceiptLot/Search',
        { keyword },
        { skipLoading: true }
      )
      return Array.isArray(res) ? res : []
    }
  }
})
