<!--
  wip-lead-time-chart — กราฟ "แนวโน้ม lead time แผนก {name}" (ส่วนที่ 2 ของ reportRef: leadTime) —
  เส้นค่ากลาง (ทึบ) + P90 (ประ) + เส้นระดับมาตรฐาน (annotation) + แท่ง stacked รอ/ทำ ต่อช่วง — แผนกที่แสดง
  มาจากการคลิกแถวในตาราง (wip-lead-time-table.vue), default = แผนกที่เกินมาตรฐานมากที่สุด

  Props:
    selectedRow — Object (required) ของ StageLeadTime departments[] item ที่เลือกอยู่
    rangeLabel  — String ('') — ช่วงเวลาที่เลือก ต่อท้ายหัวข้อกราฟ
    loading     — Boolean (false)
-->
<template>
  <div class="wip-lead-time-chart">
    <ChartGeneric type="line" :series="series" :options="options" :height="320" :loading="loading" :emptyText="$t('common.label.noData')" />
    <p v-if="!hasWaitWorkData" class="wip-lead-time-chart__hint">{{ $t('view.productionInsight.wip.leadTimeChartNoWaitWorkHint') }}</p>
  </div>
</template>

<script>
import { CHART_TOKENS } from '@/services/utils/chart-colors.js'
import { mapSeriesField, hasAnySeriesValue } from './wip-lead-time-helpers.js'

import ChartGeneric from '@/components/prime-vue/ChartGeneric.vue'

export default {
  name: 'WipLeadTimeChart',

  components: {
    ChartGeneric
  },

  props: {
    selectedRow: {
      type: Object,
      required: true
    },
    rangeLabel: {
      type: String,
      default: ''
    },
    loading: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    points() {
      return this.selectedRow.series || []
    },

    // ไม่มีจุดไหนในช่วงที่เลือกมีข้อมูลแยกรอ/ทำเลยสักจุด (ทุกจุด null) — ซ่อน 2 series รอ/ทำ + legend ทิ้งไป
    // เลยแทนที่จะโชว์กราฟว่างเปล่าตลอดแนว (ยังคงเส้นค่ากลาง/P90 ไว้ตามปกติ)
    hasWaitWorkData() {
      return hasAnySeriesValue(this.points, 'medianWait') || hasAnySeriesValue(this.points, 'medianWork')
    },

    // เก็บ null (count==0 ในช่วงนั้น ไม่ใช่ 0 จริง) เป็นช่องว่างของกราฟเสมอ — mapSeriesField ไม่ coerce เป็น 0
    series() {
      const base = [
        { name: this.$t('view.productionInsight.wip.leadTimeSeriesMedian'), type: 'line', data: mapSeriesField(this.points, 'medianTotal') },
        { name: this.$t('view.productionInsight.wip.leadTimeSeriesP90'), type: 'line', data: mapSeriesField(this.points, 'p90Total') }
      ]
      if (!this.hasWaitWorkData) return base
      return [
        ...base,
        { name: this.$t('view.productionInsight.wip.leadTimeSeriesWait'), type: 'bar', data: mapSeriesField(this.points, 'medianWait') },
        { name: this.$t('view.productionInsight.wip.leadTimeSeriesWork'), type: 'bar', data: mapSeriesField(this.points, 'medianWork') }
      ]
    },

    options() {
      const hasStandard = Number.isFinite(this.selectedRow.standardDays)
      // อาเรย์ตำแหน่งต้องยาวเท่าจำนวน series จริง (ApexCharts index ตามลำดับ series) — ตัดชุดรอ/ทำทิ้งเมื่อ
      // ไม่มีข้อมูลเลย (hasWaitWorkData=false) มิฉะนั้นสี/เส้นของค่ากลาง-P90 จะเพี้ยนไปรับ index ท้ายๆ แทน
      const colors = this.hasWaitWorkData
        ? [CHART_TOKENS.primary, CHART_TOKENS.sub, CHART_TOKENS.warning, CHART_TOKENS.green]
        : [CHART_TOKENS.primary, CHART_TOKENS.sub]
      const strokeWidth = this.hasWaitWorkData ? [3, 2, 0, 0] : [3, 2]
      const dashArray = this.hasWaitWorkData ? [0, 6, 0, 0] : [0, 6]
      const fillOpacity = this.hasWaitWorkData ? [1, 1, 0.85, 0.85] : [1, 1]
      return {
        chart: { type: 'line', stacked: true, toolbar: { show: false } },
        colors,
        stroke: { width: strokeWidth, curve: 'smooth', dashArray },
        plotOptions: { bar: { columnWidth: '55%' } },
        fill: { opacity: fillOpacity },
        xaxis: { categories: this.points.map((p) => this.bucketLabel(p.bucketEnd)) },
        yaxis: { labels: { formatter: (v) => this.formatDays(v) } },
        tooltip: { y: { formatter: (v) => this.formatDays(v) } },
        annotations: hasStandard
          ? {
              yaxis: [
                {
                  y: this.selectedRow.standardDays,
                  borderColor: CHART_TOKENS.red,
                  strokeDashArray: 4,
                  borderWidth: 1,
                  label: {
                    text: this.$t('view.productionInsight.wip.leadTimeSeriesStandard'),
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
    // null = ไม่มีข้อมูลในช่วงนั้น (count==0) ต่างจาก 0 จริงๆ — โชว์ '—' แทน '0' เวลา hover จุดที่เป็นช่องว่าง
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

<style lang="scss" scoped>
.wip-lead-time-chart__hint {
  margin: var(--sp-sm) 0 0;
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
  font-style: italic;
}
</style>
