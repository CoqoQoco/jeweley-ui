import { defineStore } from 'pinia'

/**
 * Device Detection Store
 * ใช้สำหรับตรวจจับประเภทของอุปกรณ์และจัดการ view mode preference
 */
export const useDeviceStore = defineStore('device', {
  state: () => ({
    // User preference: 'auto', 'mobile', 'desktop'
    // 'auto' = ให้ระบบตัดสินใจเอง
    // 'mobile' = บังคับใช้ mobile view
    // 'desktop' = บังคับใช้ desktop view
    preferredMode: localStorage.getItem('view-mode') || 'auto',

    // Screen dimensions
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,

    // User agent string
    userAgent: navigator.userAgent || navigator.vendor || window.opera,

    // Device orientation
    orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
  }),

  getters: {
    /**
     * ตรวจสอบว่าเป็น mobile device จาก user agent
     */
    isMobileDevice(state) {
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
      return mobileRegex.test(state.userAgent)
    },

    /**
     * ตรวจสอบว่าเป็น tablet device จาก user agent
     */
    isTabletDevice(state) {
      const tabletRegex = /iPad|Android(?!.*Mobile)/i
      return tabletRegex.test(state.userAgent)
    },

    /**
     * ตรวจสอบว่าหน้าจอขนาด mobile (< 768px)
     */
    isMobileWidth(state) {
      return state.screenWidth < 768
    },

    /**
     * ตรวจสอบว่าหน้าจอขนาด tablet (768px - 1024px)
     */
    isTabletWidth(state) {
      return state.screenWidth >= 768 && state.screenWidth <= 1024
    },

    /**
     * ตรวจสอบว่าหน้าจอขนาด desktop (> 1024px)
     */
    isDesktopWidth(state) {
      return state.screenWidth > 1024
    },

    /**
     * ตรวจสอบว่าควรใช้ mobile view หรือไม่
     * - ถ้า preferredMode = 'mobile' → return true
     * - ถ้า preferredMode = 'desktop' → return false
     * - ถ้า preferredMode = 'auto' → ตรวจจับจาก device + screen width
     */
    shouldUseMobileView(state) {
      // User บังคับเลือก mobile
      if (state.preferredMode === 'mobile') return true

      // User บังคับเลือก desktop
      if (state.preferredMode === 'desktop') return false

      // Auto mode: ตรวจจับจาก device type และ screen width
      return this.isMobileDevice || this.isMobileWidth
    },

    /**
     * ตรวจสอบว่าควรใช้ tablet view หรือไม่
     * สำหรับอนาคตถ้าต้องการสร้าง tablet-specific layout
     */
    shouldUseTabletView(state) {
      if (state.preferredMode !== 'auto') return false
      return this.isTabletDevice || this.isTabletWidth
    },

    /**
     * ตรวจสอบว่าควรใช้ desktop view หรือไม่
     */
    shouldUseDesktopView(state) {
      if (state.preferredMode === 'desktop') return true
      if (state.preferredMode === 'mobile') return false

      // Auto mode
      return !this.isMobileDevice && !this.isMobileWidth
    },

    /**
     * Get device type string
     */
    deviceType(state) {
      if (this.shouldUseMobileView) return 'mobile'
      if (this.shouldUseTabletView) return 'tablet'
      return 'desktop'
    },

    /**
     * Check if device is in landscape mode
     */
    isLandscape(state) {
      return state.orientation === 'landscape'
    },

    /**
     * Check if device is in portrait mode
     */
    isPortrait(state) {
      return state.orientation === 'portrait'
    },

    /**
     * ตรวจสอบว่าเป็น iOS device หรือไม่
     */
    isIOS(state) {
      return /iPad|iPhone|iPod/.test(state.userAgent) && !window.MSStream
    },

    /**
     * ตรวจสอบว่าเป็น Android device หรือไม่
     */
    isAndroid(state) {
      return /Android/.test(state.userAgent)
    },

    /**
     * Get current view mode label (for display)
     */
    viewModeLabel(state) {
      const labels = {
        auto: 'อัตโนมัติ',
        mobile: 'มุมมองมือถือ',
        desktop: 'มุมมองเดสก์ท็อป'
      }
      return labels[state.preferredMode] || 'อัตโนมัติ'
    },

    /**
     * Get icon class for current view mode
     */
    viewModeIcon(state) {
      if (this.shouldUseMobileView) return 'bi bi-phone'
      if (this.shouldUseTabletView) return 'bi bi-tablet'
      return 'bi bi-laptop'
    }
  },

  actions: {
    /**
     * ตั้งค่า view mode preference
     * @param {string} mode - 'auto', 'mobile', 'desktop'
     */
    setViewMode(mode) {
      if (!['auto', 'mobile', 'desktop'].includes(mode)) {
        console.error('Invalid view mode:', mode)
        return
      }

      this.preferredMode = mode
      localStorage.setItem('view-mode', mode)

      // Emit event for other components to react
      window.dispatchEvent(
        new CustomEvent('view-mode-changed', {
          detail: { mode, deviceType: this.deviceType }
        })
      )
    },

    /**
     * Toggle between mobile and desktop view
     */
    toggleViewMode() {
      const newMode = this.shouldUseMobileView ? 'desktop' : 'mobile'
      this.setViewMode(newMode)
    },

    /**
     * Reset to auto mode
     */
    resetToAutoMode() {
      this.setViewMode('auto')
    },

    /**
     * อัพเดทขนาดหน้าจอเมื่อ resize
     */
    updateScreenDimensions() {
      this.screenWidth = window.innerWidth
      this.screenHeight = window.innerHeight
      this.orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
    },

    /**
     * Initialize window resize listener
     */
    initResizeListener() {
      // Debounce function to prevent too many updates
      let resizeTimeout
      const handleResize = () => {
        clearTimeout(resizeTimeout)
        resizeTimeout = setTimeout(() => {
          this.updateScreenDimensions()
        }, 150)
      }

      window.addEventListener('resize', handleResize)

      // Also listen for orientation change
      window.addEventListener('orientationchange', () => {
        setTimeout(() => {
          this.updateScreenDimensions()
        }, 100)
      })
    },

    /**
     * Get recommended route path based on device type
     * @param {string} webPath - Web route path (e.g., '/dashboard')
     * @returns {string} - Recommended route path
     */
    getRecommendedPath(webPath) {
      if (this.shouldUseMobileView) {
        // Convert web path to mobile path
        // /dashboard → /mobile/dashboard
        if (webPath === '/') return '/mobile/dashboard'
        if (webPath.startsWith('/mobile')) return webPath
        return `/mobile${webPath}`
      }

      // Desktop/Tablet view
      if (webPath.startsWith('/mobile')) {
        // Remove /mobile prefix
        return webPath.replace('/mobile', '') || '/dashboard'
      }

      return webPath
    },

    /**
     * Check if a mobile route exists for given web path
     * @param {object} router - Vue Router instance
     * @param {string} webPath - Web route path
     * @returns {boolean}
     */
    mobileRouteExists(router, webPath) {
      const mobilePath = this.getRecommendedPath(webPath)
      const resolved = router.resolve(mobilePath)
      return resolved.matched.length > 0
    }
  }
})
