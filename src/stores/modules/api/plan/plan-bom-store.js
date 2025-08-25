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
        // หรือสร้าง helper function (แนะนำสำหรับการใช้งานซ้ำ)
        const safeNumber = (value, decimalPlaces = 2) => {
          if (value == null || isNaN(value)) return 0
          return Number(Number(value).toFixed(decimalPlaces))
        }

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
          // Sheet 1: Detailed Report (Original)
          const dataExcel = res.data.map((item) => ({
            วันที่: formatDate(item.completedDate),
            WO: item.wo,
            'WO No.': item.woNumber,
            สินค้า: item.productTypeName,
            รายการ: item.name,
            QTY: item.qty,
            QTY_Price: safeNumber(item.qtyPrice, 2),
            Weight: safeNumber(item.qtyWeight, 3),
            Weight_Price: safeNumber(item.qtyWeightPrice, 2),

            Total_Price: safeNumber(
              item.qty * item.qtyPrice + item.qtyWeight * item.qtyWeightPrice,
              2
            )
          }))

          // Sheet 2: Grouped by Product Type Summary
          const sortedGroupedData = Object.values(
            res.data.reduce((acc, item) => {
              const key = `${item.nameMaster}-${item.productType}-${item.productTypeName}`
              if (!acc[key]) {
                acc[key] = {
                  nameMaster: item.nameMaster,
                  productType: item.productType,
                  productTypeName: item.productTypeName,
                  totalQty: 0,
                  totalQtyPrice: 0,
                  totalWeight: 0,
                  totalWeightPrice: 0,
                  totalPrice: 0,
                  itemCount: 0
                }
              }

              acc[key].totalQty += item.qty || 0
              acc[key].totalQtyPrice += (item.qtyPrice || 0) * (item.qty || 0)
              acc[key].totalWeight += item.qtyWeight || 0
              acc[key].totalWeightPrice += (item.qtyWeightPrice || 0) * (item.qtyWeight || 0)
              acc[key].totalPrice +=
                (item.qty || 0) * (item.qtyPrice || 0) +
                (item.qtyWeight || 0) * (item.qtyWeightPrice || 0)
              acc[key].itemCount += 1

              return acc
            }, {})
          ).sort((a, b) => {
            if (a.productType !== b.productType) {
              return a.productType.localeCompare(b.productType)
            }
            return a.nameMaster.localeCompare(b.nameMaster)
          })

          // const groupedExcel = Object.values(sortedGroupedData).map((group) => ({
          //   ชื่อรายการ: group.nameMaster,
          //   รหัสประเภทสินค้า: group.productType,
          //   ประเภทสินค้า: group.productTypeName,
          //   จำนวนรายการ: group.itemCount,
          //   'QTY รวม': group.totalQty.toFixed(0),
          //   'QTY_Price รวม': group.totalQtyPrice.toFixed(2),
          //   'Weight รวม': group.totalWeight.toFixed(3),
          //   'Weight_Price รวม': group.totalWeightPrice.toFixed(2),
          //   'Total_Price รวม': group.totalPrice.toFixed(2)
          // }))

          const groupedExcel = Object.values(sortedGroupedData).map((group) => ({
            ชื่อรายการ: group.nameMaster || '',
            รหัสประเภทสินค้า: group.productType || '',
            ประเภทสินค้า: group.productTypeName || '',
            จำนวนรายการ: safeNumber(group.itemCount, 0),
            'QTY รวม': safeNumber(group.totalQty, 0),
            'QTY_Price รวม': safeNumber(group.totalQtyPrice, 2),
            'Weight รวม': safeNumber(group.totalWeight, 3),
            'Weight_Price รวม': safeNumber(group.totalWeightPrice, 2),
            'Total_Price รวม': safeNumber(group.totalPrice, 2)
          }))

          const sheets = [
            {
              data: dataExcel,
              sheetName: 'รายงานวัถุดิบ',
              columnWidths: {
                วันที่: 15,
                WO: 12,
                'WO No.': 15,
                สินค้า: 25,
                รายการ: 30,
                QTY: 10,
                QTY_Price: 12,
                Weight: 12,
                Weight_Price: 15,
                Total_Price: 15
              }
            },
            {
              data: groupedExcel,
              sheetName: 'สรุปตามประเภทสินค้า',
              columnWidths: {
                รหัสประเภทสินค้า: 20,
                ประเภทสินค้า: 25,
                จำนวนรายการ: 15,
                'QTY รวม': 12,
                'QTY_Price รวม': 15,
                'Weight รวม': 12,
                'Weight_Price รวม': 15,
                'Total_Price รวม': 15
              }
            }
          ]

          const options = {
            filename: `รายงานวัถุดิบ_${formatDate(formValue.start)}-${formatDate(
              formValue.end
            )}.xlsx`,
            styles: {
              ...ExcelHelper.defaultStyles,
              headerFill: {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: '921313' }
              }
            }
          }

          // Export with multiple sheets
          ExcelHelper.exportToExcelMultiSheet(sheets, options)
        }
      } catch (error) {
        console.error('Error fetching delete data:', error)
        throw error
      }
    }
  }
})
