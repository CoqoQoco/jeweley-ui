<template>
  <div class="mt-2">
    <div class="note-banner">
      <i class="bi bi-info-circle-fill"></i>
      <span>{{ $t('view.production.goldLossByWorkerAllStages.noteBanner') }}</span>
    </div>

    <div class="stats-grid">
      <StatCardGeneric
        icon="bi-people-fill"
        :value="formatNumberValue(report.summary.workerCount)"
        :label="$t('view.production.goldLossByWorkerAllStages.statWorkers')"
        variant="main"
      />
      <StatCardGeneric
        icon="bi-clipboard-data"
        :value="formatNumberValue(report.summary.jobCount)"
        :label="$t('view.production.goldLossByWorkerAllStages.statJobs')"
        variant="main"
      />
      <StatCardGeneric
        icon="bi-calendar-range"
        :value="periodLabel"
        :label="$t('view.production.goldLossByWorkerAllStages.statPeriod')"
        variant="green"
      />
      <StatCardGeneric
        icon="bi-question-circle-fill"
        :value="formatPercentValue(report.summary.rowsMissingWorkerPercent)"
        :subLabel="$t('view.production.goldLossByWorkerAllStages.colJobCount') + ': ' + formatNumberValue(report.summary.rowsMissingWorkerCount)"
        :label="$t('view.production.goldLossByWorkerAllStages.statMissingWorker')"
        variant="warning"
      />
    </div>

    <SectionCardGeneric
      :title="$t('view.production.goldLossByWorkerAllStages.monthlyTopTitle')"
      icon="bi-trophy"
      accent="main"
      headerStyle="legend"
      class="section-card-block"
    >
      <div class="dept-filter-row">
        <span class="title-text">{{ $t('view.production.goldLossByWorkerAllStages.department') }}</span>
        <DropdownGeneric
          v-model="monthlyTopDept"
          :options="departmentFilterOptions"
          optionLabel="label"
          optionValue="value"
          :placeholder="$t('common.label.all')"
          :showClear="true"
        />
      </div>

      <BaseDataTable :items="filteredMonthlyTop" :columns="monthlyTopColumns" :paginator="false" dataKey="rowKey">
        <template #ymTemplate="{ data }">{{ formatYearMonth(data.year, data.month) }}</template>
        <template #lossPercentTemplate="{ data }">
          <div class="text-right">{{ formatPercentValue(data.lossPercent) }}</div>
        </template>
      </BaseDataTable>
    </SectionCardGeneric>

    <SectionCardGeneric
      :title="$t('view.production.goldLossByWorkerAllStages.mainTableTitle')"
      icon="bi-table"
      accent="main"
      headerStyle="legend"
      class="section-card-block"
    >
      <BaseDataTable
        :items="sortedRows"
        :columns="mainColumns"
        :paginator="false"
        dataKey="rowKey"
        :rowClass="rowClassMain"
      >
        <template #workerNameTemplate="{ data }">
          <span>{{ data.workerName }}</span>
          <span v-if="data.isBelowMinJobs" class="badge-below-min">
            {{ $t('view.production.goldLossByWorkerAllStages.badgeBelowMinJobs') }}
          </span>
        </template>
        <template #lossPercentTemplate="{ data }">
          <div class="text-right">{{ formatPercentValue(data.lossPercent) }}</div>
        </template>
        <template #stageAvgLossPercentTemplate="{ data }">
          <div class="text-right">{{ formatPercentValue(data.stageAvgLossPercent) }}</div>
        </template>
        <template #diffFromStageAvgPercentTemplate="{ data }">
          <div class="text-right" :class="diffClass(data)">{{ formatSignedPercentValue(data.diffFromStageAvgPercent) }}</div>
        </template>
        <template #rankInStageTemplate="{ data }">
          <div class="text-center">{{ rankLabel(data) }}</div>
        </template>
      </BaseDataTable>
    </SectionCardGeneric>

    <SectionCardGeneric
      :title="$t('view.production.goldLossByWorkerAllStages.chartTitle')"
      icon="bi-graph-up"
      accent="main"
      headerStyle="legend"
      class="section-card-block"
    >
      <div class="dept-filter-row">
        <span class="title-text">{{ $t('view.production.goldLossByWorkerAllStages.department') }}</span>
        <DropdownGeneric
          v-model="trendDept"
          :options="departmentFilterOptions"
          optionLabel="label"
          optionValue="value"
        />
      </div>

      <ChartGeneric
        type="line"
        :series="trendChartSeries"
        :options="trendChartOptions"
        :height="360"
        :emptyText="$t('common.label.noData')"
      />
    </SectionCardGeneric>
  </div>
</template>

<script>
import { useGoldLossByWorkerApiStore } from '@/stores/modules/api/production/gold-loss-by-worker-api.js'
import { ExcelHelper } from '@/services/utils/excel-js.js'
import { warning } from '@/services/alert/sweetAlerts.js'
import { formatDate, formatYearMonth } from '@/services/utils/dayjs.js'

