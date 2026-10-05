<!--
  materials-kpi-group — กลุ่ม KPI 4 ช่องของหมวด "วัตถุดิบที่กระทบการผลิต" (ProductionInsight/Materials.kpi) —
  SectionCardGeneric headerStyle="dashboard" ครอบ StatCardGeneric (กันกรอบซ้อน 2 ชั้น) การ์ดกดได้ทุกใบ เลื่อน
  ไปยังส่วนรายงานที่เกี่ยวข้อง — มี note ที่เห็นได้ตรงๆ ใต้การ์ด (ไม่ใช่แค่ tooltip) อธิบายว่าสถานะพร้อม/ไม่พอ
  เป็นค่าประมาณ ตามที่สั่งเป๊ะ

  Props:
    kpi     — Object (required) จาก Materials.kpi
    asOf    — String|null (null) — เวลาประมวลผลข้อมูลล่าสุด (Materials.asOf)
    loading — Boolean (false)

  Emits: goto-report(reportRef)
-->
<template>
  <SectionCardGeneric
    :title="$t('view.productionInsight.materials.kpiGroupTitle')"
    icon="bi-speedometer2"
    accent="main"
    headerStyle="dashboard"
  >
    <template v-if="asOf" #header-actions>
      <span class="materials-kpi-group__as-of">{{ $t('view.executive.asOf', { date: formatDateTime(asOf) }) }}</span>
    </template>

    <div class="kpi-grid">
      <div class="kpi-card">
        <StatCardGeneric
          icon="bi-hourglass-split"
          :value="formatCount(kpi.waitingPlans)"
          :label="$t('view.productionInsight.materials.kpiWaitingPlans')"
          :subLabel="$t('view.productionInsight.materials.kpiWaitingPlansSub', { days: formatDaysPlain(kpi.waitingMedianDays) })"
          variant="main"
          :loading="loading"
          clickable
          @click="$emit('goto-report', 'matWaiting')"
        />
      </div>
      <div class="kpi-card">
        <StatCardGeneric
          icon="bi-clock-history"
          :value="formatDays(kpi.issueMedianDays)"
          :label="$t('view.productionInsight.materials.kpiIssueMedian')"
          :subLabel="$t('view.productionInsight.materials.kpiIssueMedianSub', { days: formatDaysPlain(kpi.issueP90Days) })"
          variant="main"
          :loading="loading"
          clickable
          @click="$emit('goto-report', 'matTrend')"
        />
      </div>
      <div class="kpi-card">
        <StatCardGeneric
          icon="bi-exclamation-triangle"
          :value="formatCount(kpi.shortLines)"
          :label="$t('view.productionInsight.materials.kpiShortLines')"
          :subLabel="$t('view.productionInsight.materials.kpiShortLinesSub', { plans: formatCount(kpi.shortPlans) })"
          variant="warning"
          :loading="loading"
          clickable
          @click="$emit('goto-report', 'matDemand')"
        />
      </div>
      <div class="kpi-card">
        <StatCardGeneric
          icon="bi-check2-square"
          :value="formatPercent(matchedPercent)"
          :label="$t('view.productionInsight.materials.kpiMatchedPercent')"
          :subLabel="$t('view.productionInsight.materials.kpiMatchedPercentSub', { matched: formatCount(kpi.matchedLines), total: formatCount(kpi.totalLines) })"
          variant="main"
          :loading="loading"
          clickable
          @click="$emit('goto-report', 'matWaiting')"
        />
      </div>
    </div>

    <p class="materials-kpi-group__note">{{ $t('view.productionInsight.materials.statusEstimateNote') }}</p>
  </SectionCardGeneric>
</template>

<script>
import { resolveMatchedLinesPercent } from './materials-helpers.js'
import { formatDateTime } from '@/services/utils/dayjs.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import StatCardGeneric from '@/components/generic/StatCardGeneric.vue'

export default {
  name: 'MaterialsKpiGroup',

  components: {
    SectionCardGeneric,
    StatCardGeneric
  },

  props: {
    kpi: {
      type: Object,
      required: true
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
    matchedPercent() {
      return resolveMatchedLinesPercent(this.kpi.matchedLines, this.kpi.totalLines)
    }
  },

  methods: {
    formatDateTime,

    formatCount(value) {
      return value != null ? new Intl.NumberFormat('th-TH').format(value) : '—'
    },

    formatDaysPlain(value) {
      return value != null ? new Intl.NumberFormat('th-TH', { maximumFractionDigits: 1 }).format(value) : '—'
    },

    formatDays(value) {
      if (value == null) return '—'
      return `${this.formatDaysPlain(value)} ${this.$t('view.productionInsight.materials.daysUnit')}`
    },

    formatPercent(value) {
      return value != null ? `${new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 }).format(value)}%` : '—'
    }
  }
}
</script>

<style lang="scss" scoped>
.materials-kpi-group__as-of {
  font-size: var(--fs-sm);
  font-weight: 400;
  color: var(--base-sub-color);
}

.materials-kpi-group__note {
  margin: var(--sp-md) 0 0;
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
  font-style: italic;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
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
