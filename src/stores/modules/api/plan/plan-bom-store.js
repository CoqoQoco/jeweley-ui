import { defineStore } from 'pinia'
import ExcelJS from 'exceljs'
import api from '@/axios/axios-helper.js'
import { formatISOString, formatDate } from '@/services/utils/dayjs.js'
//import swAlert from '@/services/alert/sweetAlerts.js'
import { ExcelHelper } from '@/services/utils/excel-js.js'
import { PlanBomSummaryExcelBuilder } from '@/services/helper/excel/plan-bom/plan-bom-summary-excel-builder.js'

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

          const styles = {
            ...ExcelHelper.defaultStyles,
            headerFill: {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: '921313' }
            }
          }

          const workbook = new ExcelJS.Workbook()
          workbook.creator = 'DK Jewelry Management System'
          workbook.lastModifiedBy = 'DK Jewelry Management System'
          workbook.created = new Date()
          workbook.modified = new Date()
          workbook.lastPrinted = new Date()

          this.addSimpleSheet(workbook, dataExcel, 'รายงานวัตถุดิบ', {
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
          }, styles)

          this.addSimpleSheet(workbook, groupedExcel, 'สรุปตามประเภทสินค้า', {
            รหัสประเภทสินค้า: 20,
            ประเภทสินค้า: 25,
            จำนวนรายการ: 15,
            'QTY รวม': 12,
            'QTY_Price รวม': 15,
            'Weight รวม': 12,
            'Weight_Price รวม': 15,
            'Total_Price รวม': 15
          }, styles)

          const summaryBuilder = new PlanBomSummaryExcelBuilder(res.data, {
            goldSize: formValue.goldSize,
            start: formValue.start,
            end: formValue.end
          })
          summaryBuilder.buildSheet(workbook)

          const filename = `รายงานวัตถุดิบ_${formatDate(formValue.start)}-${formatDate(
            formValue.end
          )}.xlsx`

          const buffer = await workbook.xlsx.writeBuffer()
          const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          })
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = filename
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        }
      } catch (error) {
        console.error('Error fetching delete data:', error)
        throw error
      }
    },

    addSimpleSheet(workbook, data, sheetName, columnWidths, styles) {
      if (!data || data.length === 0) return

      const worksheet = workbook.addWorksheet(sheetName, {
        views: [{ showGridLines: true }]
      })

      const columnDefinitions = Object.keys(data[0]).map((key) => ({
        header: key,
        key: key
      }))

      worksheet.columns = columnDefinitions.map((col) => ({
        header: col.header,
        key: col.key,
        width: columnWidths[col.key] || 25
      }))

      const headerRow = worksheet.getRow(1)
      headerRow.height = 30
      headerRow.eachCell((cell) => {
        cell.fill = styles.headerFill
        cell.font = styles.headerFont
        cell.alignment = styles.headerAlignment
      })

      worksheet.addRows(data)

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          row.eachCell((cell) => {
            cell.alignment = styles.bodyAlignment
            cell.font = styles.bodyFont
          })
          row.height = 25
        }
      })

      worksheet.columns.forEach((column) => {
        let maxLength = 0
        column.eachCell({ includeEmpty: true }, (cell) => {
          const cellLength = cell.value ? cell.value.toString().length : 10
          maxLength = Math.max(maxLength, cellLength)
        })
        column.width = Math.min(Math.max(maxLength + 2, 10), 50)
      })
    }
  }
})
