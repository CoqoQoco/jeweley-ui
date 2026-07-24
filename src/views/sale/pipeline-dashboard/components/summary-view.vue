<template>
  <div class="pipeline-summary-grid">
    <StatCardGeneric
      icon="bi-cash-stack"
      :value="formatMoneyValue(pipeline.summary.totalQuotationValue)"
      :label="$t('view.sale.pipelineDashboard.statTotalQuotationValue')"
    />
    <StatCardGeneric
      icon="bi-file-earmark-text"
      :value="formatNumber(pipeline.summary.quotationCount)"
      :label="$t('view.sale.pipelineDashboard.statQuotationCount')"
      variant="green"
    />
    <StatCardGeneric
      icon="bi-people"
      :value="formatNumber(pipeline.summary.activeCustomers)"
      :label="$t('view.sale.pipelineDashboard.statActiveCustomers')"
      variant="grey"
    />
    <StatCardGeneric
      icon="bi-graph-up-arrow"
      :value="formatPercent(pipeline.summary.conversionRate)"
      :label="$t('view.sale.pipelineDashboard.statConversionRate')"
      variant="warning"
    />
  </div>
</template>

<script>
import { useSaleReportApiStore } from '@/stores/modules/api/sale/sale-report-api.js'
import { formatMoney } from '@/services/utils/decimal.js'

import StatCardGeneric from '@/components/generic/StatCardGeneric.vue'

export default {
  name: 'SalePipelineDashboardSummaryView',

  components: {
    StatCardGeneric
  },

  setup() {
    const saleReportStore = useSaleReportApiStore()
    return { saleReportStore }
  },

  computed: {
    pipeline() {
      return this.saleReportStore.pipeline
    }
  },

  methods: {
    formatMoneyValue(value) {
      return formatMoney(value)
    },
    formatNumber(value) {
      return new Intl.NumberFormat('th-TH').format(value || 0)
    },
    formatPercent(value) {
      return `${new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      }).format(value || 0)}%`
    }
  }
}
</script>

<style lang="scss" scoped>
.pipeline-summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--sp-lg);
  margin: var(--sp-lg) 0;
}

@media (max-width: 1024px) {
  .pipeline-summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
