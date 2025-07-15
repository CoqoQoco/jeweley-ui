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
            <!-- Filter Dropdown -->
            <!-- <div class="dropdown me-2">
              <button
                class="btn btn-outline-secondary dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
              >
                <i class="bi bi-funnel"></i>
                {{ $t('view.stock.gem.dashboard.filters') }}
              </button>
              <div class="dropdown-menu p-3 ml-2" style="min-width: 250px">
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
            </div> -->
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
      <StockSummaryCards :stock-summary="stockSummary" />

      <!-- Category Breakdown Chart -->
      <CategoryChart
        :category-chart-data="categoryChartData"
        :is-loading="isLoading"
        :dataset-fields="datasetFields"
        :chart-name="chartName"
      />

      <!-- Charts and Analysis -->
      <div class="row">
        <!-- Category Breakdown Chart -->
        <div class="col-lg-8 col-md-12 mb-4">
          <!-- Top Movements Table -->
          <TopMovementsTable :top-movements="topMovements" />

          <!-- Last Activities -->
          <LastActivitiesTable :last-activities="lastActivities" />
        </div>

        <!-- Price Alerts and Trends -->
        <div class="col-lg-4 col-md-12 mb-4">
          <!-- Price Alerts -->
          <PriceAlertsPanel :price-alerts="priceAlerts" />

          <!-- Available vs On Process -->
          <!-- <AvailabilityStatus :stock-summary="stockSummary" /> -->
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

    <!-- Weekly Tab -->
    <div v-show="activeTab === 'weekly'" class="tab-content">
      <div class="row">
        <!-- Weekly Summary Cards -->
        <div class="col-12 mb-4">
          <div class="row">
            <div class="col-lg-3 col-md-6 mb-3">
              <div class="stat-card weekly">
                <div class="stat-card-body">
                  <div class="stat-icon">
                    <i class="bi bi-activity"></i>
                  </div>
                  <div class="stat-content">
                    <h3>{{ weeklySummary.totalTransactions || 0 }}</h3>
                    <p>{{ $t('view.stock.gem.dashboard.weeklyTransactions') }}</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-lg-3 col-md-6 mb-3">
              <div class="stat-card weekly">
                <div class="stat-card-body">
                  <div class="stat-icon">
                    <i class="bi bi-currency-exchange"></i>
                  </div>
                  <div class="stat-content">
                    <h3>{{ weeklySummary.priceChanges || 0 }}</h3>
                    <p>{{ $t('view.stock.gem.dashboard.priceChanges') }}</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-lg-3 col-md-6 mb-3">
              <div class="stat-card weekly">
                <div class="stat-card-body">
                  <div class="stat-icon">
                    <i class="bi bi-plus-circle"></i>
                  </div>
                  <div class="stat-content">
                    <h3>{{ weeklySummary.newStockItems || 0 }}</h3>
                    <p>{{ $t('view.stock.gem.dashboard.newItems') }}</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-lg-3 col-md-6 mb-3">
              <div class="stat-card weekly">
                <div class="stat-card-body">
                  <div class="stat-icon">
                    <i class="bi bi-exclamation-triangle"></i>
                  </div>
                  <div class="stat-content">
                    <h3>{{ weeklySummary.lowStockAlerts || 0 }}</h3>
                    <p>{{ $t('view.stock.gem.dashboard.lowStockAlerts') }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Weekly Analysis -->
        <div class="col-12">
          <div class="activities-card">
            <div class="activities-header">
              <h5>{{ $t('view.stock.gem.dashboard.weeklyAnalysis') }}</h5>
              <div class="activities-count">
                <span class="badge bg-success">{{ weeklyMovements.length || 0 }}</span>
              </div>
            </div>
            <div class="activities-body">
              <div v-if="weeklyMovements && weeklyMovements.length > 0" class="activities-list">
                <div
                  v-for="movement in weeklyMovements"
                  :key="movement.id || movement.code"
                  class="activity-item"
                >
                  <div class="activity-icon">
                    <i class="bi bi-graph-up text-success"></i>
                  </div>
                  <div class="activity-content">
                    <div class="activity-header">
                      <h6>{{ movement.code || movement.title }}</h6>
                      <span class="activity-time">{{ movement.date || movement.time }}</span>
                    </div>
                    <p class="activity-description">
                      {{ movement.description || 'Weekly activity summary' }}
                    </p>
                  </div>
                </div>
              </div>
              <div v-else class="activities-empty">
                <i class="bi bi-clock-history"></i>
                <p>{{ $t('view.stock.gem.dashboard.noWeeklyData') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Monthly Tab -->
    <div v-show="activeTab === 'monthly'" class="tab-content">
      <div class="row">
        <!-- Monthly Summary Cards -->
        <div class="col-12 mb-4">
          <div class="row">
            <div class="col-lg-3 col-md-6 mb-3">
              <div class="stat-card monthly">
                <div class="stat-card-body">
                  <div class="stat-icon">
                    <i class="bi bi-activity"></i>
                  </div>
                  <div class="stat-content">
                    <h3>{{ monthlySummary.totalTransactions || 0 }}</h3>
                    <p>{{ $t('view.stock.gem.dashboard.monthlyTransactions') }}</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-lg-3 col-md-6 mb-3">
              <div class="stat-card monthly">
                <div class="stat-card-body">
                  <div class="stat-icon">
                    <i class="bi bi-currency-exchange"></i>
                  </div>
                  <div class="stat-content">
                    <h3>{{ monthlySummary.priceChanges || 0 }}</h3>
                    <p>{{ $t('view.stock.gem.dashboard.priceChanges') }}</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-lg-3 col-md-6 mb-3">
              <div class="stat-card monthly">
                <div class="stat-card-body">
                  <div class="stat-icon">
                    <i class="bi bi-plus-circle"></i>
                  </div>
                  <div class="stat-content">
                    <h3>{{ monthlySummary.newStockItems || 0 }}</h3>
                    <p>{{ $t('view.stock.gem.dashboard.newItems') }}</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-lg-3 col-md-6 mb-3">
              <div class="stat-card monthly">
                <div class="stat-card-body">
                  <div class="stat-icon">
                    <i class="bi bi-exclamation-triangle"></i>
                  </div>
                  <div class="stat-content">
                    <h3>{{ monthlySummary.lowStockAlerts || 0 }}</h3>
                    <p>{{ $t('view.stock.gem.dashboard.lowStockAlerts') }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Monthly Transaction Summary by Gem Type -->
        <div class="col-12">
          <div class="activities-card">
            <div class="activities-header">
              <h5>{{ $t('view.stock.gem.dashboard.monthlyTransactionSummaries') }}</h5>
              <div class="activities-count">
                <span class="badge bg-info">{{ monthlyGemTransactionSummaries.length || 0 }}</span>
              </div>
            </div>
            <div class="activities-body">
              <div
                v-if="monthlyGemTransactionSummaries && monthlyGemTransactionSummaries.length > 0"
                class="transaction-summary-container"
              >
                <div class="transaction-summary-table">
                  <div class="table-header">
                    <div class="col">{{ $t('view.stock.gem.dashboard.gemType') }}</div>
                    <div class="col">{{ $t('view.stock.gem.dashboard.transactions') }}</div>
                    <div class="col">{{ $t('view.stock.gem.dashboard.qtyUsed') }}</div>
                    <div class="col">{{ $t('view.stock.gem.dashboard.weightUsed') }}</div>
                    <div class="col">{{ $t('view.stock.gem.dashboard.inbound') }}</div>
                    <div class="col">{{ $t('view.stock.gem.dashboard.outbound') }}</div>
                    <div class="col">{{ $t('view.stock.gem.dashboard.currentStock') }}</div>
                    <div class="col">{{ $t('view.stock.gem.dashboard.actions') }}</div>
                  </div>
                  <div
                    v-for="summary in monthlyGemTransactionSummaries"
                    :key="`${summary.groupName}-${summary.shape}-${summary.grade}`"
                    class="table-row-container"
                  >
                    <div class="table-row main-row">
                      <div class="col">
                        <div class="gem-type-info">
                          <strong>{{ summary.groupName }}</strong>
                          <div class="gem-details">
                            <small>{{ summary.shape }} - {{ summary.grade }}</small>
                          </div>
                        </div>
                      </div>
                      <div class="col">
                        <div class="transaction-count">
                          <strong>{{ formatNumber(summary.totalTransactions) }}</strong>
                          <div class="transaction-breakdown">
                            <small
                              >In: {{ formatNumber(summary.inboundTransactions) }} | Out:
                              {{ formatNumber(summary.outboundTransactions) }}</small
                            >
                          </div>
                        </div>
                      </div>
                      <div class="col">
                        <div class="quantity-info">
                          <strong>{{ formatNumber(summary.totalQuantityUsed) }}</strong>
                          <div class="quantity-breakdown">
                            <small
                              >In: {{ formatNumber(summary.inboundQuantity) }} | Out:
                              {{ formatNumber(summary.outboundQuantity) }}</small
                            >
                          </div>
                        </div>
                      </div>
                      <div class="col">
                        <div class="weight-info">
                          <strong>{{ formatNumber(summary.totalWeightUsed, 3) }}</strong>
                          <div class="weight-breakdown">
                            <small
                              >In: {{ formatNumber(summary.inboundWeight, 3) }} | Out:
                              {{ formatNumber(summary.outboundWeight, 3) }}</small
                            >
                          </div>
                        </div>
                      </div>
                      <div class="col">
                        <div class="inbound-info">
                          <strong>{{ formatNumber(summary.inboundQuantity) }}</strong>
                          <div class="inbound-weight">
                            <small>{{ formatNumber(summary.inboundWeight, 3) }} g</small>
                          </div>
                        </div>
                      </div>
                      <div class="col">
                        <div class="outbound-info">
                          <strong>{{ formatNumber(summary.outboundQuantity) }}</strong>
                          <div class="outbound-weight">
                            <small>{{ formatNumber(summary.outboundWeight, 3) }} g</small>
                          </div>
                        </div>
                      </div>
                      <div class="col">
                        <div class="current-stock">
                          <strong>{{ formatNumber(summary.currentQuantity) }}</strong>
                          <div class="current-weight">
                            <small>{{ formatNumber(summary.currentWeight, 3) }} g</small>
                          </div>
                        </div>
                      </div>
                      <div class="col">
                        <button
                          @click="toggleTransactionDetails(summary)"
                          class="btn btn-sm btn-outline-secondary"
                          :class="{ active: summary.showDetails }"
                        >
                          <i
                            class="bi"
                            :class="summary.showDetails ? 'bi-chevron-up' : 'bi-chevron-down'"
                          ></i>
                        </button>
                      </div>
                    </div>

                    <!-- Transaction Type Details -->
                    <div v-if="summary.showDetails" class="transaction-details">
                      <div class="details-header">
                        <h6>{{ $t('view.stock.gem.dashboard.transactionTypeBreakdown') }}</h6>
                      </div>
                      <div
                        class="transaction-types-grid"
                        v-if="summary.transactionsByType && summary.transactionsByType.length > 0"
                      >
                        <div
                          v-for="transType in summary.transactionsByType"
                          :key="transType.type"
                          class="transaction-type-card"
                        >
                          <div class="type-header">
                            <div class="type-icon">
                              <i :class="getTransactionIcon(transType.type)"></i>
                            </div>
                            <div class="type-info">
                              <h6>{{ transType.typeName }}</h6>
                              <small>Type {{ transType.type }}</small>
                            </div>
                          </div>
                          <div class="type-stats">
                            <div class="stat-row">
                              <span class="stat-label"
                                >{{ $t('view.stock.gem.dashboard.count') }}:</span
                              >
                              <span class="stat-value">{{ formatNumber(transType.count) }}</span>
                            </div>
                            <div class="stat-row">
                              <span class="stat-label"
                                >{{ $t('view.stock.gem.dashboard.quantity') }}:</span
                              >
                              <span class="stat-value">{{
                                formatNumber(transType.totalQuantity)
                              }}</span>
                            </div>
                            <div class="stat-row">
                              <span class="stat-label"
                                >{{ $t('view.stock.gem.dashboard.weight') }}:</span
                              >
                              <span class="stat-value"
                                >{{ formatNumber(transType.totalWeight, 3) }} g</span
                              >
                            </div>
                            <div class="stat-row">
                              <span class="stat-label"
                                >{{ $t('view.stock.gem.dashboard.cost') }}:</span
                              >
                              <span class="stat-value">{{
                                formatCurrency(transType.totalCost)
                              }}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div v-else class="no-transaction-types">
                        <p>{{ $t('view.stock.gem.dashboard.noTransactionTypes') }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="activities-empty">
                <i class="bi bi-gem"></i>
                <p>{{ $t('view.stock.gem.dashboard.noMonthlyTransactionData') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
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
// import AvailabilityStatus from './components/availability-status.vue'

export default {
  name: 'StockGemDashboardView',
  components: {
    StockSummaryCards,
    CategoryChart,
    TopMovementsTable,
    LastActivitiesTable,
    PriceAlertsPanel
    // AvailabilityStatus
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
    lastActivities() {
      return this.dashboardStore.getLastActivities
    },

    // Today's data
    todaySummary() {
      return this.dashboardStore.getTodaySummary
    },
    todayTransactions() {
      return this.dashboardStore.getTodayTransactions
    },

    // Weekly data
    weeklySummary() {
      return this.dashboardStore.getWeeklySummary
    },
    weeklyMovements() {
      return this.dashboardStore.getDailyMovements
    },

    // Monthly data
    monthlySummary() {
      return this.dashboardStore.getMonthlySummary
    },
    monthlyMovements() {
      return this.dashboardStore.getWeeklyComparisons
    },
    monthlyGemTransactionSummaries() {
      return this.dashboardStore.getMonthlyGemTransactionSummaries
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
            await this.dashboardStore.fetchMonthlyGemTransactionSummaries(this.filters)
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
        case 2:
        case 3:
        case 6:
          return 'bi bi-arrow-down-circle text-success'
        case 4:
        case 5:
        case 7:
          return 'bi bi-arrow-up-circle text-danger'
        default:
          return 'bi bi-arrow-left-right text-info'
      }
    },

    getTypeName(type) {
      // Map transaction type to Thai names (already handled by typeName from API)
      switch (type) {
        case 1:
          return 'รับเข้าคลัง [พลอยใหม่]'
        case 2:
          return 'รับเข้าคลัง [พลอยนอกสต๊อก]'
        case 3:
          return 'รับเข้าคลัง [พลอยคืน]'
        case 4:
          return 'จ่ายออกคลัง'
        case 5:
          return 'ยืมออกคลัง'
        case 6:
          return 'คืนเข้าคลัง'
        case 7:
          return 'เบิกออกคลัง'
        default:
          return 'อื่นๆ'
      }
    },

    formatNumber(value, decimals = 0) {
      if (!value) return '0' + (decimals > 0 ? '.'.padEnd(decimals + 1, '0') : '')
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(value)
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
    },

    toggleTransactionDetails(summary) {
      if (!summary.showDetails) {
        summary.showDetails = true
      } else {
        summary.showDetails = false
      }
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
    &.weekly {
      border-left-color: #28a745;
    }
    &.monthly {
      border-left-color: #17a2b8;
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

  .transaction-summary-container {
    .transaction-summary-table {
      .table-header {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 1fr 0.5fr;
        gap: 15px;
        padding: 12px 0;
        font-weight: bold;
        color: $base-font-color;
        border-bottom: 2px solid $base-color;
        font-size: 13px;
      }

      .table-row-container {
        border-bottom: 1px solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }
      }

      .table-row {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 1fr 0.5fr;
        gap: 15px;
        padding: 12px 0;
        font-size: 13px;

        &.main-row {
          transition: background-color 0.2s ease;

          &:hover {
            background-color: #f8f9fa;
          }
        }
      }
    }

    .transaction-details {
      background: #f8f9fa;
      padding: 15px;
      border-top: 1px solid #e9ecef;

      .details-header {
        margin-bottom: 15px;

        h6 {
          color: $base-font-color;
          font-weight: 600;
          margin: 0;
        }
      }

      .transaction-types-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 15px;

        .transaction-type-card {
          background: white;
          border-radius: 8px;
          padding: 15px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          border-left: 4px solid $base-color;

          .type-header {
            display: flex;
            align-items: center;
            margin-bottom: 12px;

            .type-icon {
              width: 40px;
              height: 40px;
              border-radius: 50%;
              background-color: #f8f9fa;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 12px;

              i {
                font-size: 16px;
              }
            }

            .type-info {
              flex: 1;

              h6 {
                color: $base-font-color;
                font-weight: 600;
                margin: 0 0 2px 0;
                font-size: 13px;
              }

              small {
                color: $base-sub-color;
                font-size: 11px;
              }
            }
          }

          .type-stats {
            .stat-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 8px;
              font-size: 12px;

              &:last-child {
                margin-bottom: 0;
              }

              .stat-label {
                color: $base-sub-color;
                font-weight: 500;
              }

              .stat-value {
                color: $base-font-color;
                font-weight: 600;
              }
            }
          }
        }
      }
    }

    .col {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .gem-type-info {
      strong {
        font-weight: 600;
        color: $base-font-color;
        font-size: 14px;
      }

      .gem-details {
        margin-top: 2px;
        small {
          color: $base-sub-color;
          font-size: 11px;
        }
      }
    }

    .transaction-count,
    .quantity-info,
    .weight-info,
    .inbound-info,
    .outbound-info,
    .current-stock {
      strong {
        font-weight: 600;
        color: $base-font-color;
        font-size: 14px;
      }

      .transaction-breakdown,
      .quantity-breakdown,
      .weight-breakdown,
      .inbound-weight,
      .outbound-weight,
      .current-weight {
        margin-top: 2px;
        small {
          color: $base-sub-color;
          font-size: 11px;
        }
      }
    }

    .inbound-info strong {
      color: $base-green;
    }

    .outbound-info strong {
      color: $base-red;
    }

    .current-stock strong {
      color: $base-font-color;
    }
  }

  .activities-body {
    .activity-table-container {
      // Custom styling for BaseDataTable
      :deep(.base-datatable) {
        .p-datatable {
          .p-datatable-tbody {
            tr {
              td {
                padding: 8px 12px;
                font-size: 12px;

                .gem-info {
                  .gem-code {
                    font-weight: 600;
                    color: $base-font-color;
                    font-size: 13px;
                  }
                }

                .running-number {
                  font-family: monospace;
                  font-size: 11px;
                  background: #e9ecef;
                  padding: 2px 6px;
                  border-radius: 3px;
                }

                .job-po {
                  font-size: 11px;
                  color: $base-sub-color;
                }

                .status-badge {
                  font-size: 10px;
                  padding: 3px 8px;
                  border-radius: 12px;
                  font-weight: 600;
                  text-transform: uppercase;
                }

                .user-info {
                  .create-by {
                    font-weight: 500;
                    color: $base-font-color;
                    font-size: 11px;
                  }

                  small {
                    font-size: 10px;
                    line-height: 1.2;
                  }
                }
              }
            }
          }
        }
      }
    }

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
}
</style>
