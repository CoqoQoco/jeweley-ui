import axios from 'axios'
import get from 'lodash/get'
import swAlert from '@/services/alert/sweetAlerts.js'
import { useLoadingStore } from '@/stores/modules/master/loading-store.js'
import { useAuthStore } from '@/stores/modules/authen/authen-store.js'
import router from '@/router'

//production
//const jewelryUrl = 'http://192.168.1.41:2001/'

//dev
const jewelryUrl = 'https://localhost:7001/'
const printerUrl = 'http://localhost:5000/'

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

const getTokenInfo = () => {
  const token = localStorage.getItem('token-dk')
  return token
}

// Axios instance for jewelry API
const axiosInstance = axios.create({
  baseURL: jewelryUrl,
  timeout: 30000
})

// Axios instance for printer API
const printerAxiosInstance = axios.create({
  baseURL: printerUrl,
  timeout: 30000
})

// Request tracking
let activeRequests = new Set()

// Configure request interceptors
const configureInterceptors = (instance) => {
  // Request interceptor
  instance.interceptors.request.use(
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
  instance.interceptors.response.use(
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

      // Check if this is a printer service error
      const isPrinterError = error.config?.baseURL === printerUrl

      if (isPrinterError) {
        // Handle printer specific errors
        swAlert.error(
          'การเชื่อมต่อกับเครื่องพิมพ์ล้มเหลว',
          'กรุณาตรวจสอบว่าบริการเครื่องพิมพ์กำลังทำงานอยู่และเครื่องพิมพ์เชื่อมต่ออยู่',
          () => {}
        )
        return Promise.reject(error)
      }

      // For jewelry API errors, use the existing error handling
      // Extract error details
      const status = get(error, 'response.status')
      const msg = get(error, 'response.data.message')
      const stacktrace = get(error, 'response.data.stacktrace', null)
      const errorSystem = get(error, 'response.data.errors')

      const authStore = useAuthStore()

      // Handle different error cases
      switch (status) {
        case 401:
          {
            let error = ''
            if (error.response?.headers['token-expired']) {
              error = 'Token expired'
            } else if (error.response?.data.message === 'User is inactive or not found') {
              error = 'User is inactive or not found'
            }

            console.log('401error', error)

            swAlert.error(
              msg,
              `${error ?? `Unauthorise`}`,
              async () => {
                await authStore.logout()
                console.log('router', router)
                router.push('/login')
              },
              stacktrace
            )
          }
          break
        case 400:
          if (msg) {
            swAlert.error(msg, null, () => {}, stacktrace)
          } else if (errorSystem) {
            const messages = Object.values(errorSystem)
            swAlert.error(messages, null, () => {}, stacktrace)
          }
          break

        case 402:
        case 404:
        case 500:
        case 504:
          if (msg || errorSystem) {
            swAlert.error(msg || JSON.stringify(errorSystem), null, () => {}, stacktrace)
          } else {
            swAlert.error('กรุณาติดผู้พัฒนา', `ERROR : ${status}`, () => {}, stacktrace)
          }
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
}

// Apply interceptors to both axios instances
configureInterceptors(axiosInstance)
configureInterceptors(printerAxiosInstance)

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

// GET method for Jewelry API
const fetchData = async (url, params, optionsConfig = {}) => {
  const token = getTokenInfo()
  //console.log('get api token', token)
  const { skipLoading = false, ...restOptions } = optionsConfig

  if (!skipLoading) {
    loadingManager.showLoading()
  }

  const source = createCancelToken()

  const res = await axiosInstance.get(url, {
    ...restOptions,
    headers: {
      Authorization: token,
      ...restOptions?.headers
    },
    params: params,
    cancelToken: source.token,
    skipLoading
  })

  return res.data
}

// POST method for Jewelry API
const postData = async (url, data, optionsConfig = {}) => {
  const token = getTokenInfo()
  const { skipLoading = false, ...restOptions } = optionsConfig

  if (!skipLoading) {
    loadingManager.showLoading()
  }

  const source = createCancelToken()

  const res = await axiosInstance.post(url, data, {
    ...restOptions,
    headers: {
      Authorization: token,
      ...restOptions?.headers
    },
    cancelToken: source.token,
    skipLoading
  })

  return res.data
}

// GET method for Printer API
const fetchPrinterData = async (url, params, optionsConfig = {}) => {
  const { skipLoading = false, apiKey = null, ...restOptions } = optionsConfig

  if (!skipLoading) {
    loadingManager.showLoading()
  }

  const source = createCancelToken()

  const headers = {
    ...restOptions?.headers
  }

  // Add API key if provided
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`
  }

  try {
    const res = await printerAxiosInstance.get(url, {
      ...restOptions,
      headers,
      params: params,
      cancelToken: source.token,
      skipLoading
    })

    return res.data
  } catch (error) {
    console.error('Printer connection error:', error)

    // Format response for connection failures
    if (!error.response) {
      return {
        status: 'error',
        message: 'ไม่สามารถเชื่อมต่อกับบริการเครื่องพิมพ์ได้',
        serviceStatus: 'stopped',
        printerStatus: 'not_connected'
      }
    }

    throw error
  }
}

// POST method for Printer API
const postPrinterData = async (url, data, optionsConfig = {}) => {
  const { skipLoading = false, apiKey = null, ...restOptions } = optionsConfig

  if (!skipLoading) {
    loadingManager.showLoading()
  }

  const source = createCancelToken()

  const headers = {
    'Content-Type': 'application/json',
    ...restOptions?.headers
  }

  // Add API key if provided
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`
  }

  try {
    const res = await printerAxiosInstance.post(url, data, {
      ...restOptions,
      headers,
      cancelToken: source.token,
      skipLoading
    })

    return res.data
  } catch (error) {
    console.error('Printer request error:', error)

    // Format response for connection failures
    if (!error.response) {
      return {
        status: 'error',
        message: 'ไม่สามารถเชื่อมต่อกับบริการเครื่องพิมพ์ได้'
      }
    }

    throw error
  }
}

// แก้ไขเฉพาะส่วนที่เกี่ยวข้องกับการเชื่อมต่อ Zebra Printer
const zebraPrinter = {
  get: async (url, params, optionsConfig) =>
    await fetchPrinterData(`${url}`, params, optionsConfig),
  post: async (url, params, optionsConfig) =>
    await postPrinterData(`${url}`, params, optionsConfig),

  // ปรับปรุงฟังก์ชัน testConnection เพื่อจัดการกับผลลัพธ์จาก API server ของเรา
  testConnection: async (optionsConfig = {}) => {
    try {
      const result = await fetchPrinterData('test-connection', {}, optionsConfig)

      // จัดการกับสถานะต่างๆ ที่เราส่งกลับจาก API
      if (result.serviceStatus === 'running') {
        if (result.printerStatus === 'connected') {
          // Case 2.1: Service ทำงานและเชื่อมต่อเครื่องพิมพ์ได้
          return {
            status: 'success',
            message: 'Service และเครื่องพิมพ์พร้อมใช้งาน',
            serviceStatus: 'running',
            printerStatus: 'connected',
            port: result.port,
            baudRate: result.baudRate
          }
        } else {
          // Case 1.1: Service ทำงานแต่ไม่ได้เชื่อมต่อเครื่องพิมพ์
          return {
            status: 'warning',
            message: 'Service ทำงานแต่ไม่ได้เชื่อมต่อเครื่องพิมพ์',
            serviceStatus: 'running',
            printerStatus: 'not_connected',
            port: result.port || 'Not selected',
            baudRate: result.baudRate
          }
        }
      } else {
        // Service ไม่ทำงาน
        return {
          status: 'error',
          message: 'Service ไม่ทำงาน',
          serviceStatus: 'stopped',
          printerStatus: 'unknown'
        }
      }
    } catch (error) {
      // กรณีเกิดข้อผิดพลาดในการเชื่อมต่อกับ Service
      console.error('Service connection error:', error)
      return {
        status: 'error',
        message: 'ไม่สามารถเชื่อมต่อกับ Service ได้',
        serviceStatus: 'stopped',
        printerStatus: 'unknown'
      }
    }
  },

  // ปรับปรุงฟังก์ชันพิมพ์ ZPL เพื่อรองรับผลลัพธ์จาก API เรา
  printZPL: async (zplData, optionsConfig = {}) => {
    try {
      const result = await postPrinterData('print', { data: zplData }, optionsConfig)

      if (result.status === 'success') {
        // Case 2.2: พิมพ์สำเร็จ
        return {
          status: 'success',
          message: 'พิมพ์สำเร็จ',
          serviceStatus: 'running',
          printerStatus: 'connected'
        }
      } else {
        // พิมพ์ไม่สำเร็จด้วยสาเหตุที่ระบุใน API
        return {
          status: 'error',
          message: result.message || 'พิมพ์ไม่สำเร็จ',
          serviceStatus: result.serviceStatus || 'running',
          printerStatus: result.printerStatus || 'error'
        }
      }
    } catch (error) {
      // Case 1.2: ส่งข้อมูลมาพิมพ์แต่ไม่สามารถพิมพ์ได้
      console.error('Print error:', error)
      return {
        status: 'error',
        message: 'ไม่สามารถพิมพ์ได้',
        serviceStatus: 'running',
        printerStatus: 'not_connected'
      }
    }
  },

  // ปรับปรุงฟังก์ชันดึงสถานะเพื่อรองรับการตอบกลับจาก API ของเรา
  getStatus: async (optionsConfig = {}) => {
    try {
      const result = await fetchPrinterData('status', {}, optionsConfig)

      // แก้ไขให้ตรงกับรูปแบบที่ API server ของเราส่งกลับ
      // ตรวจสอบว่า API ส่งกลับข้อมูลในรูปแบบที่คาดหวังหรือไม่
      if (result.service && result.printer) {
        // กรณี API ส่งกลับในรูปแบบที่มี service และ printer แยกกัน
        return {
          status: 'success',
          service: result.service,
          printer: result.printer
        }
      } else {
        // กรณี API ส่งกลับในรูปแบบเก่า (เข้ากันได้กับโค้ดเดิม)
        return {
          status: result.status || 'success',
          serviceStatus: result.serviceStatus || 'unknown',
          printerStatus: result.printerStatus || 'unknown',
          message: result.message || 'ดึงสถานะสำเร็จ'
        }
      }
    } catch (error) {
      console.error('Status check error:', error)
      return {
        status: 'error',
        message: 'ไม่สามารถตรวจสอบสถานะได้',
        serviceStatus: 'unknown',
        printerStatus: 'unknown'
      }
    }
  }
}

export default {
  // ส่วนอื่นๆ ยังคงเหมือนเดิม
  jewelry: {
    get: async (url, params, optionsConfig) => await fetchData(`${url}`, params, optionsConfig),
    post: async (url, params, optionsConfig) => await postData(`${url}`, params, optionsConfig)
  },
  zebraPrinter: zebraPrinter
}

// export default {
//   jewelry: {
//     get: async (url, params, optionsConfig) => await fetchData(`${url}`, params, optionsConfig),
//     post: async (url, params, optionsConfig) => await postData(`${url}`, params, optionsConfig)
//   },
//   zebraPrinter: {
//     get: async (url, params, optionsConfig) =>
//       await fetchPrinterData(`${url}`, params, optionsConfig),
//     post: async (url, params, optionsConfig) =>
//       await postPrinterData(`${url}`, params, optionsConfig),
//     testConnection: async (optionsConfig = {}) => {
//       return await fetchPrinterData('test-connection', {}, optionsConfig)
//     },
//     printZPL: async (zplData, optionsConfig = {}) => {
//       return await postPrinterData('print', { data: zplData }, optionsConfig)
//     },
//     getStatus: async (optionsConfig = {}) => {
//       return await fetchPrinterData('status', {}, optionsConfig)
//     }
//   }
// }
