import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'
import { formatISOString } from '@/services/utils/dayjs.js'

export const useGemReturnApiStore = defineStore('gemReturnApi', {
  actions: {
    async returnFromPlan(body) {
      return await api.jewelry.post('ReceiptAndIssueStockGem/ReturnFromPlan', body)
    },

    // productionPlanId (ถ้าส่ง) ทำให้ API ใส่ matchesPlan ต่อบรรทัดและเรียงที่ตรงใบงานขึ้นก่อน
    async listLinkableInbound(gemCode, productionPlanId = null) {
      const res = await api.jewelry.post('ReceiptAndIssueStockGem/ListLinkableInbound', {
        gemCode,
        productionPlanId
      })
      return res ?? []
    },

    // items: [{ code, wo, woNumber }] -> [{ code, wo, woNumber, outboundRunning, outboundDate, qty, weight }]
    // เป็นแค่คำเตือน: ล้มเหลวต้องไม่บล็อกการเบิกพลอย จึงข้ามเงียบๆ แล้วคืน []
    async checkDuplicateOutbound(items) {
      try {
        const res = await api.jewelry.post(
          'ReceiptAndIssueStockGem/CheckDuplicateOutbound',
          { items },
          { skipError: true, skipLoading: true }
        )
        return res ?? []
      } catch {
        return []
      }
    },

    async listUnlinkedReturn({ take = 10, skip = 0, sort = [], formValue = {} } = {}) {
      const res = await api.jewelry.post('ReceiptAndIssueStockGem/ListUnlinkedReturn', {
        take,
        skip,
        sort,
        search: {
          requestDateStart: formValue.requestDateStart ? formatISOString(formValue.requestDateStart) : null,
          requestDateEnd: formValue.requestDateEnd ? formatISOString(formValue.requestDateEnd) : null
        }
      })
      return res ?? { data: [], total: 0 }
    }
  }
})
