<template>
  <SectionCardGeneric
    :title="$t('view.stock.materialValuationReport.tableTitle')"
    icon="bi-table"
    accent="main"
    headerStyle="legend"
  >
    <BaseDataTable
      :items="materialValuationStore.byType"
      :totalRecords="materialValuationStore.byType.length"
      :columns="columns"
      :paginator="false"
      dataKey="type"
    />
  </SectionCardGeneric>
</template>

<script>
import { useMaterialValuationReportApiStore } from '@/stores/modules/api/stock/material-valuation-report-api.js'

import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'

export default {
  name: 'MaterialValuationReportTableView',

  components: {
    BaseDataTable,
    SectionCardGeneric
  },

  setup() {
    const materialValuationStore = useMaterialValuationReportApiStore()
    return { materialValuationStore }
  },

  computed: {
    columns() {
      return [
        {
          field: 'type',
          header: this.$t('common.field.type'),
          sortable: false,
          minWidth: '150px'
        },
        {
          field: 'count',
          header: this.$t('view.stock.materialValuationReport.colCount'),
          sortable: false,
          minWidth: '130px',
          align: 'right',
          format: 'number'
        },
        {
          field: 'totalWeight',
          header: this.$t('view.stock.materialValuationReport.colTotalWeight'),
          sortable: false,
          minWidth: '150px',
          align: 'right',
          format: 'decimal2'
        },
        {
          field: 'totalValue',
          header: this.$t('view.stock.materialValuationReport.colTotalValue'),
          sortable: false,
          minWidth: '160px',
          align: 'right',
          format: 'decimal2'
        }
      ]
    }
  }
}
</script>
