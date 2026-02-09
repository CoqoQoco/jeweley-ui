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

    async fetchGetAccount({ id, skipLoading = false }) {
      try {
        const param = {
          id
        }

        const res = await api.jewelry.get('User/GetAccount', param, { skipLoading })
        if (res) {
          localStorage.setItem('profile-dk', JSON.stringify(this.user))
          return res
        } else {
          return {}
        }
      } catch (error) {
        console.error('Error fetching user get account:', error)
      }
    },
    async fetchGetUser() {
      try {
        const res = await api.jewelry.get('User/Get')
        if (res) {
          localStorage.removeItem('user-dk')
          localStorage.setItem('user-dk', JSON.stringify(res))
        }
      } catch (error) {
        console.error('Error fetching user get user:', error)
      }
    },

    async fetchUpdateAccount({ formValue }) {
      try {
        let restOptions = {
          headers: {
            'Content-Type': `multipart/form-data`
          }
        }
        return await api.jewelry.post('User/UpdateAccount', formValue, {
          skipLoading: true,
          restOptions: restOptions
        })
      } catch (error) {
        console.error('Error fetching UpdateAccount:', error)
      }
    },
    async fetchActiveAccount({ form }) {
      try {
        const res = await api.jewelry.post('User/Active', form)
        if (res) {
          return res
        } else {
          return {}
        }
      } catch (error) {
        console.error('Error fetching user active account:', error)
      }
    },
    async fetchInactiveAccount({ form }) {
      try {
        const res = await api.jewelry.post('User/Inactive', form)
        if (res) {
          return res
        } else {
          return {}
        }
      } catch (error) {
        console.error('Error fetching user inactive account:', error)
      }
    }
  }
})
