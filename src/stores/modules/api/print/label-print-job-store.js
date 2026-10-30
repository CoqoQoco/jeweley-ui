import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'

// คิวพิมพ์ป้ายวัตถุดิบข้าม device — แยกจากคิวใบเสร็จ (print-job-store.js) โดยสิ้นเชิง
// แผนกอื่น enqueue เข้า DB แล้วคอมกลางที่ต่อเครื่องพิมพ์ป้าย (หน้า /label-station) poll fetchClaim ไปพิมพ์จริง
export const useLabelPrintJobApiStore = defineStore('labelPrintJob', {
  state: () => ({}),

  actions: {
    // skipError:true — caller แสดงข้อความแจ้งเตือนของตัวเองเวลา enqueue ล้มเหลว
    async fetchEnqueue({ labelType, referenceCode, payload, copies }) {
      try {
        const param = { labelType, referenceCode, payload, copies }
        return await api.jewelry.post('LabelPrint/Enqueue', param, { skipLoading: true, skipError: true })
      } catch (error) {
        console.error('Error enqueueing label print job:', error)
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
            referenceCode: search.referenceCode || null,
            labelType: search.labelType || null,
            createBy: search.createBy || null,
            status: search.status || null,
            includeDeleted: search.includeDeleted || false
          }
        }
        return await api.jewelry.post('LabelPrint/List', param, { skipLoading, skipError })
      } catch (error) {
        console.error('Error fetching label print job list:', error)
        throw error
      }
    },

    async fetchClaim({ stationId, labelType }) {
      try {
        const param = { stationId, labelType }
        return await api.jewelry.post('LabelPrint/Claim', param, { skipLoading: true })
      } catch (error) {
        console.error('Error claiming label print job:', error)
        throw error
      }
    },

    async fetchAck({ id, success, errorMessage }) {
      try {
        const param = { id, success, errorMessage }
        return await api.jewelry.post('LabelPrint/Ack', param, { skipLoading: true })
      } catch (error) {
        console.error('Error acknowledging label print job:', error)
        throw error
      }
    },

    async fetchRetry({ id }) {
      try {
        const param = { id }
        return await api.jewelry.post('LabelPrint/Retry', param, { skipLoading: true })
      } catch (error) {
        console.error('Error retrying label print job:', error)
        throw error
      }
    },

    async fetchDelete({ id }) {
      try {
        const param = { id }
        return await api.jewelry.post('LabelPrint/Delete', param, { skipLoading: true })
      } catch (error) {
        console.error('Error deleting label print job:', error)
        throw error
      }
    }
  }
})
