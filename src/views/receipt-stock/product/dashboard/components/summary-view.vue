<template>
  <SectionCardGeneric
    :title="$t('view.stock.product.dashboard.summaryTitle')"
    icon="bi-box-seam"
    accent="main"
    headerStyle="dashboard"
    class="section-card-block"
  >
    <div class="kpi-grid">
      <div class="kpi-card">
        <StatCardGeneric
          icon="bi-box-seam"
          :value="formatCount(summary.pieceQty)"
          :label="$t('view.stock.product.dashboard.kpiPieceQty')"
          :subLabel="
            $t('view.stock.product.dashboard.kpiPieceQtySub', {
              rows: formatCount(summary.pieceRowCount),
              reserved: formatCount(summary.reservedQty)
            })
          "
          variant="main"
        />
      </div>
      <div class="kpi-card">
        <StatCardGeneric
          icon="bi-diagram-3"
          :value="formatCount(summary.designCount)"
          :label="$t('view.stock.product.dashboard.kpiDesignCount')"
          variant="grey"
        />
      </div>
      <div class="kpi-card">
        <StatCardGeneric
          icon="bi-hourglass-bottom"
          :value="formatCount(summary.agedOver2YearsQty)"
          :label="$t('view.stock.product.dashboard.kpiAgedOver2Years')"
          :subLabel="$t('view.stock.product.dashboard.kpiAgedOver2YearsSub', { percent: formatPercent(summary.agedOver2YearsPercent) })"
          variant="warning"
        />
      </div>
      <div class="kpi-card">
        <StatCardGeneric
          icon="bi-exclamation-triangle"
          :value="formatCount(summary.overProducedDesignCount)"
          :label="$t('view.stock.product.dashboard.kpiOverProduced')"
          :subLabel="$t('view.stock.product.dashboard.kpiOverProducedSub', { count: formatCount(summary.lowStockDesignCount) })"
          variant="warning"
        />
      </div>
    </div>
  </SectionCardGeneric>
</template>

<script>
import { useStockReportApiStore } from '@/stores/modules/api/stock/stock-report-api.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import StatCardGeneric from '@/components/generic/StatCardGeneric.vue'

export default {
  name: 'StockProductDashboardSummaryView',

  components: {
    SectionCardGeneric,
    StatCardGeneric
  },

  setup() {
    const stockReportStore = useStockReportApiStore()
    return { stockReportStore }
  },

  props: {
    filter: {
      type: Object,
      default: () => ({})
    }
  },

  computed: {
    summary() {
      return this.stockReportStore.summary
    }
  },

  watch: {
    filter: {
      handler() {
        this.stockReportStore.fetchSummary(this.filter)
      },
      deep: true,
      immediate: true
    }
  },

  methods: {
    formatCount(value) {
      return new Intl.NumberFormat('th-TH').format(value || 0)
    },

    formatPercent(value) {
      return `${new Intl.NumberFormat('th-TH', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value || 0)}%`
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
</style>
