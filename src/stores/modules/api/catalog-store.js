import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'

export const useCatalogStore = defineStore('catalog', {
  state: () => ({
    dataList: {},
    dataGet: {}
  }),

  actions: {
    async fetchList({ take, skip, sort, form }) {
      const param = {
        take: take,
        skip: skip,
        sort: sort,
        code: form.code,
        name: form.name
      }

      return await api.jewelry.post('Catalog/List', param)
    },

    async fetchGet({ id }) {
      const param = { id: id }
      return await api.jewelry.post('Catalog/Get', param)
    },

    async fetchCreate({ form }) {
      const param = {
        code: form.code,
        nameTh: form.nameTh,
        nameEn: form.nameEn,
        collectionTitle: form.collectionTitle,
        headerLabel: form.headerLabel,
        items: form.items || []
      }

      return await api.jewelry.post('Catalog/Create', param)
    },

    async fetchUpdate({ form }) {
      const param = {
        id: form.id,
        code: form.code,
        nameTh: form.nameTh,
        nameEn: form.nameEn,
        collectionTitle: form.collectionTitle,
        headerLabel: form.headerLabel,
        items: form.items || []
      }

      return await api.jewelry.post('Catalog/Update', param)
    },

    async fetchDelete({ id }) {
      const param = { id: id }
      return await api.jewelry.post('Catalog/Delete', param)
    },

    async fetchAddProducts({ catalogId, items }) {
      const param = {
        catalogId: catalogId,
        items: items
      }

      return await api.jewelry.post('Catalog/AddProducts', param)
    },

    async fetchRemoveProduct({ catalogId, itemId, productNumber }) {
      const param = {
        catalogId: catalogId,
        itemId: itemId,
        productNumber: productNumber
      }

      return await api.jewelry.post('Catalog/RemoveProduct', param)
    }
  }
})
