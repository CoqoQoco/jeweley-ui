import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'
import { formatDate, formatISOString } from '@/services/utils/dayjs.js'
import { ExcelHelper } from '@/services/utils/excel-js.js'

export const useGoldCostReportApiStore = defineStore('goldCostReportApi', {
  state: () => ({
    dataSearch: { data: [], total: 0 }
  }),

  actions: {
    buildSearch(formValue = {}) {
      return {
        text: formValue.text || undefined,
        bookNo: formValue.bookNo || undefined,
        no: formValue.no || undefined,
        runningNumber: formValue.runningNumber || undefined,
        createStart: formValue.createStart ? formatISOString(formValue.createStart) : undefined,
        createEnd: formValue.createEnd ? formatISOString(formValue.createEnd) : undefined
      }
    },

    async fetchReport({ take = 10, skip = 0, sort = [], formValue = {} } = {}) {
      const res = await api.jewelry.post('ProductionPlanCost/Report', {
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
      const res = await api.jewelry.post('ProductionPlanCost/Report', {
        take: 0,
        skip: 0,
        sort,
        search: this.buildSearch(formValue)
      })

      if (res) {
        const dataExcel = res.data.map((item) => ({
          วันที่จ่าย: formatDate(item.assignDate),
          เล่มที่: item.bookNo,
          เลขที่: item.no,
          RunningNumber: item.runningNumber,
          รหัสทอง: item.goldCode,
          ประเภททอง: item.goldName,
          รหัสเปอร์เซ็นทอง: item.goldSizeCode,
          เปอร์เซ็นทอง: item.goldSizeName,
          สูตรผสมทอง: item.goldReceipt,
          'นน.หลอม': item.meltWeight,
          'นน.คืนหลอม': item.returnMeltWeight,
          'นน.ขาดหลอม': item.meltWeightLoss,
          'นน.เกินหลอม': item.meltWeightOver,
          'นน.หล่อ': item.castWeight,
          'นน.พลอย': item.gemWeight,
          'นน.คืนหล่อ': item.returnCastWeight,
          'นน.ขาดหล่อ': item.castWeightLoss,
          'นน.เกินหล่อ': item.castWeightOver,
          ผู้จ่าย: item.assignBy,
          ผู้รับ: item.receiveBy,
          หมายเหตุ: item.remark
        }))

        const options = {
          filename: 'รายงานใบเบิกผสมทอง.xlsx',
          sheetName: 'รายงานใบเบิกผสมทอง',
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
