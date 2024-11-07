import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'
import {
  formatISOString,
  formatDate
  //formatDateTime
} from '@/services/utils/dayjs.js'
//import swAlert from '@/services/alert/sweetAlerts.js'
//import { CsvHelper } from '@/services/utils/export-excel.js'
import { ExcelHelper } from '@/services/utils/excel-js.js'

export const usrStockProductApiStore = defineStore('stockProduct', {
  state: () => ({
    dataSearch: {},
    dataSearchExport: {}
  }),
  actions: {
    inittSearchRequeast(form) {
      return {
        search: {
          recieptStart: form.recieptStart ? formatISOString(form.recieptStart) : null,
          recieptEnd: form.recieptEnd ? formatISOString(form.recieptEnd) : null,

          receiptNumber: form.receiptNumber,
          stockNumber: form.stockNumber,

          productType: form.productType ? [...form.productType] : null,
          productNumber: form.productNumber
        }
      }
    },

    async fetchDataSearch({ take, skip, sort, form }) {
      try {
        this.dataSearch = {}
        const param = {
          take,
          skip,
          sort,
          ...this.inittSearchRequeast(form)
        }

        const res = await api.jewelry.post('StockProduct/List', param)
        if (res) {
          this.dataSearch = { ...res }
        } else {
          this.dataSearch = {}
        }
      } catch (error) {
        console.error('Error fetching stock product data:', error)
        throw error
      }
    },
    async fetchDataSearchExport({ sort, form }) {
      try {
        this.dataSearchExport = {}
        const param = {
          take: 0,
          skip: 0,
          sort: sort,
          ...this.inittSearchRequeast(form)
        }

        const res = await api.jewelry.post('StockProduct/List', param)
        if (res) {
          const dataExcel = res.data.map((item) => ({
            WO: item.wo,
            'WO No.': item.woNumber,
            วันที่รับสินค้า: formatDate(item.receiptDate),
            เลขที่รับสินค้า: item.receiptNumber,
            เลขที่สินค้า: item.stockNumber,
            เเม่พิมพ์: item.mold,
            รหัสสินค้า: item.productNumber,
            ประเภทสินค้า: item.productTypeName,
            จำนวนสินค้า: item.productQty,
            ประเภททอง_เงิน: item.gold,
            ขนาดทอง_เงิน: item.goldSize
          }))

          const options = {
            filename: `เอกสารรับสินค้า_${form.receiptNumber}.xlsx`,
            sheetName: form.receiptNumber,
            // ลบ columnWidths ออกเพื่อให้ใช้ค่า default width จาก ExcelHelper
            styles: {
              ...ExcelHelper.defaultStyles,
              headerFill: {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: '921313' } // สีน้ำเงินเข้ม
              }
            }
          }

          // เรียกใช้งาน
          ExcelHelper.exportToExcel(dataExcel, options)

          //CsvHelper.exportToCsv(dataExcel, `เอกสารรับสินค้า: ${form.receiptNumber}`)
        }
      } catch (error) {
        console.error('Error fetching stock product export data:', error)
        throw error
      }
    }
  }
})
