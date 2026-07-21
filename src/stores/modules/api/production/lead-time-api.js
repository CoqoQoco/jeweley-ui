import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'
import { formatISOString } from '@/services/utils/dayjs.js'

const emptyReport = () => ({
  groupBy: 'productType',
  rows: [],
  summary: {
    totalCount: 0,
    avgDays: 0,
    medianDays: 0,
    invalidCount: 0
  }
})

export const useLeadTimeApiStore = defineStore('leadTimeApi', {
  state: () => ({
    reportData: emptyReport()
  }),

  actions: {
    async fetchReport({ completedStart, completedEnd, groupBy, productType, customerType } = {}) {
      const res = await api.jewelry.post('Production/Plan/LeadTimeReport', {
        completedStart: completedStart ? formatISOString(completedStart) : null,
        completedEnd: completedEnd ? formatISOString(completedEnd) : null,
        groupBy,
        productType: productType?.length ? productType : undefined,
        customerType: customerType?.length ? customerType : undefined
      })
      this.reportData = res ? { ...res } : emptyReport()
    }
  }
})
