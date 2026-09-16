<template>
  <div>
    <modal :showModal="isShowModal" @closeModal="closeModal" :width="'700px'">
      <template v-slot:content>
        <div class="deposit-record-container">
          <div class="title-text-lg-bg">
            <i class="bi bi-piggy-bank mr-2"></i>
            <span>{{ $t('view.sale.soDeposit.modalTitle') }}</span>
          </div>

          <div class="filter-container-search mb-2 p-2">
            <div class="d-flex justify-content-between align-items-center">
              <span class="title-text">{{ $t('view.sale.soDeposit.soGrandTotalLabel') }}</span>
              <span class="so-grand-total">{{ formatNumber(grandTotalRounded) }} {{ currencyUnit }}</span>
            </div>
          </div>

          <div class="filter-container mb-2">
            <div class="title-text-lg mb-2">
              <i class="bi bi-receipt mr-2"></i>{{ $t('view.sale.invoiceDetail.paymentInfo') }}
            </div>
            <div class="p-3">
              <div class="form-group mb-3">
                <label class="form-label required">
                  <i class="bi bi-calendar-event mr-1"></i>{{ $t('view.sale.soDeposit.depositDateLabel') }}
                </label>
                <CalendarGeneric
                  v-model="depositData.depositDate"
                  dateFormat="dd/mm/yy"
                  :showIcon="true"
                  :showButtonBar="true"
                  class="w-100"
                />
              </div>

              <div class="form-group mb-3">
                <label class="form-label required">
                  <i class="bi bi-currency-exchange mr-1"></i>{{ $t('view.sale.soDeposit.amountLabel') }} ({{ currencyUnit }})
                </label>
                <InputTextGeneric
                  v-model="depositData.amount"
                  type="number"
                  placeholder="0.00"
                  :step="0.01"
                  :min="0"
                />
                <div class="quick-fill-row">
                  <span class="quick-fill-hint">{{ $t('view.sale.soDeposit.quickFillHint') }}:</span>
                  <ButtonGeneric
                    variant="outline"
                    :label="$t('view.sale.soDeposit.quickFill30')"
                    @click="fillQuickAmount(0.3)"
                  />
                  <ButtonGeneric
                    variant="outline"
                    :label="$t('view.sale.soDeposit.quickFill50')"
                    @click="fillQuickAmount(0.5)"
                  />
                </div>
              </div>

              <div class="form-group mb-3">
                <label class="form-label required">
                  <i class="bi bi-credit-card mr-1"></i>{{ $t('view.sale.invoiceDetail.paymentMethod') }}
                </label>
                <DropdownGeneric
                  v-model="depositData.paymentMethod"
                  :options="paymentMethods"
                  optionLabel="name"
                  optionValue="value"
                  :placeholder="$t('view.sale.invoiceDetail.placeholder.paymentMethod')"
                  class="w-100"
                />
              </div>

              <div
                v-if="depositData.paymentId === 2 || depositData.paymentId === 3"
                class="form-group mb-3"
              >
                <label class="form-label required">
                  <i class="bi bi-bank mr-1"></i>{{ $t('view.sale.invoiceDetail.bank') }}
                </label>
                <AutoCompleteGeneric
                  :modelValue="selectedBank"
                  :staticOptions="bankList"
                  :useStaticList="true"
                  optionLabel="nameTh"
                  :placeholder="$t('view.sale.invoiceDetail.placeholder.bank')"
                  :forceSelection="true"
                  customClass="bank-ac w-100"
                  @update:modelValue="onBankChange"
                >
                  <template #option="{ option }">
                    <span>{{ option.nameTh }}</span>
                  </template>
                </AutoCompleteGeneric>
              </div>

              <div v-if="depositData.paymentId === 3" class="form-group mb-3">
                <label class="form-label required">
                  <i class="bi bi-geo-alt mr-1"></i>{{ $t('view.sale.invoiceDetail.branch') }}
                </label>
                <InputTextGeneric
                  v-model="depositData.bankBranch"
                  :placeholder="$t('view.sale.invoiceDetail.branch')"
                />
              </div>

              <div class="form-group mb-3">
                <label class="form-label">
                  <i class="bi bi-hash mr-1"></i>{{ $t('view.sale.invoiceDetail.referenceNumber') }}
                </label>
                <InputTextGeneric
                  v-model="depositData.referenceNumber"
                  :placeholder="$t('view.sale.invoiceDetail.referenceNumber')"
                />
              </div>

              <div class="form-group mb-3">
                <label class="form-label">
                  <i class="bi bi-chat-left-text mr-1"></i>{{ $t('common.field.remark') }}
                </label>
                <TextareaGeneric
                  v-model="depositData.remark"
                  :rows="3"
                  :placeholder="$t('view.sale.invoiceDetail.placeholder.remark')"
                />
              </div>
            </div>
          </div>

          <div class="filter-container mb-2">
            <div class="title-text-lg mb-2">
              <i class="bi bi-image mr-2"></i>{{ $t('view.sale.invoiceDetail.paymentEvidence') }}
            </div>
            <div class="p-3">
              <UploadImage
                hight="400px"
                :reset="resetUpload"
                @onImportFile="onUploadImage"
              />
              <small class="form-text text-muted mt-2">
                {{ $t('view.sale.invoiceDetail.imageHint') }}
              </small>
            </div>
          </div>

          <div class="btn-submit-container mb-2">
            <div class="d-flex justify-content-end">
              <button class="btn btn-main mr-2" type="button" :disabled="isSubmitting" @click="onSubmit">
                <i class="bi bi-check-circle mr-1"></i>
                {{ $t('common.btn.save') }}
              </button>
              <button class="btn btn-outline-main" type="button" @click="closeModal">
                <i class="bi bi-x-circle mr-1"></i>
                {{ $t('common.btn.cancel') }}
              </button>
            </div>
          </div>
        </div>
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import CalendarGeneric from '@/components/prime-vue/CalendarGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import UploadImage from '@/components/prime-vue/UploadImage.vue'
import AutoCompleteGeneric from '@/components/prime-vue/AutoCompleteGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import TextareaGeneric from '@/components/generic/TextareaGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import { warning } from '@/services/alert/sweetAlerts.js'
import { useMasterBankStore } from '@/stores/modules/api/master/master-bank-store.js'
import { compressImage } from '@/services/utils/image-compress.js'
import { PAYMENT_METHODS, getPaymentApiName } from '@/constants/payment-methods.js'
import { roundHalfUp } from '@/services/utils/money.js'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

