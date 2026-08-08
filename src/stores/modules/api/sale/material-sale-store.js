import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'

export const useMaterialSaleApiStore = defineStore('materialSaleApiStore', {
  state: () => ({
    dataList: {
      data: [],
      total: 0
    }
  }),
  actions: {
    async fetchGenerateDocumentNumber({ skipLoading = false } = {}) {
      return await api.jewelry.post('MaterialSale/GenerateDocumentNumber', {}, { skipLoading })
    },

    async fetchCreate({ formValue }) {
      const param = {
        ...formValue
      }
      return await api.jewelry.post('MaterialSale/Create', param, { skipLoading: false })
    },

    async fetchUpdate({ formValue }) {
      const param = {
        ...formValue
      }
      return await api.jewelry.post('MaterialSale/Update', param, { skipLoading: false })
    },

    async fetchGet({ running }) {
      const param = { running }
      return await api.jewelry.post('MaterialSale/Get', param, { skipLoading: false })
    },

    async fetchList({ take = 10, skip = 0, sort = [], formValue = {} }) {
      const request = {
        take,
        skip,
        sort: sort.map((s) => ({
          field: s.field,
          dir: s.dir
        })),
        documentNo: formValue.documentNo || null,
        customerName: formValue.customerName || null,
        status: formValue.status && formValue.status.length ? formValue.status : undefined,
        documentDateStart: formValue.documentDateStart || null,
        documentDateEnd: formValue.documentDateEnd || null,
        createBy: formValue.createBy || null
      }

      const response = await api.jewelry.post('MaterialSale/List', request)

      if (response) {
        this.dataList = {
          data: [...(response.data || [])],
          total: response.total || 0
        }
      }

      return this.dataList
    },

    async fetchConfirm({ running }) {
      const param = { running }
      return await api.jewelry.post('MaterialSale/Confirm', param, { skipLoading: false })
    },

    async fetchCancel({ running, cancelReason }) {
      const param = { running, cancelReason }
      return await api.jewelry.post('MaterialSale/Cancel', param, { skipLoading: false })
    },

    async fetchDelete({ running }) {
      const param = { running }
      return await api.jewelry.post('MaterialSale/Delete', param, { skipLoading: false })
    },

    clearData() {
      this.dataList = {
        data: [],
        total: 0
      }
    }
  }
})
