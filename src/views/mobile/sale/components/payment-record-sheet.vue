<template>
  <Teleport to="body">
    <div v-if="visible" class="payment-record-overlay">
      <div class="payment-record-container">
        <div class="payment-record-header">
          <button type="button" class="btn-close-modal" @click="onClose">
            <i class="bi bi-x-lg"></i>
          </button>
          <h3 class="payment-record-title">
            <i class="bi bi-cash-coin"></i>
            {{ $t('view.mobile.sale.invoicePaymentSheetTitle') }}
          </h3>
        </div>

        <div class="payment-record-body">
          <div class="outstanding-card">
            <span class="outstanding-label">{{ $t('view.mobile.sale.invoicePaymentSheetOutstandingLabel') }}</span>
            <span class="outstanding-value">{{ formatCurrency(outstandingAmount) }} {{ currencyUnit }}</span>
          </div>

          <FormFieldGeneric :label="$t('view.mobile.sale.invoicePaymentSheetDateLabel')" :required="true">
            <CalendarGeneric
              v-model="paymentData.paymentDate"
              dateFormat="dd/mm/yy"
              :placeholder="$t('view.mobile.sale.invoicePaymentSheetDatePlaceholder')"
              :showIcon="true"
              :showButtonBar="true"
            />
          </FormFieldGeneric>

          <FormFieldGeneric :label="$t('view.mobile.sale.invoicePaymentSheetAmountLabel')" :required="true">
            <InputTextGeneric
              v-model="paymentData.amount"
              type="number"
              :min="0"
              step="0.01"
              inputmode="decimal"
              placeholder="0.00"
            />
          </FormFieldGeneric>

          <FormFieldGeneric :label="$t('view.mobile.sale.invoicePaymentSheetMethodLabel')" :required="true">
            <DropdownGeneric
              :modelValue="paymentData.payment"
              :options="paymentMethodOptions"
              optionLabel="name"
              optionValue="code"
              :placeholder="$t('view.mobile.sale.invoicePaymentSheetMethodPlaceholder')"
              @update:modelValue="onPaymentMethodChange"
            />
          </FormFieldGeneric>

          <FormFieldGeneric
            v-if="showBankField"
            :label="$t('view.mobile.sale.invoicePaymentSheetBankLabel')"
            :required="true"
          >
            <DropdownGeneric
              v-model="paymentData.bankCode"
              :options="bankList"
              optionLabel="nameTh"
              optionValue="code"
              :filter="true"
              :placeholder="$t('view.mobile.sale.invoicePaymentSheetBankPlaceholder')"
            />
          </FormFieldGeneric>

          <FormFieldGeneric
            v-if="showBranchField"
            :label="$t('view.mobile.sale.invoicePaymentSheetBranchLabel')"
            :required="true"
          >
            <InputTextGeneric
              v-model.trim="paymentData.bankBranch"
              :placeholder="$t('view.mobile.sale.invoicePaymentSheetBranchPlaceholder')"
            />
          </FormFieldGeneric>

          <FormFieldGeneric :label="$t('view.mobile.sale.invoicePaymentSheetReferenceLabel')">
            <InputTextGeneric
              v-model.trim="paymentData.referenceNumber"
              :placeholder="$t('view.mobile.sale.invoicePaymentSheetReferencePlaceholder')"
            />
          </FormFieldGeneric>

          <FormFieldGeneric :label="$t('view.mobile.sale.invoicePaymentSheetRemarkLabel')">
            <TextareaGeneric
              v-model="paymentData.remark"
              :rows="3"
              :placeholder="$t('view.mobile.sale.invoicePaymentSheetRemarkPlaceholder')"
            />
          </FormFieldGeneric>

          <FormFieldGeneric :label="$t('view.mobile.sale.invoicePaymentSheetImageLabel')">
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              capture="environment"
              style="display: none"
              @change="onFileChange"
            />
            <div v-if="!imagePreview" class="image-capture-btn" @click="triggerCamera">
              <i class="bi bi-camera"></i>
              <span>{{ $t('view.mobile.sale.invoicePaymentSheetCaptureBtn') }}</span>
            </div>
            <div v-else class="image-preview-box">
              <img :src="imagePreview" alt="receipt" class="image-preview" />
              <button type="button" class="btn-clear-image" @click="clearImage">
                <i class="bi bi-x-circle"></i>
                {{ $t('view.mobile.sale.invoicePaymentSheetRemoveImageBtn') }}
              </button>
            </div>
          </FormFieldGeneric>
        </div>

        <div class="payment-record-footer">
          <ButtonGeneric
            variant="main"
            icon="bi-check-circle"
            :label="$t('common.btn.save')"
            :block="true"
            @click="onSave"
          />
          <ButtonGeneric variant="outline" :label="$t('common.btn.cancel')" :block="true" @click="onClose" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
