# Routing Strategy - Mobile vs Web Routes

## 📋 สรุปโครงสร้างปัจจุบัน

### ✅ โครงสร้างที่มีอยู่แล้ว

```
src/
├── router/
│   ├── index.js                    # Main router config
│   └── web/                        # Web routes (Desktop/Tablet)
│       ├── authen-routes.js        # Protected routes
│       └── landing-route.js        # Public routes (login)
│
├── layout/
│   └── web/
│       ├── LayoutDashboard.vue     # Main layout (sticky mainBar + sidebar)
│       └── LayoutLogin.vue         # Login layout
│
├── components/
│   ├── layout/
│   │   ├── main-bar.vue            # Top navigation (223 lines)
│   │   └── side-bar.vue            # Slide-in sidebar (345+ lines)
│   └── prime-vue/                  # 10 reusable PrimeVue wrappers
│
└── stores/
    └── modules/
        └── authen/
            └── authen-store.js     # JWT auth + permissions
```

### 🎯 Flow การ Authentication ปัจจุบัน

```
1. Login (LoginView.vue)
   ↓
2. authStore.login({ username, password })
   ↓
3. POST /Landing/login → Save token to localStorage
   ↓
4. fetchUserProfile() → GET /User/Get → Save user data
   ↓
5. router.push('/dashboard')
   ↓
6. router.beforeEach() checks:
   - isAuthenticated?
   - isPublicRoute?
   - hasPermission?
   ↓
7. Render: LayoutDashboard + router-view
```

---

## 🚀 โครงสร้างที่จะสร้างเพิ่ม

```
src/
├── router/
│   ├── index.js                    # ปรับปรุง: เพิ่ม device detection
│   ├── web/                        # ✅ มีอยู่แล้ว
│   │   ├── authen-routes.js
│   │   └── landing-route.js
│   └── mobile/                     # 🆕 ใหม่
│       ├── authen-routes.js        # Mobile protected routes
│       └── landing-route.js        # Mobile login route
│
├── layout/
│   ├── web/                        # ✅ มีอยู่แล้ว
│   └── mobile/                     # 🆕 ใหม่
│       ├── LayoutMobile.vue        # Mobile main (bottom nav)
│       └── LayoutMobileLogin.vue   # Mobile login
│
├── components/
│   ├── layout/
│   │   ├── main-bar.vue            # ✅ Web only
│   │   ├── side-bar.vue            # ✅ Web only
│   │   ├── mobile-bottom-nav.vue   # 🆕 Mobile bottom navigation
│   │   └── mobile-top-bar.vue      # 🆕 Mobile top bar (optional)
│   │
│   └── generic-components/         # 🆕 Reusable for both mobile & web
│       ├── GenericButton.vue
│       ├── GenericCard.vue
│       ├── GenericModal.vue
│       ├── GenericInputText.vue
│       ├── GenericDropdown.vue
│       └── ... (more generic components)
│
├── views/
│   └── mobile/                     # 🆕 Mobile-specific views
│       ├── dashboard/
│       ├── cost-stock/
│       └── production/
│
├── stores/
│   └── modules/
│       └── device/                 # 🆕 Device detection store
│           └── device-store.js
│
└── assets/scss/
    ├── custom-style/               # ✅ Legacy (ไม่แก้)
    └── responsive-style/
        ├── web/                    # ✅ Desktop/Tablet utilities
        └── mobile/                 # 🆕 Mobile utilities
            ├── index.scss
            ├── mobile-utilities.scss
            └── README.md
```

---

## 🎯 วิธีการแยก Mobile vs Web Routes

### **วิธีที่ 1: URL Path Convention** ⭐ **แนะนำ**

**Concept:**
- Web routes: `/dashboard`, `/production`, `/cost-stock`
- Mobile routes: `/mobile/dashboard`, `/mobile/production`, `/mobile/cost-stock`

**ข้อดี:**
- ✅ ชัดเจน ง่ายต่อการ debug
- ✅ SEO friendly (ถ้ามี)
- ✅ สามารถ share link ข้าม device ได้
- ✅ User สามารถ manual switch ได้ (เพิ่ม toggle button)

**ข้อเสีย:**
- ⚠️ URL ยาวขึ้น
- ⚠️ ต้อง maintain 2 sets of routes

