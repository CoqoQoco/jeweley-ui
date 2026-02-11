<template>
  <div class="view-mode-toggle">
    <button class="toggle-btn" @click="toggleMode" :title="tooltipText">
      <i :class="currentIcon"></i>
      <span class="toggle-label">{{ currentLabel }}</span>
    </button>

    <!-- Dropdown menu สำหรับเลือกโหมด -->
    <div v-if="showDropdown" class="toggle-dropdown">
      <div
        class="dropdown-item"
        :class="{ active: deviceStore.preferredMode === 'auto' }"
        @click="setMode('auto')"
      >
        <i class="bi bi-magic"></i>
        <span>อัตโนมัติ</span>
        <i v-if="deviceStore.preferredMode === 'auto'" class="bi bi-check2 check-icon"></i>
      </div>
      <div
        class="dropdown-item"
        :class="{ active: deviceStore.preferredMode === 'mobile' }"
        @click="setMode('mobile')"
      >
        <i class="bi bi-phone"></i>
        <span>มุมมองมือถือ</span>
        <i v-if="deviceStore.preferredMode === 'mobile'" class="bi bi-check2 check-icon"></i>
      </div>
      <div
        class="dropdown-item"
        :class="{ active: deviceStore.preferredMode === 'desktop' }"
        @click="setMode('desktop')"
      >
        <i class="bi bi-laptop"></i>
        <span>มุมมองเดสก์ท็อป</span>
        <i v-if="deviceStore.preferredMode === 'desktop'" class="bi bi-check2 check-icon"></i>
      </div>

      <div class="dropdown-divider"></div>

      <div class="dropdown-info">
        <div class="info-row">
          <span class="info-label">Device:</span>
          <span class="info-value">{{ deviceInfo }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Screen:</span>
          <span class="info-value">{{ screenSize }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useDeviceStore } from '@/stores/modules/device/device-store.js'

export default {
  name: 'ViewModeToggle',

  setup() {
    const deviceStore = useDeviceStore()
    return { deviceStore }
  },

  data() {
    return {
      showDropdown: false
    }
  },

  computed: {
    /**
     * Icon class ตามโหมดปัจจุบัน
     */
    currentIcon() {
      return this.deviceStore.viewModeIcon
    },

    /**
     * Label ตามโหมดปัจจุบัน
     */
    currentLabel() {
      if (this.deviceStore.preferredMode === 'auto') {
        return this.deviceStore.shouldUseMobileView ? 'มือถือ (Auto)' : 'เดสก์ท็อป (Auto)'
      }
      return this.deviceStore.viewModeLabel
    },

    /**
     * Tooltip text
     */
    tooltipText() {
      return `กด เพื่อเปลี่ยนมุมมอง (ปัจจุบัน: ${this.deviceStore.viewModeLabel})`
    },

    /**
     * Device info
     */
    deviceInfo() {
      if (this.deviceStore.isMobileDevice) {
        if (this.deviceStore.isIOS) return 'iOS'
        if (this.deviceStore.isAndroid) return 'Android'
        return 'Mobile'
      }
      return 'Desktop'
    },

    /**
     * Screen size
     */
    screenSize() {
      return `${this.deviceStore.screenWidth} x ${this.deviceStore.screenHeight}`
    }
  },

  mounted() {
    // Click outside to close dropdown
    document.addEventListener('click', this.handleClickOutside)
  },

  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
  },

  methods: {
    /**
     * Toggle dropdown
     */
    toggleMode(e) {
      e.stopPropagation()
      this.showDropdown = !this.showDropdown
    },

    /**
     * Set view mode และ reload page
     */
    setMode(mode) {
      this.deviceStore.setViewMode(mode)
      this.showDropdown = false

      // Reload page เพื่อให้ router redirect ไปตาม mode ใหม่
      setTimeout(() => {
        window.location.reload()
      }, 100)
    },

    /**
     * Handle click outside
     */
    handleClickOutside(e) {
      if (this.showDropdown && !this.$el.contains(e.target)) {
        this.showDropdown = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.view-mode-toggle {
  position: relative;
  display: inline-block;
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: white;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s ease;

  i {
    font-size: 1rem;
  }

  .toggle-label {
    font-weight: 500;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  &:active {
    transform: scale(0.98);
  }
}

.toggle-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 220px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
  animation: fadeIn 0.2s ease;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s ease;
  color: #333;
  font-size: 0.9rem;

  i:first-child {
    font-size: 1.1rem;
    width: 20px;
    text-align: center;
  }

  span {
    flex: 1;
  }

  .check-icon {
    color: var(--base-green);
    font-weight: 600;
  }

  &:hover {
    background: #f5f5f5;
  }

  &.active {
    background: #f8f8f8;
    font-weight: 500;
  }
}

.dropdown-divider {
  height: 1px;
  background: #e0e0e0;
  margin: 8px 0;
}

.dropdown-info {
  padding: 12px 16px;
  background: #f8f8f8;
  font-size: 0.8rem;
  color: #666;

  .info-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;

    &:last-child {
      margin-bottom: 0;
    }

    .info-label {
      font-weight: 500;
    }

    .info-value {
      color: #999;
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
