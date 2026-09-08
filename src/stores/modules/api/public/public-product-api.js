import { defineStore } from 'pinia'

import axiosPublic from '@/axios/axios-public.js'

export const usePublicProductApiStore = defineStore('publicProduct', {
  state: () => ({
    product: null
  }),
  actions: {
    // ข้อยกเว้นกฎ "ห้าม try-catch ครอบ API call": axios-public.js ไม่มี interceptor (ตั้งใจ ไม่ให้ลูกค้า
    // เห็น swAlert modal หรือโดน redirect ไป /login) จึงต้อง catch เองตรงนี้ที่เดียว แล้วคืน null ให้
    // ฝั่งหน้าจอไปแสดง state "ไม่พบสินค้า" อย่างสงบ ไม่มี error popup
    async fetchPublicProduct(token) {
      try {
        const res = await axiosPublic.post('PublicProduct/Get', { token })
        this.product = res.data || null
        return this.product
      } catch {
        this.product = null
        return null
      }
    }
  }
})
