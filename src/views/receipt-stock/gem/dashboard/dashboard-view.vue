<template>
  <div class="app-container stock-gem-dashboard">
    <!-- Filter Bar -->
    <SearchBarGeneric
      :title="$t('view.stock.gem.dashboard.title')"
      :description="$t('view.stock.gem.dashboard.searchDesc')"
      icon="bi-clipboard-data"
      @search="onSearchFilter"
      @clear="onClearFilter"
    >
      <template #header-actions>
        <ButtonGeneric variant="green" icon="bi-arrow-clockwise" :title="$t('common.btn.refresh')" @click="refreshDashboard" />
      </template>

      <template #fields>
        <div>
          <span class="title-text">{{ $t('view.stock.gem.dashboard.groupName') }}</span>
          <MultiSelectGeneric
            v-model="filters.groupName"
            :options="gemOnhandReportStore.groupOptions"
            optionLabel="value"
            optionValue="value"
            :filter="true"
            :showClear="true"
          />
        </div>

        <div>
          <span class="title-text">{{ $t('view.stock.gem.dashboard.shape') }}</span>
          <MultiSelectGeneric
            v-model="filters.shape"
            :options="gemOnhandReportStore.shapeOptions"
            optionLabel="value"
            optionValue="value"
            :filter="true"
            :showClear="true"
          />
        </div>

        <div>
          <span class="title-text">{{ $t('view.stock.gem.dashboard.grade') }}</span>
          <MultiSelectGeneric
            v-model="filters.grade"
            :options="gemOnhandReportStore.gradeOptions"
            optionLabel="value"
            optionValue="value"
            :filter="true"
            :showClear="true"
          />
        </div>

        <div>
          <span class="title-text">{{ $t('view.report.common.dateFrom') }} - {{ $t('view.report.common.dateTo') }}</span>
          <DateRangeGeneric
            :startDate="filters.startDate"
            :endDate="filters.endDate"
            :startPlaceholder="$t('view.report.common.dateFrom')"
            :endPlaceholder="$t('view.report.common.dateTo')"
            @update:startDate="filters.startDate = $event"
            @update:endDate="filters.endDate = $event"
          />
        </div>
      </template>

      <template #actions-right>
        <ButtonGeneric variant="main" icon="bi-search" type="submit" :label="$t('common.btn.search')" />
        <ButtonGeneric variant="dark" icon="bi-x-circle" class="ml-2" :title="$t('common.btn.clear')" @click="onClearFilter" />
      </template>
    </SearchBarGeneric>

    <div class="data-info" v-if="dataAtDate">
      <small class="text-muted">
        <i class="bi bi-clock"></i>
        {{ $t('view.stock.gem.dashboard.lastUpdate') }}: {{ formatDateTime(dataAtDate) }}
      </small>
    </div>

    <!-- Dashboard Report Tabs -->
    <div class="row mb-2">
      <div class="col-12">
        <ul class="nav nav-tabs dashboard-tabs">
          <li class="nav-item">
            <button
              class="nav-link"
              :class="{ active: activeTab === 'overview' }"
              @click="activeTab = 'overview'"
            >
              <i class="bi bi-graph-up"></i>
              {{ $t('view.stock.gem.dashboard.overview') }}
            </button>
          </li>
          <li class="nav-item">
            <button
              class="nav-link"
              :class="{ active: activeTab === 'today' }"
              @click="setActiveTab('today')"
            >
              <i class="bi bi-calendar-day"></i>
              {{ $t('view.stock.gem.dashboard.today') }}
            </button>
          </li>
          <li class="nav-item">
            <button
              class="nav-link"
              :class="{ active: activeTab === 'weekly' }"
              @click="setActiveTab('weekly')"
            >
              <i class="bi bi-calendar-week"></i>
              {{ $t('view.stock.gem.dashboard.weekly') }}
            </button>
          </li>
          <li class="nav-item">
            <button
              class="nav-link"
              :class="{ active: activeTab === 'monthly' }"
              @click="setActiveTab('monthly')"
            >
              <i class="bi bi-calendar-month"></i>
              {{ $t('view.stock.gem.dashboard.monthly') }}
            </button>
          </li>
        </ul>
      </div>
    </div>

    <!-- Overview Tab -->
    <div v-show="activeTab === 'overview'" class="tab-content">
      <StockSummaryCards :stock-summary="stockSummary" />

      <ForecastPanel :trends="trends" />

      <CategoryChart :category-chart-data="categoryChartData" :dataset-fields="datasetFields" />

      <div class="row">
        <div class="col-lg-8 col-md-12 mb-4">
          <TopMovementsTable :top-movements="topMovements" />
          <LastActivitiesTable :last-activities="lastActivities" />
        </div>

        <div class="col-lg-4 col-md-12 mb-4">
          <PriceAlertsPanel :price-alerts="priceAlerts" />
        </div>
      </div>
    </div>

    <!-- Today Tab -->
    <div v-show="activeTab === 'today'" class="tab-content">
      <TodayTab :today-summary="todaySummary" :today-transactions="todayTransactions" />
    </div>

    <!-- Weekly Tab -->
    <div v-show="activeTab === 'weekly'" class="tab-content">
      <WeeklyTab :weekly-summary="weeklySummary" :weekly-movements="weeklyMovements" />
    </div>

    <!-- Monthly Tab -->
    <div v-show="activeTab === 'monthly'" class="tab-content">
      <MonthlyTransactionSummary />
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'

