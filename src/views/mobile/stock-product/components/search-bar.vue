<template>
  <div class="stock-search-bar">
    <InputTextGeneric
      :modelValue="modelValue"
      icon="bi-search"
      :placeholder="$t('view.mobile.stockProduct.searchPlaceholder')"
      @update:modelValue="onInput"
    />

    <button type="button" class="filter-toggle-btn" @click="$emit('open-filter')">
      <i class="bi bi-funnel"></i>
      {{ $t('view.mobile.stockProduct.filterBtn') }}
      <span v-if="activeFilterCount > 0" class="filter-badge">{{ activeFilterCount }}</span>
    </button>
  </div>
</template>

<script>
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'

export default {
  name: 'StockSearchBar',

  components: { InputTextGeneric },

  props: {
    modelValue: {
      type: String,
      default: ''
    },
    activeFilterCount: {
      type: Number,
      default: 0
    }
  },

  emits: ['update:modelValue', 'search', 'open-filter'],

  data() {
    return {
      debounceTimer: null
    }
  },

  beforeUnmount() {
    clearTimeout(this.debounceTimer)
  },

  methods: {
    onInput(value) {
      this.$emit('update:modelValue', value)
      clearTimeout(this.debounceTimer)
      this.debounceTimer = setTimeout(() => {
        this.$emit('search', value)
      }, 400)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/mobile';

.stock-search-bar {
  display: flex;
  flex-direction: column;
  gap: var(--sp-sm);
}

.filter-toggle-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-sm);
  width: 100%;
  padding: 10px 16px;
  border: 1.5px solid var(--base-font-color);
  border-radius: var(--radius-md);
  background: var(--color-card-bg);
  color: var(--base-font-color);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:active {
    background: rgba(146, 19, 19, 0.06);
  }
}

.filter-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9999px;
  background: var(--base-font-color);
  color: #ffffff;
  font-size: 0.7rem;
  font-weight: 700;
}
</style>
