import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'

// คิวพิมพ์ใบเสร็จข้าม device — มือถือ (ต่อเครื่องพิมพ์ Bluetooth ไม่ได้ เช่น iOS) enqueue เข้า DB
// แล้วคอมที่บูธ (หน้า /print-station — งานถัดไป) poll fetchClaim ไปพิมพ์จริงผ่าน print-bridge-service.js
export const usePrintJobApiStore = defineStore('printJob', {
  state: () => ({}),

  actions: {
    // skipError:true — caller (pos-done-view.vue) แสดงข้อความแจ้งเตือนของตัวเองเวลา enqueue ล้มเหลว
    // (ข้อความ context เฉพาะ "ส่งเข้าคิวพิมพ์ไม่สำเร็จ") แทนที่จะให้ axios auto-alert ทับซ้อนกัน
    async fetchEnqueue({ invoiceNumber, payload }) {
      try {
        const param = { invoiceNumber, payload }
        return await api.jewelry.post('Print/Enqueue', param, { skipLoading: true, skipError: true })
      } catch (error) {
        console.error('Error enqueueing print job:', error)
        throw error
      }
    },

    async fetchList({
      take = 10,
      skip = 0,
      sort = [],
      search = {},
      skipLoading = false,
      skipError = false
    } = {}) {
      try {
        const param = {
          take,
          skip,
          sort: sort.map((s) => ({ field: s.field, dir: s.dir })),
          search: {
            dateFrom: search.dateFrom || null,
            dateTo: search.dateTo || null,
            invoiceNumber: search.invoiceNumber || null,
            createBy: search.createBy || null,
            status: search.status || null,
            includeDeleted: search.includeDeleted || false
          }
        }
        return await api.jewelry.post('Print/List', param, { skipLoading, skipError })
      } catch (error) {
        console.error('Error fetching print job list:', error)
        throw error
      }
    },

    async fetchClaim({ stationId }) {
      try {
        const param = { stationId }
        return await api.jewelry.post('Print/Claim', param, { skipLoading: true })
      } catch (error) {
        console.error('Error claiming print job:', error)
        throw error
      }
    },

    async fetchAck({ id, success, errorMessage }) {
      try {
        const param = { id, success, errorMessage }
        return await api.jewelry.post('Print/Ack', param, { skipLoading: true })
      } catch (error) {
        console.error('Error acknowledging print job:', error)
        throw error
      }
    },

    async fetchRetry({ id }) {
      try {
        const param = { id }
        return await api.jewelry.post('Print/Retry', param, { skipLoading: true })
      } catch (error) {
        console.error('Error retrying print job:', error)
        throw error
      }
    },

    async fetchDelete({ id }) {
      try {
        const param = { id }
        return await api.jewelry.post('Print/Delete', param, { skipLoading: true })
      } catch (error) {
        console.error('Error deleting print job:', error)
        throw error
      }
    }
  }
})
