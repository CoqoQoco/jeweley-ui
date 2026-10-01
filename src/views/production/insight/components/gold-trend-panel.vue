<!--
  gold-trend-panel — orchestrator ของ reportRef: goldTrend (กราฟ "แนวโน้มทองและ Loss" + ปุ่มตั้งเป้า + ตัว
  เลือกประเภทช่าง) ในหมวด "ทองและ Loss" — รับ series/targets มาจาก Gold response ที่ gold-section.vue ยิง
  แล้ว (ไม่ยิง endpoint เอง) เหมือน delivery-trend-panel.vue

  targets[].source:'draft' ถูกส่งมาจาก Gold ทุกครั้งที่ parent ส่ง draftTargets ไปด้วย (แม้ค่าจะเท่าค่าที่
  บันทึกจริง) — ต้องเทียบ targetPercent กับ savedTargets เองถึงจะรู้ว่าควรโชว์ชิป "ร่าง" จริงๆ หรือไม่ (ดู
  shouldShowGoldDraftChip ใน gold-helpers.js)

  Props:
    series           — Array (required) จาก Gold.series (ของโลหะที่กำลังดูอยู่ — กรองเฉพาะประเภทช่างที่เลือกเอง)
    targets          — Array (required) จาก Gold.targets (ของโลหะที่กำลังดูอยู่ ต่อประเภทช่าง — อาจเป็น draft)
    savedTargets     — Array (required) จาก GoldLossTargets (ค่าที่บันทึกไว้จริงครบทั้ง SLIP+STAGE ปนกัน —
                       ส่งต่อให้ GoldTargetPanel กรอง scope เอง)
    kpi              — Array (required) จาก Gold.kpi (ของโลหะที่กำลังดูอยู่ — ส่งต่อให้ GoldTargetPanel ทำ
                       ข้อความอ้างอิงกลุ่ม SLIP เฉพาะแถวโลหะที่ตรงกัน)
    stageDepartments — Array (required) จาก GoldByStage.departments (ของโลหะที่กำลังดูอยู่ — ส่งต่อให้
                       GoldTargetPanel ทำข้อความอ้างอิงกลุ่ม STAGE)
    metal            — String ('GOLD') — โลหะที่กำลังดูอยู่ตอนนี้
    rangeLabel       — String ('') — ช่วงเวลาที่เลือก
    loading          — Boolean (false)

  Emits: draft-target-change({slip,stage}), target-saved
-->
<template>
  <div id="insight-report-goldTrend" class="gold-trend-panel">
    <SectionCardGeneric
      :title="$t('view.productionInsight.gold.trendTitle')"
      :titleTip="$t('view.productionInsight.help.goldMoneySemantics', { metal: metalLabel })"
      icon="bi-graph-up-arrow"
      accent="main"
      headerStyle="legend"
    >
      <div class="gold-trend-panel__toolbar">
        <ToggleGroupGeneric v-model="selectedWorkerType" :options="workerTypeOptions" :ariaLabel="$t('view.productionInsight.gold.trendToggleAriaLabel')" />
        <div class="gold-trend-panel__toolbar-right">
          <p class="gold-trend-panel__hint">
            {{ $t('view.productionInsight.gold.trendHint') }}
            <span v-if="showDraftChip" class="gold-trend-panel__draft-chip">{{ $t('view.productionInsight.gold.targetDraftChip') }}</span>
          </p>
          <GoldTargetPanel
            :targets="savedTargets"
            :kpi="kpi"
            :stageDepartments="stageDepartments"
            :activeMetal="metal"
            @draft-change="onTargetDraftChange"
            @saved="onTargetSaved"
          />
        </div>
      </div>
      <GoldTrendChart :series="filteredSeries" :targetPercent="selectedTarget.targetPercent" :metal="metal" :loading="loading" />
    </SectionCardGeneric>
  </div>
</template>

<script>
import { shouldShowGoldDraftChip } from './gold-helpers.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ToggleGroupGeneric from '@/components/generic/ToggleGroupGeneric.vue'
import GoldTrendChart from './gold-trend-chart.vue'
import GoldTargetPanel from './gold-target-panel.vue'

export default {
  name: 'GoldTrendPanel',

  components: {
    SectionCardGeneric,
    ToggleGroupGeneric,
    GoldTrendChart,
    GoldTargetPanel
  },

  props: {
    series: {
      type: Array,
      required: true
    },
    targets: {
      type: Array,
      required: true
    },
    savedTargets: {
      type: Array,
      required: true
    },
    kpi: {
      type: Array,
      required: true
    },
    stageDepartments: {
      type: Array,
      required: true
    },
    metal: {
      type: String,
      default: 'GOLD'
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

  data() {
    return {
      selectedWorkerType: 80
    }
  },

  computed: {
    metalLabel() {
      return this.$t(`view.productionInsight.gold.metalLabel.${this.metal}`)
    },

    workerTypeOptions() {
      return [80, 50].map((workerType) => ({ value: workerType, label: this.$t(`view.productionInsight.gold.workerType.${workerType}`) }))
    },

    filteredSeries() {
      return this.series.filter((p) => p.workerType === this.selectedWorkerType)
    },

    selectedTarget() {
      return this.targets.find((t) => t.workerType === this.selectedWorkerType) || {}
    },

    showDraftChip() {
      return shouldShowGoldDraftChip(this.selectedWorkerType, this.metal, this.selectedTarget.targetPercent, this.selectedTarget.source, this.savedTargets)
    }
  },

  methods: {
    onTargetDraftChange(payload) {
      this.$emit('draft-target-change', payload)
    },

    onTargetSaved() {
      this.$emit('target-saved')
    }
  }
}
</script>

<style lang="scss" scoped>
.gold-trend-panel {
  scroll-margin-top: calc(var(--mainbar-height) + 64px);
  min-width: 0;
}

.gold-trend-panel__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--sp-md);
  margin-bottom: var(--sp-md);
}

.gold-trend-panel__toolbar-right {
  display: flex;
  align-items: center;
  gap: var(--sp-md);
}

.gold-trend-panel__hint {
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: var(--sp-xs);
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
  font-style: italic;
}

.gold-trend-panel__draft-chip {
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
