import { defineStore } from 'pinia'
import api from '@/services/utils/api.js'
import { formatISOString, formatDate, formatDateTime } from '@/services/utils/dayjs.js'
import swAlert from '@/services/alert/sweetAlerts.js'
import { CsvHelper } from '@/services/utils/export-excel.js'

export const usePlanSearchApiStore = defineStore('planSearch', {
  state: () => ({
    dataPlanSearch: {},
    dataPlanSearcTotalRecord: 0,
    dataPlanTransfer: {},

    //permission
    totalTransferAllow: 100
  }),

  actions: {
    initRequest(formValue) {
      //console.log('initRequest', formValue)
      return {
        search: {
          start: formValue.start ? formatISOString(formValue.start) : null,
          end: formValue.end ? formatISOString(formValue.end) : null,
          sendStart: formValue.sendStart ? formatISOString(formValue.sendStart) : null,
          sendEnd: formValue.sendEnd ? formatISOString(formValue.sendEnd) : null,
          text: formValue.text,
          status: formValue.status ? [...formValue.status] : null,
          isOverPlan: formValue.isOverPlan?.id,
          customerCode: formValue.customerCode,
          productType: formValue.productType ? [...formValue.productType] : null,
          customerType: formValue.customerType ? [...formValue.customerType] : null,
          gold: formValue.gold ? [...formValue.gold] : null,
          goldSize: formValue.goldSize ? [...formValue.goldSize] : null,
          mold: formValue.mold,
          productNumber: formValue.productNumber
        }
      }
    },

    async fetchData({ take, skip, sort, formValue }) {
      try {
        this.dataPlanSearch = {}
        console.log('fetchData', formValue)
        const param = {
          take,
          skip,
          sort,
          ...this.initRequest(formValue)
        }

        const res = await api.jewelry.post('ProductionPlan/ProductionPlanSearch', param)
        if (res) {
          this.dataPlanSearch = { ...res }
          this.dataPlanSearcTotalRecord = res.total
        } else {
          this.dataPlanSearch = {}
          this.dataPlanSearcTotalRecord = 0
        }
      } catch (error) {
        console.error('Error fetching production plan data:', error)
        throw error
      }
    },
    async fetchDataExport({ sort, formValue }) {
      try {
        const param = {
          take: 0,
          skip: 0,
          sort,
          ...this.initRequest(formValue)
        }

        const res = await api.jewelry.post('ProductionPlan/ProductionPlanSearch', param)
        if (res) {
          if (res) {
            // Map data for export
            const dataExcel = res.data.map((item) => ({
              WO: item.wo,
              'WO No.': item.woNumber,
              เเม่พิมพ์: item.mold,
              สถานะใบงาน: item.statusName,
              'สถานะใบงาน (วันที่)': formatDate(item.lastUpdateStatus),
              วันส่งงานลูกค้า: formatDate(item.requestDate),
              รหัสสินค้า: item.productNumber,
              ประเภทสินค้า: item.productTypeName,
              จำนวนสินค้า: item.productQty,
              รหัสลูกค้า: item.customerNumber,
              ชื่อลูกค้า: item.customerName,
              วันสร้างใบสินค้า: formatDate(item.createDate),
              ประเภททอง_เงิน: item.gold,
              ขนาดทอง_เงิน: item.goldSize
            }))

            // Export to CSV
            CsvHelper.exportToCsv(dataExcel, `เอกสารใบจ่ายข-รับคืนงาน[${formatDateTime(new Date())}]`)
          }
        }
      } catch (error) {
        console.error('Error fetching production plan data export:', error)
        throw error
      }
    },
    async fetchDataTransfer({ sort, formValue }) {
      try {
        this.dataPlanTransfer = {}
        console.log('fetchDataTransfer api', formValue)
        const param = {
          take: 0,
          skip: 0,
          sort,
          ...this.initRequest(formValue)
        }

        const res = await api.jewelry.post('ProductionPlan/ProductionPlanSearch', param)
        if (res) {
          this.dataPlanTransfer = { ...res }
        }
      } catch (error) {
        console.error('Error fetching transfer data:', error)
        throw error
      }
    },

    async fetchPlanMoldImage(imagePath) {
      if (imagePath) {
        try {
          const param = { imageName: imagePath }
          const res = await api.jewelry.get('FileExtension/GetPlanImage', param)
          return `data:image/png;base64,${res}`
        } catch (error) {
          console.error('Error fetching image:', error)
          return null
        }
      }
      return null
    },

    checkTransferJobLimit(total) {
      if (total > this.totalTransferAllow) {
        swAlert.warning(
          `สามารถโอนงานได้ไม่เกินครั้งละ ${this.totalTransferAllow} รายการ`,
          'จำนวนงานเกินกำหนด'
        )
        return false
      }
      return true
    }
  }
})
