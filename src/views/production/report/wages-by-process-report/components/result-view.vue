<template>
  <div class="mt-2">
    <div class="stats-grid">
      <StatCardGeneric
        icon="bi-briefcase-fill"
        :value="report.total.jobCount"
        :label="$t('view.production.wagesByProcess.statTotalJobs')"
        variant="main"
      />
      <StatCardGeneric
        icon="bi-cash-stack"
        :value="formatMoney(report.total.totalWages)"
        :label="$t('view.production.wagesByProcess.statTotalWages')"
        variant="green"
      />
      <StatCardGeneric
        icon="bi-calculator"
        :value="formatMoney(report.total.avgWagesPerJob)"
        :label="$t('view.production.wagesByProcess.statAvgWages')"
        variant="grey"
      />
    </div>

    <SectionCardGeneric
      :title="$t('view.production.wagesByProcess.chartTitle')"
      icon="bi-bar-chart"
      accent="main"
      headerStyle="legend"
      class="chart-card"
    >
      <ChartGeneric
        type="bar"
        :series="chartSeries"
        :options="chartOptions"
        :height="320"
        :emptyText="$t('common.label.noData')"
      />
    </SectionCardGeneric>

    <SectionCardGeneric class="table-card">
      <BaseDataTable :items="report.rows" :columns="columns" :paginator="false" dataKey="statusCode">
        <template #footer>
          <div class="result-footer">
            <span class="result-footer-label">{{ $t('view.production.wagesByProcess.totalLabel') }}</span>
            <div class="result-footer-values">
              <span class="result-footer-item">
                {{ $t('view.production.wagesByProcess.colJobCount') }}: {{ report.total.jobCount || 0 }}
              </span>
              <span class="result-footer-item">
                {{ $t('view.production.wagesByProcess.colTotalWages') }}: {{ formatDecimal(report.total.totalWages) }}
              </span>
              <span class="result-footer-item">
                {{ $t('view.production.wagesByProcess.colAvgWages') }}: {{ formatDecimal(report.total.avgWagesPerJob) }}
              </span>
            </div>
          </div>
        </template>
      </BaseDataTable>
    </SectionCardGeneric>
  </div>
</template>

<script>
import { useWagesByProcessApiStore } from '@/stores/modules/api/production/wages-by-process-api.js'
import { ExcelHelper } from '@/services/utils/excel-js.js'
import { warning } from '@/services/alert/sweetAlerts.js'

import StatCardGeneric from '@/components/generic/StatCardGeneric.vue'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ChartGeneric from '@/components/prime-vue/ChartGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

export default {
  name: 'WagesByProcessReportResultView',

  components: {
    StatCardGeneric,
    SectionCardGeneric,
    ChartGeneric,
    BaseDataTable
  },

  setup() {
    const wagesByProcessStore = useWagesByProcessApiStore()
    return { wagesByProcessStore }
  },

  props: {
    modelForm: {
      type: Object,
      default: null
    }
  },

  computed: {
    report() {
      return this.wagesByProcessStore.reportData
    },

    columns() {
      return [
        { field: 'statusName', header: this.$t('view.production.wagesByProcess.colProcess'), sortable: false, minWidth: '150px' },
        { field: 'jobCount', header: this.$t('view.production.wagesByProcess.colJobCount'), sortable: false, minWidth: '110px', align: 'right', format: 'number' },
        { field: 'totalWages', header: this.$t('view.production.wagesByProcess.colTotalWages'), sortable: false, minWidth: '130px', align: 'right', format: 'decimal2' },
        { field: 'avgWagesPerJob', header: this.$t('view.production.wagesByProcess.colAvgWages'), sortable: false, minWidth: '130px', align: 'right', format: 'decimal2' }
      ]
    },

    chartSeries() {
      return [
        {
          name: this.$t('view.production.wagesByProcess.colTotalWages'),
          data: this.report.rows.map((r) => r.totalWages)
        }
      ]
    },

    chartOptions() {
      return {
        xaxis: {
          categories: this.report.rows.map((r) => r.statusName)
        },
        plotOptions: {
          bar: { horizontal: true }
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
      await this.wagesByProcessStore.fetchReport(this.modelForm)
    },

    formatDecimal(value) {
      return new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value || 0)
    },

    formatMoney(value) {
      return `${this.formatDecimal(value)} ${this.$t('view.production.wagesByProcess.unitBaht')}`
    },

    async exportExcel() {
      if (!this.report.rows || this.report.rows.length === 0) {
        warning('ไม่มีข้อมูลสำหรับส่งออก', 'ไม่พบข้อมูล')
        return
      }

      const columns = this.columns.map((col) => ({ header: col.header, key: col.field }))

      await ExcelHelper.exportToExcel(this.report.rows, {
        filename: 'รายงาน-ค่าแรงตามประเภทงาน.xlsx',
        sheetName: 'WagesByProcess',
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
  grid-template-columns: repeat(3, 1fr);
  gap: var(--sp-md);
  margin-bottom: var(--sp-lg);

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
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
