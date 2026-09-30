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
    },

    // เวลาผลิตรายแผนก (รอ/ทำ) เทียบมาตรฐาน + ผลต่อกำลังการผลิต — draftStandards ส่งเฉพาะตอนกำลังแก้ไข
    // มาตรฐานในแผง "กำหนดมาตรฐาน" (ยังไม่กดบันทึก) ให้ตาราง/การ์ดคำนวณ preview ด้วยค่าร่างแบบ real-time
    async fetchStageLeadTime({ start, end, bucket = 'week', draftStandards } = {}) {
      return await api.jewelry.post('ProductionInsight/StageLeadTime', {
        start: start ? formatISOString(start) : null,
        end: end ? formatISOString(end) : null,
        bucket,
        draftStandards: draftStandards && draftStandards.length ? draftStandards : undefined
      })
    },

    // DataSourceRequest + multiplier — items = StalePlans item + deptKey/daysInDept/waitDays/workDays/standardDays
    async fetchAbnormalDwellPlans({ take = 50, skip = 0, sort = [], departmentKeys = [], multiplier = 2 } = {}) {
      return await api.jewelry.post('ProductionInsight/AbnormalDwellPlans', { take, skip, sort, departmentKeys, multiplier })
    },

    async fetchStageStandards() {
      return await api.jewelry.get('ProductionInsight/StageStandards')
    },

    async fetchStageStandardHistory(deptKey) {
      return await api.jewelry.get('ProductionInsight/StageStandardHistory', { deptKey })
    },

    // ต้องมีสิทธิ์ production:standard-edit — เช็คฝั่ง UI ก่อนเรียกเสมอ (ดู wip-standards-panel.vue)
    async saveStageStandards({ items, remark }) {
      return await api.jewelry.post('ProductionInsight/SaveStageStandards', { items, remark })
    }
  }
})
