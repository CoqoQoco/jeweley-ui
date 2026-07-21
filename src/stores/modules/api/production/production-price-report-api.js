import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'
import { formatDate, formatISOString } from '@/services/utils/dayjs.js'
import { ExcelHelper } from '@/services/utils/excel-js.js'

export const useProductionPriceReportApiStore = defineStore('productionPriceReportApi', {
  state: () => ({
    dataSearch: { data: [], total: 0 }
  }),

  actions: {
    buildSearch(formValue = {}) {
      return {
        createStart: formValue.createStart ? formatISOString(formValue.createStart) : undefined,
        createEnd: formValue.createEnd ? formatISOString(formValue.createEnd) : undefined,
        woText: formValue.woText || undefined
      }
    },

    async fetchReport({ take = 10, skip = 0, sort = [], formValue = {} } = {}) {
      const res = await api.jewelry.post('ProductionPlan/ReportProductionPlan', {
        take,
        skip,
        sort,
        search: this.buildSearch(formValue)
      })
      if (res) {
        this.dataSearch = { ...res }
      } else {
        this.dataSearch = { data: [], total: 0 }
      }
    },

    async fetchReportExport({ sort = [], formValue = {} } = {}) {
      const res = await api.jewelry.post('ProductionPlan/ReportProductionPlan', {
        take: 0,
        skip: 0,
        sort,
        search: this.buildSearch(formValue)
      })

      if (res) {
        const dataExcel = res.data.map((item) => ({
          วันที่สร้าง: formatDate(item.createDate),
          เลขที่ใบงาน: item.woText,
          รหัสสินค้า: item.productNumber,
          ชื่อสินค้า: item.productName,
          แม่พิมพ์: item.mold,
          ประเภทสินค้า: item.productTypeName,
          ลูกค้า: item.customerName,
          จำนวน: `${item.productQty} ${item.productQtyUnit || ''}`.trim(),
          ราคารวม: item.totalPrice,
          รายการราคา: item.priceItemCount,
          วันที่ประเมินราคา: item.priceUpdateDate ? formatDate(item.priceUpdateDate) : ''
        }))

        const options = {
          filename: 'รายงานประเมินราคางานผลิต.xlsx',
          sheetName: 'รายงานประเมินราคางานผลิต',
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
    }
  }
})
