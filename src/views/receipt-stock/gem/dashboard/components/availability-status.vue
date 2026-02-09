<template>
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
</template>

<script>
export default {
  name: 'AvailabilityStatus',
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

.summary-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;

  .summary-header {
    padding: 20px;
    border-bottom: 1px solid $base-color;

    h5 {
      color: $base-font-color;
      font-weight: bold;
      margin: 0;
    }
  }

  .summary-body {
    padding: 20px;

    .availability-stats {
      display: flex;
      gap: 20px;

      .stat-item {
        flex: 1;
        display: flex;
        align-items: center;
        padding: 20px;
        border-radius: 8px;
        transition: transform 0.2s ease;

        &:hover {
          transform: translateY(-2px);
        }

        &.available {
          background: linear-gradient(135deg, #d1f2eb, #a3e4d7);
          border-left: 4px solid #27ae60;

          i {
            color: #27ae60;
          }
        }

        &.on-process {
          background: linear-gradient(135deg, #fdf2e9, #fadbd8);
          border-left: 4px solid #e67e22;

          i {
            color: #e67e22;
          }
        }

        i {
          font-size: 32px;
          margin-right: 15px;
        }

        .stat-content {
          h4 {
            font-size: 24px;
            font-weight: bold;
            color: $base-font-color;
            margin: 0 0 5px 0;
          }

          small {
            color: $base-sub-color;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
          }
        }
      }
    }
  }
}

// Responsive adjustments
@media (max-width: 768px) {
  .availability-stats {
    flex-direction: column;
    gap: 15px;

    .stat-item {
      padding: 15px;

      i {
        font-size: 24px;
        margin-right: 10px;
      }

      .stat-content h4 {
        font-size: 20px;
      }
    }
  }
}
</style>