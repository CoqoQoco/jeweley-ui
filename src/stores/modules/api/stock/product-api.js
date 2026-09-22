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
import { getPieceQty, getPieceQtyReserved, getPieceQtyAvailable } from '@/services/utils/stock-piece-qty.js'

// ใช้ร่วมกันระหว่าง fetchDataSearch และ fetchDataSearchReceiptExport
// materials/materialMatchAll/priceMin/priceMax เป็น filter ใหม่ของ StockProduct/List (ดู jeweley-ui plan)
const buildSearchParam = (formValue) => {
  const { materialMatch, ...rest } = formValue
  const materials = formValue.materials?.length ? formValue.materials : undefined
  const isBlank = (val) => val === null || val === undefined || val === ''

  return {
    ...rest,
    locationCodes: formValue.locationCodes?.length ? formValue.locationCodes : undefined,
    materials,
    materialMatchAll: materials ? materialMatch !== 'any' : undefined,
    priceMin: isBlank(formValue.priceMin) ? undefined : Number(formValue.priceMin),
    priceMax: isBlank(formValue.priceMax) ? undefined : Number(formValue.priceMax)
  }
}

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
          search: buildSearchParam(formValue)
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
    // skipError: true — ใช้เมื่อ caller แสดงข้อความเองแล้ว (เช่นจอสแกนที่ห้ามมี dialog บัง)
    // default false เพื่อไม่เปลี่ยนพฤติกรรม caller เดิมที่พึ่งพา alert กลางจาก axios-helper.js
    // rethrow: true — ใช้เมื่อ caller ต้อง distinguish สาเหตุ error เอง (เช่น not-found vs server crash)
    // default false เพื่อไม่เปลี่ยนพฤติกรรม caller เดิม (~18 จุด) ที่พึ่งพา return undefined เมื่อ error
    async fetchDataGet({ formValue, skipError = false, rethrow = false }) {
      try {
        //console.log('formValue', formValue)
        this.dataSearch = {}
        const param = {
          ...formValue
        }

        return await api.jewelry.post('StockProduct/Get', param, {
          skipLoading: true,
          skipError
        })
      } catch (error) {
        console.error('Error get stock product data:', error)
        if (rethrow) {
          throw error
        }
      }
    },

    // ตรวจ qtyAvailable สดจากคลัง ณ ตอนนี้ (ใช้ใน SO refresh + modal pre-check ก่อนยืนยัน/ออก invoice)
    // chunk คำขอที่ 500 stockNumbers/ครั้ง ตาม API contract ของ StockProduct/Availability
    async fetchStockAvailability(stockNumbers, { skipLoading = true, skipError = true } = {}) {
      const numbers = [...new Set((stockNumbers || []).filter(Boolean))]
      if (numbers.length === 0) return []

      const CHUNK_SIZE = 500
      const chunks = []
      for (let i = 0; i < numbers.length; i += CHUNK_SIZE) {
        chunks.push(numbers.slice(i, i + CHUNK_SIZE))
      }

      try {
        const results = await Promise.all(
          chunks.map((chunk) =>
            api.jewelry.post(
              'StockProduct/Availability',
              { stockNumbers: chunk },
              { skipLoading, skipError }
            )
          )
        )
        return results.flatMap((res) => (Array.isArray(res) ? res : []))
      } catch (error) {
        console.error('Error fetching stock availability:', error)
        return []
      }
    },

    async fetchDataSearchReceiptExport({ sort, formValue, title }) {
      try {
        this.dataSearchExport = {}
        const param = {
          take: 0,
          skip: 0,
          sort: sort,
          search: buildSearchParam(formValue)
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
            คงเหลือ: formatDecimal(getPieceQty(item), 2),
            จอง: formatDecimal(getPieceQtyReserved(item), 2),
            พร้อมขาย: formatDecimal(getPieceQtyAvailable(item), 2),
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

    async fetchGetStockCostDetail(stockNumber, { skipLoading = false } = {}) {
      try {
        return await api.jewelry.post(
          'StockProduct/GetStockCostDetail',
          null,
          {
            params: { stockNumber },
            skipLoading
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

    async fetchListCostVersion({ take, skip, sort, formValue }) {
      const param = { take, skip, sort, search: { ...formValue } }
      return await api.jewelry.post('StockProduct/ListCostVersion', param)
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
    },

    // สร้างลิงก์หน้าสาธารณะ (/p/:token) สำหรับโชว์สินค้าให้ลูกค้าดู — endpoint นี้ต้อง login (ใช้ instance ปกติ)
    async fetchPublicLink(stockNumber, options = {}) {
      return await api.jewelry.post('StockProduct/PublicLink', { stockNumber }, options)
    }
  }
})
