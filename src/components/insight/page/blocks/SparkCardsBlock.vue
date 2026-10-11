<!--
  SparkCardsBlock — grid การ์ด sparkline ที่กดเลือกได้ (ใช้การ์ดเดิม WipTrendCard) ตาม config:
    items(ctx,t) → [{ key, label, startWip, endWip, delta, deltaPercent, series }] · selectedState → ชื่อ state ที่เก็บ key ที่เลือก
    bucket(ctx) · rangeStart(ctx) → ส่งให้การ์ดเติมจุดต้นช่วง · กดการ์ด = ctx.setState(selectedState, key)
-->
<template>
  <BlockFrame v-bind="frame">
    <div class="spark-cards__grid">
      <WipTrendCard
        v-for="card in cards"
        :key="card.key"
        :card="card"
        :selected="isSelected(card)"
        :bucket="node.bucket(ctx)"
        :rangeStart="node.rangeStart(ctx)"
        @select="ctx.setState(node.selectedState, card.key)"
      />
    </div>
  </BlockFrame>
</template>

<script>
import { buildSparkCards, isCardSelected } from './spark-cards-helpers.js'
import blockMixin from './block-mixin.js'

import BlockFrame from './BlockFrame.vue'
import WipTrendCard from '@/components/insight/trend-spark-card.vue'

export default {
  name: 'SparkCardsBlock',

  mixins: [blockMixin],

  components: { BlockFrame, WipTrendCard },

  computed: {
    cards() {
      return buildSparkCards(this.node, this.ctx, (key, params) => this.$t(key, params))
    }
  },

  methods: {
    isSelected(card) {
      return isCardSelected(this.node, this.ctx, card)
    }
  }
}
</script>

<style lang="scss" scoped>
.spark-cards__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  align-items: stretch;
  gap: var(--sp-md);

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
