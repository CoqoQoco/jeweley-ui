// src/axios/axios-config.js
import axios from 'axios'
import { useLoadingStore } from '@/stores/modules/master/loading-store.js'

// API URLs
const jewelryUrl = 'https://localhost:32771/'

// Axios instance
const axiosInstance = axios.create({
  baseURL: jewelryUrl
})

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const loadingStore = useLoadingStore()
    loadingStore.showLoading()
    return config
  },
  (error) => {
    const loadingStore = useLoadingStore()
    loadingStore.hideLoading()
    return Promise.reject(error)
  }
)

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    const loadingStore = useLoadingStore()
    loadingStore.hideLoading()
    return response
  },
  (error) => {
    const loadingStore = useLoadingStore()
    loadingStore.hideLoading()
    return Promise.reject(error)
  }
)

// GET method
const get = async function (url, params, optionsConfig) {
  try {
    const res = await axiosInstance.get(url, {
      ...optionsConfig,
      headers: {
        ...optionsConfig?.headers
      },
      params: params
    })
    return res.data
  } catch (error) {
    console.log(error)
    throw error
  }
}

// POST method
const post = async function (url, data, optionsConfig) {
  try {
    const res = await axiosInstance.post(url, data, {
      ...optionsConfig,
      headers: {
        ...optionsConfig?.headers
      }
    })
    return res.data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export default {
  jewelry: {
    get: async (url, params) => await get(`${url}`, params),
    post: async (url, params, optionsConfig) => await post(`${url}`, params, optionsConfig)
  }
}
