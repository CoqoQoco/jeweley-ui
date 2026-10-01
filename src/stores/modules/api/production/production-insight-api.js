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
    },

    // หมวด "ส่งงานตรงเวลา" — draftTargetPercent ส่งเฉพาะตอนกำลังแก้ไขเป้าในแผง "ตั้งเป้าส่งตรงเวลา" (ยังไม่
    // บันทึก) ให้ kpi/series คำนวณ preview แบบ real-time (เหมือน draftStandards ของ StageLeadTime)
    async fetchDelivery({ start, end, bucket = 'week', riskHorizonDays = 30, draftTargetPercent } = {}) {
      return await api.jewelry.post('ProductionInsight/Delivery', {
        start: start ? formatISOString(start) : null,
        end: end ? formatISOString(end) : null,
        bucket,
        riskHorizonDays,
        draftTargetPercent: draftTargetPercent ?? undefined
      })
    },

    // DataSourceRequest — items = stale-plan base fields + requestDate/currentDeptKey/daysInCurrentDept/
    // remainingDays/projectedFinishDate/projectedLateDays
    async fetchDeliveryAtRiskPlans({ take = 50, skip = 0, sort = [], riskHorizonDays = 30, departmentKeys = [] } = {}) {
      return await api.jewelry.post('ProductionInsight/DeliveryAtRiskPlans', { take, skip, sort, riskHorizonDays, departmentKeys })
    },

    // DataSourceRequest + ช่วงเวลา — items = base + requestDate/doneDate/lateDays
    async fetchDeliveryLatePlans({ start, end, take = 50, skip = 0, sort = [] } = {}) {
      return await api.jewelry.post('ProductionInsight/DeliveryLatePlans', {
        start: start ? formatISOString(start) : null,
        end: end ? formatISOString(end) : null,
        take,
        skip,
        sort
      })
    },

    // DataSourceRequest — items = base + costCardDate/daysSinceCostCard
    async fetchStuckAfterCostCardPlans({ take = 50, skip = 0, sort = [] } = {}) {
      return await api.jewelry.post('ProductionInsight/StuckAfterCostCardPlans', { take, skip, sort })
    },

    async fetchDeliveryTarget() {
      return await api.jewelry.get('ProductionInsight/DeliveryTarget')
    },

    async fetchDeliveryTargetHistory() {
      return await api.jewelry.get('ProductionInsight/DeliveryTargetHistory')
    },

    // ต้องมีสิทธิ์ production:standard-edit — เช็คฝั่ง UI ก่อนเรียกเสมอ (ดู delivery-target-panel.vue)
    async saveDeliveryTarget({ targetPercent, remark }) {
      return await api.jewelry.post('ProductionInsight/SaveDeliveryTarget', { targetPercent, remark })
    },

    // หมวด "ทองและ Loss" — workerTypes เป็นเลขรหัสประเภทช่าง (50=ช่างแต่ง/80=ช่างฝัง) — metal 'GOLD'|'SILVER'
    // (default 'GOLD') กรองที่ request ทั้งก้อน kpi/series/targets/workers ของ response จึงเป็นของโลหะเดียวนั้น
    // เสมอ (ไม่ผสมทอง/เงินในตัวเลขเดียวกัน ราคาเงินคงที่ 40 ฿/กรัม ต่างจากทองที่แยกราคาตามกะรัต) — kpi[]/
    // targets[] มี metal แนบมาด้วยต่อแถว (ค่าเดียวกับที่ขอ ไม่มีผสมข้ามโลหะ) ส่วน series[]/workers[] ไม่มี
    // (ยืนยันแล้วจาก API agent 2026-10-01) — draftTargets items = {workerType,metal,targetPercent} ส่งเฉพาะ
    // ตอนกำลังแก้ไขเป้าในแผง "ตั้งเป้า Loss" (ยังไม่บันทึก) ให้ kpi/series คำนวณ preview แบบ real-time
    async fetchGold({ start, end, bucket = 'week', workerTypes = [], workerCodes = [], metal = 'GOLD', draftTargets } = {}) {
      return await api.jewelry.post('ProductionInsight/Gold', {
        start: start ? formatISOString(start) : null,
        end: end ? formatISOString(end) : null,
        bucket,
        workerTypes: (workerTypes || []).map(Number),
        workerCodes,
        metal,
        draftTargets: draftTargets && draftTargets.length ? draftTargets : undefined
      })
    },

    // DataSourceRequest + workerTypes/workerCodes/metal/start/end — items = GoldOverSlips (slipId,documentNo,...)
    // — start/end ต้องส่งเสมอ (ช่วงเดียวกับ Gold) กัน request ไม่มีช่วงเวลาแล้วได้ 0 แถวเงียบๆ
    async fetchGoldOverSlips({ take = 50, skip = 0, sort = [], workerTypes = [], workerCodes = [], metal = 'GOLD', start, end } = {}) {
      return await api.jewelry.post('ProductionInsight/GoldOverSlips', {
        take,
        skip,
        sort,
        workerTypes: (workerTypes || []).map(Number),
        workerCodes,
        metal,
        start: start ? formatISOString(start) : null,
        end: end ? formatISOString(end) : null
      })
    },

    // DataSourceRequest + workerTypes/workerCodes/olderThanDays/metal/start/end — items = GoldUncoveredJobs
    // — start/end เป็น required (ช่วงเดียวกับ Gold, range-scoped ฝั่ง backend แล้ว กันโชว์งานเก่าเกินช่วงที่
    // เลือก) olderThanDays เป็นตัวกรองเสริมแยกต่างหาก ไม่ใช่ตัวกำหนดช่วงเวลาหลัก
    async fetchGoldUncoveredJobs({ take = 50, skip = 0, sort = [], workerTypes = [], workerCodes = [], olderThanDays = 14, metal = 'GOLD', start, end } = {}) {
      return await api.jewelry.post('ProductionInsight/GoldUncoveredJobs', {
        take,
        skip,
        sort,
        workerTypes: (workerTypes || []).map(Number),
        workerCodes,
        olderThanDays,
        metal,
        start: start ? formatISOString(start) : null,
        end: end ? formatISOString(end) : null
      })
    },

    // คืน [{workerType,metal,targetPercent,effectiveFrom,createBy,remark}] ครบทั้ง 4 ชุด (ไม่กรองตาม metal
    // ที่กำลังดูอยู่ — ใช้เติมแผง "ตั้งเป้า Loss" ที่แก้ได้ทั้ง 4 แถวพร้อมกัน)
    async fetchGoldLossTargets() {
      return await api.jewelry.get('ProductionInsight/GoldLossTargets')
    },

    async fetchGoldLossTargetHistory(workerType, metal = 'GOLD') {
      return await api.jewelry.get('ProductionInsight/GoldLossTargetHistory', { workerType, metal })
    },

    // items = [{workerType,metal,targetPercent}] — ต้องมีสิทธิ์ production:standard-edit — เช็คฝั่ง UI ก่อน
    // เรียกเสมอ (ดู gold-target-panel.vue)
    async saveGoldLossTargets({ items, remark }) {
      return await api.jewelry.post('ProductionInsight/SaveGoldLossTargets', { items, remark })
    }
  }
})
