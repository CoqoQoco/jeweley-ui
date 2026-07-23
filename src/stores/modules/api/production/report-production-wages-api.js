import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'
import { formatDate, formatISOString } from '@/services/utils/dayjs.js'
import { ExcelHelper } from '@/services/utils/excel-js.js'

export const useReportProductionWagesApiStore = defineStore('reportProductionWagesApi', {
  state: () => ({
    dataSearch: { data: [], total: 0 },
    summary: {}
  }),

  actions: {
    buildSearch(formValue = {}) {
      return {
        createStart: formValue.start ? formatISOString(formValue.start) : undefined,
        createEnd: formValue.end ? formatISOString(formValue.end) : undefined,
        woText: formValue.woText || undefined,
        gold: formValue.gold?.length ? formValue.gold : undefined,
        goldSize: formValue.goldSize?.length ? formValue.goldSize : undefined,
        status: formValue.status?.length ? formValue.status : undefined,
        workerCode: formValue.worker?.code || undefined,
        productNumber: formValue.productNumber || undefined,
        mold: formValue.mold || undefined
      }
    },

    async fetchReport({ take = 10, skip = 0, sort = [], formValue = {} } = {}) {
      const res = await api.jewelry.post('Worker/ReportWorkerWages', {
        take,
        skip,
        sort,
        search: this.buildSearch(formValue)
      })
      this.dataSearch = res ? { ...res } : { data: [], total: 0 }
    },

    async fetchSummary({ formValue = {} } = {}) {
      const res = await api.jewelry.post('Worker/ReportWorkerSummeryReportWages', {
        search: this.buildSearch(formValue)
      })
      this.summary = res ? { ...res } : {}
    },

    async fetchReportExport({ formValue = {} } = {}) {
      const res = await api.jewelry.post('Worker/ReportWorkerWages', {
        take: 0,
        skip: 0,
        sort: [],
        search: this.buildSearch(formValue)
      })

      if (res) {
        const dataExcel = res.data.map((item) => ({
          เลขที่ใบงาน: `${item.wo}-${item.woNumber}`,
          วันที่ส่งงาน: formatDate(item.jobDate),
          รหัสสินค้า: item.productNumber,
          ช่าง: `${item.workerCode}-${item.workerName}`,
          แผนกงาน: item.statusName,
          รายละเอียด: `${item.gold} ${item.description ? `[${item.description}]` : ''}`,
          สีทอง: item.goldSize,
          จำนวนจ่าย: item.goldQtySend,
          น้ำหนักจ่าย: item.goldWeightSend,
          จำนวนรับ: item.goldQtyCheck,
          น้ำหนักรับ: item.goldWeightCheck,
          ราคาต่อหน่วย: Number(item.wages || 0).toFixed(2),
          ราคา: Number(item.totalWages || 0).toFixed(2)
        }))

        const options = {
          filename: `รายงานค่าแรงช่าง[${formatDate(formValue.start)} - ${formatDate(formValue.end)}].xlsx`,
          sheetName: 'รายงานค่าแรงช่าง',
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
