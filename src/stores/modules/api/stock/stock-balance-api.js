import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'
import { ExcelHelper } from '@/services/utils/excel-js.js'

export const useStockBalanceApiStore = defineStore('stockBalance', {
  state: () => ({
    balanceMap: {},
    summary: { skuCount: 0, locationCount: 0, totalOnHand: 0, totalReserved: 0, totalAvailable: 0 },
    byLocation: []
  }),
  actions: {
    async fetchByStockNumbers(stockNumbers) {
      if (!stockNumbers?.length) return {}
      const res = await api.jewelry.post('StockBalance/ByStockNumbers', { stockNumbers })
      const map = {}
      for (const row of res || []) {
        if (!map[row.stockNumber]) {
          map[row.stockNumber] = { rows: [], qtyOnHand: 0, qtyReserved: 0, qtyAvailable: 0 }
        }
        map[row.stockNumber].rows.push({
          locationCode: row.locationCode,
          location: row.locationCode,
          qtyOnHand: row.qtyOnHand ?? 0,
          qtyReserved: row.qtyReserved ?? 0,
          qtyAvailable: row.qtyAvailable ?? 0
        })
        map[row.stockNumber].qtyOnHand += row.qtyOnHand ?? 0
        map[row.stockNumber].qtyReserved += row.qtyReserved ?? 0
        map[row.stockNumber].qtyAvailable += row.qtyAvailable ?? 0
      }
      this.balanceMap = { ...this.balanceMap, ...map }
      return map
    },

    async fetchSummary({ locationCode = null } = {}) {
      const res = await api.jewelry.post('StockBalance/Summary', { locationCode: locationCode || null })
      this.summary = res?.overall || {
        skuCount: 0,
        locationCount: 0,
        totalOnHand: 0,
        totalReserved: 0,
        totalAvailable: 0
      }
      this.byLocation = res?.byLocation || []
    },

    async exportByLocation() {
      const dataExcel = this.byLocation.map((item) => ({
        รหัสคลัง: item.locationCode,
        ชื่อคลัง: item.locationName,
        จำนวนรายการ: item.skuCount,
        คงเหลือ: Number(item.totalOnHand || 0).toFixed(2),
        จอง: Number(item.totalReserved || 0).toFixed(2),
        พร้อมขาย: Number(item.totalAvailable || 0).toFixed(2)
      }))

      const options = {
        filename: 'รายงานสรุปยอดคงเหลือคลัง.xlsx',
        sheetName: 'สรุปยอดคงเหลือ',
        styles: {
          ...ExcelHelper.defaultStyles,
          headerFill: {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '921313' }
          }
        }
      }

      await ExcelHelper.exportToExcel(dataExcel, options)
    }
  }
})
