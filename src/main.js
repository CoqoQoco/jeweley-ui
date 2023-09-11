import './assets/scss/core.scss'

// Theme & Styles

import { createApp } from 'vue'
import { createPinia } from 'pinia'
//import { createI18n } from 'vue-i18n'
import { i18n } from './plugins/i18n/config'
import { VueApexCharts } from './plugins/apexcharts/config'
import VueSweetalert2 from 'vue-sweetalert2'
// const i18n = createI18n({
//   // something vue-i18n options here ...
// })
import VueAwesomePaginate from 'vue-awesome-paginate'

// Import Bootstrap and BootstrapVue CSS files (order is important)
//import 'bootstrap/dist/css/bootstrap.css'
//import 'bootstrap-vue/dist/bootstrap-vue.css'

// Theme & Styles
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-icons/font/bootstrap-icons.css'

//style
import 'sweetalert2/dist/sweetalert2.min.css'

import 'vue-awesome-paginate/dist/style.css'
//import 'bootstrap/dist/css/bootstrap.css'

// import the package

// import the necessary css file

import App from './App.vue'
import router from './router'

//import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'

//App.config.productionTip = false
const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(VueApexCharts)
app.use(VueSweetalert2)
app.use(VueAwesomePaginate)

// Make BootstrapVue available throughout your project
//App.use(BootstrapVue)
// Optionally install the BootstrapVue icon components plugin
//App.use(IconsPlugin)

app.mount('#app')