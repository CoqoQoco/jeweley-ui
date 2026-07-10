<template>
  <div class="app-container">
    <PageHeaderGeneric :title="$t('view.sale.billingNote.detailTitle')" backRoute="sale-billing-note">
      <template #actions>
        <ButtonGeneric
          variant="main"
          icon="bi-pencil"
          :label="$t('common.btn.edit')"
          @click="onEdit"
        />
        <ButtonGeneric
          variant="outline"
          icon="bi-printer"
          :label="$t('view.sale.billingNote.printMainDoc')"
          class="ml-2"
          @click="onPrintMain"
        />
        <ButtonGeneric
          variant="outline"
          icon="bi-list-columns"
          :label="$t('view.sale.billingNote.printByType')"
          class="ml-2"
          @click="onPrintByType"
        />
        <ButtonGeneric
          variant="outline"
          icon="bi-upc-scan"
          :label="$t('view.sale.billingNote.printByCode')"
          class="ml-2"
          @click="onPrintByCode"
        />
      </template>
    </PageHeaderGeneric>

    <template v-if="data">
      <SectionCardGeneric
        :title="$t('view.sale.billingNote.step1Title')"
        icon="bi-person-fill"
        accent="main"
        headerStyle="legend"
        class="mt-4"
      >
        <div class="form-row two-col">
          <FormFieldGeneric :label="$t('view.sale.billingNote.running')">
            <InputTextGeneric :modelValue="data.running" :readonly="true" bgInput="bg-input" />
          </FormFieldGeneric>
          <FormFieldGeneric :label="$t('view.sale.billingNote.documentDate')">
            <InputTextGeneric :modelValue="formatDate(data.documentDate)" :readonly="true" bgInput="bg-input" />
          </FormFieldGeneric>
          <FormFieldGeneric :label="$t('view.sale.billingNote.customerName')">
            <InputTextGeneric :modelValue="data.customerName" :readonly="true" bgInput="bg-input" />
          </FormFieldGeneric>
          <FormFieldGeneric :label="$t('view.sale.billingNote.customerAddress')">
            <InputTextGeneric :modelValue="data.customerAddress" :readonly="true" bgInput="bg-input" />
          </FormFieldGeneric>
        </div>
      </SectionCardGeneric>

      <SectionCardGeneric
        :title="$t('view.sale.billingNote.step2Title')"
        icon="bi-receipt"
        accent="main"
        headerStyle="legend"
        class="mt-4"
      >
        <BaseDataTable
          :items="data.items"
          :totalRecords="data.items.length"
          :columns="itemColumns"
          :paginator="false"
          scrollHeight="280px"
          dataKey="invoiceRunning"
        >
          <template #invoiceDateTemplate="{ data: row }">
            <div>{{ formatDate(row.invoiceDate) }}</div>
          </template>
          <template #amountBeforeVatTemplate="{ data: row }">
            <div class="text-right">{{ formatNumber(row.amountBeforeVat) }}</div>
          </template>
        </BaseDataTable>
      </SectionCardGeneric>

      <SectionCardGeneric
        :title="$t('view.sale.billingNote.step3Title')"
        icon="bi-box-seam"
        accent="main"
        headerStyle="legend"
        class="mt-4"
      >
        <BaseDataTable
          :items="data.products"
          :totalRecords="data.products.length"
          :columns="productColumns"
          :paginator="false"
          scrollHeight="320px"
          dataKey="productNumber"
        >
          <template #qtyTemplate="{ data: row }">
            <div class="text-right">{{ formatNumber(row.qty) }}</div>
          </template>
          <template #amountTemplate="{ data: row }">
            <div class="text-right">{{ formatNumber(row.amount) }}</div>
          </template>
        </BaseDataTable>
      </SectionCardGeneric>

      <typeSummarySection
        :products="data.products"
        :billCount="data.items.length"
        class="mt-4"
      />

      <SectionCardGeneric
        :title="$t('view.sale.billingNote.summaryTitle')"
        icon="bi-calculator"
        accent="main"
        headerStyle="legend"
        class="mt-4"
      >
        <div class="form-row three-col mb-3">
          <FormFieldGeneric :label="$t('view.sale.billingNote.goldResizeQty')">
            <InputTextGeneric :modelValue="data.goldResizeQty" :readonly="true" bgInput="bg-input" />
          </FormFieldGeneric>
          <FormFieldGeneric :label="$t('view.sale.billingNote.goldResizePerUnit')">
            <InputTextGeneric :modelValue="formatNumber(data.goldResizePerUnit)" :readonly="true" bgInput="bg-input" />
          </FormFieldGeneric>
          <FormFieldGeneric :label="$t('common.field.total')">
            <InputTextGeneric :modelValue="formatNumber(data.goldResizeAmount)" :readonly="true" bgInput="bg-input" />
          </FormFieldGeneric>
        </div>

        <div class="form-row three-col mb-3">
          <FormFieldGeneric :label="$t('view.sale.billingNote.silverResizeQty')">
            <InputTextGeneric :modelValue="data.silverResizeQty" :readonly="true" bgInput="bg-input" />
          </FormFieldGeneric>
          <FormFieldGeneric :label="$t('view.sale.billingNote.silverResizePerUnit')">
            <InputTextGeneric :modelValue="formatNumber(data.silverResizePerUnit)" :readonly="true" bgInput="bg-input" />
          </FormFieldGeneric>
          <FormFieldGeneric :label="$t('common.field.total')">
            <InputTextGeneric :modelValue="formatNumber(data.silverResizeAmount)" :readonly="true" bgInput="bg-input" />
          </FormFieldGeneric>
        </div>

        <div class="total-resize-row mb-3">
          <span class="total-resize-label">{{ $t('view.sale.billingNote.totalResize') }}</span>
          <span class="total-resize-value">{{ formatNumber(totalResize) }}</span>
        </div>

        <div class="calc-summary">
          <div class="calc-row">
            <span class="calc-label">{{ $t('view.sale.billingNote.subTotal') }}</span>
            <span class="calc-value">{{ formatNumber(data.subTotal) }}</span>
          </div>
          <div v-if="data.hasSupport" class="calc-row">
            <span class="calc-label">{{ $t('view.sale.billingNote.supportAmount') }} {{ Number(data.supportPercent) || 0 }}%</span>
            <span class="calc-value">{{ formatNumber(data.supportAmount) }}</span>
          </div>
          <div class="calc-row">
            <span class="calc-label">{{ $t('view.sale.billingNote.vatPercent') }}</span>
            <span class="calc-value">{{ formatNumber(data.vatPercent) }}%</span>
          </div>
          <div class="calc-row">
            <span class="calc-label">{{ $t('view.sale.billingNote.vatAmount') }}</span>
            <span class="calc-value">{{ formatNumber(data.vatAmount) }}</span>
          </div>
          <div class="calc-row highlight">
            <span class="calc-label fw-bold">{{ $t('view.sale.billingNote.grandTotal') }}</span>
            <span class="calc-value fw-bold">{{ formatNumber(data.grandTotal) }}</span>
          </div>
        </div>

        <div v-if="data.remark" class="mt-3">
          <FormFieldGeneric :label="$t('common.field.remark')">
            <TextareaGeneric :modelValue="data.remark" :rows="2" :disabled="true" />
          </FormFieldGeneric>
        </div>
      </SectionCardGeneric>

      <SectionCardGeneric
        :title="$t('view.sale.billingNote.paymentSummaryTitle')"
        icon="bi-cash-coin"
        accent="main"
        headerStyle="legend"
        class="mt-4"
      >
        <div class="payment-stat-row mb-3">
          <div class="payment-stat">
            <span class="payment-stat-label">{{ $t('view.sale.billingNote.billedCount') }}</span>
            <span class="payment-stat-value">{{ data.items.length }} {{ $t('view.sale.billingNote.billedUnit') }}</span>
          </div>
          <div class="payment-stat">
            <span class="payment-stat-label">{{ $t('view.sale.billingNote.totalBilled') }}</span>
            <span class="payment-stat-value">{{ formatNumber(data.totalBilled) }}</span>
          </div>
          <div class="payment-stat">
            <span class="payment-stat-label">{{ $t('view.sale.billingNote.totalReceived') }}</span>
            <span class="payment-stat-value">{{ formatNumber(data.totalReceived) }}</span>
          </div>
          <div class="payment-stat">
            <span class="payment-stat-label">{{ $t('view.sale.billingNote.totalOutstanding') }}</span>
            <span class="payment-stat-value">{{ formatNumber(data.totalOutstanding) }}</span>
          </div>
        </div>

        <div class="payment-status-row mb-3">
          <span class="payment-status-label">{{ $t('view.sale.billingNote.paymentStatusLabel') }}:</span>
          <span :class="['status-pill', `status-pill--${paymentStatusInfo(data.paymentStatus).variant}`]">
            {{ paymentStatusInfo(data.paymentStatus).label }}
          </span>
        </div>

        <BaseDataTable
          :items="data.items"
          :totalRecords="data.items.length"
          :columns="paymentColumns"
          :paginator="false"
          scrollHeight="280px"
          dataKey="invoiceRunning"
        >
          <template #invoiceGrandTotalTemplate="{ data: row }">
            <div class="text-right">{{ formatNumber(row.invoiceGrandTotal) }}</div>
          </template>
          <template #receivedAmountTemplate="{ data: row }">
            <div class="text-right">{{ formatNumber(row.receivedAmount) }}</div>
          </template>
          <template #outstandingAmountTemplate="{ data: row }">
            <div class="text-right">{{ formatNumber(row.outstandingAmount) }}</div>
          </template>
          <template #paymentStatusTemplate="{ data: row }">
            <span :class="['status-pill', `status-pill--${paymentStatusInfo(row.paymentStatus).variant}`]">
              {{ paymentStatusInfo(row.paymentStatus).label }}
            </span>
          </template>
        </BaseDataTable>
      </SectionCardGeneric>
    </template>
  </div>
