<template>
  <div class="stock-balance-summary-grid">
    <StatCardGeneric
      icon="bi-upc-scan"
      :value="formatNumber(stockBalanceStore.summary.skuCount)"
      :label="$t('view.stock.stockBalanceSummary.summarySkuCount')"
    />
    <StatCardGeneric
      icon="bi-geo-alt"
      :value="formatNumber(stockBalanceStore.summary.locationCount)"
      :label="$t('view.stock.stockBalanceSummary.summaryLocationCount')"
      variant="green"
    />
    <StatCardGeneric
      icon="bi-box-seam"
      :value="formatDecimal(stockBalanceStore.summary.totalOnHand)"
      :label="$t('view.stock.stockBalanceSummary.summaryTotalOnHand')"
      variant="grey"
    />
    <StatCardGeneric
      icon="bi-check-circle"
      :value="formatDecimal(stockBalanceStore.summary.totalAvailable)"
      :label="$t('view.stock.stockBalanceSummary.summaryTotalAvailable')"
      variant="warning"
    />
  </div>
</template>

<script>
import { useStockBalanceApiStore } from '@/stores/modules/api/stock/stock-balance-api.js'

import StatCardGeneric from '@/components/generic/StatCardGeneric.vue'

export default {
  name: 'StockBalanceSummarySummaryView',

  components: {
    StatCardGeneric
  },

  setup() {
    const stockBalanceStore = useStockBalanceApiStore()
    return { stockBalanceStore }
  },

  methods: {
    formatNumber(value) {
      return new Intl.NumberFormat('th-TH').format(value || 0)
    },
    formatDecimal(value) {
      return new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value || 0)
    }
  }
}
</script>

<style lang="scss" scoped>
.stock-balance-summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--sp-lg);
  margin: var(--sp-lg) 0;
}

@media (max-width: 1024px) {
  .stock-balance-summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
