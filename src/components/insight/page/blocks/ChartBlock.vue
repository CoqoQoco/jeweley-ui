<!--
  ChartBlock — กราฟแท่งแนวนอน (barH) / โดนัท (donut) ใน BlockFrame ห่อ ChartGeneric ตัวเดิม ตาม config:
    chartType 'barH'|'donut' · rows(ctx) → แถว · category(row,ctx,t) → ป้ายแกน · series[{ label, value(row) }]
    stacked · colors ['token:green'|'palette:1'] · bar{ barHeight|columnWidth } · rowHeight/minHeight/pad (barH) · height (donut)
-->
<template>
  <BlockFrame v-bind="frame">
    <ChartGeneric :type="chart.type" :series="chart.series" :options="chart.options" :height="chart.height" :loading="loading" :emptyText="$t('common.label.noData')" />
  </BlockFrame>
</template>

<script>
import { buildChart } from './chart-block-helpers.js'
import blockMixin from './block-mixin.js'

import BlockFrame from './BlockFrame.vue'
import ChartGeneric from '@/components/prime-vue/ChartGeneric.vue'

export default {
  name: 'ChartBlock',

  mixins: [blockMixin],

  components: { BlockFrame, ChartGeneric },

  computed: {
    loading() {
      return !!this.ctx.loading?.[this.node.source]
    },

    chart() {
      const rows = this.node.rows(this.ctx) || []
      const built = buildChart(this.node, rows, this.ctx, (key, params) => this.$t(key, params))
      return { ...built, type: this.node.chartType === 'donut' ? 'donut' : 'bar' }
    }
  }
}
</script>
