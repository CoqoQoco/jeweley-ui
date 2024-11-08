import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'
import { formatISOString, formatDate, formatDateTime } from '@/services/utils/dayjs.js'
//import swAlert from '@/services/alert/sweetAlerts.js'
//import { CsvHelper } from '@/services/utils/export-excel.js'
import { ExcelHelper } from '@/services/utils/excel-js.js'

export const usePlanStatusDetailApiStore = defineStore('PlanStatusDetail', {
  state: () => ({
    dataSearcTotalRecord: 0
  }),
  actions: {
    initSearchRequeast(form) {
      return {
        search: {
          receivesDateStart: form.requestDateStart ? formatISOString(form.requestDateStart) : null,
          receivesDateEnd: form.requestDateEnd ? formatISOString(form.requestDateEnd) : null,

          receiveWorkDateStart: form.receiveWorkDateStart
            ? formatISOString(form.receiveWorkDateStart)
            : null,
          receiveWorkDateEnd: form.receiveWorkDateEnd
            ? formatISOString(form.receiveWorkDateEnd)
            : null,

          status: form.status.length > 0 ? form.status : null,
          gold: form.gold.length > 0 ? form.gold : null,

          woText: form.wo ?? null,
          productNumber: form.productNo ?? null
        }
      }
    },

    async fetchDataSearch({ take, skip, sort, form }) {
      try {
        this.dataSearcTotalRecord = 0
        const param = {
          take,
          skip,
          sort,
          ...this.initSearchRequeast(form)
        }

        const res = await api.jewelry.post('Production/Plan/StatusDetailList', param)

        if (res) {
          this.dataSearcTotalRecord = res.total
        }

        return res
      } catch (error) {
        this.dataSearcTotalRecord = 0
        console.error('Error fetching stock product data:', error)
        throw error
      }
    },
    async fetchDataSearchExport({ sort, form, title }) {
      try {
        this.dataSearchExport = {}
        const param = {
          take: 0,
          skip: 0,
          sort: sort,
          ...this.initSearchRequeast(form)
        }

        const res = await api.jewelry.post('Production/Plan/StatusDetailList', param)
        if (res) {
          const dataExcel = res.data.map((item) => ({
            เลขที่ใบงาน: `${item.wo}-${item.woNumber}`,
            วันที่รับโอนงานงาน: formatDateTime(item.receiveDate),
            วันที่ช่างรับงาน: formatDateTime(item.jobDate),
            สถานะใบงานล่าสุด: item.statusName,
            แผนก: item.typeStatusName,
            เเม่พิมพ์: item.mold,
            รหัสสินค้า: item.productNumber,
            ชื่อสินค้า: item.productName,
            รายละเอียด: item.description,
            ประเภททอง: item.gold,
            จำนวนจ่าย: item.goldQtySend ? Number(item.goldQtySend).toFixed(3) : '0.000',
            นำหนักจ่าย: item.goldWeightSend ? Number(item.goldWeightSend).toFixed(3) : '0.000',
            จำนวนรับ: item.goldQtyCheck ? Number(item.goldQtyCheck).toFixed(3) : '0.000',
            นำหนักรับ: item.goldWeightCheck ? Number(item.goldWeightCheck).toFixed(3) : '0.000',
            ช่าง: item.workerName
          }))

          const options = {
            filename: title
              ? `${title}.xlsx`
              : `ตรวจสอบสถานะงานผลิต_${formatDate(new Date())}.xlsx`,
            sheetName: title ? `${title}.xlsx` : `ตรวจสอบสถานะงานผลิต.xlsx`,
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
    }
  }
})
