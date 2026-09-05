import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'
import { formatISOString } from '@/services/utils/dayjs.js'

const emptyReport = () => ({
  bucket: 'month',
  groupBy: 'none',
  buckets: [],
  series: [],
  summary: {
    totalPlans: 0,
    totalPieces: 0,
    avgPlansPerBucket: 0,
    avgPiecesPerBucket: 0,
    bestBucketKey: null,
    bestBucketLabel: '',
    bestBucketPlans: 0
  }
})

export const useCapacityReportApiStore = defineStore('capacityReportApi', {
  state: () => ({
    reportData: emptyReport()
  }),

  actions: {
    async fetchReport(form = {}) {
      const res = await api.jewelry.post('Production/Plan/CapacityReport', {
        search: {
          bucket: form.bucket || 'month',
          start: form.start ? formatISOString(form.start) : null,
          end: form.end ? formatISOString(form.end) : null,
          groupBy: form.groupBy || 'none',
          gold: form.gold?.length ? form.gold : null,
          goldSize: form.goldSize?.length ? form.goldSize : null,
          productType: form.productType?.length ? form.productType : null,
          customerType: form.customerType?.length ? form.customerType : null,
          customerCode: form.customerCode || null,
          mold: form.mold || null,
          productNumber: form.productNumber || null,
          text: form.text || null
        }
      })
      this.reportData = res ? { ...emptyReport(), ...res } : emptyReport()
      return this.reportData
    }
  }
})
