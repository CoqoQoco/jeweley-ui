<template>
  <div class="capacity-report-view">
    <!-- Controls Row -->
    <SectionCardGeneric
      :title="$t('view.production.dashboard.capacity.controlsTitle')"
      icon="bi-sliders"
      accent="main"
      headerStyle="legend"
      class="capacity-controls-card"
    >
      <div class="capacity-controls">
        <div>
          <span class="title-text">{{ $t('view.production.dashboard.capacity.bucketLabel') }}</span>
          <RadioGroupGeneric v-model="bucket" :options="bucketOptions" optionLabel="label" optionValue="value" :inline="true" />
        </div>

        <div>
          <span class="title-text">{{ $t('view.production.dashboard.capacity.dateRangeLabel') }}</span>
          <DateRangeGeneric
            :startDate="start"
            :endDate="end"
            :startPlaceholder="$t('common.field.startDate')"
            :endPlaceholder="$t('common.field.endDate')"
            @update:startDate="start = $event"
            @update:endDate="end = $event"
          />
        </div>

        <div>
          <span class="title-text">{{ $t('view.production.dashboard.capacity.groupByLabel') }}</span>
          <DropdownGeneric
            v-model="groupBy"
            :options="groupByOptions"
            optionLabel="label"
            optionValue="value"
            :ariaLabel="$t('view.production.dashboard.capacity.groupByLabel')"
          />
        </div>

        <div class="d-flex align-items-end justify-content-end">
          <ButtonGeneric
            variant="green"
            icon="bi-search"
            :label="$t('common.btn.search')"
            @click="fetchData"
          />
        </div>
      </div>
    </SectionCardGeneric>

    <!-- Stat Cards -->
    <div class="capacity-stats-grid">
      <StatCardGeneric
        icon="bi-diagram-3"
        :value="formatNumber(summary.totalPlans)"
        :label="$t('view.production.dashboard.capacity.statTotalPlans')"
        variant="main"
      />
      <StatCardGeneric
        icon="bi-box-seam"
        :value="formatNumber(summary.totalPieces)"
        :label="$t('view.production.dashboard.capacity.statTotalPieces')"
        variant="green"
      />
      <StatCardGeneric
        icon="bi-graph-up"
        :value="formatDecimal(summary.avgPlansPerBucket)"
        :label="$t('view.production.dashboard.capacity.statAvgPlans')"
        variant="main"
      />
      <StatCardGeneric
        icon="bi-bar-chart-line"
        :value="formatDecimal(summary.avgPiecesPerBucket)"
        :label="$t('view.production.dashboard.capacity.statAvgPieces')"
        variant="green"
      />
      <StatCardGeneric
        icon="bi-trophy"
        :value="summary.bestBucketLabel || '-'"
        :label="$t('view.production.dashboard.capacity.statBestBucket')"
        :subLabel="bestBucketSubLabel"
        variant="warning"
      />
    </div>

    <p v-if="hasPartialBucket" class="capacity-avg-note">
      <i class="bi bi-info-circle"></i>
      {{ $t('view.production.dashboard.capacity.avgNote') }}
    </p>

    <!-- Combo Chart -->
    <SectionCardGeneric
      :title="$t('view.production.dashboard.capacity.chartTitle')"
      icon="bi-bar-chart"
      accent="main"
      headerStyle="legend"
      class="capacity-chart-card"
    >
      <ChartGeneric
        type="line"
        :series="chartSeries"
        :options="chartOptions"
        :height="380"
        :emptyText="$t('common.label.noData')"
      />
    </SectionCardGeneric>

    <!-- Detail Table -->
    <SectionCardGeneric
      :title="$t('view.production.dashboard.capacity.tableTitle')"
      icon="bi-table"
      accent="main"
      headerStyle="legend"
      class="capacity-table-card"
    >
      <div class="table-toolbar">
        <ButtonGeneric
          variant="green"
          icon="bi-file-earmark-excel"
          :title="$t('common.btn.export')"
          @click="exportExcel"
        />
      </div>
      <BaseDataTable :items="tableRows" :columns="columns" :paginator="false" dataKey="key" />
    </SectionCardGeneric>
  </div>
</template>

<script>
import dayjs from 'dayjs'

import { useCapacityReportApiStore } from '@/stores/modules/api/production/capacity-report-api.js'
import { ExcelHelper } from '@/services/utils/excel-js.js'
import { warning } from '@/services/alert/sweetAlerts.js'
import { CHART_TOKENS, CHART_PALETTE } from '@/services/utils/chart-colors.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import StatCardGeneric from '@/components/generic/StatCardGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import ChartGeneric from '@/components/prime-vue/ChartGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import DateRangeGeneric from '@/components/prime-vue/DateRangeGeneric.vue'
import RadioGroupGeneric from '@/components/prime-vue/RadioGroupGeneric.vue'

