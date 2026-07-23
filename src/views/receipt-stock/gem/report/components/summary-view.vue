<template>
  <div class="gem-onhand-summary-grid">
    <StatCardGeneric
      icon="bi-card-list"
      :value="formatNumber(gemOnhandReportStore.summary.totalCount)"
      :label="$t('view.stock.gemOnhandReport.summaryTotalCount')"
    />
    <StatCardGeneric
      icon="bi-stack"
      :value="formatNumber(gemOnhandReportStore.summary.totalQuantity)"
      :label="$t('view.stock.gemOnhandReport.summaryTotalQuantity')"
      variant="green"
    />
    <StatCardGeneric
      icon="bi-gem"
      :value="formatDecimal(gemOnhandReportStore.summary.totalWeight)"
      :label="$t('view.stock.gemOnhandReport.summaryTotalWeight')"
      variant="warning"
    />
    <StatCardGeneric
      icon="bi-cash-stack"
      :value="formatDecimal(gemOnhandReportStore.summary.totalValue)"
      :label="$t('view.stock.gemOnhandReport.summaryTotalValueApprox')"
      variant="grey"
    />
  </div>
</template>

<script>
import { useGemOnhandReportApiStore } from '@/stores/modules/api/stock/gem-onhand-report-api.js'

import StatCardGeneric from '@/components/generic/StatCardGeneric.vue'

export default {
  name: 'GemOnhandReportSummaryView',

  components: {
    StatCardGeneric
  },

  setup() {
    const gemOnhandReportStore = useGemOnhandReportApiStore()
    return { gemOnhandReportStore }
  },

  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    }
  },

  watch: {
    modelForm: {
      handler(val) {
        this.gemOnhandReportStore.fetchSummary({ formValue: val })
      },
      deep: true,
      immediate: true
    }
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
.gem-onhand-summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--sp-lg);
  margin: var(--sp-lg) 0;
}

@media (max-width: 1024px) {
  .gem-onhand-summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
