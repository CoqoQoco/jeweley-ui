<template>
  <div class="kpi-grid mb-4">
    <StatCardGeneric
      icon="bi-box-seam"
      :value="formatNumber(stockSummary.totalProducts)"
      :label="$t('view.stock.product.dashboard.totalProducts')"
    />
    <StatCardGeneric
      icon="bi-currency-dollar"
      :value="formatCurrency(stockSummary.totalValue)"
      :label="$t('view.stock.product.dashboard.totalValue')"
      variant="green"
    />
    <StatCardGeneric
      icon="bi-check-circle"
      :value="formatNumber(stockSummary.availableCount)"
      :label="$t('view.stock.product.dashboard.availableProducts')"
      variant="grey"
    />
    <StatCardGeneric
      icon="bi-hourglass-split"
      :value="formatNumber(stockSummary.onProcessCount)"
      :label="$t('view.stock.product.dashboard.onProcessProducts')"
      variant="warning"
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
      default: () => ({
        totalProducts: 0,
        totalQuantity: 0,
        totalValue: 0,
        availableQuantity: 0,
        onProcessQuantity: 0,
        availableCount: 0,
        onProcessCount: 0
      })
    }
  },

  methods: {
    formatNumber(value) {
      if (!value) return '0'
      return new Intl.NumberFormat('en-US').format(value)
    },
    formatCurrency(value) {
      if (!value) return '฿0'
      return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value)
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
