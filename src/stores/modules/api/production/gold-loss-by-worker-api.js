import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'
import { formatISOString } from '@/services/utils/dayjs.js'

const emptyReport = () => ({
  rows: [],
  monthlyTop: [],
  monthlyRows: [],
  summary: {
    periodStart: null,
    periodEnd: null,
    workerCount: 0,
    jobCount: 0,
    rowsMissingWorkerCount: 0,
    rowsMissingWorkerPercent: 0,
    stageSummaries: []
  }
})

export const useGoldLossByWorkerApiStore = defineStore('goldLossByWorkerApi', {
  state: () => ({
    reportData: emptyReport()
  }),

  actions: {
    async fetchReport({ start, end, status, workerCode, gold, minJobCount } = {}) {
      const res = await api.jewelry.post('Production/Plan/GoldLossByWorkerReport', {
        search: {
          start: start ? formatISOString(start) : null,
          end: end ? formatISOString(end) : null,
          status: status?.length ? status : null,
          workerCode: workerCode || null,
          gold: gold?.length ? gold : null,
          minJobCount: minJobCount || 10
        }
      })
      this.reportData = res ? { ...res } : emptyReport()
    }
  }
})
