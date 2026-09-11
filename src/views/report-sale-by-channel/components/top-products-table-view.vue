<template>
  <SectionCardGeneric :title="$t('view.report.saleByChannel.topProductsTitle')" icon="bi-trophy" accent="main" headerStyle="legend">
    <BaseDataTable :items="report.topProducts" :columns="columns" :paginator="false" dataKey="productCode">
      <template #rankTemplate="{ index }">
        {{ index + 1 }}
      </template>
    </BaseDataTable>
  </SectionCardGeneric>
</template>

<script>
import { useSaleReportByChannelApiStore } from '@/stores/modules/api/sale/sale-report-by-channel-store.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

export default {
  name: 'ReportSaleByChannelTopProductsTableView',

  components: {
    SectionCardGeneric,
    BaseDataTable
  },

  setup() {
    const saleReportByChannelStore = useSaleReportByChannelApiStore()
    return { saleReportByChannelStore }
  },

  computed: {
    report() {
      return this.saleReportByChannelStore.report
    },

    columns() {
      return [
        { field: 'rank', header: this.$t('view.report.saleByChannel.colRank'), sortable: false, width: '60px' },
        { field: 'productCode', header: this.$t('view.report.saleByChannel.colProductCode'), sortable: false, minWidth: '140px' },
        { field: 'pieceCount', header: this.$t('view.report.saleByChannel.colPieceCount'), sortable: false, minWidth: '100px', align: 'right' }
      ]
    }
  }
}
</script>