**Implementation:**
```javascript
// router/index.js
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  ) || window.innerWidth < 768
}

router.beforeEach((to, from, next) => {
  const mobile = isMobileDevice()
  const isWebRoute = !to.path.startsWith('/mobile')
  const isMobileRoute = to.path.startsWith('/mobile')

  // Auto-redirect based on device
  if (mobile && isWebRoute && to.name !== 'login') {
    const mobilePath = `/mobile${to.path}`
    const routeExists = router.resolve(mobilePath).matched.length > 0
    if (routeExists) return next(mobilePath)
  }

  if (!mobile && isMobileRoute) {
    const webPath = to.path.replace('/mobile', '') || '/dashboard'
    return next(webPath)
  }

  next()
})
```

---

### **วิธีที่ 2: Same Path + Different Layouts**

**Concept:**
- ใช้ path เดียวกัน แต่ render layout ต่างกัน
- ตัวอย่าง: `/cost-stock` render `LayoutDashboard` (web) หรือ `LayoutMobile` (mobile)

**ข้อดี:**
- ✅ URL สั้น เหมือนเดิม
- ✅ Share link ได้ง่าย

**ข้อเสีย:**
- ⚠️ Component ต้องรองรับทั้ง 2 แบบ (responsive มาก)
- ⚠️ Code ซับซ้อนขึ้น
- ⚠️ ยากต่อการแยก mobile-specific features

**Implementation:**
```javascript
// router/web/authen-routes.js
import { isMobileDevice } from '@/utils/device-detection.js'

const routes = [
  {
    path: '/cost-stock',
    component: () => {
      // Dynamic layout based on device
      return isMobileDevice()
        ? import('@/layout/mobile/LayoutMobile.vue')
        : import('@/layout/web/LayoutDashboard.vue')
    },
    children: [
      {
        path: '',
        component: () => {
          return isMobileDevice()
            ? import('@/views/mobile/cost-stock/index-view.vue')
            : import('@/views/cost-stock/web/cost-edit/index-view.vue')
        }
      }
    ]
  }
]
```

**⚠️ ไม่แนะนำวิธีนี้** เพราะ code จะซับซ้อนและยาก maintain

---

### **วิธีที่ 3: Subdomain**

**Concept:**
- Web: `https://app.duangkaew.com`
- Mobile: `https://m.duangkaew.com`

**ข้อดี:**
- ✅ แยกเป็น app คนละตัว
- ✅ Deploy แยกกัน
- ✅ Optimize ได้เฉพาะทาง

**ข้อเสีย:**
- ⚠️ ต้องจัดการ subdomain
- ⚠️ Auth token sharing ซับซ้อนขึ้น
- ⚠️ ต้อง build/deploy 2 ครั้ง

**⚠️ ไม่เหมาะกับระบบนี้** เพราะเป็น internal system

---

### **วิธีที่ 4: Device Detection + LocalStorage Preference** ⭐ **แนะนำร่วมกับวิธีที่ 1**

**Concept:**
- Auto-detect device type
- แต่ให้ user override ได้ผ่าน toggle (เก็บใน localStorage)
- ตัวอย่าง: Mobile user อาจอยากดู Desktop version

**ข้อดี:**
- ✅ Flexible ที่สุด
- ✅ User มี control
- ✅ Dev/QA test ได้ง่าย

**Implementation:**
```javascript
// stores/modules/device/device-store.js
import { defineStore } from 'pinia'

export const useDeviceStore = defineStore('device', {
  state: () => ({
    // Auto-detect or from localStorage
    preferredMode: localStorage.getItem('view-mode') || 'auto', // 'auto', 'mobile', 'desktop'
    screenWidth: window.innerWidth,
    userAgent: navigator.userAgent
  }),

  getters: {
    isMobileDevice(state) {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        state.userAgent
      )
    },

    isMobileWidth(state) {
      return state.screenWidth < 768
    },

    shouldUseMobileView(state) {
      if (state.preferredMode === 'mobile') return true
      if (state.preferredMode === 'desktop') return false
      // Auto mode
      return this.isMobileDevice || this.isMobileWidth
    }
  },

  actions: {
    setViewMode(mode) {
      this.preferredMode = mode
      localStorage.setItem('view-mode', mode)
    },

    updateScreenWidth() {
      this.screenWidth = window.innerWidth
    }
  }
})
```

