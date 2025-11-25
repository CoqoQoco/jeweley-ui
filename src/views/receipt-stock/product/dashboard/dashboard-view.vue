<template>
  <div class="app-container stock-product-dashboard">
    <!-- Dashboard Header with Refresh -->
    <div class="row">
      <div class="col-12">
        <div class="dashboard-header">
          <div class="header-info">
            <h3>แดชบอร์ดคลังสินค้า</h3>
            <div class="data-info">
              <small class="text-muted" v-if="dataAtDate">
                <i class="bi bi-clock"></i>
                อัพเดทล่าสุด: {{ formatDateTime(dataAtDate) }}
              </small>
            </div>
          </div>
          <div class="header-controls">
            <!-- Refresh Button -->
            <button @click="refreshDashboard" class="btn btn-outline-main" :disabled="isLoading">
              <i class="bi bi-arrow-clockwise" :class="{ spinning: isLoading }"></i>
              รีเฟรช
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
              ภาพรวม
            </button>
          </li>
          <li class="nav-item">
            <button
              class="nav-link"
              :class="{ active: activeTab === 'today' }"
              @click="setActiveTab('today')"
            >
              <i class="bi bi-calendar-day"></i>
              วันนี้
            </button>
          </li>
          <li class="nav-item">
            <button
              class="nav-link"
              :class="{ active: activeTab === 'weekly' }"
              @click="setActiveTab('weekly')"
            >
              <i class="bi bi-calendar-week"></i>
              รายสัปดาห์
            </button>
          </li>
          <li class="nav-item">
            <button
              class="nav-link"
              :class="{ active: activeTab === 'monthly' }"
              @click="setActiveTab('monthly')"
            >
              <i class="bi bi-calendar-month"></i>
              รายเดือน
            </button>
          </li>
        </ul>
      </div>
    </div>

    <!-- Overview Tab -->
    <div v-show="activeTab === 'overview'" class="tab-content">
      <!-- Dashboard Stats Cards -->
      <!-- <StockSummaryCards :stock-summary="stockSummary" /> -->

      <!-- Category Breakdown Chart -->
      <CategoryChart
        :category-chart-data="categoryChartData"
        :is-loading="isLoading"
        :dataset-fields="datasetFields"
        :chart-name="chartName"
      />

      <!-- Last Activities -->
      <div class="row">
        <div class="col-12 mb-4">
          <LastActivitiesTable :last-activities="lastActivities" />
        </div>
      </div>
    </div>

    <!-- Today Tab -->
    <div v-show="activeTab === 'today'" class="tab-content">
      <div class="row">
        <!-- Today's Summary Cards -->
        <!-- <div class="col-12 mb-4">
          <div class="row">
            <div class="col-lg-3 col-md-6 mb-3">
              <div class="stat-card today">
                <div class="stat-card-body">
                  <div class="stat-icon">
                    <i class="bi bi-activity"></i>
                  </div>
                  <div class="stat-content">
                    <h3>{{ todaySummary.totalTransactions }}</h3>
                    <p>รายการทั้งหมดวันนี้</p>
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
                    <p>สินค้าใหม่วันนี้</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-lg-3 col-md-6 mb-3">
              <div class="stat-card today">
                <div class="stat-card-body">
                  <div class="stat-icon">
                    <i class="bi bi-currency-dollar"></i>
                  </div>
                  <div class="stat-content">
                    <h3>{{ formatCurrency(todaySummary.totalValue) }}</h3>
                    <p>มูลค่ารวมวันนี้</p>
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
                    <p>แจ้งเตือนสต๊อกต่ำ</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div> -->

        <!-- Today's Transactions -->
        <div class="col-12">
          <div class="activities-card">
            <div class="activities-header">
              <h5>รายการสินค้าวันนี้</h5>
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
                        <span class="detail-label">จำนวน:</span>
                        <span class="detail-value">{{ formatNumber(transaction.qty) }}</span>
                      </div>
                      <div class="detail-row">
                        <span class="detail-label">ราคา:</span>
                        <span class="detail-value">{{ formatCurrency(transaction.productPrice) }}</span>
                      </div>
                      <div class="detail-row" v-if="transaction.woText">
                        <span class="detail-label">WO:</span>
                        <span class="detail-value">{{ transaction.woText }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="activities-empty">
                <i class="bi bi-clock-history"></i>
                <p>ไม่มีรายการสินค้าวันนี้</p>
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
        <!-- <div class="col-12 mb-4">
          <div class="row">
            <div class="col-lg-3 col-md-6 mb-3">
              <div class="stat-card weekly">
                <div class="stat-card-body">
                  <div class="stat-icon">
                    <i class="bi bi-activity"></i>
                  </div>
                  <div class="stat-content">
                    <h3>{{ weeklySummary.totalTransactions || 0 }}</h3>
                    <p>รายการทั้งหมดสัปดาห์นี้</p>
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
                    <p>สินค้าใหม่สัปดาห์นี้</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-lg-3 col-md-6 mb-3">
              <div class="stat-card weekly">
                <div class="stat-card-body">
                  <div class="stat-icon">
                    <i class="bi bi-currency-dollar"></i>
                  </div>
                  <div class="stat-content">
                    <h3>{{ formatCurrency(weeklySummary.totalValue) }}</h3>
                    <p>มูลค่ารวมสัปดาห์นี้</p>
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
                    <p>แจ้งเตือนสต๊อกต่ำ</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div> -->

        <!-- Weekly Analysis -->
        <div class="col-12">
          <div class="activities-card">
            <div class="activities-header">
              <h5>การเคลื่อนไหวรายวัน ({{ weekNumber }})</h5>
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
                      <span class="activity-time">{{ movement.transactionCount }} รายการ</span>
                    </div>
                    <p class="activity-description">
                      สินค้าใหม่: {{ movement.newStockCount }} ชิ้น | มูลค่า: {{ formatCurrency(movement.totalValue) }}
                    </p>
                  </div>
                </div>
              </div>
              <div v-else class="activities-empty">
                <i class="bi bi-clock-history"></i>
                <p>ไม่มีข้อมูลสัปดาห์นี้</p>
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
        <!-- <div class="col-12 mb-4">
          <div class="row">
            <div class="col-lg-3 col-md-6 mb-3">
              <div class="stat-card monthly">
                <div class="stat-card-body">
                  <div class="stat-icon">
                    <i class="bi bi-activity"></i>
                  </div>
                  <div class="stat-content">
                    <h3>{{ monthlySummary.totalTransactions || 0 }}</h3>
                    <p>รายการทั้งหมดเดือนนี้</p>
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
                    <p>สินค้าใหม่เดือนนี้</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-lg-3 col-md-6 mb-3">
              <div class="stat-card monthly">
                <div class="stat-card-body">
                  <div class="stat-icon">
                    <i class="bi bi-currency-dollar"></i>
                  </div>
                  <div class="stat-content">
                    <h3>{{ formatCurrency(monthlySummary.totalValue) }}</h3>
                    <p>มูลค่ารวมเดือนนี้</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-lg-3 col-md-6 mb-3">
              <div class="stat-card monthly">
                <div class="stat-card-body">
                  <div class="stat-icon">
                    <i class="bi bi-box-seam"></i>
                  </div>
                  <div class="stat-content">
                    <h3>{{ monthlySummary.totalAvailableProducts || 0 }}</h3>
                    <p>สินค้าพร้อมขาย</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div> -->

        <!-- Monthly Comparisons -->
        <div class="col-12">
          <div class="activities-card">
            <div class="activities-header">
              <h5>เปรียบเทียบรายสัปดาห์ ({{ monthName }})</h5>
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
                      <h6>สัปดาห์ที่ {{ week.weekNumber }}</h6>
                      <span class="activity-time">{{ formatDate(week.weekStartDate) }} - {{ formatDate(week.weekEndDate) }}</span>
                    </div>
                    <p class="activity-description">
                      รายการ: {{ week.transactionCount }} | สินค้าใหม่: {{ week.newStockCount }} | มูลค่า: {{ formatCurrency(week.totalValue) }}
                    </p>
                  </div>
                </div>
              </div>
              <div v-else class="activities-empty">
                <i class="bi bi-clock-history"></i>
                <p>ไม่มีข้อมูลเดือนนี้</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useStockProductDashboardStore } from '@/stores/modules/api/stock/stock-product-dashboard-store.js'
