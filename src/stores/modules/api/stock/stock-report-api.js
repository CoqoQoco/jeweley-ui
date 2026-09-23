import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'
import { formatISOString } from '@/services/utils/dayjs.js'

const emptyFilterOptions = () => ({
  locations: [],
  productTypes: [],
  golds: [],
  goldSizes: []
})

const emptySummary = () => ({
  pieceQty: 0,
  pieceRowCount: 0,
  reservedQty: 0,
  designCount: 0,
  agedOver2YearsQty: 0,
  agedOver2YearsPercent: 0,
  overProducedDesignCount: 0,
  lowStockDesignCount: 0,
  filterOptions: emptyFilterOptions(),
  dataAsOf: null
})

const emptyProductGroup = () => ({
  groups: [],
  totalPieceQty: 0,
  totalPieceRowCount: 0
})

const emptyAging = () => ({
  buckets: [],
  topGroups: [],
  agedQty: 0,
  agedRowCount: 0,
  thresholdYears: 2,
  totalPieceQty: 0
})

const emptyAgingItems = () => ({
  data: [],
  total: 0
})

const emptyProductionBalance = () => ({
  groups: [],
  totalStockQty: 0,
  totalSoldQty: 0,
  salesStart: null,
  salesEnd: null
})

const emptyDesignAlerts = () => ({
  data: [],
  total: 0
})

// request-sequence guard — กันตอบสนอง (response) เก่ามาถึงหลัง (out-of-order) แล้วทับค่าล่าสุดใน state
// ตัวแปรอยู่ระดับ module (ไม่ใช่ state) เพราะไม่ต้องการให้ reactive/persist ข้าม instance
let summarySeq = 0
let productGroupSeq = 0
let agingSeq = 0
let agingItemsSeq = 0
let productionBalanceSeq = 0
let designAlertsSeq = 0

export const useStockReportApiStore = defineStore('stockReportApi', {
  state: () => ({
    summary: emptySummary(),
    productGroup: emptyProductGroup(),
    aging: emptyAging(),
    agingItems: emptyAgingItems(),
    productionBalance: emptyProductionBalance(),
    designAlerts: emptyDesignAlerts()
  }),

  actions: {
    buildFilterBody(filter = {}) {
      return {
        locationCodes: filter.locationCodes || [],
        productTypes: filter.productTypes || [],
        golds: filter.golds || [],
        goldSizes: filter.goldSizes || [],
        salesStart: filter.salesStart ? formatISOString(filter.salesStart) : null,
        salesEnd: filter.salesEnd ? formatISOString(filter.salesEnd) : null
      }
    },

    async fetchSummary(filter = {}) {
      const requestSeq = ++summarySeq
      const res = await api.jewelry.post('StockReport/Summary', this.buildFilterBody(filter))
      if (requestSeq !== summarySeq) return this.summary // ผลลัพธ์เก่ากว่า request ล่าสุด — ทิ้ง ไม่ทับ state
      this.summary = res
        ? { ...emptySummary(), ...res, filterOptions: res.filterOptions || emptyFilterOptions() }
        : emptySummary()
      return this.summary
    },

    async fetchProductGroup(filter = {}, groupBy = 'productType') {
      const requestSeq = ++productGroupSeq
      const body = { ...this.buildFilterBody(filter), groupBy }
      const res = await api.jewelry.post('StockReport/ProductGroup', body)
      if (requestSeq !== productGroupSeq) return this.productGroup // ผลลัพธ์เก่ากว่า request ล่าสุด — ทิ้ง ไม่ทับ state
      this.productGroup = res
        ? {
            groups: res.groups || [],
            totalPieceQty: res.totalPieceQty || 0,
            totalPieceRowCount: res.totalPieceRowCount || 0
          }
        : emptyProductGroup()
      return this.productGroup
    },

    async fetchAging(filter = {}, query = {}) {
      const requestSeq = ++agingSeq
      const body = {
        ...this.buildFilterBody(filter),
        thresholdYears: query.thresholdYears || 2,
        groupBy: query.groupBy || 'productType'
      }
      const res = await api.jewelry.post('StockReport/Aging', body)
      if (requestSeq !== agingSeq) return this.aging // ผลลัพธ์เก่ากว่า request ล่าสุด — ทิ้ง ไม่ทับ state
      this.aging = res
        ? {
            buckets: res.buckets || [],
            topGroups: res.topGroups || [],
            agedQty: res.agedQty || 0,
            agedRowCount: res.agedRowCount || 0,
            thresholdYears: res.thresholdYears || body.thresholdYears,
            totalPieceQty: res.totalPieceQty || 0
          }
        : emptyAging()
      return this.aging
    },

    async fetchAgingItems(filter = {}, query = {}) {
      const requestSeq = ++agingItemsSeq
      const body = {
        ...this.buildFilterBody(filter),
        thresholdYears: query.thresholdYears || 2,
        skip: query.skip || 0,
        take: query.take || 50
      }
      const res = await api.jewelry.post('StockReport/AgingItems', body)
      if (requestSeq !== agingItemsSeq) return this.agingItems // ผลลัพธ์เก่ากว่า request ล่าสุด — ทิ้ง ไม่ทับ state
      this.agingItems = res ? { data: res.data || [], total: res.total || 0 } : emptyAgingItems()
      return this.agingItems
    },

    async fetchProductionBalance(filter = {}, groupBy = 'productType') {
      const requestSeq = ++productionBalanceSeq
      const body = { ...this.buildFilterBody(filter), groupBy }
      const res = await api.jewelry.post('StockReport/ProductionBalance', body)
      if (requestSeq !== productionBalanceSeq) return this.productionBalance // ผลลัพธ์เก่ากว่า request ล่าสุด — ทิ้ง ไม่ทับ state
      this.productionBalance = res
        ? {
            groups: res.groups || [],
            totalStockQty: res.totalStockQty || 0,
            totalSoldQty: res.totalSoldQty || 0,
            salesStart: res.salesStart || null,
            salesEnd: res.salesEnd || null
          }
        : emptyProductionBalance()
      return this.productionBalance
    },

    async fetchDesignAlerts(filter = {}, query = {}) {
      const requestSeq = ++designAlertsSeq
      const body = {
        ...this.buildFilterBody(filter),
        mode: query.mode || 'low',
        skip: query.skip || 0,
        take: query.take || 20
      }
      const res = await api.jewelry.post('StockReport/DesignAlerts', body)
      if (requestSeq !== designAlertsSeq) return this.designAlerts // ผลลัพธ์เก่ากว่า request ล่าสุด — ทิ้ง ไม่ทับ state
      this.designAlerts = res ? { data: res.data || [], total: res.total || 0 } : emptyDesignAlerts()
      return this.designAlerts
    }
  }
})
