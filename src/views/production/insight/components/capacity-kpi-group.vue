<!--
  capacity-kpi-group — กลุ่ม KPI 5 ช่องของหมวด "กำลังการผลิต" (ProductionInsight/Capacity.kpi) —
  SectionCardGeneric headerStyle="dashboard" ครอบ StatCardGeneric (กันกรอบซ้อน 2 ชั้น) การ์ดกดได้ทุกใบ เลื่อน
  ไปยังส่วนรายงานที่เกี่ยวข้อง

  "ผลิตเสร็จ" (การ์ด 2) = field `outputPerMonth` ไม่ใช่ `completedPerMonth` — ยืนยันจาก API agent แล้ว: field
  `output` = เข้าบัตรต้นทุนครั้งแรก (งานช่างจบ) ตรงกับนิยาม "ผลิตเสร็จ" เป๊ะ (`completed` คือ "ปิดสำเร็จ" ขั้น
  ถัดไป ใช้แค่ในกราฟแนวโน้ม ไม่มีการ์ดของตัวเอง) — netSubLabel ใช้ kpi.netPerMonth ตรงๆ (= inflow − output
  อยู่แล้วจาก backend) จึงสอดคล้องกับค่าในการ์ดเดียวกันพอดี

  Props:
    kpi           — Object (required) จาก Capacity.kpi
    departments   — Array (required) จาก Capacity.departments (ไม่กรองตาม filter.departmentKeys — เลข KPI
                    เป็นภาพรวมทั้งบริษัทเสมอ ไม่กรองรายแผนก) — ใช้จับคู่ queueDays ของแผนกคอขวด (kpi.bottleneckDepts
                    เป็นแค่ array ของ key ไม่มี queueDays มาด้วย)
    costCardToDone — Object (required) จาก Capacity.costCardToDone
    asOf          — String|null (null) — เวลาประมวลผลข้อมูลล่าสุด (Capacity.asOf)
    loading       — Boolean (false)

  Emits: goto-report(reportRef)
-->
<template>
  <SectionCardGeneric
    :title="$t('view.productionInsight.capacity.kpiGroupTitle')"
    :titleTip="$t('view.productionInsight.help.capacityKpiDefinitions')"
    icon="bi-speedometer2"
    accent="main"
    headerStyle="dashboard"
  >
    <template v-if="asOf" #header-actions>
      <span class="capacity-kpi-group__as-of">{{ $t('view.executive.asOf', { date: formatDateTime(asOf) }) }}</span>
    </template>

    <div class="kpi-grid">
      <div class="kpi-card">
        <StatCardGeneric
          icon="bi-box-arrow-in-down"
          :value="formatCount(kpi.inflowPerMonth)"
          :label="$t('view.productionInsight.capacity.kpiInflow')"
          :subLabel="inflowSubLabel"
          variant="main"
          :loading="loading"
          clickable
          @click="$emit('goto-report', 'capTrend')"
        />
      </div>
      <div class="kpi-card">
        <StatCardGeneric
          icon="bi-box-arrow-up-right"
          :value="formatCount(completedCardValue)"
          :label="$t('view.productionInsight.capacity.kpiCompleted')"
          :subLabel="netSubLabel"
          :variant="netVariant"
          :loading="loading"
          clickable
          @click="$emit('goto-report', 'capTrend')"
        />
      </div>
      <div class="kpi-card">
        <StatCardGeneric
          icon="bi-stack"
          :value="formatMonths(kpi.backlogMonths)"
          :label="$t('view.productionInsight.capacity.kpiBacklog')"
          :subLabel="backlogSubLabel"
          variant="main"
          :loading="loading"
          clickable
          @click="$emit('goto-report', 'capDepartments')"
        />
      </div>
      <div class="kpi-card">
        <StatCardGeneric
          icon="bi-exclamation-triangle"
          :value="String(bottleneckSummary.length)"
          :label="$t('view.productionInsight.capacity.kpiBottleneck')"
          :subLabel="bottleneckSubLabel"
          :variant="bottleneckVariant"
          :loading="loading"
          clickable
          @click="$emit('goto-report', 'capDepartments')"
        />
      </div>
      <div class="kpi-card">
        <StatCardGeneric
          icon="bi-clipboard-check"
          :value="formatDays(costCardToDone.medianDays)"
          :label="$t('view.productionInsight.capacity.kpiCostCard')"
          :subLabel="costCardSubLabel"
          :variant="costCardVariant"
          :loading="loading"
          clickable
          @click="$emit('goto-report', 'capCostCard')"
        />
      </div>
    </div>
  </SectionCardGeneric>
