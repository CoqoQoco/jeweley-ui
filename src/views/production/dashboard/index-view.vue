<template>
  <div class="app-container production-dashboard">
    <div class="app-container">
      <!-- Dashboard Header with Refresh -->
      <DashboardHeaderGeneric
        :title="$t('view.production.dashboard.title')"
        :subtitle="headerSubtitle"
        icon="bi-clipboard-data"
        @refresh="refreshDashboard"
      />

      <!-- Shared Filter Bar (applies to both tabs) -->
      <DashboardFilterView
        class="mb-2"
        :modelForm="filter"
        :activeTab="activeTab"
        @search="onSearchFilter"
        @clear="onClearFilter"
      />

      <!-- Dashboard Report Tabs -->
      <div class="row mb-2">
        <div class="col-12">
          <ul class="nav nav-tabs dashboard-tabs">
            <li class="nav-item">
              <button
                class="nav-link"
                :class="{ active: activeTab === 'summary' }"
                @click="activeTab = 'summary'"
              >
                <i class="bi bi-graph-up"></i>
                {{ $t('view.production.dashboard.summaryTab') }}
              </button>
            </li>
            <li class="nav-item">
              <button
                class="nav-link"
                :class="{ active: activeTab === 'monthly' }"
                @click="activeTab = 'monthly'"
              >
                <i class="bi bi-calendar-month"></i>
                {{ $t('view.production.dashboard.monthly') }}
              </button>
            </li>
            <li class="nav-item">
              <button
                class="nav-link"
                :class="{ active: activeTab === 'capacity' }"
                @click="activeTab = 'capacity'"
              >
                <i class="bi bi-speedometer2"></i>
                {{ $t('view.production.dashboard.capacityTab') }}
              </button>
            </li>
          </ul>
        </div>
      </div>

      <!-- Summary Tab Content -->
      <div v-show="activeTab === 'summary'" class="tab-content">
        <!-- Dashboard Load Error Band -->
        <div v-if="dashboardError" class="dashboard-error-band">
          <i class="bi bi-exclamation-triangle-fill"></i>
          <span>{{ $t('view.production.dashboard.loadError') }}</span>
          <ButtonGeneric
            variant="main"
            icon="bi-arrow-clockwise"
            :label="$t('common.btn.retry')"
            @click="refreshDashboard"
          />
        </div>

        <!-- Dashboard Stats Cards Component -->
        <DashboardStatsCards
          :totalPlans="totalPlans"
          :inProgressPlans="inProgressPlans"
          :completedPlans="completedPlans"
          :pendingPlans="pendingPlans"
          :summary="summary"
        />

        <!-- Completed Daily Forecast Panel (run-rate) -->
        <CompletedForecastPanel :rows="completedDailySeriesRows" />

        <!-- Charts and Summary Section -->
        <div class="row mb-2">
          <!-- Dashboard Chart Section Component -->
          <div class="col-lg-8 col-md-12">
            <DashboardChartSection :chartData="chartData" :isLoading="isLoading" />

            <!-- Dashboard Summary Tables Component -->
            <DashboardSummaryTables
              :productTypeSummary="productTypeSummary"
              :customerTypeSummary="customerTypeSummary"
            />
          </div>

          <!-- Dashboard Status Trends Component -->
          <div class="col-lg-4 col-md-12">
            <DashboardStatusTrends :statusTrends="statusTrends" />
          </div>
        </div>

        <!-- Dashboard Scrap Weight Component -->
        <div class="row">
          <div class="col-12">
            <DashboardScrapWeight ref="scrapWeightRef" />
          </div>
        </div>

        <!-- Dashboard Recent Activities Component -->
        <div class="row">
          <div class="col-12">
            <DashboardRecentActivities :recentActivities="recentActivities" />
          </div>
        </div>
      </div>

      <!-- Monthly Tab Content -->
      <div v-show="activeTab === 'monthly'" class="tab-content">
        <MonthlySuccessReport :sharedFilter="sharedFilterOnly" />
      </div>

      <!-- Capacity Tab Content -->
      <div v-show="activeTab === 'capacity'" class="tab-content">
        <CapacityReportView ref="capacityRef" :sharedFilter="sharedFilterOnly" />
      </div>
    </div>
  </div>
</template>

<script>
// Import isolated components
import DashboardStatsCards from './components/dashboard-stats-cards.vue'
import DashboardChartSection from './components/dashboard-chart-section.vue'
import DashboardSummaryTables from './components/dashboard-summary-tables.vue'
import DashboardRecentActivities from './components/dashboard-recent-activities.vue'
import DashboardStatusTrends from './components/dashboard-status-trends.vue'
import DashboardScrapWeight from './components/dashboard-scrap-weight.vue'
import CompletedForecastPanel from './components/completed-forecast-panel.vue'
import DashboardFilterView from './components/dashboard-filter-view.vue'

// Import components
import MonthlySuccessReport from './components/monthly-success-report.vue'
import CapacityReportView from './components/capacity-report-view.vue'

import { useProductionDailyApiStore } from '@/stores/modules/api/plan/daily-store-api.js'
import dayjs from 'dayjs'

import DashboardHeaderGeneric from '@/components/generic/DashboardHeaderGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

const getDefaultFilter = () => ({
  text: null,
  mold: null,
  productNumber: null,
  gold: [],
  goldSize: [],
  productType: [],
  customerType: [],
  customerCode: null,
  start: null,
  end: null,
  status: [],
  isOverPlan: 0
})

