import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'

const emptyHistory = () => ({ series: 'bar-sell', items: [], isStale: false })

// gold-price-store — ราคาทองวันนี้ + ย้อนหลังของแท็บ "🪙 ราคาทองวันนี้" บนหน้าแรก
//
// โหลดแบบ lazy — gold-price-panel.vue เรียก loadGoldPriceTab() ตอน mounted() เท่านั้น
// (mount ครั้งแรกที่เปิดแท็บ ผ่าน TabViewGeneric lazy) ไม่ได้อยู่ใน home-dashboard-store
// เพราะต้อง "ไม่ยิง API ตอนหน้าแรกโหลด" — แท็บ default คือข่าวประกาศ
//
// loadToday()/loadHistory() ข้าม fetch ถ้า status เป็น 'loaded' หรือ 'loading' อยู่แล้ว
// (กันยิงซ้ำเมื่อสลับแท็บไปมา หรือ component remount) — 'error' ไม่ถูกกันไว้ จึงใช้เมธอดเดียวกัน
// เป็นปุ่ม "ลองใหม่" ได้เลย
export const useGoldPriceStore = defineStore('goldPrice', {
  state: () => ({
    today: null,
    todayStatus: 'idle', // idle | loading | loaded | error
    history: emptyHistory(),
    historyStatus: 'idle' // idle | loading | loaded | error
  }),

  actions: {
    async fetchToday() {
      this.todayStatus = 'loading'
      const res = await api.jewelry
        .post('GoldPrice/Today', {}, { skipLoading: true, skipError: true })
        .catch(() => null)

      if (res && res.date) {
        this.today = res
        this.todayStatus = 'loaded'
      } else {
        this.today = null
        this.todayStatus = 'error'
      }
    },

    async fetchHistory() {
      this.historyStatus = 'loading'
      const res = await api.jewelry
        .post('GoldPrice/History', { months: 24 }, { skipLoading: true, skipError: true })
        .catch(() => null)

      if (res && Array.isArray(res.items)) {
        this.history = { series: res.series || 'bar-sell', items: res.items, isStale: !!res.isStale }
        this.historyStatus = 'loaded'
      } else {
        this.history = emptyHistory()
        this.historyStatus = 'error'
      }
    },

    async loadToday() {
      if (this.todayStatus === 'loaded' || this.todayStatus === 'loading') return
      await this.fetchToday()
    },

    async loadHistory() {
      if (this.historyStatus === 'loaded' || this.historyStatus === 'loading') return
      await this.fetchHistory()
    },

    async loadGoldPriceTab() {
      await Promise.allSettled([this.loadToday(), this.loadHistory()])
    }
  }
})
