import pdfMake from 'pdfmake/build/pdfmake'
import { vfs } from '@/assets/fonts/pdf-fonts.js'
import { acherusVfs } from '@/assets/fonts/acherus-grotesque-font.js'

export const initPdfMake = () => {
  pdfMake.vfs = { ...vfs, ...acherusVfs }
  pdfMake.fonts = {
    AngsanaNew: {
      normal: "Angsana New Regular.ttf",
      bold: "Angsana New Bold.ttf",
      italics: "Angsana New Italic.ttf",
      bolditalics: "Angsana New Bold Italic.ttf"
    },
    THSarabunNew: {
      normal: 'THSarabunNew.ttf',
      bold: 'THSarabunNew Bold.ttf',
      italics: 'THSarabunNew Italic.ttf',
      bolditalics: 'THSarabunNew BoldItalic.ttf'
    },
    AcherusGrotesque: {
      normal: 'AcherusGrotesque.ttf',
      bold: 'AcherusGrotesque.ttf',
      italics: 'AcherusGrotesque.ttf',
      bolditalics: 'AcherusGrotesque.ttf'
    }
    // TODO(fonts): register these families once their TTF base64 files are embedded in vfs.
    // Montserrat, Inter, and BaskervilleDisplayPT are optional catalog accents not yet available.
    //
    // Montserrat: {
    //   normal: 'Montserrat-Regular.ttf',
    //   bold: 'Montserrat-Bold.ttf',
    //   italics: 'Montserrat-Regular.ttf',
    //   bolditalics: 'Montserrat-Bold.ttf'
    // },
    // Inter: {
    //   normal: 'Inter-Regular.ttf',
    //   bold: 'Inter-Bold.ttf',
    //   italics: 'Inter-Regular.ttf',
    //   bolditalics: 'Inter-Bold.ttf'
    // },
    // BaskervilleDisplayPT: {
    //   normal: 'BaskervilleDisplayPT-Regular.ttf',
    //   bold: 'BaskervilleDisplayPT-Regular.ttf',
    //   italics: 'BaskervilleDisplayPT-Regular.ttf',
    //   bolditalics: 'BaskervilleDisplayPT-Regular.ttf'
    // }
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
