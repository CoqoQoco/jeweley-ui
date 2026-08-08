<template>
  <div class="row">
    <!-- Today's Summary Cards -->
    <div class="col-12 mb-4">
      <div class="kpi-grid">
        <StatCardGeneric
          icon="bi-activity"
          :value="todaySummary.totalTransactions"
          :label="$t('view.stock.gem.dashboard.todayTransactions')"
        />
        <StatCardGeneric
          icon="bi-plus-circle"
          :value="todaySummary.newStockItems"
          :label="$t('view.stock.gem.dashboard.newItems')"
          variant="green"
        />
        <StatCardGeneric
          icon="bi-exclamation-triangle"
          :value="todaySummary.lowStockAlerts"
          :label="$t('view.stock.gem.dashboard.lowStockAlerts')"
          variant="grey"
        />
      </div>
    </div>

    <!-- Today's Transactions -->
    <div class="col-12">
      <div class="activities-card">
        <div class="activities-header">
          <h5>{{ $t('view.stock.gem.dashboard.todayTransactions') }}</h5>
          <div class="activities-header-actions">
            <span class="badge bg-primary">{{ todayTransactions.length }}</span>
            <ButtonGeneric
              variant="green"
              icon="bi-file-earmark-excel"
              :title="$t('common.btn.export')"
              class="ml-2"
              :disabled="!todayTransactions.length"
              @click="exportToExcel"
            />
          </div>
        </div>
        <div class="activities-body">
          <div v-if="todayTransactions.length > 0" class="activities-list">
            <div
              v-for="transaction in todayTransactions.slice(0, 10)"
              :key="transaction.running"
              class="activity-item"
            >
              <div class="activity-icon">
                <i :class="getTransactionIcon(transaction.type)"></i>
              </div>
              <div class="activity-content">
                <div class="activity-header">
                  <h6>{{ transaction.code }} - {{ transaction.groupName }}</h6>
                  <span class="activity-time">{{ formatDateTime(transaction.createDate) }}</span>
                </div>
                <p class="activity-description">
                  {{ transaction.typeName }} - {{ $t('view.stock.gem.dashboard.quantity') }}:
                  {{ formatNumber(transaction.qty) }}
                </p>
                <div class="activity-details">
                  <div class="detail-row">
                    <span class="detail-label">{{ $t('view.stock.gem.dashboard.status') }}:</span>
                    <span class="detail-value">{{ transaction.status }}</span>
                  </div>
                  <div class="detail-row" v-if="transaction.jobOrPo">
                    <span class="detail-label">{{ $t('view.stock.gem.dashboard.jobOrPo') }}:</span>
                    <span class="detail-value">{{ transaction.jobOrPo }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="activities-empty">
            <i class="bi bi-clock-history"></i>
            <p>{{ $t('view.stock.gem.dashboard.noTodayTransactions') }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'

import { ExcelHelper } from '@/services/utils/excel-js.js'
import { formatDate } from '@/services/utils/dayjs.js'
import { success } from '@/services/alert/sweetAlerts.js'

import StatCardGeneric from '@/components/generic/StatCardGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

export default {
  name: 'TodayTab',

  components: {
    StatCardGeneric,
    ButtonGeneric
  },

  props: {
    todaySummary: {
      type: Object,
      default: () => ({
        totalTransactions: 0,
        newStockItems: 0,
        lowStockAlerts: 0
      })
    },
    todayTransactions: {
      type: Array,
      default: () => []
    }
  },

  methods: {
    getTransactionIcon(type) {
      switch (type) {
        case 1:
          return 'bi bi-plus-circle text-success'
        case 2:
          return 'bi bi-arrow-down-circle text-success'
        case 3:
          return 'bi bi-arrow-return-left text-success'
        case 4:
          return 'bi bi-arrow-up-circle text-danger'
        case 5:
          return 'bi bi-arrow-up-right-circle text-warning'
        case 6:
          return 'bi bi-arrow-return-right text-info'
        case 7:
          return 'bi bi-arrow-up-circle text-danger'
        default:
          return 'bi bi-arrow-left-right text-secondary'
      }
    },

    formatNumber(value, decimals = 0) {
      if (!value) return '0' + (decimals > 0 ? '.'.padEnd(decimals + 1, '0') : '')
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(value)
    },

    formatDateTime(date) {
      return dayjs(date).format('DD/MM/YYYY HH:mm')
    },

    exportToExcel() {
      if (!this.todayTransactions.length) return

      const dataExcel = this.todayTransactions.map((item) => ({
        [this.$t('view.stock.gem.dashboard.gemCode')]: item.code,
        [this.$t('view.stock.gem.dashboard.groupName')]: item.groupName,
        [this.$t('view.stock.gem.dashboard.type')]: item.typeName,
        [this.$t('view.stock.gem.dashboard.quantity')]: item.qty,
        [this.$t('view.stock.gem.dashboard.status')]: item.status,
        [this.$t('view.stock.gem.dashboard.jobOrPo')]: item.jobOrPo || '-',
        [this.$t('view.stock.gem.dashboard.createDate')]: this.formatDateTime(item.createDate)
      }))

      ExcelHelper.exportToExcel(dataExcel, {
        filename: `gem-today-transactions_[${formatDate(new Date())}].xlsx`,
        sheetName: 'Today Transactions'
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

          .activity-details {
            background: #f8f9fa;
            border-radius: var(--radius-sm);
            padding: 8px;

            .detail-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 3px;
              font-size: 11px;

              &:last-child {
                margin-bottom: 0;
              }

              .detail-label {
                color: $base-sub-color;
                font-weight: 600;
              }

              .detail-value {
                color: $base-font-color;
              }
            }
          }
        }
      }
    }
  }
}
</style>
