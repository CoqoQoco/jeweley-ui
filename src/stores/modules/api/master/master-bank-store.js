import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'

export const useMasterBankStore = defineStore('masterBank', {
  state: () => ({
    bankList: []
  }),

  actions: {
    async fetchBankList() {
      const response = await api.jewelry.post('MasterBank/List', {}, { skipLoading: true })
      this.bankList = response || []
      return response
    }
  }
})
