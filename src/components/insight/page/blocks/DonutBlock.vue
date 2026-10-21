<!--
  DonutBlock — โดนัทกลางของ InsightPage (BlockFrame + ChartGeneric) ตาม config:
    slices(ctx, t) → [{ label (i18n key), value, color ('token:green'|'palette:n'|ว่าง = palette ตามลำดับ) }]
    center { label (i18n key) } → แสดงยอดรวมกลางวง · valueFormat 'count'|'decimal'|'money0'|'percent' · height (px, default 280 — ห้าม %) · source (ชื่อ source ที่ใช้โชว์ loading)
  ค่าทุกชิ้นเป็น 0 / ไม่มีข้อมูล = empty state ของ ChartGeneric
-->
<template>
  <BlockFrame v-bind="frame">
    <ChartGeneric type="donut" :series="chart.series" :options="chart.options" :height="chart.height" :loading="loading" :emptyText="$t('common.label.noData')" />
  </BlockFrame>
</template>

<script>
import { buildDonutChart } from './donut-block-helpers.js'
import blockMixin from './block-mixin.js'

import BlockFrame from './BlockFrame.vue'
import ChartGeneric from '@/components/prime-vue/ChartGeneric.vue'

export default {
  name: 'DonutBlock',

  mixins: [blockMixin],

  components: { BlockFrame, ChartGeneric },

  computed: {
    loading() {
      return !!this.ctx.loading?.[this.node.source]
    },

    chart() {
      const t = (key, params) => this.$t(key, params)
      return buildDonutChart(this.node, this.node.slices(this.ctx, t) || [], t)
    }
  }
}
</script>
