import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'
import { formatISOString } from '@/services/utils/dayjs.js'

const emptyReport = () => ({
  statusRows: [],
  summary: {
    total: 0,
    approvalRate: 0,
    cancelRate: 0,
    avgOrderToSubmitDays: 0,
    avgSubmitToApproveDays: 0
  }
})

export const usePrePlanFunnelApiStore = defineStore('prePlanFunnelApi', {
  state: () => ({
    reportData: emptyReport()
  }),

  actions: {
    async fetchReport({ start, end, jobType, jobLocation } = {}) {
      const res = await api.jewelry.post('ProductionPrePlan/FunnelReport', {
        start: start ? formatISOString(start) : null,
        end: end ? formatISOString(end) : null,
        jobType: jobType?.length ? jobType : undefined,
        jobLocation: jobLocation?.length ? jobLocation : undefined
      })
      this.reportData = res ? { ...res } : emptyReport()
    }
  }
})
