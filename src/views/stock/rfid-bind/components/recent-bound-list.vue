<template>
  <SectionCardGeneric :title="$t('view.stock.rfidBind.recent.title')" icon="bi-clock-history" accent="main" headerStyle="legend">
    <ButtonGeneric
      variant="outline"
      icon="bi-arrow-counterclockwise"
      :label="$t('view.stock.rfidBind.recent.undo')"
      :disabled="!items.length || busy"
      @click="$emit('undo')"
    />
    <p v-if="!items.length" class="recent-empty">{{ $t('view.stock.rfidBind.recent.empty') }}</p>
    <ul v-else class="recent-list">
      <li v-for="item in items" :key="item.unitId" class="recent-item">
        <div class="recent-item__top">
          <i class="bi bi-check-circle-fill recent-item__icon" aria-hidden="true"></i>
          <span class="recent-item__no">{{ item.no }}</span>
          <span v-if="item.unitText" class="recent-item__meta">{{ item.unitText }}</span>
          <span class="recent-item__meta recent-item__time">{{ item.time }}</span>
        </div>
        <span class="recent-item__meta recent-item__epc" :title="item.epc">{{ item.epc }}</span>
      </li>
    </ul>
  </SectionCardGeneric>
</template>

<script>
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

export default {
  name: 'RfidBindRecentBoundList',

  components: { SectionCardGeneric, ButtonGeneric },

  props: {
    items: { type: Array, default: () => [] },
    busy: { type: Boolean, default: false }
  },

  emits: ['undo']
}
</script>

<style lang="scss" scoped>
.recent-empty {
  margin: var(--sp-sm) 0 0;
  font-size: var(--fs-base);
  color: var(--base-sub-color);
}

.recent-list {
  list-style: none;
  margin: var(--sp-sm) 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--sp-xs);
}

.recent-item {
  display: flex;
  flex-direction: column;
  gap: var(--sp-xs);
  min-width: 0;
  font-size: var(--fs-base);
}

.recent-item__top {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  min-width: 0;
}

.recent-item__icon {
  color: var(--base-green);
  flex: 0 0 auto;
}

.recent-item__no {
  font-weight: 700;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recent-item__meta {
  color: var(--base-sub-color);
  font-size: var(--fs-sm);
}

.recent-item__time {
  margin-left: auto;
  flex: 0 0 auto;
  font-variant-numeric: tabular-nums;
}

.recent-item__epc {
  font-family: monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
