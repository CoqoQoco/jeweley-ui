<template>
  <div class="mb-4 monthly-inventory-analysis-table">
    <SectionCardGeneric
      :title="$t('view.stock.gem.dashboard.monthlyReport.inventoryAnalysis.title')"
      icon="bi-boxes"
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
        :emptyMessage="$t('view.stock.gem.dashboard.monthlyReport.inventoryAnalysis.noData')"
        scrollHeight="420px"
      >
        <template #groupNameTemplate="{ data }">
          <div class="gem-cell">
            <div class="gem-cell-main">{{ data.groupName }}</div>
            <small class="text-muted">{{ data.shape }} / {{ data.grade }}</small>
          </div>
        </template>

        <template #inventoryStatusTemplate="{ data }">
          <span :class="['status-badge', statusBadgeClass(data.inventoryStatus)]">
            {{ statusLabel(data.inventoryStatus) }}
          </span>
        </template>
      </DataTableWithPaging>
    </SectionCardGeneric>
  </div>
</template>

<script>
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import DataTableWithPaging from '@/components/prime-vue/DataTableWithPaging.vue'

const STATUS_MAP = {
  OVERSTOCK: { i18nKey: 'overstock', badgeClass: 'status-badge--warning' },
  OPTIMAL: { i18nKey: 'optimal', badgeClass: 'status-badge--green' },
  UNDERSTOCK: { i18nKey: 'understock', badgeClass: 'status-badge--red' }
}

export default {
  name: 'MonthlyInventoryAnalysisTable',

  components: {
    SectionCardGeneric,
    DataTableWithPaging
  },

  props: {
    inventoryAnalysis: {
      type: Array,
      default: () => []
    }
  },

  computed: {
    tableItems() {
      return (this.inventoryAnalysis || []).map((item, index) => ({
        ...item,
        rowId: `${item.groupName || 'item'}-${item.shape || ''}-${item.grade || ''}-${index}`
      }))
    },

    columns() {
      return [
        {
          field: 'groupName',
          header: this.$t('view.stock.gem.dashboard.category'),
          minWidth: '160px',
          sortable: false
        },
        {
          field: 'itemCount',
          header: this.$t('view.stock.gem.dashboard.monthlyReport.inventoryAnalysis.itemCount'),
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
          field: 'averagePricePerUnit',
          header: this.$t(
            'view.stock.gem.dashboard.monthlyReport.inventoryAnalysis.averagePricePerUnit'
          ),
          minWidth: '130px',
          align: 'right',
          format: 'decimal2',
          sortable: false
        },
        {
          field: 'inventoryDays',
          header: this.$t('view.stock.gem.dashboard.monthlyReport.inventoryAnalysis.inventoryDays'),
          minWidth: '100px',
          align: 'right',
          format: 'number',
          sortable: false
        },
        {
          field: 'inventoryStatus',
          header: this.$t('view.stock.gem.dashboard.monthlyReport.inventoryAnalysis.inventoryStatus'),
          minWidth: '120px',
          align: 'center',
          sortable: false
        },
        {
          field: 'monthOverMonthChange',
          header: this.$t(
            'view.stock.gem.dashboard.monthlyReport.inventoryAnalysis.monthOverMonthChange'
          ),
          minWidth: '130px',
          align: 'right',
          format: 'decimal2',
          sortable: false
        }
      ]
    }
  },

  methods: {
    statusLabel(status) {
      const meta = STATUS_MAP[status]
      return meta
        ? this.$t(`view.stock.gem.dashboard.monthlyReport.inventoryAnalysis.status.${meta.i18nKey}`)
        : status || '-'
    },

    statusBadgeClass(status) {
      const meta = STATUS_MAP[status]
      return meta ? meta.badgeClass : 'status-badge--grey'
    }
  }
}
</script>

<style lang="scss" scoped>
.monthly-inventory-analysis-table {
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
}
</style>