```javascript
// router/index.js
import { useDeviceStore } from '@/stores/modules/device/device-store.js'

router.beforeEach((to, from, next) => {
  const deviceStore = useDeviceStore()
  const shouldUseMobile = deviceStore.shouldUseMobileView

  // ... redirect logic
})
```

```vue
<!-- components/layout/ViewModeToggle.vue -->
<template>
  <div class="view-mode-toggle">
    <button @click="toggleViewMode">
      <i :class="currentIcon"></i>
      {{ currentLabel }}
    </button>
  </div>
</template>

<script>
import { useDeviceStore } from '@/stores/modules/device/device-store.js'

export default {
  setup() {
    const deviceStore = useDeviceStore()
    return { deviceStore }
  },

  computed: {
    currentMode() {
      return this.deviceStore.preferredMode
    },

    currentIcon() {
      return this.deviceStore.shouldUseMobileView
        ? 'bi bi-phone'
        : 'bi bi-laptop'
    },

    currentLabel() {
      return this.deviceStore.shouldUseMobileView
        ? 'มุมมองมือถือ'
        : 'มุมมองเดสก์ท็อป'
    }
  },

  methods: {
    toggleViewMode() {
      const newMode = this.deviceStore.shouldUseMobileView ? 'desktop' : 'mobile'
      this.deviceStore.setViewMode(newMode)
      // Reload or redirect
      this.$router.go(0) // Reload to apply new view
    }
  }
}
</script>
```

---

## 🎯 แนวทางที่แนะนำ (Best Practice)

### **แบบที่ 1: Path Convention + Auto Detection + User Override** ⭐

**เหมาะกับ:** ระบบที่ต้องการ flexibility สูง

**กลยุทธ์:**
1. ใช้ `/mobile/*` สำหรับ mobile routes
2. Auto-detect device และ redirect
3. ให้ user toggle ได้ (เก็บใน localStorage)
4. Developer mode สามารถ test ทั้ง 2 mode ได้

**ข้อดี:**
- ✅ ชัดเจนที่สุด
- ✅ User มี control
- ✅ Easy to debug
- ✅ SEO friendly

**ข้อเสีย:**
- ⚠️ Maintain 2 sets of routes

---

### **แบบที่ 2: Pure Responsive (Single Path)** 💡

**เหมาะกับ:** ระบบที่ UI ใกล้เคียงกันมาก

**กลยุทธ์:**
1. ใช้ path เดียวกัน
2. Components responsive เต็มที่
3. ใช้ SCSS breakpoints แยก mobile/tablet/desktop
4. **ไม่แนะนำ** ถ้า mobile UI แตกต่างมาก (เช่น bottom nav vs sidebar)

**ข้อดี:**
- ✅ URL เดียว
- ✅ Code base เดียว

**ข้อเสีย:**
- ⚠️ Component ซับซ้อน
- ⚠️ ยากต่อการแยก logic mobile-specific

---

## 📝 Implementation Checklist

### สำหรับ **แบบที่ 1** (Path Convention - แนะนำ)

```
☐ 1. สร้าง Device Store
   ☐ src/stores/modules/device/device-store.js
   ☐ state: preferredMode, screenWidth, userAgent
   ☐ getters: isMobileDevice, shouldUseMobileView
   ☐ actions: setViewMode, updateScreenWidth

☐ 2. สร้าง Mobile Routes
   ☐ src/router/mobile/authen-routes.js
   ☐ src/router/mobile/landing-route.js

☐ 3. สร้าง Mobile Layouts
   ☐ src/layout/mobile/LayoutMobile.vue
   ☐ src/layout/mobile/LayoutMobileLogin.vue

☐ 4. สร้าง Mobile Components
   ☐ src/components/layout/mobile-bottom-nav.vue
   ☐ src/components/layout/mobile-top-bar.vue (optional)

☐ 5. ปรับปรุง Main Router
   ☐ src/router/index.js
   ☐ Import mobile routes
   ☐ เพิ่ม beforeEach logic สำหรับ auto-redirect
   ☐ Check device type และ redirect

☐ 6. สร้าง Generic Components (re-use ทั้ง mobile & web)
   ☐ src/components/generic-components/GenericButton.vue
   ☐ src/components/generic-components/GenericCard.vue
   ☐ src/components/generic-components/GenericModal.vue
   ☐ src/components/generic-components/GenericInputText.vue
   ☐ src/components/generic-components/GenericDropdown.vue

☐ 7. สร้าง Mobile SCSS
   ☐ src/assets/scss/responsive-style/mobile/index.scss
   ☐ src/assets/scss/responsive-style/mobile/mobile-utilities.scss

☐ 8. สร้าง View Mode Toggle (optional)
   ☐ src/components/layout/ViewModeToggle.vue
   ☐ เพิ่มใน main-bar.vue (web)
   ☐ เพิ่มใน mobile-top-bar.vue (mobile)

☐ 9. สร้าง Mobile Views
   ☐ src/views/mobile/dashboard/index-view.vue
   ☐ src/views/mobile/cost-stock/index-view.vue
   ☐ src/views/mobile/production/index-view.vue

☐ 10. Testing
   ☐ Test auto-redirect on mobile device
   ☐ Test auto-redirect on desktop
   ☐ Test manual toggle
   ☐ Test localStorage persistence
   ☐ Test permissions on mobile routes
```

