<!--
  monthly-completed-chart — chart-src comment: extracted (verbatim) from
  src/views/report/executive/components/production-wip-view.vue monthlySeries/monthlyOptions —
  reused by src/views/production/insight/sections/overview-section.vue (Dashboard v2)
  no new calculation logic — buildMonthlyCompletedSeriesData still lives in executive-helpers.js
-->
<template>
  <div>
    <ChartGeneric
      type="bar"
      :series="series"
      :options="options"
      :height="320"
      :loading="loading"
      :emptyText="$t('common.label.noData')"
    />
    <p class="chart-note">
      <i class="bi bi-info-circle"></i>
      {{ $t('view.executive.production.currentMonthBadge') }}
    </p>
  </div>
</template>

<script>
import { CHART_TOKENS } from '@/services/utils/chart-colors.js'
import { formatMonthLabel, buildMonthlyCompletedSeriesData } from '@/views/report/executive/executive-helpers.js'

import ChartGeneric from '@/components/prime-vue/ChartGeneric.vue'

export default {
  name: 'MonthlyCompletedChart',

  components: {
    ChartGeneric
  },

  props: {
    monthlyCompleted: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    series() {
      const rows = this.monthlyCompleted || []
      const { completed, current } = buildMonthlyCompletedSeriesData(rows)
      return [
        { name: this.$t('view.executive.production.seriesCompleted'), data: completed },
        { name: this.$t('view.executive.production.seriesCurrentMonth'), data: current }
      ]
    },

    // แยกเดือนปิดงานเป็น 2 series แทนการใช้ plotOptions.bar.distributed + colors callback —
    // ApexCharts ไม่เรียก callback นั้นจริงและ cycle สี palette ปกติทุกแท่งแทน (ดู comment เดิมใน
    // executive-helpers.js) — colors[seriesIndex] แบบนี้รับประกันว่าทุกแท่ง "ปิดงาน" ได้สีเดียวกัน
    // (neutral) ส่วนแท่งเดือนปัจจุบันได้สีต่าง (warning) เสมอ
    options() {
      const rows = this.monthlyCompleted || []
      return {
        chart: { type: 'bar', stacked: true, toolbar: { show: false } },
        colors: [CHART_TOKENS.sub, CHART_TOKENS.warning],
        plotOptions: { bar: { borderRadius: 4, columnWidth: '55%' } },
        dataLabels: {
          enabled: true,
          formatter: (v) => (v === null || v === undefined ? '' : this.formatCount(v)),
          style: { fontSize: '11px', fontWeight: 600 }
        },
        xaxis: { categories: rows.map((r) => formatMonthLabel(r.month)) },
        yaxis: { labels: { formatter: (v) => this.formatCount(v) } },
        tooltip: { y: { formatter: (v) => this.formatCount(v) } }
      }
    }
  },

  methods: {
    formatCount(value) {
      return new Intl.NumberFormat('th-TH').format(value || 0)
    }
  }
}
</script>

<style lang="scss" scoped>
.chart-note {
  margin: var(--sp-sm) 0 0;
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}
</style>
