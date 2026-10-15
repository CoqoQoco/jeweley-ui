import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'

export const usePlanBackdateCloseApiStore = defineStore('planBackdateCloseApi', {
  actions: {
    async preview(jobs) {
      const res = await api.jewelry.post('Production/Plan/BackdateClosePreview', { jobs })
      return res?.items || []
    },

    async close(payload) {
      return await api.jewelry.post('Production/Plan/BackdateClose', payload)
    }
  }
})
