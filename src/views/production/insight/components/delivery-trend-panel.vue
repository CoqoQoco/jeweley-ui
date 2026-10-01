<!--
  delivery-trend-panel — orchestrator ของ reportRef: deliveryTrend (กล่อง "แนวโน้มส่งงานตรงเวลา" = กราฟ
  %ตรงเวลา + แผง "ตั้งเป้าส่งตรงเวลา", กล่อง "วางแผน vs ใช้จริง" = กราฟเวลาผลิต) ในหมวด "ส่งงานตรงเวลา" —
  รับ series/targetPercent/targetSource มาจาก Delivery response ที่ delivery-section.vue ยิงแล้ว (ไม่ยิง
  endpoint เอง) ต่างจาก wip-lead-time-panel.vue ตรงนี้

  targetSource:'draft' ถูกส่งมาจาก Delivery ทุกครั้งที่ parent ส่ง draftTargetPercent ไปด้วย (แม้ค่าจะเท่า
  ค่าที่บันทึกจริง) — ต้องเทียบ targetPercent กับ savedTarget.targetPercent เองถึงจะรู้ว่าควรโชว์ชิป "ร่าง"
  จริงๆ หรือไม่ (ดู shouldShowDeliveryDraftChip ใน delivery-helpers.js)

  Props:
    series               — Array (required) จาก Delivery.series
    targetPercent         — Number|null (null) — เป้าที่ใช้เทียบอยู่ตอนนี้ (draft หรือค่าที่บันทึกจริง)
    targetSource          — String ('saved') — 'saved'|'draft'
    savedTarget            — Object (required) — DeliveryTarget ที่บันทึกไว้จริง
    currentOnTimePercent — Number|null (null) — % ตรงเวลาจริงในช่วงที่เลือก (ข้อความอ้างอิงในแผงตั้งเป้า)
    rangeLabel            — String ('') — ช่วงเวลาที่เลือก
    loading                — Boolean (false)

  Emits: draft-target-change(percent|null), target-saved
-->
<template>
  <div id="insight-report-deliveryTrend" class="delivery-trend-panel">
    <SectionCardGeneric
      :title="$t('view.productionInsight.delivery.ontimeChartTitle')"
      :titleTip="$t('view.productionInsight.help.deliveryDefinitions')"
      icon="bi-graph-up-arrow"
      accent="main"
      headerStyle="legend"
    >
      <div class="delivery-trend-panel__toolbar">
        <p class="delivery-trend-panel__hint">
          {{ $t('view.productionInsight.delivery.trendHint') }}
          <span v-if="showDraftChip" class="delivery-trend-panel__draft-chip">{{ $t('view.productionInsight.delivery.targetDraftChip') }}</span>
        </p>
        <DeliveryTargetPanel :savedTarget="savedTarget" :currentOnTimePercent="currentOnTimePercent" @draft-change="onTargetDraftChange" @saved="onTargetSaved" />
      </div>
      <DeliveryOntimeChart :series="series" :targetPercent="targetPercent" :loading="loading" />
    </SectionCardGeneric>

    <SectionCardGeneric :title="$t('view.productionInsight.delivery.leadChartTitle')" icon="bi-bar-chart-line" accent="main" headerStyle="legend">
      <DeliveryLeadChart :series="series" :loading="loading" />
    </SectionCardGeneric>
  </div>
</template>

<script>
import { shouldShowDeliveryDraftChip } from './delivery-helpers.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import DeliveryOntimeChart from './delivery-ontime-chart.vue'
import DeliveryLeadChart from './delivery-lead-chart.vue'
import DeliveryTargetPanel from './delivery-target-panel.vue'

export default {
  name: 'DeliveryTrendPanel',

  components: {
    SectionCardGeneric,
    DeliveryOntimeChart,
    DeliveryLeadChart,
    DeliveryTargetPanel
  },

  props: {
    series: {
      type: Array,
      required: true
    },
    targetPercent: {
      type: Number,
      default: null
    },
    targetSource: {
      type: String,
      default: 'saved'
    },
    savedTarget: {
      type: Object,
      required: true
    },
    currentOnTimePercent: {
      type: Number,
      default: null
    },
    rangeLabel: {
      type: String,
      default: ''
    },
    loading: {
      type: Boolean,
      default: false
    }
  },

  emits: ['draft-target-change', 'target-saved'],

  computed: {
    showDraftChip() {
      return shouldShowDeliveryDraftChip(this.targetSource, this.targetPercent, this.savedTarget.targetPercent)
    }
  },

  methods: {
    onTargetDraftChange(percent) {
      this.$emit('draft-target-change', percent)
    },

    onTargetSaved() {
      this.$emit('target-saved')
    }
  }
}
</script>

<style lang="scss" scoped>
.delivery-trend-panel {
  scroll-margin-top: calc(var(--mainbar-height) + 64px);
  min-width: 0;
}

// legend-style SectionCardGeneric ต้องการ margin-top var(--sp-2xl) เสมอ (เผื่อชิป title คร่อมขอบบน) —
// container sibling-spacing ห้ามเล็กกว่านี้ ดู insight-tab-layout.vue comment + Decision Log
.delivery-trend-panel > * + * {
  margin-top: var(--sp-2xl);
}

.delivery-trend-panel__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-md);
  margin-bottom: var(--sp-md);
}

.delivery-trend-panel__hint {
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: var(--sp-xs);
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
  font-style: italic;
}

.delivery-trend-panel__draft-chip {
  display: inline-flex;
  align-items: center;
  padding: 1px var(--sp-xs);
  border-radius: var(--radius-sm);
  background: var(--base-warning);
  color: var(--base-font-color);
  font-size: 10px;
  font-weight: 700;
  font-style: normal;
}
</style>
