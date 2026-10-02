<!--
  workers-trend-chart — กราฟ "ค่าแรงรายเดือนแยกแผนก" (reportRef: wrkTrend) ของหมวด "ช่างและค่าแรง" — แท่งค่าแรง
  แยกแผนก (stacked, CHART_PALETTE) จาก series[] (รวมทุกแผนกปนกัน) + เส้นค่าแรงต่อใบงาน (wagePerPlan, แกนขวา)
  จาก seriesTotal[] — แผนกไม่ hardcode ตายตัว (collectWageDeptKeys จาก series เอง กันพังเมื่อแผนกเปลี่ยน) —
  แกน x ใช้ formatBucketMonthLabels (insight-helpers.js) ย่อป้ายเหลือแค่ชื่อเดือนไทยของ "จุดเริ่ม bucket"

  Props:
    series      — Array (required) ของ Workers.series ({bucketEnd,deptKey,wages})
    seriesTotal — Array (required) ของ Workers.seriesTotal ({bucketEnd,wages,output,wagePerPlan|null})
    loading     — Boolean (false)
-->
<template>
  <ChartGeneric type="line" :series="chartSeries" :options="options" :height="320" :loading="loading" :emptyText="$t('common.label.noData')" />
</template>

<script>
import { CHART_PALETTE, CHART_TOKENS } from '@/services/utils/chart-colors.js'
import { formatBucketMonthLabels } from '@/components/insight/insight-helpers.js'
import { collectWageBuckets, collectWageDeptKeys, alignWageSeriesToBuckets, mapWorkersSeriesTotalField } from './workers-helpers.js'

import ChartGeneric from '@/components/prime-vue/ChartGeneric.vue'

export default {
  name: 'WorkersTrendChart',

  components: {
    ChartGeneric
  },

  props: {
    series: {
      type: Array,
      required: true
    },
    seriesTotal: {
      type: Array,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    buckets() {
      return collectWageBuckets(this.series)
    },

    deptKeys() {
      return collectWageDeptKeys(this.series)
    },

    deptLabel() {
      const map = {}
      this.deptKeys.forEach((key) => {
        map[key] = this.$t(`view.executive.department.${key}`)
      })
      return map
    },

    chartSeries() {
      const bars = this.deptKeys.map((key) => ({
        name: this.deptLabel[key],
        type: 'bar',
        data: alignWageSeriesToBuckets(this.series, key, this.buckets)
      }))
      return [...bars, { name: this.$t('view.productionInsight.workers.seriesWagePerPlan'), type: 'line', data: mapWorkersSeriesTotalField(this.seriesTotal, 'wagePerPlan') }]
    },

    options() {
      return {
        chart: { type: 'line', stacked: true, toolbar: { show: false } },
        colors: [...CHART_PALETTE.slice(0, this.deptKeys.length), CHART_TOKENS.warning],
        stroke: { width: [...this.deptKeys.map(() => 0), 3], curve: 'smooth' },
        plotOptions: { bar: { columnWidth: '55%' } },
        xaxis: { categories: formatBucketMonthLabels(this.buckets) },
        yaxis: [
          { seriesName: this.deptLabel[this.deptKeys[0]], title: { text: this.$t('view.productionInsight.workers.wagesUnit') }, labels: { formatter: (v) => this.formatMoney(v) } },
          ...this.deptKeys.slice(1).map((key) => ({ seriesName: this.deptLabel[key], show: false, labels: { formatter: (v) => this.formatMoney(v) } })),
          {
            seriesName: this.$t('view.productionInsight.workers.seriesWagePerPlan'),
            opposite: true,
            title: { text: this.$t('view.productionInsight.workers.wagesUnit') },
            labels: { formatter: (v) => this.formatMoney(v) }
          }
        ],
        tooltip: { y: { formatter: (v) => this.formatMoney(v) } }
      }
    }
  },

  methods: {
    formatMoney(value) {
      if (value == null) return '—'
      return `฿${new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 }).format(value)}`
    }
  }
}
</script>