export default {
  name: 'ProductionDashboardView',
  components: {
    DashboardStatsCards,
    DashboardChartSection,
    DashboardSummaryTables,
    DashboardRecentActivities,
    DashboardStatusTrends,
    DashboardScrapWeight,
    CompletedForecastPanel,
    DashboardFilterView,
    MonthlySuccessReport,
    CapacityReportView,
    DashboardHeaderGeneric,
    ButtonGeneric
  },
  setup() {
    const dailyApiStore = useProductionDailyApiStore()
    return {
      dailyApiStore
    }
  },
  data() {
    return {
      activeTab: 'summary',
      filter: getDefaultFilter()
    }
  },
  computed: {
    // Raw Data
    dataAtDate() {
      return this.dailyApiStore.getDataAtDate
    },

    // Filter fields shared by DailyPlan, CompletedDailySeries and MonthlyReport
    // (excludes summary-only fields: start, end, status, isOverPlan)
    sharedFilterOnly() {
      return {
        text: this.filter.text,
        mold: this.filter.mold,
        productNumber: this.filter.productNumber,
        gold: this.filter.gold,
        goldSize: this.filter.goldSize,
        productType: this.filter.productType,
        customerType: this.filter.customerType,
        customerCode: this.filter.customerCode
      }
    },

    headerSubtitle() {
      if (!this.dataAtDate) return ''
      return `${this.$t('view.production.dashboard.lastUpdate')}: ${this.formatDateTime(this.dataAtDate)}`
    },

    // Dashboard Statistics from API Store
    totalPlans() {
      return this.dailyApiStore.getTotalPlans
    },
    inProgressPlans() {
      return this.dailyApiStore.getInProgressPlans
    },
    completedPlans() {
      return this.dailyApiStore.getCompletedPlans
    },
    pendingPlans() {
      return this.dailyApiStore.getPendingPlans
    },

    // Summary Data from API Store
    summary() {
      return this.dailyApiStore.getSummary
    },
    statusTrends() {
      return this.dailyApiStore.getStatusTrends
    },
    productTypeSummary() {
      return this.dailyApiStore.getProductTypeSummary
    },
    customerTypeSummary() {
      return this.dailyApiStore.getCustomerTypeSummary
    },

    // Chart Data from API Store
    chartData() {
      return this.dailyApiStore.getStatusReport
    },

    // Completed Daily Series (run-rate forecast source)
    completedDailySeriesRows() {
      return this.dailyApiStore.getCompletedDailySeriesRows
    },

    // Recent Activities from API Store
    recentActivities() {
      return this.dailyApiStore.getFormattedRecentActivities(10)
    },

    // Loading State from API Store
    isLoading() {
      return this.dailyApiStore.getIsLoading
    },

    // Error State from API Store
    dashboardError() {
      return this.dailyApiStore.getError
    }
  },
  mounted() {
    this.loadDashboardData()
  },
  methods: {
    async loadDashboardData() {
      // Load dashboard data using the DailyPlan API
      await this.dailyApiStore.fetchDailyPlan(false, this.filter)
      await this.dailyApiStore.fetchCompletedDailySeries(this.sharedFilterOnly)
    },

    async refreshDashboard() {
      // Force refresh all dashboard data
      await this.dailyApiStore.refreshDashboard(this.filter)
      await this.dailyApiStore.fetchCompletedDailySeries(this.sharedFilterOnly)
      if (this.$refs.scrapWeightRef) {
        await this.$refs.scrapWeightRef.loadScrapWeightData()
      }
      if (this.activeTab === 'capacity' && this.$refs.capacityRef) {
        await this.$refs.capacityRef.fetchData()
      }
    },

    async applyFilter() {
      // Force refetch when the shared filter bar is submitted
      await this.dailyApiStore.fetchDailyPlan(true, this.filter)
      await this.dailyApiStore.fetchCompletedDailySeries(this.sharedFilterOnly)
      if (this.activeTab === 'capacity' && this.$refs.capacityRef) {
        await this.$refs.capacityRef.fetchData()
      }
    },

    onSearchFilter(formData) {
      this.filter = { ...formData }
      this.applyFilter()
    },

    onClearFilter() {
      this.filter = getDefaultFilter()
    },

    formatDateTime(date) {
      return dayjs(date).format('DD/MM/YYYY HH:mm')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/variable.scss';

.production-dashboard {
  min-height: 100vh;

  // Dashboard Load Error Band
  .dashboard-error-band {
    display: flex;
    align-items: center;
    gap: var(--sp-md);
    padding: var(--sp-lg) var(--sp-xl);
    margin-bottom: var(--sp-lg);
    background: var(--color-highlight-bg);
    border: 1px solid var(--base-red);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
    color: var(--base-font-color);

    i {
      font-size: var(--fs-xl);
      color: var(--base-red);
      flex-shrink: 0;
    }

    span {
      flex: 1;
    }
  }

  // Dashboard Tabs Styling
  .dashboard-tabs {
    background: var(--color-card-bg);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
    padding: 0 var(--sp-xl);

    .nav-link {
      border: none;
      color: $base-sub-color;
      padding: var(--sp-lg) var(--sp-xl);
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
        margin-right: var(--sp-sm);
      }
    }
  }

  // Tab Content
  .tab-content {
    background: transparent;
    border: none;
  }
}

// Responsive adjustments
@media (max-width: 768px) {
  .production-dashboard {
    .dashboard-tabs {
      padding: 0 var(--sp-sm);

      .nav-link {
        padding: var(--sp-md) var(--sp-lg);
        font-size: var(--fs-base);
      }
    }
  }
}
</style>
