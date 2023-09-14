import Swal from 'sweetalert2'
//import { i18n } from '@/plugins/i18n/config.js'
import { i18n } from '@/plugins/i18n/config.js'

export function warning(msg, title, callback) {
  let titleShow = null

  if (title) {
    titleShow = title
  } else {
    titleShow = i18n.global.t('dashboard')
  }

  Swal.fire({
    title: titleShow,
    html: msg,
    icon: 'warning',
    allowOutsideClick: false,
    confirmButtonText: 'Ok'
  }).then(() => {
    if (callback) callback()
  })
}
export function error(msg, title, callback, stacktrace) {
  let titleShow = null
  if (title) titleShow = title
  else titleShow = 'ผิดพลาด'

  // Create DOM error message template
  let isShowSeeMore = false

  let btnSeeMore = `<span
                        id="btnSeeMore"
                        class="ml-1 text-primary cursor"
                        style="font-size: 12px;"
                        onclick="window.toggleSeeMoreError()"
                      >
                        (See more..)
                      </span>`

  let errorMessage = `<div 
                        id="errorMessage" 
                        class="d-flex justify-content-center align-items-center"
                      >
                        ${msg} ${stacktrace ? btnSeeMore : ''}
                      </div>`

  let stacktraceMessage = `<div
                              id="stacktrace"
                              class="border rounded p-2 bg-light text-left mt-2"
                              style="font-size: 12px; display: none; overflow: hidden;"
                            >
                              <pre style="margin-bottom: 0; max-height: 250px;">${stacktrace}</pre>
                            </div>`

  let errorTemplate = `${errorMessage}
                       ${stacktrace ? stacktraceMessage : ''}`

  // Create Element on Fire Event
  Swal.fire({
    title: titleShow,
    html: errorTemplate,
    icon: 'error',
    allowOutsideClick: false,
    confirmButtonText: 'Close'
  }).then(() => {
    if (callback) callback()
  })

  // Append function on btnSeeMore after created element
  window.toggleSeeMoreError = function () {
    isShowSeeMore = !isShowSeeMore

    if (isShowSeeMore) {
      document.getElementById('btnSeeMore').innerText = '(Hidden)'
      document.getElementById('stacktrace').style.display = 'block'
    } else {
      document.getElementById('btnSeeMore').innerText = '(See More..)'
      document.getElementById('stacktrace').style.display = 'none'
    }
  }
}

export default {
  //error,
  //success,
  //info,
  warning
  //submit,
}
