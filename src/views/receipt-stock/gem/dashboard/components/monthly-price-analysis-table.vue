<template>
  <div class="mb-4 monthly-price-analysis-table">
    <SectionCardGeneric
      :title="$t('view.stock.gem.dashboard.monthlyReport.priceAnalysis.title')"
      icon="bi-graph-up"
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
        :emptyMessage="$t('view.stock.gem.dashboard.monthlyReport.priceAnalysis.noData')"
        scrollHeight="420px"
      >
        <template #groupNameTemplate="{ data }">
          <div class="gem-cell">
            <div class="gem-cell-main">{{ data.groupName }}</div>
            <small class="text-muted">{{ data.shape }} / {{ data.grade }}</small>
          </div>
        </template>

        <template #priceTrendTemplate="{ data }">
          <span :class="['status-badge', trendBadgeClass(data.priceTrend)]">
            {{ trendLabel(data.priceTrend) }}
          </span>
        </template>
      </DataTableWithPaging>
    </SectionCardGeneric>
  </div>
</template>

<script>
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import DataTableWithPaging from '@/components/prime-vue/DataTableWithPaging.vue'

const TREND_MAP = {
  INCREASING: { i18nKey: 'increasing', badgeClass: 'status-badge--red' },
  DECREASING: { i18nKey: 'decreasing', badgeClass: 'status-badge--green' },
  STABLE: { i18nKey: 'stable', badgeClass: 'status-badge--grey' },
  VOLATILE: { i18nKey: 'volatile', badgeClass: 'status-badge--warning' }
}

export default {
  name: 'MonthlyPriceAnalysisTable',

  components: {
    SectionCardGeneric,
    DataTableWithPaging
  },

  props: {
    priceAnalysis: {
      type: Array,
      default: () => []
    }
  },

  computed: {
    tableItems() {
      return (this.priceAnalysis || []).map((item, index) => ({
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
          field: 'priceChangeCount',
          header: this.$t('view.stock.gem.dashboard.monthlyReport.priceAnalysis.priceChangeCount'),
          minWidth: '110px',
          align: 'right',
          format: 'number',
          sortable: false
        },
        {
          field: 'averagePriceStart',
          header: this.$t('view.stock.gem.dashboard.monthlyReport.priceAnalysis.averagePriceStart'),
          minWidth: '130px',
          align: 'right',
          format: 'decimal2',
          sortable: false
        },
        {
          field: 'averagePriceEnd',
          header: this.$t('view.stock.gem.dashboard.monthlyReport.priceAnalysis.averagePriceEnd'),
          minWidth: '130px',
          align: 'right',
          format: 'decimal2',
          sortable: false
        },
        {
          field: 'priceVolatility',
          header: this.$t('view.stock.gem.dashboard.monthlyReport.priceAnalysis.priceVolatility'),
          minWidth: '120px',
          align: 'right',
          format: 'decimal2',
          sortable: false
        },
        {
          field: 'priceTrend',
          header: this.$t('view.stock.gem.dashboard.monthlyReport.priceAnalysis.priceTrend'),
          minWidth: '120px',
          align: 'center',
          sortable: false
        },
        {
          field: 'mostRecentPriceChange',
          header: this.$t(
            'view.stock.gem.dashboard.monthlyReport.priceAnalysis.mostRecentPriceChange'
          ),
          minWidth: '140px',
          align: 'center',
          format: 'date',
          sortable: false
        }
      ]
    }
  },

  methods: {
    trendLabel(trend) {
      const meta = TREND_MAP[trend]
      return meta
        ? this.$t(`view.stock.gem.dashboard.monthlyReport.priceAnalysis.trend.${meta.i18nKey}`)
        : trend || '-'
    },

    trendBadgeClass(trend) {
      const meta = TREND_MAP[trend]
      return meta ? meta.badgeClass : 'status-badge--grey'
    }
  }
}
</script>

<style lang="scss" scoped>
.monthly-price-analysis-table {
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