</template>

<script>
import { resolveNetVariant, resolveBottleneckVariant, resolveCostCardVariant, buildBottleneckSummary, CAPACITY_PRODUCED_FIELD } from './capacity-helpers.js'
import { formatDateTime } from '@/services/utils/dayjs.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import StatCardGeneric from '@/components/generic/StatCardGeneric.vue'

export default {
  name: 'CapacityKpiGroup',

  components: {
    SectionCardGeneric,
    StatCardGeneric
  },

  props: {
    kpi: {
      type: Object,
      required: true
    },
    departments: {
      type: Array,
      required: true
    },
    costCardToDone: {
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
    // "ผลิตเสร็จ" = field CAPACITY_PRODUCED_FIELD (='outputPerMonth' — ดู comment บน) ไม่ใช่ completedPerMonth
    completedCardValue() {
      return this.kpi[`${CAPACITY_PRODUCED_FIELD}PerMonth`]
    },

    netVariant() {
      return resolveNetVariant(this.kpi.netPerMonth)
    },

    bottleneckVariant() {
      return resolveBottleneckVariant(this.kpi.bottleneckDepts)
    },

    costCardVariant() {
      return resolveCostCardVariant(this.costCardToDone.pendingOver30d)
    },

    bottleneckSummary() {
      return buildBottleneckSummary(this.kpi.bottleneckDepts, this.departments)
    },

    inflowSubLabel() {
      return this.$t('view.productionInsight.capacity.kpiInflowSub', { pieces: this.formatCount(this.kpi.inflowPiecesPerMonth) })
    },

    netSubLabel() {
      const amount = this.formatCount(Math.abs(this.kpi.netPerMonth ?? 0))
      if (this.kpi.netPerMonth == null) return this.$t('view.productionInsight.capacity.kpiNetSubUnknown')
      return this.kpi.netPerMonth > 0
        ? this.$t('view.productionInsight.capacity.kpiNetSubUp', { amount })
        : this.$t('view.productionInsight.capacity.kpiNetSubDown', { amount })
    },

    backlogSubLabel() {
      return this.$t('view.productionInsight.capacity.kpiBacklogSub', { activeWip: this.formatCount(this.kpi.activeWip) })
    },

    bottleneckSubLabel() {
      if (!this.bottleneckSummary.length) return this.$t('view.productionInsight.capacity.kpiBottleneckSubNone')
      const names = this.bottleneckSummary.map((b) => this.deptQueueLabel(b)).join(', ')
      return names
    },

    costCardSubLabel() {
      return this.$t('view.productionInsight.capacity.kpiCostCardSub', {
        p90: this.formatDays(this.costCardToDone.p90Days, false),
        pending: this.formatCount(this.costCardToDone.pendingNow)
      })
    }
  },

  methods: {
    formatDateTime,

    deptQueueLabel(bottleneck) {
      const name = this.$t(`view.executive.department.${bottleneck.key}`)
      if (bottleneck.queueDays == null) return name
      return this.$t('view.productionInsight.capacity.kpiBottleneckDeptItem', { name, days: this.formatDays(bottleneck.queueDays, false) })
    },

    formatCount(value) {
      return value != null ? new Intl.NumberFormat('th-TH').format(value) : '—'
    },

    formatMonths(value) {
      return value != null ? `${new Intl.NumberFormat('th-TH', { maximumFractionDigits: 1 }).format(value)} ${this.$t('view.productionInsight.capacity.monthsUnit')}` : '—'
    },

    // withUnit=false ใช้ตอนฝังในประโยค i18n ที่มีหน่วย "วัน" ต่อท้ายให้อยู่แล้ว (กันคำว่า "วัน" ซ้ำ)
    formatDays(value, withUnit = true) {
      if (value == null) return '—'
      const formatted = new Intl.NumberFormat('th-TH', { maximumFractionDigits: 1 }).format(value)
      return withUnit ? `${formatted} ${this.$t('view.productionInsight.capacity.daysUnit')}` : formatted
    }
  }
}
</script>

<style lang="scss" scoped>
.capacity-kpi-group__as-of {
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
