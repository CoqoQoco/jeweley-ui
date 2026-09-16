import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'
import { formatISOString } from '@/services/utils/dayjs.js'

const emptySummary = () => ({
  invoiceCount: 0,
  uncomputableInvoiceCount: 0,
  totalAmountThb: 0,
  paidAmountThb: 0,
  outstandingAmountThb: 0,
  paidInvoiceCount: 0,
  outstandingInvoiceCount: 0,
  pieceCount: 0,
  overpaidAmountThb: 0,
  overpaidInvoiceCount: 0
})

const emptyProductGroup = () => ({
  groups: [],
  totalPieceCount: 0,
  totalAmountThb: 0,
  filterOptions: {
    productTypes: [],
    golds: [],
    goldSizes: []
  }
})

const emptyTopDesign = () => ({
  designs: [],
  totalDesignCount: 0,
  totalPieceCount: 0,
  totalAmountThb: 0
})

// request-sequence guard — กันตอบสนอง (response) เก่ามาถึงหลัง (out-of-order) แล้วทับค่าล่าสุดใน state
// ตัวแปรอยู่ระดับ module (ไม่ใช่ state) เพราะไม่ต้องการให้ reactive/persist ข้าม instance
let summarySeq = 0
let productGroupSeq = 0
let topDesignSeq = 0

export const useSaleReportApiStore = defineStore('saleReportApi', {
  state: () => ({
    summary: emptySummary(),
    productGroup: emptyProductGroup(),
    topDesign: emptyTopDesign()
  }),

  actions: {
    buildFilterBody(filter = {}) {
      return {
        start: filter.start ? formatISOString(filter.start) : null,
        end: filter.end ? formatISOString(filter.end) : null,
        saleChannelCodes: filter.saleChannelCodes || [],
        customerCode: filter.customerCode || null
      }
    },

    async fetchSalesSummary(filter = {}) {
      const requestSeq = ++summarySeq
      const res = await api.jewelry.post('SaleReport/SalesSummary', this.buildFilterBody(filter))
      if (requestSeq !== summarySeq) return this.summary // ผลลัพธ์เก่ากว่า request ล่าสุด — ทิ้ง ไม่ทับ state
      this.summary = res ? { ...emptySummary(), ...res } : emptySummary()
      return this.summary
    },

    async fetchProductGroupSales(filter = {}, productQuery = {}) {
      const requestSeq = ++productGroupSeq
      const body = {
        ...this.buildFilterBody(filter),
        groupBy: productQuery.groupBy || 'productType',
        productTypes: productQuery.productTypes || [],
        golds: productQuery.golds || [],
        goldSizes: productQuery.goldSizes || []
      }
      const res = await api.jewelry.post('SaleReport/ProductGroupSales', body)
      if (requestSeq !== productGroupSeq) return this.productGroup // ผลลัพธ์เก่ากว่า request ล่าสุด — ทิ้ง ไม่ทับ state
      this.productGroup = res
        ? {
            groups: res.groups || [],
            totalPieceCount: res.totalPieceCount || 0,
            totalAmountThb: res.totalAmountThb || 0,
            filterOptions: res.filterOptions || emptyProductGroup().filterOptions
          }
        : emptyProductGroup()
      return this.productGroup
    },

    async fetchTopDesignSales(filter = {}, query = {}) {
      const requestSeq = ++topDesignSeq
      const body = {
        ...this.buildFilterBody(filter),
        productTypes: query.productTypes || [],
        golds: query.golds || [],
        goldSizes: query.goldSizes || [],
        sortBy: query.sortBy || 'pieces',
        take: query.take || 10
      }
      const res = await api.jewelry.post('SaleReport/TopDesignSales', body)
      if (requestSeq !== topDesignSeq) return this.topDesign // ผลลัพธ์เก่ากว่า request ล่าสุด — ทิ้ง ไม่ทับ state
      this.topDesign = res
        ? {
            designs: res.designs || [],
            totalDesignCount: res.totalDesignCount || 0,
            totalPieceCount: res.totalPieceCount || 0,
            totalAmountThb: res.totalAmountThb || 0
          }
        : emptyTopDesign()
      return this.topDesign
    }
  }
})
