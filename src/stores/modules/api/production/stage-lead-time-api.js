import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'
import { formatISOString } from '@/services/utils/dayjs.js'

const emptyReport = () => ({
  rows: [],
  wipRows: [],
  topStuckJobs: [],
  groupBy: '',
  breakdown: [],
  summary: {
    completedPlanCount: 0,
    avgTotalLeadDays: 0,
    medianTotalLeadDays: 0,
    bottleneckStatusCode: null,
    bottleneckStatusName: '',
    plansWithNoStageCount: 0
  }
})

export const useStageLeadTimeApiStore = defineStore('stageLeadTimeApi', {
  state: () => ({
    reportData: emptyReport()
  }),

  actions: {
    async fetchReport({
      completedStart,
      completedEnd,
      gold,
      goldSize,
      productType,
      customerType,
      customerCode,
      mold,
      productNumber,
      text,
      groupBy
    } = {}) {
      const res = await api.jewelry.post('Production/Plan/StageLeadTimeReport', {
        search: {
          completedStart: completedStart ? formatISOString(completedStart) : null,
          completedEnd: completedEnd ? formatISOString(completedEnd) : null,
          gold: gold?.length ? gold : null,
          goldSize: goldSize?.length ? goldSize : null,
          productType: productType?.length ? productType : null,
          customerType: customerType?.length ? customerType : null,
          customerCode: customerCode || null,
          mold: mold || null,
          productNumber: productNumber || null,
          text: text || null,
          groupBy: groupBy || 'none'
        }
      })
      this.reportData = res ? { ...emptyReport(), ...res } : emptyReport()
    }
  }
})
