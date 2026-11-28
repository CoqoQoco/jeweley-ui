import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'

// API ตอบ error เป็นข้อความล้วน (400/404/409) — ปิด popup กลางแล้วให้หน้าแสดงข้อความ/สถานะเอง
const OPTIONS = { skipError: true }

export const useAiAdminStore = defineStore('aiAdmin', {
  actions: {
    async listUsers() {
      return await api.jewelry.post('AiAdmin/Users', {}, OPTIONS)
    },

    async listConnections(userId) {
      return await api.jewelry.post('AiAdmin/Connections', { userId }, OPTIONS)
    },

    async revokeConnection(tokenId) {
      return await api.jewelry.post('AiAdmin/RevokeConnection', { tokenId }, OPTIONS)
    },

    async setGrant(params) {
      return await api.jewelry.post('AiAdmin/SetGrant', params, OPTIONS)
    },

    async suspend(params) {
      return await api.jewelry.post('AiAdmin/Suspend', params, OPTIONS)
    },

    async lift(userId) {
      return await api.jewelry.post('AiAdmin/Lift', { userId }, OPTIONS)
    },

    async searchAccessLog(params) {
      return await api.jewelry.post('AiAdmin/AccessLog', params, OPTIONS)
    },

    async searchSuspensions(params) {
      return await api.jewelry.post('AiAdmin/Suspensions', params, OPTIONS)
    }
  }
})
