<template>
  <div class="mt-2">
    <div class="stats-grid">
      <StatCardGeneric
        icon="bi-check-circle-fill"
        :value="report.summary.totalCount"
        :label="$t('view.production.leadTime.statTotal')"
        variant="main"
      />
      <StatCardGeneric
        icon="bi-hourglass-split"
        :value="formatDaysValue(report.summary.avgDays)"
        :label="$t('view.production.leadTime.statAvg')"
        variant="main"
      />
      <StatCardGeneric
        icon="bi-bar-chart-steps"
        :value="formatDaysValue(report.summary.medianDays)"
        :label="$t('view.production.leadTime.statMedian')"
        variant="green"
      />
      <StatCardGeneric
        icon="bi-exclamation-triangle-fill"
        :value="report.summary.invalidCount"
        :label="$t('view.production.leadTime.statInvalid')"
        variant="grey"
      />
    </div>

    <SectionCardGeneric
      :title="$t('view.production.leadTime.chartAvg')"
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
      <BaseDataTable
        :items="report.rows"
        :columns="columns"
        :paginator="false"
        dataKey="groupCode"
      >
        <template #footer>
          <div class="result-footer">
            <span class="result-footer-label">{{ $t('view.production.leadTime.totalLabel') }}</span>
            <div class="result-footer-values">
              <span class="result-footer-item">
                {{ $t('view.production.leadTime.colCount') }}: {{ report.summary.totalCount || 0 }}
              </span>
              <span class="result-footer-item">
                {{ $t('view.production.leadTime.colAvg') }}: {{ formatDecimal(report.summary.avgDays) }}
              </span>
              <span class="result-footer-item">
                {{ $t('view.production.leadTime.colMedian') }}: {{ formatDecimal(report.summary.medianDays) }}
              </span>
            </div>
          </div>
        </template>
      </BaseDataTable>
    </SectionCardGeneric>
  </div>
</template>

<script>
import { useLeadTimeApiStore } from '@/stores/modules/api/production/lead-time-api.js'
import { ExcelHelper } from '@/services/utils/excel-js.js'
import { warning } from '@/services/alert/sweetAlerts.js'

import StatCardGeneric from '@/components/generic/StatCardGeneric.vue'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ChartGeneric from '@/components/prime-vue/ChartGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

export default {
  name: 'LeadTimeReportResultView',

  components: {
    StatCardGeneric,
    SectionCardGeneric,
    ChartGeneric,
    BaseDataTable
  },

  setup() {
    const leadTimeStore = useLeadTimeApiStore()
    return { leadTimeStore }
  },

  props: {
    modelForm: {
      type: Object,
      default: null
    }
  },

  computed: {
    report() {
      return this.leadTimeStore.reportData
    },

    groupColHeader() {
      return this.report.groupBy === 'customerType'
        ? this.$t('view.production.leadTime.groupCustomer')
        : this.$t('view.production.leadTime.groupProduct')
    },

    columns() {
      return [
        { field: 'groupName', header: this.groupColHeader, sortable: false, minWidth: '150px' },
        { field: 'count', header: this.$t('view.production.leadTime.colCount'), sortable: false, minWidth: '90px', align: 'right', format: 'number' },
        { field: 'avgDays', header: this.$t('view.production.leadTime.colAvg'), sortable: false, minWidth: '110px', align: 'right', format: 'decimal2' },
        { field: 'medianDays', header: this.$t('view.production.leadTime.colMedian'), sortable: false, minWidth: '110px', align: 'right', format: 'decimal2' },
        { field: 'b0_30', header: this.$t('view.production.leadTime.colB0_30'), sortable: false, minWidth: '90px', align: 'right', format: 'number' },
        { field: 'b31_90', header: this.$t('view.production.leadTime.colB31_90'), sortable: false, minWidth: '90px', align: 'right', format: 'number' },
        { field: 'b91_180', header: this.$t('view.production.leadTime.colB91_180'), sortable: false, minWidth: '90px', align: 'right', format: 'number' },
        { field: 'b181_365', header: this.$t('view.production.leadTime.colB181_365'), sortable: false, minWidth: '100px', align: 'right', format: 'number' },
        { field: 'bGt365', header: this.$t('view.production.leadTime.colBGt365'), sortable: false, minWidth: '90px', align: 'right', format: 'number' }
      ]
    },

    chartSeries() {
      return [
        {
          name: this.$t('view.production.leadTime.chartAvg'),
          data: this.report.rows.map((r) => r.avgDays)
        }
      ]
    },

    chartOptions() {
      return {
        xaxis: {
          categories: this.report.rows.map((r) => r.groupName)
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
      await this.leadTimeStore.fetchReport(this.modelForm)
    },

    formatDecimal(value) {
      return new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value || 0)
    },

    formatDaysValue(value) {
      return `${this.formatDecimal(value)} ${this.$t('view.production.leadTime.unitDays')}`
    },

    async exportExcel() {
      if (!this.report.rows || this.report.rows.length === 0) {
        warning('ไม่มีข้อมูลสำหรับส่งออก', 'ไม่พบข้อมูล')
        return
      }

      const columns = this.columns.map((col) => ({ header: col.header, key: col.field }))
      const filename = `รายงาน-lead-time-${this.report.groupBy}.xlsx`

      await ExcelHelper.exportToExcel(this.report.rows, {
        filename,
        sheetName: 'LeadTime',
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
