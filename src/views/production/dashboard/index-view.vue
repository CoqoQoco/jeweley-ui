<template>
  <div class="app-container production-dashboard">
    <div class="app-container">
      <!-- Dashboard Header with Refresh -->
      <DashboardHeaderGeneric
        :title="$t('view.production.dashboard.title')"
        :subtitle="headerSubtitle"
        icon="bi-clipboard-data"
        @refresh="refreshDashboard"
      >
        <template #controls>
          <DateRangeGeneric
            v-if="activeTab === 'summary'"
            :startDate="filter.start"
            :endDate="filter.end"
            :startPlaceholder="$t('view.production.dashboard.filterDateFrom')"
            :endPlaceholder="$t('view.production.dashboard.filterDateTo')"
            @update:startDate="filter.start = $event"
            @update:endDate="filter.end = $event"
            @change="applyFilter"
          />
        </template>
      </DashboardHeaderGeneric>

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
          </ul>
        </div>
      </div>

      <!-- Summary Tab Content -->
      <div v-show="activeTab === 'summary'" class="tab-content">
        <!-- Dashboard Stats Cards Component -->
        <DashboardStatsCards
          :totalPlans="totalPlans"
          :inProgressPlans="inProgressPlans"
          :completedPlans="completedPlans"
          :pendingPlans="pendingPlans"
          :summary="summary"
        />

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
            <DashboardScrapWeight />
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
        <MonthlySuccessReport />
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

// Import components
import MonthlySuccessReport from './components/monthly-success-report.vue'

import { useProductionDailyApiStore } from '@/stores/modules/api/plan/daily-store-api.js'
import dayjs from 'dayjs'

import DashboardHeaderGeneric from '@/components/generic/DashboardHeaderGeneric.vue'
import DateRangeGeneric from '@/components/prime-vue/DateRangeGeneric.vue'

export default {
  name: 'ProductionDashboardView',
  components: {
    DashboardStatsCards,
    DashboardChartSection,
    DashboardSummaryTables,
    DashboardRecentActivities,
    DashboardStatusTrends,
    DashboardScrapWeight,
    MonthlySuccessReport,
    DashboardHeaderGeneric,
    DateRangeGeneric
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
      filter: {
        start: null,
        end: null
      }
    }
  },
  computed: {
    // Raw Data
    dataAtDate() {
      return this.dailyApiStore.getDataAtDate
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

    // Recent Activities from API Store
    recentActivities() {
      return this.dailyApiStore.getFormattedRecentActivities(10)
    },

    // Loading State from API Store
    isLoading() {
      return this.dailyApiStore.getIsLoading
    }
  },
  mounted() {
    this.loadDashboardData()
  },
  methods: {
    async loadDashboardData() {
      // Load dashboard data using the DailyPlan API
      await this.dailyApiStore.fetchDailyPlan(false, this.filter)
    },

    async refreshDashboard() {
      // Force refresh all dashboard data
      await this.dailyApiStore.refreshDashboard(this.filter)
    },

    async applyFilter() {
      // Force refetch when the date range filter changes
      await this.dailyApiStore.fetchDailyPlan(true, this.filter)
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
