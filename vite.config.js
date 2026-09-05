import { fileURLToPath, URL } from 'node:url'
import fs from 'node:fs'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'

function removeConsolePlugin(removeConsole = true) {
  return {
    name: 'remove-console',
    transform(code, id) {
      if (removeConsole && !id.includes('node_modules')) {
        return {
          code: code.replace(/console\.\w+\(.*?\);?/g, ''),
          map: null
        }
      }
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig(() => {
  const removeConsole = false // true >> colse console.log

  return {
    plugins: [
      vue(),
      VueI18nPlugin({
        runtimeOnly: false
      }),
      removeConsolePlugin(removeConsole)
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    define: {
      __DEV__: !removeConsole,
      __REMOVE_CONSOLE__: removeConsole
    },
    server: {
      port: 2002,
      strictPort: true,
      // เปิด HTTPS + รับการเชื่อมต่อจากเครื่องอื่นเฉพาะตอนทดสอบบนมือถือ
      // (กล้องบังคับ secure context — http://<ip> ใช้กล้องไม่ได้)
      // ปกติรัน npm run dev ไม่ได้ตั้ง env สองตัวนี้ พฤติกรรมเดิมจึงไม่เปลี่ยน
      host: process.env.VITE_EXPOSE_HOST === 'true' ? true : undefined,
      https:
        process.env.VITE_HTTPS_KEY && process.env.VITE_HTTPS_CERT
          ? {
              key: fs.readFileSync(process.env.VITE_HTTPS_KEY),
              cert: fs.readFileSync(process.env.VITE_HTTPS_CERT)
            }
          : undefined,
      // proxy สำหรับทดสอบบนมือถือผ่าน tunnel (HTTPS) — ให้ API วิ่งผ่าน origin เดียวกับหน้าเว็บ
      // จะได้ไม่ติด CORS ที่ฝั่ง API อนุญาตเฉพาะ localhost ตอน development
      // ใช้เมื่อรัน dev server ด้วย VITE_JEWELRY_API_URL=/jwapi/ เท่านั้น ปกติ (localhost:2002) ไม่ถูกเรียกใช้
      proxy: {
        '/jwapi': {
          target: 'http://localhost:2001',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/jwapi/, '')
        }
      }
    }
  }
})
