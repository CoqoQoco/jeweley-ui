<template>
  <div class="mb-4 stock-alert-panel">
    <SectionCardGeneric
      :title="$t('view.stock.gem.dashboard.stockAlert.title')"
      icon="bi-exclamation-triangle"
      accent="main"
      headerStyle="legend"
    >
      <div class="panel-toolbar">
        <ButtonGeneric
          variant="green"
          icon="bi-arrow-right-circle"
          :label="$t('view.stock.gem.dashboard.stockAlert.viewAll')"
          @click="onViewAll"
        />
      </div>

      <div class="alert-stat-grid">
        <StatCardGeneric
          icon="bi-slash-circle"
          :value="formatNumber(outCount)"
          :label="$t('view.stock.gem.dashboard.stockAlert.outLabel')"
          variant="grey"
        />
        <StatCardGeneric
          icon="bi-exclamation-triangle-fill"
          :value="formatNumber(criticalCount)"
          :label="$t('view.stock.gem.dashboard.stockAlert.criticalLabel')"
          variant="main"
        />
        <StatCardGeneric
          icon="bi-exclamation-circle"
          :value="formatNumber(lowCount)"
          :label="$t('view.stock.gem.dashboard.stockAlert.lowLabel')"
          variant="warning"
        />
      </div>

      <div v-if="sortedAlerts.length > 0">
        <BaseDataTable
          :items="pagedAlerts"
          :totalRecords="sortedAlerts.length"
          :columns="columns"
          :perPage="take"
          dataKey="code"
          scrollHeight="400px"
          @page="handlePageChange"
        >
          <template #groupNameTemplate="{ data }">
            <div class="gem-cell">
              <div class="gem-cell-main">{{ data.groupName }}</div>
              <small class="text-muted">{{ data.shape }} / {{ data.grade }}</small>
            </div>
          </template>

          <template #stockAlertLevelTemplate="{ data }">
            <span :class="['status-badge', alertBadgeClass(data.stockAlertLevel)]">
              {{ alertLabel(data.stockAlertLevel) }}
            </span>
          </template>
        </BaseDataTable>
      </div>
      <div v-else class="alert-empty">
        <i class="bi bi-check-circle"></i>
        <p>{{ $t('view.stock.gem.dashboard.stockAlert.noAlerts') }}</p>
      </div>
    </SectionCardGeneric>
  </div>
</template>

<script>
import { useGemMovementAnalysisApiStore } from '@/stores/modules/api/stock/gem-movement-analysis-api.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import StatCardGeneric from '@/components/generic/StatCardGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

const ALERT_MAP = {
  OUT: { i18nKey: 'out', badgeClass: 'status-badge--red' },
  CRITICAL: { i18nKey: 'critical', badgeClass: 'status-badge--red' },
  LOW: { i18nKey: 'low', badgeClass: 'status-badge--warning' }
}

export default {
  name: 'StockAlertPanel',

  components: {
    SectionCardGeneric,
    ButtonGeneric,
    StatCardGeneric,
    BaseDataTable
  },

  setup() {
    const gemMovementAnalysisStore = useGemMovementAnalysisApiStore()
    return { gemMovementAnalysisStore }
  },

  props: {
    formValue: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    return {
      skip: 0,
      take: 10
    }
  },

  computed: {
    alerts() {
      return this.gemMovementAnalysisStore.stockAlerts.data || []
    },

    outCount() {
      return this.alerts.filter((item) => item.stockAlertLevel === 'OUT').length
    },

    criticalCount() {
      return this.alerts.filter((item) => item.stockAlertLevel === 'CRITICAL').length
    },

    lowCount() {
      return this.alerts.filter((item) => item.stockAlertLevel === 'LOW').length
    },

    sortedAlerts() {
      return [...this.alerts].sort((a, b) => {
        const aOut = a.stockAlertLevel === 'OUT' ? 0 : 1
        const bOut = b.stockAlertLevel === 'OUT' ? 0 : 1
        if (aOut !== bOut) return aOut - bOut

        const aDays = a.daysOfSupply ?? Infinity
        const bDays = b.daysOfSupply ?? Infinity
        return aDays - bDays
      })
    },

    pagedAlerts() {
      return this.sortedAlerts.slice(this.skip, this.skip + this.take)
    },

    columns() {
      return [
        { field: 'code', header: this.$t('common.field.code'), sortable: false, minWidth: '110px' },
        {
          field: 'groupName',
          header: this.$t('view.stock.gemMovementAnalysis.colCategory'),
          sortable: false,
          minWidth: '170px'
        },
        {
          field: 'quantity',
          header: this.$t('view.stock.gemMovementAnalysis.colQuantity'),
          sortable: false,
          minWidth: '100px',
          align: 'right',
          format: 'decimal2'
        },
        {
          field: 'avgDailyConsumption',
          header: this.$t('view.stock.gemMovementAnalysis.colAvgDaily'),
          sortable: false,
          minWidth: '110px',
          align: 'right',
          format: 'decimal2'
        },
        {
          field: 'daysOfSupply',
          header: this.$t('view.stock.gemMovementAnalysis.colDaysOfSupply'),
          sortable: false,
          minWidth: '100px',
          align: 'right',
          format: 'number'
        },
        {
          field: 'lastMovementDate',
          header: this.$t('view.stock.gemOnhandReport.colLastMovementDate'),
          sortable: false,
          minWidth: '120px',
          format: 'date'
        },
        {
          field: 'stockAlertLevel',
          header: this.$t('view.stock.gem.dashboard.stockAlert.colLevel'),
          sortable: false,
          minWidth: '100px',
          align: 'center'
        }
      ]
    }
  },

  watch: {
    formValue: {
      handler() {
        this.skip = 0
        this.fetchAlerts()
      },
      deep: true
    }
  },

  mounted() {
    this.fetchAlerts()
  },

  methods: {
    fetchAlerts() {
      this.gemMovementAnalysisStore.fetchStockAlerts({ formValue: this.formValue })
    },

    handlePageChange(e) {
      this.skip = e.first
      this.take = e.rows
    },

    onViewAll() {
      this.$router.push({ name: 'stock-gem-movement-analysis' })
    },

    alertLabel(level) {
      const meta = ALERT_MAP[level]
      return meta ? this.$t(`view.stock.gemMovementAnalysis.alertLevel.${meta.i18nKey}`) : level || '-'
    },

    alertBadgeClass(level) {
      const meta = ALERT_MAP[level]
      return meta ? meta.badgeClass : 'status-badge--grey'
    },

    formatNumber(value) {
      if (!value && value !== 0) return '0'
      return new Intl.NumberFormat('th-TH').format(value)
    }
  }
}
</script>

<style lang="scss" scoped>
.stock-alert-panel {
  .panel-toolbar {
    display: flex;
    justify-content: flex-end;
    margin-bottom: var(--sp-md);
  }

  .alert-stat-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--sp-lg);
    margin-bottom: var(--sp-lg);

    @media (max-width: 1024px) {
      grid-template-columns: 1fr;
    }
  }

  .gem-cell-main {
    font-weight: 600;
    color: var(--base-font-color);
  }

  .status-badge {
    display: inline-block;
    padding: var(--sp-xs) var(--sp-sm);
    border-radius: var(--radius-sm);
    font-size: var(--fs-sm);
    font-weight: 600;
    color: var(--on-inverse);

    &--warning {
      background: var(--base-warning);
    }

    &--red {
      background: var(--base-red);
    }

    &--grey {
      background: var(--base-sub-color);
    }
  }

  .alert-empty {
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
