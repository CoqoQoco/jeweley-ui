<template>
  <div>
    <modal :showModal="isShowModal" @closeModal="closeModal" :width="'600px'">
      <template v-slot:content>
        <div class="invoice-confirm-excel-container">
          <div class="">
            <!-- Modal Header -->
            <div class="title-text-lg-bg">
              <i class="bi bi-file-earmark-excel mr-2"></i>
              <span>ยืนยันการ Export Excel</span>
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
                      v-model="exportData.invoiceNumber"
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
                      v-model="exportData.invoiceDate"
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
                </div>
              </div>

              <!-- Info Container -->
              <div class="filter-container-search mb-2">
                <div class="p-2">
                  <div class="d-flex align-items-start">
                    <i class="bi bi-info-circle text-info mr-2" style="font-size: 1.2rem"></i>
                    <div>
                      <p class="mb-1" style="font-size: 0.9rem; color: #6c757d">
                        การเปลี่ยนแปลงข้อมูลนี้จะมีผลเฉพาะกับเอกสาร Excel ที่ Export เท่านั้น
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
                  <button class="btn btn-green mr-2" type="button" @click="onConfirmExport">
                    <i class="bi bi-file-earmark-excel mr-1"></i>
                    Export Excel
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
  name: 'InvoiceConfirmExcelModal',

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

  emits: ['close-modal', 'confirm-export'],

  data() {
    return {
      originalData: {
        invoiceNumber: '',
        invoiceDate: ''
      },
      exportData: {
        invoiceNumber: '',
        invoiceDate: ''
      }
    }
  },

  watch: {
    isShowModal: {
      handler(newVal) {
        if (newVal) {
          this.initializeExportData()
        }
      },
      immediate: true
    }
  },

  methods: {
    initializeExportData() {
      // Store original data
      this.originalData = {
        invoiceNumber: this.invoiceData.invoiceNumber || '',
        invoiceDate: this.invoiceData.invoiceDate || ''
      }

      // Initialize export data
      // Invoice Number: use original value
      // Invoice Date: default to today's date
      this.exportData = {
        invoiceNumber: this.invoiceData.invoiceNumber || '',
        invoiceDate: new Date() // Default to current date
      }
    },

    formatDate(date) {
      if (!date) return '-'
      return dayjs(date).format('DD/MM/YYYY')
    },

    closeModal() {
      this.$emit('close-modal')
    },

    onConfirmExport() {
      // Validate data
      if (!this.exportData.invoiceNumber || !this.exportData.invoiceNumber.trim()) {
        warning('กรุณากรอก Invoice Number', 'ข้อมูลไม่ครบถ้วน')
        return
      }

      if (!this.exportData.invoiceDate) {
        warning('กรุณาเลือก Invoice Date', 'ข้อมูลไม่ครบถ้วน')
        return
      }

      // Normalize date to start of day (remove time component)
      const normalizedDate = new Date(this.exportData.invoiceDate)
      normalizedDate.setHours(0, 0, 0, 0)

      // Emit confirm event with export data
      // IMPORTANT: Put modified values AFTER spreading invoiceData to override them
      const exportDataToEmit = {
        ...this.invoiceData,
        invoiceNumber: this.exportData.invoiceNumber.trim(), // Override with modified value
        invoiceDate: normalizedDate // Override with normalized date (time = 00:00:00)
      }

      this.$emit('confirm-export', exportDataToEmit)
      this.closeModal()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form';

.invoice-confirm-excel-container {
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
