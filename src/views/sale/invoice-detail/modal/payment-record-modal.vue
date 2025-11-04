<template>
  <div>
    <modal :showModal="isShowModal" @closeModal="closeModal" :width="'700px'">
      <template v-slot:content>
        <div class="payment-record-container">
          <div class="">
            <!-- Modal Header -->
            <div class="title-text-lg-bg">
              <i class="bi bi-cash-coin mr-2"></i>
              <span>บันทึกการเก็บเงิน</span>
            </div>

            <div class="p-3">
              <!-- Payment Information -->
              <div class="filter-container mb-2">
                <div class="title-text-lg mb-2">
                  <i class="bi bi-receipt mr-2"></i>ข้อมูลการชำระเงิน
                </div>
                <div class="p-3">
                  <!-- Payment Date -->
                  <div class="form-group mb-3">
                    <label class="form-label required">
                      <i class="bi bi-calendar-event mr-1"></i>วันที่จ่ายเงิน
                    </label>
                    <Calendar
                      v-model="paymentData.paymentDate"
                      dateFormat="dd/mm/yy"
                      placeholder="เลือกวันที่"
                      showIcon
                      :showButtonBar="true"
                      class="w-100"
                    />
                  </div>

                  <!-- Payment Amount -->
                  <div class="form-group mb-3">
                    <label class="form-label required">
                      <i class="bi bi-currency-exchange mr-1"></i>ยอดเงิน ({{
                        invoiceData.currencyUnit || 'THB'
                      }})
                    </label>
                    <input
                      v-model.number="paymentData.amount"
                      type="number"
                      class="form-control"
                      placeholder="กรอกยอดเงิน"
                      step="0.01"
                      min="0"
                    />
                    <small class="form-text text-muted">
                      ยอดคงเหลือ: {{ formatNumber(remainingAmount) }}
                      {{ invoiceData.currencyUnit || 'THB' }}
                    </small>
                  </div>

                  <!-- Payment Method -->
                  <div class="form-group mb-3">
                    <label class="form-label required">
                      <i class="bi bi-credit-card mr-1"></i>วิธีการชำระเงิน
                    </label>
                    <Dropdown
                      v-model="paymentData.paymentMethod"
                      :options="paymentMethods"
                      optionLabel="name"
                      optionValue="value"
                      placeholder="-- เลือกวิธีการชำระ --"
                      class="w-100"
                    />
                  </div>

                  <!-- Reference Number -->
                  <div class="form-group mb-3">
                    <label class="form-label">
                      <i class="bi bi-hash mr-1"></i>เลขที่อ้างอิง / หมายเลขธุรกรรม
                    </label>
                    <input
                      v-model="paymentData.referenceNumber"
                      type="text"
                      class="form-control"
                      placeholder="กรอกเลขที่อ้างอิง (ถ้ามี)"
                    />
                  </div>

                  <!-- Remark -->
                  <div class="form-group mb-3">
                    <label class="form-label">
                      <i class="bi bi-chat-left-text mr-1"></i>หมายเหตุ
                    </label>
                    <textarea
                      v-model="paymentData.remark"
                      class="form-control"
                      rows="3"
                      placeholder="กรอกหมายเหตุ (ถ้ามี)"
                    ></textarea>
                  </div>
                </div>
              </div>

              <!-- Upload Receipt Image -->
              <div class="filter-container mb-2">
                <div class="title-text-lg mb-2">
                  <i class="bi bi-image mr-2"></i>หลักฐานการชำระเงิน
                </div>
                <div class="p-3">
                  <UploadImage
                    hight="400px"
                    :reset="resetUpload"
                    @onImportFile="onUploadImage"
                  />
                  <small class="form-text text-muted mt-2">
                    * รองรับไฟล์: JPG, PNG (รูปภาพจะถูกบีบอัดอัตโนมัติ)
                  </small>
                </div>
              </div>

              <!-- Info Container -->
              <div class="filter-container-search mb-2">
                <div class="p-2">
                  <div class="d-flex align-items-start">
                    <i class="bi bi-info-circle text-info mr-2" style="font-size: 1.2rem"></i>
                    <div>
                      <p class="mb-0" style="font-size: 0.9rem; color: #6c757d">
                        <i class="bi bi-receipt mr-1"></i>Invoice:
                        <strong>{{ invoiceData.invoiceNumber }}</strong>
                      </p>
                      <p class="mb-0 mt-1" style="font-size: 0.9rem; color: #6c757d">
                        <i class="bi bi-cash-stack mr-1"></i>ยอด Invoice:
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
                  <button class="btn btn-green mr-2" type="button" @click="onSavePayment">
                    <i class="bi bi-check-circle mr-1"></i>
                    บันทึก
                  </button>

                  <button class="btn btn-secondary" type="button" @click="closeModal">
                    <i class="bi bi-x-circle mr-1"></i>
                    ยกเลิก
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
import Calendar from 'primevue/calendar'
import Dropdown from 'primevue/dropdown'
import UploadImage from '@/components/prime-vue/UploadImage.vue'
import { warning, success } from '@/services/alert/sweetAlerts.js'
import dayjs from 'dayjs'

