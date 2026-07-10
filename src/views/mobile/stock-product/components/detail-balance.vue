<template>
  <div class="detail-balance">
    <div class="info-card">
      <div class="card-header">
        <i class="bi bi-diagram-3"></i>
        <span>{{ $t('view.stock.product.slocBalanceTitle') }}</span>
      </div>
      <div class="card-body">
        <div v-if="rows.length" class="balance-list">
          <div v-for="(row, idx) in rows" :key="idx" class="balance-row">
            <div class="balance-location">{{ row.location }}</div>
            <div class="balance-values">
              <span>{{ $t('view.stock.product.slocQtyOnHand') }}: {{ formatDecimal(row.qtyOnHand, 2) }}</span>
              <span>{{ $t('view.stock.product.slocQtyReserved') }}: {{ formatDecimal(row.qtyReserved, 2) }}</span>
              <span>{{ $t('view.stock.product.slocQtyAvailable') }}: {{ formatDecimal(row.qtyAvailable, 2) }}</span>
            </div>
          </div>
          <div class="balance-row balance-total">
            <div class="balance-location">{{ $t('view.stock.product.slocTotal') }}</div>
            <div class="balance-values">
              <span>{{ $t('view.stock.product.slocQtyOnHand') }}: {{ formatDecimal(totalOnHand, 2) }}</span>
              <span>{{ $t('view.stock.product.slocQtyReserved') }}: {{ formatDecimal(totalReserved, 2) }}</span>
              <span>{{ $t('view.stock.product.slocQtyAvailable') }}: {{ formatDecimal(totalAvailable, 2) }}</span>
            </div>
          </div>
        </div>
        <div v-else class="mobile-empty-state small">
          <i class="bi bi-inbox"></i>
          <div class="empty-title">{{ $t('common.label.noData') }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { formatDecimal } from '@/services/utils/decimal.js'

export default {
  name: 'DetailBalance',

  props: {
    item: {
      type: Object,
      required: true
    }
  },

  computed: {
    rows() {
      return this.item?.slocBalances || []
    },
    totalOnHand() {
      return this.rows.reduce((s, r) => s + (r.qtyOnHand ?? 0), 0)
    },
    totalReserved() {
      return this.rows.reduce((s, r) => s + (r.qtyReserved ?? 0), 0)
    },
    totalAvailable() {
      return this.rows.reduce((s, r) => s + (r.qtyAvailable ?? 0), 0)
    }
  },

  methods: {
    formatDecimal
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/mobile';

.info-card {
  background: var(--color-card-bg);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.card-header {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  padding: var(--sp-md) var(--sp-lg);
  background: #f8f9fa;
  border-bottom: 1px solid var(--color-border);
  font-weight: 600;
  color: var(--base-font-color);
  font-size: 0.95rem;

  i {
    font-size: 1.1rem;
  }
}

.card-body {
  padding: var(--sp-lg);
}

.balance-list {
  display: flex;
  flex-direction: column;
  gap: var(--sp-sm);
}

.balance-row {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--sp-md);

  .balance-location {
    font-weight: 700;
    color: var(--base-font-color);
    font-size: 0.85rem;
    margin-bottom: 4px;
  }

  .balance-values {
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-size: 0.8rem;
    color: #444;
  }

  &.balance-total {
    background: #fdf2f2;
    border-color: var(--base-font-color);

    .balance-location {
      color: var(--base-font-color);
    }
  }
}

.mobile-empty-state.small {
  padding: var(--sp-2xl) var(--sp-lg);

  i {
    font-size: 2rem;
    margin-bottom: var(--sp-sm);
  }
}
</style>
