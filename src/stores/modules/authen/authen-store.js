// src/stores/modules/auth/auth-store.js
import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'

import { useLoadingStore } from '@/stores/modules/master/loading-store.js'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token-dk') || null,
    user: JSON.parse(localStorage.getItem('user-dk')) || null,
    error: null,
    permissions: [],
    userMenus: []
  }),

  getters: {
    // Auth Status
    isAuthenticated: (state) => !!state.token,
    getUser: (state) => state.user,
    getError: (state) => state.error,

    // User Info
    getUserFullName: (state) => {
      if (!state.user) return ''
      return `${state.user.firstName} ${state.user.lastName}`
    },
    getUserRole: (state) => state.user?.role || '',

    // Permissions & Menus
    getPermissions: (state) => state.permissions,
    getUserMenus: (state) => state.userMenus,
    hasPermission: (state) => (permission) => state.permissions.includes(permission)
  },

  actions: {
    handleError(error, message) {
      console.error(message, error)
      this.error = error
      throw error
    },

    clearError() {
      this.error = null
    },

    clearAuth() {
      this.token = null
      this.user = null

      this.permissions = []
      this.userMenus = []
      this.error = null

      localStorage.removeItem('token-dk')
      localStorage.removeItem('user-dk')
      //delete api.jewelry.defaults.headers.common['Authorization']
    },

    async login({ username, password }) {
      const loadingStore = useLoadingStore()

      //loadingStore.showLoading()
      try {
        this.clearError()

        // Login request
        const response = await api.jewelry.post('Landing/login', {
          username,
          password
        })


        if (response) {

          const token = response.token


          // Set authentication data
          this.token = response.token

          // Save to localStorage
          localStorage.setItem('token-dk', `Bearer ${token}`)


          // Fetch user profile after successful login
          await this.fetchUserProfile()
          loadingStore.hideLoading()
          return true
        }
      } catch (error) {
        return this.handleError(error, 'Login failed')
      }
      loadingStore.hideLoading()
    },
    async logout() {
      try {
        //await api.jewelry.post('auth/logout')
        this.clearAuth()
        return true
      } catch (error) {
        return this.handleError(error, 'Logout failed')
      }
    },
    async checkDupUsername({ username }) {
      try {
        // Login request
        const response = await api.jewelry.get(
          'Landing/CheckDupUsername',
          {
            username
          },
          {
            skipLoading: true
          }
        )

        return response
      } catch (error) {
        return this.handleError(error, 'Login failed')
      }
    },
    async register({ form }) {
      try {
        const param = {
          username: form.username,
          password: form.password,
          firstname: form.firstname,
          lastname: form.lastname
        }

        // Login request
        const response = await api.jewelry.post('Landing/Register', param)

        return response
      } catch (error) {
        return this.handleError(error, 'Login failed')
      }
    },

    async fetchUserProfile() {
      const loadingStore = useLoadingStore()
      try {
        // Get user profile data
        const userProfile = await api.jewelry.get('User/Get')

        // Get user image from Azure Blob Storage
        if (userProfile.imageName) {
          // Import helper function
          const { getAzureBlobAsBase64 } = await import('@/config/azure-storage-config.js')

          // Build blob path
          // If imageName already has path like "User/admin-1.png", use as-is
          // Otherwise, prepend "User/" folder
          const blobPath = userProfile.imageName.includes('/')
            ? userProfile.imageName
            : `User/Profile/${userProfile.imageName}`

          // Get image as base64
          const base64Image = await getAzureBlobAsBase64(blobPath, 'user')

          // Add to user profile
          if (base64Image) {
            userProfile.image = base64Image
          }
        }

        // Get permissions and menus in parallel
        // const [permissions, userMenus] = await Promise.all([
        //   api.jewelry.get('auth/permissions'),
        //   api.jewelry.get('auth/user-menus')
        // ])

        // Update state with fetched data
        this.user = { ...this.user, ...userProfile }
        //this.permissions = permissions || []
        //this.userMenus = userMenus || []

        // Update user in localStorage
        localStorage.setItem('user-dk', JSON.stringify(this.user))

        loadingStore.hideLoading()
        return {
          profile: this.user,
          permissions: this.permissions,
          userMenus: this.userMenus
        }
      } catch (error) {
        loadingStore.hideLoading()
        return this.handleError(error, 'Error fetching user profile')
      }
    },

    async updateProfile(profileData) {
      try {
        const response = await api.jewelry.put('auth/profile', profileData)
        this.user = response
        localStorage.setItem('user', JSON.stringify(response))
        return true
      } catch (error) {
        return this.handleError(error, 'Error updating profile')
      }
    },

    async changePassword({ currentPassword, newPassword }) {
      try {
        await api.jewelry.post('auth/change-password', {
          currentPassword,
          newPassword
        })
        return true
      } catch (error) {
        return this.handleError(error, 'Error changing password')
      }
    }
  }
})
