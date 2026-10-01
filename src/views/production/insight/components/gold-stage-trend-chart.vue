<!--
  gold-stage-trend-chart — กราฟ "% ส่วนต่าง (จ่าย-รับ) รายเดือน ทุกแผนก" (reportRef: goldStage ส่วนที่ 3 —
  อยู่ใต้ตาราง+รายละเอียดใน gold-stage-department-panel.vue แต่เป็น SectionCard ของตัวเอง) — เส้นละแผนก
  (CHART_PALETTE) — แผนกที่ `includesScrap` (ไม่ hardcode ว่าคือแผนกไหน เช็คจาก flag ตรงๆ — ปัจจุบันคือ "แต่ง")
  ซ่อนไว้เป็นค่าเริ่มต้น (ยังกดเปิดที่ legend ได้) เพราะเศษ/ก้านที่ตัดส่งหลอมทำให้ % แกว่งแรงกว่าแผนกอื่นมาก
  บดบังแผนกอื่นในกราฟเดียวกัน — มี note อธิบายใต้กราฟ

  Props:
    departments — Array (required) จาก GoldByStage.departments (ใช้ทำชื่อเส้น + หาแผนกที่ includesScrap)
    series      — Array (required) จาก GoldByStage.series (รวมทุกแผนกปนกัน)
    loading     — Boolean (false)

  แกน x ใช้ formatBucketMonthLabels (insight-helpers.js) ย่อป้ายเหลือแค่ชื่อเดือนไทยของ "จุดเริ่ม bucket" (อิง bucketEnd ของจุดก่อนหน้า ไม่ใช่ลบ 1 วันจาก bucketEnd ของตัวเอง) — กันป้าย
  ซ้ำตอน bucket สุดท้ายไม่เต็มเดือน
-->
<template>
  <div class="gold-stage-trend-chart">
    <SectionCardGeneric :title="$t('view.productionInsight.gold.stageTrendTitle')" icon="bi-graph-up-arrow" accent="main" headerStyle="legend">
      <ChartGeneric type="line" :series="chartSeries" :options="options" :height="300" :loading="loading" :emptyText="$t('common.label.noData')" />
      <p class="gold-stage-trend-chart__hint">{{ $t('view.productionInsight.gold.stageTrendTrimHiddenNote') }}</p>
    </SectionCardGeneric>
  </div>
</template>

<script>
import { CHART_PALETTE } from '@/services/utils/chart-colors.js'
import { formatBucketMonthLabels } from '@/components/insight/insight-helpers.js'
import { collectStageBuckets, alignStageSeriesToBuckets } from './gold-stage-helpers.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ChartGeneric from '@/components/prime-vue/ChartGeneric.vue'

export default {
  name: 'GoldStageTrendChart',

  components: {
    SectionCardGeneric,
    ChartGeneric
  },

  props: {
    departments: {
      type: Array,
      required: true
    },
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
    buckets() {
      return collectStageBuckets(this.series)
    },

    deptLabel() {
      const map = {}
      this.departments.forEach((d) => {
        map[d.deptKey] = this.$t(`view.executive.department.${d.deptKey}`)
      })
      return map
    },

    // หาแผนกที่ซ่อนเป็นค่าเริ่มต้นจาก flag includesScrap ตรงๆ (ไม่ hardcode ชื่อ/รหัสแผนก) — ปัจจุบันคือ
    // "แต่ง" (trim) แต่โค้ดนี้ใช้ได้แม้ backend ย้าย flag ไปแผนกอื่นในอนาคต
    trimSeriesName() {
      const trimDept = this.departments.find((d) => d.includesScrap)
      return trimDept ? this.deptLabel[trimDept.deptKey] : null
    },

    chartSeries() {
      return this.departments.map((d) => ({
        name: this.deptLabel[d.deptKey],
        type: 'line',
        data: alignStageSeriesToBuckets(this.series, d.deptKey, this.buckets, 'diffPercent')
      }))
    },

    options() {
      return {
        chart: {
          type: 'line',
          toolbar: { show: false },
          // ซ่อนเส้นแผนกที่ includesScrap (ปัจจุบันคือ "แต่ง") เป็นค่าเริ่มต้น — ยังกดเปิดจาก legend ได้ปกติ ไม่ได้ลบ series ทิ้ง
          events: {
            mounted: (chartContext) => {
              if (this.trimSeriesName) chartContext.hideSeries(this.trimSeriesName)
            }
          }
        },
        colors: CHART_PALETTE.slice(0, this.departments.length),
        stroke: { width: 3, curve: 'smooth' },
        xaxis: { categories: formatBucketMonthLabels(this.buckets) },
        yaxis: { labels: { formatter: (v) => this.formatPercent(v) } },
        tooltip: { y: { formatter: (v) => this.formatPercent(v) } }
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

<style lang="scss" scoped>
.gold-stage-trend-chart {
  scroll-margin-top: calc(var(--mainbar-height) + 64px);
  min-width: 0;
}

.gold-stage-trend-chart__hint {
  margin: var(--sp-sm) 0 0;
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
  font-style: italic;
}
</style>
