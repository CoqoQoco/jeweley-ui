import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'

export const useStockLocationApiStore = defineStore('stockLocationApi', {
  state: () => ({
    dataSearch: { data: [], total: 0 },
    all: []
  }),

  actions: {
    async fetchDataSearch({ take = 10, skip = 0, sort = [], formValue = {} } = {}) {
      const res = await api.jewelry.post('StockLocation/List', { take: 1000, skip: 0, sort: [] })
      const allData = res?.data || []
      this.all = allData

      let filtered = [...allData]

      if (formValue.code) {
        const code = formValue.code.toLowerCase()
        filtered = filtered.filter((item) => item.code?.toLowerCase().includes(code))
      }

      if (formValue.nameTh) {
        const nameTh = formValue.nameTh.toLowerCase()
        filtered = filtered.filter((item) => item.nameTh?.toLowerCase().includes(nameTh))
      }

      if (formValue.type) {
        filtered = filtered.filter((item) => item.type === formValue.type)
      }

      if (formValue.isActive !== null && formValue.isActive !== undefined && formValue.isActive !== '') {
        filtered = filtered.filter((item) => item.isActive === formValue.isActive)
      }

      const total = filtered.length
      const data = filtered.slice(skip, skip + take)
      this.dataSearch = { data, total }
    },

    async fetchAllForMap() {
      if (this.all.length > 0) return this.all
      const res = await api.jewelry.post('StockLocation/List', { take: 1000, skip: 0, sort: [] })
      this.all = res?.data || []
      return this.all
    },

    async create(form) {
      return await api.jewelry.post('StockLocation/Create', { ...form })
    },

    async update(form) {
      return await api.jewelry.post('StockLocation/Update', { ...form })
    },

    async remove(code) {
      return await api.jewelry.post('StockLocation/Delete', { code })
    }
  }
})
