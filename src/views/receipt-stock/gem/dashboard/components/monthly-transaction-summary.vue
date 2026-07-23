<template>
  <div class="monthly-transaction-summary">
    <!-- Month and Transaction Type Selection -->
    <div class="filter-container">
      <div>
        <div class="title-text">{{ $t('view.stock.gem.dashboard.monthSelection') }}</div>
        <div class="form-col-container">
          <CalendarGeneric
            v-model="selectedMonth"
            view="month"
            dateFormat="MM - yy"
            :showIcon="true"
            :showButtonBar="true"
            :manualInput="false"
            @date-select="onMonthChange"
            :class="{ 'p-invalid': !selectedMonth }"
          />

          <DropdownGeneric
            :modelValue="selectedTransactionType"
            :options="transactionTypeOptions"
            optionLabel="label"
            optionValue="value"
            :placeholder="$t('view.stock.gem.dashboard.selectTransactionType')"
            :showClear="true"
            @update:modelValue="selectedTransactionType = $event"
          />

          <div></div>
          <div class="d-flex align-items-end justify-content-end">
            <button
              @click="loadTransactionData"
              class="btn btn-sm btn-green ml-2"
              :disabled="!selectedMonth"
            >
              <i class="bi bi-search"></i>
              {{ $t('button.search') }}
            </button>
          </div>
        </div>
      </div>

      <div class="selected-period-info mt-1" v-if="selectedMonth">
        <small class="text-muted">
          <i class="bi bi-calendar"></i>
          {{ $t('view.stock.gem.dashboard.selectedPeriod') }}: {{ formatMonthYear(selectedMonth) }}
          <span v-if="selectedTransactionType" class="mr-3">
            <span>|</span>
            {{ $t('view.stock.gem.dashboard.selectedType') }}:
            {{ getTransactionTypeName(selectedTransactionType) }}
          </span>
        </small>
      </div>
    </div>

    <!-- Charts Display -->
    <div class="mt-2" v-if="chartData && chartData.report && chartData.report.length > 0">
      <div class="row">
        <!-- Quantity Chart -->
        <div class="col-lg-6 col-md-12 mb-3">
          <SectionCardGeneric :title="quantityChartTitle" icon="bi-bar-chart" accent="main" headerStyle="legend">
            <ChartGeneric type="bar" :series="quantitySeries" :options="quantityChartOptions" :height="chartHeight" />
          </SectionCardGeneric>
        </div>

        <!-- Weight Chart -->
        <div class="col-lg-6 col-md-12 mb-3">
          <SectionCardGeneric :title="weightChartTitle" icon="bi-bar-chart" accent="green" headerStyle="legend">
            <ChartGeneric type="bar" :series="weightSeries" :options="weightChartOptions" :height="chartHeight" />
          </SectionCardGeneric>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="filter-container data-table-card mt-2">
      <div class="table-header">
        <h5>{{ $t('view.stock.gem.dashboard.transactionDetails') }}</h5>
        <div class="table-controls">
          <button
            @click="exportToExcel"
            class="btn btn-sm btn-green"
            :disabled="!tableData.length"
          >
            <span><i class="bi bi-filetype-csv"></i></span>
          </button>
        </div>
      </div>

      <div class="table-body">
        <DataTableWithPaging
          v-if="tableData.length > 0"
          :items="tableData"
          :columns="tableColumns"
          :totalRecords="tableData.length"
          :paginator="false"
          :showGridlines="true"
          dataKey="id"
          :emptyMessage="$t('common.label.noData')"
          scrollHeight="500px"
        >
          <template #transactionCountTemplate="{ data }">
            <div class="text-end">
              {{ formatNumber(data.transactionCount) }}
            </div>
          </template>

          <template #totalQuantityTemplate="{ data }">
            <div class="text-end">
              {{ formatNumber(data.totalQuantity) }}
            </div>
          </template>

          <template #totalWeightTemplate="{ data }">
            <div class="text-end">
              {{ formatNumber(data.totalWeight, 3) }}
            </div>
          </template>

          <template #currentStockTemplate="{ data }">
            <div class="text-end">
              <div class="current-qty">{{ formatNumber(data.currentQuantity) }}</div>
              <div class="current-weight">
                <small class="text-muted">{{ formatNumber(data.currentWeight, 3) }}</small>
              </div>
            </div>
          </template>

          <template #productionTypeNameTemplate="{ data }">
            <div class="production-type-badge" v-if="data.productionTypeName">
              <span class="">{{
                data.productionTypeName === 'Silver'
                  ? data.productionTypeName
                  : `${data.productionType} ${data.productionTypeName}`
              }}</span>
            </div>
            <span v-else class="text-muted">-</span>
          </template>

          <template #lastTransactionDateTemplate="{ data }">
            <div class="text-center">
              {{ formatDateTime(data.lastTransactionDate) }}
            </div>
          </template>
        </DataTableWithPaging>

        <div v-else class="empty-state">
          <i class="bi bi-calendar-x"></i>
          <p>{{ $t('view.stock.gem.dashboard.noTransactionData') }}</p>
          <small v-if="!selectedMonth">{{
            $t('view.stock.gem.dashboard.selectMonthToView')
          }}</small>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useStockGemDashboardStore } from '@/stores/modules/api/stock/stock-gem-dashboard-store.js'
