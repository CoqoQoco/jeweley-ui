import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'
import { formatISOString, formatDate } from '@/services/utils/dayjs.js'
//import swAlert from '@/services/alert/sweetAlerts.js'
import { ExcelHelper } from '@/services/utils/excel-js.js'

export const usePlanBOMApiStore = defineStore('planBOM', {
  state: () => ({
    bomData: {},
    bomTotal: 0,

    bomReport: {},
    bomTotalReport: 0,
    bomSummary: {
      totalItems: 0,
      totalCost: 0,
      lastUpdated: null
    },
    isLoading: false,
    error: null
  }),

  getters: {},

  actions: {
    async fetchTransaction({ id, skipLoading = false }) {
      try {
        const param = {
          id: id
        }
        return await api.jewelry.get('Production/Bom/Transaction', param, { skipLoading })
      } catch (error) {
        console.error('Error fetching transaction data:', error)
        throw error
      }
    },

    async fetchGet({ id }) {
      try {
        const param = {
          id: id
        }
        return await api.jewelry.get('Production/Bom/Get', param)
      } catch (error) {
        console.error('Error fetching get data:', error)
        throw error
      }
    },

    async fetchSave({ formValue, skipLoading = false }) {
      try {
        return await api.jewelry.post('Production/Bom/Save', formValue, { skipLoading })
      } catch (error) {
        console.error('Error fetching save data:', error)
        throw error
      }
    },

    async fetchList({ take, skip, sort, formValue, skipLoading = false }) {
      try {
        this.bomData = {}
        this.bomTotal = 0
        const param = {
          take,
          skip,
          sort,
          search: {
            start: formValue.start ? formatISOString(formValue.start) : null,
            end: formValue.end ? formatISOString(formValue.end) : null,
            woText: formValue.woText ?? null,
            customerCode: formValue.customerCode ?? null,
            productType: formValue.productType ? [...formValue.productType] : null,
            customerType: formValue.customerType ? [...formValue.customerType] : null,
            gold: formValue.gold ? [...formValue.gold] : null,
            goldSize: formValue.goldSize ? [...formValue.goldSize] : null,
            mold: formValue.mold ?? null,
            productNumber: formValue.productNumber ?? null
          }
        }
        const res = await api.jewelry.post('Production/Bom/List', param, { skipLoading })
        if (res) {
          console.log('fetchList', res)
          this.bomData = { ...res }
          this.bomTotal = res.total || 0

          console.log('bom', this.bomData)
          //console.log('bomTotal', this.bomTotalReport)
        }
      } catch (error) {
        console.error('Error fetching delete data:', error)
        this.bomData = {}
        this.bomTotal = 0
        throw error
      }
    },

    async fetchListReport({ take, skip, sort, formValue, skipLoading = false }) {
      try {
        const param = {
          take,
          skip,
          sort,
          search: {
            start: formValue.start ? formatISOString(formValue.start) : null,
            end: formValue.end ? formatISOString(formValue.end) : null,
            woText: formValue.woText ?? null,
            customerCode: formValue.customerCode ?? null,
            productType: formValue.productType ? [...formValue.productType] : null,
            customerType: formValue.customerType ? [...formValue.customerType] : null,
            gold: formValue.gold ? [...formValue.gold] : null,
            goldSize: formValue.goldSize ? [...formValue.goldSize] : null,
            mold: formValue.mold ?? null,
            productNumber: formValue.productNumber ?? null
          }
        }
        const res = await api.jewelry.post('Production/Bom/List', param, { skipLoading })
        if (res) {
          const dataExcel = res.data.map((item) => ({
            วันที่: formatDate(item.completedDate),
            WO: item.wo,
            'WO No.': item.woNumber,

            // เเม่พิมพ์: item.mold,
            // รหัสสินค้า: item.productNumber,
            // ประเภทสินค้า: item.productTypeName,
            // จำนวนสินค้า: item.productQty,
            // ประเภททอง_เงิน: item.gold,
            // ขนาดทอง_เงิน: item.goldSize

            รายการ: item.name,
            QTY: item.qty,
            QTY_Price: item.qtyPrice ? Number(item.qtyPrice).toFixed(2) : '0.00',
            Weight: item.qtyWeight ? Number(item.qtyWeight).toFixed(3) : '0.000',
            Weight_Price: item.qtyWeightPrice ? Number(item.qtyWeightPrice).toFixed(2) : '0.00',
            Total_Price: Number(
              item.qty * item.qtyPrice + item.qtyWeight * item.qtyWeightPrice
            ).toFixed(2)
          }))

          const options = {
            filename: `รายงานวัถุดิบ_${formatDate(formValue.start)}-${formatDate(
              formValue.end
            )}.xlsx`,
            sheetName: `รายงานวัถุดิบ`,
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
        }
      } catch (error) {
        console.error('Error fetching delete data:', error)
        throw error
      }
    }
  }
})
