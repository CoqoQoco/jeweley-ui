import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'

export const useCertificateApiStore = defineStore('certificate', {
  state: () => ({
    dataList: [],
    total: 0
  }),

  actions: {
    async uploadImage({ file, kind }, { skipError = false } = {}) {
      const formData = new FormData()
      formData.append('Image', file)
      formData.append('Kind', kind)

      return await api.jewelry.post('Certificate/UploadImage', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        skipError
      })
    },

    async fetchCustomerBrand({ customerCode }) {
      return await api.jewelry.get('Certificate/CustomerBrand', { customerCode })
    },

    async createCertificates(payload, { skipError = false } = {}) {
      return await api.jewelry.post('Certificate/Create', payload, { skipError })
    },

    async fetchList({ invoiceNumber, certificateNo, stockNumber, customerCode, take, skip } = {}) {
      const param = { invoiceNumber, certificateNo, stockNumber, customerCode, take, skip }
      const res = await api.jewelry.post('Certificate/List', param)

      if (res) {
        this.dataList = res.data || []
        this.total = res.total || 0
      }

      return res
    },

    // นับ/ดึงใบรับรองของ invoice แบบเงียบ — ไม่เปิด loading, ไม่แสดง error, ไม่เขียนทับ dataList/total ที่ใช้ร่วมกัน
    async fetchByInvoice({ invoiceNumber, take = 200 }) {
      const res = await api.jewelry.post(
        'Certificate/List',
        { invoiceNumber, take, skip: 0 },
        { skipLoading: true, skipError: true, timeout: 5000 }
      )
      return { data: res?.data || [], total: res?.total || 0 }
    }
  }
})
