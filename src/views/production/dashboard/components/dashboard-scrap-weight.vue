<template>
  <div class="dashboard-scrap-weight">
    <div class="scrap-weight-card">
      <div class="scrap-weight-header">
        <h5>น้ำหนักขี้เบ้าทองรายเดือน ({{ new Date().getFullYear() }})</h5>
      </div>
      <div class="scrap-weight-body">
        <!-- Loading State -->
        <div v-if="isLoading" class="scrap-weight-loading">
          <div class="loading-spinner">
            <i class="bi bi-arrow-repeat"></i>
          </div>
          <p>กำลังโหลดข้อมูล...</p>
        </div>

        <!-- Content -->
        <div v-else-if="scrapWeightData" class="scrap-weight-content">
          <!-- Dataset Tabs -->
          <div class="scrap-weight-tabs">
            <button
              class="tab-button"
              :class="{ active: activeDataset === 'melt' }"
              @click="activeDataset = 'melt'"
            >
              <i class="bi bi-fire"></i>
              ขี้เบ้าหลอม
            </button>
            <button
              class="tab-button"
              :class="{ active: activeDataset === 'cast' }"
              @click="activeDataset = 'cast'"
            >
              <i class="bi bi-gear"></i>
              ขี้เบ้าหล่อ
            </button>
          </div>

          <!-- Monthly Data Display -->
          <div class="monthly-data-container">
            <div class="row">
              <div
                v-for="monthData in currentDataset"
                :key="monthData.month"
                class="col-lg-2 col-md-3 col-sm-4 col-6 mb-3"
              >
                <div class="month-card" :class="{ 'has-data': monthData.totalWeight > 0 }">
                  <div class="month-header">
                    <h6>{{ monthData.monthName }}</h6>
                    <small class="month-number">{{ monthData.month }}/{{ new Date().getFullYear() }}</small>
                  </div>
                  <div class="month-content">
                    <div class="total-weight">
                      <span class="weight-value">{{ formatWeight(monthData.totalWeight) }}</span>
                      <small class="weight-unit"> กรัม</small>
                    </div>
                    
                    <!-- Gold Categories Details -->
                    <div v-if="monthData.goldCategories.length > 0" class="gold-categories">
                      <div
                        v-for="(category, index) in monthData.goldCategories"
                        :key="index"
                        class="category-item"
                      >
                        <div class="category-info">
                          <span class="gold-type">{{ category.goldName }}</span>
                          <span class="gold-size">{{ category.goldSizeName }}</span>
                        </div>
                        <div class="category-weight">
                          {{ formatWeight(category.weight) }}  ก.
                        </div>
                      </div>
                    </div>
                    
                    <!-- No Data -->
                    <div v-else class="no-data">
                      <i class="bi bi-dash-circle"></i>
                      <span>ไม่มีข้อมูล</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Summary Stats -->
          <div class="summary-stats mt-4">
            <div class="row">
              <div class="col-md-6">
                <div class="stat-item">
                  <div class="stat-icon melt">
                    <i class="bi bi-fire"></i>
                  </div>
                  <div class="stat-info">
                    <h4>{{ formatWeight(totalMeltWeight) }}  กรัม</h4>
                    <p>ขี้เบ้าหลอมรวมทั้งปี</p>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="stat-item">
                  <div class="stat-icon cast">
                    <i class="bi bi-gear"></i>
                  </div>
                  <div class="stat-info">
                    <h4>{{ formatWeight(totalCastWeight) }} กรัม</h4>
                    <p>ขี้เบ้าหล่อรวมทั้งปี</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="scrap-weight-empty">
          <i class="bi bi-bar-chart"></i>
          <p>ไม่มีข้อมูลน้ำหนักขี้เบ้าทอง</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useProductionDailyApiStore } from '@/stores/modules/api/plan/daily-store-api.js'

