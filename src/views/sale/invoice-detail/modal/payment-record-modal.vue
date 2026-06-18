<template>
  <div>
    <modal :showModal="isShowModal" @closeModal="closeModal" :width="'700px'">
      <template v-slot:content>
        <div class="payment-record-container">
          <div class="">
            <!-- Modal Header -->
            <div class="title-text-lg-bg">
              <i class="bi bi-cash-coin mr-2"></i>
              <span>{{ $t('view.sale.invoiceDetail.recordPaymentTitle') }}</span>
            </div>

            <div class="p-3">
              <!-- Payment Information -->
              <div class="filter-container mb-2">
                <div class="title-text-lg mb-2">
                  <i class="bi bi-receipt mr-2"></i>{{ $t('view.sale.invoiceDetail.paymentInfo') }}
                </div>
                <div class="p-3">
                  <!-- Payment Date -->
                  <div class="form-group mb-3">
                    <label class="form-label required">
                      <i class="bi bi-calendar-event mr-1"></i>{{ $t('view.sale.invoiceDetail.paymentDate') }}
                    </label>
                    <CalendarGeneric
                      v-model="paymentData.paymentDate"
                      dateFormat="dd/mm/yy"
                      :placeholder="$t('view.sale.invoiceDetail.placeholder.paymentDate')"
                      :showIcon="true"
                      :showButtonBar="true"
                      class="w-100"
                    />
                  </div>

                  <!-- Payment Amount -->
                  <div class="form-group mb-3">
                    <label class="form-label required">
                      <i class="bi bi-currency-exchange mr-1"></i>{{ $t('view.sale.invoiceDetail.amount') }} ({{ invoiceData.currencyUnit || 'THB' }})
                    </label>
                    <InputTextGeneric
                      v-model="paymentData.amount"
                      type="number"
                      placeholder="0.00"
                      :step="0.01"
                      :min="0"
                    />
                    <small class="form-text text-muted">
                      {{ $t('view.sale.invoiceDetail.remaining') }}: {{ formatNumber(remainingAmount) }}
                      {{ invoiceData.currencyUnit || 'THB' }}
                    </small>
                  </div>

                  <!-- Payment Method -->
                  <div class="form-group mb-3">
                    <label class="form-label required">
                      <i class="bi bi-credit-card mr-1"></i>{{ $t('view.sale.invoiceDetail.paymentMethod') }}
                    </label>
                    <DropdownGeneric
                      v-model="paymentData.paymentMethod"
                      :options="paymentMethods"
                      optionLabel="name"
                      optionValue="value"
                      :placeholder="$t('view.sale.invoiceDetail.placeholder.paymentMethod')"
                      class="w-100"
                    />
                  </div>

                  <!-- Bank Dropdown (Transfer & Cheque) -->
                  <div
                    v-if="paymentData.paymentId === 2 || paymentData.paymentId === 3"
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

                  <!-- Branch Input (Cheque only) -->
                  <div v-if="paymentData.paymentId === 3" class="form-group mb-3">
                    <label class="form-label required">
                      <i class="bi bi-geo-alt mr-1"></i>{{ $t('view.sale.invoiceDetail.branch') }}
                    </label>
                    <InputTextGeneric
                      v-model="paymentData.bankBranch"
                      :placeholder="$t('view.sale.invoiceDetail.branch')"
                    />
                  </div>

                  <!-- Reference Number -->
                  <div class="form-group mb-3">
                    <label class="form-label">
                      <i class="bi bi-hash mr-1"></i>{{ $t('view.sale.invoiceDetail.referenceNumber') }}
                    </label>
                    <InputTextGeneric
                      v-model="paymentData.referenceNumber"
                      :placeholder="$t('view.sale.invoiceDetail.referenceNumber')"
                    />
                  </div>

                  <!-- Remark -->
                  <div class="form-group mb-3">
                    <label class="form-label">
                      <i class="bi bi-chat-left-text mr-1"></i>{{ $t('common.field.remark') }}
                    </label>
                    <textarea
                      v-model="paymentData.remark"
                      class="form-control"
                      rows="3"
                      :placeholder="$t('view.sale.invoiceDetail.placeholder.remark')"
                    ></textarea>
                  </div>
                </div>
              </div>

              <!-- Upload Receipt Image -->
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

              <!-- Info Container -->
              <div class="filter-container-search mb-2">
                <div class="p-2">
                  <div class="d-flex align-items-start">
                    <i class="bi bi-info-circle text-info mr-2 info-icon"></i>
                    <div>
                      <p class="mb-0 info-text">
                        <i class="bi bi-receipt mr-1"></i>Invoice:
                        <strong>{{ invoiceData.invoiceNumber }}</strong>
                      </p>
                      <p class="mb-0 mt-1 info-text">
                        <i class="bi bi-cash-stack mr-1"></i>{{ $t('view.sale.invoiceDetail.invoiceAmount') }}:
                        <strong
                          >{{ formatNumber(invoiceData.grandTotal) }}
                          {{ invoiceData.currencyUnit || 'THB' }}</strong
                        >
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="btn-submit-container mb-2">
                <div class="d-flex justify-content-end">
                  <button class="btn btn-main mr-2" type="button" @click="onSavePayment">
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
import { warning, success } from '@/services/alert/sweetAlerts.js'
import { useMasterBankStore } from '@/stores/modules/api/master/master-bank-store.js'
import dayjs from 'dayjs'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

