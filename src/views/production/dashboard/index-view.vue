<template>
  <div class="app-container production-dashboard">
    <div class="app-container">
      <!-- Dashboard Header with Refresh -->
      <div class="row">
        <div class="col-12">
          <div class="dashboard-header">
            <div class="header-info">
              <h3>{{ $t('view.production.dashboard.title') }}</h3>
              <div class="data-info">
                <small class="text-muted" v-if="dataAtDate">
                  <i class="bi bi-clock"></i>
                  {{ $t('view.production.dashboard.lastUpdate') }}: {{ formatDateTime(dataAtDate) }}
                </small>
              </div>
            </div>
            <button @click="refreshDashboard" class="btn btn-outline-main" :disabled="isLoading">
              <i class="bi bi-arrow-clockwise" :class="{ spinning: isLoading }"></i>
              {{ $t('view.stock.gem.dashboard.lastUpdate') }}
            </button>
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
                :class="{ active: activeTab === 'summary' }"
                @click="activeTab = 'summary'"
              >
                <i class="bi bi-graph-up"></i>
                สรุปภาพรวม
              </button>
            </li>
            <li class="nav-item">
              <button
                class="nav-link"
                :class="{ active: activeTab === 'daily' }"
                @click="activeTab = 'daily'"
              >
                <i class="bi bi-calendar-day"></i>
                {{ $t('view.production.dashboard.daily') }}
              </button>
            </li>
            <li class="nav-item">
              <button
                class="nav-link"
                :class="{ active: activeTab === 'weekly' }"
                @click="activeTab = 'weekly'"
              >
                <i class="bi bi-calendar-week"></i>
                รายสัปดาห์
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

        <!-- Dashboard Recent Activities Component -->
        <div class="row">
          <div class="col-12">
            <DashboardRecentActivities :recentActivities="recentActivities" />
          </div>
        </div>
      </div>

      <!-- Daily Tab Content -->
      <div v-show="activeTab === 'daily'" class="tab-content">
        <div class="row">
          <div class="col-12">
            <div class="tab-placeholder">
              <div class="placeholder-content">
                <i class="bi bi-calendar-day"></i>
                <h4>รายงานรายวัน</h4>
                <p>รายงานรายวัน เร็วๆ นี้</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Weekly Tab Content -->
      <div v-show="activeTab === 'weekly'" class="tab-content">
        <div class="row">
          <div class="col-12">
            <div class="tab-placeholder">
              <div class="placeholder-content">
                <i class="bi bi-calendar-week"></i>
                <h4>รายงานรายสัปดาห์</h4>
                <p>รายงานรายสัปดาห์ เร็วๆ นี้</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Monthly Tab Content -->
      <div v-show="activeTab === 'monthly'" class="tab-content">
        <div class="row">
          <div class="col-12">
            <div class="tab-placeholder">
              <div class="placeholder-content">
                <i class="bi bi-calendar-month"></i>
                <h4>{{ $t('view.production.dashboard.monthlyReport') }}</h4>
                <p>{{ $t('view.production.dashboard.monthlyComingSoon') }}</p>
              </div>
            </div>
          </div>
        </div>
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

import { useProductionDailyApiStore } from '@/stores/modules/api/plan/daily-store-api.js'
import dayjs from 'dayjs'

export default {
  name: 'ProductionDashboardView',
  components: {
    DashboardStatsCards,
    DashboardChartSection,
    DashboardSummaryTables,
    DashboardRecentActivities,
    DashboardStatusTrends
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
      breadcrumb: [
        {
          label: this.$t('breadcrumb.production.main'),
          to: '/production'
        },
        {
          label: this.$t('breadcrumb.production.dashboard'),
          active: true
        }
      ]
    }
  },
  computed: {
    // Raw Data
    dataAtDate() {
      return this.dailyApiStore.getDataAtDate
    },

    // Dashboard Statistics from API Store
    dashboardStats() {
      return this.dailyApiStore.getDashboardStats
    },
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
      try {
        // Load dashboard data using the DailyPlan API
        await this.dailyApiStore.fetchDailyPlan()
      } catch (error) {
        console.error('Error loading dashboard data:', error)
        this.$swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load dashboard data'
        })
      }
    },

    async refreshDashboard() {
      try {
        // Force refresh all dashboard data
        await this.dailyApiStore.refreshDashboard()
      } catch (error) {
        console.error('Error refreshing dashboard:', error)
        this.$swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to refresh dashboard'
        })
      }
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
  background-color: #f8f9fa;
  min-height: 100vh;

  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

    .spinning {
      animation: spin 1s linear infinite;
    }
  }

  // Dashboard Tabs Styling (matching gem dashboard)
  .dashboard-tabs {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 0 20px;

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

  // Tab Content
  .tab-content {
    background: transparent;
    border: none;
    //padding: 0px 0;
  }

  // Tab Placeholder
  .tab-placeholder {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 60px 20px;
    text-align: center;

    .placeholder-content {
      i {
        font-size: 64px;
        color: $base-sub-color;
        margin-bottom: 20px;
      }

      h4 {
        color: $base-font-color;
        margin-bottom: 10px;
      }

      p {
        color: $base-sub-color;
        margin: 0;
      }
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

// Responsive adjustments
@media (max-width: 768px) {
  .production-dashboard {
    .dashboard-header {
      flex-direction: column;
      gap: 15px;
      text-align: center;
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
