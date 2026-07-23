<template>
  <div class="mt-2">
    <div class="stats-grid">
      <StatCardGeneric
        icon="bi-calendar-range"
        :value="report.rows.length"
        :label="$t('view.production.castLossTrend.statMonths')"
        variant="main"
      />
      <StatCardGeneric
        icon="bi-percent"
        :value="formatPercentValue(report.total.castLossPct)"
        :label="$t('view.production.castLossTrend.statAvgLoss')"
        variant="main"
      />
      <StatCardGeneric
        icon="bi-box-seam"
        :value="formatWeightValue(report.total.sumCastWeight)"
        :label="$t('view.production.castLossTrend.statTotalCast')"
        variant="green"
      />
      <StatCardGeneric
        icon="bi-arrow-up-circle"
        :value="formatWeightValue(report.total.sumCastOver)"
        :label="$t('view.production.castLossTrend.statTotalOver')"
        variant="grey"
      />
    </div>

    <SectionCardGeneric
      :title="$t('view.production.castLossTrend.chartTitle')"
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
    </SectionCardGeneric>

    <SectionCardGeneric class="table-card">
      <BaseDataTable
        :items="report.rows"
        :columns="columns"
        :paginator="false"
        dataKey="ym"
      >
        <template #castLossPctTemplate="{ data }">
          <div class="text-right">{{ formatPercentValue(data.castLossPct) }}</div>
        </template>

        <template #castOverPctTemplate="{ data }">
          <div class="text-right">{{ formatPercentValue(data.castOverPct) }}</div>
        </template>

        <template #footer>
          <div class="result-footer">
            <span class="result-footer-label">{{ $t('view.production.castLossTrend.totalLabel') }}</span>
            <div class="result-footer-values">
              <span class="result-footer-item">
                {{ $t('view.production.castLossTrend.colBookCount') }}: {{ formatNumberValue(report.total.bookCount) }}
              </span>
              <span class="result-footer-item">
                {{ $t('view.production.castLossTrend.colCastWeight') }}: {{ formatDecimal(report.total.sumCastWeight) }}
              </span>
              <span class="result-footer-item">
                {{ $t('view.production.castLossTrend.colCastLoss') }}: {{ formatDecimal(report.total.sumCastLoss) }}
              </span>
              <span class="result-footer-item">
                {{ $t('view.production.castLossTrend.colLossPct') }}: {{ formatPercentValue(report.total.castLossPct) }}
              </span>
              <span class="result-footer-item">
                {{ $t('view.production.castLossTrend.colOver') }}: {{ formatDecimal(report.total.sumCastOver) }}
              </span>
              <span class="result-footer-item">
                {{ $t('view.production.castLossTrend.colOverPct') }}: {{ formatPercentValue(report.total.castOverPct) }}
              </span>
            </div>
          </div>
        </template>
      </BaseDataTable>
    </SectionCardGeneric>
  </div>
</template>

<script>
import { useCastLossTrendApiStore } from '@/stores/modules/api/production/cast-loss-trend-api.js'
import { ExcelHelper } from '@/services/utils/excel-js.js'
import { warning } from '@/services/alert/sweetAlerts.js'

import StatCardGeneric from '@/components/generic/StatCardGeneric.vue'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ChartGeneric from '@/components/prime-vue/ChartGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

export default {
  name: 'CastLossTrendReportResultView',

  components: {
    StatCardGeneric,
    SectionCardGeneric,
    ChartGeneric,
    BaseDataTable
  },

  setup() {
    const castLossTrendStore = useCastLossTrendApiStore()
    return { castLossTrendStore }
  },

  props: {
    modelForm: {
      type: Object,
      default: null
    }
  },

  computed: {
    report() {
      return this.castLossTrendStore.reportData
    },

    columns() {
      return [
        { field: 'ym', header: this.$t('view.production.castLossTrend.colMonth'), sortable: false, minWidth: '110px' },
        { field: 'bookCount', header: this.$t('view.production.castLossTrend.colBookCount'), sortable: false, minWidth: '100px', align: 'right', format: 'number' },
        { field: 'sumCastWeight', header: this.$t('view.production.castLossTrend.colCastWeight'), sortable: false, minWidth: '120px', align: 'right', format: 'decimal2' },
        { field: 'sumCastLoss', header: this.$t('view.production.castLossTrend.colCastLoss'), sortable: false, minWidth: '120px', align: 'right', format: 'decimal2' },
        { field: 'castLossPct', header: this.$t('view.production.castLossTrend.colLossPct'), sortable: false, minWidth: '100px', align: 'right' },
        { field: 'sumCastOver', header: this.$t('view.production.castLossTrend.colOver'), sortable: false, minWidth: '110px', align: 'right', format: 'decimal2' },
        { field: 'castOverPct', header: this.$t('view.production.castLossTrend.colOverPct'), sortable: false, minWidth: '100px', align: 'right' }
      ]
    },

    chartSeries() {
      return [
        {
          name: this.$t('view.production.castLossTrend.seriesLossPct'),
          data: this.report.rows.map((r) => r.castLossPct)
        },
        {
          name: this.$t('view.production.castLossTrend.seriesOverPct'),
          data: this.report.rows.map((r) => r.castOverPct)
        }
      ]
    },

    chartOptions() {
      return {
        xaxis: {
          categories: this.report.rows.map((r) => r.ym)
        },
        stroke: {
          curve: 'smooth'
        },
        yaxis: {
          labels: {
            formatter: (v) => v.toFixed(2) + '%'
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
    }
  },

  methods: {
    async fetchData() {
      await this.castLossTrendStore.fetchReport(this.modelForm)
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

    formatWeightValue(value) {
      return `${this.formatDecimal(value)} ${this.$t('view.production.castLossTrend.unitGram')}`
    },

    async exportExcel() {
      if (!this.report.rows || this.report.rows.length === 0) {
        warning('ไม่มีข้อมูลสำหรับส่งออก', 'ไม่พบข้อมูล')
        return
      }

      const columns = this.columns.map((col) => ({ header: col.header, key: col.field }))
      const filename = `รายงาน-cast-loss-trend.xlsx`

      await ExcelHelper.exportToExcel(this.report.rows, {
        filename,
        sheetName: 'CastLossTrend',
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
</style>
