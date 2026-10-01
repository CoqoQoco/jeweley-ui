<!--
  capacity-trend-chart — กราฟ "งานเข้า vs ผลิตเสร็จ vs ปิดสำเร็จ" รายเดือน (reportRef: capTrend) ของหมวด
  "กำลังการผลิต" — แท่ง 3 ชุด (งานเข้า/ผลิตเสร็จ/ปิดสำเร็จ, แกนซ้าย) + เส้นงานค้างปลายงวด (activeWipEnd,
  แกนขวา, null = ยังไม่มีข้อมูลช่วงนั้น เว้นช่องว่างเสมอ) — unit='piece' สลับเฉพาะแท่ง "งานเข้า" เป็นหน่วยชิ้น
  (series.inflowPieces) ส่วนผลิตเสร็จ/ปิดสำเร็จ/งานค้างยังนับเป็นใบเสมอ (ไม่มีหน่วยชิ้นให้จากฝั่ง API) — โชว์
  hint อธิบายใต้กราฟเมื่อ unit='piece'

  mapping คำ ↔ field (ยืนยันจาก API agent แล้ว — เดิมเข้าใจสลับกัน แก้แล้ว 2026-10-01): "ผลิตเสร็จ" = เข้าบัตร
  ต้นทุนครั้งแรก (งานช่างจบ) = field `output` (ตรงกับ KPI card "ผลิตเสร็จ/เดือน" ที่ใช้ kpi.outputPerMonth
  เหมือนกัน + ใช้คำนวณ netPerMonth = inflow − output ด้วย) — "ปิดสำเร็จ" = field `completed` (ขั้นถัดไปหลัง
  บัตรต้นทุน ใช้แค่ในกราฟนี้ ไม่มี KPI card ของตัวเอง)

  แกน x ใช้ formatBucketMonthLabels (insight-helpers.js) ย่อป้ายเหลือแค่ชื่อเดือนไทยของ "จุดเริ่ม bucket" (อิง bucketEnd ของจุดก่อนหน้า ไม่ใช่ลบ 1 วันจาก bucketEnd ของตัวเอง) — กันป้าย
  ซ้ำตอน bucket สุดท้ายไม่เต็มเดือน (เช่น "01/10 | 01/10")

  Props:
    series  — Array (required) ของ Capacity.series
    unit    — String ('plan') — 'plan'|'piece' คุมหน่วยของแท่ง "งานเข้า" เท่านั้น
    loading — Boolean (false)
-->
<template>
  <div class="capacity-trend-chart">
    <ChartGeneric type="line" :series="chartSeries" :options="options" :height="320" :loading="loading" :emptyText="$t('common.label.noData')" />
    <p v-if="unit === 'piece'" class="capacity-trend-chart__hint">{{ $t('view.productionInsight.capacity.trendPieceUnitHint') }}</p>
  </div>
</template>

<script>
import { CHART_TOKENS } from '@/services/utils/chart-colors.js'
import { formatBucketMonthLabels } from '@/components/insight/insight-helpers.js'
import { mapCapacitySeriesField, CAPACITY_PRODUCED_FIELD, CAPACITY_CLOSED_FIELD } from './capacity-helpers.js'

import ChartGeneric from '@/components/prime-vue/ChartGeneric.vue'

export default {
  name: 'CapacityTrendChart',

  components: {
    ChartGeneric
  },

  props: {
    series: {
      type: Array,
      required: true
    },
    unit: {
      type: String,
      default: 'plan'
    },
    loading: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    inflowField() {
      return this.unit === 'piece' ? 'inflowPieces' : 'inflow'
    },

    inflowSeriesName() {
      return this.unit === 'piece' ? this.$t('view.productionInsight.capacity.seriesInflowPieces') : this.$t('view.productionInsight.capacity.seriesInflow')
    },

    chartSeries() {
      return [
        { name: this.inflowSeriesName, type: 'bar', data: mapCapacitySeriesField(this.series, this.inflowField) },
        // seriesCompleted คือ label "ผลิตเสร็จ" แต่อ่านจาก field CAPACITY_PRODUCED_FIELD (='output', ดู mapping ด้านบน)
        { name: this.$t('view.productionInsight.capacity.seriesCompleted'), type: 'bar', data: mapCapacitySeriesField(this.series, CAPACITY_PRODUCED_FIELD) },
        // seriesOutput คือ label "ปิดสำเร็จ" แต่อ่านจาก field CAPACITY_CLOSED_FIELD (='completed', ดู mapping ด้านบน)
        { name: this.$t('view.productionInsight.capacity.seriesOutput'), type: 'bar', data: mapCapacitySeriesField(this.series, CAPACITY_CLOSED_FIELD) },
        { name: this.$t('view.productionInsight.capacity.seriesActiveWip'), type: 'line', data: mapCapacitySeriesField(this.series, 'activeWipEnd') }
      ]
    },

    options() {
      return {
        chart: { type: 'line', toolbar: { show: false } },
        colors: [CHART_TOKENS.primary, CHART_TOKENS.green, CHART_TOKENS.sub, CHART_TOKENS.warning],
        stroke: { width: [0, 0, 0, 3], curve: 'smooth' },
        plotOptions: { bar: { columnWidth: '55%' } },
        xaxis: { categories: formatBucketMonthLabels(this.series.map((p) => p.bucketEnd)) },
        yaxis: [
          { seriesName: this.inflowSeriesName, title: { text: this.$t('view.productionInsight.capacity.planUnit') }, labels: { formatter: (v) => this.formatCount(v) } },
          { seriesName: this.inflowSeriesName, show: false, labels: { formatter: (v) => this.formatCount(v) } },
          { seriesName: this.inflowSeriesName, show: false, labels: { formatter: (v) => this.formatCount(v) } },
          {
            seriesName: this.$t('view.productionInsight.capacity.seriesActiveWip'),
            opposite: true,
            title: { text: this.$t('view.productionInsight.capacity.planUnit') },
            labels: { formatter: (v) => this.formatCount(v) }
          }
        ],
        tooltip: {
          y: [
            { formatter: (v) => this.formatCount(v) },
            { formatter: (v) => this.formatCount(v) },
            { formatter: (v) => this.formatCount(v) },
            { formatter: (v) => this.formatCount(v) }
          ]
        }
      }
    }
  },

  methods: {
    formatCount(value) {
      if (value == null) return '—'
      return new Intl.NumberFormat('th-TH').format(value)
    }
  }
}
</script>

<style lang="scss" scoped>
.capacity-trend-chart__hint {
  margin: var(--sp-sm) 0 0;
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
  font-style: italic;
}
</style>
