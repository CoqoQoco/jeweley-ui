import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'
import { formatISOString } from '@/services/utils/dayjs.js'

const emptySummary = () => ({
  planSumSend: 0,
  planSumCheck: 0,
  planRawLoss: 0,
  planLossPercent: 0,
  planRowsReturned: 0,
  planRowsPending: 0,

  slipCount: 0,
  slipIssued: 0,
  slipReturned: 0,
  slipRawLoss: 0,
  slipAllowedLoss: 0,
  slipDiffLoss: 0,
  slipMoneyDiff: 0,
  slipLossPercent: 0,

  extraIssuedWeight: 0,
  extraReturnedWeight: 0,
  extraReturnedNotCounted: 0,
  gapWeight: 0,
  gapExplainedByExtras: 0,
  gapUnexplained: 0,

  linkedDetailRows: 0,
  unlinkedDetailRows: 0,
  linkCoveragePercent: 0
})

const emptyReport = () => ({
  start: null,
  end: null,
  rows: [],
  summary: emptySummary()
})

export const useGoldLossReconcileApiStore = defineStore('goldLossReconcileApi', {
  state: () => ({
    reportData: emptyReport()
  }),

  actions: {
    async fetchReport({ start, end, status, workerCode } = {}) {
      const res = await api.jewelry.post('Production/Plan/GoldLossReconcileReport', {
        start: start ? formatISOString(start) : null,
        end: end ? formatISOString(end) : null,
        status: status?.length ? status : null,
        workerCode: workerCode || null
      })
      this.reportData = res ? { ...res } : emptyReport()
    }
  }
})