export default {
  name: 'PaymentRecordModal',

  components: {
    modal,
    CalendarGeneric,
    DropdownGeneric,
    UploadImage,
    AutoCompleteGeneric,
    InputTextGeneric
  },

  props: {
    isShowModal: {
      type: Boolean,
      default: false
    },
    invoiceData: {
      type: Object,
      default: () => ({})
    },
    paidAmount: {
      type: Number,
      default: 0
    }
  },

  emits: ['close-modal', 'save-payment'],

  data() {
    return {
      masterBankStore: useMasterBankStore(),
      bankList: [],
      selectedBank: null,
      paymentData: {
        paymentDate: new Date(),
        amount: 0,
        paymentMethod: null,
        paymentId: null,
        bankCode: null,
        bankBranch: '',
        referenceNumber: '',
        remark: '',
        receiptImage: null
      },
      paymentMethodsData: [
        { value: 'cash', id: 1, key: 'cash' },
        { value: 'transfer', id: 2, key: 'transfer' },
        { value: 'cheque', id: 3, key: 'cheque' },
        { value: 'credit_card', id: 4, key: 'creditCard' },
        { value: 'credit_term', id: 5, key: 'creditTerm' }
      ],
      resetUpload: false,
      compressedImage: null
    }
  },

  computed: {
    remainingAmount() {
      const total = this.invoiceData.grandTotal || 0
      const paid = this.paidAmount || 0
      return total - paid
    },

    paymentMethods() {
      return this.paymentMethodsData.map((m) => ({
        ...m,
        name: this.$t(`view.sale.invoiceDetail.paymentMethods.${m.key}`)
      }))
    }
  },

  watch: {
    isShowModal: {
      handler(newVal) {
        if (newVal) {
          this.initializePaymentData()
        }
      },
      immediate: true
    },
    'paymentData.paymentMethod': {
      handler(newValue) {
        const selected = this.paymentMethodsData.find((m) => m.value === newValue)
        this.paymentData.paymentId = selected ? selected.id : null
        this.paymentData.bankCode = null
        this.paymentData.bankBranch = ''
        this.selectedBank = null
      }
    }
  },

  async mounted() {
    const response = await this.masterBankStore.fetchBankList()
    this.bankList = response || []
  },

  methods: {
    initializePaymentData() {
      this.paymentData = {
        paymentDate: new Date(),
        amount: this.remainingAmount > 0 ? this.remainingAmount : 0,
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
    },

    formatDate(date) {
      if (!date) return '-'
      return dayjs(date).format('DD/MM/YYYY')
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
        const compressedFile = await this.compressImage(file)
        this.compressedImage = compressedFile
        this.paymentData.receiptImage = file.name
      } catch (err) {
        warning(this.$t('view.sale.invoiceDetail.validation.compressError'))
      }
    },

    async compressImage(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = (event) => {
          const img = new Image()
          img.src = event.target.result

          img.onload = () => {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')

            // Set max width/height for compression
            const maxWidth = 1200
            const maxHeight = 1200
            let width = img.width
            let height = img.height

            // Calculate new dimensions
            if (width > height) {
              if (width > maxWidth) {
                height *= maxWidth / width
                width = maxWidth
              }
            } else {
              if (height > maxHeight) {
                width *= maxHeight / height
                height = maxHeight
              }
            }

            canvas.width = width
            canvas.height = height

            // Draw image on canvas
            ctx.drawImage(img, 0, 0, width, height)

            // Convert canvas to blob with compression
            canvas.toBlob(
              (blob) => {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                })
                resolve(compressedFile)
              },
              'image/jpeg',
              0.7 // Compression quality (0-1)
            )
          }

          img.onerror = reject
        }
        reader.onerror = reject
      })
    },

    onBankChange(value) {
      if (value && typeof value === 'object') {
        this.selectedBank = value
        this.paymentData.bankCode = value.code
      } else {
        this.selectedBank = null
        this.paymentData.bankCode = null
      }
    },

    closeModal() {
      this.$emit('close-modal')
    },

    async onSavePayment() {
      if (!this.paymentData.paymentDate) {
        warning(this.$t('view.sale.invoiceDetail.validation.paymentDateRequired'), this.$t('common.label.incompleteData'))
        return
      }

      if (!this.paymentData.amount || this.paymentData.amount <= 0) {
        warning(this.$t('view.sale.invoiceDetail.validation.amountRequired'), this.$t('common.label.incompleteData'))
        return
      }

      if (!this.paymentData.paymentMethod) {
        warning(this.$t('view.sale.invoiceDetail.validation.paymentMethodRequired'), this.$t('common.label.incompleteData'))
        return
      }

      if (
        (this.paymentData.paymentId === 2 || this.paymentData.paymentId === 3) &&
        !this.paymentData.bankCode
      ) {
        warning(this.$t('view.sale.invoiceDetail.validation.bankRequired'), this.$t('common.label.incompleteData'))
        return
      }

      if (this.paymentData.paymentId === 3 && !this.paymentData.bankBranch) {
        warning(this.$t('view.sale.invoiceDetail.validation.branchRequired'), this.$t('common.label.incompleteData'))
        return
      }

      const normalizedDate = new Date(this.paymentData.paymentDate)
      normalizedDate.setHours(0, 0, 0, 0)

      const selectedPayment = this.paymentMethods.find(
        (m) => m.value === this.paymentData.paymentMethod
      )

      const paymentDataToEmit = {
        invoiceNumber: this.invoiceData.invoiceNumber,
        paymentDate: normalizedDate,
        amount: this.paymentData.amount,
        payment: this.paymentData.paymentId,
        paymentName: selectedPayment ? selectedPayment.name : '',
        bankCode: this.paymentData.bankCode || null,
        bankBranch: this.paymentData.bankBranch || null,
        referenceNumber: this.paymentData.referenceNumber || null,
        remark: this.paymentData.remark || null,
        receiptImage: this.compressedImage
      }

      this.$emit('save-payment', paymentDataToEmit)
      success(this.$t('view.sale.invoiceDetail.success.recordPayment'))
      this.closeModal()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form';

.payment-record-container {
  // Component-specific styles only
}

.info-icon {
  font-size: var(--fs-lg);
}

.info-text {
  font-size: var(--fs-sm);
  color: #6c757d;
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

.form-control,
select.form-control,
textarea.form-control {
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

.form-text {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.875rem;
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
