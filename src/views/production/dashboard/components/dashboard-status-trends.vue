<template>
  <div class="dashboard-status-trends">
    <!-- Status Trends -->
    <div class="trends-card">
      <div class="trends-header">
        <h5>{{ $t('view.production.dashboard.statusTrends') }}</h5>
      </div>
      <div class="trends-body">
        <div v-for="trend in statusTrends" :key="trend.status" class="trend-item">
          <div class="trend-info">
            <h6>{{ trend.statusName }}</h6>
            <div class="trend-stats">
              <span class="count">{{ trend.count }}</span>
              <span class="percentage">{{ trend.percentage }}%</span>
            </div>
          </div>
        </div>
        <div v-if="!statusTrends || statusTrends.length === 0" class="trends-empty">
          <i class="bi bi-graph-up"></i>
          <p>{{ $t('view.production.dashboard.noTrends') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DashboardStatusTrends',
  props: {
    statusTrends: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/variable.scss';

.dashboard-status-trends {
  .trends-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow: hidden;

    .trends-header {
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
    }

    .trends-body {
      padding: 20px;

      .trend-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 0;
        border-bottom: 1px solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        .trend-info {
          flex: 1;

          h6 {
            color: $base-font-color;
            margin: 0 0 5px 0;
            font-size: 14px;
            font-weight: 600;
          }

          .trend-stats {
            display: flex;
            gap: 10px;

            .count {
              background: $base-font-color;
              color: white;
              padding: 2px 8px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: bold;
            }

            .percentage {
              color: $base-sub-color;
              font-size: 12px;
            }
          }
        }

        .trend-direction {
          i {
            font-size: 20px;
          }
        }
      }

      .trends-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px;
        color: $base-sub-color;

        i {
          font-size: 48px;
          margin-bottom: 15px;
        }
      }
    }
  }
}
</style>