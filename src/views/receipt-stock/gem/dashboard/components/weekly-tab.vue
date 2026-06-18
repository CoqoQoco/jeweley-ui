<template>
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
</template>

<script>
export default {
  name: 'WeeklyTab',

  props: {
    weeklySummary: {
      type: Object,
      default: () => ({
        totalTransactions: 0,
        priceChanges: 0,
        newStockItems: 0,
        lowStockAlerts: 0
      })
    },
    weeklyMovements: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/variable.scss';

.stat-card {
  background: white;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s ease;
  border-left: 4px solid $base-color;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  &.weekly {
    border-left-color: #28a745;
  }

  .stat-card-body {
    padding: var(--sp-xl);
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
    }
  }
}

.activities-card {
  background: white;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  overflow: hidden;

  .activities-header {
    padding: var(--sp-xl);
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
        margin-bottom: 15px;
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
        }
      }
    }
  }
}
</style>
