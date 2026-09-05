<template>
  <div class="mt-2">
    <div class="stats-grid">
      <StatCardGeneric
        icon="bi-check-circle-fill"
        :value="report.summary.completedPlanCount"
        :label="$t('view.production.leadTime.stage.statCompleted')"
        variant="main"
      />
      <StatCardGeneric
        icon="bi-bar-chart-steps"
        :value="formatDaysValue(report.summary.medianTotalLeadDays)"
        :label="$t('view.production.leadTime.stage.statMedianTotal')"
        variant="green"
      />
      <StatCardGeneric
        icon="bi-exclamation-diamond-fill"
        :value="report.summary.bottleneckStatusName || '-'"
        :label="$t('view.production.leadTime.stage.statBottleneck')"
        variant="warning"
      />
      <StatCardGeneric
        icon="bi-file-earmark-x"
        :value="report.summary.plansWithNoStageCount"
        :label="$t('view.production.leadTime.stage.statNoStage')"
        variant="grey"
      />
    </div>

    <template v-if="hasBreakdown">
      <SectionCardGeneric
        :title="breakdownChartTitle"
        icon="bi-bar-chart-line"
        accent="main"
        headerStyle="legend"
        class="chart-card"
      >
        <ChartGeneric
          type="bar"
          :series="breakdownChartSeries"
          :options="breakdownChartOptions"
          :height="breakdownChartHeight"
          :emptyText="$t('common.label.noData')"
        />

        <p v-if="hasLowVolumeGroups" class="work-days-caveat">
          <i class="bi bi-info-circle"></i>
          {{ lowVolumeCaveatText }}
        </p>
      </SectionCardGeneric>

      <SectionCardGeneric
        :title="breakdownTableTitle"
        icon="bi-grid-3x3"
        accent="main"
        headerStyle="legend"
        class="table-card"
      >
        <BaseDataTable
          :items="breakdownMatrixRows"
          :columns="breakdownMatrixColumns"
          :paginator="false"
          dataKey="groupCode"
          :rowClass="breakdownRowClass"
        >
          <template #planCountTemplate="{ data }">
            <span class="plan-count-cell" :class="{ 'plan-count-cell--low': isLowVolume(data.planCount) }">
              <i v-if="isLowVolume(data.planCount)" class="bi bi-exclamation-triangle-fill"></i>
              {{ formatNumberValue(data.planCount) }}
            </span>
          </template>
        </BaseDataTable>
      </SectionCardGeneric>
    </template>

    <SectionCardGeneric
      :title="$t('view.production.leadTime.stage.chartAvgTitle')"
      icon="bi-diagram-3"
      accent="main"
      headerStyle="legend"
      class="chart-card"
    >
      <p class="chart-summary-line">
        <i class="bi bi-lightbulb-fill"></i>
        {{ summaryLineText }}
      </p>

      <ChartGeneric
        type="bar"
        :series="chartSeries"
        :options="chartOptions"
        :height="chartHeight"
        :emptyText="$t('common.label.noData')"
      />
    </SectionCardGeneric>

    <SectionCardGeneric
      :title="$t('view.production.leadTime.stage.mainTableTitle')"
      icon="bi-table"
      accent="main"
      headerStyle="legend"
      class="table-card"
    >
      <div class="table-toolbar">
        <CheckboxGeneric v-model="showDetail" :label="$t('view.production.leadTime.stage.toggleDetailLabel')" />
      </div>

      <p v-if="showDetail" class="work-days-caveat">
        <i class="bi bi-info-circle"></i>
        {{ $t('view.production.leadTime.stage.workDaysCaveat') }}
      </p>

      <BaseDataTable :items="sortedRows" :columns="columns" :paginator="false" dataKey="statusCode">
        <template #avgDaysTemplate="{ data }">
          <span class="avg-days-highlight">{{ formatDecimal1(data.avgDays) }}</span>
        </template>

        <template #medianDaysTemplate="{ data }">
          <span class="metric-highlight">{{ formatDecimal1(data.medianDays) }}</span>
        </template>

        <template #p90DaysTemplate="{ data }">
          <span class="metric-highlight">{{ formatDecimal1(data.p90Days) }}</span>
        </template>

        <template #shareOfTotalPercentTemplate="{ data }">
          <span class="share-value">{{ formatDecimal1(data.shareOfTotalPercent) }}%</span>
        </template>

        <template #medianWorkDaysTemplate="{ data }">
          <div class="work-days-cell" :class="{ 'work-days-cell--low': isLowReliability(data.workDataReliabilityPercent) }">
            <span>{{ formatDecimal1(data.medianWorkDays) }} {{ $t('view.production.leadTime.unitDays') }}</span>
            <span class="reliability-badge">
              <i v-if="isLowReliability(data.workDataReliabilityPercent)" class="bi bi-exclamation-triangle-fill"></i>
              {{ formatDecimal1(data.workDataReliabilityPercent) }}%
            </span>
          </div>
        </template>
      </BaseDataTable>
    </SectionCardGeneric>

    <SectionCardGeneric
      :title="$t('view.production.leadTime.stage.wipTitle')"
      icon="bi-hourglass-split"
      accent="main"
      headerStyle="legend"
      class="table-card"
    >
      <BaseDataTable :items="report.wipRows" :columns="wipColumns" :paginator="false" dataKey="statusCode" />
    </SectionCardGeneric>

    <SectionCardGeneric
      :title="$t('view.production.leadTime.stage.topStuckTitle')"
      icon="bi-exclamation-octagon"
      accent="main"
      headerStyle="legend"
      class="table-card"
    >
      <BaseDataTable :items="report.topStuckJobs" :columns="topStuckColumns" :paginator="false" dataKey="productionPlanId">
        <template #rankTemplate="{ index }">
          {{ index + 1 }}
        </template>

        <template #actionTemplate="{ data }">
          <router-link
            v-if="data.productionPlanId"
            :to="`/plan-order-tracking-update/${data.productionPlanId}`"
            class="btn btn-sm btn-green"
          >
            <i class="bi bi-eye"></i> {{ $t('common.btn.view') }}
          </router-link>
        </template>
      </BaseDataTable>
    </SectionCardGeneric>
  </div>
