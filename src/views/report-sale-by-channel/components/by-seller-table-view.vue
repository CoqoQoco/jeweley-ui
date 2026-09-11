<template>
  <SectionCardGeneric :title="$t('view.report.saleByChannel.bySellerTitle')" icon="bi-person-badge" accent="main" headerStyle="legend">
    <BaseDataTable :items="report.bySeller" :columns="columns" :paginator="false" dataKey="sellerUsername">
      <template #amountsTemplate="{ data }">
        <div v-for="item in data.amounts" :key="item.currencyUnit">
          {{ formatAmount(item.amount, item.currencyUnit) }} {{ item.currencyUnit }}
        </div>
      </template>
    </BaseDataTable>
  </SectionCardGeneric>
</template>

<script>
import { useSaleReportByChannelApiStore } from '@/stores/modules/api/sale/sale-report-by-channel-store.js'
import { formatDocCurrency } from '@/services/utils/decimal.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

export default {
  name: 'ReportSaleByChannelBySellerTableView',

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
        { field: 'sellerUsername', header: this.$t('view.report.saleByChannel.colSeller'), sortable: false, minWidth: '140px' },
        { field: 'invoiceCount', header: this.$t('view.report.saleByChannel.colInvoiceCount'), sortable: false, minWidth: '100px', align: 'right' },
        { field: 'amounts', header: this.$t('view.report.saleByChannel.colAmount'), sortable: false, minWidth: '160px', align: 'right' }
      ]
    }
  },

  methods: {
    formatAmount(value, unit) {
      return formatDocCurrency(value, unit)
    }
  }
}
</script>
