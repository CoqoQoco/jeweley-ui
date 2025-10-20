import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'

export const useInvoiceApiStore = defineStore('invoice', {
  state: () => ({
    dataSearch: {},
    dataSearchExport: {},
    dataList: {
      data: [],
      total: 0
    }
  }),
  actions: {
    async fetchCreate({ formValue, skipLoading = false }) {
      try {
        this.dataSearch = {}
        const param = {
          ...formValue
        }

        return await api.jewelry.post('Invoice/Create', param, { skipLoading: skipLoading })
      } catch (error) {
        console.error('Error creating invoice:', error)
        throw error
      }
    },
    async fetchGet({ formValue }) {
      try {
        this.dataSearch = {}
        const param = {
          ...formValue
        }
        return await api.jewelry.post('Invoice/Get', param, {
          skipLoading: false
        })
      } catch (error) {
        console.error('Error getting invoice data:', error)
        throw error
      }
    },
    async fetchList({ take = 10, skip = 0, sort = [], formValue = {} }) {
      try {
        // Create search object with form values
        const search = {
          invoiceNumber: formValue.invoiceNumber || null,
          customerName: formValue.customerName || null,
          customerCode: formValue.customerCode || null,
          soNumber: formValue.soNumber || null,
          status: formValue.status || null,
          createBy: formValue.createBy || null,
          createDateFrom: formValue.createDateFrom || null,
          createDateTo: formValue.createDateTo || null,
          deliveryDateFrom: formValue.deliveryDateFrom || null,
          deliveryDateTo: formValue.deliveryDateTo || null
        }

        // Add sorting
        let orderBy = null
        let orderDirection = 'DESC'

        if (sort && sort.length > 0) {
          const sortField = sort[0]
          orderBy = sortField.field
          orderDirection = sortField.dir?.toUpperCase() || 'DESC'
        } else {
          orderBy = 'createDate'
        }

        const param = {
          ...search,
          skip: skip,
          take: take,
          orderBy: orderBy,
          orderDirection: orderDirection
        }

        const response = await api.jewelry.post('Invoice/List', param, {
          skipLoading: false
        })

        if (response && response.data) {
          this.dataList = {
            data: response.data.data || [],
            total: response.data.total || 0
          }
        }

        return response
      } catch (error) {
        console.error('Error fetching invoice list:', error)
        throw error
      }
    },
    async fetchDelete({ formValue }) {
      try {
        const param = {
          ...formValue
        }
        return await api.jewelry.post('Invoice/Delete', param, {
          skipLoading: false
        })
      } catch (error) {
        console.error('Error deleting invoice:', error)
        throw error
      }
    },
    async fetchGenerateNumber() {
      try {
        return await api.jewelry.get('Invoice/GenerateInvoiceNumber', {
          skipLoading: false
        })
      } catch (error) {
        console.error('Error generating invoice number:', error)
        throw error
      }
    },
    async confirmStockItems({ formValue }) {
      try {
        const param = {
          ...formValue
        }
        return await api.jewelry.post('SaleOrder/ConfirmStockItems', param, {
          skipLoading: false
        })
      } catch (error) {
        console.error('Error confirming stock items:', error)
        throw error
      }
    },
    clearData() {
      this.dataSearch = {}
      this.dataSearchExport = {}
      this.dataList = {
        data: [],
        total: 0
      }
    }
  }
})