---

## 🔍 ตัวอย่าง Code

### 1. Device Detection Utility

```javascript
// src/utils/device-detection.js
export const isMobileDevice = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera

  // Check user agent
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
  const isMobileUA = mobileRegex.test(userAgent)

  // Check screen width
  const isMobileWidth = window.innerWidth < 768

  return isMobileUA || isMobileWidth
}

export const isTablet = () => {
  return window.innerWidth >= 768 && window.innerWidth <= 1024
}

export const isDesktop = () => {
  return window.innerWidth > 1024
}

export const getDeviceType = () => {
  if (isMobileDevice()) return 'mobile'
  if (isTablet()) return 'tablet'
  return 'desktop'
}
```

---

### 2. Updated Router with Auto-Redirect

```javascript
// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/modules/authen/authen-store.js'
import { useDeviceStore } from '@/stores/modules/device/device-store.js'
import { PermissionService } from '@/services/permission/permission.js'

// Web routes
import webAuthenRoutes from './web/authen-routes.js'
import webLandingRoutes from './web/landing-route.js'

// Mobile routes
import mobileAuthenRoutes from './mobile/authen-routes.js'
import mobileLandingRoutes from './mobile/landing-route.js'

const routes = [
  ...webLandingRoutes,
  ...webAuthenRoutes,
  ...mobileLandingRoutes,
  ...mobileAuthenRoutes
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Helper function
const checkRoutePermission = (user, route) => {
  if (route.name === 'dashboard' || route.name === 'user-account') return true
  if (route.name === 'mobile-dashboard' || route.name === 'mobile-profile') return true

  if (!user?.role || user.role.length === 0) return false
  if (!route.meta?.permissions) return false

  const permissionService = new PermissionService(user)
  return permissionService.hasAnyPermission(route.meta.permissions)
}

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const deviceStore = useDeviceStore()
  const { isAuthenticated, user } = authStore

  // === 1. Device-based Redirect ===
  const shouldUseMobile = deviceStore.shouldUseMobileView
  const isWebRoute = !to.path.startsWith('/mobile')
  const isMobileRoute = to.path.startsWith('/mobile')

  // Mobile device เข้า web route → redirect to mobile
  if (shouldUseMobile && isWebRoute && to.name !== 'routes-login') {
    const mobilePath = `/mobile${to.path}`
    const mobileRouteExists = router.resolve(mobilePath).matched.length > 0

    if (mobileRouteExists) {
      return next(mobilePath)
    }
  }

  // Desktop/Tablet device เข้า mobile route → redirect to web
  if (!shouldUseMobile && isMobileRoute) {
    const webPath = to.path.replace('/mobile', '') || '/dashboard'
    return next(webPath)
  }

  // === 2. Authentication Check ===
  const allPublicRoutes = [...webLandingRoutes, ...mobileLandingRoutes]
  const isPublicRoute = allPublicRoutes.some(
    (route) =>
      route.path === to.path ||
      (route.children && route.children.some((child) => child.path === to.path))
  )

  // Not logged in + accessing private route
  if (!isPublicRoute && !isAuthenticated) {
    return next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  }

  // Logged in + accessing public route
  if (isPublicRoute && isAuthenticated) {
    const redirectPath = shouldUseMobile ? '/mobile/dashboard' : '/dashboard'
    return next({ path: redirectPath })
  }

  // Logged in but no user data
  if (isAuthenticated && !user) {
    try {
      await authStore.fetchUserProfile()
      const updatedUser = JSON.parse(localStorage.getItem('user-dk'))

      if (!checkRoutePermission(updatedUser, to)) {
        const redirectPath = shouldUseMobile ? '/mobile/dashboard' : '/dashboard'
        return next({ path: redirectPath })
      }

      return next()
    } catch {
      authStore.logout()
      return next('/login')
    }
  }

  // === 3. Permission Check ===
  if (isAuthenticated && user && !checkRoutePermission(user, to)) {
    const redirectPath = shouldUseMobile ? '/mobile/dashboard' : '/dashboard'
    return next({ path: redirectPath })
  }

  return next()
})

// Error handler
router.onError((error) => {
  const authStore = useAuthStore()
  if (error.message.includes('Authentication')) {
    authStore.logout()
    router.push('/login')
  }
})

export default router
```

