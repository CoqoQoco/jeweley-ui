<template>
  <SectionCardGeneric
    :title="$t('view.production.dashboard.productionStatus')"
    icon="bi-bar-chart"
    accent="main"
    headerStyle="legend"
  >
    <ChartGeneric
      type="bar"
      :series="barSeries"
      :options="barOptions"
      :height="barChartHeight"
      :loading="isLoading"
    />
  </SectionCardGeneric>
</template>

<script>
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ChartGeneric from '@/components/prime-vue/ChartGeneric.vue'
import { CHART_TOKENS } from '@/services/utils/chart-colors.js'

export default {
  name: 'DashboardChartSection',

  components: {
    SectionCardGeneric,
    ChartGeneric
  },

  props: {
    chartData: {
      type: Object,
      default: () => null
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    reportItems() {
      return this.chartData?.report || []
    },

    barSeries() {
      return [
        {
          name: this.$t('view.production.dashboard.count'),
          data: this.reportItems.map((item) => item.count || 0)
        }
      ]
    },

    barChartHeight() {
      const minHeight = 320
      const perRow = 38
      return Math.max(minHeight, this.reportItems.length * perRow + 80)
    },

    barOptions() {
      return {
        chart: { type: 'bar', toolbar: { show: false } },
        plotOptions: {
          bar: { horizontal: true, borderRadius: 4, barHeight: '60%' }
        },
        colors: [CHART_TOKENS.primary],
        legend: { show: false },
        xaxis: {
          categories: this.reportItems.map((item) =>
            this.$i18n.locale === 'th' ? item.statusNameTH : item.statusNameEN
          ),
          labels: { style: { fontSize: '11px' } }
        },
        dataLabels: {
          enabled: true,
          style: { fontSize: '11px', colors: ['#fff'] }
        },
        tooltip: {
          y: {
            formatter: (val) => `${val} ${this.$t('view.production.dashboard.count')}`
          }
        }
      }
    }
  }
}
</script>
