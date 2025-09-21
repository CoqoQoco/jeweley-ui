import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'
import {
  //formatISOString,
  //formatDate
  //formatDateTime
} from '@/services/utils/dayjs.js'

//import { formatDecimal } from '@/services/utils/decimal.js'
//import swAlert from '@/services/alert/sweetAlerts.js'
//import { CsvHelper } from '@/services/utils/export-excel.js'
//import { ExcelHelper } from '@/services/utils/excel-js.js'

export const /* `usrQuotationApiStore` is a Pinia store in a Vue.js application that manages the state
and actions related to fetching and saving quotation data. It includes state properties
`dataSearch` and `dataSearchExport`, and actions `fetchSave` for saving quotation data
and `fetchGet` for fetching quotation data. The store interacts with an API using Axios
for making HTTP requests. */
/* `usrQuotationApiStore` is a Pinia store in JavaScript that defines state and actions
related to handling quotation data. It includes state properties `dataSearch` and
`dataSearchExport`, and two async actions `fetchSave` and `fetchGet`. */
usrQuotationApiStore = defineStore('quotation', {
  state: () => ({
    dataSearch: {},
    dataSearchExport: {},
    dataList: {
      data: [],
      total: 0
    }
  }),
  actions: {
    async fetchSave({ formValue, skipLoading = false }) {
      try {
        this.dataSearch = {}
        const param = {
          ...formValue
        }

        return await api.jewelry.post('Quotation/Upsert', param, { skipLoading: skipLoading })
      } catch (error) {
        console.error('Error fetching save quotation data:', error)
      }
    },
    async fetchGet({ formValue }) {
      try {
        this.dataSearch = {}
        const param = {
          ...formValue
        }
        return await api.jewelry.post('Quotation/Get', param, {
          skipLoading: false
        })
      } catch (error) {
        console.error('Error getting quotation data:', error)
      }
    },
    async fetchList({ take = 10, skip = 0, sort = [], formValue = {} }) {
      try {
        // Create search object with form values
        const search = {
          number: formValue.number || null,
          customerName: formValue.customerName || null,
          currency: formValue.currency || null,
          createBy: formValue.createBy || null,
          createDateStart: formValue.createDateStart || null,
          createDateEnd: formValue.createDateEnd || null,
          quotationDateStart: formValue.quotationDateStart || null,
          quotationDateEnd: formValue.quotationDateEnd || null
        }

        // Create DataSourceRequest format
        const request = {
          take,
          skip,
          sort: sort.map(s => ({
            field: s.field,
            dir: s.dir
          })),
          search
        }

        const response = await api.jewelry.post('Quotation/List', request)

        if (response && response.data) {
          this.dataList = {
            data: response.data.data || [],
            total: response.data.total || 0
          }
        }

        return this.dataList
      } catch (error) {
        console.error('Error fetching quotation list:', error)
        this.dataList = {
          data: [],
          total: 0
        }
        return this.dataList
      }
    }
  }
})
