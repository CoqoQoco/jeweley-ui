<template>
  <nav class="mobile-bottom-nav">
    <div
      v-for="item in navItems"
      :key="item.name"
      class="nav-item"
      :class="{ active: isActive(item.name) }"
      @click="navigateTo(item)"
    >
      <div class="nav-icon">
        <i :class="item.icon"></i>
        <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
      </div>
      <span class="nav-label">{{ item.label }}</span>
    </div>
  </nav>
</template>

<script>
import { useAuthStore } from '@/stores/modules/authen/authen-store.js'
import { PermissionService } from '@/services/permission/permission.js'

export default {
  name: 'MobileBottomNav',

  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },

  computed: {
    /**
     * สร้าง navigation items ตาม permissions ของ user
     */
    navItems() {
      const user = this.authStore.user
      if (!user) return this.getDefaultItems()

      const permissionService = new PermissionService(user)

      const allItems = [
        {
          name: 'mobile-dashboard',
          label: 'หน้าแรก',
          icon: 'bi bi-house-door-fill',
          path: '/mobile/dashboard',
          permission: 'mobile:dashboard',
          badge: null
        },
        {
          name: 'mobile-scan',
          label: 'สแกน',
          icon: 'bi bi-qr-code-scan',
          path: '/mobile/scan',
          permission: 'mobile:scan',
          badge: null
        },
        {
          name: 'mobile-tasks',
          label: 'งาน',
          icon: 'bi bi-list-task',
          path: '/mobile/tasks',
          permission: 'mobile:tasks',
          badge: this.getTasksCount() // จำนวนงานที่รอ
        },
        {
          name: 'mobile-profile',
          label: 'โปรไฟล์',
          icon: 'bi bi-person-fill',
          path: '/mobile/profile',
          permission: 'mobile:profile',
          badge: null
        }
      ]

      // Filter by permission
      return allItems.filter((item) => {
        if (!item.permission) return true
        return permissionService.hasPermission(item.permission)
      })
    }
  },

  methods: {
    /**
     * Navigate to route
     */
    navigateTo(item) {
      if (this.$route.path === item.path) return

      this.$router.push(item.path).catch((err) => {
        // Ignore navigation duplicated error
        if (err.name !== 'NavigationDuplicated') {
          console.error('Navigation error:', err)
        }
      })
    },

    /**
     * Check if route is active
     */
    isActive(routeName) {
      return this.$route.name === routeName
    },

    /**
     * Get default items (สำหรับ user ที่ยังไม่ได้ login)
     */
    getDefaultItems() {
      return [
        {
          name: 'mobile-dashboard',
          label: 'หน้าแรก',
          icon: 'bi bi-house-door-fill',
          path: '/mobile/dashboard',
          badge: null
        },
        {
          name: 'mobile-profile',
          label: 'โปรไฟล์',
          icon: 'bi bi-person-fill',
          path: '/mobile/profile',
          badge: null
        }
      ]
    },

    /**
     * Get tasks count (placeholder)
     * TODO: Implement real tasks count from API/Store
     */
    getTasksCount() {
      // ตัวอย่าง: ดึงจำนวนงานที่รอจาก store
      // return this.tasksStore?.pendingTasksCount || null
      return null // ไม่แสดง badge ในตอนนี้
    }
  }
}
</script>

<style lang="scss" scoped>
.mobile-bottom-nav {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
  background: white;
  padding: 8px 0;
  border-top: 1px solid #e0e0e0;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6px 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #666;
  position: relative;

  .nav-icon {
    position: relative;
    margin-bottom: 4px;

    i {
      font-size: 1.4rem;
      transition: all 0.2s ease;
    }

    .nav-badge {
      position: absolute;
      top: -4px;
      right: -8px;
      background: var(--base-font-color);
      color: white;
      font-size: 0.65rem;
      font-weight: 600;
      padding: 2px 5px;
      border-radius: 10px;
      min-width: 18px;
      text-align: center;
      line-height: 1;
    }
  }

  .nav-label {
    font-size: 0.7rem;
    text-align: center;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  // Hover state (สำหรับ tablet/desktop ที่มี hover)
  @media (hover: hover) {
    &:hover:not(.active) {
      color: var(--base-font-color);
      opacity: 0.7;
    }
  }

  // Active state
  &.active {
    color: var(--base-font-color);

    .nav-icon i {
      transform: scale(1.1);
    }

    .nav-label {
      font-weight: 600;
    }
  }

  // Touch feedback
  &:active {
    transform: scale(0.95);
    background: rgba(0, 0, 0, 0.02);
    border-radius: 8px;
  }
}

// Animation when switching tabs
.nav-item {
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0.5;
  }
  to {
    opacity: 1;
  }
}

// Safe area จัดการที่ .mobile-bottom-nav-container ใน LayoutMobile.vue แล้ว
// ไม่ต้องเพิ่ม env(safe-area-inset-bottom) ที่นี่ซ้ำ
</style>
