<!--
  gold-stage-detail-chart — กราฟรายละเอียด "% ส่วนต่าง (จ่าย-รับ) รายเดือน" ของแผนกที่เลือก (ส่วนที่ 2 ของ
  reportRef: goldStage) — เส้น % + เส้นระดับเป้า (annotation) — แผนกที่แสดงมาจากการคลิกแถวในตาราง
  (gold-stage-table.vue)

  Props:
    series        — Array (required) ของ GoldByStage.series ที่กรองเฉพาะแผนกที่เลือกแล้ว (point มี
                    {bucketEnd,diffPercent,returnedSendGram})
    targetPercent — Number|null (null) — เป้า % ของแผนกที่เลือกอยู่ตอนนี้ (draft หรือบันทึกจริง)
    loading       — Boolean (false)

  แกน x ใช้ formatBucketMonthLabels (insight-helpers.js) ย่อป้ายเหลือแค่ชื่อเดือนไทยของ "จุดเริ่ม bucket" (อิง bucketEnd ของจุดก่อนหน้า ไม่ใช่ลบ 1 วันจาก bucketEnd ของตัวเอง) — กันป้าย
  ซ้ำตอน bucket สุดท้ายไม่เต็มเดือน
-->
<template>
  <ChartGeneric type="line" :series="chartSeries" :options="options" :height="260" :loading="loading" :emptyText="$t('common.label.noData')" />
</template>

<script>
import { CHART_TOKENS } from '@/services/utils/chart-colors.js'
import { formatBucketMonthLabels } from '@/components/insight/insight-helpers.js'
import { mapGoldStageSeriesField } from './gold-stage-helpers.js'

import ChartGeneric from '@/components/prime-vue/ChartGeneric.vue'

export default {
  name: 'GoldStageDetailChart',

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
      return [{ name: this.$t('view.productionInsight.gold.stageSeriesDiffPercent'), type: 'line', data: mapGoldStageSeriesField(this.series, 'diffPercent') }]
    },

    options() {
      const hasTarget = Number.isFinite(this.targetPercent)
      return {
        chart: { type: 'line', toolbar: { show: false } },
        colors: [CHART_TOKENS.primary],
        stroke: { width: 3, curve: 'smooth' },
        xaxis: { categories: formatBucketMonthLabels(this.series.map((p) => p.bucketEnd)) },
        yaxis: { labels: { formatter: (v) => this.formatPercent(v) } },
        tooltip: { y: { formatter: (v) => this.formatPercent(v) } },
        annotations: hasTarget
          ? {
              yaxis: [
                {
                  y: this.targetPercent,
                  borderColor: CHART_TOKENS.warning,
                  strokeDashArray: 4,
                  borderWidth: 1,
                  label: {
                    text: this.$t('view.productionInsight.gold.stageSeriesTarget'),
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
    }
  }
}
</script>
