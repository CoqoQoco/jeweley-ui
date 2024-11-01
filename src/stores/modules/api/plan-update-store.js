// stores/modules/api/plan-search-store.js
import { defineStore } from 'pinia'
import api from '@/services/utils/api.js'
import swAlert from '@/services/alert/sweetAlerts.js'

export const usePlanUpdateApiStore = defineStore('planUpdate', {
  state: () => ({
    // ... state อื่นๆ
  }),

  actions: {
    // ... actions อื่นๆ

    async submitTransfer({ formerStatus, targetStatus, transferBy, selectedItems }) {
      try {
        const param = {
          formerStatus,
          targetStatus,
          transferBy,
          plans: selectedItems.map((item) => ({
            wo: item.wo,
            woNumber: item.woNumber,
            id: item.id
          }))
        }

        const res = await api.jewelry.post('Production/Plan/Transfer', param)
        if (res) {
          if (res.errors.length > 0) {
            const msg = res.errors
              .map((item) => `${item.wo}-${item.woNumber} : ${item.message}`)
              .join('<br>')
            swAlert.warning(msg, `พบข้อผิดพลาด`, () => {
              return { success: true }
            })
          } else {
            return { success: true }
          }
        }
      } catch (error) {
        console.error('Error submitting transfer:', error)
        return { success: false, message: 'เกิดข้อผิดพลาดในการทำรายการ' }
      }
    }
  }
})