</template>

<script>
import { useStageLeadTimeApiStore } from '@/stores/modules/api/production/stage-lead-time-api.js'
import { ExcelHelper } from '@/services/utils/excel-js.js'
import { warning } from '@/services/alert/sweetAlerts.js'
import { CHART_TOKENS } from '@/services/utils/chart-colors.js'

import StatCardGeneric from '@/components/generic/StatCardGeneric.vue'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ChartGeneric from '@/components/prime-vue/ChartGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import CheckboxGeneric from '@/components/prime-vue/CheckboxGeneric.vue'

export default {
  name: 'LeadTimeStageResultView',

  components: {
    StatCardGeneric,
    SectionCardGeneric,
    ChartGeneric,
    BaseDataTable,
    CheckboxGeneric
  },

  setup() {
    const stageLeadTimeStore = useStageLeadTimeApiStore()
    return { stageLeadTimeStore }
  },

  props: {
    modelForm: {
      type: Object,
      default: null
    }
  },

  data() {
    return {
      showDetail: false,
      lowVolumeThreshold: 10
    }
  },

  computed: {
    report() {
      return this.stageLeadTimeStore.reportData
    },

    sortedRows() {
      return [...(this.report.rows || [])].sort(
        (a, b) => (b.avgDays || 0) - (a.avgDays || 0)
      )
    },

    chartHeight() {
      return Math.max(240, this.sortedRows.length * 40 + 80)
    },

    unitDaysLabel() {
      return this.$t('view.production.leadTime.unitDays')
    },

    chartSeries() {
      return [
        {
          name: this.$t('view.production.leadTime.stage.chartAvgSeries'),
          data: this.sortedRows.map((r) => Number((r.avgDays || 0).toFixed(1)))
        }
      ]
    },

    chartOptions() {
      return {
        plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: '60%' } },
        colors: [CHART_TOKENS.primary],
        xaxis: {
          categories: this.sortedRows.map((r) => r.statusName),
          labels: { formatter: (val) => `${val} ${this.unitDaysLabel}` }
        },
        dataLabels: {
          enabled: true,
          formatter: (val) => `${val} ${this.unitDaysLabel}`,
          style: { fontSize: '11px', colors: ['#fff'] }
        },
        tooltip: { y: { formatter: (val) => `${val} ${this.unitDaysLabel}` } }
      }
    },

    summaryLineText() {
      return this.$t('view.production.leadTime.stage.summaryLine', {
        avgTotalLeadDays: this.formatDecimal1(this.report.summary.avgTotalLeadDays),
        bottleneckStatusName: this.report.summary.bottleneckStatusName || '-'
      })
    },

    hasBreakdown() {
      return !!this.report.groupBy && this.report.groupBy !== 'none'
    },

    breakdownDimensionLabel() {
      const map = {
        productType: this.$t('view.production.leadTime.productType'),
        customerType: this.$t('view.production.leadTime.customerType'),
        gold: this.$t('view.production.leadTime.stage.groupByOptionGold'),
        goldSize: this.$t('view.production.leadTime.stage.groupByOptionGoldSize')
      }
      return map[this.report.groupBy] || ''
    },

    breakdownChartTitle() {
      return this.$t('view.production.leadTime.stage.breakdownChartTitle', { dimension: this.breakdownDimensionLabel })
    },

    breakdownTableTitle() {
      return this.$t('view.production.leadTime.stage.breakdownTableTitle', { dimension: this.breakdownDimensionLabel })
    },

    breakdownSortedRows() {
      return [...(this.report.breakdown || [])].sort(
        (a, b) => (b.avgTotalDays || 0) - (a.avgTotalDays || 0)
      )
    },

    hasLowVolumeGroups() {
      return this.breakdownSortedRows.some((r) => this.isLowVolume(r.planCount))
    },

    lowVolumeCaveatText() {
      return this.$t('view.production.leadTime.stage.lowVolumeCaveat', { threshold: this.lowVolumeThreshold })
    },

    breakdownChartHeight() {
      return Math.max(240, this.breakdownSortedRows.length * 40 + 80)
    },

    breakdownChartSeries() {
      return [
        {
          name: this.$t('view.production.leadTime.stage.breakdownChartSeries'),
          data: this.breakdownSortedRows.map((r) => Number((r.avgTotalDays || 0).toFixed(1)))
        }
      ]
    },

    breakdownChartOptions() {
      const rows = this.breakdownSortedRows
      return {
        plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: '60%', distributed: true } },
        colors: rows.map((r) => (this.isLowVolume(r.planCount) ? CHART_TOKENS.sub : CHART_TOKENS.primary)),
        legend: { show: false },
        xaxis: {
          categories: rows.map((r) => r.groupName),
          labels: { formatter: (val) => `${val} ${this.unitDaysLabel}` }
        },
        dataLabels: {
          enabled: true,
          formatter: (val) => `${val} ${this.unitDaysLabel}`,
          style: { fontSize: '11px', colors: ['#fff'] }
        },
        tooltip: {
          y: {
            formatter: (val, opts) => {
              const row = rows[opts?.dataPointIndex]
              const count = row ? row.planCount || 0 : 0
              return `${val} ${this.unitDaysLabel} (${this.$t('view.production.leadTime.stage.colPlanCount')}: ${count})`
            }
          }
        }
      }
    },

    breakdownDeptColumns() {
      const map = new Map()
      ;(this.report.breakdown || []).forEach((g) => {
        ;(g.stages || []).forEach((s) => {
          if (!map.has(s.statusCode)) {
            map.set(s.statusCode, { statusCode: s.statusCode, statusName: s.statusName })
          }
        })
      })
      return [...map.values()].sort((a, b) =>
        String(a.statusCode).localeCompare(String(b.statusCode), undefined, { numeric: true })
      )
    },

    breakdownMatrixColumns() {
      const cols = [
        { field: 'groupName', header: this.breakdownDimensionLabel, sortable: false, minWidth: '160px' },
        { field: 'planCount', header: this.$t('view.production.leadTime.stage.colPlanCount'), sortable: false, minWidth: '130px', align: 'right' },
        { field: 'avgTotalDays', header: this.$t('view.production.leadTime.stage.colAvgTotalDays'), sortable: false, minWidth: '170px', align: 'right', format: 'decimal1' }
      ]

      this.breakdownDeptColumns.forEach((dept) => {
        cols.push({
          field: `dept_${dept.statusCode}`,
          header: dept.statusName,
          sortable: false,
          minWidth: '130px',
          align: 'right',
          format: 'decimal1'
        })
      })

      return cols
    },

    breakdownMatrixRows() {
      return (this.report.breakdown || []).map((g) => {
        const row = {
          groupCode: g.groupCode,
          groupName: g.groupName,
          planCount: g.planCount,
          avgTotalDays: g.avgTotalDays
        }

        ;(g.stages || []).forEach((s) => {
          row[`dept_${s.statusCode}`] = s.avgDays
        })

        return row
      })
    },

    columns() {
      const baseColumns = [
        { field: 'statusName', header: this.$t('view.production.leadTime.stage.colDept'), sortable: false, minWidth: '160px' },
        { field: 'avgDays', header: this.$t('view.production.leadTime.stage.colAvgDays'), sortable: false, minWidth: '140px', align: 'right' },
        { field: 'visitCount', header: this.$t('view.production.leadTime.stage.colVisitCount'), sortable: false, minWidth: '140px', align: 'right', format: 'number' }
      ]

      if (!this.showDetail) {
        return baseColumns
      }

      return [
        ...baseColumns,
        { field: 'medianDays', header: this.$t('view.production.leadTime.stage.colMedianDays'), sortable: false, minWidth: '120px', align: 'right' },
        { field: 'p90Days', header: this.$t('view.production.leadTime.stage.colP90Days'), sortable: false, minWidth: '110px', align: 'right' },
        { field: 'shareOfTotalPercent', header: this.$t('view.production.leadTime.stage.colShare'), sortable: false, minWidth: '130px', align: 'right' },
        { field: 'medianWorkDays', header: this.$t('view.production.leadTime.stage.colMedianWorkDays'), sortable: false, minWidth: '190px', align: 'right' }
      ]
    },

    wipColumns() {
      return [
        { field: 'statusName', header: this.$t('view.production.leadTime.stage.colDept'), sortable: false, minWidth: '160px' },
        { field: 'wipCount', header: this.$t('view.production.leadTime.stage.colWipCount'), sortable: false, minWidth: '110px', align: 'right', format: 'number' },
        { field: 'avgAgeDays', header: this.$t('view.production.leadTime.stage.colAvgAgeDays'), sortable: false, minWidth: '130px', align: 'right', format: 'decimal1' },
        { field: 'maxAgeDays', header: this.$t('view.production.leadTime.stage.colMaxAgeDays'), sortable: false, minWidth: '130px', align: 'right', format: 'decimal1' }
      ]
    },

    topStuckColumns() {
      return [
        { field: 'rank', header: '#', sortable: false, minWidth: '50px', align: 'center' },
        { field: 'woText', header: this.$t('view.production.leadTime.stage.colWoText'), sortable: false, minWidth: '140px' },
        { field: 'productName', header: this.$t('view.production.leadTime.stage.colProductName'), sortable: false, minWidth: '160px' },
        { field: 'customerName', header: this.$t('view.production.leadTime.stage.colCustomerName'), sortable: false, minWidth: '150px' },
        { field: 'statusName', header: this.$t('view.production.leadTime.stage.colDept'), sortable: false, minWidth: '130px' },
        { field: 'ageDays', header: this.$t('view.production.leadTime.stage.colAgeDays'), sortable: false, minWidth: '120px', align: 'right', format: 'decimal1' },
        { field: 'requestDate', header: this.$t('view.production.leadTime.stage.colRequestDate'), sortable: false, minWidth: '120px', format: 'date' },
        { field: 'action', header: '', sortable: false, minWidth: '110px', align: 'center' }
      ]
    }
  },

  watch: {
    modelForm: {
      handler(val) {
        if (val) {
          this.fetchData()
        }
      },
      deep: true
    }
  },

  methods: {
    async fetchData() {
      await this.stageLeadTimeStore.fetchReport(this.modelForm)
    },

    isLowReliability(pct) {
      return (pct ?? 100) < 70
    },

    isLowVolume(planCount) {
      return (planCount || 0) < this.lowVolumeThreshold
    },

    breakdownRowClass(data) {
      return this.isLowVolume(data.planCount) ? 'row-low-volume' : null
    },

    formatDecimal1(value) {
      return new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      }).format(value || 0)
    },

    formatNumberValue(value) {
      return new Intl.NumberFormat('th-TH').format(value || 0)
    },

    formatDaysValue(value) {
      return `${this.formatDecimal1(value)} ${this.$t('view.production.leadTime.unitDays')}`
    },

    async exportExcel() {
      if (!this.report.rows || this.report.rows.length === 0) {
        warning(this.$t('view.production.leadTime.stage.noDataExportMsg'), this.$t('view.production.leadTime.stage.noDataExportTitle'))
        return
      }

      const sheets = [
        {
          data: this.sortedRows,
          sheetName: this.$t('view.production.leadTime.stage.sheetMain'),
          columns: [
            { header: this.$t('view.production.leadTime.stage.colDept'), key: 'statusName' },
            { header: this.$t('view.production.leadTime.stage.colVisitCount'), key: 'visitCount' },
            { header: this.$t('view.production.leadTime.stage.colMedianDays'), key: 'medianDays' },
            { header: this.$t('view.production.leadTime.stage.colP90Days'), key: 'p90Days' },
            { header: this.$t('view.production.leadTime.stage.colAvgDays'), key: 'avgDays' },
            { header: this.$t('view.production.leadTime.stage.colShare'), key: 'shareOfTotalPercent' },
            { header: this.$t('view.production.leadTime.stage.colMedianWorkDays'), key: 'medianWorkDays' },
            { header: this.$t('view.production.leadTime.stage.colReliability'), key: 'workDataReliabilityPercent' }
          ]
        },
        {
          data: this.report.wipRows,
          sheetName: this.$t('view.production.leadTime.stage.sheetWip'),
          columns: [
            { header: this.$t('view.production.leadTime.stage.colDept'), key: 'statusName' },
            { header: this.$t('view.production.leadTime.stage.colWipCount'), key: 'wipCount' },
            { header: this.$t('view.production.leadTime.stage.colAvgAgeDays'), key: 'avgAgeDays' },
            { header: this.$t('view.production.leadTime.stage.colMaxAgeDays'), key: 'maxAgeDays' }
          ]
        },
        {
          data: this.report.topStuckJobs,
          sheetName: this.$t('view.production.leadTime.stage.sheetTopStuck'),
          columns: [
            { header: this.$t('view.production.leadTime.stage.colWoText'), key: 'woText' },
            { header: this.$t('view.production.leadTime.stage.colProductName'), key: 'productName' },
            { header: this.$t('view.production.leadTime.stage.colCustomerName'), key: 'customerName' },
            { header: this.$t('view.production.leadTime.stage.colDept'), key: 'statusName' },
            { header: this.$t('view.production.leadTime.stage.colAgeDays'), key: 'ageDays' },
            { header: this.$t('view.production.leadTime.stage.colRequestDate'), key: 'requestDate' }
          ]
        }
      ]

      if (this.hasBreakdown && this.breakdownMatrixRows.length > 0) {
        sheets.push({
          data: this.breakdownMatrixRows,
          sheetName: this.$t('view.production.leadTime.stage.sheetBreakdown', { dimension: this.breakdownDimensionLabel }),
          columns: this.breakdownMatrixColumns.map((col) => ({ header: col.header, key: col.field }))
        })
      }

      await ExcelHelper.exportToExcelMultiSheet(sheets, {
        filename: `${this.$t('view.production.leadTime.stage.excelFileName')}.xlsx`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--sp-md);
  margin-bottom: var(--sp-lg);

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.chart-card,
.table-card {
  margin-bottom: var(--sp-lg);
}

.chart-summary-line {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  margin: 0 0 var(--sp-lg);
  padding: var(--sp-sm) var(--sp-md);
  background: var(--color-highlight-bg);
  border-radius: var(--radius-sm);
  color: var(--base-font-color);
  font-size: var(--fs-base);
  font-weight: 600;

  i {
    color: var(--base-font-color);
    font-size: var(--fs-lg);
    flex-shrink: 0;
  }
}

.table-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: var(--sp-md);
}

.work-days-caveat {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  margin: 0 0 var(--sp-md);
  padding: var(--sp-sm) var(--sp-md);
  background: var(--color-highlight-bg);
  border: 1px solid var(--base-warning);
  border-radius: var(--radius-sm);
  color: var(--base-font-color);
  font-size: var(--fs-sm);

  i {
    color: var(--base-warning);
    font-size: var(--fs-lg);
    flex-shrink: 0;
  }
}

.metric-highlight {
  font-weight: 700;
  color: var(--base-font-color);
}

.avg-days-highlight {
  font-weight: 700;
  font-size: var(--fs-lg);
  color: var(--base-font-color);
}

.share-value {
  font-weight: 700;
  color: var(--base-green);
}

.work-days-cell {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.reliability-badge {
  font-size: var(--fs-sm);
  color: var(--base-sub-color);

  i {
    color: var(--base-warning);
    margin-right: 2px;
  }
}

.work-days-cell--low {
  span:first-child {
    opacity: 0.6;
  }

  .reliability-badge {
    color: var(--base-warning);
    font-weight: 600;
  }
}

.plan-count-cell {
  font-weight: 600;
}

.plan-count-cell--low {
  color: var(--base-warning);
  font-weight: 700;

  i {
    margin-right: 2px;
  }
}

:deep(.row-low-volume) {
  opacity: 0.6;
  font-style: italic;
}
</style>
