import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'
import { formatISOString } from '@/services/utils/dayjs.js'

const emptyReport = () => ({
  rows: [],
  total: {
    bookCount: 0,
    sumCastWeight: 0,
    sumCastLoss: 0,
    castLossPct: 0,
    sumCastOver: 0,
    castOverPct: 0
  }
})

export const useCastLossTrendApiStore = defineStore('castLossTrendApi', {
  state: () => ({
    reportData: emptyReport()
  }),

  actions: {
    async fetchReport({ start, end } = {}) {
      const res = await api.jewelry.post('ProductionPlanCost/CastLossTrend', {
        start: start ? formatISOString(start) : null,
        end: end ? formatISOString(end) : null
      })
      this.reportData = res ? { ...res } : emptyReport()
    }
  }
})
