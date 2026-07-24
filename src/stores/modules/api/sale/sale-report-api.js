import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'
import { formatISOString } from '@/services/utils/dayjs.js'

const emptyPipeline = () => ({
  summary: {
    totalQuotationValue: 0,
    quotationCount: 0,
    activeCustomers: 0,
    conversionRate: 0
  },
  funnel: {
    quotationCount: 0,
    saleOrderCount: 0,
    invoiceCount: 0
  },
  monthlyQuotation: [],
  topCustomers: []
})

export const useSaleReportApiStore = defineStore('saleReportApi', {
  state: () => ({
    pipeline: emptyPipeline()
  }),

  actions: {
    async fetchPipelineSummary({ start, end } = {}) {
      const res = await api.jewelry.post('SaleReport/PipelineSummary', {
        start: start ? formatISOString(start) : null,
        end: end ? formatISOString(end) : null
      })
      this.pipeline = res ? { ...emptyPipeline(), ...res } : emptyPipeline()
    }
  }
})
