<!--
  workers-kpi-group — กลุ่ม KPI 4 ช่องของหมวด "ช่างและค่าแรง" (ProductionInsight/Workers.kpi) —
  SectionCardGeneric headerStyle="dashboard" ครอบ StatCardGeneric (กันกรอบซ้อน 2 ชั้น) การ์ดกดได้ทุกใบ เลื่อน
  ไปยังส่วนรายงานที่เกี่ยวข้อง

  การ์ด "ค่าแรงในระบบ/เดือน" โชว์ sub-label เป็น 2 แผนกที่ใช้ค่าแรงมากสุด (เรียงจาก kpi.wagesByDept ตรงๆ ไม่
  hardcode ว่าเป็นแผนกไหน — topWagesByDept) ต่อท้ายด้วย "ไม่รวมเงินเดือน" เมื่อ kpi.excludesSalaried เป็น true
  (ไม่มี slot เสริมใน StatCardGeneric จึงรวมเป็นข้อความ sub-label เดียว)

  Props:
    kpi     — Object (required) จาก Workers.kpi
    asOf    — String|null (null) — เวลาประมวลผลข้อมูลล่าสุด (Workers.asOf)
    loading — Boolean (false)

  Emits: goto-report(reportRef)
-->
<template>
  <SectionCardGeneric
    :title="$t('view.productionInsight.workers.kpiGroupTitle')"
    icon="bi-speedometer2"
    accent="main"
    headerStyle="dashboard"
  >
    <template v-if="asOf" #header-actions>
      <span class="workers-kpi-group__as-of">{{ $t('view.executive.asOf', { date: formatDateTime(asOf) }) }}</span>
    </template>

    <div class="kpi-grid">
      <div class="kpi-card">
        <StatCardGeneric
          icon="bi-cash-stack"
          :value="formatMoney(kpi.wagesPerMonth)"
          :label="$t('view.productionInsight.workers.kpiWagesPerMonth')"
          :subLabel="wagesSubLabel"
          variant="main"
          :loading="loading"
          clickable
          @click="$emit('goto-report', 'wrkTrend')"
        />
      </div>
      <div class="kpi-card">
        <StatCardGeneric
          icon="bi-receipt"
          :value="formatMoney(kpi.wagePerOutputPlan)"
          :label="$t('view.productionInsight.workers.kpiWagePerPlan')"
          :subLabel="$t('view.productionInsight.workers.kpiWagePerPlanSub')"
          variant="main"
          :loading="loading"
          clickable
          @click="$emit('goto-report', 'wrkTrend')"
        />
      </div>
      <div class="kpi-card">
        <StatCardGeneric
          icon="bi-people"
          :value="formatCount(kpi.activeWorkers)"
          :label="$t('view.productionInsight.workers.kpiActiveWorkers')"
          :subLabel="activeWorkersSubLabel"
          variant="main"
          :loading="loading"
          clickable
          @click="$emit('goto-report', 'wrkTable')"
        />
      </div>
      <div class="kpi-card">
        <StatCardGeneric
          icon="bi-truck"
          :value="formatPercent(kpi.outsideWageShare)"
          :label="$t('view.productionInsight.workers.kpiOutsideShare')"
          variant="main"
          :loading="loading"
          clickable
          @click="$emit('goto-report', 'wrkTable')"
        />
      </div>
    </div>
  </SectionCardGeneric>
</template>

<script>
import { topWagesByDept } from './workers-helpers.js'
import { formatDateTime } from '@/services/utils/dayjs.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import StatCardGeneric from '@/components/generic/StatCardGeneric.vue'

export default {
  name: 'WorkersKpiGroup',

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
    wagesSubLabel() {
      const depts = topWagesByDept(this.kpi.wagesByDept)
      const parts = depts.map((d) => `${this.$t(`view.executive.department.${d.deptKey}`)} ${this.formatPercent(d.share)}`)
      if (this.kpi.excludesSalaried) parts.push(this.$t('view.productionInsight.workers.excludesSalariedNote'))
      return parts.join(' · ')
    },

    activeWorkersSubLabel() {
      const byDept = this.kpi.activeWorkersByDept || []
      if (!byDept.length) return ''
      return byDept.map((d) => `${this.$t(`view.executive.department.${d.deptKey}`)} ${this.formatCount(d.count)}`).join(', ')
    }
  },

  methods: {
    formatDateTime,

    formatCount(value) {
      return value != null ? new Intl.NumberFormat('th-TH').format(value) : '—'
    },

    formatMoney(value) {
      return value != null ? `฿${new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 }).format(value)}` : '—'
    },

    formatPercent(value) {
      if (value == null) return '—'
      return `${new Intl.NumberFormat('th-TH', { maximumFractionDigits: 1 }).format(value)}%`
    }
  }
}
</script>

<style lang="scss" scoped>
.workers-kpi-group__as-of {
  font-size: var(--fs-sm);
  font-weight: 400;
  color: var(--base-sub-color);
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
