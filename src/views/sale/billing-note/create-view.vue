<template>
  <div class="app-container">
    <PageHeaderGeneric
      :title="isEditMode ? $t('view.sale.billingNote.editTitle') : $t('view.sale.billingNote.createTitle')"
      backRoute="sale-billing-note"
    />

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
      :isEdit="isEditMode"
      class="mt-4"
      @open-select="isShowCustomerSearch = true"
      @update:documentDate="form.documentDate = $event"
    />

    <invoiceSelectSection
      :invoices="availableInvoices"
      :selectedInvoices="selectedInvoices"
      :disabled="!form.customerCode"
      :hasFetched="hasFetchedInvoices"
      :readonly="isEditMode"
      class="mt-4"
      @fetch="onFetchInvoices"
      @update:selectedInvoices="selectedInvoices = $event"
    />

    <productsSection
      :products="products"
      :disabled="selectedInvoices.length === 0"
      :readonly="isEditMode"
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
      v-model:goldResizePerUnit="form.goldResizePerUnit"
      v-model:silverResizeQty="form.silverResizeQty"
      v-model:silverResizePerUnit="form.silverResizePerUnit"
      v-model:vatPercent="form.vatPercent"
      v-model:supportPercent="form.supportPercent"
      v-model:hasSupport="form.hasSupport"
      v-model:remark="form.remark"
      :goldResizeAmount="goldResizeAmount"
      :silverResizeAmount="silverResizeAmount"
      :totalResize="totalResize"
      :subTotal="subTotal"
      :supportAmount="supportAmount"
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
  goldResizePerUnit: 0,
  silverResizeQty: 0,
  silverResizePerUnit: 0,
  vatPercent: 7,
  supportPercent: 0,
  hasSupport: false,
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
    isEditMode() {
      return !!this.$route.params.running
    },

    subTotal() {
      return roundDecimal(
        this.selectedInvoices.reduce((sum, inv) => sum + (Number(inv.subTotal) || 0), 0)
      )
    },

    goldResizeAmount() {
      return roundDecimal((Number(this.form.goldResizeQty) || 0) * (Number(this.form.goldResizePerUnit) || 0))
    },

    silverResizeAmount() {
      return roundDecimal((Number(this.form.silverResizeQty) || 0) * (Number(this.form.silverResizePerUnit) || 0))
    },

    totalResize() {
      return roundDecimal(this.goldResizeAmount + this.silverResizeAmount)
    },

    supportAmount() {
      return this.form.hasSupport
        ? roundDecimal((this.subTotal * (Number(this.form.supportPercent) || 0)) / 100)
        : 0
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

  async mounted() {
    if (this.isEditMode) {
      await this.loadExisting(this.$route.params.running)
    }
  },

  methods: {
    async loadExisting(running) {
      const data = await this.billingNoteStore.fetchGet({ running })
      if (!data) return

      this.form.customerCode = data.customerCode
      this.form.customerName = data.customerName
      this.form.customerAddress = data.customerAddress
      this.form.customerTel = data.customerTel
      this.form.documentDate = data.documentDate ? new Date(data.documentDate) : new Date()
      this.form.goldResizeQty = data.goldResizeQty
      this.form.goldResizePerUnit = data.goldResizePerUnit
      this.form.silverResizeQty = data.silverResizeQty
      this.form.silverResizePerUnit = data.silverResizePerUnit
      this.form.vatPercent = data.vatPercent
      this.form.supportPercent = data.supportPercent
      this.form.hasSupport = data.hasSupport
      this.form.remark = data.remark || ''

      this.availableInvoices = (data.items || []).map((it) => ({
        invoiceRunning: it.invoiceRunning,
        invoiceDate: it.invoiceDate,
        subTotal: it.amountBeforeVat,
        customerName: data.customerName
      }))
      this.selectedInvoices = [...this.availableInvoices]
      this.hasFetchedInvoices = true

      this.products = (data.products || []).map((p, idx) => ({ ...p, _key: `p-${idx}` }))
    },

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
        this.isEditMode ? this.$t('view.sale.billingNote.confirmUpdate') : this.$t('view.sale.billingNote.confirmSave'),
        async () => {
          await this.doSave()
        }
      )
    },

    async doSave() {
      if (this.isEditMode) {
        const payload = {
          running: this.$route.params.running,
          documentDate: formatISOString(this.form.documentDate),
          goldResizeQty: Number(this.form.goldResizeQty) || 0,
          goldResizePerUnit: Number(this.form.goldResizePerUnit) || 0,
          silverResizeQty: Number(this.form.silverResizeQty) || 0,
          silverResizePerUnit: Number(this.form.silverResizePerUnit) || 0,
          supportPercent: Number(this.form.supportPercent) || 0,
          hasSupport: this.form.hasSupport,
          vatPercent: Number(this.form.vatPercent) || 0,
          remark: this.form.remark || null
        }

        const res = await this.billingNoteStore.fetchUpdate({ formValue: payload })

        if (res && res.running) {
          success(this.$t('view.sale.billingNote.updateSuccess'))
          this.$router.push({ name: 'sale-billing-note-detail', params: { running: res.running } })
        }
        return
      }

      const payload = {
        customerCode: this.form.customerCode,
        documentDate: formatISOString(this.form.documentDate),
        invoiceRunnings: this.selectedInvoices.map((inv) => inv.invoiceRunning),
        goldResizeQty: Number(this.form.goldResizeQty) || 0,
        goldResizePerUnit: Number(this.form.goldResizePerUnit) || 0,
        silverResizeQty: Number(this.form.silverResizeQty) || 0,
        silverResizePerUnit: Number(this.form.silverResizePerUnit) || 0,
        supportPercent: Number(this.form.supportPercent) || 0,
        hasSupport: this.form.hasSupport,
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
