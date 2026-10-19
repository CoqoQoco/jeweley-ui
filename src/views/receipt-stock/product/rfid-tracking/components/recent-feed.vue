<template>
  <SectionCardGeneric
    :title="$t('view.stock.stockRfidTracking.feedTitle')"
    icon="bi-clock-history"
    accent="main"
    headerStyle="legend"
  >
    <div v-if="!items.length" class="feed-empty">{{ $t('view.stock.stockRfidTracking.feedEmpty') }}</div>

    <ul v-else class="feed-list">
      <li v-for="item in items" :key="item.id" :class="['feed-item', { 'feed-item--cancelled': !item.isActive }]">
        <div class="feed-line">
          <span class="feed-time">{{ formatTime(item) }}</span>
          <span :class="['feed-action', item.isActive ? 'feed-action--bound' : 'feed-action--cancelled']">
            {{
              item.isActive
                ? $t('view.stock.stockRfidTracking.feedBoundAction')
                : $t('view.stock.stockRfidTracking.feedCancelledAction')
            }}
          </span>
          <span class="feed-stock">{{ item.stockNumber }}</span>
        </div>
        <div class="feed-name">{{ item.productName || '-' }}</div>
        <div class="feed-meta">
          <span class="feed-epc">{{ item.epc }}</span>
          <span v-if="item.boundBy">{{ $t('view.stock.stockRfidTracking.feedBy', { name: item.boundBy }) }}</span>
        </div>
      </li>
    </ul>
  </SectionCardGeneric>
</template>

<script>
import { formatOnlyTime } from '@/services/utils/dayjs.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'

export default {
  name: 'RfidRecentFeed',

  components: { SectionCardGeneric },

  props: {
    items: { type: Array, default: () => [] }
  },

  methods: {
    formatTime(item) {
      const value = item.updatedDate || item.boundDate
      return value ? formatOnlyTime(value) : '-'
    }
  }
}
</script>

<style lang="scss" scoped>
.feed-empty {
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
  text-align: center;
}

.feed-list {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 420px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--sp-sm);
}

.feed-item {
  padding: var(--sp-sm) var(--sp-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--fs-sm);

  &--cancelled {
    background: var(--status-cancelled-bg);
    color: var(--status-closed);

    .feed-stock,
    .feed-name,
    .feed-epc {
      text-decoration: line-through;
    }
  }
}

.feed-line {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
}

.feed-time {
  color: var(--base-sub-color);
}

.feed-action {
  font-weight: 600;

  &--bound {
    color: var(--status-resolved);
  }

  &--cancelled {
    color: var(--status-cancelled);
  }
}

.feed-stock {
  margin-left: auto;
  font-weight: 600;
}

.feed-meta {
  display: flex;
  justify-content: space-between;
  gap: var(--sp-sm);
  color: var(--base-sub-color);
}

.feed-epc {
  font-family: monospace;
  word-break: break-all;
}
</style>