import { useMasterBankStore } from '@/stores/modules/api/master/master-bank-store.js'
import { warning } from '@/services/alert/sweetAlerts.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { compressImage } from '@/services/utils/image-compress.js'
import { PAYMENT_METHODS } from '@/constants/payment-methods.js'

import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import TextareaGeneric from '@/components/generic/TextareaGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import CalendarGeneric from '@/components/prime-vue/CalendarGeneric.vue'

// key ป้ายวิธีชำระภายใต้ namespace view.mobile.sale — แยกจาก view.mobile.pos ที่ pos-checkout-sheet ใช้
const METHOD_LABEL_KEYS = {
  cash: 'invoicePaymentMethodCash',
  transfer: 'invoicePaymentMethodTransfer',
  cheque: 'invoicePaymentMethodCheque',
  creditCard: 'invoicePaymentMethodCreditCard',
  credit: 'invoicePaymentMethodCredit'
}

function emptyPaymentData(defaultAmount) {
  const amount = Number(defaultAmount) || 0
  return {
    paymentDate: new Date(),
    amount: amount > 0 ? amount.toFixed(2) : '',
    payment: null,
    bankCode: null,
    bankBranch: '',
    referenceNumber: '',
    remark: ''
  }
}

export default {
  name: 'PaymentRecordSheet',

  components: {
    FormFieldGeneric,
    InputTextGeneric,
    TextareaGeneric,
    ButtonGeneric,
    DropdownGeneric,
    CalendarGeneric
  },

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    invoiceNumber: {
      type: String,
      default: ''
    },
    outstandingAmount: {
      type: Number,
      default: 0
    },
    currencyUnit: {
      type: String,
      default: 'THB'
    }
  },

  emits: ['close', 'save-payment'],

  setup() {
    const masterBankStore = useMasterBankStore()
    return { masterBankStore }
  },

  data() {
    return {
      bankList: [],
      paymentData: emptyPaymentData(this.outstandingAmount),
      compressedImage: null,
      imagePreview: null
    }
  },

  computed: {
    paymentMethodOptions() {
      return PAYMENT_METHODS.map((m) => ({
        code: m.code,
        key: m.key,
        name: this.$t(`view.mobile.sale.${METHOD_LABEL_KEYS[m.key]}`)
      }))
    },

    showBankField() {
      return this.paymentData.payment === 2 || this.paymentData.payment === 3
    },

    showBranchField() {
      return this.paymentData.payment === 3
    }
  },

  watch: {
    // เปิด sheet รอบใหม่ (false → true) = เริ่มบันทึกรับเงินใหม่ ต้องรีเซ็ตฟอร์มเก่าทิ้ง
    visible(newVal) {
      if (newVal) {
        this.paymentData = emptyPaymentData(this.outstandingAmount)
        this.clearImage()
      }
    }
  },

  async mounted() {
    const response = await this.masterBankStore.fetchBankList()
    this.bankList = response || []
  },

  beforeUnmount() {
    this.clearImage()
  },

  methods: {
    // สลับวิธีชำระต้องล้าง bankCode/bankBranch ที่ไม่เกี่ยวข้องกับวิธีใหม่ทิ้ง
    // ไม่งั้นค่าธนาคาร/สาขาของวิธีเก่าจะค้างและถูกส่งไปกับ FormData ของวิธีใหม่แบบเงียบๆ
    // (เช่น เลือกโอน+ธนาคารแล้วเปลี่ยนเป็นเงินสด → bankCode ยังติดไปกับ payload เงินสด)
    onPaymentMethodChange(value) {
      this.paymentData.payment = value
      if (value !== 2 && value !== 3) {
        this.paymentData.bankCode = null
      }
      if (value !== 3) {
        this.paymentData.bankBranch = ''
      }
    },

    triggerCamera() {
      this.$refs.fileInput.click()
    },

    async onFileChange(event) {
      const file = event.target.files[0]
      event.target.value = ''
      if (!file) return

      this.compressedImage = await compressImage(file)
      if (this.imagePreview) {
        URL.revokeObjectURL(this.imagePreview)
      }
      this.imagePreview = URL.createObjectURL(this.compressedImage)
    },

    clearImage() {
      if (this.imagePreview) {
        URL.revokeObjectURL(this.imagePreview)
      }
      this.imagePreview = null
      this.compressedImage = null
    },

    validate() {
      if (!this.paymentData.paymentDate) {
        return this.$t('view.mobile.sale.invoicePaymentSheetWarnDateRequired')
      }

      const amount = Number(this.paymentData.amount) || 0
      if (amount <= 0) {
        return this.$t('view.mobile.sale.invoicePaymentSheetWarnAmountRequired')
      }

      if (!this.paymentData.payment) {
        return this.$t('view.mobile.sale.invoicePaymentSheetWarnMethodRequired')
      }

      if ((this.paymentData.payment === 2 || this.paymentData.payment === 3) && !this.paymentData.bankCode) {
        return this.$t('view.mobile.sale.invoicePaymentSheetWarnBankRequired')
      }

      if (this.paymentData.payment === 3 && !this.paymentData.bankBranch) {
        return this.$t('view.mobile.sale.invoicePaymentSheetWarnBranchRequired')
      }

      return null
    },

    onSave() {
      const errorMsg = this.validate()
      if (errorMsg) {
        warning(errorMsg)
        return
      }

      const amount = Number(this.paymentData.amount) || 0

      if (amount > this.outstandingAmount) {
        confirmThenSubmit(
          this.$t('view.mobile.sale.invoicePaymentSheetConfirmOverpayMsg', {
            amount: this.formatCurrency(amount),
            outstanding: this.formatCurrency(this.outstandingAmount),
            unit: this.currencyUnit
          }),
          this.$t('view.mobile.sale.invoicePaymentSheetConfirmOverpayTitle'),
          () => this.emitSave(amount)
        )
        return
      }

      this.emitSave(amount)
    },

    emitSave(amount) {
      const method = this.paymentMethodOptions.find((m) => m.code === this.paymentData.payment)

      this.$emit('save-payment', {
        invoiceNumber: this.invoiceNumber,
        paymentDate: new Date(this.paymentData.paymentDate),
        amount,
        payment: this.paymentData.payment,
        paymentName: method ? method.name : '',
        bankCode: this.paymentData.bankCode || null,
        bankBranch: this.paymentData.bankBranch || null,
        referenceNumber: this.paymentData.referenceNumber || null,
        remark: this.paymentData.remark || null,
        receiptImage: this.compressedImage
      })
    },

    onClose() {
      this.$emit('close')
    },

    formatCurrency(value) {
      if (value === null || value === undefined) return '0.00'
      return new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(Number(value))
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/mobile';

.payment-record-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #f5f5f5;
  z-index: 1100;
  display: flex;
  flex-direction: column;
}

.payment-record-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.payment-record-header {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  padding: var(--sp-sm) var(--sp-md);
  padding-top: calc(var(--sp-sm) + env(safe-area-inset-top, 0px));
  background: var(--color-card-bg);
  border-bottom: 1px solid var(--color-border);

  .btn-close-modal {
    background: none;
    border: none;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
    font-size: 1.1rem;
    cursor: pointer;

    &:active {
      background: #f0f0f0;
    }
  }

  .payment-record-title {
    display: flex;
    align-items: center;
    gap: var(--sp-xs);
    font-size: 1rem;
    font-weight: 600;
    color: #333;
    margin: 0;

    i {
      color: var(--base-font-color);
    }
  }
}

.payment-record-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--sp-md);
  display: flex;
  flex-direction: column;
  gap: var(--sp-md);
}

