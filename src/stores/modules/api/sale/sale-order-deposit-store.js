import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'

export const usrSaleOrderDepositApiStore = defineStore('saleOrderDeposit', {
  state: () => ({}),
  actions: {
    // เรียกอัตโนมัติได้ (mount หน้า SO / เปิด modal ออก invoice) — ต้องไม่ throw ให้ caller พังเงียบๆ
    // axios-helper แสดง error popup ให้ผู้ใช้อยู่แล้วในตัว interceptor ก่อนตกมาถึง catch นี้
    async fetchList({ soNumber }, { skipLoading = true } = {}) {
      try {
        return await api.jewelry.post('SaleOrderDeposit/List', { soNumber }, { skipLoading })
      } catch (error) {
        console.error('Error fetching sale order deposit list:', error)
        return {
          soNumber,
          currencyUnit: 'THB',
          totalReceived: 0,
          totalApplied: 0,
          balance: 0,
          deposits: []
        }
      }
    },

    async fetchCreate(formData) {
      return await api.jewelry.post('SaleOrderDeposit/Create', formData, {
        skipLoading: false,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    },

    async fetchDelete({ running, deleteReason }) {
      return await api.jewelry.post('SaleOrderDeposit/Delete', { running, deleteReason })
    }
  }
})