const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))

export default {
  name: 'PaymentRecordModal',

  components: {
    modal,
    Calendar,
    Dropdown,
    UploadImage
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
      paymentData: {
        paymentDate: new Date(),
        amount: 0,
        paymentMethod: null,
        paymentId: null,
        referenceNumber: '',
        remark: '',
        receiptImage: null
      },
      paymentMethods: [
        { name: 'เงินสด (Cash)', value: 'cash', id: 1 },
        { name: 'โอนเงิน (Transfer)', value: 'transfer', id: 2 },
        { name: 'เช็ค (Cheque)', value: 'cheque', id: 3 },
        { name: 'บัตรเครดิต (Credit Card)', value: 'credit_card', id: 4 },
        { name: 'เครดิต (Credit Term)', value: 'credit_term', id: 5 }
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
        const selected = this.paymentMethods.find((m) => m.value === newValue)
        this.paymentData.paymentId = selected ? selected.id : null
      }
    }
  },

  methods: {
    initializePaymentData() {
      // Reset payment data
      this.paymentData = {
        paymentDate: new Date(),
        amount: this.remainingAmount > 0 ? this.remainingAmount : 0,
        paymentMethod: null,
        referenceNumber: '',
        remark: '',
        receiptImage: null
      }
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
        // Compress image
        const compressedFile = await this.compressImage(file)
        this.compressedImage = compressedFile
        this.paymentData.receiptImage = file.name

        console.log('Original size:', (file.size / 1024).toFixed(2), 'KB')
        console.log('Compressed size:', (compressedFile.size / 1024).toFixed(2), 'KB')
      } catch (err) {
        console.error('Error compressing image:', err)
        warning('ไม่สามารถบีบอัดรูปภาพได้', 'เกิดข้อผิดพลาด')
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

    closeModal() {
      this.$emit('close-modal')
    },

    async onSavePayment() {
      // Validate data
      if (!this.paymentData.paymentDate) {
        warning('กรุณาเลือกวันที่จ่ายเงิน', 'ข้อมูลไม่ครบถ้วน')
        return
      }

      if (!this.paymentData.amount || this.paymentData.amount <= 0) {
        warning('กรุณากรอกยอดเงินที่ถูกต้อง', 'ข้อมูลไม่ครบถ้วน')
        return
      }

      // if (this.paymentData.amount > this.remainingAmount) {
      //   warning(
      //     `ยอดเงินที่กรอกเกินยอดคงเหลือ (${this.formatNumber(this.remainingAmount)})`,
      //     'ยอดเงินไม่ถูกต้อง'
      //   )
      //   return
      // }

      if (!this.paymentData.paymentMethod) {
        warning('กรุณาเลือกวิธีการชำระเงิน', 'ข้อมูลไม่ครบถ้วน')
        return
      }

      // Normalize date to start of day
      const normalizedDate = new Date(this.paymentData.paymentDate)
      normalizedDate.setHours(0, 0, 0, 0)

      // Get payment method name from selected option
      const selectedPayment = this.paymentMethods.find(
        (m) => m.value === this.paymentData.paymentMethod
      )

      // Prepare payment data to emit (matches backend Request model)
      const paymentDataToEmit = {
        invoiceNumber: this.invoiceData.invoiceNumber,
        paymentDate: normalizedDate,
        amount: this.paymentData.amount,
        payment: this.paymentData.paymentId, // Payment method ID (int)
        paymentName: selectedPayment ? selectedPayment.name : '', // Payment method name (string)
        referenceNumber: this.paymentData.referenceNumber || null,
        remark: this.paymentData.remark || null,
        receiptImage: this.compressedImage // Send compressed image file
      }

      console.log('Saving payment:', paymentDataToEmit)

      this.$emit('save-payment', paymentDataToEmit)
      success('บันทึกการเก็บเงินสำเร็จ', 'บันทึกสำเร็จ')
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

// PrimeVue Dropdown full width
// :deep(.p-dropdown) {
//   width: 100%;

//   .p-dropdown-label {
//     //border: 1px solid #ced4da;
//     //border-radius: 4px;
//     padding: 0.5rem 0.75rem;
//     font-size: var(--base-font-size);
//   }

//   &.p-focus {
//     .p-dropdown-label {
//       border-color: var(--base-green);
//       box-shadow: 0 0 0 0.2rem rgba(3, 131, 135, 0.25);
//     }
//   }
// }
</style>
