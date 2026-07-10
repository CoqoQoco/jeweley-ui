<template>
  <div class="cost-breakdown">
    <div v-if="!transactions.length" class="mobile-empty-state small">
      <i class="bi bi-inbox"></i>
      <div class="empty-title">{{ $t('common.label.noData') }}</div>
    </div>

    <template v-else>
      <div v-for="group in groupedData" :key="group.key" class="cost-group-card">
        <div class="group-header">
          <i :class="['bi', group.icon]"></i>
          <span>{{ group.name }}</span>
        </div>
        <div class="group-items">
          <div v-for="(t, idx) in group.items" :key="idx" class="cost-item">
            <div class="cost-item-name">{{ t.nameDescription }}</div>
            <div class="cost-item-rows">
              <div class="cost-item-row">
                <span class="label">{{ $t('view.stock.product.costColQty') }}</span>
                <span class="value">{{ formatNumber(t.qty) }}</span>
                <span class="label">{{ $t('view.stock.product.costColQtyPrice') }}</span>
                <span class="value">{{ formatCurrency(t.qtyPrice) }}</span>
              </div>
              <div class="cost-item-row">
                <span class="label">{{ $t('view.stock.product.costColWeight') }}</span>
                <span class="value">{{ formatNumber(t.qtyWeight) }}</span>
                <span class="label">{{ $t('view.stock.product.costColWeightPrice') }}</span>
                <span class="value">{{ formatCurrency(t.qtyWeightPrice) }}</span>
              </div>
              <div class="cost-item-row total-row">
                <span class="label">{{ $t('view.stock.product.costColTotal') }}</span>
                <span class="value">{{ formatCurrency(t.totalPrice) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="cost-summary-card">
        <div class="summary-row">
          <span>{{ $t('view.stock.product.totalCost') }}</span>
          <span class="summary-value">{{ formatCurrency(totalPrice) }}</span>
        </div>
        <div v-if="tagPriceMultiplier > 0" class="summary-row tag-row">
          <span>{{ $t('view.stock.product.tagPrice', { multiplier: tagPriceMultiplier }) }}</span>
          <span class="summary-value">{{ formatCurrency(tagPrice) }}</span>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { formatDecimal } from '@/services/utils/decimal.js'

const GROUP_ORDER = { Gold: 1, Gem: 2, Worker: 3, Embed: 4, ETC: 5 }
const GROUP_ICON = { Gold: 'bi-coin', Gem: 'bi-gem', Worker: 'bi-tools', Embed: 'bi-grid-3x3', ETC: 'bi-plus-circle' }

export default {
  name: 'CostBreakdown',

  props: {
    transactions: {
      type: Array,
      default: () => []
    },
    tagPriceMultiplier: {
      type: Number,
      default: 1
    }
  },

  computed: {
    groupedData() {
      const groups = {}
      for (const t of this.transactions) {
        const key = t.nameGroup || 'ETC'
        if (!groups[key]) {
          groups[key] = {
            key,
            name: this.getGroupLabel(key),
            icon: GROUP_ICON[key] || 'bi-list-check',
            order: GROUP_ORDER[key] || 999,
            items: []
          }
        }
        groups[key].items.push(t)
      }
      return Object.values(groups).sort((a, b) => a.order - b.order)
    },

    totalPrice() {
      return this.transactions.reduce((sum, t) => sum + (t.totalPrice || 0), 0)
    },

    tagPrice() {
      return this.totalPrice * (this.tagPriceMultiplier || 1)
    }
  },

  methods: {
    getGroupLabel(group) {
      const labels = {
        Gold: this.$t('view.stock.product.groupGold'),
        Gem: this.$t('view.stock.product.groupGem'),
        Worker: this.$t('view.stock.product.groupWorker'),
        Embed: this.$t('view.stock.product.groupEmbed'),
        ETC: this.$t('view.stock.product.groupEtc')
      }
      return labels[group] || group
    },

    formatCurrency(value) {
      if (value === null || value === undefined || value === '') return '-'
      return formatDecimal(Number(value), 2)
    },

    formatNumber(value) {
      if (value === null || value === undefined || value === '') return '-'
      return formatDecimal(Number(value), 2)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/mobile';

.cost-group-card {
  background: var(--color-card-bg);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--sp-md);

  &:last-of-type {
    margin-bottom: 0;
  }
}

.group-header {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  padding: var(--sp-md) var(--sp-lg);
  background: linear-gradient(135deg, var(--base-green) 0%, #026266 100%);
  color: #ffffff;
  font-weight: 600;
  font-size: 0.9rem;
}

.group-items {
  padding: var(--sp-md);
  display: flex;
  flex-direction: column;
  gap: var(--sp-sm);
}

.cost-item {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--sp-md);
}

.cost-item-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: #333;
  margin-bottom: var(--sp-sm);
  padding-bottom: 6px;
  border-bottom: 1px solid #f0f0f0;
}

.cost-item-rows {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cost-item-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 4px;
  font-size: 0.75rem;

  .label {
    color: #888;
  }

  .value {
    color: #333;
    font-weight: 500;
    text-align: right;
  }

  &.total-row {
    grid-template-columns: 1fr 1fr;
    margin-top: 4px;
    padding-top: 6px;
    border-top: 1px solid #f0f0f0;

    .label {
      font-weight: 600;
      color: #333;
    }

    .value {
      font-weight: 700;
      color: var(--base-green);
      font-size: 0.85rem;
    }
  }
}

.cost-summary-card {
  background: var(--color-card-bg);
  border-radius: var(--radius-lg);
  padding: var(--sp-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  font-size: 0.9rem;
  color: #333;
  font-weight: 600;

  .summary-value {
    font-weight: 700;
    color: var(--base-font-color);
  }

  &.tag-row {
    color: var(--base-warning);

    .summary-value {
      color: var(--base-warning);
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
