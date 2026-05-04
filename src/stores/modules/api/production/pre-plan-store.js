import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'

export const usePrePlanStore = defineStore('prePlan', {
  state: () => ({
    prePlanList: [],
    prePlanTotal: 0,
    prePlanDetail: null,
  }),

  actions: {
    async searchPrePlan(payload) {
      const res = await api.jewelry.post('ProductionPrePlan/Search', payload)
      if (res) {
        this.prePlanList = res.data || res || []
        this.prePlanTotal = res.total || (res.data ? res.data.length : 0)
      }
    },

    async getPrePlan(id) {
      const res = await api.jewelry.get(`ProductionPrePlan/Get/${id}`)
      if (res) {
        this.prePlanDetail = res
      }
      return res
    },

    async createPrePlan(payload) {
      return await api.jewelry.post('ProductionPrePlan/Create', payload)
    },

    async updatePrePlan(id, payload) {
      return await api.jewelry.post(`ProductionPrePlan/Update/${id}`, payload)
    },

    async submitPrePlan(id) {
      return await api.jewelry.post(`ProductionPrePlan/Submit/${id}`, { id })
    },

    async approvePrePlan(id, payload) {
      return await api.jewelry.post(`ProductionPrePlan/Approve/${id}`, payload)
    },

    async rejectPrePlan(id, payload) {
      return await api.jewelry.post(`ProductionPrePlan/Reject/${id}`, payload)
    },

    async consumePrePlan(id, payload) {
      return await api.jewelry.post(`ProductionPrePlan/Consume/${id}`, payload)
    },
  },
})
