import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'

export const useSaleChannelMasterStore = defineStore('saleChannelMaster', {
  state: () => ({
    dataSearch: { data: [], total: 0 }
  }),

  actions: {
    async fetchDataSearch({ take = 10, skip = 0, sort = [], formValue = {} } = {}) {
      const res = await api.jewelry.post('SaleChannel/List', {
        nameOrCode: formValue.nameOrCode || null,
        type: formValue.type || null,
        isActive:
          formValue.isActive === null || formValue.isActive === undefined || formValue.isActive === ''
            ? null
            : formValue.isActive
      })

      let data = [...(res || [])]

      if (sort.length > 0) {
        const { field, dir } = sort[0]
        data.sort((a, b) => {
          const valA = a[field]
          const valB = b[field]
          if (valA === valB) return 0
          if (valA === null || valA === undefined) return 1
          if (valB === null || valB === undefined) return -1
          return dir === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1)
        })
      }

      const total = data.length
      const paged = data.slice(skip, skip + take)
      this.dataSearch = { data: paged, total }
    },

    async get(code) {
      return await api.jewelry.post('SaleChannel/Get', { code })
    },

    async create(form) {
      return await api.jewelry.post('SaleChannel/Create', { ...form })
    },

    async update(form) {
      return await api.jewelry.post('SaleChannel/Update', { ...form })
    },

    async remove(code) {
      return await api.jewelry.post('SaleChannel/Delete', { code })
    }
  }
})
