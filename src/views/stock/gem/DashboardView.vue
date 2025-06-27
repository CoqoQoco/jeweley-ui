<template>
  <div class="app-container stock-gem-dashboard">
    <!-- Dashboard Header with Refresh and Filters -->
    <div class="row mb-3">
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
            <!-- Filter Dropdown -->
            <div class="dropdown me-2">
              <button
                class="btn btn-outline-secondary dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
              >
                <i class="bi bi-funnel"></i>
                {{ $t('view.stock.gem.dashboard.filters') }}
              </button>
              <div class="dropdown-menu p-3" style="min-width: 250px">
                <div class="mb-2">
                  <label class="form-label">{{ $t('view.stock.gem.dashboard.groupName') }}</label>
                  <select class="form-select form-select-sm" v-model="filters.groupName">
                    <option value="">{{ $t('view.stock.gem.dashboard.allGroups') }}</option>
                    <option v-for="group in gemGroups" :key="group" :value="group">
                      {{ group }}
                    </option>
                  </select>
                </div>
                <div class="mb-2">
                  <label class="form-label">{{ $t('view.stock.gem.dashboard.shape') }}</label>
                  <select class="form-select form-select-sm" v-model="filters.shape">
                    <option value="">{{ $t('view.stock.gem.dashboard.allShapes') }}</option>
                    <option v-for="shape in gemShapes" :key="shape" :value="shape">
                      {{ shape }}
                    </option>
                  </select>
                </div>
                <div class="mb-3">
                  <label class="form-label">{{ $t('view.stock.gem.dashboard.grade') }}</label>
                  <select class="form-select form-select-sm" v-model="filters.grade">
                    <option value="">{{ $t('view.stock.gem.dashboard.allGrades') }}</option>
                    <option v-for="grade in gemGrades" :key="grade" :value="grade">
                      {{ grade }}
                    </option>
                  </select>
                </div>
                <div class="d-flex gap-2">
                  <button @click="applyFilters" class="btn btn-primary btn-sm flex-fill">
                    {{ $t('button.apply') }}
                  </button>
                  <button @click="clearFilters" class="btn btn-outline-secondary btn-sm">
                    {{ $t('button.clear') }}
                  </button>
                </div>
              </div>
            </div>
            <!-- Refresh Button -->
            <button @click="refreshDashboard" class="btn btn-outline-main" :disabled="isLoading">
              <i class="bi bi-arrow-clockwise" :class="{ spinning: isLoading }"></i>
              {{ $t('button.refresh') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Dashboard Report Tabs -->
    <div class="row mb-3">
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
      <!-- Dashboard Stats Cards -->
      <div class="row mb-4">
        <!-- Total Gem Types -->
        <div class="col-lg-3 col-md-6 mb-3">
          <div class="stat-card total">
            <div class="stat-card-body">
              <div class="stat-icon">
                <i class="bi bi-gem"></i>
              </div>
              <div class="stat-content">
                <h3>{{ stockSummary.totalGemTypes }}</h3>
                <p>{{ $t('view.stock.gem.dashboard.totalGemTypes') }}</p>
                <small class="stat-detail">{{
                  $t('view.stock.gem.dashboard.uniqueGemVarieties')
                }}</small>
              </div>
            </div>
          </div>
        </div>

        <!-- Total Quantity -->
        <div class="col-lg-3 col-md-6 mb-3">
          <div class="stat-card process">
            <div class="stat-card-body">
              <div class="stat-icon">
                <i class="bi bi-boxes"></i>
              </div>
              <div class="stat-content">
                <h3>{{ formatNumber(stockSummary.totalQuantity) }}</h3>
                <p>{{ $t('view.stock.gem.dashboard.totalQuantity') }}</p>
                <small class="stat-detail"
                  >{{ formatNumber(stockSummary.totalQuantityWeight) }}
                  {{ $t('view.stock.gem.dashboard.totalWeight') }}</small
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Total Value -->
        <div class="col-lg-3 col-md-6 mb-3">
          <div class="stat-card completed">
            <div class="stat-card-body">
              <div class="stat-icon">
                <i class="bi bi-currency-dollar"></i>
              </div>
              <div class="stat-content">
                <h3>{{ formatCurrency(stockSummary.totalValue) }}</h3>
                <p>{{ $t('view.stock.gem.dashboard.totalValue') }}</p>
                <small class="stat-detail">{{
                  $t('view.stock.gem.dashboard.inventoryValue')
                }}</small>
              </div>
            </div>
          </div>
        </div>

        <!-- Low Stock Alert -->
        <div class="col-lg-3 col-md-6 mb-3">
          <div class="stat-card overdue">
            <div class="stat-card-body">
              <div class="stat-icon">
                <i class="bi bi-exclamation-triangle"></i>
              </div>
              <div class="stat-content">
                <h3>{{ stockSummary.lowStockCount }}</h3>
                <p>{{ $t('view.stock.gem.dashboard.lowStockItems') }}</p>
                <small class="stat-detail"
                  >{{ stockSummary.zeroStockCount }}
                  {{ $t('view.stock.gem.dashboard.outOfStock') }}</small
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- chart -->
      <div class="row">
        <div class="col-lg-12 col-md-12 mb-4">
          <div class="chart-card">
            <div class="chart-card-header">
              <h5>{{ $t('view.stock.gem.dashboard.categoryBreakdown') }}</h5>
            </div>
            <div class="chart-card-body">
              <HorizontalBarChart
                v-if="categoryChartData && categoryChartData.report?.length > 0"
                :data="categoryChartData"
                :title="$t('view.stock.gem.dashboard.categoryBreakdown')"
                :height="400"
                :show-data-labels="true"
                :datasetFields="datasetFields"
                :chartName="chartName"
                :maxBarThickness="2"
              />
              <div v-else-if="isLoading" class="chart-loading">
                <div class="loading-spinner">
                  <i class="bi bi-arrow-repeat"></i>
                </div>
                <p>{{ $t('view.stock.gem.dashboard.loadingChart') }}</p>
              </div>
              <div v-else class="chart-empty">
                <i class="bi bi-graph-up"></i>
                <p>{{ $t('view.stock.gem.dashboard.noData') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts and Analysis -->
      <div class="row">
        <!-- Category Breakdown Chart -->
        <div class="col-lg-8 col-md-12 mb-4">
          <!-- Top Movements Table -->
          <div class="summary-card mt-3">
            <div class="summary-header">
              <h5>{{ $t('view.stock.gem.dashboard.topMovements') }}</h5>
            </div>
            <div class="summary-body">
              <div class="summary-table">
                <div class="table-header">
                  <div class="col">{{ $t('view.stock.gem.dashboard.gemCode') }}</div>
                  <div class="col">{{ $t('view.stock.gem.dashboard.category') }}</div>
                  <div class="col">{{ $t('view.stock.gem.dashboard.transactions') }}</div>
                  <div class="col">{{ $t('view.stock.gem.dashboard.totalMoved') }}</div>
                </div>
                <div v-for="movement in topMovements" :key="movement.code" class="table-row">
                  <div class="col">{{ movement.code }}</div>
                  <div class="col">{{ movement.groupName }} - {{ movement.shape }}</div>
                  <div class="col">{{ movement.transactionCount }}</div>
                  <div class="col">{{ formatNumber(movement.totalQuantityMoved) }}</div>
                </div>
              </div>
              <div v-if="!topMovements || topMovements.length === 0" class="summary-empty">
                <i class="bi bi-activity"></i>
                <p>{{ $t('view.stock.gem.dashboard.noMovements') }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Price Alerts and Trends -->
        <div class="col-lg-4 col-md-12 mb-4">
          <!-- Price Alerts -->
          <div class="trends-card">
            <div class="trends-header">
              <h5>{{ $t('view.stock.gem.dashboard.priceAlerts') }}</h5>
            </div>
            <div class="trends-body">
              <div v-for="alert in priceAlerts" :key="alert.code" class="trend-item">
                <div class="trend-info">
                  <h6>{{ alert.code }}</h6>
                  <small class="text-muted">{{ alert.groupName }} - {{ alert.shape }}</small>
                  <div class="trend-stats">
                    <span class="price-old">{{ formatCurrency(alert.previousPrice) }}</span>
                    <i class="bi bi-arrow-right mx-1"></i>
                    <span class="price-new">{{ formatCurrency(alert.newPrice) }}</span>
                  </div>
                </div>
                <div class="trend-direction">
                  <span :class="['percentage-badge', alert.changeType.toLowerCase()]">
                    {{ alert.changePercentage > 0 ? '+' : ''
                    }}{{ alert.changePercentage.toFixed(1) }}%
                  </span>
                </div>
              </div>
              <div v-if="!priceAlerts || priceAlerts.length === 0" class="trends-empty">
                <i class="bi bi-currency-exchange"></i>
                <p>{{ $t('view.stock.gem.dashboard.noPriceChanges') }}</p>
              </div>
            </div>
          </div>

          <!-- Available vs On Process -->
          <div class="summary-card mt-3">
            <div class="summary-header">
              <h5>{{ $t('view.stock.gem.dashboard.availability') }}</h5>
            </div>
            <div class="summary-body">
              <div class="availability-stats">
                <div class="stat-item available">
                  <i class="bi bi-check-circle"></i>
                  <div class="stat-content">
                    <h4>{{ formatNumber(stockSummary.availableQuantity) }}</h4>
                    <small>{{ $t('view.stock.gem.dashboard.available') }}</small>
                  </div>
                </div>
                <div class="stat-item on-process">
                  <i class="bi bi-arrow-repeat"></i>
                  <div class="stat-content">
                    <h4>{{ formatNumber(stockSummary.totalOnProcessQuantity) }}</h4>
                    <small>{{ $t('view.stock.gem.dashboard.onProcess') }}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Today Tab -->
    <div v-show="activeTab === 'today'" class="tab-content">
      <div class="row">
        <!-- Today's Summary Cards -->
        <div class="col-12 mb-4">
          <div class="row">
            <div class="col-lg-3 col-md-6 mb-3">
              <div class="stat-card today">
                <div class="stat-card-body">
                  <div class="stat-icon">
                    <i class="bi bi-activity"></i>
                  </div>
                  <div class="stat-content">
                    <h3>{{ todaySummary.totalTransactions }}</h3>
                    <p>{{ $t('view.stock.gem.dashboard.todayTransactions') }}</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-lg-3 col-md-6 mb-3">
              <div class="stat-card today">
                <div class="stat-card-body">
                  <div class="stat-icon">
                    <i class="bi bi-currency-exchange"></i>
                  </div>
                  <div class="stat-content">
                    <h3>{{ todaySummary.priceChanges }}</h3>
                    <p>{{ $t('view.stock.gem.dashboard.priceChanges') }}</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-lg-3 col-md-6 mb-3">
              <div class="stat-card today">
                <div class="stat-card-body">
                  <div class="stat-icon">
                    <i class="bi bi-plus-circle"></i>
                  </div>
                  <div class="stat-content">
                    <h3>{{ todaySummary.newStockItems }}</h3>
                    <p>{{ $t('view.stock.gem.dashboard.newItems') }}</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-lg-3 col-md-6 mb-3">
              <div class="stat-card today">
                <div class="stat-card-body">
                  <div class="stat-icon">
                    <i class="bi bi-exclamation-triangle"></i>
                  </div>
                  <div class="stat-content">
                    <h3>{{ todaySummary.lowStockAlerts }}</h3>
                    <p>{{ $t('view.stock.gem.dashboard.lowStockAlerts') }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Today's Transactions -->
        <div class="col-12">
          <div class="activities-card">
            <div class="activities-header">
              <h5>{{ $t('view.stock.gem.dashboard.todayTransactions') }}</h5>
              <div class="activities-count">
                <span class="badge bg-primary">{{ todayTransactions.length }}</span>
              </div>
            </div>
            <div class="activities-body">
              <div v-if="todayTransactions.length > 0" class="activities-list">
                <div
                  v-for="transaction in todayTransactions.slice(0, 10)"
                  :key="transaction.running"
                  class="activity-item"
                >
                  <div class="activity-icon">
                    <i :class="getTransactionIcon(transaction.type)"></i>
                  </div>
                  <div class="activity-content">
                    <div class="activity-header">
                      <h6>{{ transaction.code }} - {{ transaction.groupName }}</h6>
                      <span class="activity-time">{{
                        formatDateTime(transaction.createDate)
                      }}</span>
                    </div>
                    <p class="activity-description">
                      {{ transaction.typeName }} - {{ $t('view.stock.gem.dashboard.quantity') }}:
                      {{ formatNumber(transaction.qty) }}
                    </p>
                    <div class="activity-details">
                      <div class="detail-row">
                        <span class="detail-label"
                          >{{ $t('view.stock.gem.dashboard.status') }}:</span
                        >
                        <span class="detail-value">{{ transaction.status }}</span>
                      </div>
                      <div class="detail-row" v-if="transaction.jobOrPo">
                        <span class="detail-label"
                          >{{ $t('view.stock.gem.dashboard.jobOrPo') }}:</span
                        >
                        <span class="detail-value">{{ transaction.jobOrPo }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="activities-empty">
                <i class="bi bi-clock-history"></i>
                <p>{{ $t('view.stock.gem.dashboard.noTodayTransactions') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Weekly and Monthly tabs would be similar structures -->
    <!-- For brevity, implementing placeholders -->
    <div v-show="activeTab === 'weekly'" class="tab-content">
      <div class="text-center p-4">
        <i class="bi bi-calendar-week" style="font-size: 3rem; color: #921313"></i>
        <h4 class="mt-3">{{ $t('view.stock.gem.dashboard.weeklyReportComingSoon') }}</h4>
      </div>
    </div>

    <div v-show="activeTab === 'monthly'" class="tab-content">
      <div class="text-center p-4">
        <i class="bi bi-calendar-month" style="font-size: 3rem; color: #921313"></i>
        <h4 class="mt-3">{{ $t('view.stock.gem.dashboard.monthlyReportComingSoon') }}</h4>
      </div>
    </div>
  </div>
</template>

<script>
import HorizontalBarChart from '@/components/prime-vue/HorizontalBarChart.vue'
import { useStockGemDashboardStore } from '@/stores/modules/api/stock/stock-gem-dashboard-store.js'
import dayjs from 'dayjs'

export default {
  name: 'StockGemDashboardView',
  components: {
    HorizontalBarChart
  },
  setup() {
    const dashboardStore = useStockGemDashboardStore()
    return {
      dashboardStore
    }
  },
  data() {
    return {
      activeTab: 'overview',
      filters: {
        groupName: '',
        shape: '',
        grade: ''
      },
      gemGroups: ['DIAMOND', 'RUBY', 'SAPPHIRE', 'EMERALD', 'PEARL'],
      gemShapes: ['ROUND', 'OVAL', 'SQUARE', 'HEART', 'MARQUISE'],
      gemGrades: ['A', 'AA', 'AAA', 'AAAA'],
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
    // Loading state
    isLoading() {
      return this.dashboardStore.getIsLoading
    },
    dataAtDate() {
      return this.dashboardStore.getLastUpdated
    },

    // Dashboard data
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

    // Today's data
    todaySummary() {
      return this.dashboardStore.getTodaySummary
    },
    todayTransactions() {
      return this.dashboardStore.getTodayTransactions
    },

    // Chart data
    categoryChartData() {
      console.log('Fetching category chart data...', this.dashboardStore.getCategoryChartData)
      return this.dashboardStore.getCategoryChartData
    }
  },
  async mounted() {
    await this.loadDashboardData()
  },
  methods: {
    async loadDashboardData() {
      try {
        await this.dashboardStore.fetchDashboard(this.filters)
        if (this.activeTab === 'today') {
          await this.dashboardStore.fetchTodayReport(this.filters)
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error)
        this.$swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load dashboard data'
        })
      }
    },

    async setActiveTab(tab) {
      this.activeTab = tab

      try {
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
      } catch (error) {
        console.error(`Error loading ${tab} data:`, error)
      }
    },

    async applyFilters() {
      await this.loadDashboardData()
    },

    async clearFilters() {
      this.filters = {
        groupName: '',
        shape: '',
        grade: ''
      }
      await this.loadDashboardData()
    },

    async refreshDashboard() {
      try {
        await this.dashboardStore.refreshAll(this.filters)
      } catch (error) {
        console.error('Error refreshing dashboard:', error)
        this.$swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to refresh dashboard'
        })
      }
    },

    getTransactionIcon(type) {
      switch (type) {
        case 1:
          return 'bi bi-box-arrow-in-down text-success'
        case 2:
          return 'bi bi-box-arrow-up text-danger'
        default:
          return 'bi bi-arrow-left-right text-warning'
      }
    },

    formatNumber(value) {
      if (!value) return '0'
      return new Intl.NumberFormat().format(value)
    },

    formatCurrency(value) {
      if (!value) return '฿0'
      return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB'
      }).format(value)
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

    &.total {
      border-left-color: $base-font-color;
    }
    &.process {
      border-left-color: $base-green;
    }
    &.completed {
      border-left-color: $base-warning;
    }
    &.overdue {
      border-left-color: $base-red;
    }
    &.today {
      border-left-color: #6f42c1;
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
            align-items: center;
            gap: 5px;

            .price-old,
            .price-new {
              font-size: 12px;
              font-weight: 500;
            }

            .price-old {
              color: $base-sub-color;
            }

            .price-new {
              color: $base-font-color;
            }
          }
        }

        .trend-direction {
          .percentage-badge {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: bold;

            &.increase {
              background: #d4edda;
              color: #155724;
            }

            &.decrease {
              background: #f8d7da;
              color: #721c24;
            }
          }
        }
      }
    }
  }

  .summary-card {
    .summary-body {
      .summary-table {
        .table-header,
        .table-row {
          display: grid;
          grid-template-columns: 2fr 2fr 1fr 1fr;
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
      }

      .availability-stats {
        display: flex;
        gap: 20px;

        .stat-item {
          flex: 1;
          display: flex;
          align-items: center;
          padding: 15px;
          border-radius: 8px;

          &.available {
            background: #d4edda;
            color: #155724;
          }

          &.on-process {
            background: #fff3cd;
            color: #856404;
          }

          i {
            font-size: 24px;
            margin-right: 12px;
          }

          .stat-content {
            h4 {
              margin: 0;
              font-size: 20px;
              font-weight: bold;
            }

            small {
              font-size: 11px;
              opacity: 0.8;
            }
          }
        }
      }
    }
  }

  .activities-body {
    .activities-list {
      .activity-item {
        display: flex;
        align-items: flex-start;
        padding: 15px 0;
        border-bottom: 1px solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        .activity-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: #f8f9fa;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 15px;
          flex-shrink: 0;

          i {
            font-size: 16px;
          }
        }

        .activity-content {
          flex: 1;

          .activity-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 5px;

            h6 {
              color: $base-font-color;
              font-weight: bold;
              margin: 0;
              font-size: 14px;
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
            margin: 0 0 8px 0;
            font-size: 12px;
          }

          .activity-details {
            background: #f8f9fa;
            border-radius: 4px;
            padding: 8px;

            .detail-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 3px;
              font-size: 11px;

              &:last-child {
                margin-bottom: 0;
              }

              .detail-label {
                color: $base-sub-color;
                font-weight: 600;
              }

              .detail-value {
                color: $base-font-color;
              }
            }
          }
        }
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
  .stock-gem-dashboard {
    .dashboard-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 15px;

      .header-controls {
        width: 100%;
        justify-content: space-between;
      }
    }

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
