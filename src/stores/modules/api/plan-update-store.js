// stores/modules/api/plan-search-store.js
import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'
import swAlert from '@/services/alert/sweetAlerts.js'

import {
  //formatISOString,
  formatDate
  //formatDateTime
} from '@/services/utils/dayjs.js'
//import { CsvHelper } from '@/services/utils/export-excel.js'

import { ExcelHelper } from '@/services/utils/excel-js.js'

export const usePlanUpdateApiStore = defineStore('planUpdate', {
  state: () => ({
    // ... state อื่นๆ
  }),

  actions: {
    // ... actions อื่นๆ

    async submitTransfer({ formerStatus, targetStatus, transferBy, selectedItems }) {
      try {
        const param = {
          formerStatus,
          targetStatus,
          transferBy,
          plans: selectedItems.map((item) => ({
            wo: item.wo,
            woNumber: item.woNumber,
            id: item.id
          }))
        }

        const res = await api.jewelry.post('Production/Plan/Transfer', param)
        if (res) {
          if (res.errors.length > 0) {
            const msg = res.errors
              .map((item) => `${item.wo}-${item.woNumber} : ${item.message}`)
              .join('<br>')
            swAlert.warning(msg, `พบข้อผิดพลาด`, () => {
              return {
                success: true,
                errors: res.errors,
                receiptNumber: res.receiptNumber,
                transferNumber: res.transferNumber
              }
            })
          } else {
            return {
              success: true,
              errors: res.errors,
              receiptNumber: res.receiptNumber,
              transferNumber: res.transferNumber
            }
          }
        }
      } catch (error) {
        console.error('Error submitting transfer:', error)
        return { success: false, message: 'เกิดข้อผิดพลาดในการทำรายการ' }
      }
    },

    async fetchDataTransferExport({ sort, form, masterStatus }) {
      try {
        this.dataSearchExport = {}
        const param = {
          take: 0,
          skip: 0,
          sort: sort,
          search: {
            transferNumber: form.transferNumber
          }
        }

        const res = await api.jewelry.post('Production/Plan/TransferList', param)
        if (res) {
          const dataExcel = res.data.map((item) => ({
            WO: item.wo,
            'WO No.': item.woNumber,
            เลขที่โอน: item.transferNumber,
            วันที่โอน: formatDate(item.createDate),
            แผนกโอน: masterStatus.find((status) => status.id === item.formerStatus).nameTh,
            แผนกรับโอน: masterStatus.find((status) => status.id === item.targetStatus).nameTh,

            เเม่พิมพ์: item.mold,
            รหัสสินค้า: item.productNumber,
            ประเภทสินค้า: item.productTypeName,
            จำนวนสินค้า: item.productQty,
            ประเภททอง_เงิน: item.gold,
            ขนาดทอง_เงิน: item.goldSize
          }))

          const options = {
            filename: `เอกสารโอนงาน_${form.transferNumber}.xlsx`,
            sheetName: form.receiptNumber,
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