import dayjs from 'dayjs'

// Dashboard Components
import StockSummaryCards from './components/stock-summary-cards.vue'
import CategoryChart from './components/category-chart.vue'
import LastActivitiesTable from './components/last-activities-table.vue'

export default {
  name: 'StockProductDashboardView',
  components: {
    StockSummaryCards,
    CategoryChart,
    LastActivitiesTable
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
      filters: {},
      datasetFields: [
        { key: 'count', label: 'Count', labelTH: 'จำนวน' },
        // { key: 'totalQuantity', label: 'Total Quantity', labelTH: 'จำนวนรวม' },
        // { key: 'totalValue', label: 'Total Value', labelTH: 'มูลค่ารวม' },
        // { key: 'averagePrice', label: 'Average Price', labelTH: 'ราคาเฉลี่ย' }
      ],
      chartName: 'stock-product-dashboard'
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
    },

    // Chart data
    categoryChartData() {
      const data = this.dashboardStore.getCategories
      console.log('categoryChartData getter:', data)
      return data
    }
  },
  async mounted() {
    console.log('Dashboard mounted, loading data...')
    await this.loadDashboardData()
    console.log('Dashboard data loaded:', {
      stockSummary: this.stockSummary,
      categories: this.categories,
      lastActivities: this.lastActivities
    })
  },
  methods: {
    async loadDashboardData() {
      console.log('Fetching dashboard with filters:', this.filters)
      await this.dashboardStore.fetchDashboard(this.filters)
      console.log('Store state after fetch:', this.dashboardStore.$state)
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
          margin: 0;
          font-size: 14px;
          font-weight: 600;
        }
      }
    }
  }

  .activities-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow: hidden;

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

    .activities-body {
      padding: 20px;

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

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
}
</style>
