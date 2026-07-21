import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'
import { formatDate, formatDateTime, formatISOString } from '@/services/utils/dayjs.js'
import { formatDecimal } from '@/services/utils/decimal.js'
import { ExcelHelper } from '@/services/utils/excel-js.js'

export const useStockMoveLocationApiStore = defineStore('stockMoveLocationApi', {
  state: () => ({
    dataSearch: { data: [], total: 0 },
    movementSearch: { data: [], total: 0 }
  }),

  actions: {
    async fetchDataSearch({ take = 10, skip = 0, sort = [], formValue = {} } = {}) {
      const res = await api.jewelry.post('StockProduct/List', {
        take,
        skip,
        sort,
        search: { ...formValue }
      })
      if (res) {
        this.dataSearch = { ...res }
      } else {
        this.dataSearch = { data: [], total: 0 }
      }
    },

    async moveLocation({ stockNumbers, targetLocationCode, remark }) {
      return await api.jewelry.post('StockMovement/Move', {
        stockNumbers,
        targetLocationCode,
        remark: remark || undefined
      })
    },

    async fetchMovementSearch({ take = 10, skip = 0, sort = [], formValue = {} } = {}) {
      const res = await api.jewelry.post('StockMovement/Search', {
        take,
        skip,
        sort,
        dateFrom: formValue.dateFrom ? formatISOString(formValue.dateFrom) : undefined,
        dateTo: formValue.dateTo ? formatISOString(formValue.dateTo) : undefined,
        fromLocation: formValue.fromLocation || undefined,
        toLocation: formValue.toLocation || undefined,
        stockNumber: formValue.stockNumber || undefined
      })
      if (res) {
        this.movementSearch = { ...res }
      } else {
        this.movementSearch = { data: [], total: 0 }
      }
    },

    async fetchMovementSearchExport({ sort = [], formValue = {} } = {}) {
      const res = await api.jewelry.post('StockMovement/Search', {
        take: 0,
        skip: 0,
        sort,
        dateFrom: formValue.dateFrom ? formatISOString(formValue.dateFrom) : undefined,
        dateTo: formValue.dateTo ? formatISOString(formValue.dateTo) : undefined,
        fromLocation: formValue.fromLocation || undefined,
        toLocation: formValue.toLocation || undefined,
        stockNumber: formValue.stockNumber || undefined
      })

      if (res) {
        const dataExcel = res.data.map((item) => ({
          'วันที่-เวลา': formatDateTime(item.movementDate),
          เลขที่ผลิต: item.stockNumber,
          รหัสสินค้า: item.productCode,
          ย้ายจาก: `${item.fromLocation || ''} - ${item.fromLocationName || ''}`,
          ปลายทาง: `${item.toLocation || ''} - ${item.toLocationName || ''}`,
          ผู้ย้าย: item.createBy,
          หมายเหตุ: item.remark
        }))

        const options = {
          filename: 'รายงานการย้าย Storage Location.xlsx',
          sheetName: 'รายงานการย้าย Storage Location',
          styles: {
            ...ExcelHelper.defaultStyles,
            headerFill: {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: '921313' }
            }
          }
        }

        ExcelHelper.exportToExcel(dataExcel, options)
      }
    },

    async fetchMovementHistory({ stockNumber }) {
      return await api.jewelry.post('StockMovement/Search', {
        take: 0,
        skip: 0,
        stockNumber
      })
    },

    async fetchDataSearchReceiptExport({ sort, formValue, title }) {
      try {
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

          const options = {
            filename: title ? `${title}.xlsx` : `ย้าย Storage Location.xlsx`,
            sheetName: title ? `${title}.xlsx` : `ย้าย Storage Location.xlsx`,
            styles: {
              ...ExcelHelper.defaultStyles,
              headerFill: {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: '921313' }
              }
            }
          }

          ExcelHelper.exportToExcel(dataExcel, options)
        }
      } catch (error) {
        throw error
      }
    }
  }
})
