<template>
  <div class="summary-grid">
    <StatCardGeneric
      icon="bi-receipt"
      :value="formatNumber(report.summary.invoiceCount)"
      :label="$t('view.report.saleByChannel.statInvoiceCount')"
    />
    <StatCardGeneric
      icon="bi-gem"
      :value="formatNumber(report.summary.pieceCount)"
      :label="$t('view.report.saleByChannel.statPieceCount')"
      variant="green"
    />
    <StatCardGeneric
      v-for="item in report.summary.amounts"
      :key="item.currencyUnit"
      icon="bi-cash-stack"
      :value="formatAmount(item.amount, item.currencyUnit)"
      :label="`${$t('view.report.saleByChannel.statAmount')} (${item.currencyUnit})`"
      variant="warning"
    />
  </div>
</template>

<script>
import { useSaleReportByChannelApiStore } from '@/stores/modules/api/sale/sale-report-by-channel-store.js'
import { formatDocCurrency } from '@/services/utils/decimal.js'

import StatCardGeneric from '@/components/generic/StatCardGeneric.vue'

export default {
  name: 'ReportSaleByChannelSummaryView',

  components: {
    StatCardGeneric
  },

  setup() {
    const saleReportByChannelStore = useSaleReportByChannelApiStore()
    return { saleReportByChannelStore }
  },

  computed: {
    report() {
      return this.saleReportByChannelStore.report
    }
  },

  methods: {
    formatNumber(value) {
      return new Intl.NumberFormat('th-TH').format(value || 0)
    },
    formatAmount(value, unit) {
      return formatDocCurrency(value, unit)
    }
  }
}
</script>

<style lang="scss" scoped>
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--sp-lg);
  margin: var(--sp-lg) 0;
}
</style>
