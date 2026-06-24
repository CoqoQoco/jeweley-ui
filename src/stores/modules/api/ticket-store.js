import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'

export const useTicketStore = defineStore('ticket', {
  state: () => ({
    dataList: [],
    total: 0
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
      return await api.jewelry.post('Ticket/SearchTicket', params)
    },

    async updateStatus(ticketId, status) {
      return await api.jewelry.post('Ticket/UpdateStatus', { ticketId, status })
    },

    async updateDev(ticketId, devAnalysis, devResponse) {
      return await api.jewelry.post('Ticket/UpdateDev', { ticketId, devAnalysis, devResponse })
    },

    async addTicketLog(ticketId, detail) {
      return await api.jewelry.post('Ticket/AddLog', { ticketId, detail })
    }
  }
})
