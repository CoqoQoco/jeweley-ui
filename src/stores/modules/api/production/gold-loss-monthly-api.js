import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'

const emptyReport = () => ({
  year: null,
  month: null,
  status: null,
  hasSavedData: false,
  totalMoneyDiff: 0,
  rows: []
})

export const useGoldLossMonthlyApiStore = defineStore('goldLossMonthlyApi', {
  state: () => ({
    reportData: emptyReport()
  }),

  actions: {
    async fetchReport({ year, month, status } = {}) {
      const res = await api.jewelry.post('Production/Plan/GoldLossMonthlyReport', {
        year,
        month,
        status
      })
      this.reportData = res ? { ...res } : emptyReport()
    },

    async saveReport({ year, month, status, items = [] } = {}) {
      return await api.jewelry.post('Production/Plan/GoldLossMonthlyReportSave', {
        year,
        month,
        status,
        items
      })
    }
  }
})
