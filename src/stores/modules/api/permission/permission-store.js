import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    allPermissions: [],
    rolesWithPermissions: []
  }),

  actions: {
    async fetchAllPermissions() {
      const res = await api.jewelry.get('Permission/All')
      if (res) {
        this.allPermissions = res
      }
      return res
    },

    async fetchRolesWithPermissions() {
      const res = await api.jewelry.get('Permission/RolesWithPermissions')
      if (res) {
        this.rolesWithPermissions = res
      }
      return res
    },

    async updateRolePermissions({ roleId, permissionIds }) {
      const res = await api.jewelry.post('Permission/UpdateRolePermissions', {
        roleId,
        permissionIds
      })
      return res
    }
  }
})
