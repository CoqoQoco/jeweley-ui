import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'
import { formatDate, formatISOString } from '@/services/utils/dayjs.js'
import { ExcelHelper } from '@/services/utils/excel-js.js'

export const useWipReportApiStore = defineStore('wipReportApi', {
  state: () => ({
    dataSearch: { data: [], total: 0 }
  }),

  actions: {
    buildSearch(formValue = {}) {
      return {
        receiveWorkDateStart: formValue.receiveWorkDateStart
          ? formatISOString(formValue.receiveWorkDateStart)
          : undefined,
        receiveWorkDateEnd: formValue.receiveWorkDateEnd
          ? formatISOString(formValue.receiveWorkDateEnd)
          : undefined,
        status: formValue.status?.length ? formValue.status : undefined,
        gold: formValue.gold?.length ? formValue.gold : undefined,
        woText: formValue.woText || undefined,
        productNumber: formValue.productNumber || undefined
      }
    },

    async fetchReport({ take = 10, skip = 0, sort = [], formValue = {} } = {}) {
      const res = await api.jewelry.post('Production/Plan/StatusDetailList', {
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
      const res = await api.jewelry.post('Production/Plan/StatusDetailList', {
        take: 0,
        skip: 0,
        sort,
        search: this.buildSearch(formValue)
      })

      if (res) {
        const dataExcel = res.data.map((item) => ({
          วันที่รับงาน: formatDate(item.receiveWorkDate),
          เลขที่ใบงาน: item.woText,
          รหัสสินค้า: item.productNumber,
          ชื่อสินค้า: item.productName,
          แม่พิมพ์: item.mold,
          แผนก: item.typeStatusName,
          ช่าง: item.workerName,
          ทอง: item.gold,
          จำนวนจ่าย: item.goldQtySend,
          'นน.จ่าย': item.goldWeightSend,
          จำนวนรับ: item.goldQtyCheck,
          'นน.รับ': item.goldWeightCheck,
          ค่าแรง: item.wages,
          รวมค่าแรง: item.totalWages,
          สถานะค่าแรง: item.wagesStatus === 100 ? 'จ่ายแล้ว' : 'ค้าง',
          รายละเอียด: item.description
        }))

        const options = {
          filename: 'รายงานงานระหว่างผลิต.xlsx',
          sheetName: 'รายงานงานระหว่างผลิต',
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
