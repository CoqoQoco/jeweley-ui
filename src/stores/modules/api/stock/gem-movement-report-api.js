import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'
import { formatDate, formatISOString } from '@/services/utils/dayjs.js'
import { ExcelHelper } from '@/services/utils/excel-js.js'

const TYPE_NAME_TH = {
  1: 'รับเข้าคลัง [พลอยใหม่]',
  2: 'รับเข้าคลัง [พลอยนอกสต๊อก]',
  3: 'รับเข้าคลัง [พลอยคืน]',
  4: 'จ่ายออกคลัง',
  5: 'ยืมออกคลัง',
  6: 'คืนเข้าคลัง',
  7: 'เบิกออกคลัง'
}

export const useGemMovementReportApiStore = defineStore('gemMovementReportApi', {
  state: () => ({
    dataSearch: { data: [], total: 0 },
    groupOptions: []
  }),

  actions: {
    buildSearch(formValue = {}) {
      return {
        requestDateStart: formValue.requestDateStart ? formatISOString(formValue.requestDateStart) : undefined,
        requestDateEnd: formValue.requestDateEnd ? formatISOString(formValue.requestDateEnd) : undefined,
        running: formValue.running || undefined,
        code: formValue.code || undefined,
        groupName: formValue.groupName?.length ? formValue.groupName : undefined,
        type: formValue.type?.length ? formValue.type : undefined,
        jobNoOrPONo: formValue.jobOrPo || undefined,
        wo: formValue.wo || undefined
      }
    },

    async fetchReport({ take = 10, skip = 0, sort = [], formValue = {} } = {}) {
      const res = await api.jewelry.post('ReceiptAndIssueStockGem/ListTransection', {
        take,
        skip,
        sort,
        search: this.buildSearch(formValue)
      })
      this.dataSearch = res ? { ...res } : { data: [], total: 0 }
    },

    async fetchReportExport({ sort = [], formValue = {} } = {}) {
      const res = await api.jewelry.post('ReceiptAndIssueStockGem/ListTransection', {
        take: 0,
        skip: 0,
        sort,
        search: this.buildSearch(formValue)
      })

      if (res) {
        const dataExcel = res.data.map((item) => ({
          'วันที่รับ/เบิก': formatDate(item.requestDate),
          ประเภท: TYPE_NAME_TH[item.type] || item.type,
          พลอย: item.name,
          หมวดหมู่: item.groupName,
          รูปร่าง: item.shape,
          เกรด: item.grade,
          จำนวน: item.qty ? Number(item.qty) : 0,
          'น้ำหนัก (ct)': item.qtyWeight ? Number(item.qtyWeight).toFixed(2) : '0.00',
          'คงเหลือก่อน (ct)': item.previousRemianQtyWeight ? Number(item.previousRemianQtyWeight).toFixed(2) : '0.00',
          'คงเหลือหลัง (ct)': item.pointRemianQtyWeight ? Number(item.pointRemianQtyWeight).toFixed(2) : '0.00',
          ต้นทุน: item.supplierCost ? Number(item.supplierCost).toFixed(2) : '0.00',
          'Job/PO': item.jobOrPo,
          WO: item.woText,
          ผู้ขาย: item.subpplierName,
          ผู้ปฏิบัติงาน: item.operatorBy,
          วันที่คืน: item.returnDate ? formatDate(item.returnDate) : '',
          หมายเหตุ: item.remark1
        }))

        const options = {
          filename: 'รายงานรับ-จ่ายพลอย.xlsx',
          sheetName: 'รับ-จ่ายพลอย',
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
    },

    async fetchGroupOptions() {
      const res = await api.jewelry.post('StockGem/GroupGemData', { type: 'GROUPGEM', Value: null })
      this.groupOptions = res ? [...res] : []
    }
  }
})
