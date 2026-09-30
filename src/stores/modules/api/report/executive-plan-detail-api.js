import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'

// Store แบบ stateless (ตาม pattern production-insight-api.js) — คืน response ตรงๆ ไม่เก็บ state กลาง ใช้
// เฉพาะหน้า executive/plan-detail (read-only สำหรับ boss ที่มี executive:view แต่ไม่มี production:edit) —
// อ่านอย่างเดียวทุก action ไม่มี endpoint เขียนข้อมูลเลย
export const useExecutivePlanDetailApiStore = defineStore('executivePlanDetailApi', {
  state: () => ({}),

  actions: {
    async fetchPlan(id) {
      return await api.jewelry.get('ProductionPlan/ProductionPlanGet', { id })
    },

    async fetchMaterial(id) {
      return await api.jewelry.post('ProductionPlan/ProductionPlanMateriaGet', { id })
    },

    // planNumber = "{wo}-{woNumber}" ตาม convention เดิมของ plan-search-store.js fetchDataGoldCostItem
    async fetchGoldCostItems(planNumber) {
      return await api.jewelry.post('ProductionPlanCost/ListGoldCostItem', {
        take: 0,
        skip: 0,
        sort: [],
        search: { ProductionPlanNumber: planNumber }
      })
    }
  }
})
