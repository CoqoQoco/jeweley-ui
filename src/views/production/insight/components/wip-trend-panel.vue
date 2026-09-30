<!--
  wip-trend-panel — "พัฒนาการงานค้างแยกแผนก" (reportRef: trend) ของหมวด "งานค้างและคอขวด" — ยิง
  ProductionInsight/WipTrend ตามช่วงเวลา/bucket ที่เลือก (RangePresetGeneric หรือ custom จาก filter panel)
  วางเป็นชิ้นแรกในพื้นที่รายงาน (ก่อนกล่อง "ณ วันนี้" ทั้งหมด) — 3 ส่วน: (1) การ์ด sparkline ต่อแผนก
  (+การ์ด "รวม" ใบแรก) กดเลือกแผนกได้ (2) กราฟรายละเอียดแผนกที่เลือก (เส้น=งานค้าง, แท่ง=เข้า/ออก) +
  ประโยคสรุป (3) ตารางเปรียบเทียบทุกแผนก
-->
<template>
  <div id="insight-report-trend" class="wip-trend-panel">
    <SectionCardGeneric
      :title="$t('view.productionInsight.wip.trendCardsTitle')"
      :titleTip="$t('view.productionInsight.help.trendCardsTitle')"
      icon="bi-graph-up-arrow"
      accent="main"
      headerStyle="legend"
    >
      <p class="wip-trend-panel__hint">{{ $t('view.productionInsight.wip.trendCardsHint') }}</p>
      <div class="wip-trend-panel__cards">
        <WipTrendCard
          v-for="row in cardRows"
          :key="row.key"
          :card="row"
          :selected="row.key === selectedDeptKey"
          :bucket="bucket"
          @select="onSelectDept(row.key)"
        />
      </div>
    </SectionCardGeneric>

    <SectionCardGeneric
      v-if="selectedRow"
      :title="detailTitle"
      :titleTip="$t('view.productionInsight.help.trendDetailChart')"
      icon="bi-bar-chart-line"
      accent="main"
      headerStyle="legend"
    >
      <ChartGeneric type="line" :series="detailSeries" :options="detailOptions" :height="320" :loading="loading" :emptyText="$t('common.label.noData')" />
      <p class="wip-trend-panel__summary">{{ summaryText }}</p>
    </SectionCardGeneric>

    <SectionCardGeneric :title="$t('view.productionInsight.wip.trendTableTitle')" icon="bi-table" accent="main" headerStyle="legend">
      <div class="responsive-table-wrapper">
        <BaseDataTable :items="tableRows" :columns="tableColumns" :paginator="false" dataKey="key">
          <template #header-startWip>
            <span class="wip-trend-panel__col-header">
              {{ $t('view.productionInsight.wip.trendColStart') }}
              <InfoTipGeneric :text="$t('view.productionInsight.help.trendColStart')" position="bottom" tone="inverse" />
            </span>
          </template>
          <template #header-endWip>
            <span class="wip-trend-panel__col-header">
              {{ $t('view.productionInsight.wip.trendColEnd') }}
              <InfoTipGeneric :text="$t('view.productionInsight.help.trendColEnd')" position="bottom" tone="inverse" />
            </span>
          </template>
          <template #header-delta>
            <span class="wip-trend-panel__col-header">
              {{ $t('view.productionInsight.wip.trendColChange') }}
              <InfoTipGeneric :text="$t('view.productionInsight.help.trendColChange')" position="bottom" tone="inverse" />
            </span>
          </template>
          <template #header-deltaPercent>
            <span class="wip-trend-panel__col-header">
              {{ $t('view.productionInsight.wip.trendColChangePercent') }}
              <InfoTipGeneric :text="$t('view.productionInsight.help.trendColChangePercent')" position="bottom" tone="inverse" />
            </span>
          </template>
          <template #header-inflow>
            <span class="wip-trend-panel__col-header">
              {{ $t('view.productionInsight.wip.trendColInflow') }}
              <InfoTipGeneric :text="$t('view.productionInsight.help.trendColInflow')" position="bottom" tone="inverse" />
            </span>
          </template>
          <template #header-outflow>
            <span class="wip-trend-panel__col-header">
              {{ $t('view.productionInsight.wip.trendColOutflow') }}
              <InfoTipGeneric :text="$t('view.productionInsight.help.trendColOutflow')" position="bottom" tone="inverse" />
            </span>
          </template>
          <template #header-net>
            <span class="wip-trend-panel__col-header">
              {{ $t('view.productionInsight.wip.trendColNet') }}
              <InfoTipGeneric :text="$t('view.productionInsight.help.trendColNet')" position="bottom" tone="inverse" />
            </span>
          </template>
          <template #deltaTemplate="{ data }">
            <span :style="{ color: deltaColor(data.delta) }">{{ formatSignedCount(data.delta) }}</span>
          </template>
          <template #deltaPercentTemplate="{ data }">
            <span :style="{ color: deltaColor(data.delta) }">{{ formatSignedPercent(data.deltaPercent) }}</span>
          </template>
        </BaseDataTable>
      </div>
    </SectionCardGeneric>
  </div>
