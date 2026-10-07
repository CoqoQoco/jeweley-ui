<!--
  capacity-breakdown-panel — กล่อง "แยกตามสินค้า" (reportRef: capBreakdown) ของหมวด "กำลังการผลิต"
  (Capacity.breakdown) — ToggleGroup มิติ (ประเภทสินค้า / ทอง / Gold size) · ตารางกลุ่ม (เรียงงานค้างมากสุดก่อน
  ตามที่ API ส่ง) · กราฟแท่ง stacked รายเดือน top 6 + "อื่น ๆ" สลับ งานเข้า/ผลิตเสร็จ — คลิกแถว = ตั้งกลุ่มนั้นเป็นตัวกรอง
  ของทั้งแท็บ (emit select-group; ชิปตัวกรองโชว์/ลบที่แถบตัวกรองด้านบนของหน้า) คลิกซ้ำที่กลุ่มที่เลือกอยู่ = เอาออก

  rows.inflowPieces/outputPieces เป็นยอดรวมทั้งช่วง (ใช้จัดอันดับ) — คอลัมน์ "/เดือน" ใช้ inflowPiecesPerMonth/outputPiecesPerMonth

  จำนวนนับตามที่ใบงานระบุ (ชิ้น/คู่/เส้น ตามประเภทสินค้า ไม่แปลงหน่วย) — คอลัมน์ "หน่วย" ของแถว 'mixed' = ไม่มีหน่วยใด
  เกิน 50% แสดงเป็น "ชิ้น/คู่" — กลุ่มที่ว่าง (key '') ชื่อ "ไม่ระบุ" มาจาก API

  Props:
    breakdown  — Object|null — Capacity.breakdown { by, unitNote, rows[], series[] }
    by         — String (required) — มิติปัจจุบัน (filter.breakdownBy)
    activeKeys — Array ([]) — กลุ่มที่ตั้งเป็นตัวกรองอยู่ในมิติปัจจุบัน (highlight แถว)
    loading    — Boolean (false)

  Emits: change-by(by), select-group(key)
-->
<template>
  <div id="insight-report-capBreakdown" class="capacity-breakdown-panel">
    <SectionCardGeneric :title="$t('view.productionInsight.capacity.breakdownTitle')" icon="bi-tags" accent="main" headerStyle="legend">
      <div class="capacity-breakdown-panel__toolbar">
        <ToggleGroupGeneric
          :modelValue="by"
          :options="byOptions"
          :ariaLabel="$t('view.productionInsight.capacity.breakdownByAriaLabel')"
          @update:modelValue="$emit('change-by', $event)"
        />
      </div>
      <p class="capacity-breakdown-panel__hint">{{ $t('view.productionInsight.capacity.breakdownUnitNote') }}</p>
      <p class="capacity-breakdown-panel__hint">{{ $t('view.productionInsight.capacity.breakdownClickHint') }}</p>

      <div class="responsive-table-wrapper">
        <BaseDataTable :items="rows" :columns="columns" :paginator="false" dataKey="key" :rowClass="rowClass" :loading="loading" @row-click="onRowClick">
          <template #nameTemplate="{ data }">
            <strong>{{ data.name }}</strong>
          </template>
          <template #unitTemplate="{ data }">{{ unitLabel(data.unit) }}</template>
          <template #inflowPiecesPerMonthTemplate="{ data }">
            <div class="text-right">{{ formatCount(data.inflowPiecesPerMonth) }}</div>
          </template>
          <template #outputPiecesPerMonthTemplate="{ data }">
            <div class="text-right">{{ formatCount(data.outputPiecesPerMonth) }}</div>
          </template>
          <template #netPiecesPerMonthTemplate="{ data }">
            <div class="text-right" :class="netClass(data.netPiecesPerMonth)">{{ formatNet(data.netPiecesPerMonth) }}</div>
          </template>
          <template #activeWipPiecesTemplate="{ data }">
            <div class="text-right">{{ formatCount(data.activeWipPieces) }}</div>
          </template>
          <template #activeWipPlansTemplate="{ data }">
            <div class="text-right">{{ formatCount(data.activeWipPlans) }}</div>
          </template>
        </BaseDataTable>
      </div>
    </SectionCardGeneric>

    <SectionCardGeneric :title="chartTitle" icon="bi-bar-chart-line" accent="main" headerStyle="legend">
      <div class="capacity-breakdown-panel__toolbar">
        <ToggleGroupGeneric v-model="metric" :options="metricOptions" :ariaLabel="$t('view.productionInsight.capacity.breakdownMetricAriaLabel')" />
      </div>
      <ChartGeneric type="bar" :series="chartSeries" :options="chartOptions" :height="320" :loading="loading" :emptyText="$t('common.label.noData')" />
    </SectionCardGeneric>
  </div>
</template>

<script>
import { CHART_PALETTE } from '@/services/utils/chart-colors.js'
import { formatBucketMonthLabels } from '@/components/insight/insight-helpers.js'
import { buildBreakdownChartData } from './capacity-helpers.js'
import { CAPACITY_BREAKDOWN_BY_VALUES } from '../insight-filters.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ToggleGroupGeneric from '@/components/generic/ToggleGroupGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import ChartGeneric from '@/components/prime-vue/ChartGeneric.vue'

const METRIC_VALUES = ['inflowPieces', 'outputPieces']

