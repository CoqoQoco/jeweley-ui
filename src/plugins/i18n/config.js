import { createI18n } from 'vue-i18n'

import { storage } from '@/services/storage.js'

// Folder & File ของข้อความที่จะนำมาแสดง
import en from '@/language/en'
import th from '@/language/th'

// CONFIG
const i18n = createI18n({
  legacy: false, // ถ้าต้องการให้ใช้ใน Vue3 ได้ ต้องมี props ตัวนี้เป็น false
  locale: storage.getItem('lang', 'th'), // อ่านค่าจาก localStorage ผ่าน storage service
  fallbackLocale: 'th',
  warnHtmlMessage: false, // ปิดการแจ้งเตือน Avoid Html Render in string
  messages: {
    en: { ...en },
    th: { ...th }
  },
  globalInjection: true // ประกาศให้สามารถใช้แบบ Global ได้ $t ใน File ที่เป็น Vue2
})

// เปลี่ยนภาษา + บันทึกลง localStorage + set html lang attribute
function setLocale(lang) {
  i18n.global.locale.value = lang
  storage.setItem('lang', lang)
  document.documentElement.lang = lang
}

export { i18n, setLocale }
