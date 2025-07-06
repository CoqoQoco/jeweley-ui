<template>
  <div class="trends-card">
    <div class="trends-header">
      <h5>{{ $t('view.stock.gem.dashboard.priceAlerts') }}</h5>
    </div>
    <div class="trends-body">
      <div v-if="priceAlerts && priceAlerts.length > 0">
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
      </div>
      <div v-else class="trends-empty">
        <i class="bi bi-currency-exchange"></i>
        <p>{{ $t('view.stock.gem.dashboard.noPriceChanges') }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PriceAlertsPanel',
  props: {
    priceAlerts: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    formatCurrency(value) {
      if (!value) return '฿0'
      return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB'
      }).format(value)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/variable.scss';

.trends-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;

  .trends-header {
    padding: 20px;
    border-bottom: 1px solid $base-color;

    h5 {
      color: $base-font-color;
      font-weight: bold;
      margin: 0;
    }
  }

  .trends-body {
    padding: 20px;

    .trend-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 0;
      border-bottom: 1px solid #e9ecef;

      &:last-child {
        border-bottom: none;
      }

      .trend-info {
        flex: 1;

        h6 {
          color: $base-font-color;
          font-weight: 600;
          margin: 0 0 5px 0;
          font-size: 14px;
        }

        small {
          color: $base-sub-color;
          font-size: 12px;
        }

        .trend-stats {
          margin-top: 8px;
          display: flex;
          align-items: center;
          font-size: 12px;

          .price-old {
            color: $base-sub-color;
            text-decoration: line-through;
          }

          .price-new {
            color: $base-font-color;
            font-weight: 600;
          }

          i {
            color: $base-sub-color;
          }
        }
      }

      .trend-direction {
        .percentage-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;

          &.increase {
            background: #d1f2eb;
            color: #27ae60;
          }

          &.decrease {
            background: #fadbd8;
            color: #e74c3c;
          }

          &.stable {
            background: #e8f4fd;
            color: #3498db;
          }
        }
      }
    }

    .trends-empty {
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

// Responsive adjustments
@media (max-width: 768px) {
  .trend-item {
    flex-direction: column;
    align-items: flex-start;

    .trend-direction {
      margin-top: 10px;
      align-self: flex-end;
    }
  }
}
</style>