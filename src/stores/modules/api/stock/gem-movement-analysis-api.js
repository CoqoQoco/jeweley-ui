import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'
import { formatDate, formatISOString } from '@/services/utils/dayjs.js'
import { ExcelHelper } from '@/services/utils/excel-js.js'

export const useGemMovementAnalysisApiStore = defineStore('gemMovementAnalysisApi', {
  state: () => ({
    dataSearch: { data: [], total: 0 },
    summary: { fastCount: 0, slowCount: 0, deadCount: 0, lowOutCount: 0 },
    stockAlerts: { data: [], total: 0 }
  }),

  actions: {
    buildSearch(formValue = {}) {
      return {
        startDate: formValue.startDate ? formatISOString(formValue.startDate) : undefined,
        endDate: formValue.endDate ? formatISOString(formValue.endDate) : undefined,
        groupName: formValue.groupName?.length ? formValue.groupName : undefined,
        shape: formValue.shape?.length ? formValue.shape : undefined,
        grade: formValue.grade?.length ? formValue.grade : undefined,
        code: formValue.code || undefined,
        movementStatus: formValue.movementStatus?.length ? formValue.movementStatus : undefined
      }
    },

    async fetchReport({ take = 10, skip = 0, sort = [], formValue = {} } = {}) {
      const res = await api.jewelry.post('StockGem/Report/Movement', {
        take,
        skip,
        sort,
        search: this.buildSearch(formValue)
      })
      this.dataSearch = res ? { ...res } : { data: [], total: 0 }
    },

    async fetchSummary({ formValue = {} } = {}) {
      const res = await api.jewelry.post('StockGem/Report/Movement', {
        take: 0,
        skip: 0,
        sort: [],
        search: { ...this.buildSearch(formValue), movementStatus: undefined }
      })
      const list = res?.data || []
      this.summary = {
        fastCount: list.filter((item) => item.movementStatus === 'FAST').length,
        slowCount: list.filter((item) => item.movementStatus === 'SLOW').length,
        deadCount: list.filter((item) => item.movementStatus === 'DEAD').length,
        lowOutCount: list.filter(
          (item) => item.stockAlertLevel === 'LOW' || item.stockAlertLevel === 'OUT'
        ).length
      }
    },

    async fetchStockAlerts({ formValue = {} } = {}) {
      const res = await api.jewelry.post('StockGem/Report/Movement', {
        take: 0,
        skip: 0,
        sort: [],
        search: { ...this.buildSearch(formValue), movementStatus: ['LOW', 'OUT'] }
      })
      this.stockAlerts = res ? { ...res } : { data: [], total: 0 }
    },

    async fetchReportExport({ sort = [], formValue = {} } = {}) {
      const res = await api.jewelry.post('StockGem/Report/Movement', {
        take: 0,
        skip: 0,
        sort,
        search: this.buildSearch(formValue)
      })

      if (res) {
        const dataExcel = res.data.map((item) => ({
          รหัส: item.code,
          ชนิดพลอย: item.groupName,
          รูปทรง: item.shape,
          เกรด: item.grade,
          'คงเหลือ (จำนวน)': item.quantity ? Number(item.quantity) : 0,
          'คงเหลือ (น้ำหนัก ct)': item.quantityWeight ? Number(item.quantityWeight).toFixed(2) : '0.00',
          จำนวนครั้งที่เคลื่อนไหว: item.transactionCount ? Number(item.transactionCount) : 0,
          'รับเข้า (จำนวน)': item.quantityIn ? Number(item.quantityIn) : 0,
          'รับเข้า (น้ำหนัก ct)': item.quantityWeightIn ? Number(item.quantityWeightIn).toFixed(2) : '0.00',
          'จ่ายออก (จำนวน)': item.quantityOut ? Number(item.quantityOut) : 0,
          'จ่ายออก (น้ำหนัก ct)': item.quantityWeightOut ? Number(item.quantityWeightOut).toFixed(2) : '0.00',
          'จ่ายเฉลี่ย/วัน': item.avgDailyConsumption ? Number(item.avgDailyConsumption).toFixed(2) : '0.00',
          'วันคงเหลือ (วัน)':
            item.daysOfSupply || item.daysOfSupply === 0 ? Number(item.daysOfSupply) : '-',
          วันที่เคลื่อนไหวล่าสุด: item.lastMovementDate ? formatDate(item.lastMovementDate) : '-',
          'ไม่เคลื่อนไหว (วัน)':
            item.daysSinceLastMovement || item.daysSinceLastMovement === 0
              ? Number(item.daysSinceLastMovement)
              : '-',
          สถานะการเคลื่อนไหว: item.movementStatus,
          สถานะสต๊อก: item.stockAlertLevel
        }))

        const options = {
          filename: 'รายงานการเคลื่อนไหววัตถุดิบ.xlsx',
          sheetName: 'การเคลื่อนไหววัตถุดิบ',
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
