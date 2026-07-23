<template>
  <SectionCardGeneric
    :title="$t('view.stock.stockBalanceSummary.tableTitle')"
    icon="bi-table"
    accent="main"
    headerStyle="legend"
  >
    <BaseDataTable
      :items="stockBalanceStore.byLocation"
      :totalRecords="stockBalanceStore.byLocation.length"
      :columns="columns"
      :paginator="false"
      dataKey="locationCode"
    />
  </SectionCardGeneric>
</template>

<script>
import { useStockBalanceApiStore } from '@/stores/modules/api/stock/stock-balance-api.js'

import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'

export default {
  name: 'StockBalanceSummaryTableView',

  components: {
    BaseDataTable,
    SectionCardGeneric
  },

  setup() {
    const stockBalanceStore = useStockBalanceApiStore()
    return { stockBalanceStore }
  },

  computed: {
    columns() {
      return [
        {
          field: 'locationCode',
          header: this.$t('view.stock.stockBalanceSummary.colLocationCode'),
          sortable: false,
          minWidth: '120px'
        },
        {
          field: 'locationName',
          header: this.$t('view.stock.stockBalanceSummary.colLocationName'),
          sortable: false,
          minWidth: '160px'
        },
        {
          field: 'skuCount',
          header: this.$t('view.stock.stockBalanceSummary.colSkuCount'),
          sortable: false,
          minWidth: '120px',
          align: 'right',
          format: 'number'
        },
        {
          field: 'totalOnHand',
          header: this.$t('view.stock.stockBalanceSummary.colTotalOnHand'),
          sortable: false,
          minWidth: '130px',
          align: 'right',
          format: 'decimal2'
        },
        {
          field: 'totalReserved',
          header: this.$t('view.stock.stockBalanceSummary.colTotalReserved'),
          sortable: false,
          minWidth: '110px',
          align: 'right',
          format: 'decimal2'
        },
        {
          field: 'totalAvailable',
          header: this.$t('view.stock.stockBalanceSummary.colTotalAvailable'),
          sortable: false,
          minWidth: '130px',
          align: 'right',
          format: 'decimal2'
        }
      ]
    }
  }
}
</script>
