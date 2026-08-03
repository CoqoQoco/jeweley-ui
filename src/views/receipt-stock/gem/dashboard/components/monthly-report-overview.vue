<template>
  <div class="monthly-report-overview">
    <MonthlySummaryCards :summary="summary" />
    <MonthlyWeeklyComparisonChart :weekly-comparisons="weeklyComparisons" :loading="loading" />
    <MonthlyTopPerformersTable :top-performers="topPerformers" />
    <MonthlyInventoryAnalysisTable :inventory-analysis="inventoryAnalysis" />
    <MonthlySupplierAnalysisTable :supplier-analysis="supplierAnalysis" />
    <MonthlyPriceAnalysisTable :price-analysis="priceAnalysis" />
  </div>
</template>

<script>
import MonthlySummaryCards from './monthly-summary-cards.vue'
import MonthlyWeeklyComparisonChart from './monthly-weekly-comparison-chart.vue'
import MonthlyTopPerformersTable from './monthly-top-performers-table.vue'
import MonthlyInventoryAnalysisTable from './monthly-inventory-analysis-table.vue'
import MonthlySupplierAnalysisTable from './monthly-supplier-analysis-table.vue'
import MonthlyPriceAnalysisTable from './monthly-price-analysis-table.vue'

export default {
  name: 'MonthlyReportOverview',

  components: {
    MonthlySummaryCards,
    MonthlyWeeklyComparisonChart,
    MonthlyTopPerformersTable,
    MonthlyInventoryAnalysisTable,
    MonthlySupplierAnalysisTable,
    MonthlyPriceAnalysisTable
  },

  props: {
    summary: {
      type: Object,
      default: () => ({})
    },
    weeklyComparisons: {
      type: Array,
      default: () => []
    },
    topPerformers: {
      type: Array,
      default: () => []
    },
    inventoryAnalysis: {
      type: Array,
      default: () => []
    },
    supplierAnalysis: {
      type: Array,
      default: () => []
    },
    priceAnalysis: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  }
}
</script>
