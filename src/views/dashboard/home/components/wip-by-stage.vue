<template>
  <SectionCardGeneric :title="$t('view.dashboard.home.wipByStage.title')" icon="bi-diagram-3" accent="main" headerStyle="legend">
    <ChartGeneric type="bar" :series="series" :options="options" :height="chartHeight" />
  </SectionCardGeneric>
</template>

<script>
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ChartGeneric from '@/components/prime-vue/ChartGeneric.vue'
import { CHART_TOKENS } from '@/services/utils/chart-colors.js'

export default {
  name: 'WipByStage',

  components: {
    SectionCardGeneric,
    ChartGeneric
  },

  props: {
    rows: {
      type: Array,
      default: () => []
    }
  },

  computed: {
    sortedRows() {
      return [...this.rows].sort((a, b) => b.count - a.count)
    },

    series() {
      return [{ name: this.$t('view.dashboard.home.wipByStage.unit'), data: this.sortedRows.map((r) => r.count) }]
    },

    chartHeight() {
      return Math.max(200, this.sortedRows.length * 32 + 60)
    },

    options() {
      return {
        plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: '60%' } },
        colors: [CHART_TOKENS.primary],
        xaxis: { categories: this.sortedRows.map((r) => r.name) },
        dataLabels: { enabled: true, style: { fontSize: '11px', colors: ['#fff'] } }
      }
    }
  }
}
</script>
