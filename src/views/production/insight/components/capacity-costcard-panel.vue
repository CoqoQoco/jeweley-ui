<!--
  capacity-costcard-panel — orchestrator ของ reportRef: capCostCard ("บัตรต้นทุน → สำเร็จ") ในหมวด
  "กำลังการผลิต" — รับ costCardToDone มาจาก Capacity response ที่ capacity-section.vue ยิงแล้ว (ไม่ยิง endpoint
  เอง) ส่วนตาราง "ใบงานที่ยังไม่เข้าบัตรต้นทุน" เป็น panel แยก (ยิง CostCardPendingPlans เอง, paginate อิสระ)

  Props:
    costCardToDone — Object (required) จาก Capacity.costCardToDone { medianDays, p90Days, pendingNow,
                     pendingOver30d, pendingActive|null, pendingStale|null,
                     series[{bucketEnd,count,medianDays|null,p90Days|null}] } — pendingActive/pendingStale
                     (ยังขยับ/นิ่งเกิน 180 วัน) เป็น field ใหม่ที่ API ยังไม่ส่งมาครบทุก response (อยู่ระหว่าง
                     ปรับฝั่ง backend) — โชว์ breakdown ใต้ตัวเลข "ค้างอยู่ตอนนี้" เฉพาะตอนมีค่าทั้งคู่ ไม่งั้น
                     โชว์แค่ตัวเลขรวมเหมือนเดิม
    loading        — Boolean (false)

  แกน x ใช้ formatBucketMonthLabels (insight-helpers.js) ย่อป้ายเหลือแค่ชื่อเดือนไทยของ "จุดเริ่ม bucket" (อิง bucketEnd ของจุดก่อนหน้า ไม่ใช่ลบ 1 วันจาก bucketEnd ของตัวเอง) — กันป้าย
  ซ้ำตอน bucket สุดท้ายไม่เต็มเดือน
-->
<template>
  <div id="insight-report-capCostCard" class="capacity-costcard-panel">
    <SectionCardGeneric
      :title="$t('view.productionInsight.capacity.costCardTitle')"
      :titleTip="$t('view.productionInsight.help.capacityCostCardDefinition')"
      icon="bi-clipboard-check"
      accent="main"
      headerStyle="legend"
    >
      <div class="capacity-costcard-panel__summary">
        <div class="capacity-costcard-panel__summary-item">
          <span class="capacity-costcard-panel__summary-label">{{ $t('view.productionInsight.capacity.costCardMedian') }}</span>
          <span class="capacity-costcard-panel__summary-value">{{ formatDays(costCardToDone.medianDays) }}</span>
        </div>
        <div class="capacity-costcard-panel__summary-item">
          <span class="capacity-costcard-panel__summary-label">{{ $t('view.productionInsight.capacity.costCardP90') }}</span>
          <span class="capacity-costcard-panel__summary-value">{{ formatDays(costCardToDone.p90Days) }}</span>
        </div>
        <div class="capacity-costcard-panel__summary-item">
          <span class="capacity-costcard-panel__summary-label">{{ $t('view.productionInsight.capacity.costCardPendingNow') }}</span>
          <span class="capacity-costcard-panel__summary-value">{{ formatCount(costCardToDone.pendingNow) }}</span>
          <span v-if="hasPendingBreakdown" class="capacity-costcard-panel__summary-sub">
            {{
              $t('view.productionInsight.capacity.costCardPendingBreakdown', {
                active: formatCount(costCardToDone.pendingActive),
                stale: formatCount(costCardToDone.pendingStale)
              })
            }}
          </span>
        </div>
        <div class="capacity-costcard-panel__summary-item">
          <span class="capacity-costcard-panel__summary-label">{{ $t('view.productionInsight.capacity.costCardPendingOver30d') }}</span>
          <span class="capacity-costcard-panel__summary-value">{{ formatCount(costCardToDone.pendingOver30d) }}</span>
        </div>
      </div>

      <ChartGeneric type="line" :series="chartSeries" :options="chartOptions" :height="280" :loading="loading" :emptyText="$t('common.label.noData')" />

      <CapacityCostcardPendingPanel />
    </SectionCardGeneric>
  </div>
