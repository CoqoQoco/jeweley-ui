import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'

export const useExportShipmentStore = defineStore('exportShipment', {
  state: () => ({
    dataList: {
      data: [],
      total: 0
    }
  }),

  actions: {
    async generateNumber() {
      return await api.jewelry.post('ExportShipment/GenerateNumber', {})
    },

    async upsert(payload) {
      return await api.jewelry.post('ExportShipment/Upsert', payload)
    },

    async get(running) {
      return await api.jewelry.get(`ExportShipment/Get/${running}`)
    },

    async list({ take = 10, skip = 0, sort = [], search = {} } = {}) {
      const request = { take, skip, sort, search }
      const res = await api.jewelry.post('ExportShipment/List', request)

      if (res) {
        this.dataList = {
          data: res.data || [],
          total: res.total || 0
        }
      }

      return this.dataList
    },

    async deleteDocument(running) {
      return await api.jewelry.put(`ExportShipment/Delete/${running}`)
    },

    async addItems(payload) {
      return await api.jewelry.post('ExportShipment/AddItems', payload)
    },

    async removeItems(payload) {
      return await api.jewelry.post('ExportShipment/RemoveItems', payload)
    }
  }
})
