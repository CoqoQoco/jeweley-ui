import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'

// หน้า /oauth/authorize แสดง error ของตัวเอง (400/503) จึงปิด popup กลางของ axios-helper ด้วย skipError
const OAUTH_OPTIONS = { skipError: true }

export const useAiConnectorStore = defineStore('aiConnector', {
  actions: {
    async getInfo() {
      return await api.jewelry.get('AiConnector/Info')
    },

    async listConnections() {
      return await api.jewelry.post('AiConnector/List', {})
    },

    async revoke(id) {
      return await api.jewelry.post('AiConnector/Revoke', { id })
    },

    async createPat(params) {
      return await api.jewelry.post('AiConnector/CreatePat', params)
    },

    async searchAccessLog(params) {
      return await api.jewelry.post('AiConnector/AccessLog', params)
    },

    async getConsent(params) {
      return await api.jewelry.post('OAuth/Consent', params, OAUTH_OPTIONS)
    },

    async approve(params) {
      return await api.jewelry.post('OAuth/Authorize/Approve', params, OAUTH_OPTIONS)
    },

    async deny(params) {
      return await api.jewelry.post('OAuth/Authorize/Deny', params, OAUTH_OPTIONS)
    }
  }
})
