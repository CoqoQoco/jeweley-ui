<template>
  <div class="price-alerts-panel">
    <SectionCardGeneric
      :title="$t('view.stock.gem.dashboard.priceAlerts')"
      icon="bi-currency-exchange"
      accent="main"
      headerStyle="legend"
    >
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
    </SectionCardGeneric>
  </div>
</template>

<script>
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'

export default {
  name: 'PriceAlertsPanel',

  components: {
    SectionCardGeneric
  },

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
.price-alerts-panel {
  .trend-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--sp-lg) 0;
    border-bottom: 1px solid var(--color-border);

    &:last-child {
      border-bottom: none;
    }

    .trend-info {
      flex: 1;

      h6 {
        color: var(--base-font-color);
        font-weight: 600;
        margin: 0 0 var(--sp-xs) 0;
        font-size: var(--fs-base);
      }

      small {
        color: var(--base-sub-color);
        font-size: var(--fs-sm);
      }

      .trend-stats {
        margin-top: var(--sp-sm);
        display: flex;
        align-items: center;
        font-size: var(--fs-sm);

        .price-old {
          color: var(--base-sub-color);
          text-decoration: line-through;
        }

        .price-new {
          color: var(--base-font-color);
          font-weight: 600;
        }

        i {
          color: var(--base-sub-color);
        }
      }
    }

    .trend-direction {
      .percentage-badge {
        padding: var(--sp-xs) var(--sp-sm);
        border-radius: var(--radius-lg);
        font-size: var(--fs-sm);
        font-weight: 600;
        text-transform: uppercase;

        &.increase {
          background: var(--color-green-bg);
          color: var(--base-green);
        }

        &.decrease {
          background: var(--status-cancelled-bg);
          color: var(--base-red);
        }

        &.stable {
          background: var(--status-closed-bg);
          color: var(--base-sub-color);
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
    color: var(--base-sub-color);

    i {
      font-size: 48px;
      margin-bottom: var(--sp-lg);
    }
  }
}
</style>
