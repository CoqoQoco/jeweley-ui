<template>
  <div class="mt-2">
    <SectionCardGeneric
      :title="$t('view.production.goldLossByStage.chartRawLoss')"
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

    <BaseDataTable
      :items="report.rows"
      :columns="columns"
      :paginator="false"
      dataKey="statusCode"
    >
      <template #footer>
        <div class="result-footer">
          <span class="result-footer-label">{{ $t('view.production.goldLossByStage.totalLabel') }}</span>
          <div class="result-footer-values">
            <span class="result-footer-item">
              {{ $t('view.production.goldLossByStage.colSend') }}: {{ formatDecimal(report.total.sumGoldWeightSend) }}
            </span>
            <span class="result-footer-item">
              {{ $t('view.production.goldLossByStage.colCheck') }}: {{ formatDecimal(report.total.sumGoldWeightCheck) }}
            </span>
            <span class="result-footer-item">
              {{ $t('view.production.goldLossByStage.colRawLoss') }}: {{ formatDecimal(report.total.rawLoss) }}
            </span>
            <span class="result-footer-item">
              {{ $t('view.production.goldLossByStage.colRawLossPercent') }}: {{ formatDecimal(report.total.rawLossPercent) }}
            </span>
            <span class="result-footer-item">
              {{ $t('view.production.goldLossByStage.colJobCount') }}: {{ report.total.jobCount || 0 }}
            </span>
          </div>
        </div>
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
import { useGoldLossByStageApiStore } from '@/stores/modules/api/production/gold-loss-by-stage-api.js'
import { ExcelHelper } from '@/services/utils/excel-js.js'
import { warning } from '@/services/alert/sweetAlerts.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ChartGeneric from '@/components/prime-vue/ChartGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

export default {
  name: 'GoldLossByStageReportResultView',

  components: {
    SectionCardGeneric,
    ChartGeneric,
    BaseDataTable
  },

  setup() {
    const goldLossByStageStore = useGoldLossByStageApiStore()
    return { goldLossByStageStore }
  },

  props: {
    modelForm: {
      type: Object,
      default: null
    }
  },

  computed: {
    report() {
      return this.goldLossByStageStore.reportData
    },

    columns() {
      return [
        { field: 'statusName', header: this.$t('view.production.goldLossByStage.colGoldStage'), sortable: false, minWidth: '150px' },
        { field: 'sumGoldWeightSend', header: this.$t('view.production.goldLossByStage.colSend'), sortable: false, minWidth: '120px', align: 'right', format: 'decimal2' },
        { field: 'sumGoldWeightCheck', header: this.$t('view.production.goldLossByStage.colCheck'), sortable: false, minWidth: '120px', align: 'right', format: 'decimal2' },
        { field: 'rawLoss', header: this.$t('view.production.goldLossByStage.colRawLoss'), sortable: false, minWidth: '110px', align: 'right', format: 'decimal2' },
        { field: 'rawLossPercent', header: this.$t('view.production.goldLossByStage.colRawLossPercent'), sortable: false, minWidth: '110px', align: 'right', format: 'decimal2' },
        { field: 'jobCount', header: this.$t('view.production.goldLossByStage.colJobCount'), sortable: false, minWidth: '100px', align: 'right', format: 'number' }
      ]
    },

    chartSeries() {
      return [
        {
          name: this.$t('view.production.goldLossByStage.chartRawLoss'),
          data: this.report.rows.map((r) => r.rawLoss)
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
      await this.goldLossByStageStore.fetchReport(this.modelForm)
    },

    formatDecimal(value) {
      return new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value || 0)
    },

    async exportExcel() {
      if (!this.report.rows || this.report.rows.length === 0) {
        warning('ไม่มีข้อมูลสำหรับส่งออก', 'ไม่พบข้อมูล')
        return
      }

      const columns = this.columns.map((col) => ({ header: col.header, key: col.field }))
      const filename = `รายงาน-gold-loss-แยก-stage-${this.modelForm.year}-${String(this.modelForm.month).padStart(2, '0')}.xlsx`

      await ExcelHelper.exportToExcel(this.report.rows, {
        filename,
        sheetName: 'GoldLossByStage',
        columns
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';

.chart-card {
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
