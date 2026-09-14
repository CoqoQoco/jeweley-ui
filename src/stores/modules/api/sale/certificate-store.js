import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'

export const useCertificateApiStore = defineStore('certificate', {
  state: () => ({
    dataList: [],
    total: 0
  }),

  actions: {
    async uploadImage({ file, kind }) {
      const formData = new FormData()
      formData.append('Image', file)
      formData.append('Kind', kind)

      return await api.jewelry.post('Certificate/UploadImage', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    },

    async fetchCustomerBrand({ customerCode }) {
      return await api.jewelry.get('Certificate/CustomerBrand', { customerCode })
    },

    async createCertificates(payload) {
      return await api.jewelry.post('Certificate/Create', payload)
    },

    async fetchList({ invoiceNumber, certificateNo, stockNumber, customerCode, take, skip } = {}) {
      const param = { invoiceNumber, certificateNo, stockNumber, customerCode, take, skip }
      const res = await api.jewelry.post('Certificate/List', param)

      if (res) {
        this.dataList = res.data || []
        this.total = res.total || 0
      }

      return res
    }
  }
})
