<!--
  capacity-department-chart — กราฟรายละเอียด "ใบออก vs จำนวนช่าง" รายเดือนของแผนกที่เลือก (ส่วนที่ 2 ของ
  reportRef: capDepartments) — แผนกที่แสดงมาจากการคลิกแถวในตาราง (capacity-department-table.vue)

  departments[] item มี 2 series แยก array กัน (ยืนยันจาก API agent): `workersSeries[{bucketEnd,workers}]`
  และ `exitsSeries[{bucketEnd,exits}]` — ใช้ `workersSeries` เป็น canonical buckets ของแกน x แล้ว
  `alignSeriesByBucket` จับคู่ค่า exits จาก `exitsSeries` เข้ากับ bucketEnd เดียวกัน (bucket ที่หาคู่ไม่เจอ
  เป็นช่องว่าง ไม่ coerce เป็น 0)

  แกน x ใช้ formatBucketMonthLabels (insight-helpers.js) ย่อป้ายเหลือแค่ชื่อเดือนไทยของ "จุดเริ่ม bucket" (อิง bucketEnd ของจุดก่อนหน้า ไม่ใช่ลบ 1 วันจาก bucketEnd ของตัวเอง) — กันป้าย
  ซ้ำตอน bucket สุดท้ายไม่เต็มเดือน

  Props:
    selectedRow — Object (required) ของ Capacity.departments[] item ที่เลือกอยู่
    rangeLabel  — String ('') — ช่วงเวลาที่เลือก ต่อท้ายหัวข้อกราฟ
    loading     — Boolean (false)
-->
<template>
  <div class="capacity-department-chart">
    <ChartGeneric type="line" :series="series" :options="options" :height="280" :loading="loading" :emptyText="$t('common.label.noData')" />
  </div>
</template>

<script>
import { CHART_TOKENS } from '@/services/utils/chart-colors.js'
import { formatBucketMonthLabels } from '@/components/insight/insight-helpers.js'
import { mapCapacitySeriesField, alignSeriesByBucket } from './capacity-helpers.js'

import ChartGeneric from '@/components/prime-vue/ChartGeneric.vue'

export default {
  name: 'CapacityDepartmentChart',

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
      return this.selectedRow.workersSeries || []
    },

    series() {
      return [
        { name: this.$t('view.productionInsight.capacity.seriesExits'), type: 'bar', data: alignSeriesByBucket(this.points, this.selectedRow.exitsSeries, 'exits') },
        { name: this.$t('view.productionInsight.capacity.seriesWorkers'), type: 'line', data: mapCapacitySeriesField(this.points, 'workers') }
      ]
    },

    options() {
      return {
        chart: { type: 'line', toolbar: { show: false } },
        colors: [CHART_TOKENS.primary, CHART_TOKENS.warning],
        stroke: { width: [0, 3], curve: 'smooth' },
        plotOptions: { bar: { columnWidth: '45%' } },
        xaxis: { categories: formatBucketMonthLabels(this.points.map((p) => p.bucketEnd)) },
        yaxis: [
          { seriesName: this.$t('view.productionInsight.capacity.seriesExits'), title: { text: this.$t('view.productionInsight.capacity.planUnit') }, labels: { formatter: (v) => this.formatCount(v) } },
          {
            seriesName: this.$t('view.productionInsight.capacity.seriesWorkers'),
            opposite: true,
            title: { text: this.$t('view.productionInsight.capacity.workersUnit') },
            labels: { formatter: (v) => this.formatCount(v) }
          }
        ],
        tooltip: { y: [{ formatter: (v) => this.formatCount(v) }, { formatter: (v) => this.formatCount(v) }] }
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
