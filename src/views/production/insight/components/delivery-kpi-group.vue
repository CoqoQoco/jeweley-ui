<!--
  delivery-kpi-group — กลุ่ม KPI 6 ช่องของหมวด "ส่งงานตรงเวลา" (ProductionInsight/Delivery.kpi) —
  SectionCardGeneric headerStyle="dashboard" ครอบ StatCardGeneric (กันกรอบซ้อน 2 ชั้น — StatCardGeneric มี
  กรอบของตัวเองอยู่แล้ว) การ์ดกดได้ทุกใบ เลื่อนไปยังส่วนรายงานที่เกี่ยวข้อง

  Props:
    kpi           — Object (required) จาก Delivery.kpi
    targetPercent — Number|null (null) — เป้า % ตรงเวลาที่ใช้เทียบอยู่ตอนนี้ (Delivery.targetPercent)
    asOf          — String|null (null) — เวลาประมวลผลข้อมูลล่าสุด (Delivery.asOf) — โชว์มุมขวาบนของกล่อง KPI
    loading       — Boolean (false)

  Emits: goto-report(reportRef)
-->
<template>
  <SectionCardGeneric :title="$t('view.productionInsight.delivery.kpiGroupTitle')" icon="bi-truck" accent="main" headerStyle="dashboard">
    <template v-if="asOf" #header-actions>
      <span class="delivery-kpi-group__as-of">{{ $t('view.executive.asOf', { date: formatDateTime(asOf) }) }}</span>
    </template>

    <div class="kpi-grid">
      <div class="kpi-card">
        <StatCardGeneric
          icon="bi-percent"
          :value="formatPercent(kpi.onTimePercent)"
          :label="$t('view.productionInsight.delivery.kpiOnTimePercent')"
          :subLabel="onTimeSubLabel"
          :variant="onTimeVariant"
          :loading="loading"
          clickable
          @click="$emit('goto-report', 'deliveryTrend')"
        />
      </div>
      <div class="kpi-card">
        <StatCardGeneric
          icon="bi-hourglass-split"
          :value="formatDays(kpi.lateMedianDays)"
          :label="$t('view.productionInsight.delivery.kpiLateMedianDays')"
          variant="warning"
          :loading="loading"
          clickable
          @click="$emit('goto-report', 'latePlans')"
        />
      </div>
      <div class="kpi-card">
        <StatCardGeneric
          icon="bi-signpost-split"
          :value="formatDays(kpi.actualLeadMedianDays)"
          :label="$t('view.productionInsight.delivery.kpiLeadCompare')"
          :subLabel="leadCompareSubLabel"
          variant="main"
          :loading="loading"
          clickable
          @click="$emit('goto-report', 'deliveryTrend')"
        />
      </div>
      <div class="kpi-card">
        <StatCardGeneric
          icon="bi-exclamation-circle"
          :value="formatCount(kpi.openOverdueActiveCount)"
          :label="$t('view.productionInsight.delivery.kpiOpenOverdue')"
          :subLabel="openOverdueSubLabel"
          variant="warning"
          :loading="loading"
          clickable
          @click="$emit('goto-report', 'atRisk')"
        />
      </div>
      <div class="kpi-card">
        <StatCardGeneric
          icon="bi-exclamation-triangle"
          :value="formatCount(kpi.atRiskCount)"
          :label="$t('view.productionInsight.delivery.kpiAtRisk')"
          variant="warning"
          :loading="loading"
          clickable
          @click="$emit('goto-report', 'atRisk')"
        />
      </div>
      <div class="kpi-card">
        <StatCardGeneric
          icon="bi-clipboard-x"
          :value="formatCount(kpi.stuckAfterCostCardCount)"
          :label="$t('view.productionInsight.delivery.kpiStuckCostCard')"
          variant="warning"
          :loading="loading"
          clickable
          @click="$emit('goto-report', 'stuckCostCard')"
        />
      </div>
    </div>
  </SectionCardGeneric>
</template>

<script>
import { resolveOnTimeStatVariant } from './delivery-helpers.js'
import { formatDateTime } from '@/services/utils/dayjs.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import StatCardGeneric from '@/components/generic/StatCardGeneric.vue'

export default {
  name: 'DeliveryKpiGroup',

  components: {
    SectionCardGeneric,
    StatCardGeneric
  },

  props: {
    kpi: {
      type: Object,
      required: true
    },
    targetPercent: {
      type: Number,
      default: null
    },
    asOf: {
      type: String,
      default: null
    },
    loading: {
      type: Boolean,
      default: false
    }
  },

  emits: ['goto-report'],

  computed: {
    onTimeVariant() {
      return resolveOnTimeStatVariant(this.kpi.onTimePercent, this.targetPercent)
    },

    onTimeSubLabel() {
      const completed = this.formatCount(this.kpi.completedCount)
      const onTime = this.formatCount(this.kpi.onTimeCount)
      if (this.targetPercent == null) return this.$t('view.productionInsight.delivery.kpiOnTimeSubNoTarget', { completed, onTime })
      return this.$t('view.productionInsight.delivery.kpiOnTimeSubTarget', { target: this.formatPercent(this.targetPercent, false), completed, onTime })
    },

    leadCompareSubLabel() {
      return this.$t('view.productionInsight.delivery.kpiLeadCompareSub', {
        planned: this.formatDays(this.kpi.plannedLeadMedianDays, false),
        suggested: this.formatDays(this.kpi.suggestedLeadDays, false)
      })
    },

    openOverdueSubLabel() {
      return this.$t('view.productionInsight.delivery.kpiOpenOverdueSub', {
        all: this.formatCount(this.kpi.openOverdueCount),
        open: this.formatCount(this.kpi.openCount)
      })
    }
  },

  methods: {
    formatDateTime,

    formatCount(value) {
      return value != null ? new Intl.NumberFormat('th-TH').format(value) : '—'
    },

    // withUnit=false ใช้ตอนฝังในประโยค i18n ที่มี "%" ต่อท้ายให้อยู่แล้ว (กัน % ซ้ำ — เจอจริงที่ kpiOnTimeSubTarget)
    formatPercent(value, withUnit = true) {
      if (value == null) return '—'
      const formatted = new Intl.NumberFormat('th-TH', { maximumFractionDigits: 1 }).format(value)
      return withUnit ? `${formatted}%` : formatted
    },

    // withUnit=false ใช้ตอนฝังในประโยค i18n ที่มีหน่วย "วัน" ต่อท้ายให้อยู่แล้ว (กันคำว่า "วัน" ซ้ำ)
    formatDays(value, withUnit = true) {
      if (value == null) return '—'
      const formatted = new Intl.NumberFormat('th-TH', { maximumFractionDigits: 1 }).format(value)
      return withUnit ? `${formatted} ${this.$t('view.productionInsight.delivery.daysUnit')}` : formatted
    }
  }
}
</script>

<style lang="scss" scoped>
.delivery-kpi-group__as-of {
  font-size: var(--fs-sm);
  font-weight: 400;
  color: var(--base-sub-color);
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: stretch;
  gap: var(--sp-md);

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.kpi-card {
  height: 100%;
  min-width: 0;

  :deep(.stat-card) {
    height: 100%;
  }
}
</style>
