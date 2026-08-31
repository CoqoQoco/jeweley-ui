<template>
  <div class="list-filter-bar">
    <div class="search-row">
      <InputTextGeneric
        :modelValue="searchValue"
        icon="bi-search"
        :placeholder="searchPlaceholder"
        @update:modelValue="$emit('update:searchValue', $event)"
        @keyup.enter="$emit('search')"
      />
      <ButtonGeneric
        variant="green"
        icon="bi-search"
        :title="$t('view.mobile.saleIndex.searchBtn')"
        @click="$emit('search')"
      />
      <ButtonGeneric
        v-if="searchValue"
        variant="dark"
        icon="bi-x-circle"
        :title="$t('view.mobile.saleIndex.clearBtn')"
        @click="$emit('clear')"
      />
    </div>

    <div class="chip-row">
      <button
        v-for="option in fieldOptions"
        :key="option.value"
        type="button"
        class="filter-chip"
        :class="{ active: searchField === option.value }"
        @click="$emit('update:searchField', option.value)"
      >
        {{ option.label }}
      </button>
    </div>

    <div class="scope-toggle">
      <button
        type="button"
        class="scope-btn"
        :class="{ active: scope === 'mine' }"
        @click="$emit('update:scope', 'mine')"
      >
        {{ $t('view.mobile.saleIndex.scopeMine') }}
      </button>
      <button
        type="button"
        class="scope-btn"
        :class="{ active: scope === 'all' }"
        @click="$emit('update:scope', 'all')"
      >
        {{ $t('view.mobile.saleIndex.scopeAll') }}
      </button>
    </div>
  </div>
</template>

<script>
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

export default {
  name: 'SaleListFilterBar',

  components: { InputTextGeneric, ButtonGeneric },

  props: {
    searchValue: {
      type: String,
      default: ''
    },
    searchField: {
      type: String,
      default: 'number'
    },
    scope: {
      type: String,
      default: 'mine'
    }
  },

  emits: ['update:searchValue', 'update:searchField', 'update:scope', 'search', 'clear'],

  computed: {
    fieldOptions() {
      return [
        { value: 'number', label: this.$t('view.mobile.saleIndex.searchFieldNumber') },
        { value: 'customerName', label: this.$t('view.mobile.saleIndex.searchFieldCustomer') }
      ]
    },

    searchPlaceholder() {
      return this.searchField === 'number'
        ? this.$t('view.mobile.saleIndex.searchPlaceholderNumber')
        : this.$t('view.mobile.saleIndex.searchPlaceholderCustomer')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/mobile';

.list-filter-bar {
  display: flex;
  flex-direction: column;
  gap: var(--sp-sm);
  margin-bottom: var(--sp-md);
}

.search-row {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);

  > :first-child {
    flex: 1;
  }
}

.chip-row {
  display: flex;
  gap: var(--sp-sm);
}

.filter-chip {
  flex: 1;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--color-border);
  background: var(--color-card-bg);
  color: #666;
  font-size: 0.8rem;
  font-weight: 500;
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

.scope-toggle {
  display: flex;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.scope-btn {
  flex: 1;
  padding: 8px 12px;
  border: none;
  background: var(--color-card-bg);
  color: #666;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &.active {
    background: var(--base-font-color);
    color: #fff;
  }
}
</style>
