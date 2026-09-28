import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'

// Store แบบ stateless (ตาม pattern sale-order-deposit-store.js) — คืน response ตรงๆ ไม่เก็บ state กลาง
// เพราะหน้านี้มีทั้งตารางแบบ paged (แสดงบนจอ) และ export Excel เต็มชุด (take สูง) ที่ยิง endpoint เดียวกัน
// ถ้าเก็บ state กลางไว้ใน store จะโดน export ทับค่าที่ตารางบนจอใช้แสดงผลอยู่
export const useExecutiveReportApiStore = defineStore('executiveReportApi', {
  state: () => ({}),

  actions: {
    async fetchSummary() {
      return await api.jewelry.post('ExecutiveReport/Summary', {})
    },

    async fetchProductionWip() {
      return await api.jewelry.post('ExecutiveReport/ProductionWip', {})
    },

    async fetchStalePlans({ take = 50, skip = 0, sort = [], minDays = 180, departmentKeys = [] } = {}) {
      return await api.jewelry.post('ExecutiveReport/StalePlans', { take, skip, sort, minDays, departmentKeys })
    },

    async fetchReceivables({ take = 20, skip = 0, sort = [], filter = 'unpaid' } = {}) {
      return await api.jewelry.post('ExecutiveReport/Receivables', { take, skip, sort, filter })
    },

    async fetchSalesOrdersWithoutInvoice({ take = 20, skip = 0, sort = [] } = {}) {
      return await api.jewelry.post('ExecutiveReport/SalesOrdersWithoutInvoice', { take, skip, sort })
    },

    async fetchStockHealth() {
      return await api.jewelry.post('ExecutiveReport/StockHealth', {})
    }
  }
})
