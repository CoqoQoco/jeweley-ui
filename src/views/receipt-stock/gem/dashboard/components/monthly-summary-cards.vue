<template>
  <div class="mb-4 monthly-summary-cards">
    <SectionCardGeneric
      :title="$t('view.stock.gem.dashboard.monthlyReport.summary.title')"
      icon="bi-calendar2-check"
      accent="main"
      headerStyle="legend"
    >
      <div class="monthly-summary-grid">
        <StatCardGeneric
          icon="bi-arrow-left-right"
          :value="formatNumber(summary.totalTransactions)"
          :label="$t('view.stock.gem.dashboard.monthlyReport.summary.totalTransactions')"
        />
        <StatCardGeneric
          icon="bi-box-arrow-in-down"
          :value="formatNumber(summary.totalQuantityIn)"
          :label="$t('view.stock.gem.dashboard.monthlyReport.summary.totalQuantityIn')"
          variant="green"
        />
        <StatCardGeneric
          icon="bi-box-arrow-up-right"
          :value="formatNumber(summary.totalQuantityOut)"
          :label="$t('view.stock.gem.dashboard.monthlyReport.summary.totalQuantityOut')"
          variant="warning"
        />
        <StatCardGeneric
          icon="bi-graph-up-arrow"
          :value="formatPercent(summary.monthOverMonthGrowth)"
          :label="$t('view.stock.gem.dashboard.monthlyReport.summary.monthOverMonthGrowth')"
          variant="green"
        />
        <StatCardGeneric
          icon="bi-arrow-repeat"
          :value="formatNumber(summary.inventoryTurnoverRatio, 2)"
          :label="$t('view.stock.gem.dashboard.monthlyReport.summary.inventoryTurnoverRatio')"
          variant="grey"
        />
      </div>
    </SectionCardGeneric>
  </div>
</template>

<script>
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import StatCardGeneric from '@/components/generic/StatCardGeneric.vue'

export default {
  name: 'MonthlySummaryCards',

  components: {
    SectionCardGeneric,
    StatCardGeneric
  },

  props: {
    summary: {
      type: Object,
      default: () => ({})
    }
  },

  methods: {
    formatNumber(value, decimals = 0) {
      if (!value && value !== 0) return '0' + (decimals > 0 ? '.'.padEnd(decimals + 1, '0') : '')
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(value)
    },

    formatPercent(value) {
      if (!value && value !== 0) return '0.00%'
      return `${new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value)}%`
    }
  }
}
</script>

<style lang="scss" scoped>
.monthly-summary-cards {
  .monthly-summary-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--sp-lg);

    @media (max-width: 1024px) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 600px) {
      grid-template-columns: 1fr;
    }
  }
}
</style>
