import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'

export const useSaleDocumentStore = defineStore('saleDocument', {
  state: () => ({
    dataList: []
  }),

  actions: {
    async fetchList({ month, year }) {
      const params = {}
      if (month) params.DocumentMonth = month
      if (year) params.DocumentYear = year

      const response = await api.jewelry.get('SaleDocument/List', { params })
      this.dataList = response?.data ?? []
      return this.dataList
    },

    async uploadDocument(formData) {
      return await api.jewelry.post('SaleDocument/Upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    },

    async downloadDocument(id) {
      return await api.jewelry.get(`SaleDocument/Download/${id}`, { responseType: 'blob' })
    },

    async updateTag(payload) {
      return await api.jewelry.put('SaleDocument/UpdateTag', payload)
    },

    async deleteDocument(id) {
      return await api.jewelry.put(`SaleDocument/Delete/${id}`)
    }
  }
})
