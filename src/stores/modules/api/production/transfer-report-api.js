import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'
import { formatDateTime, formatISOString } from '@/services/utils/dayjs.js'
import { ExcelHelper } from '@/services/utils/excel-js.js'

export const useTransferReportApiStore = defineStore('transferReportApi', {
  state: () => ({
    dataSearch: { data: [], total: 0 }
  }),

  actions: {
    buildSearch(formValue = {}) {
      return {
        start: formValue.start ? formatISOString(formValue.start) : undefined,
        end: formValue.end ? formatISOString(formValue.end) : undefined,
        transferNumber: formValue.transferNumber || undefined,
        woText: formValue.woText || undefined,
        statusFormer: formValue.statusFormer ?? undefined,
        statusTarget: formValue.statusTarget ?? undefined,
        gold: undefined,
        productNumber: formValue.productNumber || undefined
      }
    },

    async fetchReport({ take = 10, skip = 0, sort = [], formValue = {} } = {}) {
      const res = await api.jewelry.post('Production/Plan/TransferList', {
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

    async fetchReportExport({ sort = [], formValue = {}, masterStatus = [] } = {}) {
      const res = await api.jewelry.post('Production/Plan/TransferList', {
        take: 0,
        skip: 0,
        sort,
        search: this.buildSearch(formValue)
      })

      if (res) {
        const findStatusName = (id) => masterStatus.find((status) => status.id === id)?.nameTh || id

        const dataExcel = res.data.map((item) => ({
          วันที่โอน: formatDateTime(item.createDate),
          เลขที่โอน: item.transferNumber,
          เลขที่ใบงาน: item.woText,
          รหัสสินค้า: item.productNumber,
          ชื่อสินค้า: item.productName,
          แม่พิมพ์: item.mold,
          จากแผนก: findStatusName(item.formerStatus),
          ไปแผนก: findStatusName(item.targetStatus),
          ช่างรับ: item.workerName,
          ลูกค้า: item.customerName,
          ผู้โอน: item.createBy,
          หมายเหตุ: item.remark,
          ทอง: item.gold,
          ขนาดทอง: item.goldSize,
          ประเภทสินค้า: item.productType,
          จำนวนสินค้า: item.productQty
        }))

        const options = {
          filename: 'รายงานการโอนงาน.xlsx',
          sheetName: 'รายงานการโอนงาน',
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
