<template>
  <SectionCardGeneric
    :title="$t('view.sale.pipelineDashboard.topCustomersTitle')"
    icon="bi-people"
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
  name: 'SalePipelineDashboardTopCustomersView',

  components: {
    SectionCardGeneric,
    ChartGeneric
  },

  setup() {
    const saleReportStore = useSaleReportApiStore()
    return { saleReportStore }
  },

  computed: {
    topCustomers() {
      return this.saleReportStore.pipeline.topCustomers
    },

    chartSeries() {
      return [
        {
          name: this.$t('view.sale.pipelineDashboard.statTotalQuotationValue'),
          data: this.topCustomers.map((item) => Number(item.value) || 0)
        }
      ]
    },

    chartOptions() {
      return {
        xaxis: {
          categories: this.topCustomers.map((item) => item.customerName)
        },
        plotOptions: {
          bar: { horizontal: true }
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
