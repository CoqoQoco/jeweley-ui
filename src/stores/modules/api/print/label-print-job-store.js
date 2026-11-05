import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'
import axiosPublic from '@/axios/axios-public.js'
import { storage } from '@/services/storage.js'
import { error as showError } from '@/services/alert/sweetAlerts.js'

// คีย์เครื่อง (device key) ของหน้า /label-station — เก็บต่อเครื่อง ไม่ผูกกับ login
export const LABEL_STATION_DEVICE_KEY_STORAGE_KEY = 'label-station-device-key'

// คิวพิมพ์ป้ายวัตถุดิบข้าม device — แยกจากคิวใบเสร็จ (print-job-store.js) โดยสิ้นเชิง
// แผนกอื่น enqueue เข้า DB แล้วคอมกลางที่ต่อเครื่องพิมพ์ป้าย (หน้า /label-station) poll fetchClaim ไปพิมพ์จริง
export const useLabelPrintJobApiStore = defineStore('labelPrintJob', {
  state: () => ({
    // true เมื่อ API ตอบ 401 (คีย์ผิด/ถูกเปลี่ยน) — หน้า station ดูค่านี้เพื่อกลับไปหน้าใส่คีย์
    keyInvalid: false
  }),

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

    // ข้อยกเว้นกฎ "ห้าม try-catch ครอบ API call": endpoint ของ station ใช้ X-Device-Key แทน JWT จึงต้องเรียกผ่าน
    // axios-public (ไม่มี interceptor — กัน interceptor กลางที่ logout + เด้งไป /login เมื่อเจอ 401)
    // จึงต้อง catch เองที่นี่ที่เดียว: 401 = ล้างคีย์ + ตั้ง keyInvalid, error อื่นแสดง modal ตาม skipError
    async stationPost(url, param, { skipError = false } = {}) {
      try {
        const res = await axiosPublic.post(url, param, {
          headers: { 'X-Device-Key': storage.getItem(LABEL_STATION_DEVICE_KEY_STORAGE_KEY, '') }
        })
        return res.data
      } catch (error) {
        if (error?.response?.status === 401) {
          storage.removeItem(LABEL_STATION_DEVICE_KEY_STORAGE_KEY)
          this.keyInvalid = true
        } else if (!skipError) {
          const msg = error?.response?.data?.message
          showError(msg || 'เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง', `Error Code: ${error?.response?.status || 'Unknown'}`)
        }
        error.handledByAxios = true
        throw error
      }
    },

    async fetchList({ take = 10, skip = 0, sort = [], search = {}, skipError = false } = {}) {
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
      return await this.stationPost('LabelPrint/List', param, { skipError })
    },

    async fetchClaim({ stationId, labelType }) {
      return await this.stationPost('LabelPrint/Claim', { stationId, labelType })
    },

    async fetchAck({ id, success, errorMessage }) {
      return await this.stationPost('LabelPrint/Ack', { id, success, errorMessage })
    },

    async fetchRetry({ id }) {
      return await this.stationPost('LabelPrint/Retry', { id })
    },

    async fetchDelete({ id }) {
      return await this.stationPost('LabelPrint/Delete', { id })
    }
  }
})
