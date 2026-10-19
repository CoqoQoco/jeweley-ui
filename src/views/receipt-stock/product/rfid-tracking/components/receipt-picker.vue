<template>
  <SectionCardGeneric
    :title="$t('view.stock.stockRfidTracking.pickerTitle')"
    icon="bi-receipt"
    accent="main"
    headerStyle="legend"
  >
    <div class="picker-toolbar">
      <InputTextGeneric
        :modelValue="search"
        icon="bi-search"
        :placeholder="$t('view.stock.stockRfidTracking.searchPlaceholder')"
        @update:modelValue="onSearchInput"
      />
      <ButtonGeneric
        variant="outline"
        icon="bi-arrow-clockwise"
        :label="$t('view.stock.stockRfidTracking.refresh')"
        @click="$emit('refresh')"
      />
    </div>

    <CheckboxGeneric
      :modelValue="onlyIncomplete"
      :label="$t('view.stock.stockRfidTracking.onlyIncomplete')"
      @update:modelValue="onToggleIncomplete"
    />

    <div v-if="!items.length" class="picker-empty">{{ $t('view.stock.stockRfidTracking.noReceipts') }}</div>

    <ul v-else class="picker-list">
      <li
        v-for="item in items"
        :key="item.receiptNumber"
        :class="['picker-item', { 'picker-item--active': item.receiptNumber === selected }]"
        role="button"
        tabindex="0"
        @click="$emit('select', item.receiptNumber)"
        @keydown.enter.prevent="$emit('select', item.receiptNumber)"
        @keydown.space.prevent="$emit('select', item.receiptNumber)"
      >
        <div class="picker-item-main">
          <span class="picker-item-number">{{ item.receiptNumber }}</span>
          <span class="picker-item-date">{{ formatDate(item.receiptDate) }}</span>
        </div>
        <div class="picker-item-side">
          <span class="picker-item-pieces">
            {{ $t('view.stock.stockRfidTracking.receiptPieces', { bound: item.boundPieces, total: item.totalPieces }) }}
          </span>
          <span :class="['picker-badge', item.remainingPieces > 0 ? 'picker-badge--open' : 'picker-badge--done']">
            {{
              item.remainingPieces > 0
                ? $t('view.stock.stockRfidTracking.remainingBadge', { count: item.remainingPieces })
                : $t('view.stock.stockRfidTracking.completeBadge')
            }}
          </span>
        </div>
      </li>
    </ul>

    <div v-if="total > items.length" class="picker-hint">
      {{ $t('view.stock.stockRfidTracking.listHint', { shown: items.length, total }) }}
    </div>
  </SectionCardGeneric>
</template>

<script>
import { formatDate } from '@/services/utils/dayjs.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import CheckboxGeneric from '@/components/prime-vue/CheckboxGeneric.vue'

const SEARCH_DEBOUNCE_MS = 400

export default {
  name: 'RfidReceiptPicker',

  components: {
    SectionCardGeneric,
    InputTextGeneric,
    ButtonGeneric,
    CheckboxGeneric
  },

  props: {
    items: { type: Array, default: () => [] },
    total: { type: Number, default: 0 },
    selected: { type: String, default: '' },
    search: { type: String, default: '' },
    onlyIncomplete: { type: Boolean, default: true }
  },

  emits: ['select', 'refresh', 'update:search', 'update:onlyIncomplete', 'filter-change'],

  data() {
    return { searchTimer: null }
  },

  beforeUnmount() {
    clearTimeout(this.searchTimer)
  },

  methods: {
    formatDate,

    onSearchInput(value) {
      this.$emit('update:search', value)
      clearTimeout(this.searchTimer)
      this.searchTimer = setTimeout(() => this.$emit('filter-change'), SEARCH_DEBOUNCE_MS)
    },

    onToggleIncomplete(value) {
      this.$emit('update:onlyIncomplete', value)
      this.$emit('filter-change')
    }
  }
}
</script>

<style lang="scss" scoped>
.picker-toolbar {
  display: flex;
  gap: var(--sp-sm);
  margin-bottom: var(--sp-md);

  > :first-child {
    flex: 1;
    min-width: 0;
  }
}

.picker-empty,
.picker-hint {
  margin-top: var(--sp-md);
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
  text-align: center;
}

.picker-list {
  list-style: none;
  margin: var(--sp-md) 0 0;
  padding: 0;
  max-height: calc(100vh - 360px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--sp-xs);
}

.picker-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--sp-sm);
  padding: var(--sp-sm) var(--sp-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;

  &:hover,
  &:focus-visible {
    background: var(--color-highlight-bg);
    outline: none;
  }

  &--active {
    background: var(--color-highlight-bg);
    border-color: var(--base-font-color);
  }
}

.picker-item-main,
.picker-item-side {
  display: flex;
  flex-direction: column;
  gap: var(--sp-xs);
}

.picker-item-side {
  align-items: flex-end;
}

.picker-item-number {
  font-weight: 600;
  color: var(--base-font-color);
}

.picker-item-date,
.picker-item-pieces {
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}

.picker-badge {
  padding: 0 var(--sp-sm);
  border-radius: var(--radius-sm);
  font-size: var(--fs-sm);
  font-weight: 600;

  &--open {
    background: var(--status-open-bg);
    color: var(--status-open);
  }

  &--done {
    background: var(--status-resolved-bg);
    color: var(--status-resolved);
  }
}
</style>
