<!--
  gold-kpi-group — กลุ่ม KPI ของหมวด "ทองและ Loss" (ProductionInsight/Gold.kpi) — 2 แถวตามประเภทช่าง
  (ช่างฝัง 80 ก่อน แล้วช่างแต่ง 50) × 3 การ์ดต่อแถว (% Loss จริง เทียบยอมให้/เป้า, ทองเกินเกณฑ์ (กรัม) + มูลค่า,
  งานเข้า slip %) — SectionCardGeneric headerStyle="dashboard" ครอบ StatCardGeneric (กันกรอบซ้อน 2 ชั้น)
  การ์ดกดได้ทุกใบ เลื่อนไปยังส่วนรายงานที่เกี่ยวข้อง

  Props:
    kpi     — Array (required) จาก Gold.kpi (1 แถวต่อประเภทช่าง — ของโลหะที่กำลังดูอยู่เท่านั้น)
    asOf    — String|null (null) — เวลาประมวลผลข้อมูลล่าสุด (Gold.asOf) — โชว์มุมขวาบนของกล่อง KPI
    metal   — String ('GOLD') — 'GOLD'|'SILVER' — โชว์ ToggleGroupGeneric ทอง|เงิน ข้างหัวข้อ KPI (state
              เดียวกับตัวกรองหมวด gold ใน FilterPanelGeneric — คุม parent โดยตรงผ่าน update:metal)
    loading — Boolean (false)

  Emits: goto-report(reportRef), update:metal(value)
-->
<template>
  <SectionCardGeneric :title="kpiGroupTitle" icon="bi-gem" accent="main" headerStyle="dashboard">
    <template #header-actions>
      <div class="gold-kpi-group__header-actions">
        <ToggleGroupGeneric
          :modelValue="metal"
          :options="metalOptions"
          :ariaLabel="$t('view.productionInsight.gold.metalToggleAriaLabel')"
          @update:modelValue="$emit('update:metal', $event)"
        />
        <span v-if="asOf" class="gold-kpi-group__as-of">{{ $t('view.executive.asOf', { date: formatDateTime(asOf) }) }}</span>
      </div>
    </template>

    <div v-for="row in rows" :key="row.workerType" class="gold-kpi-group__row">
      <p class="gold-kpi-group__row-title">{{ row.label }}</p>
      <div class="kpi-grid">
        <div class="kpi-card">
          <StatCardGeneric
            icon="bi-percent"
            :value="formatPercent(row.lossPercent)"
            :label="$t('view.productionInsight.gold.kpiLossPercent')"
            :subLabel="lossSubLabel(row)"
            :variant="lossVariant(row)"
            :loading="loading"
            clickable
            @click="$emit('goto-report', 'goldKpi')"
          />
        </div>
        <div class="kpi-card">
          <StatCardGeneric
            icon="bi-exclamation-triangle"
            :value="formatGram(row.excessGram)"
            :label="$t('view.productionInsight.gold.kpiExcessGram', { metal: metalLabel })"
            :subLabel="excessSubLabel(row)"
            :variant="row.excessGram > 0 ? 'warning' : 'green'"
            :loading="loading"
            clickable
            @click="$emit('goto-report', 'goldOverSlips')"
          />
        </div>
        <div class="kpi-card">
          <StatCardGeneric
            icon="bi-receipt"
            :value="formatPercent(row.coveragePercent)"
            :label="$t('view.productionInsight.gold.kpiCoveragePercent')"
            :subLabel="coverageSubLabel(row)"
            :variant="row.coveragePercent != null && row.coveragePercent < 100 ? 'warning' : 'green'"
            :loading="loading"
            clickable
            @click="$emit('goto-report', 'goldUncovered')"
          />
        </div>
      </div>
    </div>
  </SectionCardGeneric>
</template>

<script>
import { resolveGoldLossStatVariant } from './gold-helpers.js'
import { formatDateTime } from '@/services/utils/dayjs.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import StatCardGeneric from '@/components/generic/StatCardGeneric.vue'
import ToggleGroupGeneric from '@/components/generic/ToggleGroupGeneric.vue'

const ROW_ORDER = [80, 50]
const METAL_VALUES = ['GOLD', 'SILVER']

