<template>
  <div class="mt-2">
    <div class="stats-grid">
      <StatCardGeneric
        icon="bi-collection-fill"
        :value="report.summary.total"
        :label="$t('view.production.preplanFunnel.statTotal')"
        variant="main"
      />
      <StatCardGeneric
        icon="bi-check-circle-fill"
        :value="formatPercent(report.summary.approvalRate)"
        :label="$t('view.production.preplanFunnel.statApprovalRate')"
        variant="green"
      />
      <StatCardGeneric
        icon="bi-x-circle-fill"
        :value="formatPercent(report.summary.cancelRate)"
        :label="$t('view.production.preplanFunnel.statCancelRate')"
        variant="warning"
      />
      <StatCardGeneric
        icon="bi-hourglass-split"
        :value="formatDaysValue(report.summary.avgSubmitToApproveDays)"
        :label="$t('view.production.preplanFunnel.statAvgApproveLead')"
        variant="grey"
      />
    </div>

    <SectionCardGeneric
      :title="$t('view.production.preplanFunnel.chartTitle')"
      icon="bi-bar-chart"
      accent="main"
      headerStyle="legend"
      class="chart-card"
    >
      <div class="chart-caption">
        {{ $t('view.production.preplanFunnel.avgOrderToSubmit') }}:
        {{ formatDaysValue(report.summary.avgOrderToSubmitDays) }}
      </div>
      <ChartGeneric
        type="bar"
        :series="chartSeries"
        :options="chartOptions"
        :height="320"
        :emptyText="$t('common.label.noData')"
      />
    </SectionCardGeneric>

    <SectionCardGeneric class="table-card">
      <BaseDataTable :items="report.statusRows" :columns="columns" :paginator="false" dataKey="status">
        <template #statusTemplate="{ data }">
          {{ statusLabel(data.status) }}
        </template>
        <template #percentTemplate="{ data }">
          {{ formatPercent(data.percent) }}
        </template>

        <template #footer>
          <div class="result-footer">
            <span class="result-footer-label">{{ $t('view.production.preplanFunnel.totalLabel') }}</span>
            <div class="result-footer-values">
              <span class="result-footer-item">
                {{ $t('view.production.preplanFunnel.count') }}: {{ report.summary.total || 0 }}
              </span>
            </div>
          </div>
        </template>
      </BaseDataTable>
    </SectionCardGeneric>
  </div>
</template>

<script>
import { usePrePlanFunnelApiStore } from '@/stores/modules/api/production/preplan-funnel-api.js'
import { ExcelHelper } from '@/services/utils/excel-js.js'
import { warning } from '@/services/alert/sweetAlerts.js'

import StatCardGeneric from '@/components/generic/StatCardGeneric.vue'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ChartGeneric from '@/components/prime-vue/ChartGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

export default {
  name: 'PrePlanFunnelReportResultView',

  components: {
    StatCardGeneric,
    SectionCardGeneric,
    ChartGeneric,
    BaseDataTable
  },

  setup() {
    const prePlanFunnelStore = usePrePlanFunnelApiStore()
    return { prePlanFunnelStore }
  },

  props: {
    modelForm: {
      type: Object,
      default: null
    }
  },

  computed: {
    report() {
      return this.prePlanFunnelStore.reportData
    },

    columns() {
      return [
        { field: 'status', header: this.$t('view.production.preplanFunnel.colStatus'), sortable: false, minWidth: '180px' },
        { field: 'count', header: this.$t('view.production.preplanFunnel.colCount'), sortable: false, minWidth: '100px', align: 'right', format: 'number' },
        { field: 'percent', header: this.$t('view.production.preplanFunnel.colPercent'), sortable: false, minWidth: '100px', align: 'right' }
      ]
    },

    chartSeries() {
      return [
        {
          name: this.$t('view.production.preplanFunnel.count'),
          data: this.report.statusRows.map((r) => r.count)
        }
      ]
    },

    chartOptions() {
      return {
        xaxis: {
          categories: this.report.statusRows.map((r) => this.statusLabel(r.status))
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
      await this.prePlanFunnelStore.fetchReport(this.modelForm)
    },

    statusLabel(code) {
      const key = `view.production.preplanFunnel.status.${code}`
      const label = this.$t(key)
      return label === key ? code : label
    },

    formatPercent(value) {
      return `${new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      }).format(value || 0)}%`
    },

    formatDaysValue(value) {
      return `${new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      }).format(value || 0)} ${this.$t('view.production.preplanFunnel.unitDays')}`
    },

    async exportExcel() {
      if (!this.report.statusRows || this.report.statusRows.length === 0) {
        warning('ไม่มีข้อมูลสำหรับส่งออก', 'ไม่พบข้อมูล')
        return
      }

      const rows = this.report.statusRows.map((r) => ({
        status: this.statusLabel(r.status),
        count: r.count,
        percent: this.formatPercent(r.percent)
      }))

      const columns = [
        { header: this.$t('view.production.preplanFunnel.colStatus'), key: 'status' },
        { header: this.$t('view.production.preplanFunnel.colCount'), key: 'count' },
        { header: this.$t('view.production.preplanFunnel.colPercent'), key: 'percent' }
      ]

      await ExcelHelper.exportToExcel(rows, {
        filename: 'รายงาน-preplan-funnel.xlsx',
        sheetName: 'PrePlanFunnel',
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

.chart-caption {
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
  margin-bottom: var(--sp-sm);
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
