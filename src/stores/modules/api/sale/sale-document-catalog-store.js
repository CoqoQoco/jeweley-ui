import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'

export const useSaleDocumentCatalogStore = defineStore('saleDocumentCatalog', {
  state: () => ({
    dataList: []
  }),

  actions: {
    async save(payload) {
      return await api.jewelry.post('SaleDocumentCatalog/Save', payload)
    },

    async get(id) {
      return await api.jewelry.get(`SaleDocumentCatalog/Get/${id}`)
    },

    async list(payload) {
      const res = await api.jewelry.post('SaleDocumentCatalog/List', payload || {})
      this.dataList = res ?? []
      return this.dataList
    },

    async delete(id) {
      return await api.jewelry.put(`SaleDocumentCatalog/Delete/${id}`)
    },

    async uploadImage(formData) {
      return await api.jewelry.post('SaleDocumentCatalog/UploadImage', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    }
  }
})