const emptyRow = (workerType) => ({
  workerType,
  slipCount: 0,
  workerCount: 0,
  lossPercent: null,
  allowedPercent: null,
  targetPercent: null,
  excessGram: 0,
  excessMoney: 0,
  coverageJobs: 0,
  coverageTotalJobs: 0,
  coveragePercent: null
})

export default {
  name: 'GoldKpiGroup',

  components: {
    SectionCardGeneric,
    StatCardGeneric,
    ToggleGroupGeneric
  },

  props: {
    kpi: {
      type: Array,
      required: true
    },
    asOf: {
      type: String,
      default: null
    },
    metal: {
      type: String,
      default: 'GOLD'
    },
    loading: {
      type: Boolean,
      default: false
    }
  },

  emits: ['goto-report', 'update:metal'],

  computed: {
    // "ทองและ Loss — ทอง"/"— เงิน" — ชื่อหมวดเดิมต่อท้ายด้วยโลหะที่กำลังดูอยู่ ให้เห็นชัดตรงหัวข้อ KPI
    kpiGroupTitle() {
      return `${this.$t('view.productionInsight.nav.gold')} — ${this.metalLabel}`
    },

    metalOptions() {
      return METAL_VALUES.map((value) => ({ value, label: this.$t(`view.productionInsight.gold.metalLabel.${value}`) }))
    },

    metalLabel() {
      return this.$t(`view.productionInsight.gold.metalLabel.${this.metal}`)
    },

    rows() {
      return ROW_ORDER.map((workerType) => {
        const found = this.kpi.find((k) => k.workerType === workerType)
        return { ...emptyRow(workerType), ...found, label: this.$t(`view.productionInsight.gold.workerType.${workerType}`) }
      })
    }
  },

  methods: {
    formatDateTime,

    lossVariant(row) {
      return resolveGoldLossStatVariant(row.lossPercent, row.targetPercent)
    },

    lossSubLabel(row) {
      return this.$t('view.productionInsight.gold.kpiLossPercentSub', {
        allowed: this.formatPercent(row.allowedPercent, false),
        target: this.formatPercent(row.targetPercent, false)
      })
    },

    excessSubLabel(row) {
      return this.$t('view.productionInsight.gold.kpiExcessGramSub', { money: this.formatCount(row.excessMoney) })
    },

    coverageSubLabel(row) {
      return this.$t('view.productionInsight.gold.kpiCoveragePercentSub', {
        jobs: this.formatCount(row.coverageJobs),
        total: this.formatCount(row.coverageTotalJobs)
      })
    },

    formatCount(value) {
      return value != null ? new Intl.NumberFormat('th-TH').format(value) : '—'
    },

    // withUnit=false ใช้ตอนฝังในประโยค i18n ที่มี "%" ต่อท้ายให้อยู่แล้ว (กัน % ซ้ำ — บทเรียนจาก delivery-kpi-group.vue)
    // ทศนิยมสูงสุด 2 ตำแหน่งให้ตรงกับตัวเลขใน rules.* (เช่น 3.98%) — เดิม 1 ตำแหน่งทำให้การ์ดโชว์ "4%" ไม่ตรงกับ
    // ข้อความ finding ที่โชว์ "3.98%" จากค่าเดียวกัน
    formatPercent(value, withUnit = true) {
      if (value == null) return '—'
      const formatted = new Intl.NumberFormat('th-TH', { maximumFractionDigits: 2 }).format(value)
      return withUnit ? `${formatted}%` : formatted
    },

    formatGram(value) {
      return value != null ? `${new Intl.NumberFormat('th-TH', { maximumFractionDigits: 2 }).format(value)} ${this.$t('view.productionInsight.gold.gramUnit')}` : '—'
    }
  }
}
</script>

<style lang="scss" scoped>
.gold-kpi-group__header-actions {
  display: flex;
  align-items: center;
  gap: var(--sp-md);
}

.gold-kpi-group__as-of {
  font-size: var(--fs-sm);
  font-weight: 400;
  color: var(--base-sub-color);
}

.gold-kpi-group__row + .gold-kpi-group__row {
  margin-top: var(--sp-lg);
}

.gold-kpi-group__row-title {
  margin: 0 0 var(--sp-sm);
  font-size: var(--fs-base);
  font-weight: 700;
  color: var(--base-font-color);
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
