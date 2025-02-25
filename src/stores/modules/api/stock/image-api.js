import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'
// import {
//   formatISOString,
//   formatDate
//   //formatDateTime
// } from '@/services/utils/dayjs.js'

export const stockProductImageApiStor = defineStore('stockProductImage', {
  state: () => ({}),
  actions: {
    async fetchSaveImage({ form }) {
      try {
        let options = {
          headers: {
            'Content-Type': `multipart/form-data`
          }
        }
        //const header =
        const res = await api.jewelry.post('StockProductImage/Create', form, options)
        if (res) {
          return res
        } else {
          return null
        }
      } catch (error) {
        console.error('Error fetching save stock product image:', error)
      }
    },
    async fetchListImage({ take, skip, sort, search, skipLoading = false }) {
      try {
        const param = {
          take: take,
          skip: skip,
          sort: sort,
          search: {
            ...search
          }
        }
        const res = await api.jewelry.post('StockProductImage/List', param, { skipLoading })

        if (res) {
          return res
        } else {
          return null
        }
      } catch (error) {
        console.error('Error fetching list stock product image:', error)
      }
    }
  }
})
