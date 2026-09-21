<template>
  <modal :showModal="showModal" @closeModal="onClose" width="520px" :isShowActionPart="true">
    <template #title>
      <span class="title-text-lg px-3 pt-3 d-block">{{ $t('view.sale.materialSale.createInvoiceModal.title') }}</span>
    </template>
    <template #content>
      <div class="readonly-summary mb-3">
        <div class="summary-row">
          <span class="summary-label">{{ $t('view.sale.materialSale.createInvoiceModal.documentNo') }}</span>
          <span class="summary-value">{{ documentNo }}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">{{ $t('view.sale.materialSale.createInvoiceModal.customerName') }}</span>
          <span class="summary-value">{{ customerName || '-' }}</span>
        </div>
        <div class="summary-row summary-row--highlight">
          <span class="summary-label">{{ $t('view.sale.materialSale.createInvoiceModal.grandTotal') }}</span>
          <span class="summary-value">{{ formatNumber(grandTotal) }}</span>
        </div>
      </div>

      <FormFieldGeneric :label="$t('view.sale.saleOrder.paymentMethod')">
        <DropdownGeneric
          v-model="form.payment"
          :options="paymentMethodOptions"
          optionLabel="label"
          optionValue="code"
        />
      </FormFieldGeneric>

      <FormFieldGeneric :label="$t('view.sale.saleOrder.paymentTerm')" class="mt-3">
        <InputTextGeneric
          type="number"
          min="0"
          step="1"
          :disabled="isCashPayment"
          :modelValue="form.paymentDay"
          @update:modelValue="form.paymentDay = Number($event) || 0"
        />
        <small v-if="isCashPayment" class="hint-text">{{ $t('view.sale.saleOrder.payCash') }}</small>
      </FormFieldGeneric>

      <FormFieldGeneric :label="$t('view.sale.saleOrder.saleChannelLabel')" class="mt-3">
        <DropdownGeneric
          v-model="form.saleChannelCode"
          :options="saleChannelOptions"
          optionLabel="name"
          optionValue="code"
          :placeholder="$t('view.sale.saleOrder.saleChannelPlaceholder')"
        />
      </FormFieldGeneric>

      <FormFieldGeneric :label="$t('view.sale.materialSale.remark')" class="mt-3">
        <TextareaGeneric v-model="form.remark" :rows="2" />
      </FormFieldGeneric>
    </template>
    <template #action>
      <ButtonGeneric
        variant="main"
        icon="bi-receipt"
        :label="$t('view.sale.materialSale.createInvoiceModal.submitBtn')"
        @click="onSubmit"
      />
      <ButtonGeneric variant="outline" :label="$t('common.btn.cancel')" class="ml-2" @click="onClose" />
    </template>
  </modal>
</template>

<script>
// External dependencies
import { defineAsyncComponent } from 'vue'
import { useInvoiceApiStore } from '@/stores/modules/api/sale/invoice-store.js'
import { useSaleChannelApiStore } from '@/stores/modules/api/sale/sale-channel-store.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { PAYMENT_METHODS, getPaymentApiName } from '@/constants/payment-methods.js'
import { formatNumber } from '@/services/utils/decimal.js'

// Local components
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import TextareaGeneric from '@/components/generic/TextareaGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

// PAYMENT_METHODS.key -> key ภายใต้ namespace view.sale.saleOrderList.paymentMethod (ใช้ร่วมกับ sale-order/modal/invoice-modal.vue)
const PAYMENT_LABEL_KEY_MAP = {
  cash: 'cash',
  transfer: 'transfer',
  cheque: 'cheque',
  creditCard: 'creditCard',
  credit: 'creditTerm'
}

const CASH_PAYMENT_CODE = 1

const interfaceForm = {
  payment: CASH_PAYMENT_CODE,
  paymentDay: 0,
  saleChannelCode: null,
  remark: ''
}

export default {
  name: 'MaterialSaleCreateInvoiceModal',

  components: {
    modal,
    ButtonGeneric,
    FormFieldGeneric,
    TextareaGeneric,
    InputTextGeneric,
    DropdownGeneric
  },

  props: {
    showModal: { type: Boolean, default: false },
    detail: { type: Object, default: () => ({}) }
  },

  emits: ['closeModal', 'created'],

  setup() {
    const invoiceStore = useInvoiceApiStore()
    const saleChannelStore = useSaleChannelApiStore()
    return { invoiceStore, saleChannelStore }
  },

  data() {
    return {
      form: { ...interfaceForm },
      saleChannelList: []
    }
  },

  computed: {
    documentNo() {
      return this.detail?.documentNo || ''
    },

    customerName() {
      return this.detail?.customerName || ''
    },

    grandTotal() {
      return Number(this.detail?.grandTotal) || 0
    },

    isCashPayment() {
      return this.form.payment === CASH_PAYMENT_CODE
    },

    paymentMethodOptions() {
      return PAYMENT_METHODS.map((method) => ({
        code: method.code,
        label: this.$t(`view.sale.saleOrderList.paymentMethod.${PAYMENT_LABEL_KEY_MAP[method.key]}`)
      }))
    },

    saleChannelOptions() {
      return this.saleChannelList.map((channel) => ({
        code: channel.code,
        name: channel.nameTh || channel.nameEn || channel.code
      }))
    }
  },

  watch: {
    showModal(val) {
      if (val) {
        this.form = { ...interfaceForm }
        this.loadInitialData()
      }
    },

    isCashPayment(val) {
      if (val) this.form.paymentDay = 0
    }
  },

  methods: {
    async loadInitialData() {
      this.saleChannelList = await this.saleChannelStore.fetchActiveList({ skipLoading: true })
      const current = await this.saleChannelStore.fetchCurrent({ skipLoading: true })
      this.form.saleChannelCode = current ? current.code : null
    },

    formatNumber(val) {
      return formatNumber(val, 2)
    },

    onSubmit() {
      confirmThenSubmit(
        this.documentNo,
        this.$t('view.sale.materialSale.createInvoiceModal.confirmTitle'),
        async () => {
          const payload = {
            materialSaleRunning: this.detail?.running,
            payment: this.form.payment,
            paymentName: getPaymentApiName(this.form.payment),
            paymentDay: this.isCashPayment ? 0 : Number(this.form.paymentDay) || 0,
            saleChannelCode: this.form.saleChannelCode || null,
            remark: this.form.remark || null
          }

          const res = await this.invoiceStore.fetchCreateFromMaterialSale({ formValue: payload })
          if (res && res.invoiceNumber) {
            this.$emit('created', res.invoiceNumber)
          }
        }
      )
    },

    onClose() {
      this.$emit('closeModal')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';

.readonly-summary {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-highlight-bg);
  padding: var(--sp-md);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--sp-xs) 0;
}

.summary-row--highlight {
  border-top: 1px solid var(--color-border);
  margin-top: var(--sp-xs);
  padding-top: var(--sp-sm);
  font-weight: 700;
}

.summary-label {
  color: var(--base-sub-color);
}

.summary-value {
  font-weight: 600;
  color: var(--base-font-color);
}

.hint-text {
  display: block;
  color: var(--base-sub-color);
  font-size: var(--fs-sm);
  margin-top: var(--sp-xs);
}
</style>
