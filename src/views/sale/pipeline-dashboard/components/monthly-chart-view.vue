<template>
  <SectionCardGeneric
    :title="$t('view.sale.pipelineDashboard.monthlyTitle')"
    icon="bi-calendar3"
    accent="main"
    headerStyle="legend"
  >
    <ChartGeneric
      type="bar"
      :series="chartSeries"
      :options="chartOptions"
      :height="320"
      :emptyText="$t('common.label.noData')"
    />
  </SectionCardGeneric>
</template>

<script>
import { useSaleReportApiStore } from '@/stores/modules/api/sale/sale-report-api.js'
import { formatMoney } from '@/services/utils/decimal.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ChartGeneric from '@/components/prime-vue/ChartGeneric.vue'

export default {
  name: 'SalePipelineDashboardMonthlyChartView',

  components: {
    SectionCardGeneric,
    ChartGeneric
  },

  setup() {
    const saleReportStore = useSaleReportApiStore()
    return { saleReportStore }
  },

  computed: {
    monthlyQuotation() {
      return this.saleReportStore.pipeline.monthlyQuotation
    },

    chartSeries() {
      return [
        {
          name: this.$t('view.sale.pipelineDashboard.statTotalQuotationValue'),
          data: this.monthlyQuotation.map((item) => Number(item.value) || 0)
        }
      ]
    },

    chartOptions() {
      return {
        xaxis: {
          categories: this.monthlyQuotation.map((item) => item.ym)
        },
        tooltip: {
          y: {
            formatter: (value) => formatMoney(value)
          }
        }
      }
    }
  }
}
</script>
