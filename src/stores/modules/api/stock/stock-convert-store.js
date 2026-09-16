import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'

export const useStockConvertApiStore = defineStore('stockConvert', {
  state: () => ({
    dataList: {
      data: [],
      total: 0
    }
  }),

  actions: {
    // List/Request : DataSourceRequest — filter เป็น flat property คู่กับ take/skip/sort (ไม่ nest ใน search)
    async list({ take = 10, skip = 0, sort = [], documentNumber, soNumber, status, dateFrom, dateTo, sourceStockNumber } = {}) {
      const request = {
        take,
        skip,
        sort,
        documentNumber: documentNumber || null,
        soNumber: soNumber || null,
        status: status ?? null,
        dateFrom: dateFrom || null,
        dateTo: dateTo || null,
        sourceStockNumber: sourceStockNumber || null
      }
      const res = await api.jewelry.post('StockConvert/List', request)

      if (res) {
        this.dataList = {
          data: res.data || [],
          total: res.total || 0
        }
      }

      return this.dataList
    },

    async get(running) {
      return await api.jewelry.post('StockConvert/Get', { running })
    },

    // สร้างใบแปลงสินค้า — จองชิ้นต้นทาง (soNumber/soLineKey ระบุเมื่อสร้างจากบรรทัด "รอผลิต/รอแปลง" ของใบสั่งขาย)
    async create({ soNumber, soLineKey, sourceStockNumbers, remark } = {}) {
      return await api.jewelry.post('StockConvert/Create', {
        soNumber: soNumber || null,
        soLineKey: soLineKey || null,
        sourceStockNumbers: sourceStockNumbers || [],
        remark: remark || null
      })
    },

    // ปิดใบแปลง — ชิ้นต้นทางออกจากคลัง สร้างชิ้นใหม่ (resultStockNumber)
    async complete({ running, locationCode, convertCost, result }) {
      return await api.jewelry.post('StockConvert/Complete', {
        running,
        locationCode: locationCode || null,
        convertCost: Number(convertCost) || 0,
        result
      })
    },

    async cancel({ running, cancelReason }) {
      return await api.jewelry.post('StockConvert/Cancel', { running, cancelReason })
    },

    // เอกสารที่แปลงเสร็จแล้วของใบสั่งขายนี้ ที่ยังไม่ถูกเติมเข้าบรรทัดไหน
    async pendingForSaleOrder(soNumber) {
      return await api.jewelry.post('StockConvert/PendingForSaleOrder', { soNumber })
    }
  }
})
