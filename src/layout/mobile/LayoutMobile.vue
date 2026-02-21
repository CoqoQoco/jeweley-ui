<template>
  <div id="mobile-layout" class="mobile-layout">
    <!-- Top Bar (Optional - แสดงเฉพาะบางหน้า) -->
    <div v-if="showTopBar" class="mobile-topbar-container">
      <MobileTopBar :title="pageTitle" />
    </div>

    <!-- Main Content Area -->
    <div class="mobile-content-wrapper" :class="{ 'has-topbar': showTopBar }">
      <router-view :key="$route.fullPath"></router-view>
    </div>

    <!-- Bottom Navigation (Fixed) -->
    <div class="mobile-bottom-nav-container">
      <MobileBottomNav />
    </div>
  </div>
</template>

<script>
import MobileTopBar from '@/components/layout/mobile-top-bar.vue'
import MobileBottomNav from '@/components/layout/mobile-bottom-nav.vue'
import { useAuthStore } from '@/stores/modules/authen/authen-store.js'

export default {
  name: 'LayoutMobile',

  components: {
    MobileTopBar,
    MobileBottomNav
  },

  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },

  computed: {
    /**
     * ตรวจสอบว่าควรแสดง top bar หรือไม่
     * - Dashboard ไม่แสดง (ให้เนื้อหาเต็มหน้าจอ)
     * - หน้าอื่นๆ แสดง
     */
    showTopBar() {
      const routesWithoutTopBar = ['mobile-dashboard']
      return !routesWithoutTopBar.includes(this.$route.name)
    },

    /**
     * Get page title from route meta
     */
    pageTitle() {
      return this.$route.meta?.Displayname?.th || 'Duang Kaew'
    },

    /**
     * Get current user
     */
    user() {
      return this.authStore.user
    }
  },

  mounted() {
    // เพิ่ม class ให้ body สำหรับ mobile-specific styling
    document.body.classList.add('mobile-view')

    // Prevent pull-to-refresh on mobile browsers
    this.preventPullToRefresh()
  },

  beforeUnmount() {
    // ลบ class เมื่อออกจาก mobile layout
    document.body.classList.remove('mobile-view')
  },

  methods: {
    /**
     * ป้องกัน pull-to-refresh behavior บน mobile browser
     */
    preventPullToRefresh() {
      let startY = 0

      document.addEventListener(
        'touchstart',
        (e) => {
          startY = e.touches[0].pageY
        },
        { passive: true }
      )

      document.addEventListener(
        'touchmove',
        (e) => {
          const currentY = e.touches[0].pageY
          const scrollTop = document.documentElement.scrollTop || document.body.scrollTop

          // ถ้า scroll อยู่ที่บนสุดและพยายาม pull down
          if (scrollTop === 0 && currentY > startY) {
            e.preventDefault()
          }
        },
        { passive: false }
      )
    }
  }
}
</script>

<style lang="scss" scoped>
.mobile-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f5f5;
  position: relative;
}

.mobile-topbar-container {
  position: sticky;
  top: 0;
  z-index: 100;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.mobile-content-wrapper {
  flex: 1;
  padding-bottom: calc(70px + env(safe-area-inset-bottom, 0px)); /* bottom nav + safe area */
  overflow-y: auto;
  overflow-x: hidden;

  // ถ้ามี top bar ให้เว้นระยะเพิ่ม
  &.has-topbar {
    padding-top: 0;
  }

  // Smooth scrolling
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

.mobile-bottom-nav-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);

  // Safe area for iPhone (Safari bottom bar + notch)
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
</style>

<style lang="scss">
// Global styles for mobile view
body.mobile-view {
  // ป้องกัน text selection (optional)
  -webkit-user-select: none;
  user-select: none;

  // ป้องกัน tap highlight
  -webkit-tap-highlight-color: transparent;

  // ป้องกัน zoom on input focus (iOS Safari)
  input,
  textarea,
  select {
    font-size: 16px !important; // ป้องกัน auto-zoom
  }

  // ซ่อน scrollbar
  ::-webkit-scrollbar {
    display: none;
  }

  // Prevent overscroll
  overscroll-behavior: none;
}
</style>
