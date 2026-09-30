<!--
  department-flow-chart — กราฟ "งานเข้า-ออกแต่ละแผนก" (grouped horizontal bar: inflow vs outflow) ตามช่วง
  เวลาที่เลือก (RangePresetGeneric/filter panel — หัวข้อกล่องเป็นคนโชว์ label ช่วง ไม่ใช่ component นี้)
  สุทธิ (net) แสดงต่อท้ายชื่อแผนกในแกนหมวดหมู่ (ไม่ใช้ ApexCharts annotation ซับซ้อน) — สี CHART_PALETTE เท่านั้น
  ใช้ field inflow/outflow แบบทั่วไป (ไม่ผูกกับ 90 วันอีกต่อไป) — fallback ไปที่ inflow90d/outflow90d เดิม
  เผื่อ backend ยังไม่ deploy field ใหม่ (endpoint กำลังพัฒนาคู่ขนาน)
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
import { CHART_PALETTE } from '@/services/utils/chart-colors.js'

import ChartGeneric from '@/components/prime-vue/ChartGeneric.vue'

const MIN_HEIGHT = 260
const ROW_HEIGHT = 40

export default {
  name: 'DepartmentFlowChart',

  components: {
    ChartGeneric
  },

  props: {
    flow: {
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
      ;(this.flow || []).forEach((row) => {
        map[row.key] = this.$t(`view.executive.department.${row.key}`)
      })
      return map
    },

    chartHeight() {
      return Math.max(MIN_HEIGHT, (this.flow || []).length * ROW_HEIGHT + 80)
    },

    series() {
      const rows = this.flow || []
      return [
        { name: this.$t('view.productionInsight.wip.flowInflow'), data: rows.map((r) => this.inflowOf(r)) },
        { name: this.$t('view.productionInsight.wip.flowOutflow'), data: rows.map((r) => this.outflowOf(r)) }
      ]
    },

    options() {
      const rows = this.flow || []
      return {
        chart: { type: 'bar', toolbar: { show: false } },
        colors: [CHART_PALETTE[0], CHART_PALETTE[1]],
        plotOptions: { bar: { horizontal: true, borderRadius: 4, columnWidth: '60%' } },
        dataLabels: { enabled: true, style: { fontSize: '11px', fontWeight: 600 } },
        xaxis: {
          categories: rows.map((r) => this.buildCategoryLabel(r)),
          labels: { formatter: (v) => this.formatCount(v) }
        },
        tooltip: { y: { formatter: (v) => this.formatCount(v) } }
      }
    }
  },

  methods: {
    inflowOf(row) {
      return row.inflow ?? row.inflow90d ?? 0
    },

    outflowOf(row) {
      return row.outflow ?? row.outflow90d ?? 0
    },

    buildCategoryLabel(row) {
      const label = this.departmentLabelMap[row.key] || row.key
      const net = row.net ?? this.inflowOf(row) - this.outflowOf(row)
      const sign = net > 0 ? '+' : ''
      return `${label} (${this.$t('view.productionInsight.wip.flowNet')} ${sign}${this.formatCount(net)})`
    },

    formatCount(value) {
      return new Intl.NumberFormat('th-TH').format(value || 0)
    }
  }
}
</script>
