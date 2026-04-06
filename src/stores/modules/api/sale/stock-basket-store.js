import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'

export const useStockBasketApiStore = defineStore('stockBasket', {
  state: () => ({
    dataSearch: {},
    dataList: {
      data: [],
      total: 0
    }
  }),
  actions: {
    async fetchUpsert({ formValue }) {
      const param = { ...formValue }
      return await api.jewelry.post('StockBasket/Upsert', param)
    },

    async fetchGet({ formValue }) {
      const param = { ...formValue }
      return await api.jewelry.post('StockBasket/Get', param)
    },

    async fetchList({ take = 10, skip = 0, sort = [], formValue = {} }) {
      const request = {
        take,
        skip,
        sort: sort.map((s) => ({ field: s.field, dir: s.dir })),
        search: {
          basketNumber: formValue.basketNumber || null,
          basketName: formValue.basketName || null,
          status: formValue.status !== null && formValue.status !== undefined ? formValue.status : null,
          responsible: formValue.responsible || null
        }
      }

      const response = await api.jewelry.post('StockBasket/List', request)

      if (response && response.data) {
        this.dataList = {
          data: [...response.data] || [],
          total: response.total || 0
        }
      }

      return this.dataList
    },

    async fetchGenerateNumber() {
      return await api.jewelry.post('StockBasket/GenerateNumber', {}, { skipLoading: false })
    },

    async fetchAddItems({ formValue }) {
      const param = { ...formValue }
      return await api.jewelry.post('StockBasket/AddItems', param)
    },

    async fetchRemoveItem({ formValue }) {
      const param = { ...formValue }
      return await api.jewelry.post('StockBasket/RemoveItem', param)
    },

    async fetchSubmitApproval({ formValue }) {
      const param = { ...formValue }
      return await api.jewelry.post('StockBasket/SubmitApproval', param)
    },

    async fetchApprove({ formValue }) {
      const param = { ...formValue }
      return await api.jewelry.post('StockBasket/Approve', param)
    },

    async fetchCheckout({ formValue }) {
      const param = { ...formValue }
      return await api.jewelry.post('StockBasket/Checkout', param)
    }
  }
})
