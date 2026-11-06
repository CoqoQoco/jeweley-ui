import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright config สำหรับ E2E ของ jeweley-ui
 *
 * spec ใน e2e/ รันบน mock ทั้งหมด (ดู e2e/support/api-mocks.js) — local API ต่อ DB production
 * จึงห้ามมี request ใดหลุดไป API จริง webServer บังคับ API URL ชี้ localhost:2001 เพื่อให้ mock ดักได้เสมอ
 * golden suite ต้องรันด้วย workers=1 (ดู scripts/check-golden.mjs)
 */
const DEV_PORT = 2002

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',

  timeout: 30000,
  expect: { timeout: 7000 },

  use: {
    baseURL: `http://localhost:${DEV_PORT}`,
    trace: 'on-first-retry',
    actionTimeout: 10000,
    navigationTimeout: 20000
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],

  webServer: {
    command: 'npm run dev',
    url: `http://localhost:${DEV_PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: {
      VITE_JEWELRY_API_URL: 'http://localhost:2001/',
      VITE_PRINTER_API_URL: 'http://localhost:7003/'
    }
  }
})