export default {
  name: 'DashboardScrapWeight',
  setup() {
    const dailyApiStore = useProductionDailyApiStore()
    return {
      dailyApiStore
    }
  },
  data() {
    return {
      activeDataset: 'melt',
      scrapWeightData: null,
      isLoading: false
    }
  },
  computed: {
    currentDataset() {
      if (!this.scrapWeightData) return []
      return this.activeDataset === 'melt' 
        ? this.scrapWeightData.meltScrapData 
        : this.scrapWeightData.castScrapData
    },
    totalMeltWeight() {
      if (!this.scrapWeightData?.meltScrapData) return 0
      return this.scrapWeightData.meltScrapData.reduce((sum, month) => sum + month.totalWeight, 0)
    },
    totalCastWeight() {
      if (!this.scrapWeightData?.castScrapData) return 0
      return this.scrapWeightData.castScrapData.reduce((sum, month) => sum + month.totalWeight, 0)
    }
  },
  mounted() {
    this.loadScrapWeightData()
  },
  methods: {
    async loadScrapWeightData() {
      try {
        this.isLoading = true
        // Call the new API endpoint through the store
        const response = await this.dailyApiStore.fetchScrapWeightDashboard()
        this.scrapWeightData = response
      } catch (error) {
        console.error('Error loading scrap weight data:', error)
        this.$swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load scrap weight data'
        })
      } finally {
        this.isLoading = false
      }
    },
    formatWeight(weight) {
      if (!weight) return '0.00'
      return parseFloat(weight).toLocaleString('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/variable.scss';

.dashboard-scrap-weight {
  .scrap-weight-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    margin-bottom: 20px;

    .scrap-weight-header {
      padding: 20px;
      border-bottom: 1px solid $base-color;
      //background: linear-gradient(135deg, #f8f9fa, #e9ecef);

      h5 {
        color: $base-font-color;
        font-weight: bold;
        margin: 0;
      }
    }

    .scrap-weight-body {
      padding: 20px;

      .scrap-weight-loading,
      .scrap-weight-empty {
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

      .scrap-weight-content {
        .scrap-weight-tabs {
          display: flex;
          margin-bottom: 20px;

          .tab-button {
            flex: 1;
            padding: 12px 20px;
            background: $base-color;
            border: none;
            color: $base-sub-color;
            cursor: pointer;
            transition: all 0.3s ease;
            border-radius: 6px;
            margin-right: 10px;

            &:last-child {
              margin-right: 0;
            }

            &.active,
            &:hover {
              background: $base-font-color;
              color: white;
            }

            i {
              margin-right: 8px;
            }
          }
        }

        .monthly-data-container {
          .month-card {
            background: #f8f9fa;
            border-radius: 8px;
            border: 2px solid transparent;
            transition: all 0.3s ease;
            height: 100%;

            &.has-data {
              background: white;
              border-color: lighten($base-font-color, 40%);
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }

            .month-header {
              padding: 12px 15px;
              border-bottom: 1px solid #e9ecef;
              background: linear-gradient(135deg, #f1f3f4, #e8eaed);

              h6 {
                color: $base-font-color;
                font-weight: bold;
                margin: 0;
                font-size: 14px;
              }

              .month-number {
                color: $base-sub-color;
                font-size: 11px;
              }
            }

            .month-content {
              padding: 15px;

              .total-weight {
                text-align: center;
                margin-bottom: 15px;

                .weight-value {
                  font-size: 18px;
                  font-weight: bold;
                  color: $base-font-color;
                }

                .weight-unit {
                  color: $base-sub-color;
                  font-size: 12px;
                }
              }

              .gold-categories {
                .category-item {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  padding: 6px 0;
                  border-bottom: 1px solid #f0f0f0;
                  font-size: 11px;

                  &:last-child {
                    border-bottom: none;
                  }

                  .category-info {
                    flex: 1;

                    .gold-type {
                      display: block;
                      color: $base-font-color;
                      font-weight: 500;
                    }

                    .gold-size {
                      display: block;
                      color: $base-sub-color;
                      font-size: 10px;
                    }
                  }

                  .category-weight {
                    color: $base-font-color;
                    font-weight: bold;
                  }
                }
              }

              .no-data {
                text-align: center;
                color: $base-sub-color;
                font-size: 12px;

                i {
                  display: block;
                  font-size: 24px;
                  margin-bottom: 5px;
                }
              }
            }
          }
        }

        .summary-stats {
          .stat-item {
            display: flex;
            align-items: center;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

            .stat-icon {
              width: 60px;
              height: 60px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 15px;

              &.melt {
                background: linear-gradient(135deg, #ff6b6b, #ee5a52);
              }

              &.cast {
                background: linear-gradient(135deg, #4ecdc4, #44a08d);
              }

              i {
                font-size: 24px;
                color: white;
              }
            }

            .stat-info {
              flex: 1;

              h4 {
                font-size: 24px;
                font-weight: bold;
                color: $base-font-color;
                margin: 0 0 5px 0;
              }

              p {
                color: $base-sub-color;
                margin: 0;
                font-size: 14px;
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
  .dashboard-scrap-weight {
    .scrap-weight-card .scrap-weight-body {
      padding: 15px;

      .scrap-weight-content {
        .scrap-weight-tabs {
          .tab-button {
            padding: 10px 15px;
            font-size: 14px;
          }
        }

        .summary-stats {
          .stat-item {
            padding: 15px;

            .stat-icon {
              width: 50px;
              height: 50px;
              margin-right: 10px;

              i {
                font-size: 20px;
              }
            }

            .stat-info h4 {
              font-size: 20px;
            }
          }
        }
      }
    }
  }
}
</style>