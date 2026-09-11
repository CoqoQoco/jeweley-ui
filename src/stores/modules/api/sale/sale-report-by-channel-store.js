import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'
import { formatISOString } from '@/services/utils/dayjs.js'

const emptyReport = () => ({
  summary: { invoiceCount: 0, pieceCount: 0, amounts: [] },
  byDay: [],
  bySeller: [],
  topProducts: [],
  paymentMix: []
})

export const useSaleReportByChannelApiStore = defineStore('saleReportByChannelApi', {
  state: () => ({
    report: emptyReport()
  }),

  actions: {
    buildSearch(formValue = {}) {
      return {
        dateFrom: formValue.start ? formatISOString(formValue.start) : null,
        dateTo: formValue.end ? formatISOString(formValue.end) : null,
        saleChannelCode: formValue.saleChannelCode || null
      }
    },

    async fetchReport(formValue = {}) {
      const res = await api.jewelry.post('SaleReport/ByChannel', this.buildSearch(formValue))
      this.report = res
        ? {
            summary: res.summary || emptyReport().summary,
            byDay: res.byDay || [],
            bySeller: res.bySeller || [],
            topProducts: res.topProducts || [],
            paymentMix: res.paymentMix || []
          }
        : emptyReport()
    }
  }
})
