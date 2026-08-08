<template>
  <div class="mb-4 monthly-top-performers-table">
    <SectionCardGeneric
      :title="$t('view.stock.gem.dashboard.monthlyReport.topPerformers.title')"
      icon="bi-trophy"
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
        :emptyMessage="$t('view.stock.gem.dashboard.monthlyReport.topPerformers.noData')"
        scrollHeight="420px"
      >
        <template #groupNameTemplate="{ data }">
          <div class="gem-cell">
            <div class="gem-cell-main">{{ data.groupName }}</div>
            <small class="text-muted">{{ data.shape }} / {{ data.grade }}</small>
          </div>
        </template>

        <template #performanceTypeTemplate="{ data }">
          <span :class="['status-badge', performanceBadgeClass(data.performanceType)]">
            {{ performanceLabel(data.performanceType) }}
          </span>
        </template>
      </DataTableWithPaging>
    </SectionCardGeneric>
  </div>
</template>

<script>
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import DataTableWithPaging from '@/components/prime-vue/DataTableWithPaging.vue'

const PERFORMANCE_TYPE_MAP = {
  HIGHEST_VOLUME: { i18nKey: 'highestVolume', badgeClass: 'status-badge--main' },
  HIGHEST_VALUE: { i18nKey: 'highestValue', badgeClass: 'status-badge--green' },
  MOST_ACTIVE: { i18nKey: 'mostActive', badgeClass: 'status-badge--warning' },
  FASTEST_MOVING: { i18nKey: 'fastestMoving', badgeClass: 'status-badge--grey' }
}

export default {
  name: 'MonthlyTopPerformersTable',

  components: {
    SectionCardGeneric,
    DataTableWithPaging
  },

  props: {
    topPerformers: {
      type: Array,
      default: () => []
    }
  },

  computed: {
    tableItems() {
      return (this.topPerformers || []).map((item, index) => ({
        ...item,
        rowId: `${item.performanceType || 'item'}-${item.ranking ?? index}-${index}`
      }))
    },

    columns() {
      return [
        { field: 'ranking', header: '#', minWidth: '50px', align: 'center', sortable: false },
        {
          field: 'code',
          header: this.$t('view.stock.gem.dashboard.gemCode'),
          minWidth: '110px',
          sortable: false
        },
        {
          field: 'groupName',
          header: this.$t('view.stock.gem.dashboard.category'),
          minWidth: '160px',
          sortable: false
        },
        {
          field: 'performanceType',
          header: this.$t('view.stock.gem.dashboard.monthlyReport.topPerformers.performanceType'),
          minWidth: '140px',
          align: 'center',
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
          field: 'totalQuantityMoved',
          header: this.$t('view.stock.gem.dashboard.quantity'),
          minWidth: '110px',
          align: 'right',
          format: 'number',
          sortable: false
        },
        {
          field: 'totalQuantityWeightMoved',
          header: this.$t('view.stock.gem.dashboard.weight'),
          minWidth: '110px',
          align: 'right',
          format: 'decimal3',
          sortable: false
        }
      ]
    }
  },

  methods: {
    performanceLabel(type) {
      const meta = PERFORMANCE_TYPE_MAP[type]
      return meta
        ? this.$t(`view.stock.gem.dashboard.monthlyReport.topPerformers.type.${meta.i18nKey}`)
        : type || '-'
    },

    performanceBadgeClass(type) {
      const meta = PERFORMANCE_TYPE_MAP[type]
      return meta ? meta.badgeClass : 'status-badge--grey'
    }
  }
}
</script>

<style lang="scss" scoped>
.monthly-top-performers-table {
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

    &--main {
      background: var(--base-font-color);
    }

    &--green {
      background: var(--base-green);
    }

    &--warning {
      background: var(--base-warning);
    }

    &--grey {
      background: var(--base-sub-color);
    }
  }
}
</style>
