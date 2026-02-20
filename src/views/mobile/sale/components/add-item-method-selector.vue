<template>
  <div class="method-selector">
    <div class="selector-tabs">
      <button
        class="selector-tab"
        :class="{ active: activeTab === 'appraisal' }"
        @click="$emit('update:activeTab', 'appraisal')"
      >
        <i class="bi bi-calculator"></i>
        จากรายการตีราคา
      </button>
      <button
        class="selector-tab"
        :class="{ active: activeTab === 'scan' }"
        @click="$emit('update:activeTab', 'scan')"
      >
        <i class="bi bi-qr-code-scan"></i>
        สแกนสินค้า
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AddItemMethodSelector',

  props: {
    activeTab: {
      type: String,
      default: 'appraisal'
    }
  },

  emits: ['update:activeTab']
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/mobile';

.method-selector {
  margin-bottom: 16px;
}

.selector-tabs {
  display: flex;
  gap: 8px;
  background: #f0f0f0;
  padding: 4px;
  border-radius: 10px;
}

.selector-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #666;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  i {
    font-size: 1rem;
  }

  &.active {
    background: white;
    color: var(--base-font-color);
    font-weight: 600;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: scale(0.98);
  }
}
</style>
