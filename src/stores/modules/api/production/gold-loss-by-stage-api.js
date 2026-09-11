import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'

const emptyReport = () => ({
  year: null,
  month: null,
  rows: [],
  total: {
    sumGoldWeightSend: 0,
    sumGoldWeightCheck: 0,
    rawLoss: 0,
    rawLossPercent: 0,
    jobCount: 0,
    rowsReturned: 0,
    rowsPendingReturn: 0,
    pendingWeight: 0
  }
})

export const useGoldLossByStageApiStore = defineStore('goldLossByStageApi', {
  state: () => ({
    reportData: emptyReport()
  }),

  actions: {
    async fetchReport({ year, month, status } = {}) {
      const res = await api.jewelry.post('Production/Plan/GoldLossByStageReport', {
        year,
        month,
        status
      })
      this.reportData = res ? { ...res } : emptyReport()
    }
  }
})
