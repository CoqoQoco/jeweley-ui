<template>
  <div class="app-container production-dashboard">
    <!-- <PageTitleMain 
      :title="$t('breadcrumb.production.dashboard')" 
      :breadcrumb="breadcrumb"
    /> -->

    <div class="app-container">
      <!-- Dashboard Header with Refresh -->
      <div class="row mb-3">
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
              อัพเดตข้อมูล
            </button>
          </div>
        </div>
      </div>

      <!-- Dashboard Stats Cards -->
      <div class="row mb-4">
        <!-- Total Plans -->
        <div class="col-lg-3 col-md-6 mb-3">
          <div class="stat-card total">
            <div class="stat-card-body">
              <div class="stat-icon">
                <i class="bi bi-diagram-3"></i>
              </div>
              <div class="stat-content">
                <h3>{{ totalPlans }}</h3>
                <p>{{ $t('view.production.dashboard.totalPlans') }}</p>
                <small class="stat-detail">{{
                  $t('view.production.dashboard.allActivePlans')
                }}</small>
              </div>
            </div>
          </div>
        </div>

        <!-- In Progress (Process) -->
        <div class="col-lg-3 col-md-6 mb-3">
          <div class="stat-card process">
            <div class="stat-card-body">
              <div class="stat-icon">
                <i class="bi bi-gear-wide-connected"></i>
              </div>
              <div class="stat-content">
                <h3>{{ inProgressPlans }}</h3>
                <p>{{ $t('view.production.dashboard.inProcess') }}</p>
                <small class="stat-detail">{{
                  $t('view.production.dashboard.currentlyWorking')
                }}</small>
              </div>
            </div>
          </div>
        </div>

        <!-- Completed Yesterday -->
        <div class="col-lg-3 col-md-6 mb-3">
          <div class="stat-card completed">
            <div class="stat-card-body">
              <div class="stat-icon">
                <i class="bi bi-check-circle-fill"></i>
              </div>
              <div class="stat-content">
                <h3>{{ completedPlans }}</h3>
                <p>{{ $t('view.production.dashboard.completedYesterday') }}</p>
                <small class="stat-detail">{{
                  $t('view.production.dashboard.yesterdayFinished')
                }}</small>
              </div>
            </div>
          </div>
        </div>

        <!-- Completed Today -->
        <div class="col-lg-3 col-md-6 mb-3">
          <div class="stat-card summary today">
            <div class="stat-card-body">
              <div class="stat-icon">
                <i class="bi bi-calendar-check"></i>
              </div>
              <div class="stat-content">
                <h3>{{ summary.completedToday }}</h3>
                <p>{{ $t('view.production.dashboard.completedToday') }}</p>
                <small class="stat-detail">{{
                  $t('view.production.dashboard.finishedToday')
                }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Summary Stats Row -->
      <div class="row mb-4" v-if="summary">
        <!-- <div class="col-lg-3 col-md-6 mb-3">
          <div class="stat-card summary active">
            <div class="stat-card-body">
              <div class="stat-icon">
                <i class="bi bi-activity"></i>
              </div>
              <div class="stat-content">
                <h3>{{ summary.totalActiveProjects }}</h3>
                <p>{{ $t('view.production.dashboard.activeProjects') }}</p>
                <small class="stat-detail">{{
                  $t('view.production.dashboard.currentlyActive')
                }}</small>
              </div>
            </div>
          </div>
        </div> -->

        <!-- Overdue Plans -->
        <div class="col-lg-3 col-md-6 mb-3">
          <div class="stat-card overdue">
            <div class="stat-card-body">
              <div class="stat-icon">
                <i class="bi bi-exclamation-triangle-fill"></i>
              </div>
              <div class="stat-content">
                <h3>{{ pendingPlans }}</h3>
                <p>{{ $t('view.production.dashboard.overduePlans') }}</p>
                <small class="stat-detail">{{
                  $t('view.production.dashboard.behindSchedule')
                }}</small>
              </div>
            </div>
          </div>
        </div>

        <!-- <div class="col-lg-3 col-md-6 mb-3">
          <div class="stat-card summary approval">
            <div class="stat-card-body">
              <div class="stat-icon">
                <i class="bi bi-clipboard-check"></i>
              </div>
              <div class="stat-content">
                <h3>{{ summary.pendingApproval }}</h3>
                <p>{{ $t('view.production.dashboard.pendingApproval') }}</p>
                <small class="stat-detail">{{
                  $t('view.production.dashboard.waitingApproval')
                }}</small>
              </div>
            </div>
          </div>
        </div> -->

        <div class="col-lg-3 col-md-6 mb-3">
          <div class="stat-card summary percentage">
            <div class="stat-card-body">
              <div class="stat-icon">
                <i class="bi bi-percent"></i>
              </div>
              <div class="stat-content">
                <h3>{{ summary.percentageCompleted.toFixed(2) }}%</h3>
                <p>{{ $t('view.production.dashboard.completionRate') }}</p>
                <small class="stat-detail">{{
                  $t('view.production.dashboard.overallProgress')
                }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts and Summary Section -->
      <div class="row">
        <!-- Production Status Chart -->
        <div class="col-lg-8 col-md-12 mb-4">
          <div class="">
            <!-- <div class="chart-card-header">
              <h5>{{ $t('view.production.dashboard.statusChart') }}</h5>
              <div class="chart-controls">
                <button 
                  @click="refreshChart" 
                  class="btn btn-outline-main btn-sm"
                  :disabled="isLoading"
                >
                  <i class="bi bi-arrow-clockwise"></i>
                  {{ $t('button.refresh') }}
                </button>
              </div>
            </div> -->
            <div class="chart-card-body">
              <HorizontalBarChart
                v-if="chartData && chartData.report.length > 0"
                :data="chartData"
                :title="$t('view.production.dashboard.productionStatus')"
                :use-thai-labels="$i18n.locale === 'th'"
                :height="600"
                :show-data-labels="true"
              />
              <div v-else-if="isLoading" class="chart-loading">
                <div class="loading-spinner">
                  <i class="bi bi-arrow-repeat"></i>
                </div>
                <p>{{ $t('view.production.dashboard.loadingChart') }}</p>
              </div>
              <div v-else class="chart-empty">
                <i class="bi bi-graph-up"></i>
                <p>{{ $t('view.production.dashboard.noData') }}</p>
              </div>
            </div>

            <!-- product type -->
            <div class="summary-card mt-3">
              <div class="summary-header">
                <h5>{{ $t('view.production.dashboard.productTypeSummary') }}</h5>
              </div>
              <div class="summary-body">
                <div class="summary-table">
                  <div class="table-header">
                    <div class="col">{{ $t('view.production.dashboard.productType') }}</div>
                    <div class="col">{{ $t('view.production.dashboard.orders') }}</div>
                    <div class="col">{{ $t('view.production.dashboard.count') }}</div>
                    <!-- <div class="col">{{ $t('view.production.dashboard.weight') }}</div> -->
                  </div>
                  <div
                    v-for="product in productTypeSummary"
                    :key="product.productType"
                    class="table-row"
                  >
                    <div class="col">{{ product.productTypeName }}</div>
                    <div class="col">{{ product.count }}</div>
                    <div class="col">{{ product.totalQty }}</div>
                    <!-- <div class="col">
                      {{ product.totalWeight ? product.totalWeight.toFixed(2) : '-' }}
                    </div> -->
                  </div>
                </div>
                <div
                  v-if="!productTypeSummary || productTypeSummary.length === 0"
                  class="summary-empty"
                >
                  <i class="bi bi-box"></i>
                  <p>{{ $t('view.production.dashboard.noProductData') }}</p>
                </div>
              </div>
            </div>

            <!-- customer -->
            <div class="summary-card mt-3">
              <div class="summary-header">
                <h5>{{ $t('view.production.dashboard.customerTypeSummary') }}</h5>
              </div>
              <div class="summary-body">
                <div class="summary-table">
                  <div class="table-header">
                    <div class="col">{{ $t('view.production.dashboard.customerType') }}</div>
                    <div class="col">{{ $t('view.production.dashboard.orders') }}</div>
                    <div class="col">{{ $t('view.production.dashboard.count') }}</div>
                  </div>
                  <div
                    v-for="customer in customerTypeSummary"
                    :key="customer.customerType"
                    class="table-row"
                  >
                    <div class="col">{{ customer.customerTypeName }}</div>
                    <div class="col">{{ customer.count }}</div>
                    <div class="col">{{ customer.totalQty }}</div>
                  </div>
                </div>
                <div
                  v-if="!customerTypeSummary || customerTypeSummary.length === 0"
                  class="summary-empty"
                >
                  <i class="bi bi-people"></i>
                  <p>{{ $t('view.production.dashboard.noCustomerData') }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Status Trends -->
        <div class="col-lg-4 col-md-12 mb-4">
          <div class="trends-card">
            <div class="trends-header">
              <h5>{{ $t('view.production.dashboard.statusTrends') }}</h5>
            </div>
            <div class="trends-body">
              <div v-for="trend in statusTrends" :key="trend.status" class="trend-item">
                <div class="trend-info">
                  <h6>{{ trend.statusName }}</h6>
                  <div class="trend-stats">
                    <span class="count">{{ trend.count }}</span>
                    <span class="percentage">{{ trend.percentage }}%</span>
                  </div>
                </div>
                <!-- <div class="trend-direction">
                  <i
                    :class="getTrendIcon(trend.trendDirection)"
                    :style="{ color: getTrendColor(trend.trendDirection) }"
                  ></i>
                </div> -->
              </div>
              <div v-if="!statusTrends || statusTrends.length === 0" class="trends-empty">
                <i class="bi bi-graph-up"></i>
                <p>{{ $t('view.production.dashboard.noTrends') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activities -->
      <div class="row">
        <div class="col-12">
          <div class="activities-card">
            <div class="activities-header">
              <h5>{{ $t('view.production.dashboard.recentActivities') }}</h5>
              <div class="activities-count">
                <span class="badge bg-primary">{{ recentActivities.length }}</span>
              </div>
            </div>
            <div class="activities-body">
              <div v-if="recentActivities.length > 0" class="activities-list">
                <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
                  <div class="activity-icon">
                    <i :class="getActivityIcon(activity.type)"></i>
                  </div>
                  <div class="activity-content">
                    <div class="activity-header">
                      <h6>{{ activity.title }}</h6>
                      <span class="activity-time">{{ formatDateTime(activity.date) }}</span>
                    </div>
                    <p class="activity-description">{{ activity.description }}</p>
                    <div class="activity-details" v-if="activity.rawData">
                      <div class="detail-row">
                        <span class="detail-label"
                          >{{ $t('view.production.dashboard.workOrder') }}:</span
                        >
                        <span class="detail-value">{{ activity.rawData.woText }}</span>
                      </div>
                      <div class="detail-row">
                        <span class="detail-label"
                          >{{ $t('view.production.dashboard.product') }}:</span
                        >
                        <span class="detail-value"
                          >{{ activity.rawData.productName }} ({{
                            activity.rawData.productNumber
                          }})</span
                        >
                      </div>
                      <div class="detail-row">
                        <span class="detail-label"
                          >{{ $t('view.production.dashboard.customer') }}:</span
                        >
                        <span class="detail-value">{{ activity.rawData.customerName }}</span>
                      </div>
                      <div class="detail-row">
                        <span class="detail-label"
                          >{{ $t('view.production.dashboard.status') }}:</span
                        >
                        <span
                          class="detail-value status"
                          :class="getStatusClass(activity.rawData.status)"
                        >
                          {{ activity.rawData.statusName }}
                        </span>
                      </div>
                      <div class="detail-row" v-if="activity.rawData.gold">
                        <span class="detail-label"
                          >{{ $t('view.production.dashboard.goldType') }}:</span
                        >
                        <span class="detail-value"
                          >{{ activity.rawData.gold }} ({{ activity.rawData.goldSize }})</span
                        >
                      </div>
                      <div class="detail-row">
                        <span class="detail-label"
                          >{{ $t('view.production.dashboard.updatedBy') }}:</span
                        >
                        <span class="detail-value">{{ activity.rawData.updateBy }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="activity-actions">
                    <router-link
                      :to="`/plan-order-tracking-update/${activity.rawData?.id || ''}`"
                      class="btn btn-sm btn-outline-primary"
                      v-if="activity.rawData?.id"
                    >
                      <i class="bi bi-eye"></i>
                      {{ $t('view.production.dashboard.viewDetails') }}
                    </router-link>
                  </div>
                </div>
              </div>
              <div v-else class="activities-empty">
                <i class="bi bi-clock-history"></i>
                <p>{{ $t('view.production.dashboard.noRecentActivities') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
//import PageTitleMain from '@/components/custom/PageTitleMain.vue'
import HorizontalBarChart from '@/components/prime-vue/HorizontalBarChart.vue'
import { useProductionDailyApiStore } from '@/stores/modules/api/plan/daily-store-api.js'
import dayjs from 'dayjs'

export default {
  name: 'ProductionDashboardView',
  components: {
    //PageTitleMain,
    HorizontalBarChart
  },
  setup() {
    const dailyApiStore = useProductionDailyApiStore()
    return {
      dailyApiStore
    }
  },
  data() {
    return {
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

    async refreshChart() {
      try {
        // Force refresh chart data from API
        await this.dailyApiStore.fetchDailyPlan(true)
      } catch (error) {
        console.error('Error refreshing chart:', error)
        this.$swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to refresh chart data'
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

    getActivityIcon(type) {
      switch (type) {
        case 'create':
          return 'bi bi-plus-circle text-success'
        case 'update':
          return 'bi bi-pencil-square text-warning'
        case 'complete':
          return 'bi bi-check-circle text-success'
        default:
          return 'bi bi-info-circle text-warning'
      }
    },

    getTrendIcon(direction) {
      switch (direction) {
        case 'up':
          return 'bi bi-trend-up'
        case 'down':
          return 'bi bi-trend-down'
        case 'stable':
        default:
          return 'bi bi-dash'
      }
    },

    getTrendColor(direction) {
      switch (direction) {
        case 'up':
          return '#28a745' // Green
        case 'down':
          return '#dc3545' // Red
        case 'stable':
        default:
          return '#6c757d' // Gray
      }
    },

    getStatusClass(status) {
      if (status === 100) return 'status-completed'
      if (status >= 50 && status < 100) return 'status-progress'
      if (status === 10) return 'status-design'
      if (status === 500) return 'status-melt'
      return 'status-progress'
    },

    formatDate(date) {
      return dayjs(date).format('DD/MM/YYYY')
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
    margin-bottom: 20px;

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

  .stat-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease;
    border-left: 4px solid $base-color;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    // Different colors for different card types
    &.total {
      border-left-color: $base-font-color;
    }
    &.process {
      border-left-color: $base-font-color;
    }
    &.completed {
      border-left-color: $base-font-color;
    }
    &.overdue {
      border-left-color: $base-font-color;
    }
    &.summary.active {
      border-left-color: $base-font-color;
    }
    &.summary.today {
      border-left-color: $base-font-color;
    }
    &.summary.approval {
      border-left-color: $base-font-color;
    }
    &.summary.percentage {
      border-left-color: $base-font-color;
    }

    .stat-card-body {
      padding: 20px;
      display: flex;
      align-items: center;

      .stat-icon {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, $base-font-color, lighten($base-font-color, 20%));
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 15px;

        i {
          font-size: 24px;
          color: white;
        }
      }

      .stat-content {
        flex: 1;

        h3 {
          font-size: 28px;
          font-weight: bold;
          color: $base-font-color;
          margin: 0 0 5px 0;
        }

        p {
          color: $base-sub-color;
          margin: 0 0 3px 0;
          font-size: 14px;
          font-weight: 600;
        }

        .stat-detail {
          color: lighten($base-sub-color, 20%);
          font-size: 11px;
          font-style: italic;
        }
      }
    }
  }

  .chart-card,
  .trends-card,
  .summary-card,
  .activities-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow: hidden;

    .chart-card-header,
    .trends-header,
    .summary-header,
    .activities-header {
      padding: 20px;
      border-bottom: 1px solid $base-color;
      display: flex;
      justify-content: space-between;
      align-items: center;

      h5 {
        color: $base-font-color;
        font-weight: bold;
        margin: 0;
      }

      .chart-controls {
        margin-left: auto;
      }

      .activities-count {
        .badge {
          font-size: 12px;
        }
      }
    }

    .chart-card-body,
    .trends-body,
    .summary-body,
    .activities-body {
      padding: 20px;

      .chart-loading,
      .chart-empty,
      .trends-empty,
      .summary-empty,
      .activities-empty {
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

        .loading-spinner i {
          animation: spin 1s linear infinite;
        }
      }
    }
  }

  // Trends Card Specific
  .trends-card {
    .trends-body {
      .trend-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 0;
        border-bottom: 1px solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        .trend-info {
          flex: 1;

          h6 {
            color: $base-font-color;
            margin: 0 0 5px 0;
            font-size: 14px;
            font-weight: 600;
          }

          .trend-stats {
            display: flex;
            gap: 10px;

            .count {
              background: $base-font-color;
              color: white;
              padding: 2px 8px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: bold;
            }

            .percentage {
              color: $base-sub-color;
              font-size: 12px;
            }
          }
        }

        .trend-direction {
          i {
            font-size: 20px;
          }
        }
      }
    }
  }

  // Summary Cards
  .summary-card {
    .summary-body {
      .summary-table {
        .table-header,
        .table-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 15px;
          padding: 10px 0;

          &.table-header {
            font-weight: bold;
            color: $base-font-color;
            border-bottom: 2px solid $base-color;
            font-size: 13px;
          }

          &.table-row {
            border-bottom: 1px solid #f0f0f0;
            font-size: 14px;

            &:last-child {
              border-bottom: none;
            }

            .col:first-child {
              font-weight: 600;
              color: $base-font-color;
            }
          }
        }

        // Customer summary has only 3 columns
        &:has(.table-row .col:nth-child(4):empty) {
          .table-header,
          .table-row {
            grid-template-columns: 2fr 1fr 1fr;
          }
        }
      }
    }
  }

  .quick-actions-body {
    padding: 10px;

    .quick-action-item {
      display: flex;
      align-items: center;
      padding: 15px;
      border-radius: 6px;
      text-decoration: none;
      color: inherit;
      transition: background-color 0.2s ease;
      margin-bottom: 10px;

      &:hover {
        background-color: #f8f9fa;
        text-decoration: none;
        color: inherit;
      }

      .action-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: lighten($base-green, 40%);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 15px;

        i {
          font-size: 18px;
          color: $base-green;
        }
      }

      .action-content {
        h6 {
          color: $base-font-color;
          font-weight: bold;
          margin: 0 0 5px 0;
          font-size: 14px;
        }

        p {
          color: $base-sub-color;
          margin: 0;
          font-size: 12px;
          line-height: 1.4;
        }
      }
    }
  }

  .activities-body {
    padding: 20px;

    .activities-list {
      .activity-item {
        display: flex;
        align-items: flex-start;
        padding: 20px 0;
        border-bottom: 1px solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        .activity-icon {
          width: 45px;
          height: 45px;
          border-radius: 50%;
          background-color: #f8f9fa;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 15px;
          flex-shrink: 0;

          i {
            font-size: 18px;
          }
        }

        .activity-content {
          flex: 1;

          .activity-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 8px;

            h6 {
              color: $base-font-color;
              font-weight: bold;
              margin: 0;
              font-size: 15px;
            }

            .activity-time {
              color: $base-sub-color;
              font-size: 11px;
              white-space: nowrap;
              margin-left: 10px;
            }
          }

          .activity-description {
            color: $base-sub-color;
            margin: 0 0 10px 0;
            font-size: 13px;
          }

          .activity-details {
            background: #f8f9fa;
            border-radius: 6px;
            padding: 12px;
            margin-top: 10px;

            .detail-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 6px;

              &:last-child {
                margin-bottom: 0;
              }

              .detail-label {
                font-size: 11px;
                color: $base-sub-color;
                font-weight: 600;
                min-width: 80px;
              }

              .detail-value {
                font-size: 11px;
                color: $base-font-color;
                text-align: right;
                flex: 1;

                &.status {
                  padding: 2px 6px;
                  border-radius: 10px;
                  font-weight: bold;
                  text-align: center;
                  max-width: fit-content;
                  margin-left: auto;

                  &.status-completed {
                    background: #038387;
                    color: white;
                  }

                  &.status-progress {
                    //background: lighten($base-warning, 40%);
                    background: #ffc21b;
                    color: $base-font-color;
                  }

                  &.status-design {
                    background: #dad4b5;
                    color: $base-font-color;
                  }

                  &.status-pending {
                    background: lighten($base-sub-color, 40%);
                    color: $base-sub-color;
                  }

                  &.status-melt {
                    background: #ff4d4d;
                    color: white;
                  }
                }
              }
            }
          }
        }

        .activity-actions {
          margin-left: 15px;
          display: flex;
          align-items: center;

          .btn {
            font-size: 11px;
            padding: 4px 8px;
          }
        }
      }
    }

    .activities-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      color: $base-sub-color;

      i {
        font-size: 48px;
        margin-bottom: 15px;
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
    .stat-card .stat-card-body {
      padding: 15px;

      .stat-icon {
        width: 50px;
        height: 50px;
        margin-right: 10px;

        i {
          font-size: 20px;
        }
      }

      .stat-content h3 {
        font-size: 24px;
      }
    }

    .chart-card-header,
    .quick-actions-header,
    .activities-header {
      padding: 15px;
    }

    .chart-card-body {
      padding: 15px;
    }
  }
}
</style>
