import Swal from 'sweetalert2'
//import { i18n } from '@/plugins/i18n/config.js'
//import { i18n } from '@/plugins/i18n/config.js'

export function warning(msg, title, callback) {
  let titleShow = null

  if (title) {
    titleShow = title
  } else {
    titleShow = 'คำเตือน'
  }

  Swal.fire({
    title: titleShow,
    html: msg,
    icon: 'warning',
    allowOutsideClick: false,
    confirmButtonText: 'ตกลง',
    confirmButtonColor: '#FFC21B'
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
    confirmButtonColor: '#921313', // เปลี่ยนสีปุ่ม Confirm
    confirmButtonText: 'ปิด'
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
export function success(msg, title, callback) {
  let titleShow = null
  let msgShow = null
  if (title) titleShow = title
  else titleShow = 'สำเร็จ'
  if (msg) msgShow = msg
  else msgShow = ''
  Swal.fire({
    title: titleShow,
    html: msgShow,
    icon: 'success',
    allowOutsideClick: false,
    confirmButtonText: 'ตกลง',
    confirmButtonColor: '#921313'
  }).then(() => {
    if (callback) callback()
  })
}
export function info(msg, title, callback) {
  let titleShow = null
  if (title) titleShow = title
  else titleShow = 'รายละเอียด'
  Swal.fire({
    title: titleShow,
    html: msg,
    icon: 'info',
    allowOutsideClick: false,
    confirmButtonText: 'Ok'
  }).then(() => {
    if (callback) callback()
  })
}
export function confirmSubmit(msg, title, callback, buttonInfo, icon, msgStyle) {
  const showDenyButton = buttonInfo && buttonInfo.denyText ? true : false

  let titleShow = null
  if (title) titleShow = title
  else titleShow = 'ยืนยันทำรายการ'

  let msgShow = null
  if (msg) msgShow = msg
  else msgShow = ''

  // Apply custom styling to the message if provided
  if (msgStyle) {
    msgShow = `<div style="${msgStyle}">${msgShow}</div>`
  } else {
    // Apply default styling to the message
    msgShow = `<div style="color: #921313; font-weight: 700;">${msgShow}</div>`
    titleShow = `<div style="color: #921313; font-weight: 700;">${titleShow}</div>`
  }

  Swal.fire({
    title: titleShow,
    html: msgShow,
    icon: icon ? icon : 'warning',
    allowOutsideClick: false,
    showCancelButton: true,
    showDenyButton: showDenyButton,
    denyButtonText: buttonInfo && buttonInfo.denyText,
    cancelButtonText: buttonInfo && buttonInfo.cancelText ? buttonInfo.cancelText : 'ยกเลิก',
    cancelButtonColor: '#393939',
    confirmButtonText: buttonInfo && buttonInfo.confirmText ? buttonInfo.confirmText : 'ยืนยัน',
    confirmButtonColor: '#921313'
  }).then((res) => {
    if (!res.isDismissed) callback(res)
  })
}

export default {
  error,
  success,
  info,
  warning,
  confirmSubmit

  //submit,
}
