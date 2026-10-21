<!--
  BarBlock — กราฟแท่งกลางของ InsightPage (BlockFrame + ChartGeneric) ตาม config:
    rows(ctx) → แถว · category(row, ctx, t) → ป้ายแกนหมวด · series[{ label (i18n key), value(row, ctx), color }]
    stacked (ซ้อน) · horizontal (แนวนอน — ความสูงโตตาม rowHeight/minHeight/pad) · height (px) · valueFormat · dataLabels (true = โชว์ตัวเลขบนแท่ง) · bar{ ...plotOptions.bar } · source
  ไม่มีข้อมูล = empty state ของ ChartGeneric
-->
<template>
  <BlockFrame v-bind="frame">
    <ChartGeneric type="bar" :series="chart.series" :options="chart.options" :height="chart.height" :loading="loading" :emptyText="$t('common.label.noData')" />
  </BlockFrame>
</template>

<script>
import { buildBarChart } from './bar-block-helpers.js'
import blockMixin from './block-mixin.js'

import BlockFrame from './BlockFrame.vue'
import ChartGeneric from '@/components/prime-vue/ChartGeneric.vue'

export default {
  name: 'BarBlock',

  mixins: [blockMixin],

  components: { BlockFrame, ChartGeneric },

  computed: {
    loading() {
      return !!this.ctx.loading?.[this.node.source]
    },

    chart() {
      const t = (key, params) => this.$t(key, params)
      return buildBarChart(this.node, this.node.rows(this.ctx) || [], this.ctx, t)
    }
  }
}
</script>
