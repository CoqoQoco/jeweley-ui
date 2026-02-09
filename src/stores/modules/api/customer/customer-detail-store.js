import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'
//import { formatISOString, formatDate, formatDateTime } from '@/services/utils/dayjs.js'
//import swAlert from '@/services/alert/sweetAlerts.js'
//import { CsvHelper } from '@/services/utils/export-excel.js'
//import { ExcelHelper } from '@/services/utils/excel-js.js'

export const useCustomerDetailApiStore = defineStore('customerDetailApiStore', {
  state: () => ({
    dataCustomer: 0
  }),
  actions: {
    async fetchCustomerSearch({ take, skip, sort, formValue, skipLoading }) {
      try {
        this.dataSearcTotalRecord = 0
        const param = {
          take: take,
          skip: skip,
          sort: sort,
          search: {
            ...formValue
          }
        }

        return await api.jewelry.post('Customer/Search', param, { skipLoading: skipLoading })
      } catch (error) {
        this.dataSearcTotalRecord = 0
        console.error('Error fetching customer data:', error)
        throw error
      }
    },

    async fetchCreateCustomer({ formValue }) {
      try {
        const params = {
          code: formValue.code,
          type: formValue.type.code,
          nameTh: formValue.nameTh,
          nameEn: formValue.nameEn,

          address: formValue.address,
          tel1: formValue.tel1,
          tel2: formValue.tel2,
          email: formValue.email,
          contactName: formValue.contact,
          remark: formValue.remark
        }

        return await api.jewelry.post('Customer/CreateCustomer', params)
      } catch (error) {
        this.dataSearcTotalRecord = 0
        console.error('Error fetching create customer data:', error)
        throw error
      }
    }
  }
})
