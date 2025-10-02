import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'

export const usrSaleOrderApiStore = defineStore('saleOrder', {
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

        return await api.jewelry.post('SaleOrder/Upsert', param, { skipLoading: skipLoading })
      } catch (error) {
        console.error('Error fetching save sale order data:', error)
        throw error
      }
    },
    async fetchGet({ formValue }) {
      try {
        this.dataSearch = {}
        const param = {
          ...formValue
        }
        return await api.jewelry.post('SaleOrder/Get', param, {
          skipLoading: false
        })
      } catch (error) {
        console.error('Error getting sale order data:', error)
        throw error
      }
    },
    async fetchList({ take = 10, skip = 0, sort = [], formValue = {} }) {
      try {
        // Create search object with form values
        const search = {
          soNumber: formValue.soNumber || null,
          customerName: formValue.customerName || null,
          refQuotation: formValue.refQuotation || null,
          currencyUnit: formValue.currencyUnit || null,
          status: formValue.status || null,
          createBy: formValue.createBy || null,
          createDateStart: formValue.createDateStart || null,
          createDateEnd: formValue.createDateEnd || null,
          deliveryDateStart: formValue.deliveryDateStart || null,
          deliveryDateEnd: formValue.deliveryDateEnd || null
        }

        // Create DataSourceRequest format
        const request = {
          take,
          skip,
          sort: sort.map((s) => ({
            field: s.field,
            dir: s.dir
          })),
          search
        }

        const response = await api.jewelry.post('SaleOrder/List', request)

        if (response && response.data) {
          this.dataList = {
            data: [...response.data] || [],
            total: response.total || 0
          }
        }

        return this.dataList
      } catch (error) {
        console.error('Error fetching sale order list:', error)
        this.dataList = {
          data: [],
          total: 0
        }
        return this.dataList
      }
    },
    async fetchGenerateRunningNumber() {
      try {
        return await api.jewelry.post('SaleOrder/GenerateRunningNumber', {}, {
          skipLoading: false
        })
      } catch (error) {
        console.error('Error generating SO running number:', error)
        throw error
      }
    }
  }
})