import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'
import { formatISOString } from '@/services/utils/dayjs.js'

const emptyReport = () => ({
  rows: [],
  total: {
    jobCount: 0,
    totalWages: 0,
    avgWagesPerJob: 0
  }
})

export const useWagesMonthlyTrendApiStore = defineStore('wagesMonthlyTrendApi', {
  state: () => ({
    reportData: emptyReport()
  }),

  actions: {
    async fetchReport({ start, end } = {}) {
      const res = await api.jewelry.post('Worker/WagesMonthlyTrend', {
        start: start ? formatISOString(start) : null,
        end: end ? formatISOString(end) : null
      })
      this.reportData = res ? { ...res } : emptyReport()
    }
  }
})
