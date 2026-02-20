import LayoutMobile from '@/layout/mobile/LayoutMobile.vue'

/**
 * Mobile Protected Routes
 *
 * หมายเหตุ: Mobile routes จะมีโครงสร้างและ features แยกจาก web routes
 * - บาง features จะมีเฉพาะใน mobile เท่านั้น (เช่น scan, quick tasks)
 * - บาง features จะมีทั้งใน mobile และ web แต่ UI/UX ต่างกัน
 *
 * Path Convention: /mobile/* สำหรับทุก mobile routes
 */
const routes = [
  {
    path: '/mobile',
    component: LayoutMobile,
    redirect: '/mobile/dashboard',
    name: 'mobile-main',
    meta: {
      requiresAuth: true
    },
    children: [
      // ========== Mobile Dashboard ==========
      {
        path: 'dashboard',
        name: 'mobile-dashboard',
        component: () => import('@/views/mobile/dashboard/index-view.vue'),
        meta: {
          Displayname: { en: 'Home', th: 'หน้าแรก' },
          classIcon: 'bi bi-house-door-fill',
          requiresAuth: true,
          permissions: ['mobile:dashboard']
        }
      },

      // ========== Mobile-Specific Features ==========
      // 🆕 Scan Feature (Mobile Only)
      {
        path: 'scan',
        name: 'mobile-scan',
        component: () => import('@/views/mobile/scan/index-view.vue'),
        meta: {
          Displayname: { en: 'Scan', th: 'สแกน QR' },
          classIcon: 'bi bi-qr-code-scan',
          requiresAuth: true,
          permissions: ['mobile:scan']
        }
      },

      // 🆕 Quick Tasks (Mobile Only)
      {
        path: 'tasks',
        name: 'mobile-tasks',
        component: () => import('@/views/mobile/tasks/index-view.vue'),
        meta: {
          Displayname: { en: 'Tasks', th: 'งานของฉัน' },
          classIcon: 'bi bi-list-task',
          requiresAuth: true,
          permissions: ['mobile:tasks']
        }
      },

      // 🆕 Cost Version Detail (Mobile Only)
      {
        path: 'cost-version/:jobRunning',
        name: 'mobile-cost-version-detail',
        component: () => import('@/views/mobile/cost-version-detail/index-view.vue'),
        meta: {
          Displayname: { en: 'Cost Version Detail', th: 'รายละเอียดการตีราคา' },
          requiresAuth: true,
          permissions: ['mobile:tasks']
        }
      },

      // 🆕 Sale Order (Mobile)
      {
        path: 'sale',
        name: 'mobile-sale',
        component: () => import('@/views/mobile/sale/index-view.vue'),
        meta: {
          Displayname: { en: 'Sale Order', th: 'ใบสั่งขาย' },
          classIcon: 'bi bi-receipt',
          requiresAuth: true,
          permissions: ['mobile:sale']
        }
      },
      {
        path: 'sale/create',
        name: 'mobile-sale-create',
        component: () => import('@/views/mobile/sale/create-view.vue'),
        meta: {
          Displayname: { en: 'Create Sale Order', th: 'สร้างใบสั่งขาย' },
          requiresAuth: true,
          permissions: ['mobile:sale']
        }
      },
      {
        path: 'sale/detail/:soNumber',
        name: 'mobile-sale-detail',
        component: () => import('@/views/mobile/sale/detail-view.vue'),
        meta: {
          Displayname: { en: 'Sale Order Detail', th: 'รายละเอียดใบสั่งขาย' },
          requiresAuth: true,
          permissions: ['mobile:sale']
        }
      },

      // ========== Shared Features (มีทั้ง Web & Mobile) ==========
      // แต่ UI/UX ต่างกัน - Mobile เน้น touch-friendly, quick actions

      // Profile
      {
        path: 'profile',
        name: 'mobile-profile',
        component: () => import('@/views/mobile/profile/index-view.vue'),
        meta: {
          Displayname: { en: 'Profile', th: 'โปรไฟล์' },
          classIcon: 'bi bi-person-fill',
          requiresAuth: true,
          permissions: ['mobile:profile']
        }
      },

      // Notifications (Mobile)
      {
        path: 'notifications',
        name: 'mobile-notifications',
        component: () => import('@/views/mobile/notifications/index-view.vue'),
        meta: {
          Displayname: { en: 'Notifications', th: 'การแจ้งเตือน' },
          classIcon: 'bi bi-bell',
          requiresAuth: true,
          permissions: ['mobile:notifications']
        }
      },

      // 🔮 ตัวอย่าง Features ที่จะเพิ่มในอนาคต
      // (ยังไม่ได้ implement - รอรายละเอียดจาก user)

      // Production-related (Mobile Version)
      // {
      //   path: 'production',
      //   name: 'mobile-production',
      //   component: () => import('@/views/mobile/production/index-view.vue'),
      //   meta: {
      //     Displayname: { en: 'Production', th: 'แผนการผลิต' },
      //     classIcon: 'bi bi-gear-fill',
      //     requiresAuth: true,
      //     permissions: ['production:view']
      //   }
      // },

      // Stock Management (Mobile Version)
      // {
      //   path: 'stock',
      //   name: 'mobile-stock',
      //   component: () => import('@/views/mobile/stock/index-view.vue'),
      //   meta: {
      //     Displayname: { en: 'Stock', th: 'สต็อก' },
      //     classIcon: 'bi bi-box-seam',
      //     requiresAuth: true,
      //     permissions: ['stock-gem:view', 'stock-product:view']
      //   }
      // },

      // Cost/Appraisal (Mobile Version)
      // {
      //   path: 'cost-stock',
      //   name: 'mobile-cost-stock',
      //   component: () => import('@/views/mobile/cost-stock/index-view.vue'),
      //   meta: {
      //     Displayname: { en: 'Appraisal', th: 'ตีราคาสินค้า' },
      //     classIcon: 'bi bi-gem',
      //     requiresAuth: true,
      //     permissions: ['stock-product:view']
      //   }
      // },

      // Notifications (Mobile)
      // {
      //   path: 'notifications',
      //   name: 'mobile-notifications',
      //   component: () => import('@/views/mobile/notifications/index-view.vue'),
      //   meta: {
      //     Displayname: { en: 'Notifications', th: 'การแจ้งเตือน' },
      //     classIcon: 'bi bi-bell',
      //     requiresAuth: true
      //   }
      // },

      // Settings (Mobile)
      // {
      //   path: 'settings',
      //   name: 'mobile-settings',
      //   component: () => import('@/views/mobile/settings/index-view.vue'),
      //   meta: {
      //     Displayname: { en: 'Settings', th: 'ตั้งค่า' },
      //     classIcon: 'bi bi-gear',
      //     requiresAuth: true
      //   }
      // }
    ]
  }
]

export default routes