</template>

<script>
import { useProductionInsightApiStore } from '@/stores/modules/api/production/production-insight-api.js'
import { CHART_TOKENS } from '@/services/utils/chart-colors.js'
import { formatRangeLabel } from '@/services/utils/range-presets.js'
import {
  resolveDeltaVariant,
  resolveDeltaColorToken,
  resolveDefaultSelectedDept,
  resolveTrendSummaryVariant,
  sortDepartmentsByDeltaDesc
} from './wip-trend-helpers.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import InfoTipGeneric from '@/components/generic/InfoTipGeneric.vue'
import ChartGeneric from '@/components/prime-vue/ChartGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import WipTrendCard from './wip-trend-card.vue'

export default {
  name: 'WipTrendPanel',

  components: {
    SectionCardGeneric,
    InfoTipGeneric,
    ChartGeneric,
    BaseDataTable,
    WipTrendCard
  },

  setup() {
    const productionInsightStore = useProductionInsightApiStore()
    return { productionInsightStore }
  },

  props: {
    start: {
      type: Date,
      required: true
    },
    end: {
      type: Date,
      required: true
    },
    bucket: {
      type: String,
      default: 'week'
    }
  },

  data() {
    return {
      loading: false,
      buckets: [],
      departments: [],
      total: null,
      selectedDeptKey: null
    }
  },

  computed: {
    rangeLabel() {
      return formatRangeLabel(this.start, this.end)
    },

    cardRows() {
      const rows = []
      if (this.total) rows.push({ key: 'total', label: this.$t('view.productionInsight.wip.trendTotalLabel'), ...this.total })
      this.departments.forEach((d) => rows.push({ key: d.key, label: this.$t(`view.executive.department.${d.key}`), ...d }))
      return rows
    },

    selectedRow() {
      return this.cardRows.find((row) => row.key === this.selectedDeptKey) || null
    },

    detailTitle() {
      if (!this.selectedRow) return ''
      if (this.selectedRow.key === 'total') {
        return this.$t('view.productionInsight.wip.trendDetailTitleTotal', { range: this.rangeLabel })
      }
      return this.$t('view.productionInsight.wip.trendDetailTitleDept', { name: this.selectedRow.label, range: this.rangeLabel })
    },

    detailSeries() {
      if (!this.selectedRow) return []
      const series = this.selectedRow.series || []
      return [
        { name: this.$t('view.productionInsight.wip.trendSeriesWip'), type: 'line', data: series.map((p) => p.wip || 0) },
        { name: this.$t('view.productionInsight.wip.trendSeriesInflow'), type: 'bar', data: series.map((p) => p.inflow || 0) },
        { name: this.$t('view.productionInsight.wip.trendSeriesOutflow'), type: 'bar', data: series.map((p) => -(p.outflow || 0)) }
      ]
    },

    detailOptions() {
      const series = this.selectedRow?.series || []
      return {
        chart: { type: 'line', toolbar: { show: false } },
        colors: [CHART_TOKENS.primary, CHART_TOKENS.green, CHART_TOKENS.red],
        stroke: { width: [3, 0, 0], curve: 'smooth' },
        plotOptions: { bar: { columnWidth: '55%' } },
        xaxis: { categories: series.map((p) => this.bucketLabel(p.bucketEnd)) },
        yaxis: { labels: { formatter: (v) => this.formatCount(v) } },
        tooltip: { y: { formatter: (v) => this.formatCount(Math.abs(v)) } }
      }
    },

    summaryText() {
      if (!this.selectedRow) return ''
      const inflow = this.selectedRow.inflow || 0
      const outflow = this.selectedRow.outflow || 0
      const net = this.selectedRow.net ?? inflow - outflow
      const variant = resolveTrendSummaryVariant(inflow, outflow)
      return this.$t(`view.productionInsight.wip.trendSummary.${variant}`, {
        inflow: this.formatCount(inflow),
        outflow: this.formatCount(outflow),
        net: this.formatSignedCount(net)
      })
    },

    tableRows() {
      const rows = sortDepartmentsByDeltaDesc(this.departments).map((d) => ({ ...d, label: this.$t(`view.executive.department.${d.key}`) }))
      if (this.total) rows.push({ ...this.total, key: 'total', label: this.$t('view.productionInsight.wip.trendTotalLabel'), isTotal: true })
      return rows
    },

    // BaseDataTable/PrimeVue เรนเดอร์ทั้ง `header` prop และ `#header-<field>` slot คู่กันเสมอ (ไม่ทับกัน — ดู
    // node_modules/primevue/datatable/HeaderCell.vue) คอลัมน์ไหนมี custom header slot (label+ⓘ) ต้องเคลียร์
    // `header` prop ทิ้งเป็น '' ไม่งั้นหัวขึ้นซ้ำ 2 จุด (เหมือน gold-loss-dashboard reconcile-tab)
    tableColumns() {
      const fieldsWithCustomHeaderSlot = ['startWip', 'endWip', 'delta', 'deltaPercent', 'inflow', 'outflow', 'net']
      const cols = [
        { field: 'label', header: this.$t('view.productionInsight.wip.trendColDept'), sortable: false, minWidth: '140px' },
        { field: 'startWip', header: this.$t('view.productionInsight.wip.trendColStart'), sortable: false, minWidth: '90px', align: 'right' },
        { field: 'endWip', header: this.$t('view.productionInsight.wip.trendColEnd'), sortable: false, minWidth: '90px', align: 'right' },
        { field: 'delta', header: this.$t('view.productionInsight.wip.trendColChange'), sortable: false, minWidth: '90px', align: 'right' },
        { field: 'deltaPercent', header: this.$t('view.productionInsight.wip.trendColChangePercent'), sortable: false, minWidth: '80px', align: 'right' },
        { field: 'inflow', header: this.$t('view.productionInsight.wip.trendColInflow'), sortable: false, minWidth: '90px', align: 'right' },
        { field: 'outflow', header: this.$t('view.productionInsight.wip.trendColOutflow'), sortable: false, minWidth: '90px', align: 'right' },
        { field: 'net', header: this.$t('view.productionInsight.wip.trendColNet'), sortable: false, minWidth: '90px', align: 'right' }
      ]
      return cols.map((col) => (fieldsWithCustomHeaderSlot.includes(col.field) ? { ...col, header: '' } : col))
    }
  },

  watch: {
    start() {
      this.fetchTrend()
    },
    end() {
      this.fetchTrend()
    },
    bucket() {
      this.fetchTrend()
    }
  },

  methods: {
    formatCount(value) {
      return new Intl.NumberFormat('th-TH').format(value || 0)
    },

    formatSignedCount(value) {
      if (!value) return '± 0'
      const sign = value > 0 ? '+' : '−'
      return `${sign}${this.formatCount(Math.abs(value))}`
    },

    formatSignedPercent(value) {
      if (value === null || value === undefined) return '—'
      if (!value) return '0%'
      const sign = value > 0 ? '+' : '−'
      return `${sign}${this.formatCount(Math.abs(value))}%`
    },

    deltaColor(delta) {
      return resolveDeltaColorToken(resolveDeltaVariant(delta))
    },

    bucketLabel(bucketEnd) {
      const match = this.buckets.find((b) => b.end === bucketEnd)
      return match ? match.label : ''
    },

    onSelectDept(key) {
      this.selectedDeptKey = key
    },

    async fetchTrend() {
      this.loading = true
      const res = await this.productionInsightStore.fetchWipTrend({ start: this.start, end: this.end, bucket: this.bucket })
      this.buckets = res?.buckets || []
      this.departments = res?.departments || []
      this.total = res?.total || null
      this.selectedDeptKey = resolveDefaultSelectedDept(this.departments) || (this.total ? 'total' : null)
      this.loading = false
    }
  },

  mounted() {
    this.fetchTrend()
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.wip-trend-panel {
  scroll-margin-top: calc(var(--mainbar-height) + 64px);
  min-width: 0;
}

.wip-trend-panel > * + * {
  margin-top: var(--sp-lg);
}

.wip-trend-panel__hint {
  margin: 0 0 var(--sp-sm);
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
  font-style: italic;
}

.wip-trend-panel__cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  align-items: stretch;
  gap: var(--sp-md);

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.wip-trend-panel__summary {
  margin: var(--sp-md) 0 0;
  color: var(--base-sub-color);
  font-size: var(--fs-base);
}

.wip-trend-panel__col-header {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-xs);
}
</style>
