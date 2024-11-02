import axios from 'axios'
import get from 'lodash/get'
import swAlert from '@/services/alert/sweetAlerts.js'
import { useLoadingStore } from '@/stores/modules/master/loading-store.js'
import router from '@/router'

//production
const jewelryUrl = 'http://192.168.1.41:2001/'

// Loading state management
const loadingManager = {
  timeoutId: null,
  maxLoadingTime: 10000, // 10 seconds maximum loading time

  showLoading() {
    const loadingStore = useLoadingStore()
    loadingStore.showLoading()

    // Set timeout to force hide loading after maxLoadingTime
    this.timeoutId = setTimeout(() => {
      this.hideLoading()
    }, this.maxLoadingTime)
  },

  hideLoading() {
    const loadingStore = useLoadingStore()
    loadingStore.hideLoading()

    // Clear timeout if exists
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
  },

  // Force reset loading state
  resetLoading() {
    this.hideLoading()
    activeRequests.clear()
  }
}

// Create cancel token source
const createCancelToken = () => {
  return axios.CancelToken.source()
}

// Axios instance
const axiosInstance = axios.create({
  baseURL: jewelryUrl,
  timeout: 30000
})

// Request tracking
let activeRequests = new Set()

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const requestId = Math.random().toString(36).substring(7)
    config.requestId = requestId
    activeRequests.add(requestId)

    // Reset loading state if it's stuck
    if (document.hidden) {
      loadingManager.resetLoading()
    }

    return config
  },
  (error) => {
    loadingManager.hideLoading()
    return Promise.reject(error)
  }
)

// Response interceptor with enhanced error handling
axiosInstance.interceptors.response.use(
  (response) => {
    if (response.config.requestId) {
      activeRequests.delete(response.config.requestId)
    }
    if (activeRequests.size === 0) {
      loadingManager.hideLoading()
    }
    return response
  },
  (error) => {
    // Clean up request tracking
    if (error.config?.requestId) {
      activeRequests.delete(error.config.requestId)
    }

    // Hide loading state only if it was shown and no other requests are pending
    if (!error.config?.skipLoading && activeRequests.size === 0) {
      loadingManager.hideLoading()
    }

    // Handle canceled requests
    if (axios.isCancel(error)) {
      console.log('Request canceled:', error.message)
      return Promise.reject(error)
    }

    // Extract error details
    const status = get(error, 'response.status')
    const msg = get(error, 'response.data.message')
    const stacktrace = get(error, 'response.data.stacktrace', null)
    const errorSystem = get(error, 'response.data.errors')

    // Handle different error cases
    switch (status) {
      case 401:
        handleUnauthorizedError(msg, stacktrace)
        break

      case 400:
        handleBadRequestError(msg, errorSystem, stacktrace)
        break

      case 402:
      case 404:
      case 500:
      case 504:
        handleGenericError(status, msg, errorSystem, stacktrace)
        break

      default:
        swAlert.error(
          'เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง',
          `Error Code: ${status || 'Unknown'}`,
          () => {},
          stacktrace
        )
    }

    return Promise.reject(error)
  }
)

// Error handling functions remain the same...
const handleUnauthorizedError = (msg, stacktrace) => {
  swAlert.error(
    msg,
    'Unauthorise',
    async () => {
      router.push({ name: 'dashboard' })
    },
    stacktrace
  )
}

const handleBadRequestError = (msg, errorSystem, stacktrace) => {
  if (msg) {
    swAlert.error(msg, null, () => {}, stacktrace)
  } else if (errorSystem) {
    const messages = Object.values(errorSystem)
    swAlert.error(messages, null, () => {}, stacktrace)
  }
}

const handleGenericError = (status, msg, errorSystem, stacktrace) => {
  if (msg || errorSystem) {
    swAlert.error(msg || JSON.stringify(errorSystem), null, () => {}, stacktrace)
  } else {
    swAlert.error('กรุณาติดผู้พัฒนา', `ERROR : ${status}`, () => {}, stacktrace)
  }
}

// Enhanced cleanup function
const cleanupRequests = () => {
  loadingManager.resetLoading()
}

// Add enhanced event listeners
if (typeof window !== 'undefined') {
  // Handle page visibility changes
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      loadingManager.resetLoading()
    }
  })

  // Handle page unload
  window.addEventListener('beforeunload', cleanupRequests)
  window.addEventListener('unload', cleanupRequests)

  // Handle navigation events
  window.addEventListener('popstate', cleanupRequests)
}

// GET method
const fetchData = async function (url, params, optionsConfig = {}) {
  const { skipLoading = false, ...restOptions } = optionsConfig

  if (!skipLoading) {
    loadingManager.showLoading()
  }

  const source = createCancelToken()

  const res = await axiosInstance.get(url, {
    ...restOptions,
    headers: {
      ...restOptions?.headers
    },
    params: params,
    cancelToken: source.token,
    skipLoading
  })

  return res.data
}

// POST method
const postData = async function (url, data, optionsConfig = {}) {
  const { skipLoading = false, ...restOptions } = optionsConfig

  if (!skipLoading) {
    loadingManager.showLoading()
  }

  const source = createCancelToken()

  const res = await axiosInstance.post(url, data, {
    ...restOptions,
    headers: {
      ...restOptions?.headers
    },
    cancelToken: source.token,
    skipLoading
  })

  return res.data
}

export default {
  jewelry: {
    get: async (url, params, optionsConfig) => await fetchData(`${url}`, params, optionsConfig),
    post: async (url, params, optionsConfig) => await postData(`${url}`, params, optionsConfig)
  }
}