.outstanding-card {
  background: var(--base-font-color);
  border-radius: var(--radius-md);
  padding: var(--sp-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;

  .outstanding-label {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.8);
  }

  .outstanding-value {
    font-size: 1.6rem;
    font-weight: 700;
    color: #fff;
  }
}

.image-capture-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-xs);
  min-height: 48px;
  padding: var(--sp-sm) var(--sp-md);
  border-radius: var(--radius-md);
  border: 1.5px dashed var(--color-border);
  background: var(--color-card-bg);
  color: var(--base-font-color);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;

  &:active {
    background: var(--color-highlight-bg);
  }
}

.image-preview-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-sm);

  .image-preview {
    width: 100%;
    max-height: 240px;
    object-fit: contain;
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border);
  }

  .btn-clear-image {
    display: flex;
    align-items: center;
    gap: 4px;
    background: none;
    border: none;
    color: var(--base-red);
    font-size: 0.85rem;
    padding: 4px;
    cursor: pointer;
  }
}

.payment-record-footer {
  display: flex;
  flex-direction: column;
  gap: var(--sp-sm);
  padding: var(--sp-md);
  padding-bottom: calc(var(--sp-md) + env(safe-area-inset-bottom, 0px));
  background: var(--color-card-bg);
  border-top: 1px solid var(--color-border);

  :deep(.btn) {
    min-height: 52px;
    font-size: 1.05rem;
  }
}
</style>
