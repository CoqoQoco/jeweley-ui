import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'
import { ExcelHelper } from '@/services/utils/excel-js.js'

export const useMaterialValuationReportApiStore = defineStore('materialValuationReportApi', {
  state: () => ({
    summary: { totalCount: 0, totalWeight: 0, totalValue: 0 },
    byType: []
  }),

  actions: {
    buildSearch(formValue = {}) {
      return {
        productType: formValue.productType || undefined,
        region: formValue.region || undefined
      }
    },

    async fetchSummary({ formValue = {} } = {}) {
      const res = await api.jewelry.post('StockProduct/MaterialValuationSummary', this.buildSearch(formValue))
      this.summary = res?.summary || { totalCount: 0, totalWeight: 0, totalValue: 0 }
      this.byType = res?.byType || []
    },

    async exportByType() {
      const dataExcel = this.byType.map((item) => ({
        ประเภท: item.type,
        จำนวนรายการ: item.count,
        'น้ำหนักรวม': Number(item.totalWeight || 0).toFixed(2),
        'มูลค่ารวม (บาท)': Number(item.totalValue || 0).toFixed(2)
      }))

      const options = {
        filename: 'รายงานมูลค่าวัตถุดิบคงคลังแยกชนิด.xlsx',
        sheetName: 'มูลค่าวัตถุดิบ',
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
