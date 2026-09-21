<template>
  <SectionCardGeneric
    :title="$t('view.sale.invoiceDetail.materialItemsTitle')"
    icon="bi-gem"
    headerStyle="filled"
  >
    <div v-if="items.length === 0" class="empty-state">
      <i class="bi bi-inbox empty-icon"></i>
      <span class="empty-text">{{ $t('view.sale.materialSale.noItems') }}</span>
    </div>

    <BaseDataTable
      v-else
      :items="items"
      :totalRecords="items.length"
      :columns="columns"
      :paginator="false"
      scrollHeight="420px"
      dataKey="gemCode"
    >
      <template #noTemplate="{ index }">
        <div>{{ index + 1 }}</div>
      </template>

      <template #gemCodeTemplate="{ data }">
        <div>{{ data.stockNumber || data.gemCode }}</div>
      </template>

      <template #descriptionTemplate="{ data }">
        <div>{{ data.description || data.productNameEN }}</div>
      </template>

      <template #qtyPieceTemplate="{ data }">
        <div class="text-right">{{ formatInt(data.qtyPiece) }}</div>
      </template>

      <template #qtyWeightTemplate="{ data }">
        <div class="text-right">{{ formatNumber(data.qtyWeight) }}</div>
      </template>

      <template #priceInclVatTemplate="{ data }">
        <div class="text-right">{{ formatNumber(data.priceInclVat) }}</div>
      </template>

      <template #appraisalPriceTemplate="{ data }">
        <div class="text-right">{{ formatNumber(data.appraisalPrice) }}</div>
      </template>

      <template #amountTemplate="{ data }">
        <div class="text-right">{{ formatDocMoney(lineAmount(data, 1, 'THB')) }}</div>
      </template>
    </BaseDataTable>
  </SectionCardGeneric>
</template>

<script>
// External dependencies
import { formatNumber } from '@/services/utils/decimal.js'
import { lineAmount, formatDocumentMoney } from '@/services/utils/money.js'

// Local components
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

export default {
  name: 'MaterialInvoiceItemsTable',

  components: {
    SectionCardGeneric,
    BaseDataTable
  },

  props: {
    items: {
      type: Array,
      default: () => []
    }
  },

  computed: {
    columns() {
      return [
        { field: 'no', header: '#', width: '50px', sortable: false },
        { field: 'gemCode', header: this.$t('view.sale.invoiceDetail.materialColCode'), minWidth: '120px', sortable: false },
        { field: 'description', header: this.$t('view.sale.invoiceDetail.materialColDescription'), minWidth: '220px', sortable: false },
        { field: 'qtyPiece', header: this.$t('view.sale.invoiceDetail.materialColQtyPiece'), minWidth: '110px', align: 'right', sortable: false },
        { field: 'qtyWeight', header: this.$t('view.sale.invoiceDetail.materialColQtyWeight'), minWidth: '130px', align: 'right', sortable: false },
        { field: 'priceInclVat', header: this.$t('view.sale.invoiceDetail.materialColPriceInclVat'), minWidth: '130px', align: 'right', sortable: false },
        { field: 'appraisalPrice', header: this.$t('view.sale.invoiceDetail.materialColPriceExclVat'), minWidth: '130px', align: 'right', sortable: false },
        { field: 'amount', header: this.$t('view.sale.invoiceDetail.materialColAmount'), minWidth: '130px', align: 'right', sortable: false }
      ]
    }
  },

  methods: {
    lineAmount,

    formatDocMoney(value) {
      return formatDocumentMoney(value)
    },

    formatNumber(val) {
      return formatNumber(val, 2)
    },

    formatInt(val) {
      return formatNumber(val, 0)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--sp-2xl) var(--sp-lg);
  gap: var(--sp-sm);
}

.empty-icon {
  font-size: 2.5rem;
  color: var(--base-green);
  opacity: 0.5;
}

.empty-text {
  color: var(--base-font-color);
  opacity: 0.6;
  font-size: var(--fs-base);
}
</style>
