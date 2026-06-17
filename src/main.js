import App from './App.vue'
import router from './router'

import './assets/scss/core.scss'
//import 'primeflex/primeflex.css'

// Theme & Styles

import { createApp } from 'vue'
import { createPinia } from 'pinia'
//import { createI18n } from 'vue-i18n'
import { i18n } from './plugins/i18n/config'
import { VueApexCharts } from './plugins/apexcharts/config'
import VueSweetalert2 from 'vue-sweetalert2'
import PrimeVue from 'primevue/config'
// const i18n = createI18n({
//   // something vue-i18n options here ...
// })
import VueAwesomePaginate from 'vue-awesome-paginate'

// Import Bootstrap and BootstrapVue CSS files (order is important)
//import 'bootstrap/dist/css/bootstrap.css'
//import 'bootstrap-vue/dist/bootstrap-vue.css'

// Theme & Styles

import './axios/axios-helper'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-icons/font/bootstrap-icons.css'

//style
import 'sweetalert2/dist/sweetalert2.min.css'

import 'vue-awesome-paginate/dist/style.css'
//import 'bootstrap/dist/css/bootstrap.css'

import 'primevue/resources/themes/lara-light-indigo/theme.css'

//import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'

// เพิ่มในไฟล์ main.js หรือ App.vue
const modalContainer = document.createElement('div');
modalContainer.id = 'modal-container';
document.body.appendChild(modalContainer);

//App.config.productionTip = false
const app = createApp(App)

const pinia = createPinia()
app.use(pinia)

// Initialize device store for mobile/web detection
import { useDeviceStore } from '@/stores/modules/device/device-store.js'
const deviceStore = useDeviceStore()
deviceStore.initResizeListener()

app.use(router)
app.use(i18n)
app.use(VueApexCharts)
app.use(VueSweetalert2)
app.use(VueAwesomePaginate)
app.use(PrimeVue)

// Make BootstrapVue available throughout your project
//App.use(BootstrapVue)
// Optionally install the BootstrapVue icon components plugin
//App.use(IconsPlugin)

// Global error handler — silence AxiosError ที่ axios-helper จัดการแล้ว (popup แสดงแล้ว)
// error จริง (TypeError, logic bug) ยัง log ใน console เพื่อ debug ได้
app.config.errorHandler = (err, _instance, info) => {
  const isHandledAxiosError = err?.handledByAxios === true || err?.isAxiosError === true
  if (isHandledAxiosError) {
    if (import.meta.env.DEV) {
      console.debug('[axios-handled]', info, err?.message)
    }
    return
  }
  console.error('[Vue errorHandler]', info, err)
}

// Unhandled promise rejection — กัน noise จาก AxiosError ที่ axios-helper แสดง popup แล้ว
// rejection จาก bug จริง (TypeError ฯลฯ) ไม่ถูก preventDefault → ยังปรากฏใน console
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason
  const isAxiosError = reason?.isAxiosError === true || reason?.handledByAxios === true
  if (isAxiosError) {
    event.preventDefault()
    if (import.meta.env.DEV) {
      console.debug('[axios-handled rejection]', reason?.message)
    }
  }
})

app.mount('#app')
