import { createRouter, createWebHistory } from 'vue-router'
import authenRoutes from './web/authen-routes.js'
import landingRoutes from './web/landing-route.js'
import { useAuthStore } from '@/stores/modules/authen/authen-store.js'
import { PermissionService } from '@/services/permission/permission.js'

const routes = [...landingRoutes, ...authenRoutes]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const { isAuthenticated, user } = authStore

  // ตรวจสอบว่าเป็น public route หรือไม่
  const isPublicRoute = landingRoutes.some(
    (route) =>
      route.path === to.path ||
      (route.children && route.children.some((child) => child.path === to.path))
  )

  // ตรวจสอบ permission
  // router guard
  const checkRoutePermission = (user, route) => {
    // อนุญาต dashboard และ user-account เสมอ
    if (route.name === 'dashboard' || route.name === 'user-account') return true

    // ถ้าไม่มี user หรือไม่มี role ไม่อนุญาตให้เข้าถึง route อื่น
    if (!user?.role || user.role.length === 0) return false

    // เช็ค permissions ปกติ
    if (!route.meta?.permissions) return false
    const permissionService = new PermissionService(user)
    return permissionService.hasAnyPermission(route.meta.permissions)
  }

  // 1. ถ้ายังไม่ login และพยายามเข้า private route
  if (!isPublicRoute && !isAuthenticated) {
    return next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  }

  // 2. ถ้า login แล้วพยายามเข้า public route
  if (isPublicRoute && isAuthenticated) {
    return next({ path: '/dashboard' })
  }

  // 3. ถ้า login แล้วแต่ยังไม่มีข้อมูล user
  if (isAuthenticated && !user) {
    try {
      await authStore.fetchUserProfile()
      const updatedUser = JSON.parse(localStorage.getItem('user-dk'))

      // เช็ค permission หลังจากได้ข้อมูล user
      if (!checkRoutePermission(updatedUser, to)) {
        return next({ path: '/dashboard' })
      }

      return next()
    } catch {
      authStore.logout()
      return next('/login')
    }
  }

  // 4. ตรวจสอบ permission สำหรับ route ที่ต้องการเข้าถึง
  if (isAuthenticated && user && !checkRoutePermission(user, to)) {
    return next({ path: '/dashboard' })
  }

  return next()
})

// Handle errors
router.onError((error) => {
  const authStore = useAuthStore()
  if (error.message.includes('Authentication')) {
    authStore.logout()
    router.push('/login')
  }
})

export default router
