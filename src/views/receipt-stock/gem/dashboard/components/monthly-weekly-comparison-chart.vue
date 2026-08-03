<template>
  <div class="mb-4 monthly-weekly-comparison-chart">
    <SectionCardGeneric
      :title="$t('view.stock.gem.dashboard.monthlyReport.weeklyComparison.title')"
      icon="bi-bar-chart-steps"
      accent="main"
      headerStyle="legend"
    >
      <ChartGeneric
        type="bar"
        :series="chartSeries"
        :options="chartOptions"
        :height="320"
        :loading="loading"
        :emptyText="$t('view.stock.gem.dashboard.monthlyReport.weeklyComparison.chartEmpty')"
      />
    </SectionCardGeneric>
  </div>
</template>

<script>
import { CHART_TOKENS } from '@/services/utils/chart-colors.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ChartGeneric from '@/components/prime-vue/ChartGeneric.vue'

export default {
  name: 'MonthlyWeeklyComparisonChart',

  components: {
    SectionCardGeneric,
    ChartGeneric
  },

  props: {
    weeklyComparisons: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    sortedWeeks() {
      return [...this.weeklyComparisons].sort(
        (a, b) => (a.weekNumber || 0) - (b.weekNumber || 0)
      )
    },

    chartSeries() {
      return [
        {
          name: this.$t('view.stock.gem.dashboard.monthlyReport.weeklyComparison.quantityIn'),
          data: this.sortedWeeks.map((week) => week.quantityIn || 0)
        },
        {
          name: this.$t('view.stock.gem.dashboard.monthlyReport.weeklyComparison.quantityOut'),
          data: this.sortedWeeks.map((week) => week.quantityOut || 0)
        }
      ]
    },

    chartOptions() {
      return {
        chart: { type: 'bar', toolbar: { show: false } },
        plotOptions: {
          bar: { horizontal: false, columnWidth: '55%', borderRadius: 4 }
        },
        colors: [CHART_TOKENS.green, CHART_TOKENS.red],
        legend: { show: true, position: 'top' },
        xaxis: {
          categories: this.sortedWeeks.map((week) =>
            this.$t('view.stock.gem.dashboard.monthlyReport.weeklyComparison.weekLabel', {
              n: week.weekNumber
            })
          ),
          labels: { style: { fontSize: '11px' } }
        },
        dataLabels: { enabled: false },
        tooltip: { shared: true, intersect: false }
      }
    }
  }
}
</script>
