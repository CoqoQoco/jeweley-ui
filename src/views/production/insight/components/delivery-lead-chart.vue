<!--
  delivery-lead-chart — กราฟ "วางแผน vs ใช้จริง (เวลาผลิต)" (ส่วนที่ 2 ของกล่อง "แนวโน้มส่งงานตรงเวลา",
  reportRef: deliveryTrend) — เส้นคู่ วางแผน/ใช้จริง ต่อช่วง (null = ยังไม่มีข้อมูลช่วงนั้น เว้นช่องว่าง)

  Props:
    series  — Array (required) ของ Delivery.series item {bucketEnd, plannedLeadMedianDays|null, actualLeadMedianDays|null}
    loading — Boolean (false)
-->
<template>
  <ChartGeneric type="line" :series="chartSeries" :options="options" :height="280" :loading="loading" :emptyText="$t('common.label.noData')" />
</template>

<script>
import { CHART_TOKENS } from '@/services/utils/chart-colors.js'
import { mapDeliverySeriesField } from './delivery-helpers.js'

import ChartGeneric from '@/components/prime-vue/ChartGeneric.vue'

export default {
  name: 'DeliveryLeadChart',

  components: {
    ChartGeneric
  },

  props: {
    series: {
      type: Array,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    chartSeries() {
      return [
        { name: this.$t('view.productionInsight.delivery.seriesPlanned'), type: 'line', data: mapDeliverySeriesField(this.series, 'plannedLeadMedianDays') },
        { name: this.$t('view.productionInsight.delivery.seriesActual'), type: 'line', data: mapDeliverySeriesField(this.series, 'actualLeadMedianDays') }
      ]
    },

    options() {
      return {
        chart: { type: 'line', toolbar: { show: false } },
        colors: [CHART_TOKENS.sub, CHART_TOKENS.primary],
        stroke: { width: [2, 3], curve: 'smooth', dashArray: [6, 0] },
        xaxis: { categories: this.series.map((p) => this.bucketLabel(p.bucketEnd)) },
        yaxis: { labels: { formatter: (v) => this.formatDays(v) } },
        tooltip: { y: { formatter: (v) => this.formatDays(v) } }
      }
    }
  },

  methods: {
    formatDays(value) {
      if (value == null) return '—'
      return new Intl.NumberFormat('th-TH', { maximumFractionDigits: 1 }).format(value)
    },

    bucketLabel(bucketEnd) {
      return bucketEnd ? new Intl.DateTimeFormat('th-TH', { day: '2-digit', month: '2-digit' }).format(new Date(bucketEnd)) : ''
    }
  }
}
</script>
