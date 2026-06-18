<template>
  <div class="app-container stock-gem-dashboard">
    <!-- Dashboard Header with Refresh and Filters -->
    <div class="row">
      <div class="col-12">
        <div class="dashboard-header">
          <div class="header-info">
            <h3>{{ $t('view.stock.gem.dashboard.title') }}</h3>
            <div class="data-info">
              <small class="text-muted" v-if="dataAtDate">
                <i class="bi bi-clock"></i>
                {{ $t('view.stock.gem.dashboard.lastUpdate') }}: {{ formatDateTime(dataAtDate) }}
              </small>
            </div>
          </div>
          <div class="header-controls">
            <button @click="refreshDashboard" class="btn btn-outline-main" :disabled="isLoading">
              <i class="bi bi-arrow-clockwise" :class="{ spinning: isLoading }"></i>
              {{ $t('button.refresh') }}
            </button>
          </div>
        </div>
      </div>
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

      <CategoryChart
        :category-chart-data="categoryChartData"
        :is-loading="isLoading"
        :dataset-fields="datasetFields"
        :chart-name="chartName"
      />

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
import { useStockGemDashboardStore } from '@/stores/modules/api/stock/stock-gem-dashboard-store.js'
import dayjs from 'dayjs'

// Dashboard Components
import StockSummaryCards from './components/stock-summary-cards.vue'
import CategoryChart from './components/category-chart.vue'
import TopMovementsTable from './components/top-movements-table.vue'
import LastActivitiesTable from './components/last-activities-table.vue'
import PriceAlertsPanel from './components/price-alerts-panel.vue'
import MonthlyTransactionSummary from './components/monthly-transaction-summary.vue'
import TodayTab from './components/today-tab.vue'
import WeeklyTab from './components/weekly-tab.vue'

export default {
  name: 'StockGemDashboardView',

  components: {
    StockSummaryCards,
    CategoryChart,
    TopMovementsTable,
    LastActivitiesTable,
    PriceAlertsPanel,
    MonthlyTransactionSummary,
    TodayTab,
    WeeklyTab
  },

  data() {
    return {
      dashboardStore: useStockGemDashboardStore(),
      activeTab: 'overview',
      filters: {
        groupName: '',
        shape: '',
        grade: ''
      },
      datasetFields: [
        { key: 'count', label: 'Count', labelTH: 'จำนวน' },
        { key: 'count2', label: 'On Process Count', labelTH: 'จำนวนที่อยู่ระหว่างดำเนินการ' },
        { key: 'count3', label: 'Total Weight', labelTH: 'น้ำหนักรวม' },
        { key: 'count4', label: 'On Process Weight', labelTH: 'น้ำหนักที่อยู่ระหว่างดำเนินการ' }
      ],
      chartName: 'stock-gem-dashboard'
    }
  },

  computed: {
    isLoading() {
      return this.dashboardStore.getIsLoading
    },
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
    await this.loadDashboardData()
  },

  methods: {
    async loadDashboardData() {
      await this.dashboardStore.fetchDashboard(this.filters)
      if (this.activeTab === 'today') {
        await this.dashboardStore.fetchTodayReport(this.filters)
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

.stock-gem-dashboard {
  background-color: #f8f9fa;
  min-height: 100vh;

  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: white;
    padding: var(--sp-xl);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
    margin-bottom: 10px;

    .header-info {
      h3 {
        color: $base-font-color;
        font-weight: bold;
        margin: 0 0 5px 0;
      }

      .data-info {
        small {
          font-size: 12px;
          i {
            margin-right: 5px;
          }
        }
      }
    }

    .header-controls {
      display: flex;
      align-items: center;
    }

    .spinning {
      animation: spin 1s linear infinite;
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

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 768px) {
    .dashboard-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 15px;

      .header-controls {
        width: 100%;
        justify-content: space-between;
      }
    }

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
