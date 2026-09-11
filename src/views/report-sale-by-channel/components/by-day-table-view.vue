<template>
  <SectionCardGeneric :title="$t('view.report.saleByChannel.byDayTitle')" icon="bi-calendar3" accent="main" headerStyle="legend">
    <BaseDataTable :items="report.byDay" :columns="columns" :paginator="false" dataKey="date">
      <template #dateTemplate="{ data }">
        {{ formatDate(data.date) }}
      </template>

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
import { formatDate } from '@/services/utils/dayjs.js'
import { formatDocCurrency } from '@/services/utils/decimal.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

export default {
  name: 'ReportSaleByChannelByDayTableView',

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
        { field: 'date', header: this.$t('view.report.saleByChannel.colDate'), sortable: false, minWidth: '120px' },
        { field: 'invoiceCount', header: this.$t('view.report.saleByChannel.colInvoiceCount'), sortable: false, minWidth: '100px', align: 'right' },
        { field: 'amounts', header: this.$t('view.report.saleByChannel.colAmount'), sortable: false, minWidth: '160px', align: 'right' }
      ]
    }
  },

  methods: {
    formatDate(value) {
      return formatDate(value)
    },
    formatAmount(value, unit) {
      return formatDocCurrency(value, unit)
    }
  }
}
</script>
