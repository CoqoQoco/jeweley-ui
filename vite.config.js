import { fileURLToPath, pathToFileURL, URL } from 'node:url'
import fs from 'node:fs'
import os from 'node:os'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'

import { formatBuildVersion, versionJsonPlugin } from './vite-plugins/version-json.js'

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

// dev เท่านั้น (TK202611170014): หน้าเว็บ local ส่ง token-dk ไปเก็บใน Keychain ให้ Claude ใช้ยิง ticket API
// plugin อยู่นอก repo (~/.claude/scripts/claude-api) — เครื่องที่ไม่มีไฟล์นี้ / build / vitest = ข้าม
async function claudeTokenSync() {
  const p = `${os.homedir()}/.claude/scripts/claude-api/vite-plugin.mjs`
  // โหมดทดสอบมือถือ (VITE_EXPOSE_HOST) ข้าม — กันคนที่ login บนมือถือผ่าน tunnel มาทับ token ของ dev
  if (process.env.VITEST || process.env.VITE_EXPOSE_HOST === 'true' || !fs.existsSync(p)) return null
  try {
    return (await import(pathToFileURL(p).href)).default('dk')
  } catch (e) {
    // plugin เสีย ต้องไม่ทำให้ dev server / Playwright เปิดไม่ขึ้น
    console.warn(`[claude] ข้าม token sync: ${e.message}`)
    return null
  }
}

// https://vitejs.dev/config/
export default defineConfig(async ({ command }) => {
  const appVersion = formatBuildVersion()
  const removeConsole = false // true >> colse console.log

  return {
    plugins: [
      vue(),
      VueI18nPlugin({
        runtimeOnly: false
      }),
      removeConsolePlugin(removeConsole),
      versionJsonPlugin(appVersion),
      command === 'serve' && (await claudeTokenSync())
    ].filter(Boolean),
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
