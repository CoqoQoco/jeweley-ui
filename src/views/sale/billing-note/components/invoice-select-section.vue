<template>
  <SectionCardGeneric
    :title="$t('view.sale.billingNote.step2Title')"
    icon="bi-receipt"
    accent="main"
    headerStyle="legend"
  >
    <div v-if="!readonly" class="section-toolbar mb-2">
      <span v-if="invoices.length > 0" class="count-badge">
        {{ selectedInvoices.length }}/{{ invoices.length }}
      </span>
      <ButtonGeneric
        variant="green"
        icon="bi-cloud-download"
        :label="$t('view.sale.billingNote.fetchInvoices')"
        :disabled="disabled"
        @click="$emit('fetch')"
      />
    </div>

    <div v-if="hasFetched && invoices.length === 0" class="empty-state">
      <i class="bi bi-inbox empty-icon"></i>
      <span class="empty-text">{{ $t('view.sale.billingNote.noAvailableInvoices') }}</span>
    </div>

    <BaseDataTable
      v-else-if="invoices.length > 0"
      :items="invoices"
      :totalRecords="invoices.length"
      :columns="columns"
      :paginator="false"
      scrollHeight="320px"
      dataKey="invoiceRunning"
      :selectionMode="!readonly"
      selectionType="multiple"
      :itemsSelection="selectedInvoices"
      @update:itemsSelection="$emit('update:selectedInvoices', $event)"
    >
      <template #invoiceDateTemplate="{ data }">
        <div>{{ formatDate(data.invoiceDate) }}</div>
      </template>

      <template #subTotalTemplate="{ data }">
        <div class="text-right">{{ formatNumber(data.subTotal) }}</div>
      </template>
    </BaseDataTable>
  </SectionCardGeneric>
</template>

<script>
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import { formatDate } from '@/services/utils/dayjs.js'
import { formatNumber } from '@/services/utils/decimal.js'

export default {
  name: 'BillingNoteInvoiceSelectSection',

  components: {
    SectionCardGeneric,
    ButtonGeneric,
    BaseDataTable
  },

  props: {
    invoices: { type: Array, default: () => [] },
    selectedInvoices: { type: Array, default: () => [] },
    disabled: { type: Boolean, default: false },
    hasFetched: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false }
  },

  emits: ['fetch', 'update:selectedInvoices'],

  computed: {
    columns() {
      return [
        { field: 'invoiceRunning', header: this.$t('view.sale.billingNote.invoiceRunning'), minWidth: '150px', sortable: false },
        { field: 'invoiceDate', header: this.$t('view.sale.billingNote.invoiceDate'), minWidth: '120px', sortable: false, template: 'invoiceDateTemplate' },
        { field: 'customerName', header: this.$t('view.sale.billingNote.customerName'), minWidth: '180px', sortable: false },
        { field: 'subTotal', header: this.$t('view.sale.billingNote.subTotal'), minWidth: '130px', sortable: false, template: 'subTotalTemplate' }
      ]
    }
  },

  methods: {
    formatDate(val) {
      return val ? formatDate(val) : ''
    },

    formatNumber(val) {
      return formatNumber(val, 2)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.section-toolbar {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
}

.count-badge {
  display: inline-block;
  background: var(--base-font-color);
  color: #ffffff;
  border-radius: var(--radius-sm);
  padding: 1px var(--sp-sm);
  font-size: var(--fs-sm);
  font-weight: 600;
}

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
