<template>
  <div class="material-valuation-summary-grid">
    <StatCardGeneric
      icon="bi-cash-stack"
      :value="formatDecimal(materialValuationStore.summary.totalValue)"
      :label="$t('view.stock.materialValuationReport.summaryTotalValueApprox')"
    />
    <StatCardGeneric
      icon="bi-box-seam"
      :value="formatDecimal(materialValuationStore.summary.totalWeight)"
      :label="$t('view.stock.materialValuationReport.summaryTotalWeight')"
      variant="green"
    />
    <StatCardGeneric
      icon="bi-card-list"
      :value="formatNumber(materialValuationStore.summary.totalCount)"
      :label="$t('view.stock.materialValuationReport.summaryTotalCount')"
      variant="grey"
    />
  </div>
</template>

<script>
import { useMaterialValuationReportApiStore } from '@/stores/modules/api/stock/material-valuation-report-api.js'

import StatCardGeneric from '@/components/generic/StatCardGeneric.vue'

export default {
  name: 'MaterialValuationReportSummaryView',

  components: {
    StatCardGeneric
  },

  setup() {
    const materialValuationStore = useMaterialValuationReportApiStore()
    return { materialValuationStore }
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
.material-valuation-summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--sp-lg);
  margin: var(--sp-lg) 0;
}

@media (max-width: 1024px) {
  .material-valuation-summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>
