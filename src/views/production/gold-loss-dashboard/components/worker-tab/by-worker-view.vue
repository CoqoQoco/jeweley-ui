<template>
  <div>
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
          <div class="diff-cell">
            <span class="diff-cell__bar-track">
              <span class="diff-cell__bar-fill" :style="{ width: diffBarWidth(data) + '%' }"></span>
            </span>
            <span class="diff-cell__value" :class="diffClass(data)">
              {{ formatSignedPercentValue(data.diffFromStageAvgPercent) }}
              <i v-if="isDiffWarning(data)" class="bi bi-exclamation-triangle-fill diff-cell__warn-icon"></i>
            </span>
          </div>
        </template>
        <template #rankInStageTemplate="{ data }">
          <div class="text-center">{{ rankLabel(data) }}</div>
        </template>
      </BaseDataTable>

      <div class="note-banner">
        <i class="bi bi-info-circle-fill"></i>
        <span>{{ $t('view.production.goldLossByWorkerAllStages.tangDeptNote') }}</span>
        <ButtonGeneric
          variant="green"
          icon="bi-arrow-right-circle"
          :label="$t('view.production.goldLossByWorkerAllStages.tangDeptNoteBtn')"
          @click="$emit('navigate-tab', 'slip-tang')"
        />
      </div>
    </SectionCardGeneric>

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
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import ChartGeneric from '@/components/prime-vue/ChartGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'

// ห่างจากเฉลี่ยแผนกที่ถือว่า "เต็มแถบ" ในคอลัมน์ห่างจากเฉลี่ย (จุด %) — ใช้ปรับสเกลแถบเท่านั้น ไม่กระทบตัวเลข
const DIFF_BAR_MAX_SCALE = 5
// เกินกี่จุดถึงติดไอคอนเตือน (ตามพิมพ์เขียว Fig. 5)
const DIFF_WARNING_THRESHOLD = 2

export default {
  name: 'GoldLossByWorkerView',

  components: {
    StatCardGeneric,
    SectionCardGeneric,
    ButtonGeneric,
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
    },
    hideTestWorkers: {
      type: Boolean,
      default: true
    }
  },

  emits: ['navigate-tab'],

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

    // ซ่อนช่างทดสอบ (รหัส/ชื่อมีคำว่า TEST) ที่ฝั่ง UI เท่านั้น — ไม่แตะข้อมูล prod
    // หมายเหตุ: การ์ด KPI ด้านบน (จำนวนช่าง/จำนวนงาน) มาจาก summary รวมของ backend โดยตรง
    // จึงยังนับช่างทดสอบรวมอยู่ — ตัวกรองนี้มีผลเฉพาะตาราง/กราฟด้านล่างเท่านั้น
    filteredWorkerRows() {
      if (!this.hideTestWorkers) return this.report.rows
      return this.report.rows.filter((r) => !this.isTestWorker(r))
    },

    filteredMonthlyRows() {
      if (!this.hideTestWorkers) return this.report.monthlyRows
      return this.report.monthlyRows.filter((r) => !this.isTestWorker(r))
    },

    // "อันดับในแผนก" (rankInStage) มาจาก backend ซึ่งยังนับช่างทดสอบรวมอยู่เสมอ — พอ UI ซ่อนช่างทดสอบออก
    // เลขอันดับดิบจะขาดช่วง (เช่น 1,3,4,5 ไม่มี 2) ต้องคำนวณอันดับใหม่จากแถวที่เหลือจริงเมื่อเปิดการซ่อน
    // เรียงภายในแผนกเดียวกันตาม diffFromStageAvgPercent มาก→น้อย (แย่สุดก่อน) ตามที่ backend ใช้คำนวณ rankInStage เดิม
    // ปิดการซ่อน (hideTestWorkers=false) ให้กลับไปใช้ rankInStage ดิบจาก backend ตามเดิม
    rowsWithDisplayRank() {
      if (!this.hideTestWorkers) return this.filteredWorkerRows

      const rowsByStage = {}
      this.filteredWorkerRows
        .filter((r) => !r.isBelowMinJobs)
        .forEach((r) => {
          if (!rowsByStage[r.statusCode]) rowsByStage[r.statusCode] = []
          rowsByStage[r.statusCode].push(r)
        })

      const displayRankByKey = {}
      Object.values(rowsByStage).forEach((rows) => {
        ;[...rows]
          .sort((a, b) => (b.diffFromStageAvgPercent || 0) - (a.diffFromStageAvgPercent || 0))
          .forEach((r, index) => {
            displayRankByKey[`${r.statusCode}-${r.workerCode}`] = index + 1
          })
      })

      return this.filteredWorkerRows.map((r) => ({
        ...r,
        rankInStage: r.isBelowMinJobs ? r.rankInStage : displayRankByKey[`${r.statusCode}-${r.workerCode}`]
      }))
    },

    sortedRows() {
      return this.rowsWithDisplayRank
        .map((r) => ({ ...r, rowKey: `${r.statusCode}-${r.workerCode}` }))
        .sort((a, b) => {
          const diffA = a.isBelowMinJobs ? -Infinity : (a.diffFromStageAvgPercent ?? -Infinity)
          const diffB = b.isBelowMinJobs ? -Infinity : (b.diffFromStageAvgPercent ?? -Infinity)
          return diffB - diffA
        })
    },

    filteredMonthlyTop() {
      const source = this.hideTestWorkers
        ? this.report.monthlyTop.filter((r) => !this.isTestWorker(r))
        : this.report.monthlyTop

      const rows = source
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
        this.filteredMonthlyRows
          .filter((r) => r.statusCode === this.trendDept)
          .map((r) => `${r.year}-${String(r.month).padStart(2, '0')}`)
      )
      return [...set].sort()
    },

    trendChartSeries() {
      if (!this.trendDept) return []
      const byWorker = {}
      this.filteredMonthlyRows
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
      deep: true,
      immediate: true
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

    isTestWorker(row) {
      const code = (row.workerCode || '').toUpperCase()
      const name = (row.workerName || '').toUpperCase()
      return code.includes('TEST') || name.includes('TEST')
    },

    diffBarWidth(data) {
      const diff = Math.abs(data.diffFromStageAvgPercent || 0)
      return Math.min(100, (diff / DIFF_BAR_MAX_SCALE) * 100)
    },

    isDiffWarning(data) {
      return (data.diffFromStageAvgPercent || 0) > DIFF_WARNING_THRESHOLD
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
  align-items: center;
  flex-wrap: wrap;
  gap: var(--sp-sm);
  background: var(--color-highlight-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--sp-md) var(--sp-lg);
  margin-top: var(--sp-lg);
  color: var(--base-font-color);
  font-size: var(--fs-base);
  line-height: var(--lh-md);

  i {
    font-size: var(--fs-lg);
  }

  span {
    flex: 1;
    min-width: 200px;
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

.diff-cell {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--sp-sm);
}

.diff-cell__bar-track {
  display: inline-block;
  width: 48px;
  height: 6px;
  border-radius: var(--radius-sm);
  background: var(--color-border);
  overflow: hidden;
  flex-shrink: 0;
}

.diff-cell__bar-fill {
  display: block;
  height: 100%;
  background: var(--base-sub-color);
  border-radius: var(--radius-sm);
}

.diff-cell__value {
  white-space: nowrap;
}

.diff-cell__warn-icon {
  color: var(--base-warning);
  margin-left: 2px;
}

:deep(.row-below-min) {
  opacity: 0.55;
  font-style: italic;
}
</style>
