<!--
  gold-trend-chart — กราฟ "แนวโน้มทองและ Loss" ของประเภทช่างที่เลือก (reportRef: goldTrend) — แท่งทองเสียจริง
  vs ยอมให้ (กรัม, แกนซ้าย) + เส้น %Loss จริง/%ยอมให้ (แกนขวา) + เส้นระดับเป้า (annotation บนแกนขวา) — null
  ในแต่ละจุด = ยังไม่มีข้อมูลช่วงนั้น เว้นช่องว่างเสมอ (ไม่ coerce เป็น 0)

  Props:
    series        — Array (required) ของ Gold.series ที่กรองเฉพาะ workerType ที่เลือกแล้ว
    targetPercent — Number|null (null) — เป้า % Loss ของประเภทช่างที่เลือกอยู่ตอนนี้ (draft หรือบันทึกจริง)
    metal         — String ('GOLD') — 'GOLD'|'SILVER' — ใช้แทนชื่อโลหะในชื่อ series แท่งกรัม (seriesRawLoss/
                    seriesAllowedLoss มี {metal} param)
    loading       — Boolean (false)
-->
<template>
  <ChartGeneric type="line" :series="chartSeries" :options="options" :height="320" :loading="loading" :emptyText="$t('common.label.noData')" />
</template>

<script>
import { CHART_TOKENS } from '@/services/utils/chart-colors.js'
import { mapGoldSeriesField } from './gold-helpers.js'

import ChartGeneric from '@/components/prime-vue/ChartGeneric.vue'

export default {
  name: 'GoldTrendChart',

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
    metal: {
      type: String,
      default: 'GOLD'
    },
    loading: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    metalLabel() {
      return this.$t(`view.productionInsight.gold.metalLabel.${this.metal}`)
    },

    rawLossSeriesName() {
      return this.$t('view.productionInsight.gold.seriesRawLoss', { metal: this.metalLabel })
    },

    allowedLossSeriesName() {
      return this.$t('view.productionInsight.gold.seriesAllowedLoss', { metal: this.metalLabel })
    },

    lossPercentSeriesName() {
      return this.$t('view.productionInsight.gold.seriesLossPercent')
    },

    chartSeries() {
      return [
        { name: this.rawLossSeriesName, type: 'bar', data: mapGoldSeriesField(this.series, 'rawLossGram') },
        { name: this.allowedLossSeriesName, type: 'bar', data: mapGoldSeriesField(this.series, 'allowedGram') },
        { name: this.lossPercentSeriesName, type: 'line', data: mapGoldSeriesField(this.series, 'lossPercent') },
        { name: this.$t('view.productionInsight.gold.seriesAllowedPercent'), type: 'line', data: mapGoldSeriesField(this.series, 'allowedPercent') }
      ]
    },

    options() {
      const hasTarget = Number.isFinite(this.targetPercent)
      return {
        chart: { type: 'line', toolbar: { show: false } },
        colors: [CHART_TOKENS.primary, CHART_TOKENS.sub, CHART_TOKENS.red, CHART_TOKENS.green],
        stroke: { width: [0, 0, 3, 2], curve: 'smooth', dashArray: [0, 0, 0, 6] },
        plotOptions: { bar: { columnWidth: '45%' } },
        xaxis: { categories: this.series.map((p) => this.bucketLabel(p.bucketEnd)) },
        yaxis: [
          { seriesName: this.rawLossSeriesName, title: { text: this.$t('view.productionInsight.gold.gramUnit') }, labels: { formatter: (v) => this.formatGram(v) } },
          { seriesName: this.rawLossSeriesName, show: false, labels: { formatter: (v) => this.formatGram(v) } },
          {
            seriesName: this.lossPercentSeriesName,
            opposite: true,
            title: { text: '%' },
            labels: { formatter: (v) => this.formatPercent(v) }
          },
          { seriesName: this.lossPercentSeriesName, opposite: true, show: false, labels: { formatter: (v) => this.formatPercent(v) } }
        ],
        tooltip: {
          y: [
            { formatter: (v) => this.formatGram(v) },
            { formatter: (v) => this.formatGram(v) },
            { formatter: (v) => this.formatPercent(v) },
            { formatter: (v) => this.formatPercent(v) }
          ]
        },
        annotations: hasTarget
          ? {
              yaxis: [
                {
                  yAxisIndex: 2,
                  y: this.targetPercent,
                  borderColor: CHART_TOKENS.warning,
                  strokeDashArray: 4,
                  borderWidth: 1,
                  label: {
                    text: this.$t('view.productionInsight.gold.seriesTarget'),
                    style: { color: CHART_TOKENS.warning, background: 'transparent' }
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
      return `${new Intl.NumberFormat('th-TH', { maximumFractionDigits: 2 }).format(value)}%`
    },

    formatGram(value) {
      if (value == null) return '—'
      return new Intl.NumberFormat('th-TH', { maximumFractionDigits: 2 }).format(value)
    },

    bucketLabel(bucketEnd) {
      return bucketEnd ? new Intl.DateTimeFormat('th-TH', { day: '2-digit', month: '2-digit' }).format(new Date(bucketEnd)) : ''
    }
  }
}
</script>
