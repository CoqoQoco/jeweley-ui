<!--
  InsightBlockNode — ตัวเรนเดอร์ 1 node ของ config.blocks (เรียกตัวเองซ้ำสำหรับ row/group):
    { row: true, blocks: [...] }                 → วางเคียงข้างกัน 2 คอลัมน์ (container padding-top เผื่อ legend chip, ≤1024px เรียงลง)
    { group: true, id, blocks: [...], card? }    → กลุ่มที่มี anchor insight-report-<id> ของตัวเอง เรียงลงมา ห่าง 24px (card = กล่องเดียวครอบทั้งกลุ่ม)
    { type: 'slot', component, props, events }   → escape hatch: component อะไรก็ได้
    { type: 'kpi'|'trend'|'table'|'planTable'|'chart'|'detail'|'sparkCards', ... } → block มาตรฐาน (BLOCK_COMPONENTS)
  node.visible(ctx) = false → ไม่เรนเดอร์ · node.detail (ของ table) เรนเดอร์ต่อท้ายเป็น DetailBlock
  ทุก block ที่มี id ได้ DOM id insight-report-<id> (จาก BlockFrame / group)
-->
<template>
  <template v-if="visible">
    <div v-if="node.row" class="insight-node__row">
      <InsightBlockNode v-for="(child, index) in node.blocks" :key="keyOf(child, index)" :node="child" :ctx="ctx" />
    </div>

    <div v-else-if="node.group" :id="anchorId" class="insight-node__group">
      <!-- group.card = กล่องเดียวครอบหลาย block (block ลูกตั้ง bare: true) เรียงลงห่าง var(--sp-lg) -->
      <BlockFrame v-if="node.card" v-bind="cardProps">
        <div class="insight-node__card-body">
          <InsightBlockNode v-for="(child, index) in node.blocks" :key="keyOf(child, index)" :node="child" :ctx="ctx" />
        </div>
      </BlockFrame>
      <template v-else>
        <InsightBlockNode v-for="(child, index) in node.blocks" :key="keyOf(child, index)" :node="child" :ctx="ctx" />
      </template>
    </div>

    <component :is="node.component" v-else-if="node.type === 'slot'" v-bind="slotProps" v-on="slotListeners" />

    <template v-else-if="blockComponent">
      <component :is="blockComponent" :node="node" :ctx="ctx" />
      <DetailBlock v-if="node.detail" :node="node.detail" :ctx="ctx" />
    </template>
  </template>
</template>

<script>
import { BLOCK_COMPONENTS } from './blocks/index.js'
import { isNodeVisible, buildAnchorId, nodeKey, resolveFrameProps } from './insight-page-helpers.js'

import DetailBlock from './blocks/DetailBlock.vue'
import BlockFrame from './blocks/BlockFrame.vue'

export default {
  name: 'InsightBlockNode',

  components: { DetailBlock, BlockFrame },

  props: {
    node: { type: Object, required: true },
    ctx: { type: Object, required: true }
  },

  computed: {
    visible() {
      return isNodeVisible(this.node, this.ctx)
    },

    anchorId() {
      return buildAnchorId(this.node.id)
    },

    blockComponent() {
      return BLOCK_COMPONENTS[this.node.type] || null
    },

    cardProps() {
      return resolveFrameProps(this.node.card, this.ctx, (key, params) => this.$t(key, params))
    },

    slotProps() {
      const props = this.node.props
      return typeof props === 'function' ? props(this.ctx) : props || {}
    },

    slotListeners() {
      const events = this.node.events || {}
      return Object.fromEntries(Object.entries(events).map(([name, handler]) => [name, (...args) => handler(this.ctx, ...args)]))
    }
  },

  methods: {
    keyOf: nodeKey
  }
}
</script>

<style lang="scss" scoped>
// container ของ row เผื่อ clearance ของ legend chip ที่ระดับ container แทน margin-top ของ .section-card--legend เอง
// ให้ทุกกล่องในแถวเริ่ม y เดียวกันเป๊ะ (pattern เดียวกับ insight-tab-layout__row--split) · 24px = var(--sp-2xl)
.insight-node__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: stretch;
  gap: var(--sp-md);
  padding-top: var(--sp-2xl);

  > * {
    min-width: 0;
  }

  :deep(.section-card) {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  :deep(.section-card--legend) {
    margin-top: 0 !important;
  }

  :deep(.chart-generic-wrap) {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    padding-top: 0;

    :deep(.section-card) {
      height: auto;
    }

    :deep(.section-card--legend) {
      margin-top: var(--sp-2xl) !important;
    }
  }
}

// legend-style SectionCardGeneric ต้องการ margin-top var(--sp-2xl) เสมอ — sibling-spacing ห้ามเล็กกว่านี้
.insight-node__card-body > * + * {
  margin-top: var(--sp-lg);
}

.insight-node__group {
  min-width: 0;
  scroll-margin-top: calc(var(--mainbar-height) + 64px);

  > * + * {
    margin-top: var(--sp-2xl);
  }
}
</style>