export default {
  name: 'CapacityReportView',

  components: {
    SectionCardGeneric,
    StatCardGeneric,
    ButtonGeneric,
    ChartGeneric,
    BaseDataTable,
    DropdownGeneric,
    DateRangeGeneric,
    RadioGroupGeneric
  },

  setup() {
    const capacityStore = useCapacityReportApiStore()
    return { capacityStore }
  },

  props: {
    sharedFilter: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    return {
      bucket: 'month',
      // Default: last 12 whole months, ending today (never request future dates —
      // on the weekly view a future end date makes the backend emit empty future
      // weeks that render as a misleading drop-off at the end of the chart).
      start: dayjs().subtract(11, 'month').startOf('month').toDate(),
      end: dayjs().toDate()
    }
  },

  computed: {
    report() {
      return this.capacityStore.reportData
    },

    summary() {
      return this.report.summary || {}
    },

    bestBucketSubLabel() {
      if (this.summary.bestBucketPlans === undefined || this.summary.bestBucketPlans === null) return ''
      return `${this.$t('view.production.dashboard.capacity.statBestBucketSub')}: ${this.formatNumber(this.summary.bestBucketPlans)}`
    },

    bucketOptions() {
      return [
        { value: 'week', label: this.$t('view.production.dashboard.capacity.bucketWeek') },
        { value: 'month', label: this.$t('view.production.dashboard.capacity.bucketMonth') }
      ]
    },

    groupByOptions() {
      return [
        { value: 'none', label: this.$t('view.production.dashboard.capacity.groupNone') },
        { value: 'gold', label: this.$t('view.production.dashboard.capacity.groupGold') },
        { value: 'goldSize', label: this.$t('view.production.dashboard.capacity.groupGoldSize') },
        { value: 'productType', label: this.$t('view.production.dashboard.capacity.groupProductType') },
        { value: 'customerType', label: this.$t('view.production.dashboard.capacity.groupCustomerType') }
      ]
    },

    isGrouped() {
      return !!this.report.groupBy && this.report.groupBy !== 'none'
    },

    bucketKeys() {
      return (this.report.buckets || []).map((b) => b.key)
    },

    bucketLabels() {
      return (this.report.buckets || []).map((b) => b.label)
    },

    // Index of the bucket covering today (backend flags it isPartial — its data
    // is by definition incomplete). Guard for older API responses that don't
    // send the field yet: undefined is treated as false via findIndex's !! check.
    partialBucketIndex() {
      return (this.report.buckets || []).findIndex((b) => !!b.isPartial)
    },

    hasPartialBucket() {
      return this.partialBucketIndex !== -1
    },

    partialBucketLabel() {
      return this.hasPartialBucket ? this.bucketLabels[this.partialBucketIndex] : null
    },

    planSeries() {
      if (!this.isGrouped) {
        return [
          {
            name: this.$t('view.production.dashboard.capacity.planCountSeries'),
            type: 'column',
            data: (this.report.buckets || []).map((b) => b.planCount || 0)
          }
        ]
      }

      return (this.report.series || []).map((s) => ({
        name: s.groupName,
        type: 'column',
        data: this.bucketKeys.map((key) => {
          const point = (s.points || []).find((p) => p.bucketKey === key)
          return point ? point.planCount || 0 : 0
        })
      }))
    },

    pieceLineSeries() {
      return {
        name: this.$t('view.production.dashboard.capacity.pieceCountSeries'),
        type: 'line',
        data: (this.report.buckets || []).map((b) => b.pieceCount || 0)
      }
    },

    chartSeries() {
      return [...this.planSeries, this.pieceLineSeries]
    },

    chartColors() {
      const barColors = this.isGrouped
        ? this.planSeries.map((_, idx) => CHART_PALETTE[idx % CHART_PALETTE.length])
        : [CHART_TOKENS.primary]
      return [...barColors, CHART_TOKENS.green]
    },

    chartOptions() {
      const planLabel = this.$t('view.production.dashboard.capacity.planCountSeries')
      const pieceLabel = this.$t('view.production.dashboard.capacity.pieceCountSeries')

      return {
        chart: { type: 'line', stacked: this.isGrouped },
        colors: this.chartColors,
        stroke: {
          width: [...this.planSeries.map(() => 0), 3],
          curve: 'smooth'
        },
        // Discrete marker on the partial bucket's piece-count point — hollow/lighter
        // treatment so a barely-started period doesn't read as a real data point.
        markers: this.hasPartialBucket
          ? {
              discrete: [
                {
                  seriesIndex: this.chartSeries.length - 1,
                  dataPointIndex: this.partialBucketIndex,
                  fillColor: '#fff',
                  strokeColor: CHART_TOKENS.green,
                  size: 6,
                  shape: 'circle'
                }
              ]
            }
          : undefined,
        xaxis: {
          categories: this.bucketLabels,
          labels: { style: { fontSize: '10px' }, rotate: -45 }
        },
        yaxis: [
          ...this.planSeries.map((_, idx) => ({
            show: idx === 0,
            title: idx === 0 ? { text: planLabel } : undefined,
            labels: { formatter: (v) => this.formatNumber(v) }
          })),
          {
            opposite: true,
            title: { text: pieceLabel },
            labels: { formatter: (v) => this.formatNumber(v) }
          }
        ],
        // Shade the whole partial bucket (bars + line) so it's obvious that
        // period's data is still incomplete, not a real drop in output.
        annotations: this.hasPartialBucket
          ? {
              xaxis: [
                {
                  x: this.partialBucketLabel,
                  borderColor: CHART_TOKENS.sub,
                  fillColor: CHART_TOKENS.sub,
                  opacity: 0.1,
                  label: {
                    text: this.$t('view.production.dashboard.capacity.partialBucketBadge'),
                    borderColor: CHART_TOKENS.sub,
                    style: { color: '#fff', background: CHART_TOKENS.sub, fontSize: '10px' }
                  }
                }
              ]
            }
          : undefined,
        dataLabels: { enabled: false },
        tooltip: { shared: true, intersect: false },
        legend: { show: true, position: 'top' }
      }
    },

    tableRows() {
      return (this.report.buckets || []).map((b) => ({
        key: b.key,
        label: b.isPartial
          ? `${b.label} ${this.$t('view.production.dashboard.capacity.partialBucketSuffix')}`
          : b.label,
        isPartial: !!b.isPartial,
        start: b.start,
        end: b.end,
        planCount: b.planCount || 0,
        pieceCount: b.pieceCount || 0
      }))
    },

    columns() {
      return [
        { field: 'label', header: this.$t('view.production.dashboard.capacity.colBucket'), sortable: false, minWidth: '140px' },
        { field: 'start', header: this.$t('common.field.startDate'), sortable: false, minWidth: '110px', format: 'date' },
        { field: 'end', header: this.$t('common.field.endDate'), sortable: false, minWidth: '110px', format: 'date' },
        { field: 'planCount', header: this.$t('view.production.dashboard.capacity.colPlanCount'), sortable: false, minWidth: '100px', align: 'right', format: 'number' },
        { field: 'pieceCount', header: this.$t('view.production.dashboard.capacity.colPieceCount'), sortable: false, minWidth: '100px', align: 'right', format: 'number' }
      ]
    }
  },

  mounted() {
    this.fetchData()
  },

  methods: {
    async fetchData() {
      await this.capacityStore.fetchReport({
        bucket: this.bucket,
        start: this.start,
        end: this.end,
        groupBy: this.groupBy,
        ...this.sharedFilter
      })
    },

    formatNumber(value) {
      if (!value && value !== 0) return '0'
      return new Intl.NumberFormat('th-TH').format(value)
    },

    formatDecimal(value) {
      return new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      }).format(value || 0)
    },

    async exportExcel() {
      if (!this.tableRows.length) {
        warning(this.$t('view.production.dashboard.exportNoDataMsg'))
        return
      }

      const filename = `${this.$t('view.production.dashboard.capacity.exportFilename')}-${this.report.bucket}.xlsx`

      await ExcelHelper.exportToExcel(this.tableRows, {
        filename,
        sheetName: 'Capacity',
        columns: [
          { header: this.$t('view.production.dashboard.capacity.colBucket'), key: 'label' },
          { header: this.$t('common.field.startDate'), key: 'start' },
          { header: this.$t('common.field.endDate'), key: 'end' },
          { header: this.$t('view.production.dashboard.capacity.colPlanCount'), key: 'planCount' },
          { header: this.$t('view.production.dashboard.capacity.colPieceCount'), key: 'pieceCount' }
        ]
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/mixin.scss';

.capacity-report-view {
  .capacity-controls-card {
    margin-bottom: var(--sp-lg);
  }

  .capacity-controls {
    @include form-row-grid(4);
  }

  .capacity-stats-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: var(--sp-md);
    margin-bottom: var(--sp-sm);

    @media (max-width: 1024px) {
      grid-template-columns: repeat(3, 1fr);
    }

    @media (max-width: 600px) {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .capacity-avg-note {
    display: flex;
    align-items: center;
    gap: var(--sp-xs);
    margin: 0 0 var(--sp-lg);
    color: var(--base-sub-color);
    font-size: var(--fs-sm);
    font-style: italic;
  }

  .capacity-chart-card,
  .capacity-table-card {
    margin-bottom: var(--sp-lg);
  }

  .table-toolbar {
    display: flex;
    justify-content: flex-end;
    margin-bottom: var(--sp-sm);
  }
}
</style>
