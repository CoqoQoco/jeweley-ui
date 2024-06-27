import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import { resolve, dirname } from 'node:path'
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
        include: resolve(dirname(fileURLToPath(import.meta.url)), './path/to/src/locales/**')
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
    }
  }
})
