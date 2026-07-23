import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'
import { ExcelHelper } from '@/services/utils/excel-js.js'

export const useGemOnhandReportApiStore = defineStore('gemOnhandReportApi', {
  state: () => ({
    dataSearch: { data: [], total: 0 },
    summary: { totalCount: 0, totalQuantity: 0, totalWeight: 0, totalValue: 0 },
    groupOptions: [],
    shapeOptions: [],
    gradeOptions: []
  }),

  actions: {
    buildSearch(formValue = {}) {
      return {
        code: formValue.code || undefined,
        text: formValue.text || undefined,
        groupName: formValue.groupName?.length ? formValue.groupName : undefined,
        shape: formValue.shape?.length ? formValue.shape : undefined,
        grade: formValue.grade?.length ? formValue.grade : undefined
      }
    },

    async fetchReport({ take = 10, skip = 0, sort = [], formValue = {} } = {}) {
      const res = await api.jewelry.post('StockGem/SearchData', {
        take,
        skip,
        sort,
        search: this.buildSearch(formValue)
      })
      this.dataSearch = res ? { ...res } : { data: [], total: 0 }
    },

    async fetchSummary({ formValue = {} } = {}) {
      const res = await api.jewelry.post('StockGem/SearchData', {
        take: 0,
        skip: 0,
        sort: [],
        search: this.buildSearch(formValue)
      })
      const list = res?.data || []
      this.summary = {
        totalCount: res?.total ?? list.length,
        totalQuantity: list.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0),
        totalWeight: list.reduce((sum, item) => sum + (Number(item.quantityWeight) || 0), 0),
        totalValue: list.reduce(
          (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.price) || 0),
          0
        )
      }
    },

    async fetchReportExport({ sort = [], formValue = {} } = {}) {
      const res = await api.jewelry.post('StockGem/SearchData', {
        take: 0,
        skip: 0,
        sort,
        search: this.buildSearch(formValue)
      })

      if (res) {
        const dataExcel = res.data.map((item) => ({
          รหัส: item.code,
          ชื่อพลอย: item.name,
          หมวดหมู่: item.groupName,
          รูปร่าง: item.shape,
          เกรด: item.grade,
          ขนาด: item.size,
          'คงเหลือ (จำนวน)': item.quantity ? Number(item.quantity) : 0,
          'คงเหลือ (น้ำหนัก ct)': item.quantityWeight ? Number(item.quantityWeight).toFixed(2) : '0.00',
          กำลังผลิต: item.quantityOnProcess ? Number(item.quantityOnProcess) : 0,
          'ราคา/หน่วย': item.price ? Number(item.price).toFixed(2) : '0.00',
          แหล่งผลิต: item.region,
          หมายเหตุ: item.remark1
        }))

        const options = {
          filename: 'รายงานพลอย-เพชรคงคลัง(มูลค่า).xlsx',
          sheetName: 'พลอย-เพชรคงคลัง',
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
    },

    async fetchShapeOptions() {
      const res = await api.jewelry.post('StockGem/GroupGemData', { type: 'SHAPE', Value: null })
      this.shapeOptions = res ? [...res] : []
    },

    async fetchGradeOptions() {
      const res = await api.jewelry.post('StockGem/GroupGemData', { type: 'GRADE', Value: null })
      this.gradeOptions = res ? [...res] : []
    }
  }
})
