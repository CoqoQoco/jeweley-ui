import { createRouter, createWebHistory } from 'vue-router'

import authenRoutes from './web/authen-routes.js'
import landingRoutes from './web/landing-route.js'
import { useAuthStore } from '@/stores/modules/authen/authen-store.js'

// รวม routes ทั้งหมด
const routes = [
  ...landingRoutes, // routes สำหรับก่อน login
  ...authenRoutes // routes หลังจาก login
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

//Navigation guard
router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('token-dk')
  const user = localStorage.getItem('user-dk')
  const isAuthenticated = !!token
  const authStore = useAuthStore()

  const isAuthRequired = !landingRoutes.some(
    (route) =>
      route.path === to.path ||
      (route.children && route.children.some((child) => child.path === to.path))
  )

  if (isAuthRequired && !isAuthenticated) {
    return next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  } else if (!isAuthRequired && isAuthenticated) {
    return next({ path: '/dashboard' })
  } else if (isAuthenticated && !user) {
    try {
      await authStore.fetchUserProfile()
      return next()
    } catch {
      authStore.clearAuth()
      return next('/login')
    }
  } else {
    return next()
  }
})

// Handle authentication errors
router.onError((error) => {
  const authStore = useAuthStore()
  if (error.message.includes('Authentication')) {
    authStore.clearAuth()
    router.push('/login')
  }
})

export default router
