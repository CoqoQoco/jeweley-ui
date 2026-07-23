<template>
  <div class="mb-4">
    <SectionCardGeneric
      :title="$t('view.stock.materialValuationReport.chartTitle')"
      icon="bi-pie-chart"
      accent="main"
      headerStyle="legend"
    >
      <ChartGeneric
        type="donut"
        :series="chartSeries"
        :options="chartOptions"
        :height="320"
        :emptyText="$t('view.stock.materialValuationReport.noData')"
      />
    </SectionCardGeneric>
  </div>
</template>

<script>
import { useMaterialValuationReportApiStore } from '@/stores/modules/api/stock/material-valuation-report-api.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ChartGeneric from '@/components/prime-vue/ChartGeneric.vue'

export default {
  name: 'MaterialValuationReportChartView',

  components: {
    SectionCardGeneric,
    ChartGeneric
  },

  setup() {
    const materialValuationStore = useMaterialValuationReportApiStore()
    return { materialValuationStore }
  },

  computed: {
    chartSeries() {
      return this.materialValuationStore.byType.map((item) => Number(item.totalValue) || 0)
    },

    chartOptions() {
      return {
        labels: this.materialValuationStore.byType.map((item) => item.type),
        tooltip: {
          y: {
            formatter: (value) =>
              new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
          }
        }
      }
    }
  }
}
</script>
