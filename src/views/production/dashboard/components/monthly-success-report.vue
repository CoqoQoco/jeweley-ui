<template>
  <div class="monthly-success-report">
    <!-- Month Selection -->
    <div class="filter-container">
      <div>
        <div class="title-text">เลือกเดือน</div>
        <div class="form-col-container">
          <Calendar
            v-model="selectedMonth"
            view="month"
            dateFormat="MM - yy"
            showIcon
            showButtonBar
            :manualInput="false"
            @date-select="onMonthChange"
            :class="{ 'p-invalid': !selectedMonth }"
            class="me-2"
            placeholder="เลือกเดือนและปี"
          />

          <div></div>
          <div class="d-flex align-items-end justify-content-end">
            <button
              @click="loadMonthlyReport"
              class="btn btn-sm btn-green ms-2"
              :disabled="isMonthlyLoading || !selectedMonth"
            >
              <i class="bi bi-search" v-if="!isMonthlyLoading"></i>
              <i class="bi bi-arrow-clockwise spinning" v-else></i>
              {{ $t('button.search') }}
            </button>
          </div>
        </div>
      </div>

      <div class="selected-period-info mt-1" v-if="selectedMonth">
        <small class="text-muted">
          <i class="bi bi-calendar"></i>
          เดือนที่เลือก: {{ formatMonthYear(selectedMonth) }}
          <span v-if="monthlyReportData">
            | ประเภททอง: {{ planFinishByType.length }} รายการ
            | ประเภทสินค้า: {{ planFinishByProductType.length }} รายการ  
            | ประเภทลูกค้า: {{ planFinishByCustomerType.length }} รายการ
          </span>
        </small>
      </div>
    </div>

    <!-- Monthly Report Content -->
    <div v-if="monthlyReportData" class="monthly-report-content">
      <!-- Plan Finish by Type Section -->
      <div class="row mb-4">
        <div class="col-lg-6 col-md-12">
          <div class="report-card">
            <div class="card-header">
              <h5><i class="bi bi-bar-chart"></i> สรุปแผนงานที่สำเร็จ - ตามประเภททอง</h5>
            </div>
            <div class="card-body">
              <HorizontalBarChart
                :data="typeChartData"
                title=""
                :height="300"
                :datasetFields="[{ key: 'count', label: 'จำนวน', labelTH: 'จำนวน' }]"
              />
            </div>
          </div>
        </div>
        <div class="col-lg-6 col-md-12">
          <div class="report-card">
            <div class="card-header">
              <h5><i class="bi bi-table"></i> รายละเอียดตามประเภททอง</h5>
            </div>
            <div class="card-body">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>ประเภททอง</th>
                    <th class="text-center">จำนวนแผนงาน</th>
                    <th class="text-center">จำนวนสั่งผลิต</th>
                    <th class="text-center">เปอร์เซ็นต์</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in planFinishByType" :key="item.type">
                    <td class="font-weight-bold">{{ item.typeName || item.type }}</td>
                    <td class="text-center">
                      <span class="badge badge-success">{{ item.count }}</span>
                    </td>
                    <td class="text-center">{{ item.totalQty }} ชิ้น</td>
                    <td class="text-center">
                      <span class="percentage-badge">{{ item.percentage }}%</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Plan Finish by Product Type Section -->
      <div class="row mb-4">
        <div class="col-lg-6 col-md-12">
          <div class="report-card">
            <div class="card-header">
              <h5><i class="bi bi-bar-chart"></i> สรุปแผนงานที่สำเร็จ - ตามประเภทสินค้า</h5>
            </div>
            <div class="card-body">
              <HorizontalBarChart
                :data="productTypeChartData"
                title=""
                :height="300"
                :datasetFields="[{ key: 'count', label: 'จำนวน', labelTH: 'จำนวน' }]"
              />
            </div>
          </div>
        </div>
        <div class="col-lg-6 col-md-12">
          <div class="report-card">
            <div class="card-header">
              <h5><i class="bi bi-table"></i> รายละเอียดตามประเภทสินค้า</h5>
            </div>
            <div class="card-body">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>ประเภทสินค้า</th>
                    <th class="text-center">จำนวนแผนงาน</th>
                    <th class="text-center">จำนวนสั่งผลิต</th>
                    <th class="text-center">เปอร์เซ็นต์</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in planFinishByProductType" :key="item.productType">
                    <td class="font-weight-bold">{{ item.productTypeName || item.productType }}</td>
                    <td class="text-center">
                      <span class="badge badge-success">{{ item.count }}</span>
                    </td>
                    <td class="text-center">{{ item.totalQty }} ชิ้น</td>
                    <td class="text-center">
                      <span class="percentage-badge">{{ item.percentage }}%</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Plan Finish by Customer Type Section -->
      <div class="row mb-4">
        <div class="col-lg-6 col-md-12">
          <div class="report-card">
            <div class="card-header">
              <h5><i class="bi bi-bar-chart"></i> สรุปแผนงานที่สำเร็จ - ตามประเภทลูกค้า</h5>
            </div>
            <div class="card-body">
              <HorizontalBarChart
                :data="customerTypeChartData"
                title=""
                :height="300"
                :datasetFields="[{ key: 'count', label: 'จำนวน', labelTH: 'จำนวน' }]"
              />
            </div>
          </div>
        </div>
        <div class="col-lg-6 col-md-12">
          <div class="report-card">
            <div class="card-header">
              <h5><i class="bi bi-table"></i> รายละเอียดตามประเภทลูกค้า</h5>
            </div>
            <div class="card-body">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>ประเภทลูกค้า</th>
                    <th class="text-center">จำนวนแผนงาน</th>
                    <th class="text-center">จำนวนสั่งผลิต</th>
                    <th class="text-center">เปอร์เซ็นต์</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in planFinishByCustomerType" :key="item.customerType">
                    <td class="font-weight-bold">{{ item.customerTypeName || item.customerType }}</td>
                    <td class="text-center">
                      <span class="badge badge-success">{{ item.count }}</span>
                    </td>
                    <td class="text-center">{{ item.totalQty }} ชิ้น</td>
                    <td class="text-center">
                      <span class="percentage-badge">{{ item.percentage }}%</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="placeholder-content">
        <i class="bi bi-calendar-month"></i>
        <h4>{{ $t('view.production.dashboard.monthlyReport') }}</h4>
        <p>กรุณาเลือกช่วงวันที่เพื่อดูรายงานรายเดือน</p>
      </div>
    </div>
  </div>
