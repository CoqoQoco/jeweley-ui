import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'
import { formatDate } from '@/services/utils/dayjs.js'
import { ExcelHelper } from '@/services/utils/excel-js.js'
import { formatDecimal } from '@/services/utils/decimal.js'

export const useReceiptOutsourceApiStore = defineStore('receiptOutsource', {
  state: () => ({
    dataReceiptHistory: {},
    dataReceiptHistoryTotalRecord: 0
  }),

  actions: {
    async fetchConfirm(formValue) {
      return await api.jewelry.post('ReceiptOutsource/Confirm', formValue, {
        skipLoading: false
      })
    },

    async fetchHistory({ take, skip, sort, formValue, skipLoading }) {
      this.dataReceiptHistory = {}
      const param = {
        take,
        skip,
        sort,
        search: {
          ...formValue
        }
      }
      const res = await api.jewelry.post('ReceiptOutsource/ListHistory', param, {
        skipLoading: skipLoading
      })

      if (res) {
        this.dataReceiptHistory = { ...res }
        this.dataReceiptHistoryTotalRecord = res.total
      } else {
        this.dataReceiptHistory = {}
        this.dataReceiptHistoryTotalRecord = 0
      }
    },

    async fetchHistoryExport({ sort, formValue }) {
      const param = {
        take: 0,
        skip: 0,
        sort,
        search: {
          ...formValue
        }
      }
      const res = await api.jewelry.post('ReceiptOutsource/ListHistory', param, {
        skipLoading: false
      })

      if (res) {
        const dataExcel = res.data.map((item) => ({
          วันรับสินค้า: formatDate(item.receiptDate),
          เลขที่สต็อก: item.stockNumber,
          รหัสสินค้า: item.productNumber,
          'ชื่อสินค้า EN': item.productNameEn,
          'ชื่อสินค้า TH': item.productNameTh,
          ผู้ขาย: item.vendor,
          'เลขที่ PO': item.poNumber,
          ประเภทสินค้า: item.productTypeName,
          ขนาด: item.size,
          ราคา: item.productPrice ? formatDecimal(item.productPrice, 2) : '',
          จัดเก็บ: item.location,
          ผู้รับสินค้า: item.createBy,
          หมายเหตุ: item.remark
        }))

        const options = {
          filename: `รายงานรับสินค้างานนอก_[${formatDate(new Date())}].xlsx`,
          sheetName: 'รับสินค้างานนอก',
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
