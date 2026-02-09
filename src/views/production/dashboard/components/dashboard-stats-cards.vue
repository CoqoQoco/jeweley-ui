<template>
  <div class="dashboard-stats-cards">
    <!-- Dashboard Stats Cards -->
    <div class="row">
      <!-- Total Plans -->
      <div class="col-lg-3 col-md-6 mb-3">
        <div class="stat-card total">
          <div class="stat-card-body">
            <div class="stat-icon">
              <i class="bi bi-diagram-3"></i>
            </div>
            <div class="stat-content">
              <h3>{{ totalPlans }}</h3>
              <p>{{ $t('view.production.dashboard.totalPlans') }}</p>
              <small class="stat-detail">{{
                $t('view.production.dashboard.allActivePlans')
              }}</small>
            </div>
          </div>
        </div>
      </div>

      <!-- In Progress (Process) -->
      <div class="col-lg-3 col-md-6 mb-3">
        <div class="stat-card process">
          <div class="stat-card-body">
            <div class="stat-icon">
              <i class="bi bi-gear-wide-connected"></i>
            </div>
            <div class="stat-content">
              <h3>{{ inProgressPlans }}</h3>
              <p>{{ $t('view.production.dashboard.inProcess') }}</p>
              <small class="stat-detail">{{
                $t('view.production.dashboard.currentlyWorking')
              }}</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Completed Yesterday -->
      <div class="col-lg-3 col-md-6 mb-3">
        <div class="stat-card completed">
          <div class="stat-card-body">
            <div class="stat-icon">
              <i class="bi bi-check-circle-fill"></i>
            </div>
            <div class="stat-content">
              <h3>{{ completedPlans }}</h3>
              <p>{{ $t('view.production.dashboard.completedYesterday') }}</p>
              <small class="stat-detail">{{
                $t('view.production.dashboard.yesterdayFinished')
              }}</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Completed Today -->
      <div class="col-lg-3 col-md-6 mb-3">
        <div class="stat-card summary today">
          <div class="stat-card-body">
            <div class="stat-icon">
              <i class="bi bi-calendar-check"></i>
            </div>
            <div class="stat-content">
              <h3>{{ summary.completedToday }}</h3>
              <p>{{ $t('view.production.dashboard.completedToday') }}</p>
              <small class="stat-detail">{{
                $t('view.production.dashboard.finishedToday')
              }}</small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Summary Stats Row -->
    <div class="row" v-if="summary">
      <!-- Overdue Plans -->
      <div class="col-lg-3 col-md-6 mb-3">
        <div class="stat-card overdue">
          <div class="stat-card-body">
            <div class="stat-icon">
              <i class="bi bi-exclamation-triangle-fill"></i>
            </div>
            <div class="stat-content">
              <h3>{{ pendingPlans }}</h3>
              <p>{{ $t('view.production.dashboard.overduePlans') }}</p>
              <small class="stat-detail">{{
                $t('view.production.dashboard.behindSchedule')
              }}</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Completion Rate -->
      <div class="col-lg-3 col-md-6 mb-3">
        <div class="stat-card summary percentage">
          <div class="stat-card-body">
            <div class="stat-icon">
              <i class="bi bi-percent"></i>
            </div>
            <div class="stat-content">
              <h3>{{ summary.percentageCompleted.toFixed(2) }}%</h3>
              <p>{{ $t('view.production.dashboard.completionRate') }}</p>
              <small class="stat-detail">{{
                $t('view.production.dashboard.overallProgress')
              }}</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DashboardStatsCards',
  props: {
    totalPlans: {
      type: Number,
      default: 0
    },
    inProgressPlans: {
      type: Number,
      default: 0
    },
    completedPlans: {
      type: Number,
      default: 0
    },
    pendingPlans: {
      type: Number,
      default: 0
    },
    summary: {
      type: Object,
      default: () => ({})
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/variable.scss';

.dashboard-stats-cards {
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

    // Different colors for different card types
    &.total {
      border-left-color: $base-font-color;
    }
    &.process {
      border-left-color: $base-font-color;
    }
    &.completed {
      border-left-color: $base-font-color;
    }
    &.overdue {
      border-left-color: $base-font-color;
    }
    &.summary.active {
      border-left-color: $base-font-color;
    }
    &.summary.today {
      border-left-color: $base-font-color;
    }
    &.summary.approval {
      border-left-color: $base-font-color;
    }
    &.summary.percentage {
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
}

// Responsive adjustments
@media (max-width: 768px) {
  .dashboard-stats-cards {
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
}
</style>