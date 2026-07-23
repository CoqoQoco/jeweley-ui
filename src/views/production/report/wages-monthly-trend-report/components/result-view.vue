<template>
  <div class="mt-2">
    <div class="stats-grid">
      <StatCardGeneric
        icon="bi-calendar-range"
        :value="report.rows.length"
        :label="$t('view.production.wagesMonthlyTrend.statMonths')"
        variant="main"
      />
      <StatCardGeneric
        icon="bi-cash-coin"
        :value="formatBahtValue(report.total.totalWages)"
        :label="$t('view.production.wagesMonthlyTrend.statTotalWages')"
        variant="green"
      />
      <StatCardGeneric
        icon="bi-graph-up-arrow"
        :value="formatBahtValue(report.total.avgWagesPerJob)"
        :label="$t('view.production.wagesMonthlyTrend.statAvgWages')"
        variant="grey"
      />
      <StatCardGeneric
        icon="bi-clipboard-check"
        :value="formatNumberValue(report.total.jobCount)"
        :label="$t('view.production.wagesMonthlyTrend.statTotalJobs')"
        variant="main"
      />
    </div>

    <SectionCardGeneric
      :title="$t('view.production.wagesMonthlyTrend.chartTitle')"
      icon="bi-graph-up"
      accent="main"
      headerStyle="legend"
      class="chart-card"
    >
      <ChartGeneric
        type="area"
        :series="chartSeries"
        :options="chartOptions"
        :height="320"
        :emptyText="$t('common.label.noData')"
      />

      <template v-if="forecast.hasEnoughData">
        <div class="forecast-stat-wrap">
          <StatCardGeneric
            icon="bi-graph-up-arrow"
            :value="formatBahtValue(forecast.projectedPoints[0].value)"
            :label="$t('view.production.wagesMonthlyTrend.forecastNextMonthLabel', { ym: forecast.projectedPoints[0].ym })"
            variant="warning"
          />
        </div>
        <p class="forecast-assumption">
          <i class="bi bi-info-circle"></i>
          {{ $t('view.production.wagesMonthlyTrend.forecastAssumption', { months: forecast.monthsUsed }) }}
        </p>
      </template>
      <div v-else class="forecast-empty">
        <i class="bi bi-info-circle"></i>
        <span>{{ $t('view.production.wagesMonthlyTrend.forecastNotEnoughData') }}</span>
      </div>
    </SectionCardGeneric>

    <SectionCardGeneric class="table-card">
      <BaseDataTable
        :items="report.rows"
        :columns="columns"
        :paginator="false"
        dataKey="ym"
      >
        <template #footer>
          <div class="result-footer">
            <span class="result-footer-label">{{ $t('view.production.wagesMonthlyTrend.totalLabel') }}</span>
            <div class="result-footer-values">
              <span class="result-footer-item">
                {{ $t('view.production.wagesMonthlyTrend.colJobCount') }}: {{ formatNumberValue(report.total.jobCount) }}
              </span>
              <span class="result-footer-item">
                {{ $t('view.production.wagesMonthlyTrend.colTotalWages') }}: {{ formatDecimal(report.total.totalWages) }}
              </span>
              <span class="result-footer-item">
                {{ $t('view.production.wagesMonthlyTrend.colAvgWages') }}: {{ formatDecimal(report.total.avgWagesPerJob) }}
              </span>
            </div>
          </div>
        </template>
      </BaseDataTable>
    </SectionCardGeneric>
  </div>
</template>

<script>
import { useWagesMonthlyTrendApiStore } from '@/stores/modules/api/production/wages-monthly-trend-api.js'
import { ExcelHelper } from '@/services/utils/excel-js.js'
import { warning } from '@/services/alert/sweetAlerts.js'
import { projectMonthlySeries } from '@/services/utils/forecast.js'
import { CHART_TOKENS } from '@/services/utils/chart-colors.js'

import StatCardGeneric from '@/components/generic/StatCardGeneric.vue'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ChartGeneric from '@/components/prime-vue/ChartGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