</template>

<script>
import { CHART_TOKENS } from '@/services/utils/chart-colors.js'
import { formatBucketMonthLabels } from '@/components/insight/insight-helpers.js'
import { mapCapacitySeriesField } from './capacity-helpers.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ChartGeneric from '@/components/prime-vue/ChartGeneric.vue'
import CapacityCostcardPendingPanel from './capacity-costcard-pending-panel.vue'

export default {
  name: 'CapacityCostcardPanel',

  components: {
    SectionCardGeneric,
    ChartGeneric,
    CapacityCostcardPendingPanel
  },

  props: {
    costCardToDone: {
      type: Object,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    hasPendingBreakdown() {
      return this.costCardToDone.pendingActive != null && this.costCardToDone.pendingStale != null
    },

    points() {
      return this.costCardToDone.series || []
    },

    chartSeries() {
      return [
        { name: this.$t('view.productionInsight.capacity.costCardSeriesCount'), type: 'bar', data: mapCapacitySeriesField(this.points, 'count') },
        { name: this.$t('view.productionInsight.capacity.costCardMedian'), type: 'line', data: mapCapacitySeriesField(this.points, 'medianDays') },
        { name: this.$t('view.productionInsight.capacity.costCardP90'), type: 'line', data: mapCapacitySeriesField(this.points, 'p90Days') }
      ]
    },

    chartOptions() {
      return {
        chart: { type: 'line', toolbar: { show: false } },
        colors: [CHART_TOKENS.sub, CHART_TOKENS.primary, CHART_TOKENS.warning],
        stroke: { width: [0, 3, 2], curve: 'smooth', dashArray: [0, 0, 6] },
        plotOptions: { bar: { columnWidth: '45%' } },
        xaxis: { categories: formatBucketMonthLabels(this.points.map((p) => p.bucketEnd)) },
        yaxis: [
          { seriesName: this.$t('view.productionInsight.capacity.costCardSeriesCount'), title: { text: this.$t('view.productionInsight.capacity.planUnit') }, labels: { formatter: (v) => this.formatCount(v) } },
          {
            seriesName: this.$t('view.productionInsight.capacity.costCardMedian'),
            opposite: true,
            title: { text: this.$t('view.productionInsight.capacity.daysUnit') },
            labels: { formatter: (v) => this.formatDaysPlain(v) }
          },
          { seriesName: this.$t('view.productionInsight.capacity.costCardMedian'), opposite: true, show: false, labels: { formatter: (v) => this.formatDaysPlain(v) } }
        ],
        tooltip: {
          y: [{ formatter: (v) => this.formatCount(v) }, { formatter: (v) => this.formatDaysPlain(v) }, { formatter: (v) => this.formatDaysPlain(v) }]
        }
      }
    }
  },

  methods: {
    formatCount(value) {
      return value != null ? new Intl.NumberFormat('th-TH').format(value) : '—'
    },

    formatDays(value) {
      return value != null ? `${new Intl.NumberFormat('th-TH', { maximumFractionDigits: 1 }).format(value)} ${this.$t('view.productionInsight.capacity.daysUnit')}` : '—'
    },

    formatDaysPlain(value) {
      if (value == null) return '—'
      return new Intl.NumberFormat('th-TH', { maximumFractionDigits: 1 }).format(value)
    }
  }
}
</script>

<style lang="scss" scoped>
.capacity-costcard-panel {
  scroll-margin-top: calc(var(--mainbar-height) + 64px);
  min-width: 0;
}

.capacity-costcard-panel__summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--sp-md);
  margin-bottom: var(--sp-lg);

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.capacity-costcard-panel__summary-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--sp-sm) var(--sp-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.capacity-costcard-panel__summary-label {
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}

.capacity-costcard-panel__summary-value {
  font-size: var(--fs-lg);
  font-weight: 700;
  color: var(--base-font-color);
}

.capacity-costcard-panel__summary-sub {
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}
</style>
