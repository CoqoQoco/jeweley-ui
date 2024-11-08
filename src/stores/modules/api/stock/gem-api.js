import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'
import //formatISOString,
//formatDate
//formatDateTime
'@/services/utils/dayjs.js'
//import swAlert from '@/services/alert/sweetAlerts.js'
//import { CsvHelper } from '@/services/utils/export-excel.js'
import { ExcelHelper } from '@/services/utils/excel-js.js'

export const usrStockGemApiStore = defineStore('stockGem', {
  state: () => ({
  }),
  actions: {
    initSearchRequeast(form) {
      return {
        search: {
          code: form.code ?? null,
          groupName: form.groupName ?? null,
          grade: form.grade ?? null,
          shape: form.shape ?? null,
          size: form.size ?? null
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

        return await api.jewelry.post('StockGem/SearchData', param)
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

        const res = await api.jewelry.post('StockGem/SearchData', param)
        if (res) {
          const dataExcel = res.data.map((item) => ({
            รหัส: item.code,
            หมวดหมู่: item.groupName,
            ขนาด: item.size,
            รูปร่าง: item.shape,
            เกรด: item.grade,
            จำนวนคงคลัง: item.quantity ? Number(item.quantity).toFixed(3).toLocaleString() : '0.000',
            จำนวนยืมคลัง: item.quantityOnProcess ? Number(item.quantityOnProcess).toFixed(3).toLocaleString() : '0.000',
            น้ำหนักคงคลัง: item.quantityWeight ? Number(item.quantityWeight).toFixed(3).toLocaleString() : '0.000',
            น้ำหนักยืมคลัง: item.quantityWeightOnProcess ? Number(item.quantityWeightOnProcess).toFixed(3).toLocaleString() : '0.000',
            ราคาต่อนำหนัก: item.price ? Number(item.price).toFixed(2).toLocaleString() : '0.00',
            ราคาต่อจำนวน: item.priceQty
              ? Number(item.priceQty).toFixed(2).toLocaleString()
              : '0.00',
            หน่วย: item.unit,
            รหัสหน่วย: item.unitCode,
            หมายเหตุ: item.remark1
          }))

          console.log('dataExcel title', title)

          const options = {
            filename: title ? `${title}.xlsx` : `คลังวัถุดิบ.xlsx`,
            sheetName: title ? `${title}.xlsx` : `คลังวัถุดิบ.xlsx`,
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
