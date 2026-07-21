import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'
import { formatISOString } from '@/services/utils/dayjs.js'
import { ExcelHelper } from '@/services/utils/excel-js.js'

export const useWorkerWagesByPersonApiStore = defineStore('workerWagesByPersonApi', {
  state: () => ({
    dataSearch: { data: [], total: 0 }
  }),

  actions: {
    buildSearch(formValue = {}) {
      return {
        createStart: formatISOString(formValue.createStart),
        createEnd: formatISOString(formValue.createEnd),
        text: formValue.text || undefined,
        status: formValue.status?.length ? formValue.status : undefined
      }
    },

    async fetchReport({ take = 10, skip = 0, sort = [], formValue = {} } = {}) {
      const res = await api.jewelry.post('Worker/ReportWorkerWagesByWorker', {
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
      const res = await api.jewelry.post('Worker/ReportWorkerWagesByWorker', {
        take: 0,
        skip: 0,
        sort,
        search: this.buildSearch(formValue)
      })

      if (res) {
        const dataExcel = res.data.map((item) => ({
          รหัสช่าง: item.workerCode,
          ชื่อช่าง: item.workerName,
          จำนวนงาน: item.jobCount,
          จำนวนรวม: item.totalQty,
          ค่าแรงรวม: item.totalWages
        }))

        const options = {
          filename: 'รายงานค่าแรงช่างต่อคน.xlsx',
          sheetName: 'รายงานค่าแรงช่างต่อคน',
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