</template>

<script>
import { useBillingNoteApiStore } from '@/stores/modules/api/sale/billing-note-store.js'
import { formatDate } from '@/services/utils/dayjs.js'
import { formatNumber } from '@/services/utils/decimal.js'
import { warning } from '@/services/alert/sweetAlerts.js'
import { BillingNotePdfBuilder } from '@/services/helper/pdf/billing-note/billing-note-pdf-builder.js'

import PageHeaderGeneric from '@/components/generic/PageHeaderGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import TextareaGeneric from '@/components/generic/TextareaGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import typeSummarySection from './components/type-summary-section.vue'

export default {
  name: 'BillingNoteDetailView',

  components: {
    PageHeaderGeneric,
    ButtonGeneric,
    SectionCardGeneric,
    FormFieldGeneric,
    InputTextGeneric,
    TextareaGeneric,
    BaseDataTable,
    typeSummarySection
  },

  setup() {
    const billingNoteStore = useBillingNoteApiStore()
    return { billingNoteStore }
  },

  data() {
    return {
      data: null
    }
  },

  computed: {
    itemColumns() {
      return [
        { field: 'invoiceRunning', header: this.$t('view.sale.billingNote.invoiceRunning'), minWidth: '150px', sortable: false },
        { field: 'invoiceDate', header: this.$t('view.sale.billingNote.invoiceDate'), minWidth: '120px', sortable: false, template: 'invoiceDateTemplate' },
        { field: 'amountBeforeVat', header: this.$t('view.sale.billingNote.subTotal'), minWidth: '130px', sortable: false, template: 'amountBeforeVatTemplate' }
      ]
    },

    productColumns() {
      return [
        { field: 'invoiceRunning', header: this.$t('view.sale.billingNote.invoiceRunning'), minWidth: '150px', sortable: false },
        { field: 'productNumber', header: this.$t('view.sale.billingNote.productNumber'), minWidth: '150px', sortable: false },
        { field: 'productTypeName', header: this.$t('view.sale.billingNote.productTypeName'), minWidth: '150px', sortable: false },
        { field: 'productionType', header: this.$t('view.sale.billingNote.productionType'), minWidth: '150px', sortable: false },
        { field: 'qty', header: this.$t('view.sale.billingNote.qty'), minWidth: '100px', sortable: false, template: 'qtyTemplate' },
        { field: 'amount', header: this.$t('view.sale.billingNote.amount'), minWidth: '120px', sortable: false, template: 'amountTemplate' }
      ]
    },

    paymentColumns() {
      return [
        { field: 'invoiceRunning', header: this.$t('view.sale.billingNote.invoiceRunning'), minWidth: '150px', sortable: false },
        { field: 'invoiceGrandTotal', header: this.$t('view.sale.billingNote.invoiceGrandTotalCol'), minWidth: '120px', sortable: false, template: 'invoiceGrandTotalTemplate' },
        { field: 'receivedAmount', header: this.$t('view.sale.billingNote.receivedCol'), minWidth: '120px', sortable: false, template: 'receivedAmountTemplate' },
        { field: 'outstandingAmount', header: this.$t('view.sale.billingNote.outstandingCol'), minWidth: '120px', sortable: false, template: 'outstandingAmountTemplate' },
        { field: 'paymentStatus', header: this.$t('view.sale.billingNote.paymentStatusCol'), minWidth: '130px', sortable: false, template: 'paymentStatusTemplate' }
      ]
    },

    totalResize() {
      if (!this.data) return 0
      return (Number(this.data.goldResizeAmount) || 0) + (Number(this.data.silverResizeAmount) || 0)
    }
  },

  async mounted() {
    const running = this.$route.params.running
    if (running) {
      await this.loadData(running)
    }
  },

  methods: {
    async loadData(running) {
      const res = await this.billingNoteStore.fetchGet({ running })
      this.data = res || null
    },

    onEdit() {
      this.$router.push({ name: 'sale-billing-note-edit', params: { running: this.data.running } })
    },

    formatDate(val) {
      return val ? formatDate(val) : ''
    },

    formatNumber(val) {
      return formatNumber(val, 2)
    },

    paymentStatusInfo(status) {
      if (status === 'Paid') {
        return { label: this.$t('view.sale.billingNote.statusPaid'), variant: 'green' }
      }
      if (status === 'Partial') {
        return { label: this.$t('view.sale.billingNote.statusPartial'), variant: 'warning' }
      }
      return { label: this.$t('view.sale.billingNote.statusUnpaid'), variant: 'red' }
    },

    async onPrintMain() {
      if (!this.data) return warning(this.$t('view.sale.billingNote.printNoData'))
      const builder = new BillingNotePdfBuilder(this.data, 'main')
      await builder.preparePDF()
      builder.generatePDF().open()
    },

    async onPrintByType() {
      if (!this.data) return warning(this.$t('view.sale.billingNote.printNoData'))
      const builder = new BillingNotePdfBuilder(this.data, 'byType')
      await builder.preparePDF()
      builder.generatePDF().open()
    },

    async onPrintByCode() {
      if (!this.data) return warning(this.$t('view.sale.billingNote.printNoData'))
      const builder = new BillingNotePdfBuilder(this.data, 'byCode')
      await builder.preparePDF()
      builder.generatePDF().open()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.app-container {
  padding: var(--sp-lg);
}

.form-row {
  display: grid;
  gap: var(--sp-md);

  &.two-col {
    grid-template-columns: 1fr 1fr;

    @media (max-width: 1024px) {
      grid-template-columns: 1fr;
    }
  }

  &.three-col {
    grid-template-columns: repeat(3, 1fr);

    @media (max-width: 1024px) {
      grid-template-columns: 1fr;
    }
  }
}

.total-resize-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid var(--base-font-color);
  border-radius: var(--radius-md);
  padding: var(--sp-sm) var(--sp-lg);
  background: var(--color-highlight-bg);
}

.total-resize-label {
  font-weight: 700;
  font-size: var(--fs-lg);
  color: var(--base-font-color);
}

.total-resize-value {
  font-weight: 700;
  font-size: var(--fs-lg);
  color: var(--base-font-color);
}

.calc-summary {
  border: 1px solid var(--base-green);
  border-radius: var(--radius-md);
  padding: var(--sp-md) var(--sp-lg);
  background: var(--color-card-bg);
}

.calc-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--sp-xs) 0;
}

