<template>
  <SectionCardGeneric
    :title="$t('view.sale.pipelineDashboard.summaryTitle')"
    icon="bi-cash-stack"
    accent="main"
    headerStyle="dashboard"
    class="section-card-block"
  >
    <div class="kpi-grid">
      <div class="kpi-card">
        <StatCardGeneric
          icon="bi-cash-stack"
          :value="formatMoneyValue(summary.totalAmountThb)"
          :label="$t('view.sale.pipelineDashboard.kpiTotalAmount')"
          :subLabel="$t('view.sale.pipelineDashboard.kpiTotalAmountSub')"
          variant="main"
        />
      </div>
      <div class="kpi-card">
        <StatCardGeneric
          icon="bi-check2-circle"
          :value="formatMoneyValue(summary.paidAmountThb)"
          :label="$t('view.sale.pipelineDashboard.kpiPaidAmount')"
          :subLabel="$t('view.sale.pipelineDashboard.kpiPaidAmountSub', { count: formatCount(summary.paidInvoiceCount) })"
          variant="green"
        />
      </div>
      <div class="kpi-card">
        <StatCardGeneric
          icon="bi-hourglass-split"
          :value="formatMoneyValue(summary.outstandingAmountThb)"
          :label="$t('view.sale.pipelineDashboard.kpiOutstandingAmount')"
          :subLabel="$t('view.sale.pipelineDashboard.kpiOutstandingAmountSub', { count: formatCount(summary.outstandingInvoiceCount) })"
          variant="warning"
        />
      </div>
      <div class="kpi-card">
        <StatCardGeneric
          icon="bi-receipt"
          :value="formatCount(summary.invoiceCount)"
          :label="$t('view.sale.pipelineDashboard.kpiInvoiceCount')"
          :subLabel="$t('view.sale.pipelineDashboard.kpiInvoiceCountSub', { count: formatCount(summary.pieceCount) })"
          variant="grey"
        />
      </div>
    </div>

    <p v-if="summary.uncomputableInvoiceCount > 0" class="summary-note">
      <i class="bi bi-info-circle"></i>
      {{ $t('view.sale.pipelineDashboard.uncomputableNote', { count: formatCount(summary.uncomputableInvoiceCount) }) }}
    </p>

    <p v-if="summary.overpaidInvoiceCount > 0" class="summary-note summary-note--warn">
      <i class="bi bi-exclamation-triangle"></i>
      {{
        $t('view.sale.pipelineDashboard.overpaidNote', {
          count: formatCount(summary.overpaidInvoiceCount),
          amount: formatMoneyValue(summary.overpaidAmountThb)
        })
      }}
    </p>
  </SectionCardGeneric>
</template>

<script>
import { useSaleReportApiStore } from '@/stores/modules/api/sale/sale-report-api.js'
import { formatMoney } from '@/services/utils/decimal.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import StatCardGeneric from '@/components/generic/StatCardGeneric.vue'

export default {
  name: 'SalePipelineDashboardSummaryView',

  components: {
    SectionCardGeneric,
    StatCardGeneric
  },

  setup() {
    const saleReportStore = useSaleReportApiStore()
    return { saleReportStore }
  },

  props: {
    filter: {
      type: Object,
      default: () => ({})
    }
  },

  computed: {
    summary() {
      return this.saleReportStore.summary
    }
  },

  watch: {
    filter: {
      handler() {
        this.saleReportStore.fetchSalesSummary(this.filter)
      },
      deep: true,
      immediate: true
    }
  },

  methods: {
    formatMoneyValue(value) {
      return formatMoney(value)
    },

    formatCount(value) {
      return new Intl.NumberFormat('th-TH').format(value || 0)
    }
  }
}
</script>

<style lang="scss" scoped>
.section-card-block {
  margin-bottom: var(--sp-lg);
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  align-items: stretch;
  gap: var(--sp-md);

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.kpi-card {
  height: 100%;

  :deep(.stat-card) {
    height: 100%;
  }
}

.summary-note {
  display: flex;
  align-items: center;
  gap: var(--sp-xs);
  margin: var(--sp-md) 0 0;
  color: var(--base-sub-color);
  font-size: var(--fs-sm);

  &--warn {
    color: var(--base-warning);
  }
}
</style>
