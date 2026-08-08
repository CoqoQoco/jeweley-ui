<template>
  <div class="mt-2">
    <BaseDataTable
      :items="gemMovementAnalysisStore.dataSearch.data"
      :totalRecords="gemMovementAnalysisStore.dataSearch.total"
      :columns="columns"
      :perPage="take"
      dataKey="code"
      @page="handlePageChange"
      @sort="handleSortChange"
    >
      <template #groupNameTemplate="{ data }">
        <div class="gem-cell">
          <div class="gem-cell-main">{{ data.groupName }}</div>
          <small class="text-muted">{{ data.shape }} / {{ data.grade }}</small>
        </div>
      </template>

      <template #quantityInTemplate="{ data }">
        <div class="qty-cell">
          <div class="qty-cell-main">{{ formatNumber(data.quantityIn) }}</div>
          <small class="text-muted">{{ formatDecimal(data.quantityWeightIn) }} ct</small>
        </div>
      </template>

      <template #quantityOutTemplate="{ data }">
        <div class="qty-cell">
          <div class="qty-cell-main">{{ formatNumber(data.quantityOut) }}</div>
          <small class="text-muted">{{ formatDecimal(data.quantityWeightOut) }} ct</small>
        </div>
      </template>

      <template #movementStatusTemplate="{ data }">
        <div class="status-cell">
          <span :class="['status-badge', statusBadgeClass(data.movementStatus)]">
            {{ statusLabel(data.movementStatus) }}
          </span>
          <span
            v-if="data.stockAlertLevel && data.stockAlertLevel !== 'OK'"
            :class="['status-badge', alertBadgeClass(data.stockAlertLevel)]"
          >
            {{ alertLabel(data.stockAlertLevel) }}
          </span>
        </div>
      </template>

      <template #footer>
        <div>
          {{ $t('view.stock.gemMovementAnalysis.totalRecords', { total: gemMovementAnalysisStore.dataSearch.total }) }}
        </div>
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import dataTablePaging from '@/composables/useDataTablePaging.js'

import { useGemMovementAnalysisApiStore } from '@/stores/modules/api/stock/gem-movement-analysis-api.js'

const STATUS_MAP = {
  FAST: { i18nKey: 'fast', badgeClass: 'status-badge--green' },
  SLOW: { i18nKey: 'slow', badgeClass: 'status-badge--warning' },
  DEAD: { i18nKey: 'dead', badgeClass: 'status-badge--grey' }
}

const ALERT_MAP = {
  OUT: { i18nKey: 'out', badgeClass: 'status-badge--red' },
  CRITICAL: { i18nKey: 'critical', badgeClass: 'status-badge--red' },
  LOW: { i18nKey: 'low', badgeClass: 'status-badge--warning' },
  OK: { i18nKey: 'ok', badgeClass: 'status-badge--green' }
}

export default {
  name: 'GemMovementAnalysisDataTableView',

  mixins: [dataTablePaging],

  components: {
    BaseDataTable
  },

  setup() {
    const gemMovementAnalysisStore = useGemMovementAnalysisApiStore()
    return { gemMovementAnalysisStore }
  },

  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    },
    modelFormExport: {
      type: Object,
      default: () => null
    }
  },

  computed: {
    columns() {
      return [
        { field: 'code', header: this.$t('common.field.code'), sortable: true, minWidth: '110px' },
        {
          field: 'groupName',
          header: this.$t('view.stock.gemMovementAnalysis.colCategory'),
          sortable: true,
          minWidth: '170px'
        },
        {
          field: 'quantity',
          header: this.$t('view.stock.gemMovementAnalysis.colQuantity'),
          sortable: true,
          minWidth: '100px',
          align: 'right',
          format: 'decimal2'
        },
        {
          field: 'quantityWeight',
          header: this.$t('view.stock.gemMovementAnalysis.colQuantityWeight'),
          sortable: true,
          minWidth: '100px',
          align: 'right',
          format: 'decimal2'
        },
        {
          field: 'transactionCount',
          header: this.$t('view.stock.gemMovementAnalysis.colTransactionCount'),
          sortable: true,
          minWidth: '80px',
          align: 'right',
          format: 'number'
        },
        {
          field: 'quantityIn',
          header: this.$t('view.stock.gemMovementAnalysis.colIn'),
          sortable: true,
          minWidth: '110px',
          align: 'right'
        },
        {
          field: 'quantityOut',
          header: this.$t('view.stock.gemMovementAnalysis.colOut'),
          sortable: true,
          minWidth: '110px',
          align: 'right'
        },
        {
          field: 'avgDailyConsumption',
          header: this.$t('view.stock.gemMovementAnalysis.colAvgDaily'),
          sortable: true,
          minWidth: '100px',
          align: 'right',
          format: 'decimal2'
        },
        {
          field: 'daysOfSupply',
          header: this.$t('view.stock.gemMovementAnalysis.colDaysOfSupply'),
          sortable: true,
          minWidth: '100px',
          align: 'right',
          format: 'number'
        },
        {
          field: 'lastMovementDate',
          header: this.$t('view.stock.gemMovementAnalysis.colLastMovement'),
          sortable: true,
          minWidth: '110px',
          format: 'date'
        },
        {
          field: 'daysSinceLastMovement',
          header: this.$t('view.stock.gemMovementAnalysis.colDaysSinceLastMovement'),
          sortable: true,
          minWidth: '100px',
          align: 'right',
          format: 'number'
        },
        {
          field: 'movementStatus',
          header: this.$t('common.field.status'),
          sortable: true,
          minWidth: '150px',
          align: 'center'
        }
      ]
    }
  },

  watch: {
    modelForm() {
      this.resetPaging()
    },
    async modelFormExport(val) {
      if (!val) return
      await this.gemMovementAnalysisStore.fetchReportExport({
        sort: this.sort,
        formValue: this.modelForm
      })
    }
  },

  methods: {
    async fetchData() {
      await this.gemMovementAnalysisStore.fetchReport({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        formValue: this.modelForm
      })
    },

    formatNumber(value) {
      if (!value && value !== 0) return '0'
      return new Intl.NumberFormat('th-TH').format(value)
    },

    formatDecimal(value) {
      if (!value && value !== 0) return '0.00'
      return new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value)
    },

    statusLabel(status) {
      const meta = STATUS_MAP[status]
      return meta ? this.$t(`view.stock.gemMovementAnalysis.statusType.${meta.i18nKey}`) : status || '-'
    },

    statusBadgeClass(status) {
      const meta = STATUS_MAP[status]
      return meta ? meta.badgeClass : 'status-badge--grey'
    },

    alertLabel(level) {
      const meta = ALERT_MAP[level]
      return meta ? this.$t(`view.stock.gemMovementAnalysis.alertLevel.${meta.i18nKey}`) : level || '-'
    },

    alertBadgeClass(level) {
      const meta = ALERT_MAP[level]
      return meta ? meta.badgeClass : 'status-badge--grey'
    }
  },

  mounted() {
    this.fetchData()
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';

.gem-cell-main {
  font-weight: 600;
  color: var(--base-font-color);
}

.qty-cell {
  text-align: right;
}

.qty-cell-main {
  font-weight: 600;
}

.status-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-xs);
}

.status-badge {
  display: inline-block;
  padding: var(--sp-xs) var(--sp-sm);
  border-radius: var(--radius-sm);
  font-size: var(--fs-sm);
  font-weight: 600;
  color: var(--on-inverse);

  &--green {
    background: var(--base-green);
  }

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
</style>
