import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'

// StockRfid/* — ผูก/ยกเลิก/ค้นหาแท็ก RFID กับชิ้นสินค้า (error 400 ภาษาไทย แสดงโดย axios-helper.js เอง)
export const useStockRfidApiStore = defineStore('stockRfidApi', {
  actions: {
    // { epc, tid?, stockNumber, productCode, unitId? } -> { id, epc, tid, stockNumber, productCode, unitId, unitNo, unitStatus, unitLocationCode, unitLocationName, lotQty }
    // ไม่ส่ง unitId = server เลือกชิ้นว่างเลขต่ำสุดให้
    // options: { skipError, skipLoading } — หน้าผูกต่อเนื่องแสดง error ในหน้าเอง และไม่บังด้วย loading overlay
    async fetchBind({ epc, tid, stockNumber, productCode, unitId }, options) {
      return await api.jewelry.post(
        'StockRfid/Bind',
        {
          epc,
          tid: tid || undefined,
          stockNumber,
          productCode,
          unitId: unitId || undefined
        },
        options
      )
    },

    // { epc?, unitId?, stockNumber?, productCode? } -> { unbound } (ล็อตที่มีแท็กหลายชิ้นต้องระบุ epc หรือ unitId)
    async fetchUnbind({ epc, unitId, stockNumber, productCode }, options) {
      return await api.jewelry.post(
        'StockRfid/Unbind',
        {
          epc: epc || undefined,
          unitId: unitId || undefined,
          stockNumber,
          productCode
        },
        options
      )
    },

    // body (ดู buildListRequest ใน rfid-bind-logic.js) -> { total, items: [{ unitId, unitNo, lotQty, unitStatus, stockNumber, stockNumberOrigin, productCode, productNumber, productNameTh, productNameEn, productType, productTypeName, locationCode, locationName, imagePath, receiptNumber, receiptDate, epc, boundDate }] }
    async fetchListUnits(body, options) {
      return await api.jewelry.post('StockRfid/ListUnits', body, options)
    },

    // { search?, receiptDateFrom?, receiptDateTo?, onlyIncomplete, skip, take } -> { total, items: [{ wo, woNumber, woText, productNameTh, productNameEn, imagePath, mold, lotCount, totalUnits, unboundUnits, lastReceiptDate }] }
    async fetchListPlans(body, options) {
      return await api.jewelry.post('StockRfid/ListPlans', body, options)
    },

    // code (URL QR / เลขผลิตใหม่ / เลขผลิตเก่า) -> { items: [รูปแบบเดียวกับ ListUnits item] } ทุกชิ้น IN_STOCK+RESERVED ของล็อตที่ตรง ไม่เจอ = items ว่าง
    async fetchResolveLabel(code, options) {
      return await api.jewelry.post('StockRfid/ResolveLabel', { code }, options)
    },

    // epc -> { found, epc, tid, stockNumber, productCode, productName, productNumber, status, locationCode, imagePath,
    //          unitId, unitNo, unitStatus, unitLocationCode, unitLocationName, lotQty, soldMismatch }
    async fetchByEpc(epc) {
      return await api.jewelry.post('StockRfid/GetByEpc', { epc })
    },

    // epcs[] -> { items: [GetByEpc shape], notFound: string[] }
    async fetchByEpcs(epcs, options) {
      return await api.jewelry.post('StockRfid/GetByEpcs', { epcs }, options)
    },

    // { stockNumber, productCode } -> { found, epc, tid, boundDate, lotQty,
    //   units: [{ unitId, unitNo, status, locationCode, locationName, receiptNumber, receiptDate, soldRef, soldDate, epc, tid, boundDate, boundBy }] }
    async fetchByStock({ stockNumber, productCode }, { skipLoading = false } = {}) {
      return await api.jewelry.post(
        'StockRfid/GetByStock',
        { stockNumber, productCode },
        skipLoading ? { skipLoading: true } : undefined
      )
    },

    // { search?, onlyIncomplete?, skip, take } -> { total, items: [{ receiptNumber, receiptDate, totalPieces, boundPieces, remainingPieces }] } (นับเป็นชิ้น/unit)
    async fetchListReceipts({ search, onlyIncomplete, skip, take }) {
      return await api.jewelry.post('StockRfid/ListReceipts', {
        search: search || undefined,
        onlyIncomplete: !!onlyIncomplete,
        skip,
        take
      })
    },

    // receiptNumber -> { receiptNumber, total, bound, items: [{ unitId, unitNo, unitStatus, stockNumber, productCode, ..., epc, tid, boundDate, boundBy }] } (1 แถว = 1 ชิ้น)
    // poll = true: เรียกซ้ำทุก 3 วิ จึงปิด loading overlay + error modal (composable useRfidLivePoll จัดการ backoff เอง)
    async fetchListByReceipt(receiptNumber, { poll = false } = {}) {
      return await api.jewelry.post(
        'StockRfid/ListByReceipt',
        { receiptNumber },
        poll ? { skipLoading: true, skipError: true } : undefined
      )
    },

    // { search?, locationCode?, skip, take } -> { total, items: [{ unitId, unitNo, stockNumber, productCode, ..., receiptNumber }] } (1 แถว = 1 ชิ้นว่าง)
    async fetchListUnbound({ search, locationCode, skip, take }) {
      return await api.jewelry.post('StockRfid/ListUnbound', {
        search: search || undefined,
        locationCode: locationCode || undefined,
        skip,
        take
      })
    },

    // { sinceId?, take } -> { lastId, items: [{ id, epc, stockNumber, unitId, unitNo, unbindReason (MANUAL|SOLD), ..., isActive, boundBy, boundDate, updatedDate }] }
    async fetchListRecent({ sinceId, take }, { poll = false } = {}) {
      return await api.jewelry.post(
        'StockRfid/ListRecent',
        { sinceId: sinceId ?? undefined, take },
        poll ? { skipLoading: true, skipError: true } : undefined
      )
    }
  }
})
