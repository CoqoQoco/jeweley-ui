import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'

export const useMoldPlanStore = defineStore('moldPlan', {
  actions: {
    async fetchPlan(id) {
      return await api.jewelry.get('Mold/PlanGet', { id })
    },

    async updateGems(payload) {
      return await api.jewelry.post('Mold/PlanGems', payload)
    },

    async meltPlan(id) {
      return await api.jewelry.post('Mold/PlanMelting', { id })
    },

    async fetchMasterGem() {
      return await api.jewelry.get('Master/MasterGem')
    },

    async fetchMasterGemShape() {
      return await api.jewelry.get('Master/MasterGemShape')
    },

    async updateMoldCode(payload) {
      return await api.jewelry.post('Mold/PlanMoldCode', payload)
    },

    async updateStageImage(formData) {
      return await api.jewelry.post('Mold/PlanStageImage', formData)
    }
  }
})