export default {
  name: 'WagesMonthlyTrendReportResultView',

  components: {
    StatCardGeneric,
    SectionCardGeneric,
    ChartGeneric,
    BaseDataTable
  },

  setup() {
    const wagesMonthlyTrendStore = useWagesMonthlyTrendApiStore()
    return { wagesMonthlyTrendStore }
  },

  props: {
    modelForm: {
      type: Object,
      default: null
    }
  },

  computed: {
    report() {
      return this.wagesMonthlyTrendStore.reportData
    },

    columns() {
      return [
        { field: 'ym', header: this.$t('view.production.wagesMonthlyTrend.colMonth'), sortable: false, minWidth: '110px' },
        { field: 'jobCount', header: this.$t('view.production.wagesMonthlyTrend.colJobCount'), sortable: false, minWidth: '110px', align: 'right', format: 'number' },
        { field: 'totalWages', header: this.$t('view.production.wagesMonthlyTrend.colTotalWages'), sortable: false, minWidth: '130px', align: 'right', format: 'decimal2' },
        { field: 'avgWagesPerJob', header: this.$t('view.production.wagesMonthlyTrend.colAvgWages'), sortable: false, minWidth: '120px', align: 'right', format: 'decimal2' }
      ]
    },

    forecast() {
      return projectMonthlySeries(this.report.rows.map((r) => ({ ym: r.ym, value: r.totalWages })))
    },

    chartSeries() {
      const actualData = this.report.rows.map((r) => r.totalWages)

      if (!this.forecast.hasEnoughData) {
        return [
          {
            name: this.$t('view.production.wagesMonthlyTrend.seriesWages'),
            data: actualData
          }
        ]
      }

      const projected = this.forecast.projectedPoints
      const actualPadded = actualData.concat(new Array(projected.length).fill(null))
      const forecastData = new Array(actualData.length - 1)
        .fill(null)
        .concat([actualData[actualData.length - 1]])
        .concat(projected.map((p) => p.value))

      return [
        {
          name: this.$t('view.production.wagesMonthlyTrend.seriesWages'),
          data: actualPadded
        },
        {
          name: this.$t('view.production.wagesMonthlyTrend.seriesForecast'),
          data: forecastData
        }
      ]
    },

    chartOptions() {
      const categories = this.report.rows
        .map((r) => r.ym)
        .concat(this.forecast.hasEnoughData ? this.forecast.projectedPoints.map((p) => p.ym) : [])

      const options = {
        xaxis: {
          categories
        },
        stroke: {
          curve: 'smooth'
        },
        yaxis: {
          labels: {
            formatter: (v) => new Intl.NumberFormat('th-TH').format(Math.round(v))
          }
        }
      }

      if (this.forecast.hasEnoughData) {
        options.colors = [CHART_TOKENS.primary, CHART_TOKENS.warning]
        options.stroke.width = [3, 3]
        options.stroke.dashArray = [0, 6]
        options.fill = { opacity: [1, 0] }
      }

      return options
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
      await this.wagesMonthlyTrendStore.fetchReport(this.modelForm)
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

    formatBahtValue(value) {
      return `${this.formatDecimal(value)} ${this.$t('view.production.wagesMonthlyTrend.unitBaht')}`
    },

    async exportExcel() {
      if (!this.report.rows || this.report.rows.length === 0) {
        warning('ไม่มีข้อมูลสำหรับส่งออก', 'ไม่พบข้อมูล')
        return
      }

      const columns = this.columns.map((col) => ({ header: col.header, key: col.field }))
      const filename = 'รายงาน-แนวโน้มค่าแรงรายเดือน.xlsx'

      await ExcelHelper.exportToExcel(this.report.rows, {
        filename,
        sheetName: 'WagesMonthlyTrend',
        columns
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

.result-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--sp-sm);
  width: 100%;
}

.result-footer-label {
  font-weight: 600;
  color: var(--base-font-color);
}

.result-footer-values {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-lg);
}

.result-footer-item {
  font-weight: 600;
  color: var(--base-font-color);
}

.forecast-stat-wrap {
  max-width: 320px;
  margin-top: var(--sp-lg);
}

.forecast-assumption {
  display: flex;
  align-items: center;
  gap: var(--sp-xs);
  margin: var(--sp-sm) 0 0;
  color: var(--base-sub-color);
  font-size: var(--fs-sm);
  font-style: italic;
}

.forecast-empty {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  margin-top: var(--sp-md);
  color: var(--base-sub-color);
  font-size: var(--fs-sm);
}
</style>
