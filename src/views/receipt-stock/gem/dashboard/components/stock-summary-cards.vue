<template>
  <div class="row ">
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
      <div class="stat-card total">
        <div class="stat-card-body">
          <div class="stat-icon">
            <i class="bi bi-boxes"></i>
          </div>
          <div class="stat-content">
            <h3>{{ formatNumber(stockSummary.totalQuantity) }}</h3>
            <p>{{ $t('view.stock.gem.dashboard.totalQuantity') }}</p>
            <small class="stat-detail">{{ $t('view.stock.gem.dashboard.pieceCount') }}</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Total Weight -->
    <div class="col-lg-3 col-md-6 mb-3">
      <div class="stat-card total">
        <div class="stat-card-body">
          <div class="stat-icon">
            <i class="bi bi-boxes"></i>
          </div>
          <div class="stat-content">
            <h3>{{ formatNumber(stockSummary.totalQuantityWeight) }}</h3>
            <p>{{ $t('view.stock.gem.dashboard.totalWeight') }}</p>
            <small class="stat-detail">{{ $t('view.stock.gem.dashboard.weightInGrams') }}</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Low Stock Alert -->
    <div class="col-lg-3 col-md-6 mb-3">
      <div class="stat-card total">
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
</template>

<script>
export default {
  name: 'StockSummaryCards',
  props: {
    stockSummary: {
      type: Object,
      default: () => ({})
    }
  },
  methods: {
    formatNumber(value) {
      if (!value) return '0'
      return new Intl.NumberFormat().format(value)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/variable.scss';

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

// Responsive adjustments
@media (max-width: 768px) {
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
}
</style>