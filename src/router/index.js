import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/modules/authen/authen-store.js'
import { useDeviceStore } from '@/stores/modules/device/device-store.js'
import { PermissionService } from '@/services/permission/permission.js'

// Web routes (Desktop/Tablet)
import authenRoutes from './web/authen-routes.js'
import landingRoutes from './web/landing-route.js'

// Mobile routes
import mobileAuthenRoutes from './mobile/authen-routes.js'
import mobileLandingRoutes from './mobile/landing-route.js'

const routes = [...landingRoutes, ...authenRoutes, ...mobileLandingRoutes, ...mobileAuthenRoutes]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Helper: Check route permission
const checkRoutePermission = (user, route) => {
  // อนุญาต dashboard และ user-account เสมอ (ทั้ง web และ mobile)
  const allowedRoutes = ['dashboard', 'user-account', 'mobile-dashboard', 'mobile-profile']
  if (allowedRoutes.includes(route.name)) return true

  // ถ้าไม่มี user หรือไม่มี role ไม่อนุญาตให้เข้าถึง route อื่น
  if (!user?.role || user.role.length === 0) return false

  // ถ้าไม่มี permissions metadata ให้อนุญาต (เช่น mobile-specific features)
  if (!route.meta?.permissions) return true

  // เช็ค permissions ปกติ
  const permissionService = new PermissionService(user)
  return permissionService.hasAnyPermission(route.meta.permissions)
}

// Navigation guard with device detection
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const deviceStore = useDeviceStore()
  const { isAuthenticated, user } = authStore

  // === 1. Device-based Auto-Redirect ===
  const shouldUseMobile = deviceStore.shouldUseMobileView
  const isWebRoute = !to.path.startsWith('/mobile')
  const isMobileRoute = to.path.startsWith('/mobile')

  // Mobile device พยายามเข้า web route → redirect to mobile (ถ้ามี mobile route)
  if (shouldUseMobile && isWebRoute && to.name !== 'routes-login') {
    const mobilePath = `/mobile${to.path}`
    const mobileRouteExists = router.resolve(mobilePath).matched.length > 0

    if (mobileRouteExists) {
      return next({
        path: mobilePath,
        query: to.query // รักษา query parameters
      })
    }
    // ถ้าไม่มี mobile route ให้ไปหน้า dashboard
    if (isAuthenticated) {
      return next('/mobile/dashboard')
    }
  }

  // Desktop/Tablet device พยายามเข้า mobile route → redirect to web
  if (!shouldUseMobile && isMobileRoute) {
    const webPath = to.path.replace('/mobile', '') || '/dashboard'
    return next({
      path: webPath,
      query: to.query // รักษา query parameters
    })
  }

  // === 2. Authentication Check ===
  const allPublicRoutes = [...landingRoutes, ...mobileLandingRoutes]
  const isPublicRoute = allPublicRoutes.some(
    (route) =>
      route.path === to.path ||
      (route.children && route.children.some((child) => child.path === to.path))
  )

  // ยังไม่ login และพยายามเข้า private route
  if (!isPublicRoute && !isAuthenticated) {
    return next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  }

  // Login แล้วพยายามเข้า public route → redirect to dashboard
  if (isPublicRoute && isAuthenticated) {
    const dashboardPath = shouldUseMobile ? '/mobile/dashboard' : '/dashboard'
    return next({ path: dashboardPath })
  }

  // === 3. User Profile Check ===
  // Login แล้วแต่ยังไม่มีข้อมูล user → fetch profile
  if (isAuthenticated && !user) {
    try {
      await authStore.fetchUserProfile()
      const updatedUser = JSON.parse(localStorage.getItem('user-dk'))

      // เช็ค permission หลังจากได้ข้อมูล user
      if (!checkRoutePermission(updatedUser, to)) {
        const dashboardPath = shouldUseMobile ? '/mobile/dashboard' : '/dashboard'
        return next({ path: dashboardPath })
      }

      return next()
    } catch {
      authStore.logout()
      return next('/login')
    }
  }

  // === 4. Permission Check ===
  if (isAuthenticated && user && !checkRoutePermission(user, to)) {
    const dashboardPath = shouldUseMobile ? '/mobile/dashboard' : '/dashboard'
    return next({ path: dashboardPath })
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