.calc-label {
  font-weight: 700;
  font-size: var(--fs-base);
  color: var(--base-font-color);
}

.calc-value {
  font-weight: 700;
  font-size: var(--fs-base);
  text-align: right;
  color: var(--base-font-color);
}

.highlight {
  .calc-label,
  .calc-value {
    font-size: var(--fs-lg);
  }
}

.payment-stat-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--sp-md);

  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }
}

.payment-stat {
  display: flex;
  flex-direction: column;
  gap: var(--sp-xs);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--sp-sm) var(--sp-lg);
  background: var(--color-card-bg);
}

.payment-stat-label {
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}

.payment-stat-value {
  font-size: var(--fs-lg);
  font-weight: 700;
  color: var(--base-font-color);
}

.payment-status-row {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
}

.payment-status-label {
  font-weight: 700;
  font-size: var(--fs-base);
  color: var(--base-font-color);
}

.status-pill {
  display: inline-block;
  padding: var(--sp-xs) var(--sp-sm);
  border-radius: var(--radius-sm);
  font-size: var(--fs-sm);
  font-weight: 700;

  &--green {
    color: var(--status-resolved);
    background: var(--status-resolved-bg);
  }

  &--warning {
    color: var(--status-open);
    background: var(--status-open-bg);
  }

  &--red {
    color: var(--status-cancelled);
    background: var(--status-cancelled-bg);
  }
}
</style>
