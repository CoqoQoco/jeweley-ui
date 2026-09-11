<template>
  <div class="module-filter-tabs">
    <button
      type="button"
      class="module-tab"
      :class="{ active: modelValue === null }"
      @click="$emit('update:modelValue', null)"
    >
      <span>{{ $t('view.mobile.notifications.allModulesTab') }}</span>
      <span class="module-tab-count">{{ totalCount }}</span>
    </button>

    <button
      v-for="entry in modules"
      :key="entry.module"
      type="button"
      class="module-tab"
      :class="{ active: modelValue === entry.module }"
      @click="$emit('update:modelValue', entry.module)"
    >
      <span>{{ entry.module }}</span>
      <span class="module-tab-count">{{ entry.count }}</span>
    </button>
  </div>
</template>

<script>
export default {
  name: 'ModuleFilterTabs',

  props: {
    modules: {
      type: Array,
      default: () => []
    },
    totalCount: {
      type: Number,
      default: 0
    },
    modelValue: {
      type: String,
      default: null
    }
  },

  emits: ['update:modelValue']
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/mobile';

.module-filter-tabs {
  display: flex;
  gap: var(--sp-sm);
  overflow-x: auto;
  padding-bottom: var(--sp-xs);
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }
}

.module-tab {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-xs);
  flex-shrink: 0;
  padding: 8px 14px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--color-border);
  background: var(--color-card-bg);
  color: #666;
  font-size: 0.8rem;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.98);
  }

  &.active {
    border-color: var(--base-font-color);
    background: rgba(146, 19, 19, 0.05);
    color: var(--base-font-color);
    font-weight: 600;
  }
}

.module-tab-count {
  min-width: 20px;
  padding: 0 6px;
  border-radius: var(--radius-sm);
  background: var(--base-color);
  font-size: 0.7rem;
  font-weight: 700;
  text-align: center;
}
</style>