---

### 3. Mobile Routes Example

```javascript
// src/router/mobile/authen-routes.js
import LayoutMobile from '@/layout/mobile/LayoutMobile.vue'

const routes = [
  {
    path: '/mobile',
    component: LayoutMobile,
    redirect: '/mobile/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'mobile-dashboard',
        component: () => import('@/views/mobile/dashboard/index-view.vue'),
        meta: {
          Displayname: { en: 'Home', th: 'หน้าแรก' },
          classIcon: 'bi bi-house-door-fill'
        }
      },
      {
        path: 'cost-stock',
        name: 'mobile-cost-stock',
        component: () => import('@/views/mobile/cost-stock/index-view.vue'),
        meta: {
          Displayname: { en: 'Stock Appraisal', th: 'ตีราคาสินค้า' },
          classIcon: 'bi bi-gem',
          permissions: ['stock-product:view']
        }
      },
      {
        path: 'production',
        name: 'mobile-production',
        component: () => import('@/views/mobile/production/index-view.vue'),
        meta: {
          Displayname: { en: 'Production', th: 'แผนการผลิต' },
          classIcon: 'bi bi-gear-fill',
          permissions: ['production:view']
        }
      },
      {
        path: 'profile',
        name: 'mobile-profile',
        component: () => import('@/views/mobile/profile/index-view.vue'),
        meta: {
          Displayname: { en: 'Profile', th: 'โปรไฟล์' },
          classIcon: 'bi bi-person-fill'
        }
      }
    ]
  }
]

export default routes
```

---

## 📊 เปรียบเทียบวิธีการ

| Criteria | Path Convention | Same Path + Responsive | Subdomain |
|----------|----------------|------------------------|-----------|
| **ความชัดเจน** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Flexibility** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Maintainability** | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| **Performance** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Development Speed** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **User Experience** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **SEO (if needed)** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **เหมาะกับ Internal System** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |

---

## 🎯 สรุป: แนะนำใช้ **Path Convention + Auto Detection + User Override**

**เหตุผล:**
1. ✅ ชัดเจนที่สุด (`/mobile/*` vs `/*`)
2. ✅ แยก codebase ชัดเจน ไม่ปนกัน
3. ✅ User มี control (toggle ได้)
4. ✅ Dev/QA test ได้ง่าย
5. ✅ Performance ดี (load เฉพาะ code ที่จำเป็น)
6. ✅ เหมาะกับ internal system

**การทำงาน:**
```
1. User เข้าระบบ
2. Auto-detect device (user-agent + screen width)
3. Check localStorage preference ('auto', 'mobile', 'desktop')
4. Redirect to appropriate route:
   - Mobile → /mobile/*
   - Desktop/Tablet → /*
5. User สามารถ toggle view mode ได้ตลอดเวลา
```

---

## 📞 Contact & Support

หากมีคำถามเพิ่มเติมเกี่ยว routing strategy สามารถดูเพิ่มเติมได้ที่:
- Main Router: `src/router/index.js`
- Web Routes: `src/router/web/`
- Mobile Routes: `src/router/mobile/` (จะสร้างใหม่)
- Device Store: `src/stores/modules/device/device-store.js` (จะสร้างใหม่)

---

**Last Updated:** 2026-02-11
**Version:** 1.0
**Author:** Development Team
