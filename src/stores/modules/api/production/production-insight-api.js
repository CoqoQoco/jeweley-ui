import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'

// Store แบบ stateless (ตาม pattern executive-report-api.js) — คืน response ตรงๆ ไม่เก็บ state กลาง
// เพราะแต่ละ topic tab (wip/delivery/capacity/gold/workers/materials) ถือ state ของตัวเองใน component
export const useProductionInsightApiStore = defineStore('productionInsightApi', {
  state: () => ({}),

  actions: {
    async fetchWip({ staleDays = 180, riskWindowDays = 30 } = {}) {
      return await api.jewelry.post('ProductionInsight/Wip', { staleDays, riskWindowDays })
    },

    // contract เดียวกับ ExecutiveReport/StalePlans เดิม
    async fetchStalePlans({ take = 50, skip = 0, sort = [], minDays = 180, departmentKeys = [] } = {}) {
      return await api.jewelry.post('ProductionInsight/StalePlans', { take, skip, sort, minDays, departmentKeys })
    },

    // DataSourceRequest + mode — items = StalePlans item + dueDate/daysToDue
    async fetchDueRiskPlans({ take = 50, skip = 0, sort = [], mode = 'overdue', departmentKeys = [], riskWindowDays = 30 } = {}) {
      return await api.jewelry.post('ProductionInsight/DueRiskPlans', { take, skip, sort, mode, departmentKeys, riskWindowDays })
    }
  }
})
