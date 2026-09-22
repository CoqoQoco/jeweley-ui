import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'

export const useStockProductGalleryApiStore = defineStore('stockProductGalleryApi', {
  state: () => ({}),
  actions: {
    async fetchGet({ stockNumber, skipLoading = false }) {
      const res = await api.jewelry.post('StockProductGallery/Get', { stockNumber }, { skipLoading })
      return res || null
    },

    // skipLoading:true เสมอ — กัน global loading overlay บังหน้าจอตอนอัปโหลดทีละไฟล์ (มี progress bar ของตัวเองในหน้า)
    async fetchUpload({ stockNumber, scope, file, onUploadProgress }) {
      const form = new FormData()
      form.append('StockNumber', stockNumber)
      form.append('Scope', scope)
      form.append('Image', file)

      const res = await api.jewelry.post('StockProductGallery/Upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        skipLoading: true,
        onUploadProgress
      })
      return res || null
    },

    async fetchReorder({ stockNumber, scope, ids }) {
      const res = await api.jewelry.post('StockProductGallery/Reorder', { stockNumber, scope, ids })
      return res || null
    },

    async fetchDelete({ id }) {
      const res = await api.jewelry.post('StockProductGallery/Delete', { id })
      return res || null
    },

    // แบบ (mold) ที่ยังไม่มีรูปสำหรับลูกค้าครบ — ใช้ที่ backlog list หน้า /goods-receipt-image (แท็บลูกค้า)
    async fetchMissingList({ take, skip, sort, search, skipLoading = false }) {
      const res = await api.jewelry.post(
        'StockProductGallery/MissingList',
        { take, skip, sort, search },
        { skipLoading }
      )
      return res || null
    }
  }
})
