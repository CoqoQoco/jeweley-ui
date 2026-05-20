import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'

export const useMoldStore = defineStore('mold', {
  state: () => ({}),

  actions: {
    async fetchProductionCount(moldCode) {
      if (!moldCode) return 0
      const res = await api.jewelry.get(`Mold/ProductionCount/${moldCode}`)
      return res?.count ?? 0
    },
  },
})
