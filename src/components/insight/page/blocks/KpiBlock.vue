<!--
  KpiBlock — กลุ่มการ์ด KPI (StatCardGeneric) ใน SectionCard แบบ dashboard (กันกรอบซ้อน) ตาม config:
    cards[{ id, icon, label, value(ctx), format, unit, sub(ctx,t), tone(ctx) 'main'|'warning'|'green'|'grey', reportRef }]
    asOf(ctx) → เวลาประมวลผลมุมขวาบน (asOfLabel = key ที่มี {date}) · footNote → note บรรทัดใต้การ์ด (key หรือ fn)
  การ์ดที่มี reportRef กดแล้วเลื่อนไป DOM id insight-report-<reportRef>
-->
<template>
  <BlockFrame v-bind="frame" headerStyle="dashboard">
    <template v-if="asOfText" #header-actions>
      <span class="kpi-block__as-of">{{ asOfText }}</span>
    </template>

    <div class="kpi-block__grid">
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

    asOfText() {
      return buildKpiAsOf(this.node, this.ctx, (key, params) => this.$t(key, params))
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
  gap: var(--sp-md);
}
</style>
