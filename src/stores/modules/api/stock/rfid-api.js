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
    },

    // { search?, onlyIncomplete?, skip, take } -> { total, items: [{ receiptNumber, receiptDate, totalPieces, boundPieces, remainingPieces }] }
    async fetchListReceipts({ search, onlyIncomplete, skip, take }) {
      return await api.jewelry.post('StockRfid/ListReceipts', {
        search: search || undefined,
        onlyIncomplete: !!onlyIncomplete,
        skip,
        take
      })
    },

    // receiptNumber -> { receiptNumber, total, bound, items: [{ stockNumber, productCode, ..., epc, tid, boundDate, boundBy }] }
    // poll = true: เรียกซ้ำทุก 3 วิ จึงปิด loading overlay + error modal (composable useRfidLivePoll จัดการ backoff เอง)
    async fetchListByReceipt(receiptNumber, { poll = false } = {}) {
      return await api.jewelry.post(
        'StockRfid/ListByReceipt',
        { receiptNumber },
        poll ? { skipLoading: true, skipError: true } : undefined
      )
    },

    // { search?, locationCode?, skip, take } -> { total, items: [{ stockNumber, productCode, ..., receiptNumber }] }
    async fetchListUnbound({ search, locationCode, skip, take }) {
      return await api.jewelry.post('StockRfid/ListUnbound', {
        search: search || undefined,
        locationCode: locationCode || undefined,
        skip,
        take
      })
    },

    // { sinceId?, take } -> { lastId, items: [{ id, epc, stockNumber, ..., isActive, boundBy, boundDate, updatedDate }] }
    async fetchListRecent({ sinceId, take }, { poll = false } = {}) {
      return await api.jewelry.post(
        'StockRfid/ListRecent',
        { sinceId: sinceId ?? undefined, take },
        poll ? { skipLoading: true, skipError: true } : undefined
      )
    }
  }
})
