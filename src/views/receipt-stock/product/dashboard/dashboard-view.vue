<template>
  <div class="app-container stock-product-dashboard">
    <DashboardHeaderGeneric
      :title="$t('view.stock.product.dashboard.title')"
      :subtitle="headerSubtitle"
      icon="bi-box-seam"
      @refresh="refreshDashboard"
    />

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
              {{ $t('view.stock.product.dashboard.tabOverview') }}
            </button>
          </li>
          <li class="nav-item">
            <button
              class="nav-link"
              :class="{ active: activeTab === 'today' }"
              @click="setActiveTab('today')"
            >
              <i class="bi bi-calendar-day"></i>
              {{ $t('view.stock.product.dashboard.tabToday') }}
            </button>
          </li>
          <li class="nav-item">
            <button
              class="nav-link"
              :class="{ active: activeTab === 'weekly' }"
              @click="setActiveTab('weekly')"
            >
              <i class="bi bi-calendar-week"></i>
              {{ $t('view.stock.product.dashboard.tabWeekly') }}
            </button>
          </li>
          <li class="nav-item">
            <button
              class="nav-link"
              :class="{ active: activeTab === 'monthly' }"
              @click="setActiveTab('monthly')"
            >
              <i class="bi bi-calendar-month"></i>
              {{ $t('view.stock.product.dashboard.tabMonthly') }}
            </button>
          </li>
        </ul>
      </div>
    </div>

    <!-- Overview Tab -->
    <div v-show="activeTab === 'overview'" class="tab-content">
      <StockSummaryCards :stock-summary="stockSummary" />

      <CategoryChart :category-chart-data="categoryChartData" />

      <div class="row">
        <div class="col-12 mb-4">
          <LastActivitiesTable :last-activities="lastActivities" />
        </div>
      </div>
    </div>

    <!-- Today Tab -->
    <div v-show="activeTab === 'today'" class="tab-content">
      <div class="row">
        <div class="col-12 mb-4">
          <div class="kpi-grid">
            <StatCardGeneric
              icon="bi-activity"
              :value="formatNumber(todaySummary.totalTransactions)"
              :label="$t('view.stock.product.dashboard.todayTotalTransactions')"
            />
            <StatCardGeneric
              icon="bi-plus-circle"
              :value="formatNumber(todaySummary.newStockItems)"
              :label="$t('view.stock.product.dashboard.todayNewStockItems')"
              variant="green"
            />
            <StatCardGeneric
              icon="bi-currency-dollar"
              :value="formatCurrency(todaySummary.totalValue)"
              :label="$t('view.stock.product.dashboard.todayTotalValue')"
              variant="warning"
            />
          </div>
        </div>

        <!-- Today's Transactions -->
        <div class="col-12">
          <div class="activities-card">
            <div class="activities-header">
              <h5>{{ $t('view.stock.product.dashboard.todayTransactionsTitle') }}</h5>
              <div class="activities-count">
                <span class="badge bg-primary">{{ todayTransactions.length }}</span>
              </div>
            </div>
            <div class="activities-body">
              <div v-if="todayTransactions.length > 0" class="activities-list">
                <div
                  v-for="transaction in todayTransactions.slice(0, 10)"
                  :key="transaction.stockNumber"
                  class="activity-item"
                >
                  <div class="activity-icon">
                    <i class="bi bi-box-seam text-primary"></i>
                  </div>
                  <div class="activity-content">
                    <div class="activity-header">
                      <h6>{{ transaction.stockNumber }} - {{ transaction.productNameTh }}</h6>
                      <span class="activity-time">{{ formatDateTime(transaction.createDate) }}</span>
                    </div>
                    <p class="activity-description">
                      {{ transaction.productTypeName }} - {{ transaction.productionType }} {{ transaction.productionTypeSize }}
                    </p>
                    <div class="activity-details">
                      <div class="detail-row">
                        <span class="detail-label">{{ $t('view.stock.product.dashboard.qtyLabel') }}</span>
                        <span class="detail-value">{{ formatNumber(transaction.qty) }}</span>
                      </div>
                      <div class="detail-row">
                        <span class="detail-label">{{ $t('view.stock.product.dashboard.priceLabel') }}</span>
                        <span class="detail-value">{{ formatCurrency(transaction.productPrice) }}</span>
                      </div>
                      <div class="detail-row" v-if="transaction.woText">
                        <span class="detail-label">{{ $t('view.stock.product.dashboard.woLabel') }}</span>
                        <span class="detail-value">{{ transaction.woText }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="activities-empty">
                <i class="bi bi-clock-history"></i>
                <p>{{ $t('view.stock.product.dashboard.noTodayTransactions') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Weekly Tab -->
    <div v-show="activeTab === 'weekly'" class="tab-content">
      <div class="row">
        <div class="col-12 mb-4">
          <div class="kpi-grid">
            <StatCardGeneric
              icon="bi-activity"
              :value="formatNumber(weeklySummary.totalTransactions)"
              :label="$t('view.stock.product.dashboard.weeklyTotalTransactions')"
            />
            <StatCardGeneric
              icon="bi-plus-circle"
              :value="formatNumber(weeklySummary.newStockItems)"
              :label="$t('view.stock.product.dashboard.weeklyNewStockItems')"
              variant="green"
            />
            <StatCardGeneric
              icon="bi-currency-dollar"
              :value="formatCurrency(weeklySummary.totalValue)"
              :label="$t('view.stock.product.dashboard.weeklyTotalValue')"
              variant="warning"
            />
          </div>
        </div>

        <!-- Weekly Analysis -->
        <div class="col-12">
          <div class="activities-card">
            <div class="activities-header">
              <h5>{{ $t('view.stock.product.dashboard.dailyMovementsTitle', { week: weekNumber }) }}</h5>
              <div class="activities-count">
                <span class="badge bg-success">{{ dailyMovements.length || 0 }}</span>
              </div>
            </div>
            <div class="activities-body">
              <div v-if="dailyMovements && dailyMovements.length > 0" class="activities-list">
                <div
                  v-for="movement in dailyMovements"
                  :key="movement.date"
                  class="activity-item"
                >
                  <div class="activity-icon">
                    <i class="bi bi-calendar-check text-success"></i>
                  </div>
                  <div class="activity-content">
                    <div class="activity-header">
                      <h6>{{ formatDate(movement.date) }}</h6>
                      <span class="activity-time">{{ $t('view.stock.product.dashboard.transactionCount', { count: movement.transactionCount }) }}</span>
                    </div>
                    <p class="activity-description">
                      {{ $t('view.stock.product.dashboard.dailyMovementDesc', { newCount: movement.newStockCount, value: formatCurrency(movement.totalValue) }) }}
                    </p>
                  </div>
                </div>
              </div>
              <div v-else class="activities-empty">
                <i class="bi bi-clock-history"></i>
                <p>{{ $t('view.stock.product.dashboard.noWeeklyData') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Monthly Tab -->
    <div v-show="activeTab === 'monthly'" class="tab-content">
      <div class="row">
        <div class="col-12 mb-4">
          <div class="kpi-grid">
            <StatCardGeneric
              icon="bi-activity"
              :value="formatNumber(monthlySummary.totalTransactions)"
              :label="$t('view.stock.product.dashboard.monthlyTotalTransactions')"
            />
            <StatCardGeneric
              icon="bi-plus-circle"
              :value="formatNumber(monthlySummary.newStockItems)"
              :label="$t('view.stock.product.dashboard.monthlyNewStockItems')"
              variant="green"
            />
            <StatCardGeneric
              icon="bi-currency-dollar"
              :value="formatCurrency(monthlySummary.totalValue)"
              :label="$t('view.stock.product.dashboard.monthlyTotalValue')"
              variant="warning"
            />
            <StatCardGeneric
              icon="bi-box-seam"
              :value="formatNumber(monthlySummary.totalAvailableProducts)"
              :label="$t('view.stock.product.dashboard.monthlyAvailableProducts')"
              variant="grey"
            />
          </div>
        </div>

        <!-- Monthly Comparisons -->
        <div class="col-12">
          <div class="activities-card">
            <div class="activities-header">
              <h5>{{ $t('view.stock.product.dashboard.weeklyComparisonsTitle', { month: monthName }) }}</h5>
              <div class="activities-count">
                <span class="badge bg-info">{{ weeklyComparisons.length || 0 }}</span>
              </div>
            </div>
            <div class="activities-body">
              <div v-if="weeklyComparisons && weeklyComparisons.length > 0" class="activities-list">
                <div
                  v-for="week in weeklyComparisons"
                  :key="week.weekNumber"
                  class="activity-item"
                >
                  <div class="activity-icon">
                    <i class="bi bi-bar-chart text-info"></i>
                  </div>
                  <div class="activity-content">
                    <div class="activity-header">
                      <h6>{{ $t('view.stock.product.dashboard.weekNumberLabel', { week: week.weekNumber }) }}</h6>
                      <span class="activity-time">{{ formatDate(week.weekStartDate) }} - {{ formatDate(week.weekEndDate) }}</span>
                    </div>
                    <p class="activity-description">
                      {{ $t('view.stock.product.dashboard.weeklyComparisonDesc', { count: week.transactionCount, newCount: week.newStockCount, value: formatCurrency(week.totalValue) }) }}
                    </p>
                  </div>
                </div>
              </div>
              <div v-else class="activities-empty">
                <i class="bi bi-clock-history"></i>
                <p>{{ $t('view.stock.product.dashboard.noMonthlyData') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'

import { useStockProductDashboardStore } from '@/stores/modules/api/stock/stock-product-dashboard-store.js'

import DashboardHeaderGeneric from '@/components/generic/DashboardHeaderGeneric.vue'
import StatCardGeneric from '@/components/generic/StatCardGeneric.vue'

// Dashboard Components
import CategoryChart from './components/category-chart.vue'
import LastActivitiesTable from './components/last-activities-table.vue'
import StockSummaryCards from './components/stock-summary-cards.vue'

export default {
  name: 'StockProductDashboardView',
  components: {
    DashboardHeaderGeneric,
    StatCardGeneric,
    CategoryChart,
    LastActivitiesTable,
    StockSummaryCards
  },
  setup() {
    const dashboardStore = useStockProductDashboardStore()
    return {
      dashboardStore
    }
  },
  data() {
    return {
      activeTab: 'overview',
      filters: {}
    }
  },
  computed: {
    dataAtDate() {
      return this.dashboardStore.getLastUpdated
    },
    headerSubtitle() {
      return this.dataAtDate
        ? `${this.$t('view.stock.product.dashboard.lastUpdate')}: ${this.formatDateTime(this.dataAtDate)}`
        : ''
    },

    // Dashboard data
    stockSummary() {
      return this.dashboardStore.getStockSummary
    },
    lastActivities() {
      return this.dashboardStore.getLastActivities
    },
    categoryChartData() {
      return this.dashboardStore.getCategoryChartData
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
    dailyMovements() {
      return this.dashboardStore.getDailyMovements
    },
    weekNumber() {
      return this.dashboardStore.weekNumber || ''
    },

    // Monthly data
    monthlySummary() {
      return this.dashboardStore.getMonthlySummary
    },
    weeklyComparisons() {
      return this.dashboardStore.getWeeklyComparisons
    },
    monthName() {
      return this.dashboardStore.monthName || ''
    }
  },
  async mounted() {
    await this.loadDashboardData()
  },
  methods: {
    async loadDashboardData() {
      await this.dashboardStore.fetchDashboard(this.filters)
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

    formatNumber(value, decimals = 0) {
      if (!value) return '0'
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

    formatDate(date) {
      return dayjs(date).format('DD/MM/YYYY')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/variable.scss';

.stock-product-dashboard {
  background-color: #f8f9fa;
  min-height: 100vh;

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
        margin-right: var(--sp-sm);
      }
    }
  }

  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: var(--sp-lg);
  }

  .activities-card {
    background: white;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
    overflow: hidden;

    .activities-header {
      padding: var(--sp-xl);
      border-bottom: 1px solid var(--color-border);
      display: flex;
      justify-content: space-between;
      align-items: center;

      h5 {
        color: var(--base-font-color);
        font-weight: bold;
        margin: 0;
      }

      .activities-count {
        .badge {
          font-size: 12px;
        }
      }
    }

    .activities-body {
      padding: var(--sp-xl);

      .activities-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 200px;
        color: $base-sub-color;

        i {
          font-size: 48px;
          margin-bottom: var(--sp-lg);
        }
      }
    }
  }

  .activities-list {
    .activity-item {
      display: flex;
      align-items: flex-start;
      padding: var(--sp-lg) 0;
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
        margin-right: var(--sp-lg);
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
          margin-bottom: var(--sp-xs);

          h6 {
            color: var(--base-font-color);
            font-weight: bold;
            margin: 0;
            font-size: var(--fs-base);
          }

          .activity-time {
            color: $base-sub-color;
            font-size: var(--fs-sm);
            white-space: nowrap;
            margin-left: var(--sp-sm);
          }
        }

        .activity-description {
          color: $base-sub-color;
          margin: 0 0 var(--sp-sm) 0;
          font-size: var(--fs-sm);
        }

        .activity-details {
          background: #f8f9fa;
          border-radius: var(--radius-sm);
          padding: var(--sp-sm);

          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 3px;
            font-size: var(--fs-sm);

            &:last-child {
              margin-bottom: 0;
            }

            .detail-label {
              color: $base-sub-color;
              font-weight: 600;
            }

            .detail-value {
              color: var(--base-font-color);
            }
          }
        }
      }
    }
  }
}
</style>
