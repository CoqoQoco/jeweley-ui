<template>
  <div>
    <SourceStripGeneric source="both" />

    <div class="period-summary-label">
      <i class="bi bi-bar-chart-steps"></i>
      {{ $t('view.production.goldLossReconcile.periodSummaryLabel') }}
    </div>
    <div class="stats-grid">
      <StatCardGeneric
        icon="bi-diagram-3"
        :value="formatWeightValue(summary.planRawLoss)"
        :label="$t('view.production.goldLossReconcile.statPlanRawLoss')"
        variant="main"
      />
      <StatCardGeneric
        icon="bi-receipt"
        :value="formatWeightValue(summary.slipRawLoss)"
        :label="$t('view.production.goldLossReconcile.statSlipRawLoss')"
        variant="green"
      />
      <StatCardGeneric
        icon="bi-check-circle"
        :value="formatWeightValue(summary.gapExplainedByExtras)"
        :label="$t('view.production.goldLossReconcile.statGapExplained')"
        variant="green"
      />
      <div :class="{ 'stat-alert': isLowCoverage }">
        <StatCardGeneric
          icon="bi-exclamation-triangle"
          :value="formatWeightValue(summary.gapUnexplained)"
          :label="$t('view.production.goldLossReconcile.statGapUnexplained')"
          :variant="isLowCoverage ? 'warning' : 'grey'"
        />
      </div>
      <div :class="{ 'stat-alert': isLowCoverage }">
        <StatCardGeneric
          icon="bi-link-45deg"
          :value="formatPercentValue(summary.linkCoveragePercent)"
          :label="$t('view.production.goldLossReconcile.statLinkCoverage')"
          :variant="isLowCoverage ? 'warning' : 'green'"
        />
      </div>
    </div>

    <SectionCardGeneric
      :title="$t('view.production.goldLossReconcile.chartTitle')"
      icon="bi-graph-up"
      accent="main"
      headerStyle="legend"
      class="section-card-block"
    >
      <ChartGeneric
        type="line"
        :series="chartSeries"
        :options="chartOptions"
        :height="360"
        :emptyText="$t('common.label.noData')"
      />
    </SectionCardGeneric>

    <div class="note-banner">
      <i class="bi bi-info-circle-fill"></i>
      <span>{{ $t('view.production.goldLossReconcile.noteBanner') }}</span>
    </div>

    <SectionCardGeneric
      :title="$t('view.production.goldLossReconcile.mainTableTitle')"
      icon="bi-table"
      accent="main"
      headerStyle="legend"
      class="section-card-block"
    >
      <BaseDataTable :items="tableRows" :columns="tableColumns" :paginator="false" dataKey="rowKey">
        <template #header-ym>
          <span class="frozen-header"><i class="bi bi-pin-angle-fill"></i> {{ $t('view.production.goldLossReconcile.colYearMonth') }}</span>
        </template>
        <template #header-statusName>
          <span class="frozen-header"><i class="bi bi-pin-angle-fill"></i> {{ $t('view.production.goldLossReconcile.colDept') }}</span>
        </template>
        <template #ymTemplate="{ data }">{{ formatYearMonth(data.year, data.month) }}</template>
        <template #planLossPercentTemplate="{ data }">
          <div class="text-right">{{ formatPercentValue(data.planLossPercent) }}</div>
        </template>
        <template #slipLossPercentTemplate="{ data }">
          <div class="text-right">{{ formatPercentValue(data.slipLossPercent) }}</div>
        </template>
        <template #header-gapUnexplained>
          <span :title="$t('view.production.goldLossReconcile.gapUnexplainedTooltip')">
            {{ $t('view.production.goldLossReconcile.colGapUnexplained') }}
            <i class="bi bi-info-circle"></i>
          </span>
        </template>
        <template #gapUnexplainedTemplate="{ data }">
          <div class="text-right" :class="{ 'cell-warning': data.linkCoveragePercent < 80 }">
            {{ formatDecimal(data.gapUnexplained) }}
          </div>
        </template>
        <template #linkCoveragePercentTemplate="{ data }">
          <div class="text-right" :class="{ 'cell-warning': data.linkCoveragePercent < 80 }">
            {{ formatPercentValue(data.linkCoveragePercent) }}
          </div>
        </template>

        <template #footer>
          <div class="result-footer">
            <span class="result-footer-label">{{ $t('view.production.goldLossReconcile.footerTotalLabel') }}</span>
            <div class="result-footer-values">
              <span class="result-footer-item">
                {{ $t('view.production.goldLossReconcile.footerPlanRawLoss') }}: {{ formatWeightValue(summary.planRawLoss) }}
              </span>
              <span class="result-footer-item">
                {{ $t('view.production.goldLossReconcile.footerSlipRawLoss') }}: {{ formatWeightValue(summary.slipRawLoss) }}
              </span>
              <span class="result-footer-item">
                {{ $t('view.production.goldLossReconcile.footerGapExplained') }}: {{ formatWeightValue(summary.gapExplainedByExtras) }}
              </span>
              <span class="result-footer-item" :class="{ 'cell-warning': isLowCoverage }">
                {{ $t('view.production.goldLossReconcile.footerGapUnexplained') }}: {{ formatWeightValue(summary.gapUnexplained) }}
              </span>
              <span class="result-footer-item" :class="{ 'cell-warning': isLowCoverage }">
                {{ $t('view.production.goldLossReconcile.footerLinkCoverage') }}: {{ formatPercentValue(summary.linkCoveragePercent) }}
              </span>
            </div>
          </div>
        </template>
      </BaseDataTable>
    </SectionCardGeneric>
  </div>
