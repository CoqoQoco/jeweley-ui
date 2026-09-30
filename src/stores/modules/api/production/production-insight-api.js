import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'
import { formatISOString } from '@/services/utils/dayjs.js'

// Store แบบ stateless (ตาม pattern executive-report-api.js) — คืน response ตรงๆ ไม่เก็บ state กลาง
// เพราะแต่ละ topic tab (wip/delivery/capacity/gold/workers/materials) ถือ state ของตัวเองใน component
export const useProductionInsightApiStore = defineStore('productionInsightApi', {
  state: () => ({}),

  actions: {
    async fetchWip({ staleDays = 180, riskWindowDays = 30, start = null, end = null, growthThresholdPercent = 20 } = {}) {
      return await api.jewelry.post('ProductionInsight/Wip', {
        staleDays,
        riskWindowDays,
        start: start ? formatISOString(start) : null,
        end: end ? formatISOString(end) : null,
        growthThresholdPercent
      })
    },

    // พัฒนาการงานค้างแยกแผนกต่อช่วงเวลา (ใช้ป้อนการ์ด sparkline + กราฟรายละเอียด + ตารางเปรียบเทียบ)
    async fetchWipTrend({ start, end, bucket = 'week' } = {}) {
      return await api.jewelry.post('ProductionInsight/WipTrend', {
        start: start ? formatISOString(start) : null,
        end: end ? formatISOString(end) : null,
        bucket
      })
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
