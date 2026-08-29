import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'

export const useGoldLossTangStore = defineStore('goldLossTang', {
  state: () => ({}),

  actions: {
    async searchJobs(params) {
      return await api.jewelry.post('Worker/SearchGoldLossTangJobs', params)
    },

    async createSlip(payload) {
      return await api.jewelry.post('Worker/CreateGoldLossTangSlip', payload)
    },

    async listSlips({ take = 10, skip = 0, sort = [], search = {} } = {}) {
      return await api.jewelry.post('Worker/ListGoldLossTangSlip', { take, skip, sort, search })
    },

    async getSlip(id) {
      return await api.jewelry.post('Worker/GetGoldLossTangSlip', { id })
    },

    async cancelSlip(id) {
      return await api.jewelry.post('Worker/CancelGoldLossTangSlip', { id })
    },

    async updateSlip(payload) {
      return await api.jewelry.post('Worker/UpdateGoldLossTangSlip', payload)
    },

    async getLineOptions() {
      return await api.jewelry.post('Worker/GetGoldLossTangLineOptions', {})
    }
  }
})
