<!--
  materials-trend-chart — กราฟ "งานเข้าคัดพลอยรายเดือน + เวลาเข้า→เบิก" (reportRef: matTrend) ของหมวด
  "วัตถุดิบที่กระทบการผลิต" — แท่งจำนวนงานเข้า (entered) แกนซ้าย + เส้นค่ากลาง/P90 วันเข้า→เบิก แกนขวา (ค่า
  null = ยังไม่มีข้อมูลช่วงนั้น เว้นช่องว่างเสมอ) — แกน x ใช้ formatBucketMonthLabels (insight-helpers.js)

  Props:
    series  — Array (required) ของ Materials.series ({bucketEnd,entered,issueMedianDays|null,issueP90Days|null})
    loading — Boolean (false)
-->
<template>
  <ChartGeneric type="line" :series="chartSeries" :options="options" :height="320" :loading="loading" :emptyText="$t('common.label.noData')" />
</template>

<script>
import { CHART_TOKENS } from '@/services/utils/chart-colors.js'
import { formatBucketMonthLabels } from '@/components/insight/insight-helpers.js'

import ChartGeneric from '@/components/prime-vue/ChartGeneric.vue'

export default {
  name: 'MaterialsTrendChart',

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
        { name: this.$t('view.productionInsight.materials.seriesEntered'), type: 'bar', data: this.series.map((p) => p?.entered ?? null) },
        { name: this.$t('view.productionInsight.materials.seriesIssueMedian'), type: 'line', data: this.series.map((p) => p?.issueMedianDays ?? null) },
        { name: this.$t('view.productionInsight.materials.seriesIssueP90'), type: 'line', data: this.series.map((p) => p?.issueP90Days ?? null) }
      ]
    },

    options() {
      return {
        chart: { type: 'line', toolbar: { show: false } },
        colors: [CHART_TOKENS.primary, CHART_TOKENS.green, CHART_TOKENS.warning],
        stroke: { width: [0, 3, 2], curve: 'smooth', dashArray: [0, 0, 6] },
        plotOptions: { bar: { columnWidth: '45%' } },
        xaxis: { categories: formatBucketMonthLabels(this.series.map((p) => p?.bucketEnd)) },
        yaxis: [
          { seriesName: this.$t('view.productionInsight.materials.seriesEntered'), title: { text: this.$t('view.productionInsight.materials.plansUnit') }, labels: { formatter: (v) => this.formatCount(v) } },
          {
            seriesName: this.$t('view.productionInsight.materials.seriesIssueMedian'),
            opposite: true,
            title: { text: this.$t('view.productionInsight.materials.daysUnit') },
            labels: { formatter: (v) => this.formatDays(v) }
          },
          { seriesName: this.$t('view.productionInsight.materials.seriesIssueMedian'), opposite: true, show: false, labels: { formatter: (v) => this.formatDays(v) } }
        ],
        tooltip: {
          y: [{ formatter: (v) => this.formatCount(v) }, { formatter: (v) => this.formatDays(v) }, { formatter: (v) => this.formatDays(v) }]
        }
      }
    }
  },

  methods: {
    formatCount(value) {
      return value != null ? new Intl.NumberFormat('th-TH').format(value) : '—'
    },

    formatDays(value) {
      return value != null ? new Intl.NumberFormat('th-TH', { maximumFractionDigits: 1 }).format(value) : '—'
    }
  }
}
</script>
