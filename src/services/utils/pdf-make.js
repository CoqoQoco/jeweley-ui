import pdfMake from 'pdfmake/build/pdfmake'
import { vfs } from '@/assets/fonts/pdf-fonts.js'

export const initPdfMake = () => {
  pdfMake.vfs = vfs
  pdfMake.fonts = {
    THSarabunNew: {
      normal: 'THSarabunNew.ttf',
      bold: 'THSarabunNew Bold.ttf',
      italics: 'THSarabunNew Italic.ttf',
      bolditalics: 'THSarabunNew BoldItalic.ttf'
    }
  }
  return pdfMake
}

// src/services/utils/dayjs.js
import dayjs from 'dayjs'
import 'dayjs/locale/th'

// import buddhistEra from 'dayjs/plugin/buddhistEra'
// dayjs.extend(buddhistEra)
// dayjs.locale('th')

export const formatDate = (date) => {
  if (!date) return ''
  return dayjs(date).format('DD/MM/YYYY')
}

export const formatDateTime = (date) => {
  if (!date) return ''
  return dayjs(date).format('DD/MM/YYYY HH:mm:ss')
}
