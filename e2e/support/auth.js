/**
 * Auth bypass สำหรับ E2E
 *
 * แอปอ่าน localStorage (src/stores/modules/authen/authen-store.js):
 *   - 'token-dk'       → "Bearer <jwt>"  (isAuthenticated = มี token)
 *   - 'user-dk'        → JSON user ที่มี role: [{ name, level }]
 *   - 'permissions-dk' → JSON array ของ permission string (router guard + เมนู ใช้ตัวนี้)
 *
 * seedAuth ใช้ addInitScript เพื่อให้ค่าอยู่ก่อนโค้ดแอปรันทุกครั้งที่ navigate
 */

export const FAKE_TOKEN = 'Bearer e2e-fake-jwt-token'

export const FAKE_USER = {
  id: 1,
  username: 'e2e.tester',
  firstName: 'E2E',
  lastName: 'Tester',
  role: [{ id: 1, name: 'Dev', level: 100 }]
}

export const DEFAULT_PERMISSIONS = ['dashboard', 'sale:view', 'sale:create']

/**
 * @param {import('@playwright/test').Page} page
 * @param {Object} [opts]
 * @param {Object} [opts.user]
 * @param {string[]} [opts.permissions]
 */
export async function seedAuth(page, opts = {}) {
  const user = opts.user || FAKE_USER
  const permissions = opts.permissions || DEFAULT_PERMISSIONS
  await page.addInitScript(
    ({ token, user, permissions }) => {
      localStorage.setItem('token-dk', token)
      localStorage.setItem('user-dk', JSON.stringify(user))
      localStorage.setItem('permissions-dk', JSON.stringify(permissions))
    },
    { token: FAKE_TOKEN, user, permissions }
  )
}

export default seedAuth
