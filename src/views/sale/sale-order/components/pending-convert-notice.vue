<template>
  <div v-if="items.length" class="pending-convert-notice">
    <div class="pending-convert-title">
      <i class="bi bi-box-arrow-in-down mr-1"></i>
      {{ $t('view.sale.saleOrder.pendingConvertNotice', { count: items.length }) }}
    </div>
    <div class="pending-convert-list">
      <div v-for="item in items" :key="item.running" class="pending-convert-row">
        <div class="pending-convert-info">
          <span class="pending-convert-stock">{{ item.resultStockNumber }}</span>
          <span class="pending-convert-product">{{ item.productNumber }} — {{ item.productNameEn }}</span>
          <span v-if="item.completeDate" class="pending-convert-date">{{ formatDate(item.completeDate) }}</span>
        </div>
        <ButtonGeneric variant="green" icon="bi-box-arrow-in-down" :label="$t('view.sale.saleOrder.pendingConvertFillBtn')" @click="$emit('fill', item)" />
      </div>
    </div>
  </div>
</template>

<script>
import { formatDate } from '@/services/utils/dayjs.js'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

export default {
  name: 'PendingConvertNotice',

  components: {
    ButtonGeneric
  },

  props: {
    items: {
      type: Array,
      default: () => []
    }
  },

  emits: ['fill'],

  methods: {
    formatDate(val) {
      return val ? formatDate(val) : ''
    }
  }
}
</script>

<style lang="scss" scoped>
.pending-convert-notice {
  margin-top: var(--sp-md);
  padding: var(--sp-md) var(--sp-lg);
  border: 1px solid var(--base-warning);
  border-radius: var(--radius-md);
  background: var(--color-highlight-bg);
}

.pending-convert-title {
  font-weight: 700;
  color: var(--base-font-color);
  margin-bottom: var(--sp-sm);
}

.pending-convert-list {
  display: flex;
  flex-direction: column;
  gap: var(--sp-sm);
}

.pending-convert-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--sp-sm);
  padding: var(--sp-sm) var(--sp-md);
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}

.pending-convert-info {
  display: flex;
  align-items: center;
  gap: var(--sp-md);
  flex-wrap: wrap;
}

.pending-convert-stock {
  font-weight: 700;
  color: var(--base-font-color);
}

.pending-convert-date {
  color: var(--base-sub-color);
  font-size: var(--fs-sm);
}
</style>
