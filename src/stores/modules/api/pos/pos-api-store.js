import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'

export const usePosApiStore = defineStore('posApi', {
  state: () => ({}),

  actions: {
    // ปิดบิลจบใน transaction เดียว (SO + จองสต็อก + Invoice + payment) — idempotent ด้วย payload.IdempotencyKey
    async checkout(payload) {
      return await api.jewelry.post('Pos/Checkout', payload)
    }
  }
})
