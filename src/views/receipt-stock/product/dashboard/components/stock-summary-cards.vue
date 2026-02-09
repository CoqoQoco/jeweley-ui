<template>
  <div class="row mb-4">
    <!-- Total Products -->
    <div class="col-lg-3 col-md-6 mb-3">
      <div class="stat-card total">
        <div class="stat-card-body">
          <div class="stat-icon">
            <i class="bi bi-box-seam"></i>
          </div>
          <div class="stat-content">
            <h3>{{ formatNumber(stockSummary.totalProducts) }}</h3>
            <p>สินค้าทั้งหมด</p>
            <small class="stat-detail">จำนวน: {{ formatNumber(stockSummary.totalQuantity) }} ชิ้น</small>
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
            <p>มูลค่ารวม</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Available Products -->
    <div class="col-lg-3 col-md-6 mb-3">
      <div class="stat-card process">
        <div class="stat-card-body">
          <div class="stat-icon">
            <i class="bi bi-check-circle"></i>
          </div>
          <div class="stat-content">
            <h3>{{ formatNumber(stockSummary.availableCount) }}</h3>
            <p>สินค้าพร้อมขาย</p>
            <small class="stat-detail">จำนวน: {{ formatNumber(stockSummary.availableQuantity) }} ชิ้น</small>
          </div>
        </div>
      </div>
    </div>

    <!-- On Process Products -->
    <div class="col-lg-3 col-md-6 mb-3">
      <div class="stat-card overdue">
        <div class="stat-card-body">
          <div class="stat-icon">
            <i class="bi bi-hourglass-split"></i>
          </div>
          <div class="stat-content">
            <h3>{{ formatNumber(stockSummary.onProcessCount) }}</h3>
            <p>อยู่ระหว่างดำเนินการ</p>
            <small class="stat-detail">จำนวน: {{ formatNumber(stockSummary.onProcessQuantity) }} ชิ้น</small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StockSummaryCards',
  props: {
    stockSummary: {
      type: Object,
      default: () => ({
        totalProducts: 0,
        totalQuantity: 0,
        totalValue: 0,
        availableQuantity: 0,
        onProcessQuantity: 0,
        availableCount: 0,
        onProcessCount: 0
      })
    }
  },
  methods: {
    formatNumber(value) {
      if (!value) return '0'
      return new Intl.NumberFormat('en-US').format(value)
    },
    formatCurrency(value) {
      if (!value) return '฿0'
      return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/variable.scss';
@import '@/assets/scss/custom-style/standard-form.scss';

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
  &.completed {
    border-left-color: $base-green;
  }
  &.process {
    border-left-color: #17a2b8;
  }
  &.overdue {
    border-left-color: $base-warning;
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
        color: $base-sub-color;
        font-size: 12px;
      }
    }
  }
}
</style>
