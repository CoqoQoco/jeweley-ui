<template>
  <SectionCardGeneric :title="$t('view.dashboard.home.stockSummary.title')" icon="bi-box-seam" accent="green" headerStyle="legend">
    <div v-if="flags.canViewStockGem" class="stock-summary-section">
      <h6 class="stock-summary-subtitle">{{ $t('view.dashboard.home.stockSummary.gemTitle') }}</h6>
      <div class="stock-summary-grid">
        <StatCardGeneric icon="bi-gem" :value="formatNumber(gem.totalQuantity)" :label="$t('view.dashboard.home.stockSummary.totalQuantity')" />
        <StatCardGeneric icon="bi-currency-exchange" :value="formatCurrency(gem.totalValue)" :label="$t('view.dashboard.home.stockSummary.totalValue')" variant="green" />
        <StatCardGeneric icon="bi-exclamation-triangle" :value="formatNumber(gem.lowStockCount)" :label="$t('view.dashboard.home.stockSummary.lowStock')" variant="warning" />
      </div>
    </div>

    <div v-if="flags.canViewStockProduct" class="stock-summary-section">
      <h6 class="stock-summary-subtitle">{{ $t('view.dashboard.home.stockSummary.productTitle') }}</h6>
      <div class="stock-summary-grid">
        <StatCardGeneric icon="bi-box-seam" :value="formatNumber(product.totalQuantity)" :label="$t('view.dashboard.home.stockSummary.totalQuantity')" />
        <StatCardGeneric icon="bi-currency-exchange" :value="formatCurrency(product.totalValue)" :label="$t('view.dashboard.home.stockSummary.totalValue')" variant="green" />
        <StatCardGeneric icon="bi-arrow-repeat" :value="formatNumber(product.onProcessQuantity)" :label="$t('view.dashboard.home.stockSummary.onProcess')" variant="warning" />
      </div>
    </div>
  </SectionCardGeneric>
</template>

<script>
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import StatCardGeneric from '@/components/generic/StatCardGeneric.vue'

export default {
  name: 'StockSummary',

  components: {
    SectionCardGeneric,
    StatCardGeneric
  },

  props: {
    flags: {
      type: Object,
      default: () => ({})
    },
    gem: {
      type: Object,
      default: () => ({})
    },
    product: {
      type: Object,
      default: () => ({})
    }
  },

  methods: {
    formatNumber(v) {
      return new Intl.NumberFormat('th-TH').format(v || 0)
    },

    formatCurrency(v) {
      return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v || 0)
    }
  }
}
</script>

<style lang="scss" scoped>
.stock-summary-section {
  margin-bottom: var(--sp-lg);

  &:last-child {
    margin-bottom: 0;
  }
}

.stock-summary-subtitle {
  color: var(--base-font-color);
  font-weight: 600;
  padding-bottom: var(--sp-sm);
  border-bottom: 1px solid var(--color-border);
  margin-bottom: var(--sp-md);
}

.stock-summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--sp-md);
}
</style>
