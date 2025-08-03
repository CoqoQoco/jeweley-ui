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
          <!-- Dataset Tabs and Controls -->
          <div class="scrap-weight-controls">
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

            <!-- View Toggle -->
            <div class="view-toggle">
              <button
                class="toggle-button"
                :class="{ active: viewMode === 'monthly' }"
                @click="viewMode = 'monthly'"
              >
                <i class="bi bi-calendar-month"></i>
                รายเดือน
              </button>
              <button
                class="toggle-button ml-2"
                :class="{ active: viewMode === 'yearly' }"
                @click="viewMode = 'yearly'"
              >
                <i class="bi bi-calendar"></i>
                รายปี
              </button>
            </div>

            <!-- Export Controls -->
            <div class="export-controls">
              <button
                class="export-button"
                @click="exportToExcel"
                :disabled="isExporting"
                title="ส่งออกข้อมูล Excel"
              >
                <i class="bi bi-file-earmark-excel" v-if="!isExporting"></i>
                <i class="bi bi-arrow-clockwise spin" v-else></i>
                <span class="ml-2">{{ isExporting ? 'กำลังส่งออก...' : 'Excel' }}</span>
              </button>
            </div>
          </div>

          <!-- Monthly Data Display -->
          <div v-if="viewMode === 'monthly'" class="monthly-data-container">
            <div class="row">
              <div
                v-for="monthData in currentDataset"
                :key="monthData.month"
                class="col-lg-2 col-md-3 col-sm-4 col-6 mb-3"
              >
                <div class="month-card" :class="{ 'has-data': monthData.totalWeight > 0 }">
                  <div class="month-header">
                    <h6>{{ monthData.monthName }}</h6>
                    <small class="month-number"
                      >{{ monthData.month }}/{{ new Date().getFullYear() }}</small
                    >
                  </div>
                  <div class="month-content">
                    <div class="total-weight">
                      <span class="weight-value">{{ formatWeight(monthData.totalWeight) }}</span>
                      <small class="weight-unit"> กรัม</small>
                    </div>

                    <!-- Gold Categories Details -->
                    <div
                      v-if="monthData.goldCategories && monthData.goldCategories.length > 0"
                      class="gold-categories"
                    >
                      <div
                        v-for="(category, index) in monthData.goldCategories"
                        :key="index"
                        class="category-item"
                      >
                        <div class="category-info">
                          <span class="gold-type">{{ category.goldName }}</span>
                          <span class="gold-size">{{ category.goldSizeName }}</span>
                        </div>
                        <div class="category-weight">{{ formatWeight(category.weight) }} ก.</div>
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

          <!-- Yearly Category Display -->
          <div v-else-if="viewMode === 'yearly'" class="yearly-category-container">
            <!-- <div class="yearly-header">
              <h6>สรุปข้อมูลรายปี {{ new Date().getFullYear() }} - แยกตามประเภทและขนาดทอง</h6>
              <small class="yearly-subtitle">{{
                activeDataset === 'melt' ? 'ขี้เบ้าหลอม' : 'ขี้เบ้าหล่อ'
              }}</small>
            </div> -->

            <div class="row">
              <div
                v-for="(category, index) in currentYearlyCategoryData"
                :key="index"
                class="col-lg-3 col-md-4 col-sm-6 col-12 mb-3"
              >
                <div class="yearly-category-card">
                  <div class="category-header">
                    <div class="category-title">
                      <h6 class="gold-name">{{ category.goldName }}</h6>
                      <small class="gold-size">{{ category.goldSizeName }}</small>
                    </div>
                    <div class="category-rank">
                      <!-- <span class="rank-number">#{{ index + 1 }}</span> -->
                    </div>
                  </div>

                  <div class="category-content">
                    <div class="yearly-total">
                      <span class="total-value">{{
                        formatWeight(category.totalYearlyWeight)
                      }}</span>
                      <small class="total-unit">กรัม/ปี</small>
                    </div>

                    <div class="category-stats">
                      <!-- <div class="stat-item">
                        <i class="bi bi-calendar-check"></i>
                        <span class="stat-label">เดือนที่มีข้อมูล</span>
                        <span class="stat-value">{{ category.monthsWithData }}/12</span>
                      </div>

                      <div class="stat-item">
                        <i class="bi bi-graph-up"></i>
                        <span class="stat-label">เฉลี่ยต่อเดือน</span>
                        <span class="stat-value"
                          >{{ formatWeight(category.averageMonthlyWeight) }} ก.</span
                        >
                      </div> -->

                      <div class="stat-item">
                        <i class="bi bi-percent"></i>
                        <span class="stat-label">ของยอดรวม</span>
                        <span class="stat-value"
                          >{{ calculatePercentage(category.totalYearlyWeight) }}%</span
                        >
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- No Yearly Data -->
            <div
              v-if="!currentYearlyCategoryData || currentYearlyCategoryData.length === 0"
              class="no-yearly-data"
            >
              <i class="bi bi-bar-chart"></i>
              <p>
                ไม่มีข้อมูลสรุปรายปีสำหรับ{{
                  activeDataset === 'melt' ? 'ขี้เบ้าหลอม' : 'ขี้เบ้าหล่อ'
                }}
              </p>
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
                    <h4>{{ formatWeight(totalMeltWeight) }} กรัม</h4>
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
import { ExcelHelper } from '@/services/utils/excel-js.js'

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
      viewMode: 'monthly', // 'monthly' or 'yearly'
      scrapWeightData: null,
      isLoading: false,
      isExporting: false
    }
  },
  computed: {
    currentDataset() {
      if (!this.scrapWeightData) return []
      return this.activeDataset === 'melt'
        ? this.scrapWeightData.meltScrapData
        : this.scrapWeightData.castScrapData
    },
    currentYearlyCategoryData() {
      if (!this.scrapWeightData) return []

      // Calculate yearly summary directly in computed property
      const currentYear = new Date().getFullYear()
      const dataToProcess =
        this.activeDataset === 'melt'
          ? this.scrapWeightData.meltScrapData || []
          : this.scrapWeightData.castScrapData || []

      const categoryMap = new Map()

      // Aggregate all monthly data by goldName and goldSizeName
      dataToProcess.forEach((monthData) => {
        if (monthData.goldCategories && monthData.goldCategories.length > 0) {
          monthData.goldCategories.forEach((category) => {
            const key = `${category.goldName || 'ไม่ระบุ'}_${category.goldSizeName || 'ไม่ระบุ'}`

            if (categoryMap.has(key)) {
              const existing = categoryMap.get(key)
              existing.totalYearlyWeight += parseFloat(category.weight || 0)
              existing.monthsWithData += 1
            } else {
              categoryMap.set(key, {
                goldName: category.goldName || 'ไม่ระบุ',
                goldSizeName: category.goldSizeName || 'ไม่ระบุ',
                totalYearlyWeight: parseFloat(category.weight || 0),
                monthsWithData: 1
              })
            }
          })
        }
      })

      // Convert map to array and calculate averages
      const aggregatedData = []
      categoryMap.forEach((categoryData) => {
        const averageWeight = categoryData.totalYearlyWeight / categoryData.monthsWithData

        aggregatedData.push({
          goldName: categoryData.goldName,
          goldSizeName: categoryData.goldSizeName,
          totalYearlyWeight: categoryData.totalYearlyWeight.toFixed(2),
          monthsWithData: categoryData.monthsWithData,
          averageMonthlyWeight: averageWeight.toFixed(2),
          year: currentYear
        })
      })

      // Sort by total weight descending
      return aggregatedData.sort(
        (a, b) => parseFloat(b.totalYearlyWeight) - parseFloat(a.totalYearlyWeight)
      )
    },
    totalMeltWeight() {
      if (!this.scrapWeightData?.meltScrapData) return 0
      return this.scrapWeightData.meltScrapData.reduce((sum, month) => sum + month.totalWeight, 0)
    },
    totalCastWeight() {
      if (!this.scrapWeightData?.castScrapData) return 0
      return this.scrapWeightData.castScrapData.reduce((sum, month) => sum + month.totalWeight, 0)
    },
    currentTotalWeight() {
      return this.activeDataset === 'melt' ? this.totalMeltWeight : this.totalCastWeight
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
    },
    calculatePercentage(categoryWeight) {
      if (!this.currentTotalWeight || this.currentTotalWeight === 0) return '0.00'
      const percentage = (parseFloat(categoryWeight) / this.currentTotalWeight) * 100
      return percentage.toFixed(1)
    },
    async exportToExcel() {
      try {
        this.isExporting = true

        if (!this.scrapWeightData) {
          this.$swal.fire({
            icon: 'warning',
            title: 'แจ้งเตือน',
            text: 'ไม่มีข้อมูลสำหรับส่งออก'
          })
          return
        }

        const currentYear = new Date().getFullYear()
        const sheets = []

        // Create Melt Scrap Data Sheet
        if (this.scrapWeightData.meltScrapData && this.scrapWeightData.meltScrapData.length > 0) {
          const meltData = this.prepareMeltExportData(this.scrapWeightData.meltScrapData)
          sheets.push({
            data: meltData,
            sheetName: 'ขี้เบ้าหลอม',
            columns: [
              { header: 'เดือน', key: 'monthName' },
              { header: 'ปี', key: 'year' },
              { header: 'ประเภททอง', key: 'goldName' },
              { header: 'ขนาดทอง', key: 'goldSizeName' },
              { header: 'น้ำหนัก (กรัม)', key: 'weight' },
              { header: 'รวมรายเดือน (กรัม)', key: 'monthlyTotal' }
            ],
            columnWidths: {
              monthName: 15,
              year: 10,
              goldName: 20,
              goldSizeName: 15,
              weight: 18,
              monthlyTotal: 20
            }
          })
        }

        // Create Cast Scrap Data Sheet
        if (this.scrapWeightData.castScrapData && this.scrapWeightData.castScrapData.length > 0) {
          const castData = this.prepareCastExportData(this.scrapWeightData.castScrapData)
          sheets.push({
            data: castData,
            sheetName: 'ขี้เบ้าหล่อ',
            columns: [
              { header: 'เดือน', key: 'monthName' },
              { header: 'ปี', key: 'year' },
              { header: 'ประเภททอง', key: 'goldName' },
              { header: 'ขนาดทอง', key: 'goldSizeName' },
              { header: 'น้ำหนัก (กรัม)', key: 'weight' },
              { header: 'รวมรายเดือน (กรัม)', key: 'monthlyTotal' }
            ],
            columnWidths: {
              monthName: 15,
              year: 10,
              goldName: 20,
              goldSizeName: 15,
              weight: 18,
              monthlyTotal: 20
            }
          })
        }

        // Create Yearly Category Summary Sheets
        const yearlyCategorySummary = this.prepareYearlyCategorySummary()
        if (yearlyCategorySummary.melt.length > 0) {
          sheets.push({
            data: yearlyCategorySummary.melt,
            sheetName: 'สรุปขี้เบ้าหลอมรายปี',
            columns: [
              { header: 'ประเภททอง', key: 'goldName' },
              { header: 'ขนาดทอง', key: 'goldSizeName' },
              { header: 'น้ำหนักรวมทั้งปี (กรัม)', key: 'totalYearlyWeight' },
              { header: 'จำนวนเดือนที่มีข้อมูล', key: 'monthsWithData' },
              { header: 'น้ำหนักเฉลี่ยต่อเดือน (กรัม)', key: 'averageMonthlyWeight' },
              { header: 'ปี', key: 'year' }
            ],
            columnWidths: {
              goldName: 20,
              goldSizeName: 15,
              totalYearlyWeight: 25,
              monthsWithData: 20,
              averageMonthlyWeight: 25,
              year: 10
            }
          })
        }

        if (yearlyCategorySummary.cast.length > 0) {
          sheets.push({
            data: yearlyCategorySummary.cast,
            sheetName: 'สรุปขี้เบ้าหล่อรายปี',
            columns: [
              { header: 'ประเภททอง', key: 'goldName' },
              { header: 'ขนาดทอง', key: 'goldSizeName' },
              { header: 'น้ำหนักรวมทั้งปี (กรัม)', key: 'totalYearlyWeight' },
              { header: 'จำนวนเดือนที่มีข้อมูล', key: 'monthsWithData' },
              { header: 'น้ำหนักเฉลี่ยต่อเดือน (กรัม)', key: 'averageMonthlyWeight' },
              { header: 'ปี', key: 'year' }
            ],
            columnWidths: {
              goldName: 20,
              goldSizeName: 15,
              totalYearlyWeight: 25,
              monthsWithData: 20,
              averageMonthlyWeight: 25,
              year: 10
            }
          })
        }

        // Create Overall Summary Sheet
        const summaryData = this.prepareSummaryExportData()
        sheets.push({
          data: summaryData,
          sheetName: 'สรุปรวมทั้งหมด',
          columns: [
            { header: 'ประเภท', key: 'type' },
            { header: 'น้ำหนักรวม (กรัม)', key: 'totalWeight' },
            { header: 'ปี', key: 'year' }
          ],
          columnWidths: {
            type: 20,
            totalWeight: 25,
            year: 10
          }
        })

        const filename = `รายงานน้ำหนักขี้เบ้าทอง_${currentYear}`
        const success = await ExcelHelper.exportToExcelMultiSheet(sheets, { filename })

        if (success) {
          this.$swal.fire({
            icon: 'success',
            title: 'สำเร็จ',
            text: 'ส่งออกข้อมูล Excel เรียบร้อยแล้ว',
            timer: 2000,
            showConfirmButton: false
          })
        } else {
          throw new Error('Export failed')
        }
      } catch (error) {
        console.error('Error exporting Excel:', error)
        this.$swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถส่งออกข้อมูล Excel ได้'
        })
      } finally {
        this.isExporting = false
      }
    },
    prepareMeltExportData(meltData) {
      const exportData = []
      const currentYear = new Date().getFullYear()

      meltData.forEach((monthData) => {
        if (monthData.goldCategories && monthData.goldCategories.length > 0) {
          monthData.goldCategories.forEach((category) => {
            exportData.push({
              monthName: monthData.monthName,
              year: currentYear,
              goldName: category.goldName || 'ไม่ระบุ',
              goldSizeName: category.goldSizeName || 'ไม่ระบุ',
              weight: parseFloat(category.weight || 0).toFixed(2),
              monthlyTotal: parseFloat(monthData.totalWeight || 0).toFixed(2)
            })
          })
        } else if (monthData.totalWeight > 0) {
          exportData.push({
            monthName: monthData.monthName,
            year: currentYear,
            goldName: 'ไม่มีรายละเอียด',
            goldSizeName: 'ไม่มีรายละเอียด',
            weight: parseFloat(monthData.totalWeight || 0).toFixed(2),
            monthlyTotal: parseFloat(monthData.totalWeight || 0).toFixed(2)
          })
        }
      })

      return exportData
    },
    prepareCastExportData(castData) {
      const exportData = []
      const currentYear = new Date().getFullYear()

      castData.forEach((monthData) => {
        if (monthData.goldCategories && monthData.goldCategories.length > 0) {
          monthData.goldCategories.forEach((category) => {
            exportData.push({
              monthName: monthData.monthName,
              year: currentYear,
              goldName: category.goldName || 'ไม่ระบุ',
              goldSizeName: category.goldSizeName || 'ไม่ระบุ',
              weight: parseFloat(category.weight || 0).toFixed(2),
              monthlyTotal: parseFloat(monthData.totalWeight || 0).toFixed(2)
            })
          })
        } else if (monthData.totalWeight > 0) {
          exportData.push({
            monthName: monthData.monthName,
            year: currentYear,
            goldName: 'ไม่มีรายละเอียด',
            goldSizeName: 'ไม่มีรายละเอียด',
            weight: parseFloat(monthData.totalWeight || 0).toFixed(2),
            monthlyTotal: parseFloat(monthData.totalWeight || 0).toFixed(2)
          })
        }
      })

      return exportData
    },
    prepareYearlyCategorySummary() {
      const currentYear = new Date().getFullYear()
      const meltSummary = this.aggregateYearlyDataByCategory(
        this.scrapWeightData?.meltScrapData || []
      )
      const castSummary = this.aggregateYearlyDataByCategory(
        this.scrapWeightData?.castScrapData || []
      )

      return {
        melt: meltSummary.map((item) => ({
          ...item,
          year: currentYear
        })),
        cast: castSummary.map((item) => ({
          ...item,
          year: currentYear
        }))
      }
    },
    aggregateYearlyDataByCategory(yearlyData) {
      const categoryMap = new Map()

      // Aggregate all monthly data by goldName and goldSizeName
      yearlyData.forEach((monthData) => {
        if (monthData.goldCategories && monthData.goldCategories.length > 0) {
          monthData.goldCategories.forEach((category) => {
            const key = `${category.goldName || 'ไม่ระบุ'}_${category.goldSizeName || 'ไม่ระบุ'}`

            if (categoryMap.has(key)) {
              const existing = categoryMap.get(key)
              existing.totalYearlyWeight += parseFloat(category.weight || 0)
              existing.monthsWithData += 1
              existing.monthlyWeights.push(parseFloat(category.weight || 0))
            } else {
              categoryMap.set(key, {
                goldName: category.goldName || 'ไม่ระบุ',
                goldSizeName: category.goldSizeName || 'ไม่ระบุ',
                totalYearlyWeight: parseFloat(category.weight || 0),
                monthsWithData: 1,
                monthlyWeights: [parseFloat(category.weight || 0)]
              })
            }
          })
        }
      })

      // Convert map to array and calculate averages
      const aggregatedData = []
      categoryMap.forEach((categoryData) => {
        const averageWeight = categoryData.totalYearlyWeight / categoryData.monthsWithData

        aggregatedData.push({
          goldName: categoryData.goldName,
          goldSizeName: categoryData.goldSizeName,
          totalYearlyWeight: categoryData.totalYearlyWeight.toFixed(2),
          monthsWithData: categoryData.monthsWithData,
          averageMonthlyWeight: averageWeight.toFixed(2)
        })
      })

      // Sort by total weight descending
      return aggregatedData.sort(
        (a, b) => parseFloat(b.totalYearlyWeight) - parseFloat(a.totalYearlyWeight)
      )
    },
    prepareSummaryExportData() {
      const currentYear = new Date().getFullYear()
      return [
        {
          type: 'ขี้เบ้าหลอมรวมทั้งปี',
          totalWeight: parseFloat(this.totalMeltWeight || 0).toFixed(2),
          year: currentYear
        },
        {
          type: 'ขี้เบ้าหล่อรวมทั้งปี',
          totalWeight: parseFloat(this.totalCastWeight || 0).toFixed(2),
          year: currentYear
        },
        {
          type: 'รวมทั้งหมด',
          totalWeight: parseFloat(
            (this.totalMeltWeight || 0) + (this.totalCastWeight || 0)
          ).toFixed(2),
          year: currentYear
        }
      ]
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
        .scrap-weight-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          gap: 15px;

          .scrap-weight-tabs {
            display: flex;
            flex: 1;

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

          .view-toggle {
            display: flex;
            background: #f8f9fa;
            border-radius: 6px;
            padding: 2px;

            .toggle-button {
              padding: 8px 16px;
              background: transparent;
              border: none;
              color: $base-sub-color;
              cursor: pointer;
              transition: all 0.3s ease;
              border-radius: 4px;
              font-size: 13px;
              white-space: nowrap;

              &.active {
                background: $base-font-color;
                color: #ffff;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
              }

              &:hover:not(.active) {
                color: $base-font-color;
              }

              i {
                margin-right: 6px;
                font-size: 14px;
              }
            }
          }

          .export-controls {
            .export-button {
              padding: 8px 16px;
              background: $base-green;
              border: none;
              color: white;
              cursor: pointer;
              transition: all 0.3s ease;
              border-radius: 4px;
              font-size: 13px;
              white-space: nowrap;

              &:hover:not(:disabled) {
                //background: linear-gradient(135deg, #218838, #1db584);
                //transform: translateY(-1px);
                //box-shadow: 0 4px 8px rgba(40, 167, 69, 0.3);
              }

              &:disabled {
                background: #6c757d;
                cursor: not-allowed;
                transform: none;
                box-shadow: none;
              }

              i {
                font-size: 13px;

                &.spin {
                  animation: spin 1s linear infinite;
                }
              }

              span {
                white-space: nowrap;
              }
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

        .yearly-category-container {
          .yearly-header {
            text-align: center;
            margin-bottom: 25px;
            padding: 20px;
            background: linear-gradient(135deg, #f8f9fa, #e9ecef);
            border-radius: 8px;
            border: 1px solid #dee2e6;

            h6 {
              color: $base-font-color;
              font-weight: bold;
              margin: 0 0 5px 0;
              font-size: 16px;
            }

            .yearly-subtitle {
              color: $base-sub-color;
              font-size: 14px;
            }
          }

          .yearly-category-card {
            background: white;
            border-radius: 8px;
            border: 1px solid #e9ecef;
            transition: all 0.3s ease;
            height: 100%;
            overflow: hidden;

            &:hover {
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
              transform: translateY(-2px);
            }

            .category-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 15px 20px;
              background: linear-gradient(135deg, #f1f3f4, #e8eaed);
              border-bottom: 1px solid #e9ecef;

              .category-title {
                flex: 1;

                .gold-name {
                  color: $base-font-color;
                  font-weight: bold;
                  margin: 0;
                  font-size: 15px;
                }

                .gold-size {
                  color: $base-sub-color;
                  font-size: 12px;
                }
              }

              .category-rank {
                .rank-number {
                  background: $base-font-color;
                  color: white;
                  padding: 4px 8px;
                  border-radius: 12px;
                  font-size: 11px;
                  font-weight: bold;
                }
              }
            }

            .category-content {
              padding: 20px;

              .yearly-total {
                text-align: center;
                margin-bottom: 20px;

                .total-value {
                  font-size: 22px;
                  font-weight: bold;
                  color: $base-font-color;
                  display: block;
                }

                .total-unit {
                  color: $base-sub-color;
                  font-size: 12px;
                }
              }

              .category-stats {
                .stat-item {
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  padding: 8px 0;
                  border-bottom: 1px solid #f0f0f0;
                  font-size: 12px;

                  &:last-child {
                    border-bottom: none;
                  }

                  i {
                    color: $base-font-color;
                    width: 16px;
                    margin-right: 8px;
                  }

                  .stat-label {
                    flex: 1;
                    color: $base-sub-color;
                  }

                  .stat-value {
                    color: $base-font-color;
                    font-weight: 500;
                  }
                }
              }
            }
          }

          .no-yearly-data {
            text-align: center;
            padding: 50px 20px;
            color: $base-sub-color;

            i {
              font-size: 48px;
              margin-bottom: 15px;
              display: block;
            }

            p {
              margin: 0;
              font-size: 16px;
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
        .scrap-weight-controls {
          flex-direction: column;
          gap: 15px;

          .scrap-weight-tabs {
            width: 100%;

            .tab-button {
              padding: 10px 15px;
              font-size: 14px;
            }
          }

          .view-toggle {
            width: 100%;
            justify-content: center;

            .toggle-button {
              flex: 1;
              text-align: center;
            }
          }

          .export-controls {
            width: 100%;

            .export-button {
              width: 100%;
              justify-content: center;
              padding: 8px 16px;
            }
          }
        }

        .yearly-category-container {
          .yearly-category-card {
            .category-content {
              padding: 15px;

              .yearly-total {
                margin-bottom: 15px;

                .total-value {
                  font-size: 20px;
                }
              }
            }
          }
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

@media (max-width: 576px) {
  .dashboard-scrap-weight {
    .scrap-weight-card .scrap-weight-body {
      .scrap-weight-content {
        .scrap-weight-controls {
          .export-controls {
            .export-button {
              span {
                font-size: 13px;
              }
            }
          }
        }
      }
    }
  }
}
</style>
