<!--
  DetailBlock — กล่องรายละเอียดของแถวที่เลือกใน TableBlock/SparkCardsBlock (กราฟของแผนกที่เลือก) —
  node.selected(ctx) → แถวที่เลือก (null = ไม่แสดงกล่องเลย) · node.title(ctx,t,row) · node.trend = config ของ TrendBlock
  (points/series/... อ่านแถวที่เลือกผ่าน ctx.selected) — เป็นกล่อง legend แยกต่างหาก (ไม่ซ้อนในการ์ดตาราง)
-->
<template>
  <TrendBlock v-if="row" :node="trendNode" :ctx="detailCtx" />
</template>

<script>
import blockMixin from './block-mixin.js'
import TrendBlock from './TrendBlock.vue'

export default {
  name: 'DetailBlock',

  mixins: [blockMixin],

  components: { TrendBlock },

  computed: {
    row() {
      return this.node.selected ? this.node.selected(this.ctx) : null
    },

    // ctx.selected = แถวที่เลือก ให้ config ของ trend อ่านได้โดยไม่ต้องหาซ้ำ
    detailCtx() {
      return { ...this.ctx, selected: this.row }
    },

    trendNode() {
      return {
        ...this.node.trend,
        id: this.node.id,
        icon: this.node.icon,
        accent: this.node.accent,
        headerStyle: this.node.headerStyle,
        titleTip: this.node.titleTip,
        source: this.node.source,
        title: typeof this.node.title === 'function' ? (ctx, t) => this.node.title(this.detailCtx, t, this.row) : this.node.title
      }
    }
  }
}
</script>
