import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'
import { formatDate } from '@/services/utils/dayjs.js'
//import swAlert from '@/services/alert/sweetAlerts.js'
//import { CsvHelper } from '@/services/utils/export-excel.js'
import { ExcelHelper } from '@/services/utils/excel-js.js'
import { formatDecimal } from '@/services/utils/decimal.js'

export const useReceiptProductionApiStore = defineStore('receiptProduction', {
  state: () => ({
    dataListPlan: {},
    dataListPlanTotalRecord: 0,

    dataReceiptHistory: {},
    dataReceiptHistoryTotalRecord: 0
  }),

  actions: {
    initeListPlanRequest(formValue) {
      //console.log('initRequest', formValue)
      return {
        search: {
          //start: formValue.start ? formatISOString(formValue.start) : null,
          //end: formValue.end ? formatISOString(formValue.end) : null,

          wo: formValue.wo
        }
      }
    },

    async fetchDataListPlan({ take, skip, sort, formValue }) {
      try {
        this.dataListPlan = {}
        //console.log('fetchDataListPlan', formValue)
        const param = {
          take,
          skip,
          sort,
          search: {
            ...formValue
          }
        }

        const res = await api.jewelry.post('ReceiptProduction/ListPlan', param)
        if (res) {
          this.dataListPlan = { ...res }
          this.dataListPlanTotalRecord = res.total
        } else {
          this.dataListPlan = {}
          this.dataListPlanTotalRecord = 0
        }
      } catch (error) {
        console.error('Error fetchDataListPlan:', error)
        throw error
      }
    },
    async fetchDataGetPlan({ formValue, skipLoading }) {
      try {
        //console.log('fetchDataGetPlan', formValue)
        const param = {
          running: formValue.running
        }
        return await api.jewelry.post('ReceiptProduction/GetPlan', param, {
          skipLoading: skipLoading
        })
      } catch (error) {
        console.error('Error fetchDataGetPlan:', error)
        throw error
      }
    },
    async fetchCreateDraft({ formValue }) {
      try {
        return await api.jewelry.post('ReceiptProduction/Darft', formValue, {
          skipLoading: true
        })
      } catch (error) {
        console.error('Error fetchCreateDraft:', error)
        throw error
      }
    },
    async fetchConfirm({ formValue }) {
      try {
        return await api.jewelry.post('ReceiptProduction/Confirm', formValue, {
          skipLoading: false
        })
      } catch (error) {
        console.error('Error fetchConfirm:', error)
        throw error
      }
    },

    async fetchConfirmHistory({ take, skip, sort, formValue, skipLoading }) {
      try {
        this.dataReceiptHistory = {}
        //console.log('fetchDataListPlan', formValue)
        const param = {
          take,
          skip,
          sort,
          search: {
            ...formValue
          }
        }
        const res = await api.jewelry.post('ReceiptProduction/ListHistory', param, {
          skipLoading: skipLoading
        })

        if (res) {
          this.dataReceiptHistory = { ...res }
          this.dataReceiptHistoryTotalRecord = res.total
        } else {
          this.dataReceiptHistory = {}
          this.dataReceiptHistoryTotalRecord = 0
        }
      } catch (error) {
        console.error('Error fetchConfirmHistory:', error)
        throw error
      }
    },
    async fetchConfirmHistoryExport({ sort, formValue }) {
      try {
        //console.log('fetchDataListPlan', formValue)
        const param = {
          take: 0,
          skip: 0,
          sort,
          search: {
            ...formValue
          }
        }
        const res = await api.jewelry.post('ReceiptProduction/ListHistory', param, {
          skipLoading: false
        })

        if (res) {
          const dataExcel = res.data.map((item) => ({
            วันรับสินค้า: formatDate(item.receiptDate),
            เลขที่ผลิต: item.stockNumber,
            รหัสสินค้า: item.productNumber,
            'ชื่อสินค้า EN': item.productNameEn,
            'ชื่อสินค้า TH': item.productNameTh,
            ประเภทสินค้า: item.productTypeName,
            ขนาด: item.size,
            เเม่พิมพ์: item.mold,
            'สีของทอง/เงิน': item.productionType,
            'ประเภททอง/เงิน': item.productionTypeSize,
            'W.O.': `${item.wo}-${item.woNumber}`,
            จัดเก็บ: item.location,
            ราคา: item.productPrice ? formatDecimal(item.productPrice, 2) : '',
            ผู้รับสินค้า: item.createBy,
            หมายเหตุ: item.remark
          }))

          const options = {
            filename: `รายงานรับสินค้า_[${formatDate(new Date())}].xlsx`,
            sheetName: 'รายงานรับสินค้า',
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

          ExcelHelper.exportToExcel(dataExcel, options)
        }
      } catch (error) {
        console.error('Error fetchConfirmHistory:', error)
        throw error
      }
    }
  }
})
