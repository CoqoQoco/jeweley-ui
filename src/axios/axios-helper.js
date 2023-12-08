import axios from 'axios'
import get from 'lodash/get'
import swAlert from '@/services/alert/sweetAlerts.js'

import router from '@/router'

axios.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    //store.commit('isLoading', false)
    return response
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    //store.commit('isLoading', false)

    const status = get(error, 'response.status')
    //const errorStatus = get(error, 'response.data.errorStatus')
    const msg = get(error, 'response.data.message')
    const stacktrace = get(error, 'response.data.stacktrace', null)
    const errorSystem = get(error, 'response.data.errors')

    // CASE : 401 - UNAUTHORIZED
    if (status === 401) {
      swAlert.error(
        msg,
        'Unauthorise',
        async () => {
          //   const activeAccount = msalInstance.getActiveAccount()
          //   if (activeAccount) {
          //     await msalInstance.logoutPopup(loginRequest)
          //   }

          router.push({ name: 'dashboard' })
        },
        stacktrace
      )
    }

    // CASE : GENERIC ERROR
    if ([402, 500, 404, 504].indexOf(status) !== -1) {
      if (msg || JSON.stringify(errorSystem)) {
        swAlert.error(msg || JSON.stringify(errorSystem), null, () => {}, stacktrace)
      } else {
        swAlert.error('กรุณาติดผู้พัฒนา', `ERROR : ${status}`, () => {}, stacktrace)
      }
    }

    // CASE : 400 - BAD REQUEST
    if (status == 400) {
      if (msg) {
        swAlert.error(msg, null, stacktrace)
      } else {
        let messages = []
        for (let key in errorSystem) {
          messages.push(errorSystem[key])
        }
        swAlert.error(messages, null, () => {}, stacktrace)
      }
    }
    return Promise.reject(error)
  }
)