export default {
  name: 'DepositRecordModal',

  components: {
    modal,
    CalendarGeneric,
    DropdownGeneric,
    UploadImage,
    AutoCompleteGeneric,
    InputTextGeneric,
    TextareaGeneric,
    ButtonGeneric
  },

  props: {
    isShowModal: {
      type: Boolean,
      default: false
    },
    soNumber: {
      type: String,
      default: ''
    },
    grandTotalRounded: {
      type: Number,
      default: 0
    },
    currencyUnit: {
      type: String,
      default: 'THB'
    }
  },

  emits: ['close-modal', 'save-deposit'],

  data() {
    return {
      masterBankStore: useMasterBankStore(),
      bankList: [],
      selectedBank: null,
      depositData: {
        depositDate: new Date(),
        amount: 0,
        paymentMethod: null,
        paymentId: null,
        bankCode: null,
        bankBranch: '',
        referenceNumber: '',
        remark: '',
        receiptImage: null
      },
      // เก็บมัดจำต้องเป็นการรับเงินจริงแล้วเท่านั้น (recordableAsReceipt) — ตัดรหัสเครดิต (ยังไม่ได้รับเงิน) ออก เหมือน payment-record-modal.vue
      paymentMethodsData: PAYMENT_METHODS.filter((m) => m.recordableAsReceipt).map((m) => ({
        value: m.key === 'creditCard' ? 'credit_card' : m.key,
        id: m.code,
        key: m.key
      })),
      resetUpload: false,
      compressedImage: null,
      isSubmitting: false
    }
  },

  computed: {
    paymentMethods() {
      return this.paymentMethodsData.map((m) => ({
        ...m,
        name: this.$t(`view.sale.invoiceDetail.paymentMethods.${m.key === 'creditCard' ? 'creditCard' : m.key}`)
      }))
    }
  },

  watch: {
    isShowModal: {
      handler(newVal) {
        if (newVal) {
          this.initializeDepositData()
        }
      },
      immediate: true
    },
    'depositData.paymentMethod': {
      handler(newValue) {
        const selected = this.paymentMethodsData.find((m) => m.value === newValue)
        this.depositData.paymentId = selected ? selected.id : null
        this.depositData.bankCode = null
        this.depositData.bankBranch = ''
        this.selectedBank = null
      }
    }
  },

  async mounted() {
    const response = await this.masterBankStore.fetchBankList()
    this.bankList = response || []
  },

  methods: {
    initializeDepositData() {
      this.depositData = {
        depositDate: new Date(),
        amount: 0,
        paymentMethod: null,
        paymentId: null,
        bankCode: null,
        bankBranch: '',
        referenceNumber: '',
        remark: '',
        receiptImage: null
      }
      this.selectedBank = null
      this.compressedImage = null
      this.resetUpload = false
      this.isSubmitting = false
    },

    // เติมจำนวนอย่างเร็ว 30%/50% ของยอดรวมใบสั่งขาย — ปัดเป็นทศนิยม 2 ตำแหน่งเพื่อการแสดงผลเงินเท่านั้น
    // ไม่ใช่การปัดกลางเอกสารขาย (ยอด SO grand total ปัดมาแล้วครั้งเดียวจาก computeDocumentTotals)
    fillQuickAmount(ratio) {
      this.depositData.amount = roundHalfUp((this.grandTotalRounded || 0) * ratio, 2)
    },

    formatNumber(value) {
      if (!value && value !== 0) return '0.00'
      return Number(value).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },

    async onUploadImage(file) {
      if (!file) return

      try {
        const compressedFile = await compressImage(file)
        this.compressedImage = compressedFile
        this.depositData.receiptImage = file.name
      } catch (err) {
        warning(this.$t('view.sale.soDeposit.validation.compressError'))
      }
    },

    onBankChange(value) {
      if (value && typeof value === 'object') {
        this.selectedBank = value
        this.depositData.bankCode = value.code
      } else {
        this.selectedBank = null
        this.depositData.bankCode = null
      }
    },

    closeModal() {
      this.$emit('close-modal')
    },

    onSubmit() {
      // U4: กันกดบันทึกซ้ำระหว่างรอ API
      if (this.isSubmitting) return

      if (!this.depositData.depositDate) {
        warning(this.$t('view.sale.soDeposit.validation.dateRequired'))
        return
      }

      if (!this.depositData.amount || this.depositData.amount <= 0) {
        warning(this.$t('view.sale.soDeposit.validation.amountRequired'))
        return
      }

      if (!this.depositData.paymentMethod) {
        warning(this.$t('view.sale.soDeposit.validation.methodRequired'))
        return
      }

      if (
        (this.depositData.paymentId === 2 || this.depositData.paymentId === 3) &&
        !this.depositData.bankCode
      ) {
        warning(this.$t('view.sale.soDeposit.validation.bankRequired'))
        return
      }

      if (this.depositData.paymentId === 3 && !this.depositData.bankBranch) {
        warning(this.$t('view.sale.soDeposit.validation.branchRequired'))
        return
      }

      const normalizedDate = new Date(this.depositData.depositDate)
      normalizedDate.setHours(0, 0, 0, 0)

      const formData = new FormData()
      formData.append('SoNumber', this.soNumber)
      formData.append('DepositDate', normalizedDate.toISOString())
      formData.append('Amount', this.depositData.amount)
      formData.append('Payment', this.depositData.paymentId)
      // paymentName ต้องมาจาก getPaymentApiName(code) เสมอ ห้ามใช้ label ที่แปลด้วย $t (เหมือน payment-record-modal.vue)
      formData.append('PaymentName', getPaymentApiName(this.depositData.paymentId))

      if (this.depositData.bankCode) formData.append('BankCode', this.depositData.bankCode)
      if (this.depositData.bankBranch) formData.append('BankBranch', this.depositData.bankBranch)
      if (this.depositData.referenceNumber) formData.append('ReferenceNumber', this.depositData.referenceNumber)
      if (this.depositData.remark) formData.append('Remark', this.depositData.remark)
      if (this.compressedImage) formData.append('ReceiptImage', this.compressedImage)

      this.isSubmitting = true
      this.$emit('save-deposit', formData)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form';

.deposit-record-container {
  // component-specific styles only
}

.so-grand-total {
  font-size: var(--fs-lg);
  font-weight: 700;
  color: var(--base-font-color);
}

.form-label {
  font-weight: 600;
  color: var(--base-sub-color);
  margin-bottom: 0.5rem;
  display: block;

  i {
    color: var(--base-font-color);
  }

  &.required::after {
    content: ' *';
    color: var(--base-red);
  }
}

.quick-fill-row {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  margin-top: var(--sp-sm);
}

.quick-fill-hint {
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}

// Bank AutoComplete full width
:deep(.bank-ac) {
  width: 100%;

  .p-autocomplete-input {
    width: 100%;
    border: 1px solid #ced4da;
    border-radius: 4px;
    padding: 0.5rem 0.75rem;
    font-size: var(--base-font-size);

    &:focus {
      border-color: var(--base-green);
      box-shadow: 0 0 0 0.2rem rgba(3, 131, 135, 0.25);
      outline: none;
    }
  }
}

// PrimeVue Calendar full width
:deep(.p-calendar) {
  width: 100%;

  .p-inputtext {
    width: 100%;
    border: 1px solid #ced4da;
    border-radius: 4px;
    padding: 0.5rem 0.75rem;
    font-size: var(--base-font-size);

    &:focus {
      border-color: var(--base-green);
      box-shadow: 0 0 0 0.2rem rgba(3, 131, 135, 0.25);
      outline: none;
    }
  }
}
</style>
