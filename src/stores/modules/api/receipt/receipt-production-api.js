import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'
import //formatISOString,
//formatDate
//formatDateTime
'@/services/utils/dayjs.js'
//import swAlert from '@/services/alert/sweetAlerts.js'
//import { CsvHelper } from '@/services/utils/export-excel.js'
//import { ExcelHelper } from '@/services/utils/excel-js.js'

export const useReceiptProductionApiStore = defineStore('receiptProduction', {
  state: () => ({
    dataListPlan: {},
    dataListPlanTotalRecord: 0
  }),

  actions: {
    initeListPlanRequest(formValue) {
      //console.log('initRequest', formValue)
      return {
        search: {
          //start: formValue.start ? formatISOString(formValue.start) : null,
          //end: formValue.end ? formatISOString(formValue.end) : null,

          wo: formValue.wo
        }
      }
    },

    async fetchDataListPlan({ take, skip, sort, formValue }) {
      try {
        this.dataListPlan = {}
        //console.log('fetchDataListPlan', formValue)
        const param = {
          take,
          skip,
          sort,
          ...this.initeListPlanRequest(formValue)
        }

        const res = await api.jewelry.post('ReceiptProduction/ListPlan', param)
        if (res) {
          this.dataListPlan = { ...res }
          this.dataListPlanTotalRecord = res.total
        } else {
          this.dataListPlan = {}
          this.dataListPlanTotalRecord = 0
        }
      } catch (error) {
        console.error('Error fetchDataListPlan:', error)
        throw error
      }
    },
    async fetchDataGetPlan({ formValue, skipLoading }) {
      try {
        //console.log('fetchDataGetPlan', formValue)
        const param = {
          running: formValue.running
        }
        return await api.jewelry.post('ReceiptProduction/GetPlan', param, {
          skipLoading: skipLoading
        })
      } catch (error) {
        console.error('Error fetchDataGetPlan:', error)
        throw error
      }
    },
    async fetchCreateDraft({ formValue }) {
      try {
        return await api.jewelry.post('ReceiptProduction/Darft', formValue, {
          skipLoading: true
        })
      } catch (error) {
        console.error('Error fetchCreateDraft:', error)
        throw error
      }
    }
  }
})
