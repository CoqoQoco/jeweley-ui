<!--
  KpiBlock — กลุ่มการ์ด KPI (StatCardGeneric) ใน SectionCard แบบ dashboard (กันกรอบซ้อน) ตาม config:
    cards[{ id, icon, label, value(ctx), format, unit, sub(ctx,t), tone(ctx) 'main'|'warning'|'green'|'grey', reportRef }]
    variant:'summary' + items(ctx,t) → ตัวเลขสรุปแบบข้อความ (block bare) · gridColumns
    asOf(ctx) → เวลาประมวลผลมุมขวาบน (asOfLabel = key ที่มี {date}) · footNote → note บรรทัดใต้การ์ด (key หรือ fn)
  การ์ดที่มี reportRef กดแล้วเลื่อนไป DOM id insight-report-<reportRef>
-->
<template>
  <BlockFrame v-bind="frame" headerStyle="dashboard">
    <template v-if="asOfText" #header-actions>
      <span class="kpi-block__as-of">{{ asOfText }}</span>
    </template>

    <div v-if="node.variant === 'summary'" class="kpi-block__summary">
      <div v-for="item in summaryItems" :key="item.key" class="kpi-block__summary-item">
        <span class="kpi-block__summary-label">{{ item.label }}</span>
        <span class="kpi-block__summary-value">{{ item.value }}</span>
        <span v-if="item.sub" class="kpi-block__summary-sub">{{ item.sub }}</span>
      </div>
    </div>

    <div v-else class="kpi-block__grid" :style="gridStyle">
      <StatCardGeneric
        v-for="card in cards"
        :key="card.key"
        :icon="card.icon"
        :value="card.value"
        :label="card.label"
        :subLabel="card.sub"
        :variant="card.tone"
        :loading="loading"
        :clickable="!!card.reportRef"
        @click="goto(card.reportRef)"
      />
    </div>
    <p v-if="footNote" class="kpi-block__foot-note">{{ footNote }}</p>
  </BlockFrame>
</template>

<script>
import { buildKpiCards, buildKpiAsOf, buildKpiFootNote } from './kpi-block-helpers.js'
import blockMixin from './block-mixin.js'

import BlockFrame from './BlockFrame.vue'
import StatCardGeneric from '@/components/generic/StatCardGeneric.vue'

export default {
  name: 'KpiBlock',

  mixins: [blockMixin],

  components: { BlockFrame, StatCardGeneric },

  computed: {
    loading() {
      return !!this.ctx.loading?.[this.node.source]
    },

    cards() {
      return buildKpiCards(this.node, this.ctx, (key, params) => this.$t(key, params))
    },

    // variant 'summary' = ตัวเลขสรุปแบบข้อความ (ไม่ใช่ StatCard) ใน block bare — items(ctx,t) → [{ label, value, sub? }]
    summaryItems() {
      return (this.node.items ? this.node.items(this.ctx, (key, params) => this.$t(key, params)) : []).map((item, index) => ({ key: `i-${index}`, ...item }))
    },

    asOfText() {
      return buildKpiAsOf(this.node, this.ctx, (key, params) => this.$t(key, params))
    },

    // node.gridColumns (เช่น 3) = จำนวนคอลัมน์คงที่ (≤1024px เหลือ 2) แทน auto-fit
    gridStyle() {
      return this.node.gridColumns ? { '--kpi-columns': this.node.gridColumns } : null
    },

    footNote() {
      return buildKpiFootNote(this.node, this.ctx, (key, params) => this.$t(key, params))
    }
  },

  methods: {
    goto(reportRef) {
      if (!reportRef) return
      const el = document.getElementById(`insight-report-${reportRef}`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
}
</script>

<style lang="scss" scoped>
.kpi-block__summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--sp-md);

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.kpi-block__summary-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--sp-sm) var(--sp-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.kpi-block__summary-label {
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}

.kpi-block__summary-value {
  font-size: var(--fs-lg);
  font-weight: 700;
  color: var(--base-font-color);
}

.kpi-block__summary-sub {
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}

.kpi-block__as-of {
  font-size: var(--fs-sm);
  font-weight: 400;
  color: var(--base-sub-color);
}

.kpi-block__foot-note {
  margin: var(--sp-md) 0 0;
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
  font-style: italic;
}

.kpi-block__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  align-items: stretch;
  gap: var(--sp-md);

  &[style*='--kpi-columns'] {
    grid-template-columns: repeat(var(--kpi-columns), minmax(0, 1fr));

    @media (max-width: 1024px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
}
</style>
