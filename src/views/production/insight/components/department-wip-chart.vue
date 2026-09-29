<!--
  department-wip-chart — กราฟ "งานค้างแยกแผนก" (stacked horizontal bar)
  feed จาก report.departments ของ ProductionInsight/Wip — ใช้ใน src/views/production/insight/sections/wip-section.vue
  (Revision 2 per-topic tabs) — ไม่มี logic คำนวณพิเศษ นอกจาก series/options mapping ตรงๆ จาก props
-->
<template>
  <ChartGeneric
    type="bar"
    :series="series"
    :options="options"
    :height="chartHeight"
    :loading="loading"
    :emptyText="$t('common.label.noData')"
  />
</template>

<script>
import { CHART_TOKENS } from '@/services/utils/chart-colors.js'

import ChartGeneric from '@/components/prime-vue/ChartGeneric.vue'

const DEPARTMENT_KEYS = ['design', 'trim', 'rawPolish', 'gemSort', 'setting', 'plating', 'costCard']
const DEPARTMENT_BAR_MIN_HEIGHT = 240
const DEPARTMENT_BAR_ROW_HEIGHT = 44

export default {
  name: 'DepartmentWipChart',

  components: {
    ChartGeneric
  },

  props: {
    departments: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    departmentLabelMap() {
      const map = {}
      DEPARTMENT_KEYS.forEach((key) => {
        map[key] = this.$t(`view.executive.department.${key}`)
      })
      return map
    },

    chartHeight() {
      const rows = (this.departments || []).length
      return Math.max(DEPARTMENT_BAR_MIN_HEIGHT, rows * DEPARTMENT_BAR_ROW_HEIGHT + 60)
    },

    series() {
      const departments = this.departments || []
      return [
        { name: this.$t('view.executive.production.seriesMoved30d'), data: departments.map((d) => d.moved30d || 0) },
        { name: this.$t('view.executive.production.seriesMoved30to180d'), data: departments.map((d) => d.moved30to180d || 0) },
        { name: this.$t('view.executive.production.seriesStale180d'), data: departments.map((d) => d.stale180d || 0) }
      ]
    },

    options() {
      const departments = this.departments || []
      return {
        chart: { type: 'bar', stacked: true, toolbar: { show: false } },
        colors: [CHART_TOKENS.green, CHART_TOKENS.warning, CHART_TOKENS.red],
        plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: '65%' } },
        dataLabels: { enabled: true, style: { fontSize: '11px', fontWeight: 600 } },
        xaxis: {
          categories: departments.map((d) => this.departmentLabelMap[d.key] || d.key),
          labels: { formatter: (v) => this.formatCount(v) }
        },
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
