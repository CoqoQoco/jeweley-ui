// src/axios/axios-config.js
import axios from 'axios'
import { useLoadingStore } from '@/stores/modules/master/loading-store.js'

//test build
//const jewelryUrl = 'https://localhost:32771/'

//production
const jewelryUrl = 'http://192.168.1.41:2001/'


// Axios instance
const axiosInstance = axios.create({
  baseURL: jewelryUrl
})

// Request interceptor
// axiosInstance.interceptors.request.use(
//   (config) => {
//     const loadingStore = useLoadingStore()
//     loadingStore.showLoading()
//     return config
//   },
//   (error) => {
//     const loadingStore = useLoadingStore()
//     loadingStore.hideLoading()
//     return Promise.reject(error)
//   }
// )

// Response interceptor
// axiosInstance.interceptors.response.use(
//   (response) => {
//     const loadingStore = useLoadingStore()
//     loadingStore.hideLoading()
//     return response
//   },
//   (error) => {
//     const loadingStore = useLoadingStore()
//     loadingStore.hideLoading()
//     return Promise.reject(error)
//   }
const loadingStore = useLoadingStore()
//     loadingStore.showLoading()

// GET method
const get = async function (url, params, optionsConfig) {
  loadingStore.showLoading()
  try {
    const res = await axiosInstance.get(url, {
      ...optionsConfig,
      headers: {
        ...optionsConfig?.headers
      },
      params: params
    })

    loadingStore.hideLoading()
    return res.data
  } catch (error) {
    console.log(error)
    loadingStore.hideLoading()
    throw error
  }
}

// POST method
const post = async function (url, data, optionsConfig) {
  loadingStore.showLoading()
  try {
    const res = await axiosInstance.post(url, data, {
      ...optionsConfig,
      headers: {
        ...optionsConfig?.headers
      }
    })
    loadingStore.hideLoading()
    return res.data
  } catch (error) {
    console.log(error)
    loadingStore.hideLoading()
    throw error
  }
}

export default {
  jewelry: {
    get: async (url, params) => await get(`${url}`, params),
    post: async (url, params, optionsConfig) => await post(`${url}`, params, optionsConfig)
  }
}
