import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    count: 0,
    countByModule: [],
    list: [],
    total: 0
  }),

  actions: {
    async fetchCount() {
      const res = await api.jewelry.post('Notification/MyCount', {}, { skipLoading: true })
      this.count = res?.total || 0
      this.countByModule = res?.list || []
      return res
    },

    async fetchList(params) {
      const res = await api.jewelry.post('Notification/MyList', params)
      this.list = res?.list || []
      this.total = res?.total || 0
      return res
    },

    async markRead(ids) {
      const res = await api.jewelry.post('Notification/MarkRead', { ids, all: false })
      await this.fetchCount()
      return res
    },

    async markReadAll() {
      const res = await api.jewelry.post('Notification/MarkRead', { ids: [], all: true })
      await this.fetchCount()
      return res
    },

    async markDone(id) {
      const res = await api.jewelry.post('Notification/MarkDone', { id })
      await this.fetchCount()
      return res
    },

    async snooze(id, days) {
      const res = await api.jewelry.post('Notification/Snooze', { id, days })
      await this.fetchCount()
      return res
    }
  }
})
