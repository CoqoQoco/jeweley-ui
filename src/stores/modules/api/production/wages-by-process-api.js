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

export const useWagesByProcessApiStore = defineStore('wagesByProcessApi', {
  state: () => ({
    reportData: emptyReport()
  }),

  actions: {
    async fetchReport({ start, end, status } = {}) {
      const res = await api.jewelry.post('Worker/WagesByProcess', {
        start: start ? formatISOString(start) : null,
        end: end ? formatISOString(end) : null,
        status: status?.length ? status : undefined
      })
      this.reportData = res ? { ...res } : emptyReport()
    }
  }
})
