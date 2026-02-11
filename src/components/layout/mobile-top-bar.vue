<template>
  <div class="mobile-top-bar">
    <div class="topbar-left">
      <!-- Back Button (แสดงเฉพาะบางหน้า) -->
      <button v-if="showBackButton" class="btn-back" @click="goBack">
        <i class="bi bi-chevron-left"></i>
      </button>

      <!-- Home Button (แสดงเมื่อไม่มี back button) -->
      <button v-else-if="showHomeButton" class="btn-home" @click="goHome">
        <i class="bi bi-house-door"></i>
      </button>
    </div>

    <div class="topbar-center">
      <h1 class="page-title">{{ pageTitle }}</h1>
    </div>

    <div class="topbar-right">
      <!-- Notification Icon (optional) -->
      <button v-if="showNotification" class="btn-notification" @click="openNotifications">
        <i class="bi bi-bell"></i>
        <span v-if="notificationCount > 0" class="notification-badge">{{
          notificationCount
        }}</span>
      </button>

      <!-- Menu Icon (optional) -->
      <button v-if="showMenu" class="btn-menu" @click="openMenu">
        <i class="bi bi-three-dots-vertical"></i>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MobileTopBar',

  props: {
    // Page title
    title: {
      type: String,
      default: ''
    },

    // แสดง back button หรือไม่
    backButton: {
      type: Boolean,
      default: true
    },

    // แสดง notification icon หรือไม่
    notification: {
      type: Boolean,
      default: false
    },

    // แสดง menu icon หรือไม่
    menu: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    /**
     * Get page title from props or route meta
     */
    pageTitle() {
      return this.title || this.$route.meta?.Displayname?.th || 'Duang Kaew'
    },

    /**
     * ตรวจสอบว่าควรแสดง back button หรือไม่
     */
    showBackButton() {
      // ไม่แสดงที่ dashboard
      if (this.$route.name === 'mobile-dashboard') return false

      // ถ้า prop บังคับไม่ให้แสดง
      if (this.backButton === false) return false

      // ตรวจสอบว่ามี history หรือไม่
      return window.history.length > 1
    },

    /**
     * แสดง home button เมื่อไม่มี back button
     */
    showHomeButton() {
      return !this.showBackButton && this.$route.name !== 'mobile-dashboard'
    },

    /**
     * แสดง notification icon หรือไม่
     */
    showNotification() {
      return this.notification
    },

    /**
     * แสดง menu icon หรือไม่
     */
    showMenu() {
      return this.menu
    },

    /**
     * จำนวน notifications (placeholder)
     * TODO: ดึงจาก store หรือ API
     */
    notificationCount() {
      // return this.notificationStore?.unreadCount || 0
      return 0
    }
  },

  methods: {
    /**
     * กลับไปหน้าก่อนหน้า
     */
    goBack() {
      if (window.history.length > 1) {
        this.$router.go(-1)
      } else {
        this.goHome()
      }
    },

    /**
     * กลับไปหน้า dashboard
     */
    goHome() {
      this.$router.push('/mobile/dashboard')
    },

    /**
     * เปิด notifications
     * TODO: Implement notifications panel
     */
    openNotifications() {
      // this.$router.push('/mobile/notifications')
      console.log('Open notifications')
    },

    /**
     * เปิด menu
     * TODO: Implement menu drawer
     */
    openMenu() {
      // Emit event to parent or open menu modal
      this.$emit('menu-opened')
      console.log('Open menu')
    }
  }
}
</script>

<style lang="scss" scoped>
.mobile-top-bar {
  display: grid;
  grid-template-columns: 60px 1fr 60px;
  align-items: center;
  padding: 12px 16px;
  background: white;
  min-height: 56px;

  .topbar-left,
  .topbar-right {
    display: flex;
    align-items: center;
  }

  .topbar-left {
    justify-content: flex-start;
  }

  .topbar-center {
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .topbar-right {
    justify-content: flex-end;
    gap: 8px;
  }

  .page-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--base-font-color);
    margin: 0;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  // Button styles
  .btn-back,
  .btn-home,
  .btn-notification,
  .btn-menu {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: none;
    background: transparent;
    color: var(--base-font-color);
    cursor: pointer;
    border-radius: 50%;
    transition: all 0.2s ease;
    position: relative;

    i {
      font-size: 1.3rem;
    }

    &:active {
      background: rgba(0, 0, 0, 0.05);
      transform: scale(0.95);
    }

    // Hover state for desktop
    @media (hover: hover) {
      &:hover {
        background: rgba(0, 0, 0, 0.03);
      }
    }
  }

  .btn-back i {
    font-size: 1.5rem;
    font-weight: 600;
  }

  .notification-badge {
    position: absolute;
    top: 8px;
    right: 8px;
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

// Safe area for devices with notch
@supports (padding-top: env(safe-area-inset-top)) {
  .mobile-top-bar {
    padding-top: calc(12px + env(safe-area-inset-top));
  }
}
</style>
