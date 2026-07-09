<template>
  <div class="app-container">
    <PageHeaderGeneric :title="$t('view.sale.billingNote.createTitle')" backRoute="sale-billing-note" />

    <customerSelectModal
      :showModal="isShowCustomerSearch"
      @closeModal="isShowCustomerSearch = false"
      @customerSelected="onSelectCustomer"
    />

    <customerSection
      :customerCode="form.customerCode"
      :customerName="form.customerName"
      :customerAddress="form.customerAddress"
      :customerTel="form.customerTel"
      :documentDate="form.documentDate"
      class="mt-4"
      @open-select="isShowCustomerSearch = true"
      @update:documentDate="form.documentDate = $event"
    />

    <invoiceSelectSection
      :invoices="availableInvoices"
      :selectedInvoices="selectedInvoices"
      :disabled="!form.customerCode"
      :hasFetched="hasFetchedInvoices"
      class="mt-4"
      @fetch="onFetchInvoices"
      @update:selectedInvoices="selectedInvoices = $event"
    />

    <productsSection
      :products="products"
      :disabled="selectedInvoices.length === 0"
      class="mt-4"
      @fetch="onFetchProducts"
      @add-row="onAddProductRow"
      @remove-row="onRemoveProductRow"
      @update:products="products = $event"
    />

    <typeSummarySection
      :products="products"
      :billCount="selectedInvoices.length"
      class="mt-4"
    />

    <summarySection
      v-model:goldResizeQty="form.goldResizeQty"
      v-model:goldResizeAmount="form.goldResizeAmount"
      v-model:silverResizeQty="form.silverResizeQty"
      v-model:silverResizeAmount="form.silverResizeAmount"
      v-model:vatPercent="form.vatPercent"
      v-model:remark="form.remark"
      :subTotal="subTotal"
      :vatAmount="vatAmount"
      :grandTotal="grandTotal"
      :canSave="canSave"
      class="mt-4"
      @save="onSave"
    />
  </div>
</template>

<script>
// External dependencies
import { useBillingNoteApiStore } from '@/stores/modules/api/sale/billing-note-store.js'
import { formatISOString } from '@/services/utils/dayjs.js'
import { roundDecimal } from '@/services/utils/decimal.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { warning, success } from '@/services/alert/sweetAlerts.js'

// Local components
import PageHeaderGeneric from '@/components/generic/PageHeaderGeneric.vue'
import customerSelectModal from './modal/customer-select-modal.vue'
import customerSection from './components/customer-section.vue'
import invoiceSelectSection from './components/invoice-select-section.vue'
import productsSection from './components/products-section.vue'
import typeSummarySection from './components/type-summary-section.vue'
import summarySection from './components/summary-section.vue'

const interfaceForm = {
  customerCode: '',
  customerName: '',
  customerAddress: '',
  customerTel: '',
  documentDate: new Date(),
  goldResizeQty: 0,
  goldResizeAmount: 0,
  silverResizeQty: 0,
  silverResizeAmount: 0,
  vatPercent: 7,
  remark: ''
}

export default {
  name: 'BillingNoteCreateView',

  components: {
    PageHeaderGeneric,
    customerSelectModal,
    customerSection,
    invoiceSelectSection,
    productsSection,
    typeSummarySection,
    summarySection
  },

  setup() {
    const billingNoteStore = useBillingNoteApiStore()
    return { billingNoteStore }
  },

  data() {
    return {
      form: { ...interfaceForm },
      isShowCustomerSearch: false,
      availableInvoices: [],
      selectedInvoices: [],
      hasFetchedInvoices: false,
      products: []
    }
  },

  computed: {
    subTotal() {
      return roundDecimal(
        this.selectedInvoices.reduce((sum, inv) => sum + (Number(inv.subTotal) || 0), 0)
      )
    },

    vatAmount() {
      return roundDecimal((this.subTotal * (Number(this.form.vatPercent) || 0)) / 100)
    },

    grandTotal() {
      return roundDecimal(this.subTotal + this.vatAmount)
    },

    canSave() {
      return !!this.form.customerCode && this.selectedInvoices.length > 0 && this.products.length > 0
    }
  },

  methods: {
    onSelectCustomer(customerData) {
      this.form.customerCode = customerData.customerCode
      this.form.customerName = customerData.customerName
      this.form.customerAddress = customerData.customerAddress
      this.form.customerTel = customerData.customerTel
      this.availableInvoices = []
      this.selectedInvoices = []
      this.hasFetchedInvoices = false
      this.products = []
      this.isShowCustomerSearch = false
    },

    async onFetchInvoices() {
      if (!this.form.customerCode) {
        warning(this.$t('view.sale.billingNote.validationSelectCustomer'))
        return
      }

      const res = await this.billingNoteStore.fetchAvailableInvoices({
        customerCode: this.form.customerCode
      })

      this.availableInvoices = res || []
      this.selectedInvoices = []
      this.hasFetchedInvoices = true
      this.products = []
    },

    async onFetchProducts() {
      if (this.selectedInvoices.length === 0) {
        warning(this.$t('view.sale.billingNote.validationSelectInvoices'))
        return
      }

      const res = await this.billingNoteStore.fetchPreviewProducts({
        invoiceRunnings: this.selectedInvoices.map((inv) => inv.invoiceRunning)
      })

      this.products = (res || []).map((p, idx) => ({ ...p, _key: `p-${idx}` }))
    },

    onAddProductRow() {
      this.products = [
        ...this.products,
        {
          _key: `p-${Date.now()}`,
          invoiceRunning: this.selectedInvoices[0]?.invoiceRunning || '',
          productNumber: '',
          productType: '',
          productTypeName: '',
          productionType: '',
          qty: 0,
          amount: 0
        }
      ]
    },

    onRemoveProductRow(index) {
      this.products = this.products.filter((_, i) => i !== index)
    },

    onSave() {
      confirmThenSubmit(
        `${this.form.customerCode} : ${this.form.customerName}`,
        this.$t('view.sale.billingNote.confirmSave'),
        async () => {
          await this.doSave()
        }
      )
    },

    async doSave() {
      const payload = {
        customerCode: this.form.customerCode,
        documentDate: formatISOString(this.form.documentDate),
        invoiceRunnings: this.selectedInvoices.map((inv) => inv.invoiceRunning),
        goldResizeQty: Number(this.form.goldResizeQty) || 0,
        goldResizeAmount: Number(this.form.goldResizeAmount) || 0,
        silverResizeQty: Number(this.form.silverResizeQty) || 0,
        silverResizeAmount: Number(this.form.silverResizeAmount) || 0,
        vatPercent: Number(this.form.vatPercent) || 0,
        remark: this.form.remark || null,
        products: this.products.map((p) => ({
          invoiceRunning: p.invoiceRunning,
          productNumber: p.productNumber,
          productType: p.productType,
          productTypeName: p.productTypeName,
          productionType: p.productionType,
          qty: Number(p.qty) || 0,
          amount: Number(p.amount) || 0
        }))
      }

      const res = await this.billingNoteStore.fetchCreate({ formValue: payload })

      if (res && res.running) {
        success(this.$t('view.sale.billingNote.saveSuccess'))
        this.$router.push({ name: 'sale-billing-note-detail', params: { running: res.running } })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.app-container {
  padding: var(--sp-lg);
}
</style>
