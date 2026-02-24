<template>
  <div>
    <modal :showModal="isShowModal" @closeModal="closeModal" :width="'600px'">
      <template v-slot:content>
        <div class="invoice-confirm-print-container">
          <div class="">
            <!-- Modal Header -->
            <div class="title-text-lg-bg">
              <i class="bi bi-printer mr-2"></i>
              <span>ยืนยันการพิมพ์เอกสาร</span>
            </div>

            <div class="p-3">
              <!-- Form Container -->
              <div class="filter-container mb-2">
                <div class="title-text-lg mb-2">
                  <i class="bi bi-file-text mr-2"></i>ข้อมูลเอกสาร
                </div>
                <div class="p-3">
                  <div class="form-group mb-3">
                    <label class="form-label">
                      <i class="bi bi-hash mr-1"></i>Invoice Number
                    </label>
                    <input
                      v-model="printData.invoiceNumber"
                      type="text"
                      class="form-control"
                      placeholder="เลขที่ใบแจ้งหนี้"
                    />
                    <small class="form-text text-muted">
                      ค่าเดิม: {{ originalData.invoiceNumber }}
                    </small>
                  </div>

                  <div class="form-group mb-3">
                    <label class="form-label">
                      <i class="bi bi-calendar-event mr-1"></i>Invoice Date
                    </label>
                    <Calendar
                      v-model="printData.invoiceDate"
                      dateFormat="dd/mm/yy"
                      placeholder="เลือกวันที่"
                      showIcon
                      :showButtonBar="true"
                      class="w-100"
                    />
                    <small class="form-text text-muted">
                      ค่าเดิม: {{ formatDate(originalData.invoiceDate) }}
                    </small>
                  </div>

                  <div class="form-group mb-3">
                    <div class="d-flex align-items-center" style="gap: 8px; cursor: pointer" @click="printData.showCifLabel = !printData.showCifLabel">
                      <input
                        id="invoiceCifLabelInput"
                        type="checkbox"
                        v-model="printData.showCifLabel"
                        style="width: 16px; height: 16px; cursor: pointer"
                      />
                      <label class="form-label mb-0" for="invoiceCifLabelInput" style="cursor: pointer">
                        <i class="bi bi-tag mr-1"></i>แสดงป้าย C.I.F
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Info Container -->
              <div class="filter-container-search mb-2">
                <div class="p-2">
                  <div class="d-flex align-items-start">
                    <i class="bi bi-info-circle text-info mr-2" style="font-size: 1.2rem"></i>
                    <div>
                      <p class="mb-1" style="font-size: 0.9rem; color: #6c757d">
                        การเปลี่ยนแปลงข้อมูลนี้จะมีผลเฉพาะกับเอกสารที่พิมพ์เท่านั้น
                      </p>
                      <p class="mb-0" style="font-size: 0.9rem; color: #6c757d">
                        ข้อมูลต้นฉบับในระบบจะไม่มีการเปลี่ยนแปลง
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="btn-submit-container mb-2">
                <div class="d-flex justify-content-end">
                  <button class="btn btn-green mr-2" type="button" @click="onConfirmPrint">
                    <i class="bi bi-printer mr-1"></i>
                    พิมพ์เอกสาร
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
import { warning } from '@/services/alert/sweetAlerts.js'
import dayjs from 'dayjs'

const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))

export default {
  name: 'InvoiceConfirmPrintModal',

  components: {
    modal,
    Calendar
  },

  props: {
    isShowModal: {
      type: Boolean,
      default: false
    },
    invoiceData: {
      type: Object,
      default: () => ({})
    }
  },

  emits: ['close-modal', 'confirm-print'],

  data() {
    return {
      originalData: {
        invoiceNumber: '',
        invoiceDate: ''
      },
      printData: {
        invoiceNumber: '',
        invoiceDate: '',
        showCifLabel: true
      }
    }
  },

  watch: {
    isShowModal: {
      handler(newVal) {
        if (newVal) {
          this.initializePrintData()
        }
      },
      immediate: true
    }
  },

  methods: {
    initializePrintData() {
      // Store original data
      this.originalData = {
        invoiceNumber: this.invoiceData.invoiceNumber || '',
        invoiceDate: this.invoiceData.invoiceDate || ''
      }

      // Initialize print data
      // Invoice Number: use original value
      // Invoice Date: default to today's date
      this.printData = {
        invoiceNumber: this.invoiceData.invoiceNumber || '',
        invoiceDate: new Date(), // Default to current date
        showCifLabel: true
      }
    },

    formatDate(date) {
      if (!date) return '-'
      return dayjs(date).format('DD/MM/YYYY')
    },

    closeModal() {
      this.$emit('close-modal')
    },

    onConfirmPrint() {
      // Validate data
      if (!this.printData.invoiceNumber || !this.printData.invoiceNumber.trim()) {
        warning('กรุณากรอก Invoice Number', 'ข้อมูลไม่ครบถ้วน')
        return
      }

      if (!this.printData.invoiceDate) {
        warning('กรุณาเลือก Invoice Date', 'ข้อมูลไม่ครบถ้วน')
        return
      }

      // Normalize date to start of day (remove time component)
      const normalizedDate = new Date(this.printData.invoiceDate)
      normalizedDate.setHours(0, 0, 0, 0)

      // Debug: Log data before emit
      console.log('Modal - Original invoiceDate:', this.printData.invoiceDate)
      console.log('Modal - Normalized invoiceDate:', normalizedDate)
      console.log('Modal - invoiceNumber:', this.printData.invoiceNumber)

      // Emit confirm event with print data
      // IMPORTANT: Put modified values AFTER spreading invoiceData to override them
      const printDataToEmit = {
        ...this.invoiceData,
        invoiceNumber: this.printData.invoiceNumber.trim(), // Override with modified value
        invoiceDate: normalizedDate, // Override with normalized date (time = 00:00:00)
        showCifLabel: this.printData.showCifLabel
      }

      console.log('Modal - Emitting printDataToEmit:', printDataToEmit)

      this.$emit('confirm-print', printDataToEmit)
      this.closeModal()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form';

.invoice-confirm-print-container {
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
}

.form-control {
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
</style>
