import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'

export const useGoldLossTangReportStore = defineStore('goldLossTangReport', {
  state: () => ({
    reportData: null
  }),

  getters: {
    getReportData: (state) => state.reportData
  },

  actions: {
    async fetchReport(year, month, status = 50) {
      const param = {
        year,
        month,
        status
      }

      const res = await api.jewelry.post('Production/Plan/GoldLossMonthlyReport', param)

      if (res) {
        this.reportData = res
      }

      return res
    },

    async saveReport(payload) {
      const res = await api.jewelry.post('Production/Plan/GoldLossMonthlyReportSave', payload)
      return res
    },

    resetData() {
      this.reportData = null
    }
  }
})
