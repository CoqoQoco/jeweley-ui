<!--
  TrendBlock — กราฟแนวโน้ม (ChartGeneric) ใน BlockFrame ตาม config:
    points(ctx)            → array ของจุดข้อมูล
    categories(points,ctx,t) → ป้ายแกน x
    series = array หรือ function(ctx,points,t) → array · series[{ field|value|data, name|label, colorValue, type:'bar'|'line', axis:0|1, label, dashed, color, opacity, negate, nullAs, visible(points) }]
    chartType 'line'|'bar' (ชนิดกราฟหลัก) · toolbar{ hint, chip(ctx,t), actions[targetDrawer] } · yMax · stacked, yFormat 'count'|'days'|'percent' (series.format แยกต่อชุดได้), axisTitles[key0,key1], columnWidth, tooltipAbs, targetLine{value(ctx),label}, height
    hint(ctx,t) / summary(ctx,t) → ข้อความใต้กราฟ · null ในข้อมูล = ช่องว่างของกราฟเสมอ (ไม่ coerce เป็น 0 เว้น nullAs)
  ใช้ standalone หรือซ้อนใน DetailBlock
-->
<template>
  <BlockFrame v-bind="frame">
    <BlockToolbar v-if="node.toolbar" :toolbar="node.toolbar" :ctx="ctx" />
    <ChartGeneric :type="node.chartType || 'line'" :series="chartSeries" :options="chartOptions" :height="node.height || 320" :loading="loading" :emptyText="$t('common.label.noData')" />
    <p v-if="hintText" class="trend-block__hint">{{ hintText }}</p>
    <p v-if="summaryText" class="trend-block__summary">{{ summaryText }}</p>
  </BlockFrame>
</template>

<script>
import { buildTrendSeries, buildTrendOptions, resolveSeriesDefs } from './trend-block-helpers.js'
import blockMixin from './block-mixin.js'

import BlockFrame from './BlockFrame.vue'
import BlockToolbar from './BlockToolbar.vue'
import ChartGeneric from '@/components/prime-vue/ChartGeneric.vue'

export default {
  name: 'TrendBlock',

  mixins: [blockMixin],

  components: { BlockFrame, BlockToolbar, ChartGeneric },

  computed: {
    t() {
      return (key, params) => this.$t(key, params)
    },

    loading() {
      return !!this.ctx.loading?.[this.node.source]
    },

    points() {
      return this.node.points(this.ctx) || []
    },

    // series ที่ resolve แล้ว (array ตรงๆ หรือสร้างจากข้อมูลผ่าน function(ctx, points, t))
    resolvedNode() {
      return { ...this.node, series: resolveSeriesDefs(this.node, this.points, this.ctx, this.t) }
    },

    chartSeries() {
      return buildTrendSeries(this.resolvedNode.series, this.points, this.t)
    },

    chartOptions() {
      const categories = this.node.categories ? this.node.categories(this.points, this.ctx, this.t) : []
      return buildTrendOptions({ node: this.resolvedNode, points: this.points, categories, ctx: this.ctx, t: this.t })
    },

    hintText() {
      return this.node.hint ? this.node.hint(this.ctx, this.t) : ''
    },

    summaryText() {
      return this.node.summary ? this.node.summary(this.ctx, this.t) : ''
    }
  }
}
</script>

<style lang="scss" scoped>
.trend-block__hint {
  margin: var(--sp-sm) 0 0;
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
  font-style: italic;
}

.trend-block__summary {
  margin: var(--sp-md) 0 0;
  color: var(--base-sub-color);
  font-size: var(--fs-base);
}
</style>
