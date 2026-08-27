import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'
import { formatISOString, formatYearMonth } from '@/services/utils/dayjs.js'
import { ExcelHelper } from '@/services/utils/excel-js.js'

export const useGoldLossTangByWorkerApiStore = defineStore('goldLossTangByWorkerApi', {
  state: () => ({
    dataSearch: { data: [], total: 0 }
  }),

  actions: {
    buildSearch(formValue = {}) {
      return {
        requestDateStart: formValue.requestDateStart ? formatISOString(formValue.requestDateStart) : null,
        requestDateEnd: formValue.requestDateEnd ? formatISOString(formValue.requestDateEnd) : null,
        workerCode: formValue.workerCode || undefined,
        groupByMonth: formValue.groupByMonth || undefined
      }
    },

    async fetchReport({ take = 10, skip = 0, sort = [], formValue = {} } = {}) {
      const res = await api.jewelry.post('Worker/ReportGoldLossTangByWorker', {
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
      return res
    },

    async fetchReportExport({ sort = [], formValue = {} } = {}) {
      const res = await api.jewelry.post('Worker/ReportGoldLossTangByWorker', {
        take: 0,
        skip: 0,
        sort,
        search: this.buildSearch(formValue)
      })

      if (res) {
        const dataExcel = res.data.map((item) => ({
          รหัสช่าง: item.workerCode,
          ชื่อช่าง: item.workerName,
          ...(formValue.groupByMonth ? { เดือน: formatYearMonth(item.year, item.month) } : {}),
          จำนวนใบ: item.slipCount,
          ทองจ่ายรวม: item.totalIssued,
          ทองคืนรวม: item.totalReturned,
          'Loss ดิบ': item.totalRawLoss,
          'Loss ที่ยอม': item.totalAllowedLoss,
          'Loss ส่วนต่าง': item.totalDiffLoss,
          เงินส่วนต่าง: item.totalMoneyDiff
        }))

        const options = {
          filename: 'รายงาน-GoldLoss-ช่างแต่ง-ต่อคน.xlsx',
          sheetName: 'GoldLossช่างแต่งต่อคน',
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
