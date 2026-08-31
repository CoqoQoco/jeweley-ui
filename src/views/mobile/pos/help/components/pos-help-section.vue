<template>
  <div class="pos-help-section" :class="{ 'is-open': isOpen }">
    <button
      type="button"
      class="pos-help-section-header"
      :aria-expanded="isOpen"
      @click="toggle"
    >
      <span class="header-icon"><i :class="['bi', icon]"></i></span>
      <span class="header-title">{{ title }}</span>
      <i class="bi bi-chevron-down header-chevron"></i>
    </button>
    <div v-show="isOpen" class="pos-help-section-body">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'PosHelpSection',

  props: {
    icon: {
      type: String,
      default: 'bi-info-circle'
    },
    title: {
      type: String,
      required: true
    },
    defaultOpen: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      isOpen: this.defaultOpen
    }
  },

  methods: {
    toggle() {
      this.isOpen = !this.isOpen
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/mobile';

.pos-help-section {
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;

  & + & {
    margin-top: var(--sp-sm);
  }
}

.pos-help-section-header {
  width: 100%;
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  padding: var(--sp-md) var(--sp-lg);
  border: none;
  background: var(--color-card-bg);
  cursor: pointer;
  text-align: left;

  &:active {
    background: var(--color-highlight-bg);
  }
}

.header-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border-radius: var(--radius-md);
  background: var(--color-highlight-bg);
  color: var(--base-font-color);

  i {
    font-size: 1rem;
  }
}

.header-title {
  flex: 1;
  font-size: 0.95rem;
  font-weight: 600;
  color: #333;
}

.header-chevron {
  flex-shrink: 0;
  color: #999;
  transition: transform 0.2s ease;
}

.is-open .header-chevron {
  transform: rotate(180deg);
}

.pos-help-section-body {
  padding: 0 var(--sp-lg) var(--sp-lg);
  border-top: 1px solid var(--color-border);
  padding-top: var(--sp-md);
}
</style>
