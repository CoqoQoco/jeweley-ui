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
    initSearchRequeast(form) {
      console.log('initSearchRequeast', form)
      return {
        search: {
          recieptStart: form.recieptStart ? formatISOString(form.recieptStart) : null,
          recieptEnd: form.recieptEnd ? formatISOString(form.recieptEnd) : null,

          receiptNumber: form.receiptNumber,
          stockNumber: form.stockNumber,

          mold: form.mold,
          woText: form.woText,

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
          ...this.initSearchRequeast(form)
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
    async fetchDataSearchExport({ sort, form, title }) {
      try {
        this.dataSearchExport = {}
        const param = {
          take: 0,
          skip: 0,
          sort: sort,
          ...this.initSearchRequeast(form)
        }

        const res = await api.jewelry.post('StockProduct/List', param)
        if (res) {
          const dataExcel = res.data.map((item) => ({
            WO: item.wo,
            'WO No.': item.woNumber,
            เลขที่รับสินค้า: item.receiptNumber,
            วันที่รับสินค้า: formatDate(item.receiptDate),
            เลขที่สินค้า: item.stockNumber,
            เเม่พิมพ์: item.mold,
            รหัสสินค้า: item.productNumber,
            ประเภทสินค้า: item.productTypeName,
            จำนวนสินค้า: item.productQty,
            ประเภททอง_เงิน: item.gold,
            ขนาดทอง_เงิน: item.goldSize
          }))

          console.log('dataExcel title', title)

          const options = {
            filename: title ? `${title}.xlsx` : `คลังสินค้าสินค้า.xlsx`,
            sheetName: title ? `${title}.xlsx` : `คลังสินค้าสินค้า.xlsx`,
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
