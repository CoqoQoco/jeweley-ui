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
    async fetchReport(params) {
      const res = await api.jewelry.post('Production/Plan/GoldLossTangReport', params)

      if (res) {
        this.reportData = res
      }

      return res
    },

    async saveReport(payload) {
      const res = await api.jewelry.post('Production/Plan/GoldLossTangReportSave', payload)
      return res
    },

    async createJob(payload) {
      const res = await api.jewelry.post('Production/Plan/GoldLossTangCreateJob', payload)
      return res
    },

    async fetchJobList(params) {
      return await api.jewelry.post('Production/Plan/GoldLossTangJobList', params)
    },

    async fetchJobDetail(jobId) {
      return await api.jewelry.post('Production/Plan/GoldLossTangJobDetail', { jobId })
    },

    async updateJob(payload) {
      return await api.jewelry.post('Production/Plan/GoldLossTangUpdateJob', payload)
    },

    resetData() {
      this.reportData = null
    }
  }
})
