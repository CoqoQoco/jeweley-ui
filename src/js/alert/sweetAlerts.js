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

export default {
  //error,
  //success,
  //info,
  warning
  //submit,
}
