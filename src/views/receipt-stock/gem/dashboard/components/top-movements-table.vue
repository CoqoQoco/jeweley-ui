<template>
  <div class="summary-card">
    <div class="summary-header">
      <h5>{{ $t('view.stock.gem.dashboard.topMovements') }}</h5>
    </div>
    <div class="summary-body">
      <div v-if="topMovements && topMovements.length > 0" class="summary-table">
        <div class="table-header">
          <div class="col">{{ $t('view.stock.gem.dashboard.gemCode') }}</div>
          <div class="col">{{ $t('view.stock.gem.dashboard.category') }}</div>
          <div class="col">{{ $t('view.stock.gem.dashboard.transactions') }}</div>
          <div class="col">{{ $t('view.stock.gem.dashboard.quantity') }}</div>
          <div class="col">{{ $t('view.stock.gem.dashboard.weight') }}</div>
        </div>
        <div v-for="movement in topMovements" :key="movement.code" class="table-row">
          <div class="col">{{ movement.code }}</div>
          <div class="col">{{ movement.groupName }} - {{ movement.shape }}</div>
          <div class="col">{{ movement.transactionCount }}</div>
          <div class="col">{{ formatNumber(movement.totalQuantityMoved) }}</div>
          <div class="col">{{ formatNumber(movement.totalQuantityWeightMoved, 3) }}</div>
        </div>
      </div>
      <div v-else class="summary-empty">
        <i class="bi bi-activity"></i>
        <p>{{ $t('view.stock.gem.dashboard.noMovements') }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TopMovementsTable',
  props: {
    topMovements: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    formatNumber(value, decimals = 0) {
      if (!value && value !== 0) return '0' + (decimals > 0 ? '.'.padEnd(decimals + 1, '0') : '')
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(value)
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
    display: flex;
    justify-content: space-between;
    align-items: center;

    h5 {
      color: $base-font-color;
      font-weight: bold;
      margin: 0;
    }
  }

  .summary-body {
    padding: 20px;

    .summary-table {
      .table-header {
        display: flex;
        background: #f8f9fa;
        border-radius: 6px;
        font-weight: 600;
        color: $base-font-color;
        font-size: 13px;
        padding: 12px 0;
        margin-bottom: 10px;

        .col {
          flex: 1;
          padding: 0 15px;
          text-align: left;
        }
      }

      .table-row {
        display: flex;
        padding: 10px 0;
        border-bottom: 1px solid #e9ecef;
        font-size: 13px;
        color: $base-sub-color;

        &:hover {
          background: #f8f9fa;
          border-radius: 4px;
        }

        &:last-child {
          border-bottom: none;
        }

        .col {
          flex: 1;
          padding: 0 15px;
          display: flex;
          align-items: center;

          &:first-child {
            font-weight: 600;
            color: $base-font-color;
          }
        }
      }
    }

    .summary-empty {
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
  .summary-table {
    .table-header,
    .table-row {
      .col {
        padding: 0 10px;
        font-size: 12px;
      }
    }
  }
}
</style>