import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'

export const useAnnouncementStore = defineStore('announcement', {
  state: () => ({
    dataList: [],
    total: 0
  }),

  actions: {
    async searchAnnouncements(params) {
      return await api.jewelry.post('Announcement/Search', params)
    },

    async getAnnouncement(id) {
      return await api.jewelry.post('Announcement/Get', { id })
    },

    async createAnnouncement(formData) {
      return await api.jewelry.post('Announcement/Create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    },

    async updateAnnouncement(formData) {
      return await api.jewelry.post('Announcement/Update', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    },

    async togglePublish(id, isPublished) {
      return await api.jewelry.post('Announcement/TogglePublish', { id, isPublished })
    },

    async deleteAnnouncement(id) {
      return await api.jewelry.post('Announcement/Delete', { id })
    }
  }
})
