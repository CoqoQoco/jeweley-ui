import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'
import {
  formatISOString,
  formatDate
  //formatDateTime
} from '@/services/utils/dayjs.js'
//import swAlert from '@/services/alert/sweetAlerts.js'
//import { CsvHelper } from '@/services/utils/export-excel.js'
import { ExcelHelper } from '@/services/utils/excel-js.js'

export const usePlanWorkerApiStore = defineStore('PlanWorker', {
  state: () => ({
    dataSearch: [],
    dataSearchTotalRecord: 0,

    dataSearcTotalRecord: 0
  }),
  actions: {
    initSearchRequeast(form) {
      return {
        search: {
          createStart: form?.start ? formatISOString(form.start) : null,
          createEnd: form?.end ? formatISOString(form.end) : null,
          text: form?.textl
        }
      }
    },

    async fetchSearch({ take, skip, sort, formValue }) {
      try {
        this.dataSearch = []
        this.dataSearchTotalRecord = 0

        const params = {
          take: take,
          skip: skip,
          sort: sort,
          search: {
            text: formValue.text,
            type: formValue.type,
            active: formValue.active
          }
        }

        const res = await api.jewelry.post('Worker/Search', params)

        if (res) {
          this.dataSearch = [...res.data]
          this.dataSearchTotalRecord = res.total
        }
      } catch (error) {
        console.error('Error fetching search:', error)
      }
    },
    async fetchReturnSearch({ take, skip, sort, formValue }) {
      try {
        this.dataSearch = []
        this.dataSearchTotalRecord = 0

        const params = {
          take: take,
          skip: skip,
          sort: sort,
          search: {
            code: formValue.code,
            text: formValue.text,
            type: formValue.type,
            active: formValue.active
          }
        }

        return await api.jewelry.post('Worker/Search', params)
      } catch (error) {
        console.error('Error fetching fetchReturnSearch:', error)
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

        const res = await api.jewelry.post('Worker/TrackingWorkerRequest', param)

        if (res) {
          this.dataSearcTotalRecord = res.total
        }

        return res
      } catch (error) {
        this.dataSearcTotalRecord = 0
        console.error('Error fetching plan worker data:', error)
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

        const res = await api.jewelry.post('Worker/TrackingWorkerRequest', param)
        if (res) {
          const dataExcel = res.data.map((item) => ({
            เลขที่ใบงาน: `${item.wo}-${item.woNumber}`,
            สถานะงาน: item.wagesStatus === 100 ? 'สำเร็จ' : 'ติดตามระหว่างผลิต',
            ช่าง: `${item.workerCode}-${item.workerName}`,
            วันที่ส่งงาน: formatDate(item.jobDate),
            รหัสสินค้า: item.productNumber,
            แผนกงาน: item.statusName,
            รายละเอียด: `${item.gold} ${item.description ? `[${item.description}]` : ''}`,
            จำนวนจ่าย: item.goldQtySend ? Number(item.goldQtySend).toFixed(3) : '0.000',
            น้ำหนักจ่าย: item.goldWeightSend ? Number(item.goldWeightSend).toFixed(3) : '0.000',
            จำนวนรับ: item.goldQtyCheck ? Number(item.goldQtyCheck).toFixed(3) : '0.000',
            น้ำหนักรับ: item.goldWeightCheck ? Number(item.goldWeightCheck).toFixed(3) : '0.000'
          }))

          const options = {
            filename: title
              ? `${title}.xlsx`
              : `ตรวจสอบสถานะงานผลิต(ช่าง)_${formatDate(new Date())}.xlsx`,
            sheetName: title ? `${title}.xlsx` : `ตรวจสอบสถานะงานผลิต(ช่าง).xlsx`,
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
        console.error('Error fetching plan worker export data:', error)
        throw error
      }
    },

    async fetchCreate({ formValue }) {
      try {
        const params = {
          code: formValue.code,
          type: formValue.type,
          nameTh: formValue.nameTh,
          nameEn: formValue.nameEn
        }
        //console.log(params)

        return await api.jewelry.post('Worker/Create', params)
      } catch (error) {
        console.error('Error fetching plan worker create data:', error)
      }
    },
    async fetchUpdate({ formValue }) {
      try {
        const params = {
          code: formValue.code,
          type: formValue.type,
          nameTh: formValue.nameTh,
          nameEn: formValue.nameEn
        }
        //console.log(params)

        return await api.jewelry.post('Worker/Update', params)
      } catch (error) {
        console.error('Error fetching plan worker create data:', error)
      }
    }
  }
})
