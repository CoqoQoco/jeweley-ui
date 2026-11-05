import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'

// คีย์เครื่องของหน้า /label-station (Dev เท่านั้น, JWT ปกติ) — Get = ดูคีย์ปัจจุบัน, Generate = ออกคีย์ใหม่ (คีย์เดิมใช้ไม่ได้ทันที)
export const useLabelStationKeyApiStore = defineStore('labelStationKey', {
  state: () => ({}),

  actions: {
    async fetchKey() {
      try {
        return await api.jewelry.post('LabelStationKey/Get', {})
      } catch (error) {
        console.error('Error fetching label station key:', error)
        throw error
      }
    },

    async generateKey() {
      try {
        return await api.jewelry.post('LabelStationKey/Generate', {})
      } catch (error) {
        console.error('Error generating label station key:', error)
        throw error
      }
    }
  }
})
