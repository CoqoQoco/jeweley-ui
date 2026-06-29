<template>
  <Teleport to="body">
    <Transition name="drawer-backdrop">
      <div
        v-if="show"
        class="drawer-backdrop"
        @click="onBackdropClick"
      ></div>
    </Transition>

    <!-- Side panel — sibling of main panel, fixed to the left of it -->
    <Transition name="drawer-side">
      <aside
        v-if="show && sideShow"
        class="drawer-side"
        :style="{ width: sideWidth, right: width }"
        aria-label="Side panel"
      >
        <slot name="side"></slot>
      </aside>
    </Transition>

    <Transition name="drawer-panel">
      <aside
        v-if="show"
        class="drawer-panel"
        :style="{ width: width }"
        role="dialog"
        aria-modal="true"
      >
        <!-- Header -->
        <div class="drawer-header" :class="{ 'is-main': headerVariant === 'main' }">
          <div class="drawer-header__title">
            <slot name="title">
              <span class="drawer-title-text">{{ title }}</span>
            </slot>
          </div>
          <button class="drawer-close-btn" type="button" @click="onClose" aria-label="Close">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <!-- Content -->
        <div class="drawer-content">
          <slot name="content"></slot>
        </div>

        <!-- Footer -->
        <div v-if="isShowActionPart" class="drawer-footer">
          <slot name="action"></slot>
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>

<script>
export default {
  name: 'DrawerGeneric',

  props: {
    show: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    width: {
      type: String,
      default: '480px'
    },
    clickToClose: {
      type: Boolean,
      default: false
    },
    isShowActionPart: {
      type: Boolean,
      default: false
    },
    headerVariant: {
      type: String,
      default: 'main'
    },
    sideShow: {
      type: Boolean,
      default: false
    },
    sideWidth: {
      type: String,
      default: '300px'
    }
  },

  emits: ['close'],

  watch: {
    show(newVal) {
      if (newVal) {
        document.addEventListener('keydown', this.onKeyDown)
      } else {
        document.removeEventListener('keydown', this.onKeyDown)
      }
    }
  },

  beforeUnmount() {
    document.removeEventListener('keydown', this.onKeyDown)
  },

  methods: {
    onClose() {
      this.$emit('close')
    },

    onBackdropClick() {
      if (this.clickToClose) {
        this.onClose()
      }
    },

    onKeyDown(event) {
      if (event.key === 'Escape') {
        this.onClose()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/variable.scss';

.drawer-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1000;
}

.drawer-panel {
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  max-width: 100vw;
  background: var(--color-card-bg);
  box-shadow: var(--shadow-lg);
  z-index: 1001;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

// Header
.drawer-header {
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--sp-md) var(--sp-lg);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-card-bg);
  flex-shrink: 0;
  z-index: 1;

  &.is-main {
    background: var(--base-font-color);
    border-bottom-color: transparent;

    .drawer-title-text {
      color: #ffffff;
    }

    .drawer-close-btn {
      color: #ffffff;

      &:hover {
        background: rgba(255, 255, 255, 0.15);
      }
    }
  }
}

.drawer-header__title {
  flex: 1;
  min-width: 0;
}

.drawer-title-text {
  font-size: var(--fs-lg);
  font-weight: 700;
  color: var(--base-font-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.drawer-close-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--base-font-color);
  cursor: pointer;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
  margin-left: var(--sp-sm);
  transition: background 0.2s;
  font-size: 1rem;

  &:hover {
    background: var(--color-highlight-bg);
  }
}

// Side panel — fixed sibling of main panel, anchored to the left of it via inline right style
.drawer-side {
  position: fixed;
  top: 0;
  bottom: 0;
  background: var(--color-card-bg);
  box-shadow: var(--shadow-md);
  overflow-y: auto;
  z-index: 1001;
  border-right: 1px solid var(--color-border);
}

// Content
.drawer-content {
  flex: 1;
  overflow-y: auto;
}

// Footer
.drawer-footer {
  position: sticky;
  bottom: 0;
  border-top: 1px solid var(--color-border);
  padding: var(--sp-lg);
  background: var(--color-card-bg);
  flex-shrink: 0;
  text-align: center;
}

// Backdrop transition — fade
.drawer-backdrop-enter-active,
.drawer-backdrop-leave-active {
  transition: opacity 0.4s ease;
}
.drawer-backdrop-enter-from,
.drawer-backdrop-leave-to {
  opacity: 0;
}

// Panel transition — slide from right
.drawer-panel-enter-active,
.drawer-panel-leave-active {
  transition: transform 0.4s ease;
}
.drawer-panel-enter-from,
.drawer-panel-leave-to {
  transform: translateX(100%);
}

// Side panel transition — hidden = tucked behind main panel (translateX(100%)), shown = revealed to the left
.drawer-side-enter-active,
.drawer-side-leave-active {
  transition: transform 0.3s ease;
}
.drawer-side-enter-from,
.drawer-side-leave-to {
  transform: translateX(100%);
}
</style>
