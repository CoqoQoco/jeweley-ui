import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'

export const useBillingNoteApiStore = defineStore('billingNoteApiStore', {
  state: () => ({
    dataList: {
      data: [],
      total: 0
    }
  }),
  actions: {
    async fetchAvailableCustomers({ skipLoading = false } = {}) {
      return await api.jewelry.get('BillingNote/AvailableCustomers', {
        skipLoading
      })
    },

    async fetchAvailableInvoices({ customerCode, skipLoading = false }) {
      return await api.jewelry.get('BillingNote/AvailableInvoices', { customerCode }, { skipLoading })
    },

    async fetchPreviewProducts({ invoiceRunnings, skipLoading = false }) {
      const param = {
        invoiceRunnings
      }
      return await api.jewelry.post('BillingNote/PreviewProducts', param, { skipLoading })
    },

    async fetchCreate({ formValue }) {
      const param = {
        ...formValue
      }
      return await api.jewelry.post('BillingNote/Create', param, { skipLoading: false })
    },

    async fetchUpdate({ formValue }) {
      const param = {
        ...formValue
      }
      return await api.jewelry.post('BillingNote/Update', param, { skipLoading: false })
    },

    async fetchGet({ running }) {
      const param = { running }
      return await api.jewelry.post('BillingNote/Get', param, { skipLoading: false })
    },

    async fetchList({ take = 10, skip = 0, sort = [], formValue = {} }) {
      const search = {
        running: formValue.running || null,
        customerName: formValue.customerName || null,
        customerCode: formValue.customerCode || null,
        status: formValue.status || null,
        createBy: formValue.createBy || null,
        documentDateFrom: formValue.documentDateFrom || null,
        documentDateTo: formValue.documentDateTo || null
      }

      const request = {
        take,
        skip,
        sort: sort.map((s) => ({
          field: s.field,
          dir: s.dir
        })),
        search
      }

      const response = await api.jewelry.post('BillingNote/List', request)

      if (response) {
        this.dataList = {
          data: [...(response.data || [])],
          total: response.total || 0
        }
      }

      return this.dataList
    },

    async fetchDelete({ running, deleteReason }) {
      const param = { running, deleteReason }
      return await api.jewelry.post('BillingNote/Delete', param, { skipLoading: false })
    },

    clearData() {
      this.dataList = {
        data: [],
        total: 0
      }
    }
  }
})
