<template>
  <div class="row">
    <!-- Weekly Summary Cards -->
    <div class="col-12 mb-4">
      <div class="kpi-grid">
        <StatCardGeneric
          icon="bi-activity"
          :value="weeklySummary.totalTransactions || 0"
          :label="$t('view.stock.gem.dashboard.weeklyTransactions')"
        />
        <StatCardGeneric
          icon="bi-currency-exchange"
          :value="weeklySummary.priceChanges || 0"
          :label="$t('view.stock.gem.dashboard.priceChanges')"
          variant="warning"
        />
        <StatCardGeneric
          icon="bi-plus-circle"
          :value="weeklySummary.newStockItems || 0"
          :label="$t('view.stock.gem.dashboard.newItems')"
          variant="green"
        />
        <StatCardGeneric
          icon="bi-exclamation-triangle"
          :value="weeklySummary.lowStockAlerts || 0"
          :label="$t('view.stock.gem.dashboard.lowStockAlerts')"
          variant="grey"
        />
      </div>
    </div>

    <!-- Weekly Analysis -->
    <div class="col-12">
      <div class="activities-card">
        <div class="activities-header">
          <h5>{{ $t('view.stock.gem.dashboard.weeklyAnalysis') }}</h5>
          <div class="activities-header-actions">
            <span class="badge bg-success">{{ weeklyMovements.length || 0 }}</span>
            <ButtonGeneric
              variant="green"
              icon="bi-file-earmark-excel"
              :title="$t('common.btn.export')"
              class="ml-2"
              :disabled="!weeklyMovements.length"
              @click="exportToExcel"
            />
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
import { ExcelHelper } from '@/services/utils/excel-js.js'
import { formatDate } from '@/services/utils/dayjs.js'
import { success } from '@/services/alert/sweetAlerts.js'

import StatCardGeneric from '@/components/generic/StatCardGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

export default {
  name: 'WeeklyTab',

  components: {
    StatCardGeneric,
    ButtonGeneric
  },

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
  },

  methods: {
    exportToExcel() {
      if (!this.weeklyMovements.length) return

      const dataExcel = this.weeklyMovements.map((item) => ({
        [this.$t('common.field.code')]: item.code || item.title || '-',
        [this.$t('common.field.createDate')]: item.date || item.time || '-',
        [this.$t('common.field.description')]: item.description || '-'
      }))

      ExcelHelper.exportToExcel(dataExcel, {
        filename: `gem-weekly-movements_[${formatDate(new Date())}].xlsx`,
        sheetName: 'Weekly Movements'
      })

      success(this.$t('alert.exportSuccess'), this.$t('alert.success'))
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/variable.scss';

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--sp-lg);
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

    .activities-header-actions {
      display: flex;
      align-items: center;

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
