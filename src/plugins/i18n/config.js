//import { createI18n } from 'vue-i18n/dist/vue-i18n.cjs'
import { createI18n } from 'vue-i18n'

// Folder & File ของข้อความที่จะนำมาแสดง
import en from '@/language/en'
import th from '@/language/th'

// CONFIG
const i18n = createI18n({
  legacy: false, // ถ้าต้องการให้ใช้ใน Vue3 ได้ ต้องมี props ตัวนี้เป็น false
  //locale: localStorage.getItem('lang') ? localStorage.getItem('lang') : 'th',
  locale: 'th', // Flag ที่จะบอกว่าตอนนี้ ระบบเป็นภาษาอะไร
  fallbackLocale: 'th', // ? ยังไม่ทราบการทำงานที่ชัดเจน
  // ข้อความทั้งหมดที่จะใช้แสดง เทียบกัน 2 ภาษา
  warnHtmlMessage: false, // ปิดการแจ้งเตือน Avoid Html Render in string
  messages: {
    en: { ...en },
    th: { ...th }
  },
  globalInjection: true // ประกาศให้สามารถใช้แบบ Global ได้ $t ใน File ที่เป็น Vue2
})

export { i18n }