import dayjs from 'dayjs'
import { formatISOString } from '@/services/utils/dayjs.js'
import { success } from '@/services/alert/sweetAlerts.js'

import CalendarGeneric from '@/components/prime-vue/CalendarGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import DataTableWithPaging from '@/components/prime-vue/DataTableWithPaging.vue'
import ChartGeneric from '@/components/prime-vue/ChartGeneric.vue'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import { CHART_TOKENS } from '@/services/utils/chart-colors.js'

export default {
  name: 'MonthlyTransactionSummary',
  components: {
    CalendarGeneric,
    DropdownGeneric,
    DataTableWithPaging,
    ChartGeneric,
    SectionCardGeneric
  },
  setup() {
    const dashboardStore = useStockGemDashboardStore()
    return {
      dashboardStore
    }
  },
  data() {
    return {
      selectedMonth: new Date(),
      selectedTransactionType: null,
      transactionTypeSummaries: [],
      transactionTypeOptions: [
        { label: 'รับเข้าคลัง [พลอยใหม่]', value: 1 },
        { label: 'รับเข้าคลัง [พลอยนอกสต๊อก]', value: 2 },
        { label: 'รับเข้าคลัง [พลอยคืน]', value: 3 },
        { label: 'จ่ายออกคลัง', value: 4 },
        { label: 'ยืมออกคลัง', value: 5 },
        { label: 'คืนเข้าคลัง', value: 6 },
        { label: 'เบิกออกคลัง', value: 7 }
      ]
    }
  },
  computed: {
    tableData() {
      if (!this.selectedTransactionType || !this.transactionTypeSummaries.length) {
        return []
      }

      const selectedTypeData = this.transactionTypeSummaries.find(
        (type) => type.type === this.selectedTransactionType
      )

      if (!selectedTypeData || !selectedTypeData.gemDetails) {
        return []
      }

      return selectedTypeData.gemDetails.map((item, index) => ({
        ...item,
        id: `${selectedTypeData.type}-${index}`,
        transactionType: selectedTypeData.type,
        transactionTypeName: selectedTypeData.typeName
      }))
    },

    tableColumns() {
      const baseColumns = [
        {
          field: 'groupName',
          header: 'Group Name',
          sortable: false,
          minWidth: '150px'
        },
        {
          field: 'transactionCount',
          header: this.$t('view.stock.gem.dashboard.transactions'),
          sortable: false,
          minWidth: '120px',
          align: 'right',
          bodyTemplate: 'transactionCountTemplate'
        },
        {
          field: 'totalQuantity',
          header: this.$t('view.stock.gem.dashboard.quantity'),
          sortable: false,
          minWidth: '120px',
          align: 'right',
          bodyTemplate: 'quantityTemplate'
        },
        {
          field: 'totalWeight',
          header: this.$t('view.stock.gem.dashboard.weight'),
          sortable: false,
          minWidth: '120px',
          align: 'right',
          bodyTemplate: 'weightTemplate'
        },
        {
          field: 'lastTransactionDate',
          header: this.$t('view.stock.gem.dashboard.lastTransaction'),
          sortable: false,
          minWidth: '150px',
          align: 'center',
          bodyTemplate: 'lastTransactionTemplate'
        }
      ]

      if (this.selectedTransactionType === 7) {
        baseColumns.splice(1, 0, {
          field: 'productionTypeName',
          header: this.$t('view.stock.gem.dashboard.productionType'),
          sortable: false,
          minWidth: '140px',
          align: 'center',
          bodyTemplate: 'productionTypeTemplate'
        })
      }

      return baseColumns
    },

    chartData() {
      if (!this.selectedTransactionType || !this.transactionTypeSummaries.length) {
        return null
      }

      const selectedTypeData = this.transactionTypeSummaries.find(
        (type) => type.type === this.selectedTransactionType
      )

      if (!selectedTypeData || !selectedTypeData.gemDetails) {
        return null
      }

      return {
        report: selectedTypeData.gemDetails.map((item, index) => ({
          status: index,
          statusNameTH:
            item.groupName + (item.productionTypeName ? ` (${item.productionTypeName})` : ''),
          statusNameEN:
            item.groupName + (item.productionTypeName ? ` (${item.productionTypeName})` : ''),
          description: `${this.$t('view.stock.gem.dashboard.transactions')}: ${
            item.transactionCount
          }`,
          count: item.totalQuantity,
          weight: item.totalWeight,
          transactions: item.transactionCount
        }))
      }
    },

    chartCategories() {
      if (!this.chartData) return []
      return this.chartData.report.map((item) =>
        this.$i18n.locale === 'th' ? item.statusNameTH : item.statusNameEN
      )
    },

    quantitySeries() {
      if (!this.chartData) return []
      return [
        {
          name: this.$t('view.stock.gem.dashboard.quantity'),
          data: this.chartData.report.map((item) => item.count)
        }
      ]
    },

    weightSeries() {
      if (!this.chartData) return []
      return [
        {
          name: this.$t('view.stock.gem.dashboard.weight'),
          data: this.chartData.report.map((item) => item.weight)
        }
      ]
    },

    quantityChartOptions() {
      return {
        chart: { type: 'bar', toolbar: { show: false } },
        plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: '60%' } },
        colors: [CHART_TOKENS.primary],
        legend: { show: false },
        xaxis: { categories: this.chartCategories, labels: { style: { fontSize: '11px' } } },
        dataLabels: { enabled: false }
      }
    },

    weightChartOptions() {
      return {
        chart: { type: 'bar', toolbar: { show: false } },
        plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: '60%' } },
        colors: [CHART_TOKENS.green],
        legend: { show: false },
        xaxis: { categories: this.chartCategories, labels: { style: { fontSize: '11px' } } },
        dataLabels: { enabled: false }
      }
    },

    chartHeight() {
      if (!this.chartData) return 400
      return Math.max(400, this.chartData.report.length * 38 + 100)
    },

    quantityChartTitle() {
      if (!this.selectedTransactionType) {
        return this.$t('view.stock.gem.dashboard.quantityChart')
      }
      return `${this.$t('view.stock.gem.dashboard.quantityChart')} - ${this.getTransactionTypeName(
        this.selectedTransactionType
      )}`
    },

    weightChartTitle() {
      if (!this.selectedTransactionType) {
        return this.$t('view.stock.gem.dashboard.weightChart')
      }
      return `${this.$t('view.stock.gem.dashboard.weightChart')} - ${this.getTransactionTypeName(
        this.selectedTransactionType
      )}`
    }
  },
  async mounted() {
    await this.loadTransactionData()
  },
  methods: {
    onMonthChange(event) {
      this.selectedMonth = event
    },

    async loadTransactionData() {
      if (!this.selectedMonth) {
        this.transactionTypeSummaries = []
        return
      }

      const year = this.selectedMonth.getFullYear()
      const month = this.selectedMonth.getMonth()

      const startDate = new Date(year, month, 1)
      const endDate = new Date(year, month + 1, 0)

      await this.dashboardStore.fetchTransactionSummariesByType({
        startDate: formatISOString(startDate),
        endDate: formatISOString(endDate)
      })

      this.transactionTypeSummaries = this.dashboardStore.getTransactionTypeSummaries
    },

    async exportToExcel() {
      if (!this.tableData.length || !this.selectedTransactionType || !this.selectedMonth) return

      const year = this.selectedMonth.getFullYear()
      const month = this.selectedMonth.getMonth()
      const startDate = new Date(year, month, 1)
      const endDate = new Date(year, month + 1, 0)

      await this.dashboardStore.exportTransactionSummariesByType({
        dateRange: {
          startDate: formatISOString(startDate),
          endDate: formatISOString(endDate)
        },
        selectedTransactionType: this.selectedTransactionType,
        transactionTypeName: this.getTransactionTypeName(this.selectedTransactionType)
      })

      success(this.$t('alert.exportSuccess'), this.$t('alert.success'))
    },

    getTransactionTypeName(type) {
      const option = this.transactionTypeOptions.find((opt) => opt.value === type)
      return option ? option.label : `Type ${type}`
    },

    formatMonthYear(date) {
      return dayjs(date).format('MM/YYYY')
    },

    formatDateTime(date) {
      return dayjs(date).format('DD/MM/YYYY HH:mm')
    },

    formatNumber(value, decimals = 0) {
      if (!value && value !== 0) return '0' + (decimals > 0 ? '.'.padEnd(decimals + 1, '0') : '')
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(value)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/variable.scss';
@import '@/assets/scss/custom-style/standard-form.scss';

.monthly-transaction-summary {
  background-color: #f8f9fa;
  min-height: 100vh;

  .data-table-card {
    background: white;
    overflow: hidden;

    .table-header {
      padding: 20px;
      border-bottom: 1px solid #e9ecef;
      display: flex;
      justify-content: space-between;
      align-items: center;

      h5 {
        color: var(--base-font-color);
        font-weight: bold;
        margin: 0;
      }

      .table-controls {
        display: flex;
        align-items: center;
        gap: 10px;
      }
    }

    .table-body {
      padding: 20px;
    }
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    color: $base-sub-color;

    i {
      font-size: 48px;
      margin-bottom: 15px;
    }
  }

  .production-type-badge {
    .badge {
      background-color: #6f42c1 !important;
    }
  }

  .current-qty {
    font-weight: 600;
    color: var(--base-font-color);
  }

  .current-weight {
    margin-top: 2px;
  }
}
</style>