import StatCardGeneric from '@/components/generic/StatCardGeneric.vue'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ChartGeneric from '@/components/prime-vue/ChartGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'

export default {
  name: 'GoldLossByWorkerReportResultView',

  components: {
    StatCardGeneric,
    SectionCardGeneric,
    ChartGeneric,
    BaseDataTable,
    DropdownGeneric
  },

  setup() {
    const goldLossByWorkerStore = useGoldLossByWorkerApiStore()
    return { goldLossByWorkerStore }
  },

  props: {
    modelForm: {
      type: Object,
      default: null
    }
  },

  data() {
    return {
      monthlyTopDept: null,
      trendDept: null
    }
  },

  computed: {
    report() {
      return this.goldLossByWorkerStore.reportData
    },

    periodLabel() {
      const { periodStart, periodEnd } = this.report.summary
      if (!periodStart || !periodEnd) return '-'
      return `${formatDate(periodStart)} - ${formatDate(periodEnd)}`
    },

    departmentFilterOptions() {
      return this.report.summary.stageSummaries.map((s) => ({
        value: s.statusCode,
        label: s.statusName
      }))
    },

    workerNameByCode() {
      const map = {}
      this.report.rows.forEach((r) => {
        map[r.workerCode] = r.workerName
      })
      return map
    },

    sortedRows() {
      return [...this.report.rows]
        .map((r) => ({ ...r, rowKey: `${r.statusCode}-${r.workerCode}` }))
        .sort((a, b) => {
          if (a.statusCode !== b.statusCode) return a.statusCode - b.statusCode
          const rankA = a.isBelowMinJobs || !a.rankInStage ? Infinity : a.rankInStage
          const rankB = b.isBelowMinJobs || !b.rankInStage ? Infinity : b.rankInStage
          return rankA - rankB
        })
    },

    filteredMonthlyTop() {
      const rows = this.report.monthlyTop
        .map((r) => ({ ...r, rowKey: `${r.year}-${r.month}-${r.statusCode}-${r.workerCode}` }))
        .filter((r) => !this.monthlyTopDept || r.statusCode === this.monthlyTopDept)

      return rows.sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year
        if (a.month !== b.month) return b.month - a.month
        return a.statusCode - b.statusCode
      })
    },

    monthlyTopColumns() {
      return [
        { field: 'ym', header: this.$t('view.production.goldLossByWorkerAllStages.colYearMonth'), sortable: false, minWidth: '100px' },
        { field: 'statusName', header: this.$t('view.production.goldLossByWorkerAllStages.colDept'), sortable: false, minWidth: '110px' },
        { field: 'workerCode', header: this.$t('view.production.goldLossByWorkerAllStages.colWorkerCode'), sortable: false, minWidth: '110px' },
        { field: 'workerName', header: this.$t('view.production.goldLossByWorkerAllStages.colWorkerName'), sortable: false, minWidth: '160px' },
        { field: 'lossPercent', header: this.$t('view.production.goldLossByWorkerAllStages.colLossPercent'), sortable: false, minWidth: '100px', align: 'right' },
        { field: 'jobCount', header: this.$t('view.production.goldLossByWorkerAllStages.colJobCount'), sortable: false, minWidth: '100px', align: 'right', format: 'number' }
      ]
    },

    mainColumns() {
      return [
        { field: 'statusName', header: this.$t('view.production.goldLossByWorkerAllStages.colDept'), sortable: false, minWidth: '110px' },
        { field: 'workerCode', header: this.$t('view.production.goldLossByWorkerAllStages.colWorkerCode'), sortable: false, minWidth: '110px' },
        { field: 'workerName', header: this.$t('view.production.goldLossByWorkerAllStages.colWorkerName'), sortable: false, minWidth: '180px' },
        { field: 'jobCount', header: this.$t('view.production.goldLossByWorkerAllStages.colJobCount'), sortable: false, minWidth: '90px', align: 'right', format: 'number' },
        { field: 'sumGoldWeightSend', header: this.$t('view.production.goldLossByWorkerAllStages.colSumSend'), sortable: false, minWidth: '110px', align: 'right', format: 'decimal2' },
        { field: 'sumGoldWeightCheck', header: this.$t('view.production.goldLossByWorkerAllStages.colSumCheck'), sortable: false, minWidth: '110px', align: 'right', format: 'decimal2' },
        { field: 'rawLoss', header: this.$t('view.production.goldLossByWorkerAllStages.colRawLoss'), sortable: false, minWidth: '130px', align: 'right', format: 'decimal2' },
        { field: 'lossPercent', header: this.$t('view.production.goldLossByWorkerAllStages.colLossPercent'), sortable: false, minWidth: '100px', align: 'right' },
        { field: 'stageAvgLossPercent', header: this.$t('view.production.goldLossByWorkerAllStages.colStageAvg'), sortable: false, minWidth: '100px', align: 'right' },
        { field: 'diffFromStageAvgPercent', header: this.$t('view.production.goldLossByWorkerAllStages.colDiffFromAvg'), sortable: false, minWidth: '150px', align: 'right' },
        { field: 'rankInStage', header: this.$t('view.production.goldLossByWorkerAllStages.colRank'), sortable: false, minWidth: '110px', align: 'center' }
      ]
    },

    trendChartCategories() {
      if (!this.trendDept) return []
      const set = new Set(
        this.report.monthlyRows
          .filter((r) => r.statusCode === this.trendDept)
          .map((r) => `${r.year}-${String(r.month).padStart(2, '0')}`)
      )
      return [...set].sort()
    },

    trendChartSeries() {
      if (!this.trendDept) return []
      const byWorker = {}
      this.report.monthlyRows
        .filter((r) => r.statusCode === this.trendDept)
        .forEach((r) => {
          const code = r.workerCode || '-'
          const catKey = `${r.year}-${String(r.month).padStart(2, '0')}`
          if (!byWorker[code]) byWorker[code] = {}
          byWorker[code][catKey] = r.lossPercent
        })

      return Object.keys(byWorker).map((code) => ({
        name: this.workerNameByCode[code] ? `${code} - ${this.workerNameByCode[code]}` : code,
        data: this.trendChartCategories.map((catKey) => {
          const value = byWorker[code][catKey]
          return value === undefined || value === null ? null : value
        })
      }))
    },

    trendChartOptions() {
      return {
        xaxis: {
          categories: this.trendChartCategories.map((catKey) => {
            const [y, m] = catKey.split('-')
            return formatYearMonth(Number(y), Number(m))
          })
        },
        stroke: { curve: 'smooth', width: 2 },
        yaxis: {
          labels: {
            formatter: (v) => `${Number(v).toFixed(2)}%`
          }
        }
      }
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
    },

    report() {
      this.ensureDeptFilterDefault()
    }
  },

  methods: {
    async fetchData() {
      await this.goldLossByWorkerStore.fetchReport(this.modelForm)
    },

    ensureDeptFilterDefault() {
      const options = this.departmentFilterOptions
      if (!options.some((o) => o.value === this.trendDept)) {
        this.trendDept = options.length ? options[0].value : null
      }
      if (this.monthlyTopDept && !options.some((o) => o.value === this.monthlyTopDept)) {
        this.monthlyTopDept = null
      }
    },

    formatDecimal(value) {
      return new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value || 0)
    },

    formatNumberValue(value) {
      return new Intl.NumberFormat('th-TH').format(value || 0)
    },

    formatPercentValue(value) {
      return `${this.formatDecimal(value)}%`
    },

    formatSignedPercentValue(value) {
      const num = value || 0
      const sign = num > 0 ? '+' : ''
      return `${sign}${this.formatDecimal(num)}%`
    },

    diffClass(data) {
      if (!data.diffFromStageAvgPercent) return ''
      return data.diffFromStageAvgPercent > 0 ? 'diff-worse' : 'diff-better'
    },

    rankLabel(data) {
      return data.isBelowMinJobs || !data.rankInStage ? '-' : data.rankInStage
    },

    rowClassMain(data) {
      return data.isBelowMinJobs ? 'row-below-min' : null
    },

    formatYearMonth,

    async exportExcel() {
      if (!this.sortedRows.length) {
        warning(
          this.$t('view.production.goldLossByWorkerAllStages.noDataExportMsg'),
          this.$t('view.production.goldLossByWorkerAllStages.noDataExportTitle')
        )
        return
      }

      const columns = this.mainColumns.map((col) => ({ header: col.header, key: col.field }))
      const filename = `${this.$t('view.production.goldLossByWorkerAllStages.excelFileName')}.xlsx`

      await ExcelHelper.exportToExcel(this.sortedRows, {
        filename,
        sheetName: 'GoldLossByWorker',
        columns
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';

.note-banner {
  display: flex;
  align-items: flex-start;
  gap: var(--sp-sm);
  background: var(--color-highlight-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--sp-md) var(--sp-lg);
  margin-bottom: var(--sp-lg);
  color: var(--base-font-color);
  font-size: var(--fs-base);
  line-height: var(--lh-md);

  i {
    margin-top: 2px;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--sp-md);
  margin-bottom: var(--sp-lg);

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.section-card-block {
  margin-bottom: var(--sp-lg);
}

.dept-filter-row {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  max-width: 320px;
  margin-bottom: var(--sp-md);

  .title-text {
    white-space: nowrap;
  }
}

.badge-below-min {
  display: inline-block;
  margin-left: var(--sp-sm);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  background: var(--base-warning);
  color: var(--base-font-color);
  font-size: var(--fs-sm);
  font-weight: 600;
}

.diff-worse {
  color: var(--base-red);
  font-weight: 700;
}

.diff-better {
  color: var(--base-green);
  font-weight: 700;
}

:deep(.row-below-min) {
  opacity: 0.55;
  font-style: italic;
}
</style>
