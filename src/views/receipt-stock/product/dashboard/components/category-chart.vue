<template>
  <div class="mb-4">
    <SectionCardGeneric
      :title="$t('view.stock.product.dashboard.categoryChartTitle')"
      icon="bi-bar-chart"
      accent="main"
      headerStyle="legend"
    >
      <ChartGeneric
        type="bar"
        :series="chartSeries"
        :options="chartOptions"
        :height="chartHeight"
      />
    </SectionCardGeneric>
  </div>
</template>

<script>
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ChartGeneric from '@/components/prime-vue/ChartGeneric.vue'
import { CHART_TOKENS } from '@/services/utils/chart-colors.js'

export default {
  name: 'CategoryChart',

  components: {
    SectionCardGeneric,
    ChartGeneric
  },

  props: {
    categoryChartData: {
      type: Object,
      default: () => ({})
    }
  },

  computed: {
    reportItems() {
      return this.categoryChartData?.report || []
    },

    datasetFields() {
      return [
        { key: 'count', label: 'Count', labelTH: this.$t('view.stock.product.dashboard.categoryCountLabel') }
      ]
    },

    chartSeries() {
      return this.datasetFields.map((field) => ({
        name: this.$i18n.locale === 'th' ? field.labelTH : field.label,
        data: this.reportItems.map((item) => item[field.key] || 0)
      }))
    },

    chartHeight() {
      const minHeight = 400
      const perCategory = 30 * this.datasetFields.length + 24
      return Math.max(minHeight, this.reportItems.length * perCategory + 100)
    },

    chartOptions() {
      return {
        chart: { type: 'bar', toolbar: { show: false } },
        plotOptions: {
          bar: { horizontal: true, borderRadius: 4, barHeight: '80%' }
        },
        colors: [CHART_TOKENS.primary],
        legend: { show: false },
        xaxis: {
          categories: this.reportItems.map((item) =>
            this.$i18n.locale === 'th' ? item.statusNameTH : item.statusNameEN
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
