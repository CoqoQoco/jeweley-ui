import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'
import { useMetalScopeStore } from '@/stores/modules/ui/metal-scope-store.js'

// ทุก POST เติม `metal` (GOLD|SILVER|ALL ของทั้งหน้า /executive) ให้ request body อัตโนมัติ — ค่าที่ caller ส่งมาเองชนะ
// (เช่นหมวดทองที่กำหนด metal เอง) — Save* ไม่เติมเพราะไม่ใช่ query
const postScoped = (path, body) => api.jewelry.post(path, useMetalScopeStore().scoped(body))

// Store แบบ stateless (ตาม pattern sale-order-deposit-store.js) — คืน response ตรงๆ ไม่เก็บ state กลาง
// เพราะหน้านี้มีทั้งตารางแบบ paged (แสดงบนจอ) และ export Excel เต็มชุด (take สูง) ที่ยิง endpoint เดียวกัน
// ถ้าเก็บ state กลางไว้ใน store จะโดน export ทับค่าที่ตารางบนจอใช้แสดงผลอยู่
export const useExecutiveReportApiStore = defineStore('executiveReportApi', {
  state: () => ({}),

  actions: {
    async fetchSummary() {
      return await postScoped('ExecutiveReport/Summary', {})
    },

    async fetchProductionWip() {
      return await postScoped('ExecutiveReport/ProductionWip', {})
    },

    async fetchStalePlans({ take = 50, skip = 0, sort = [], minDays = 180, departmentKeys = [] } = {}) {
      return await postScoped('ExecutiveReport/StalePlans', { take, skip, sort, minDays, departmentKeys })
    },

    async fetchReceivables({ take = 20, skip = 0, sort = [], filter = 'unpaid' } = {}) {
      return await postScoped('ExecutiveReport/Receivables', { take, skip, sort, filter })
    },

    async fetchSalesOrdersWithoutInvoice({ take = 20, skip = 0, sort = [] } = {}) {
      return await postScoped('ExecutiveReport/SalesOrdersWithoutInvoice', { take, skip, sort })
    },

    async fetchStockHealth() {
      return await postScoped('ExecutiveReport/StockHealth', {})
    },

    // Flow 3D — อ่านอย่างเดียว ไม่ผูก metal scope ของทั้งหน้า (ข้อมูลทั้งบริษัท); board ครั้งแรกที่เย็นอาจใช้ ~10 วินาที
    // แล้ว cache ฝั่ง server 5 นาที — zone ต้องเป็น mold|production|receive|stock|material|sales
    async flowBoard() {
      return await api.jewelry.post('ExecutiveReport/FlowBoard', {})
    },

    async flowZone(zone) {
      return await api.jewelry.post('ExecutiveReport/FlowZone', { zone })
    }
  }
})