</template>

<script>
import { useGoldLossReconcileApiStore } from '@/stores/modules/api/production/gold-loss-reconcile-api.js'
import { ExcelHelper } from '@/services/utils/excel-js.js'
import { warning } from '@/services/alert/sweetAlerts.js'
import { formatYearMonth } from '@/services/utils/dayjs.js'
import { CHART_PALETTE } from '@/services/utils/chart-colors.js'

import SourceStripGeneric from '@/components/generic/SourceStripGeneric.vue'
import StatCardGeneric from '@/components/generic/StatCardGeneric.vue'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ChartGeneric from '@/components/prime-vue/ChartGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

export default {
  name: 'GoldLossReconcileTabView',

  components: {
    SourceStripGeneric,
    StatCardGeneric,
    SectionCardGeneric,
    ChartGeneric,
    BaseDataTable
  },

  setup() {
    const goldLossReconcileStore = useGoldLossReconcileApiStore()
    return { goldLossReconcileStore }
  },

  props: {
    filter: {
      type: Object,
      default: () => ({})
    }
  },

  computed: {
    report() {
      return this.goldLossReconcileStore.reportData
    },

    summary() {
      return this.report.summary
    },

    isLowCoverage() {
      return (this.summary.linkCoveragePercent || 0) < 80
    },

    tableRows() {
      return this.report.rows.map((r) => ({ ...r, rowKey: `${r.statusCode}-${r.year}-${r.month}` }))
    },

    departmentsPresent() {
      const map = new Map()
      this.report.rows.forEach((r) => {
        if (!map.has(r.statusCode)) map.set(r.statusCode, r.statusName)
      })
      return [...map.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([statusCode, statusName]) => ({ statusCode, statusName }))
    },

    monthCategories() {
      const set = new Set(this.report.rows.map((r) => `${r.year}-${String(r.month).padStart(2, '0')}`))
      return [...set].sort()
    },

    chartSeries() {
      const series = []
      this.departmentsPresent.forEach((dept) => {
        const rowsByMonth = {}
        this.report.rows
          .filter((r) => r.statusCode === dept.statusCode)
          .forEach((r) => {
            rowsByMonth[`${r.year}-${String(r.month).padStart(2, '0')}`] = r
          })

        series.push({
          name: `${dept.statusName} - ${this.$t('view.production.goldLossReconcile.chartSeriesPlanSuffix')}`,
          data: this.monthCategories.map((catKey) => {
            const row = rowsByMonth[catKey]
            return row ? row.planLossPercent : null
          })
        })
        series.push({
          name: `${dept.statusName} - ${this.$t('view.production.goldLossReconcile.chartSeriesSlipSuffix')}`,
          data: this.monthCategories.map((catKey) => {
            const row = rowsByMonth[catKey]
            return row ? row.slipLossPercent : null
          })
        })
      })
      return series
    },

    chartOptions() {
      const colors = []
      const dashArray = []
      this.departmentsPresent.forEach((_, index) => {
        const color = CHART_PALETTE[index % CHART_PALETTE.length]
        colors.push(color, color)
        dashArray.push(0, 6)
      })

      return {
        colors,
        xaxis: {
          categories: this.monthCategories.map((catKey) => {
            const [y, m] = catKey.split('-')
            return formatYearMonth(Number(y), Number(m))
          })
        },
        stroke: { curve: 'smooth', width: 2, dashArray },
        yaxis: {
          labels: {
            formatter: (v) => `${Number(v).toFixed(2)}%`
          }
        }
      }
    },

    columns() {
      const t = (key) => this.$t(`view.production.goldLossReconcile.${key}`)
      return [
        { field: 'ym', header: t('colYearMonth'), sortable: false, minWidth: '100px', frozen: true, alignFrozen: 'left' },
        { field: 'statusName', header: t('colDept'), sortable: false, minWidth: '110px', frozen: true, alignFrozen: 'left' },

        { field: 'planSumSend', header: t('colPlanSumSend'), sortable: false, minWidth: '120px', align: 'right', format: 'decimal2' },
        { field: 'planSumCheck', header: t('colPlanSumCheck'), sortable: false, minWidth: '120px', align: 'right', format: 'decimal2' },
        { field: 'planRawLoss', header: t('colPlanRawLoss'), sortable: false, minWidth: '110px', align: 'right', format: 'decimal2' },
        { field: 'planLossPercent', header: t('colPlanLossPercent'), sortable: false, minWidth: '110px', align: 'right' },
        { field: 'planRowsReturned', header: t('colPlanRowsReturned'), sortable: false, minWidth: '110px', align: 'right', format: 'number' },
        { field: 'planRowsPending', header: t('colPlanRowsPending'), sortable: false, minWidth: '110px', align: 'right', format: 'number' },

        { field: 'slipCount', header: t('colSlipCount'), sortable: false, minWidth: '100px', align: 'right', format: 'number' },
        { field: 'slipIssued', header: t('colSlipIssued'), sortable: false, minWidth: '110px', align: 'right', format: 'decimal2' },
        { field: 'slipReturned', header: t('colSlipReturned'), sortable: false, minWidth: '110px', align: 'right', format: 'decimal2' },
        { field: 'slipRawLoss', header: t('colSlipRawLoss'), sortable: false, minWidth: '110px', align: 'right', format: 'decimal2' },
        { field: 'slipAllowedLoss', header: t('colSlipAllowedLoss'), sortable: false, minWidth: '120px', align: 'right', format: 'decimal2' },
        { field: 'slipDiffLoss', header: t('colSlipDiffLoss'), sortable: false, minWidth: '120px', align: 'right', format: 'decimal2' },
        { field: 'slipMoneyDiff', header: t('colSlipMoneyDiff'), sortable: false, minWidth: '120px', align: 'right', format: 'decimal2' },
        { field: 'slipLossPercent', header: t('colSlipLossPercent'), sortable: false, minWidth: '110px', align: 'right' },

        { field: 'extraIssuedWeight', header: t('colExtraIssuedWeight'), sortable: false, minWidth: '110px', align: 'right', format: 'decimal2' },
        { field: 'extraReturnedWeight', header: t('colExtraReturnedWeight'), sortable: false, minWidth: '110px', align: 'right', format: 'decimal2' },
        { field: 'extraReturnedNotCounted', header: t('colExtraReturnedNotCounted'), sortable: false, minWidth: '130px', align: 'right', format: 'decimal2' },
        { field: 'gapWeight', header: t('colGapWeight'), sortable: false, minWidth: '110px', align: 'right', format: 'decimal2' },
        { field: 'gapExplainedByExtras', header: t('colGapExplainedByExtras'), sortable: false, minWidth: '130px', align: 'right', format: 'decimal2' },
        { field: 'gapUnexplained', header: t('colGapUnexplained'), sortable: false, minWidth: '130px', align: 'right' },

        { field: 'linkedDetailRows', header: t('colLinkedDetailRows'), sortable: false, minWidth: '120px', align: 'right', format: 'number' },
        { field: 'unlinkedDetailRows', header: t('colUnlinkedDetailRows'), sortable: false, minWidth: '120px', align: 'right', format: 'number' },
        { field: 'linkCoveragePercent', header: t('colLinkCoveragePercent'), sortable: false, minWidth: '130px', align: 'right' }
      ]
    },

    // BaseDataTable/PrimeVue เรนเดอร์ทั้ง `header` prop และ `#header-<field>` slot คู่กันเสมอ (ไม่ทับกัน)
    // คอลัมน์ไหนมี custom header slot (pin icon / tooltip) ต้องเคลียร์ header prop ทิ้งไม่งั้นหัวขึ้นซ้ำ 2 บรรทัด
    // — ใช้เฉพาะกับตารางบนจอ ส่วน `columns` เดิม (มี header เต็ม) ยังใช้กับ export Excel ตามปกติ
    tableColumns() {
      const fieldsWithCustomHeaderSlot = ['ym', 'statusName', 'gapUnexplained']
      return this.columns.map((col) =>
        fieldsWithCustomHeaderSlot.includes(col.field) ? { ...col, header: '' } : col
      )
    },

    exportRows() {
      return this.report.rows.map((r) => ({ ...r, ym: formatYearMonth(r.year, r.month) }))
    }
  },

  watch: {
    filter: {
      handler() {
        this.fetchData()
      },
      deep: true,
      immediate: true
    }
  },

  methods: {
    async fetchData() {
      await this.goldLossReconcileStore.fetchReport(this.filter)
    },

    formatDecimal(value) {
      return new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value || 0)
    },

    formatWeightValue(value) {
      return `${this.formatDecimal(value)} ${this.$t('view.production.goldLossReconcile.unitGram')}`
    },

    formatPercentValue(value) {
      return `${this.formatDecimal(value)}%`
    },

    formatYearMonth,

    async exportExcel() {
      if (!this.report.rows.length) {
        warning(
          this.$t('view.production.goldLossReconcile.noDataExportMsg'),
          this.$t('view.production.goldLossReconcile.noDataExportTitle')
        )
        return
      }

      const columns = this.columns.map((col) => ({ header: col.header, key: col.field }))
      const filename = `${this.$t('view.production.goldLossReconcile.excelFileName')}.xlsx`

      await ExcelHelper.exportToExcel(this.exportRows, {
        filename,
        sheetName: 'GoldLossReconcile',
        columns
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';

.period-summary-label {
  display: flex;
  align-items: center;
  gap: var(--sp-xs);
  font-size: var(--fs-base);
  font-weight: 700;
  color: var(--base-font-color);
  margin-bottom: var(--sp-sm);
}

.frozen-header {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #fff;

  i {
    font-size: 0.75rem;
    opacity: 0.85;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--sp-md);
  margin-bottom: var(--sp-lg);

  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.stat-alert :deep(.stat-value) {
  color: var(--base-warning);
}

.section-card-block {
  margin-bottom: var(--sp-lg);
}

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

.cell-warning {
  color: var(--base-warning);
  font-weight: 700;
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
