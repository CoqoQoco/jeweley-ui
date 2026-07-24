<template>
  <SectionCardGeneric
    :title="$t('view.sale.pipelineDashboard.funnelTitle')"
    icon="bi-filter-circle"
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

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ChartGeneric from '@/components/prime-vue/ChartGeneric.vue'

export default {
  name: 'SalePipelineDashboardFunnelChartView',

  components: {
    SectionCardGeneric,
    ChartGeneric
  },

  setup() {
    const saleReportStore = useSaleReportApiStore()
    return { saleReportStore }
  },

  computed: {
    funnel() {
      return this.saleReportStore.pipeline.funnel
    },

    chartSeries() {
      return [
        {
          name: this.$t('common.field.quantity'),
          data: [this.funnel.quotationCount, this.funnel.saleOrderCount, this.funnel.invoiceCount]
        }
      ]
    },

    chartOptions() {
      return {
        xaxis: {
          categories: [
            this.$t('view.sale.pipelineDashboard.funnelQuotation'),
            this.$t('view.sale.pipelineDashboard.funnelSaleOrder'),
            this.$t('view.sale.pipelineDashboard.funnelInvoice')
          ]
        },
        plotOptions: {
          bar: { horizontal: true }
        },
        dataLabels: { enabled: true }
      }
    }
  }
}
</script>
