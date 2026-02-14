import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'
import {
  //formatISOString,
  formatDate
  //formatDateTime
} from '@/services/utils/dayjs.js'

import { formatDecimal } from '@/services/utils/decimal.js'
//import swAlert from '@/services/alert/sweetAlerts.js'
//import { CsvHelper } from '@/services/utils/export-excel.js'
import { ExcelHelper } from '@/services/utils/excel-js.js'

export const usrStockProductApiStore = defineStore('stockProduct', {
  state: () => ({
    dataSearch: {},
    dataSearchExport: {}
  }),
  actions: {
    async fetchDataSearch({ take, skip, sort, formValue }) {
      try {
        //console.log('formValue', formValue)
        this.dataSearch = {}
        const param = {
          take: take,
          skip: skip,
          sort: sort,
          search: {
            ...formValue
          }
        }

        const res = await api.jewelry.post('StockProduct/List', param)
        if (res) {
          this.dataSearch = { ...res }
        } else {
          this.dataSearch = {}
        }
      } catch (error) {
        console.error('Error fetching stock product data:', error)
      }
    },
    async fetchDataGet({ formValue }) {
      try {
        //console.log('formValue', formValue)
        this.dataSearch = {}
        const param = {
          ...formValue
        }

        return await api.jewelry.post('StockProduct/Get', param, {
          skipLoading: true
        })
      } catch (error) {
        console.error('Error get stock product data:', error)
      }
    },

    async fetchDataSearchReceiptExport({ sort, formValue, title }) {
      try {
        this.dataSearchExport = {}
        const param = {
          take: 0,
          skip: 0,
          sort: sort,
          search: {
            ...formValue
          }
        }

        const res = await api.jewelry.post('StockProduct/List', param)
        if (res) {
          const dataExcel = res.data.map((item) => ({
            วันรับสินค้า: formatDate(item.receiptDate),
            เลขที่ผลิต: item.stockNumber,
            รหัสสินค้า: item.productNumber,
            'ชื่อสินค้า EN': item.productNameEn,
            'ชื่อสินค้า TH': item.productNameTh,
            ประเภทสินค้า: item.productTypeName,
            ขนาด: item.size,
            เเม่พิมพ์: item.mold,
            'สีของทอง/เงิน': item.productionType,
            'ประเภททอง/เงิน': item.productionTypeSize,
            'W.O.': `${item.wo}-${item.woNumber}`,
            จัดเก็บ: item.location,
            ราคา: item.productPrice ? formatDecimal(item.productPrice, 2) : '',
            ผู้รับสินค้า: item.createBy,
            หมายเหตุ: item.remark
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
    },

    async fetchUpdateStockProduct({ formValue }) {
      try {
        return await api.jewelry.post('StockProduct/Update', formValue)
      } catch (error) {
        console.error('Error fetching update stock product data:', error)
        throw error
      }
    },

    async fetchDataSearchProductName({ formValue, skipLoading }) {
      try {
        return await api.jewelry.post('StockProduct/ListName', formValue, {
          skipLoading: skipLoading
        })
      } catch (error) {
        console.error('Error fetching update stock product data:', error)
        throw error
      }
    },

    async fetchAddProductCostDeatialVersion({ formValue }) {
      try {
        return await api.jewelry.post('StockProduct/AddProductCostDeatialVersion', formValue)
      } catch (error) {
        console.error('Error adding product cost detail:', error)
        throw error
      }
    },

    async fetchGetStockCostDetail(stockNumber) {
      try {
        return await api.jewelry.post(
          'StockProduct/GetStockCostDetail',
          null,
          {
            params: { stockNumber }
          }
        )
      } catch (error) {
        console.error('Error fetching stock cost detail:', error)
        throw error
      }
    },

    async fetchGetProductCostDetailVersion(stockNumber) {
      try {
        return await api.jewelry.get('StockProduct/GetProductCostDetailVersion', { stockNumber })
      } catch (error) {
        console.error('Error fetching product cost detail version:', error)
        throw error
      }
    },

    async fetchCreateProductCostDeatialPlan({ stockNumber, remark }) {
      try {
        const param = {
          stockNumber,
          remark: remark || ''
        }
        return await api.jewelry.post('StockProduct/CreateProductCostDeatialPlan', param)
      } catch (error) {
        console.error('Error creating product cost detail plan:', error)
        throw error
      }
    },

    async fetchListStockCostPlan({ take, skip, sort, formValue }) {
      try {
        const param = {
          take: take,
          skip: skip,
          sort: sort,
          search: {
            ...formValue
          }
        }
        return await api.jewelry.post('StockProduct/ListStockCostPlan', param)
      } catch (error) {
        console.error('Error fetching stock cost plan list:', error)
        throw error
      }
    },

    async fetchGetCostVersion(planRunning) {
      try {
        const param = {
          planRunning: planRunning
        }
        return await api.jewelry.post('StockProduct/GetCostVersion', param)
      } catch (error) {
        console.error('Error fetching cost version by plan running:', error)
        throw error
      }
    }
  }
})