import { useStockGemDashboardStore } from '@/stores/modules/api/stock/stock-gem-dashboard-store.js'
import { useGemOnhandReportApiStore } from '@/stores/modules/api/stock/gem-onhand-report-api.js'

import SearchBarGeneric from '@/components/generic/SearchBarGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import MultiSelectGeneric from '@/components/prime-vue/MultiSelectGeneric.vue'
import DateRangeGeneric from '@/components/prime-vue/DateRangeGeneric.vue'

// Dashboard Components
import StockSummaryCards from './components/stock-summary-cards.vue'
import ForecastPanel from './components/forecast-panel.vue'
import CategoryChart from './components/category-chart.vue'
import TopMovementsTable from './components/top-movements-table.vue'
import LastActivitiesTable from './components/last-activities-table.vue'
import PriceAlertsPanel from './components/price-alerts-panel.vue'
import MonthlyTransactionSummary from './components/monthly-transaction-summary.vue'
import TodayTab from './components/today-tab.vue'
import WeeklyTab from './components/weekly-tab.vue'

const interfaceFilters = {
  groupName: [],
  shape: [],
  grade: [],
  startDate: null,
  endDate: null
}

export default {
  name: 'StockGemDashboardView',

  components: {
    SearchBarGeneric,
    ButtonGeneric,
    MultiSelectGeneric,
    DateRangeGeneric,
    StockSummaryCards,
    ForecastPanel,
    CategoryChart,
    TopMovementsTable,
    LastActivitiesTable,
    PriceAlertsPanel,
    MonthlyTransactionSummary,
    TodayTab,
    WeeklyTab
  },

  setup() {
    const dashboardStore = useStockGemDashboardStore()
    const gemOnhandReportStore = useGemOnhandReportApiStore()
    return { dashboardStore, gemOnhandReportStore }
  },

  data() {
    return {
      activeTab: 'overview',
      filters: { ...interfaceFilters },
      datasetFields: [
        { key: 'count', label: 'Count', labelTH: 'จำนวน' },
        { key: 'count2', label: 'On Process Count', labelTH: 'จำนวนที่อยู่ระหว่างดำเนินการ' },
        { key: 'count3', label: 'Total Weight', labelTH: 'น้ำหนักรวม' },
        { key: 'count4', label: 'On Process Weight', labelTH: 'น้ำหนักที่อยู่ระหว่างดำเนินการ' }
      ]
    }
  },

  computed: {
    dataAtDate() {
      return this.dashboardStore.getLastUpdated
    },
    stockSummary() {
      return this.dashboardStore.getStockSummary
    },
    categories() {
      return this.dashboardStore.getCategories
    },
    trends() {
      return this.dashboardStore.getTrends
    },
    topMovements() {
      return this.dashboardStore.getTopMovements
    },
    priceAlerts() {
      return this.dashboardStore.getPriceAlerts
    },
    lastActivities() {
      return this.dashboardStore.getLastActivities
    },
    todaySummary() {
      return this.dashboardStore.getTodaySummary
    },
    todayTransactions() {
      return this.dashboardStore.getTodayTransactions
    },
    weeklySummary() {
      return this.dashboardStore.getWeeklySummary
    },
    weeklyMovements() {
      return this.dashboardStore.getDailyMovements
    },
    monthlySummary() {
      return this.dashboardStore.getMonthlySummary
    },
    monthlyMovements() {
      return this.dashboardStore.getWeeklyComparisons
    },
    monthlyGemTransactionSummaries() {
      return this.dashboardStore.getMonthlyGemTransactionSummaries
    },
    categoryChartData() {
      return this.dashboardStore.getCategoryChartData
    }
  },

  async mounted() {
    this.gemOnhandReportStore.fetchGroupOptions()
    this.gemOnhandReportStore.fetchShapeOptions()
    this.gemOnhandReportStore.fetchGradeOptions()
    await this.fetchActiveTabData()
  },

  methods: {
    async fetchActiveTabData() {
      await this.dashboardStore.fetchDashboard(this.filters)
      if (this.activeTab === 'today') {
        await this.dashboardStore.fetchTodayReport(this.filters)
      } else if (this.activeTab === 'weekly') {
        await this.dashboardStore.fetchWeeklyReport(this.filters)
      } else if (this.activeTab === 'monthly') {
        await this.dashboardStore.fetchMonthlyReport(this.filters)
      }
    },

    async setActiveTab(tab) {
      this.activeTab = tab

      switch (tab) {
        case 'today':
          await this.dashboardStore.fetchTodayReport(this.filters)
          break
        case 'weekly':
          await this.dashboardStore.fetchWeeklyReport(this.filters)
          break
        case 'monthly':
          await this.dashboardStore.fetchMonthlyReport(this.filters)
          break
      }
    },

    onSearchFilter() {
      this.fetchActiveTabData()
    },

    onClearFilter() {
      this.filters = { ...interfaceFilters }
      this.fetchActiveTabData()
    },

    async refreshDashboard() {
      await this.dashboardStore.refreshAll(this.filters)
    },

    formatDateTime(date) {
      return dayjs(date).format('DD/MM/YYYY HH:mm')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/variable.scss';
@import '@/assets/scss/custom-style/standard-form.scss';

.stock-gem-dashboard {
  background-color: #f8f9fa;
  min-height: 100vh;

  .data-info {
    padding: var(--sp-sm) var(--sp-xs);

    small {
      font-size: var(--fs-sm);
      i {
        margin-right: var(--sp-xs);
      }
    }
  }

  .dashboard-tabs {
    background: white;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
    padding: 0 var(--sp-xl);

    .nav-link {
      border: none;
      color: $base-sub-color;
      padding: 15px 20px;
      font-weight: 500;

      &.active {
        color: $base-font-color;
        border-bottom: 3px solid $base-font-color;
        background: none;
      }

      &:hover {
        color: $base-font-color;
        background: none;
      }

      i {
        margin-right: 8px;
      }
    }
  }

  @media (max-width: 768px) {
    .dashboard-tabs {
      padding: 0 10px;

      .nav-link {
        padding: 12px 15px;
        font-size: 14px;
      }
    }
  }
}
</style>
