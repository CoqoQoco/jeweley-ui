import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'
import {
  formatISOString,
  formatDate
  //formatDateTime
} from '@/services/utils/dayjs.js'
import swAlert from '@/services/alert/sweetAlerts.js'
//import { CsvHelper } from '@/services/utils/export-excel.js'
import { ExcelHelper } from '@/services/utils/excel-js.js'

export const usePlanSearchApiStore = defineStore('planSearch', {
  state: () => ({
    dataPlanSearch: {},
    dataPlanSearcTotalRecord: 0,
    dataPlanTransfer: {},
    dataPlanCompleted: {},
    dataPlanCompletedTotalRecord: 0,

    //permission
    totalTransferAllow: 10000
  }),

  actions: {
    initRequest(formValue) {
      //console.log('initRequest', formValue)
      return {
        search: {
          start: formValue.start ? formatISOString(formValue.start) : null,
          end: formValue.end ? formatISOString(formValue.end) : null,
          sendStart: formValue.sendStart ? formatISOString(formValue.sendStart) : null,
          sendEnd: formValue.sendEnd ? formatISOString(formValue.sendEnd) : null,
          text: formValue.text ?? null,
          status: formValue.status ? [...formValue.status] : null,
          isOverPlan: formValue.isOverPlan?.id,
          customerCode: formValue.customerCode ?? null,
          productType: formValue.productType ? [...formValue.productType] : null,
          customerType: formValue.customerType ? [...formValue.customerType] : null,
          gold: formValue.gold ? [...formValue.gold] : null,
          goldSize: formValue.goldSize ? [...formValue.goldSize] : null,
          mold: formValue.mold ?? null,
          productNumber: formValue.productNumber ?? null
        }
      }
    },

    async fetchData({ take, skip, sort, formValue }) {
      try {
        this.dataPlanSearch = {}
        console.log('fetchData', formValue)
        const param = {
          take,
          skip,
          sort,
          ...this.initRequest(formValue)
        }

        const res = await api.jewelry.post('ProductionPlan/ProductionPlanSearch', param)
        if (res) {
          this.dataPlanSearch = { ...res }
          this.dataPlanSearcTotalRecord = res.total
        } else {
          this.dataPlanSearch = {}
          this.dataPlanSearcTotalRecord = 0
        }
      } catch (error) {
        console.error('Error fetching production plan data:', error)
        throw error
      }
    },
    async SearchData({ take, skip, sort, formValue }) {
      try {
        //console.log('fetchData', formValue)
        const param = {
          take,
          skip,
          sort,
          ...this.initRequest(formValue)
        }

        return await api.jewelry.post('ProductionPlan/ProductionPlanSearch', param)
      } catch (error) {
        console.error('Error fetching production plan data:', error)
        throw error
      }
    },
    async fetchDataExport({ sort, formValue }) {
      try {
        const param = {
          take: 0,
          skip: 0,
          sort,
          ...this.initRequest(formValue)
        }

        const res = await api.jewelry.post('ProductionPlan/ProductionPlanSearch', param)
        if (res) {
          if (res) {
            // Map data for export
            const dataExcel = res.data.map((item) => ({
              WO: item.wo,
              'WO No.': item.woNumber,
              เเม่พิมพ์: item.mold,
              สถานะใบงาน: item.statusName,
              'สถานะใบงาน (วันที่)': formatDate(item.lastUpdateStatus),
              วันส่งงานลูกค้า: formatDate(item.requestDate),
              รหัสสินค้า: item.productNumber,
              ประเภทสินค้า: item.productTypeName,
              จำนวนสินค้า: item.productQty,
              รหัสลูกค้า: item.customerNumber,
              ชื่อลูกค้า: item.customerName,
              วันสร้างใบสินค้า: formatDate(item.createDate),
              ประเภททอง_เงิน: item.gold,
              ขนาดทอง_เงิน: item.goldSize
            }))

            const options = {
              filename: `เอกสารใบจ่าย-รับคืนงาน_[${formatDate(new Date())}].xlsx`,
              sheetName: 'เอกสารใบจ่าย-รับคืนงาน',
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

            // Export to CSV
            // CsvHelper.exportToCsv(
            //   dataExcel,
            //   `เอกสารใบจ่ายข-รับคืนงาน[${formatDateTime(new Date())}]`
            // )
          }
        }
      } catch (error) {
        console.error('Error fetching production plan data export:', error)
        throw error
      }
    },
    async fetchDataTransfer({ sort, formValue }) {
      try {
        this.dataPlanTransfer = {}
        console.log('fetchDataTransfer api', formValue)
        const param = {
          take: 0,
          skip: 0,
          sort,
          ...this.initRequest(formValue)
        }

        const res = await api.jewelry.post('ProductionPlan/ProductionPlanSearch', param)
        if (res) {
          this.dataPlanTransfer = { ...res }
        }
      } catch (error) {
        console.error('Error fetching transfer data:', error)
        throw error
      }
    },

    async fetchProductionPlanGet({ id }) {
      try {
        const param = {
          id: id
        }
        return await api.jewelry.get('ProductionPlan/ProductionPlanGet', param)
      } catch (error) {
        console.error('Error fetchProductionPlanGet:', error)
        throw error
      }
    },
    async fetchProductionPlanMateriaGet({ id }) {
      try {
        const param = {
          id: id
        }
        return await api.jewelry.post('ProductionPlan/ProductionPlanMateriaGet', param)
      } catch (error) {
        console.error('Error fetchProductionPlanMateriaGet:', error)
        throw error
      }
    },
    async fetchDataGoldCostItem({ planNumber }) {
      try {
        const param = {
          take: 0,
          skip: 0,
          sort: [],
          search: {
            ProductionPlanNumber: planNumber
          }
        }
        return await api.jewelry.post('ProductionPlanCost/ListGoldCostItem', param)
      } catch (error) {
        console.error('Error fetchDataGoldCostItem:', error)
        throw error
      }
    },

    async fetchPlanMoldImage(imagePath) {
      if (imagePath) {
        try {
          const param = { imageName: imagePath }
          const res = await api.jewelry.get('FileExtension/GetPlanImage', param)
          return `data:image/png;base64,${res}`
        } catch (error) {
          console.error('Error fetching image:', error)
          return null
        }
      }
      return null
    },

    checkTransferJobLimit(total) {
      if (total > this.totalTransferAllow) {
        swAlert.warning(
          `สามารถโอนงานได้ไม่เกินครั้งละ ${this.totalTransferAllow} รายการ`,
          'จำนวนงานเกินกำหนด'
        )
        return false
      }
      return true
    },

    // Plan Completed API Methods
    async fetchPlanCompleted({ take, skip, sort, formValue }) {
      try {
        this.dataPlanCompleted = {}
        console.log('fetchPlanCompleted', formValue)
        const param = {
          take,
          skip,
          sort,
          ...this.initRequest(formValue)
        }

        const res = await api.jewelry.post('Production/Plan/PlanCompleted', param)
        if (res) {
          this.dataPlanCompleted = { ...res }
          this.dataPlanCompletedTotalRecord = res.total
        } else {
          this.dataPlanCompleted = {}
          this.dataPlanCompletedTotalRecord = 0
        }
      } catch (error) {
        console.error('Error fetching plan completed data:', error)
        throw error
      }
    },

    async fetchPlanCompletedExport({ sort, formValue }) {
      try {
        const param = {
          take: 0,
          skip: 0,
          sort,
          ...this.initRequest(formValue)
        }

        const res = await api.jewelry.post('Production/Plan/PlanCompleted', param)
        if (res && res.data) {
          // Map data for export
          const dataExcel = res.data.map((item) => ({
            WO: item.wo,
            'WO No.': item.woNumber,
            เเม่พิมพ์: item.mold,
            สถานะใบงาน: item.statusName,
            'สถานะใบงาน (วันที่)': formatDate(item.lastUpdateStatus),
            วันส่งงานลูกค้า: formatDate(item.requestDate),
            รหัสสินค้า: item.productNumber,
            ประเภทสินค้า: item.productTypeName,
            จำนวนสินค้า: item.productQty,
            รหัสลูกค้า: item.customerNumber,
            ชื่อลูกค้า: item.customerName,
            ประเภทลูกค้า: item.customerTypeName,
            สีของทอง_เงิน: item.gold,
            ประเภททอง_เงิน: item.goldSize,
            ทองชุบ: item.goldPlated || '-',
            จำนวนจ่าย: item.goldQtySend || '-',
            น้ำหนักจ่าย: item.goldWeightSend || '-',
            จำนวนรับ: item.goldQtyCheck || '-',
            น้ำหนักรับ: item.goldWeightCheck || '-',
            หมายเหตุ: item.description || '-',
            วันสร้างใบงาน: formatDate(item.createDate),
            //สถานะความสำเร็จ: item.isSuccessWithoutCost ? 'เสร็จแล้ว (ไม่คิดราคา)' : 'เสร็จแล้ว'
          }))

          const options = {
            filename: `รายงานใบงานสำเร็จ (น้ำหนักทองชุบ)_[${formatDate(new Date())}].xlsx`,
            sheetName: 'รายงานใบงานสำเร็จ (น้ำหนักทองชุบ)',
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
      } catch (error) {
        console.error('Error fetching plan completed export data:', error)
        throw error
      }
    }
  }
})
