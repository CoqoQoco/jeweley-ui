import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'

// import {
//   //formatISOString,
//   //formatDate
//   //formatDateTime
// } from '@/services/utils/dayjs.js'

//import swAlert from '@/services/alert/sweetAlerts.js'
//import { CsvHelper } from '@/services/utils/export-excel.js'
//import { ExcelHelper } from '@/services/utils/excel-js.js'

export const useUserApiStore = defineStore('userStore', {
  state: () => ({
    listUser: {},
    listUserTotal: 0
  }),

  actions: {
    initRequest(from) {
      //console.log('initRequest', formValue)
      return {
        search: {
          username: from.username ?? null,
          isActive: from.isActive ?? null,
          isNew: from.isNew ?? null
        }
      }
    },

    async fetchDataList({ take, skip, sort, form }) {
      try {
        this.listUser = {}
        const param = {
          take,
          skip,
          sort,
          ...this.initRequest(form)
        }

        const res = await api.jewelry.post('User/List', param)
        if (res) {
          this.listUserTotal = res.total
          return res
        } else {
          this.listUserTotal = 0
          return {}
        }
      } catch (error) {
        console.error('Error fetching user list:', error)
      }
    },
    async fetchGetAccount({ id }) {
      try {
        const param = {
          id
        }

        const res = await api.jewelry.get('User/GetAccount', param)
        if (res) {
          return res
        } else {
          return {}
        }
      } catch (error) {
        console.error('Error fetching user get account:', error)
      }
    }
  }
})
