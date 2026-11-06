import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'

const mapDeployFields = (t) => ({
  ...t,
  deployStatus: t.deployStatus || 'none',
  deployDate: t.deployDate || null,
  commitUi: t.commitUi || null,
  commitApi: t.commitApi || null
})

export const useTicketStore = defineStore('ticket', {
  state: () => ({
    dataList: [],
    total: 0,
    openCount: 0,
    myUnreadCount: 0
  }),

  actions: {
    async createTicket(formData) {
      return await api.jewelry.post('Ticket/CreateTicket', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    },

    async fetchMyTickets(params) {
      return await api.jewelry.post('Ticket/MyTicket', params)
    },

    async searchTickets(params) {
      const res = await api.jewelry.post('Ticket/SearchTicket', params)
      if (res?.data) res.data = res.data.map(mapDeployFields)
      return res
    },

    async updateStatus(ticketId, status) {
      return await api.jewelry.post('Ticket/UpdateStatus', { ticketId, status })
    },

    async updateCommit({ ticketId, deployStatus, commitUi, commitApi }) {
      return await api.jewelry.post('Ticket/UpdateCommit', { ticketId, deployStatus, commitUi, commitApi })
    },

    async updateDev(ticketId, devAnalysis, devResponse) {
      return await api.jewelry.post('Ticket/UpdateDev', { ticketId, devAnalysis, devResponse })
    },

    async addTicketLog(ticketId, detail) {
      return await api.jewelry.post('Ticket/AddLog', { ticketId, detail })
    },

    async addTicketComment(ticketId, type, message) {
      return await api.jewelry.post('Ticket/AddComment', { ticketId, type, message })
    },

    async addMyTicketComment(ticketId, message) {
      return await api.jewelry.post('Ticket/AddMyComment', { ticketId, message })
    },

    async deleteTicketComment(commentId) {
      return await api.jewelry.post('Ticket/DeleteComment', { commentId })
    },

    async deleteMyTicketComment(commentId) {
      return await api.jewelry.post('Ticket/DeleteMyComment', { commentId })
    },

    async markTicketAsRead(ticketId) {
      return await api.jewelry.post('Ticket/MarkAsRead', { ticketId }, { skipLoading: true })
    },

    async fetchOpenCount() {
      const res = await api.jewelry.post('Ticket/CountOpen', {}, { skipLoading: true })
      this.openCount = typeof res === 'number' ? res : 0
      return this.openCount
    },

    async fetchMyUnreadCount() {
      const res = await api.jewelry.post('Ticket/CountMyUnread', {}, { skipLoading: true })
      this.myUnreadCount = typeof res === 'number' ? res : 0
      return this.myUnreadCount
    },

    async fetchDashboard(params) {
      return await api.jewelry.post('Ticket/Dashboard', params)
    }
  }
})
