import { test, expect } from '@playwright/test'
import { installApiMocks } from './support/api-mocks.js'
import { seedAuth } from './support/auth.js'

// ถ้า shell โหลดไม่ขึ้นหลัง login ทุกหน้าใช้งานต่อไม่ได้ -- ทดสอบ router guard + permission + เมนูหลัก
test.describe('app shell หลัง login', () => {
  test('เข้า /dashboard ได้ เห็นแถบเมนูบนและเมนูหลักตามสิทธิ์', async ({ page }) => {
    const api = await installApiMocks(page)
    await seedAuth(page)
    await page.goto('/dashboard')

    await expect(page).toHaveURL(/\/dashboard$/)

    const topbar = page.locator('.main-bar-container')
    await expect(topbar.locator('.nav-item', { hasText: 'หน้าแรก' })).toBeVisible()
    await expect(topbar.locator('.nav-item', { hasText: 'แจ้งปัญหา' })).toBeVisible()
    await expect(topbar.locator('.nav-item', { hasText: 'การแจ้งเตือน' })).toBeVisible()
    await expect(topbar).toContainText('E2E Tester')

    // เมนูหลักตามสิทธิ์ sale:view -- "งานขาย" ต้องมี, สิทธิ์ที่ไม่ได้ให้ (เช่น งานผลิต) ต้องไม่โผล่
    const menu = page.locator('.menu-list-container')
    await expect(menu.locator('.menu-label', { hasText: 'งานขาย' })).toBeVisible()
    await expect(menu.locator('.menu-label', { hasText: 'งานผลิต' })).toHaveCount(0)

    api.assertNoLeak()
  })

  test('ไม่มี token แล้วเข้าหน้าภายในจะถูกส่งไป /login', async ({ page }) => {
    const api = await installApiMocks(page)
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)
    api.assertNoLeak()
  })
})
