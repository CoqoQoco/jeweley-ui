<template>
  <div class="kpi-grid mb-4">
    <StatCardGeneric
      icon="bi-gem"
      :value="formatNumber(stockSummary.totalGemTypes)"
      :label="$t('view.stock.gem.dashboard.totalGemTypes')"
    />
    <StatCardGeneric
      icon="bi-boxes"
      :value="formatNumber(stockSummary.totalQuantity)"
      :label="$t('view.stock.gem.dashboard.totalQuantity')"
      variant="green"
    />
    <StatCardGeneric
      icon="bi-speedometer2"
      :value="formatNumber(stockSummary.totalQuantityWeight)"
      :label="$t('view.stock.gem.dashboard.totalWeight')"
      variant="warning"
    />
    <StatCardGeneric
      icon="bi-exclamation-triangle"
      :value="formatNumber(stockSummary.lowStockCount)"
      :label="$t('view.stock.gem.dashboard.lowStockItems')"
      variant="grey"
    />
  </div>
</template>

<script>
import StatCardGeneric from '@/components/generic/StatCardGeneric.vue'

export default {
  name: 'StockSummaryCards',

  components: {
    StatCardGeneric
  },

  props: {
    stockSummary: {
      type: Object,
      default: () => ({})
    }
  },

  methods: {
    formatNumber(value) {
      if (!value) return '0'
      return new Intl.NumberFormat().format(value)
    }
  }
}
</script>

<style lang="scss" scoped>
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--sp-lg);
}
</style>
