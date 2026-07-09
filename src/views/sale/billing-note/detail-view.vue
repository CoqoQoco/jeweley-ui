<template>
  <div class="app-container">
    <PageHeaderGeneric :title="$t('view.sale.billingNote.detailTitle')" backRoute="sale-billing-note">
      <template #actions>
        <ButtonGeneric
          variant="outline"
          icon="bi-printer"
          :label="$t('view.sale.billingNote.printMainDoc')"
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
        <div class="form-row four-col mb-3">
          <FormFieldGeneric :label="$t('view.sale.billingNote.goldResizeQty')">
            <InputTextGeneric :modelValue="data.goldResizeQty" :readonly="true" bgInput="bg-input" />
          </FormFieldGeneric>
          <FormFieldGeneric :label="$t('view.sale.billingNote.goldResizeAmount')">
            <InputTextGeneric :modelValue="formatNumber(data.goldResizeAmount)" :readonly="true" bgInput="bg-input" />
          </FormFieldGeneric>
          <FormFieldGeneric :label="$t('view.sale.billingNote.silverResizeQty')">
            <InputTextGeneric :modelValue="data.silverResizeQty" :readonly="true" bgInput="bg-input" />
          </FormFieldGeneric>
          <FormFieldGeneric :label="$t('view.sale.billingNote.silverResizeAmount')">
            <InputTextGeneric :modelValue="formatNumber(data.silverResizeAmount)" :readonly="true" bgInput="bg-input" />
          </FormFieldGeneric>
        </div>

        <div class="calc-summary">
          <div class="calc-row">
            <span class="calc-label">{{ $t('view.sale.billingNote.subTotal') }}</span>
            <span class="calc-value">{{ formatNumber(data.subTotal) }}</span>
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

    formatDate(val) {
      return val ? formatDate(val) : ''
    },

    formatNumber(val) {
      return formatNumber(val, 2)
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

  &.four-col {
    grid-template-columns: repeat(4, 1fr);

    @media (max-width: 1024px) {
      grid-template-columns: 1fr 1fr;
    }

    @media (max-width: 600px) {
      grid-template-columns: 1fr;
    }
  }
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
</style>