</template>

<script>
import { useProductionMonthlyReportApiStore } from '@/stores/modules/api/plan/monthly-report-store-api.js'
import Calendar from 'primevue/calendar'
import HorizontalBarChart from '@/components/prime-vue/HorizontalBarChart.vue'
import dayjs from 'dayjs'

export default {
  name: 'MonthlySuccessReport',
  components: {
    Calendar,
    HorizontalBarChart
  },
  setup() {
    const monthlyReportApiStore = useProductionMonthlyReportApiStore()
    return {
      monthlyReportApiStore
    }
  },
  data() {
    return {
      selectedMonth: new Date() // Current month for the month picker
    }
  },
  computed: {
    // Monthly Report Computed Properties
    monthlyReportData() {
      return this.monthlyReportApiStore.getMonthlyReportData
    },
    planFinishByType() {
      return this.monthlyReportApiStore.getPlanFinishByType
    },
    planFinishByProductType() {
      return this.monthlyReportApiStore.getPlanFinishByProductType
    },
    planFinishByCustomerType() {
      return this.monthlyReportApiStore.getPlanFinishByCustomerType
    },
    typeChartData() {
      return this.monthlyReportApiStore.getTypeChartData
    },
    productTypeChartData() {
      return this.monthlyReportApiStore.getProductTypeChartData
    },
    customerTypeChartData() {
      return this.monthlyReportApiStore.getCustomerTypeChartData
    },
    isMonthlyLoading() {
      return this.monthlyReportApiStore.getIsLoading
    }
  },
  methods: {
    // Monthly Report Methods
    onMonthChange(event) {
      this.selectedMonth = event
    },

    async loadMonthlyReport() {
      try {
        if (!this.selectedMonth) {
          this.$swal.fire({
            icon: 'warning',
            title: 'คำเตือน',
            text: 'กรุณาเลือกเดือนและปี'
          })
          return
        }

        console.log('Loading monthly report for month:', this.selectedMonth)

        await this.monthlyReportApiStore.fetchMonthlyReport(true, {
          selectedMonth: this.selectedMonth
        })

        console.log('Monthly report loaded:', this.monthlyReportData)
      } catch (error) {
        console.error('Error loading monthly report:', error)
        this.$swal.fire({
          icon: 'error',
          title: 'ข้อผิดพลาด',
          text: 'ไม่สามารถโหลดรายงานรายเดือนได้'
        })
      }
    },

    formatMonthYear(date) {
      if (!date) return ''
      return dayjs(date).format('MM/YYYY')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/variable.scss';
@import '@/assets/scss/custom-style/standard-form.scss';

.monthly-success-report {
  background-color: #f8f9fa;
  min-height: 100vh;

  .selected-period-info {
    background: #f8f9fa;
    border-radius: 4px;
    padding: 10px 15px;
    border-left: 4px solid $base-font-color;

    small i {
      margin-right: 5px;
    }
  }

  .monthly-report-content {
    .report-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      margin-bottom: 20px;

      .card-header {
        background: linear-gradient(135deg, $base-font-color, lighten($base-font-color, 10%));
        color: white;
        padding: 15px 20px;
        border-radius: 8px 8px 0 0;
        border-bottom: none;

        h5 {
          margin: 0;
          font-weight: 600;
          font-size: 16px;

          i {
            margin-right: 8px;
          }
        }
      }

      .card-body {
        padding: 20px;

        .badge {
          font-size: 12px;
          padding: 4px 8px;

          &.badge-success {
            background-color: #038387;
            color: white;
          }
        }

        .percentage-badge {
          background-color: #038387;
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .font-weight-bold {
          font-weight: 600;
          color: $base-font-color;
        }
      }
    }
  }

  // Empty State
  .empty-state {
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

  .spinning {
    animation: spin 1s linear infinite;
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
    .monthly-report-content {
      .report-card .card-header h5 {
        font-size: 14px;
      }
    }
  }
}
</style>