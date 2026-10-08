import { defineStore } from 'pinia'
import { DEFAULT_METAL_SCOPE, withMetalScope } from '@/services/utils/metal-scope.js'

// โลหะที่เลือกทั้งหน้า /executive (GOLD | SILVER | ALL) — เจ้าของค่า = executive index-view.vue; store ฝั่ง API
// (production-insight-api / executive-report-api) อ่านค่านี้เติม `metal` ให้ทุก request เอง กัน component ต้องส่งต่อทุกจุด
export const useMetalScopeStore = defineStore('metalScope', {
  state: () => ({ metal: DEFAULT_METAL_SCOPE }),

  actions: {
    setMetal(metal) {
      this.metal = metal
    },

    // เติม metal ให้ request body (ถ้ายังไม่มี)
    scoped(body) {
      return withMetalScope(body, this.metal)
    }
  }
})
