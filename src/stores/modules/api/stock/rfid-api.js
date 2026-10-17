import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'

// StockRfid/* — ผูก/ยกเลิก/ค้นหาแท็ก RFID กับชิ้นสินค้า (error 400 ภาษาไทย แสดงโดย axios-helper.js เอง)
export const useStockRfidApiStore = defineStore('stockRfidApi', {
  actions: {
    // { epc, tid?, stockNumber, productCode } -> { id, epc, tid, stockNumber, productCode }
    async fetchBind({ epc, tid, stockNumber, productCode }) {
      return await api.jewelry.post('StockRfid/Bind', { epc, tid: tid || undefined, stockNumber, productCode })
    },

    // { epc?, stockNumber?, productCode? } -> { unbound }
    async fetchUnbind({ epc, stockNumber, productCode }) {
      return await api.jewelry.post('StockRfid/Unbind', { epc, stockNumber, productCode })
    },

    // epc -> { found, epc, tid, stockNumber, productCode, productName, productNumber, status, locationCode, imagePath }
    async fetchByEpc(epc) {
      return await api.jewelry.post('StockRfid/GetByEpc', { epc })
    },

    // epcs[] -> { items: [GetByEpc shape], notFound: string[] }
    async fetchByEpcs(epcs) {
      return await api.jewelry.post('StockRfid/GetByEpcs', { epcs })
    },

    // { stockNumber, productCode } -> { found, epc, tid, boundDate }
    async fetchByStock({ stockNumber, productCode }) {
      return await api.jewelry.post('StockRfid/GetByStock', { stockNumber, productCode })
    }
  }
})
