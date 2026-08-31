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
      const param = {
        take: take,
        skip: skip,
        sort: sort,
        search: {
          ...formValue
        }
      }
      return await api.jewelry.post('Customer/Search', param, { skipLoading: skipLoading })
    },

    async fetchUpdateCustomer({ formValue }) {
      const params = {
        code: formValue.code,
        type: formValue.type?.code,
        nameTh: formValue.nameTh,
        nameEn: formValue.nameEn,
        address: formValue.address,
        tel1: formValue.tel1,
        tel2: formValue.tel2,
        email: formValue.email,
        contactName: formValue.contact,
        remark: formValue.remark,
        discount: formValue.discount,
        taxId: formValue.taxId
      }
      return await api.jewelry.post('Customer/UpdateCustomer', params)
    },

    async fetchCreateCustomer({ formValue }) {
      const params = {
        code: formValue.code,
        type: formValue.type?.code,
        nameTh: formValue.nameTh,
        nameEn: formValue.nameEn,
        address: formValue.address,
        tel1: formValue.tel1,
        tel2: formValue.tel2,
        email: formValue.email,
        contactName: formValue.contact,
        remark: formValue.remark,
        discount: formValue.discount,
        taxId: formValue.taxId
      }
      // autoCode — ใช้ตอนสร้างลูกค้าอัตโนมัติ (เช่น POS) ให้ backend ออกรหัสเองแบบ atomic + retry
      // เป็น optional field ไม่กระทบ caller เดิมที่ไม่ได้ส่ง formValue.autoCode
      if (formValue.autoCode) {
        params.autoCode = true
        params.codePrefix = formValue.codePrefix
      }
      return await api.jewelry.post('Customer/CreateCustomer', params)
    },

    async fetchNextCode({ prefix, skipLoading }) {
      return await api.jewelry.get('Customer/NextCode', { prefix }, { skipLoading: skipLoading })
    }
  }
})
