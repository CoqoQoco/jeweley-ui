import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'
import { formatISOString } from '@/services/utils/dayjs.js'

export const useGoldLossTangMonthlyApiStore = defineStore('goldLossTangMonthlyApi', {
  actions: {
    async fetchMonthly({ workerCode, requestDateStart, requestDateEnd } = {}) {
      return await api.jewelry.post('Worker/ReportGoldLossTangMonthly', {
        workerCode: workerCode || undefined,
        requestDateStart: requestDateStart ? formatISOString(requestDateStart) : null,
        requestDateEnd: requestDateEnd ? formatISOString(requestDateEnd) : null
      })
    }
  }
})
