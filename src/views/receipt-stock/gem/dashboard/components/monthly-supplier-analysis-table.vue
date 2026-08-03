<template>
  <div class="mb-4 monthly-supplier-analysis-table">
    <SectionCardGeneric
      :title="$t('view.stock.gem.dashboard.monthlyReport.supplierAnalysis.title')"
      icon="bi-truck"
      accent="main"
      headerStyle="legend"
    >
      <DataTableWithPaging
        :items="tableItems"
        :columns="columns"
        :totalRecords="tableItems.length"
        :paginator="false"
        :showGridlines="true"
        dataKey="rowId"
        scrollHeight="420px"
      >
        <template #gemTypesTemplate="{ data }">
          <span>{{ (data.gemTypes || []).join(', ') || '-' }}</span>
        </template>

        <template #reliabilityRatingTemplate="{ data }">
          <span :class="['status-badge', ratingBadgeClass(data.reliabilityRating)]">
            {{ ratingLabel(data.reliabilityRating) }}
          </span>
        </template>

        <template #empty>
          <div class="supplier-empty-state">
            <i class="bi bi-inbox"></i>
            <p>{{ $t('view.stock.gem.dashboard.monthlyReport.supplierAnalysis.noData') }}</p>
            <small>{{ $t('view.stock.gem.dashboard.monthlyReport.supplierAnalysis.noDataScope') }}</small>
          </div>
        </template>
      </DataTableWithPaging>
    </SectionCardGeneric>
  </div>
</template>

<script>
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import DataTableWithPaging from '@/components/prime-vue/DataTableWithPaging.vue'

const RATING_MAP = {
  EXCELLENT: { i18nKey: 'excellent', badgeClass: 'status-badge--green' },
  GOOD: { i18nKey: 'good', badgeClass: 'status-badge--main' },
  AVERAGE: { i18nKey: 'average', badgeClass: 'status-badge--warning' },
  POOR: { i18nKey: 'poor', badgeClass: 'status-badge--red' }
}

export default {
  name: 'MonthlySupplierAnalysisTable',

  components: {
    SectionCardGeneric,
    DataTableWithPaging
  },

  props: {
    supplierAnalysis: {
      type: Array,
      default: () => []
    }
  },

  computed: {
    tableItems() {
      return (this.supplierAnalysis || []).map((item, index) => ({
        ...item,
        rowId: `${item.supplierName || 'supplier'}-${index}`
      }))
    },

    columns() {
      return [
        {
          field: 'supplierName',
          header: this.$t('view.stock.gem.dashboard.monthlyReport.supplierAnalysis.supplierName'),
          minWidth: '160px',
          sortable: false
        },
        {
          field: 'transactionCount',
          header: this.$t('view.stock.gem.dashboard.transactions'),
          minWidth: '100px',
          align: 'right',
          format: 'number',
          sortable: false
        },
        {
          field: 'totalQuantity',
          header: this.$t('view.stock.gem.dashboard.quantity'),
          minWidth: '110px',
          align: 'right',
          format: 'number',
          sortable: false
        },
        {
          field: 'totalQuantityWeight',
          header: this.$t('view.stock.gem.dashboard.weight'),
          minWidth: '110px',
          align: 'right',
          format: 'decimal3',
          sortable: false
        },
        {
          field: 'totalCost',
          header: this.$t('view.stock.gem.dashboard.monthlyReport.supplierAnalysis.totalCost'),
          minWidth: '120px',
          align: 'right',
          format: 'decimal2',
          sortable: false
        },
        {
          field: 'averageCostPerUnit',
          header: this.$t('view.stock.gem.dashboard.monthlyReport.supplierAnalysis.averageCostPerUnit'),
          minWidth: '140px',
          align: 'right',
          format: 'decimal2',
          sortable: false
        },
        {
          field: 'gemTypes',
          header: this.$t('view.stock.gem.dashboard.monthlyReport.supplierAnalysis.gemTypes'),
          minWidth: '160px',
          sortable: false
        },
        {
          field: 'deliveryCount',
          header: this.$t('view.stock.gem.dashboard.monthlyReport.supplierAnalysis.deliveryCount'),
          minWidth: '110px',
          align: 'right',
          format: 'number',
          sortable: false
        },
        {
          field: 'reliabilityRating',
          header: this.$t('view.stock.gem.dashboard.monthlyReport.supplierAnalysis.reliabilityRating'),
          minWidth: '130px',
          align: 'center',
          sortable: false
        }
      ]
    }
  },

  methods: {
    ratingLabel(rating) {
      const meta = RATING_MAP[rating]
      return meta
        ? this.$t(`view.stock.gem.dashboard.monthlyReport.supplierAnalysis.rating.${meta.i18nKey}`)
        : rating || '-'
    },

    ratingBadgeClass(rating) {
      const meta = RATING_MAP[rating]
      return meta ? meta.badgeClass : 'status-badge--grey'
    }
  }
}
</script>

<style lang="scss" scoped>
.monthly-supplier-analysis-table {
  .status-badge {
    display: inline-block;
    padding: var(--sp-xs) var(--sp-sm);
    border-radius: var(--radius-sm);
    font-size: var(--fs-sm);
    font-weight: 600;
    color: var(--on-inverse);

    &--main {
      background: var(--base-font-color);
    }

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

  .supplier-empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--sp-2xl) 0;
    color: var(--base-sub-color);
    text-align: center;
    gap: var(--sp-xs);

    i {
      font-size: var(--fs-xl);
      margin-bottom: var(--sp-xs);
    }

    small {
      font-size: var(--fs-sm);
      max-width: 420px;
    }
  }
}
</style>
