import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'

// MaterialInsight (คลังวัตถุดิบ) — ไม่เกี่ยวกับ metal scope ของทั้งหน้า จึงเรียก api ตรงๆ ไม่ผ่าน postScoped (body ต้องมีเฉพาะ key ที่ API รู้จัก)
// Overview อ่านผ่าน InsightPage (source.scoped:false) · store นี้มีเฉพาะ action เขียน: ตั้งขั้นต่ำรายรายการ / ลบการตั้งเอง / บันทึกเกณฑ์ (material:manage-min)
export const useMaterialInsightApiStore = defineStore('materialInsightApi', {
  state: () => ({}),

  actions: {
    async saveMin(body) {
      return await api.jewelry.post('MaterialInsight/Min/Save', body)
    },

    async deleteMin(body) {
      return await api.jewelry.post('MaterialInsight/Min/Delete', body)
    },

    async savePolicy(body) {
      return await api.jewelry.post('MaterialInsight/Policy/Save', body)
    }
  }
})