export default {
  name: 'CapacityBreakdownPanel',

  components: {
    SectionCardGeneric,
    ToggleGroupGeneric,
    BaseDataTable,
    ChartGeneric
  },

  props: {
    breakdown: {
      type: Object,
      default: null
    },
    by: {
      type: String,
      required: true
    },
    activeKeys: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },

  emits: ['change-by', 'select-group'],

  data() {
    return {
      metric: 'inflowPieces'
    }
  },

  computed: {
    rows() {
      return this.breakdown?.rows || []
    },

    byOptions() {
      return CAPACITY_BREAKDOWN_BY_VALUES.map((value) => ({ value, label: this.$t(`view.productionInsight.capacity.breakdownBy.${value}`) }))
    },

    metricOptions() {
      return METRIC_VALUES.map((value) => ({ value, label: this.$t(`view.productionInsight.capacity.breakdownMetric.${value}`) }))
    },

    chartTitle() {
      return this.$t('view.productionInsight.capacity.breakdownChartTitle', { by: this.$t(`view.productionInsight.capacity.breakdownBy.${this.by}`) })
    },

    columns() {
      return [
        { field: 'name', header: this.$t(`view.productionInsight.capacity.breakdownBy.${this.by}`), sortable: false, minWidth: '140px' },
        { field: 'unit', header: this.$t('view.productionInsight.capacity.breakdownColUnit'), sortable: false, minWidth: '80px' },
        { field: 'inflowPiecesPerMonth', header: this.$t('view.productionInsight.capacity.breakdownColInflow'), sortable: false, minWidth: '110px', align: 'right' },
        { field: 'outputPiecesPerMonth', header: this.$t('view.productionInsight.capacity.breakdownColOutput'), sortable: false, minWidth: '110px', align: 'right' },
        { field: 'netPiecesPerMonth', header: this.$t('view.productionInsight.capacity.breakdownColNet'), sortable: false, minWidth: '100px', align: 'right' },
        { field: 'activeWipPieces', header: this.$t('view.productionInsight.capacity.breakdownColActiveWipPieces'), sortable: false, minWidth: '110px', align: 'right' },
        { field: 'activeWipPlans', header: this.$t('view.productionInsight.capacity.breakdownColActiveWipPlans'), sortable: false, minWidth: '110px', align: 'right' }
      ]
    },

    chartData() {
      return buildBreakdownChartData(this.breakdown?.series, this.rows, this.metric, this.$t('view.productionInsight.capacity.breakdownOther'))
    },

    chartSeries() {
      return this.chartData.series.map((s) => ({ name: s.name, data: s.data }))
    },

    chartOptions() {
      return {
        chart: { type: 'bar', stacked: true, toolbar: { show: false } },
        colors: CHART_PALETTE,
        plotOptions: { bar: { columnWidth: '55%' } },
        xaxis: { categories: formatBucketMonthLabels(this.chartData.bucketEnds) },
        yaxis: { labels: { formatter: (v) => this.formatCount(v) } },
        legend: { position: 'bottom' },
        tooltip: { y: { formatter: (v) => this.formatCount(v) } }
      }
    }
  },

  methods: {
    unitLabel(unit) {
      if (!unit) return '—'
      return unit === 'mixed' ? this.$t('view.productionInsight.capacity.unitMixed') : unit
    },

    formatCount(value) {
      return value != null ? new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 }).format(value) : '—'
    },

    formatNet(value) {
      if (value == null) return '—'
      const formatted = this.formatCount(Math.abs(value))
      if (!value) return formatted
      return value > 0 ? `+${formatted}` : `−${formatted}`
    },

    // สุทธิ > 0 = งานเข้ามากกว่าผลิตออก (งานค้างโต) เตือนสีเหลือง, < 0 = ค้างลดลง สีเขียว
    netClass(value) {
      if (value == null || value === 0) return ''
      return value > 0 ? 'capacity-breakdown-panel__net--up' : 'capacity-breakdown-panel__net--down'
    },

    rowClass(data) {
      return { 'capacity-breakdown-panel__row--selected': this.activeKeys.includes(data.key) }
    },

    onRowClick(event) {
      const key = event?.data?.key
      if (key == null) return
      this.$emit('select-group', key)
    }
  }
}
</script>

<style lang="scss" scoped>
.capacity-breakdown-panel {
  min-width: 0;
  scroll-margin-top: calc(var(--mainbar-height) + 64px);
}

// legend-style SectionCardGeneric ต้องการ margin-top var(--sp-2xl) เสมอ — sibling-spacing ห้ามเล็กกว่านี้
.capacity-breakdown-panel > * + * {
  margin-top: var(--sp-2xl);
}

.capacity-breakdown-panel__toolbar {
  margin-bottom: var(--sp-md);
}

.capacity-breakdown-panel__hint {
  margin: 0 0 var(--sp-sm);
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
  font-style: italic;
}

.capacity-breakdown-panel__net--up {
  color: var(--base-warning);
  font-weight: 700;
}

.capacity-breakdown-panel__net--down {
  color: var(--base-green);
  font-weight: 700;
}

:deep(.capacity-breakdown-panel__row--selected) {
  background-color: var(--color-highlight-bg) !important;
}

:deep(.p-datatable-tbody > tr) {
  cursor: pointer;
}
</style>
