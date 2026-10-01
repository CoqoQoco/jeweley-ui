<!--
  delivery-ontime-chart — กราฟ "% ตรงเวลารายช่วง" (ส่วนแรกของกล่อง "แนวโน้มส่งงานตรงเวลา", reportRef:
  deliveryTrend) — แท่ง %ตรงเวลาต่อช่วง + เส้นระดับเป้า (annotation, ไม่มีเป้า = ไม่แสดงเส้น)

  Props:
    series        — Array (required) ของ Delivery.series item {bucketEnd, onTimePercent|null, ...}
    targetPercent — Number|null (null) — เป้า % ตรงเวลาปัจจุบัน (draft หรือค่าที่บันทึกจริง)
    loading       — Boolean (false)
-->
<template>
  <ChartGeneric type="bar" :series="chartSeries" :options="options" :height="280" :loading="loading" :emptyText="$t('common.label.noData')" />
</template>

<script>
import { CHART_TOKENS } from '@/services/utils/chart-colors.js'
import { mapDeliverySeriesField } from './delivery-helpers.js'

import ChartGeneric from '@/components/prime-vue/ChartGeneric.vue'

export default {
  name: 'DeliveryOntimeChart',

  components: {
    ChartGeneric
  },

  props: {
    series: {
      type: Array,
      required: true
    },
    targetPercent: {
      type: Number,
      default: null
    },
    loading: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    chartSeries() {
      return [{ name: this.$t('view.productionInsight.delivery.seriesOnTime'), type: 'bar', data: mapDeliverySeriesField(this.series, 'onTimePercent') }]
    },

    options() {
      const hasTarget = Number.isFinite(this.targetPercent)
      return {
        chart: { type: 'bar', toolbar: { show: false } },
        colors: [CHART_TOKENS.primary],
        plotOptions: { bar: { columnWidth: '55%' } },
        xaxis: { categories: this.series.map((p) => this.bucketLabel(p.bucketEnd)) },
        yaxis: { max: 100, labels: { formatter: (v) => this.formatPercent(v) } },
        tooltip: { y: { formatter: (v) => this.formatPercent(v) } },
        annotations: hasTarget
          ? {
              yaxis: [
                {
                  y: this.targetPercent,
                  borderColor: CHART_TOKENS.red,
                  strokeDashArray: 4,
                  borderWidth: 1,
                  label: {
                    text: this.$t('view.productionInsight.delivery.seriesTarget'),
                    style: { color: CHART_TOKENS.red, background: 'transparent' }
                  }
                }
              ]
            }
          : {}
      }
    }
  },

  methods: {
    formatPercent(value) {
      if (value == null) return '—'
      return `${new Intl.NumberFormat('th-TH', { maximumFractionDigits: 1 }).format(value)}%`
    },

    bucketLabel(bucketEnd) {
      return bucketEnd ? new Intl.DateTimeFormat('th-TH', { day: '2-digit', month: '2-digit' }).format(new Date(bucketEnd)) : ''
    }
  }
}
</script>
