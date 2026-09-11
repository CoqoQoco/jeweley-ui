import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'
import { formatISOString, formatYearMonth } from '@/services/utils/dayjs.js'
import { ExcelHelper } from '@/services/utils/excel-js.js'

export const useGoldLossSlipByWorkerApiStore = defineStore('goldLossSlipByWorkerApi', {
  state: () => ({
    dataSearch: { data: [], total: 0 },
    summaryData: { data: [], total: 0 }
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
      const res = await api.jewelry.post('Worker/ReportGoldLossSlipByWorker', {
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

    // full (unpaginated) dataset สำหรับรวมยอด StatCardGeneric — ใช้ endpoint เดิมกับ take:0 เหมือน export
    async fetchReportSummary({ formValue = {} } = {}) {
      const res = await api.jewelry.post('Worker/ReportGoldLossSlipByWorker', {
        take: 0,
        skip: 0,
        sort: [],
        search: this.buildSearch(formValue)
      }, { skipLoading: true })
      if (res) {
        this.summaryData = { ...res }
      } else {
        this.summaryData = { data: [], total: 0 }
      }
      return res
    },

    async fetchReportExport({ sort = [], formValue = {} } = {}) {
      const res = await api.jewelry.post('Worker/ReportGoldLossSlipByWorker', {
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
          น้ำหนักส่งรวม: item.totalWeightSend,
          น้ำหนักตรวจรวม: item.totalWeightCheck,
          'Loss ที่ยอมรวม': item.totalWeightLossAllowed,
          'Loss จริงรวม': item.totalWeightLossActual,
          เงินส่วนต่างรวม: item.totalMoneyDiff,
          มูลค่าทองคืนรวม: item.totalGoldReturnAmount
        }))

        const options = {
          filename: 'รายงาน-GoldLoss-ช่างฝัง-ต่อคน.xlsx',
          sheetName: 'GoldLossช่างฝังต่อคน',
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
