<template>
  <SectionCardGeneric :title="$t('view.report.saleByChannel.paymentMixTitle')" icon="bi-credit-card" accent="main" headerStyle="legend">
    <BaseDataTable :items="report.paymentMix" :columns="columns" :paginator="false" dataKey="payment">
      <template #paymentTemplate="{ data }">
        {{ paymentLabel(data.payment) }}
      </template>
    </BaseDataTable>
  </SectionCardGeneric>
</template>

<script>
import { useSaleReportByChannelApiStore } from '@/stores/modules/api/sale/sale-report-by-channel-store.js'
import { PAYMENT_METHODS } from '@/constants/payment-methods.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

export default {
  name: 'ReportSaleByChannelPaymentMixTableView',

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
        { field: 'payment', header: this.$t('view.report.saleByChannel.colPayment'), sortable: false, minWidth: '160px' },
        { field: 'invoiceCount', header: this.$t('view.report.saleByChannel.colInvoiceCount'), sortable: false, minWidth: '100px', align: 'right' }
      ]
    }
  },

  methods: {
    paymentLabel(code) {
      const found = PAYMENT_METHODS.find((item) => item.code === code)
      return found
        ? this.$t(`view.report.saleByChannel.${found.labelKey}`)
        : this.$t('view.report.saleByChannel.paymentUnspecified')
    }
  }
}
</script>
