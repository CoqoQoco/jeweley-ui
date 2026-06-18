<template>
  <div>
    <modal :showModal="isShowModal" @closeModal="closeModal" :width="'600px'">
      <template v-slot:content>
        <div class="invoice-confirm-print-container">
          <div class="">
            <!-- Modal Header -->
            <div class="title-text-lg-bg">
              <i class="bi bi-printer mr-2"></i>
              <span>{{ $t('view.sale.invoiceDetail.confirmPrintTitle') }}</span>
            </div>

            <div class="p-3">
              <!-- Form Container -->
              <div class="filter-container mb-2">
                <div class="title-text-lg mb-2">
                  <i class="bi bi-file-text mr-2"></i>{{ $t('view.sale.invoiceDetail.docInfo') }}
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
                      :placeholder="$t('view.sale.invoiceDetail.invoiceNumberPlaceholder')"
                    />
                    <small class="form-text text-muted">
                      {{ $t('view.sale.invoiceDetail.originalValue') }}: {{ originalData.invoiceNumber }}
                    </small>
                  </div>

                  <div class="form-group mb-3">
                    <label class="form-label">
                      <i class="bi bi-calendar-event mr-1"></i>Invoice Date
                    </label>
                    <CalendarGeneric
                      v-model="printData.invoiceDate"
                      dateFormat="dd/mm/yy"
                      :placeholder="$t('view.sale.invoiceDetail.selectDate')"
                      :showIcon="true"
                      :showButtonBar="true"
                      class="w-100"
                    />
                    <small class="form-text text-muted">
                      {{ $t('view.sale.invoiceDetail.originalValue') }}: {{ formatDate(originalData.invoiceDate) }}
                    </small>
                  </div>

                  <div class="form-group mb-3">
                    <div class="d-flex align-items-center checkbox-row" @click="printData.showCifLabel = !printData.showCifLabel">
                      <input
                        id="invoiceCifLabelInput"
                        type="checkbox"
                        v-model="printData.showCifLabel"
                        class="checkbox-input"
                      />
                      <label class="form-label mb-0 label-clickable" for="invoiceCifLabelInput">
                        <i class="bi bi-tag mr-1"></i>{{ $t('view.sale.invoiceDetail.showCifLabel') }}
                      </label>
                    </div>
                  </div>

                  <div class="form-group mb-3">
                    <label class="form-label">
                      <i class="bi bi-file-earmark mr-1"></i>{{ $t('view.sale.invoiceDetail.paperSize') }}
                    </label>
                    <div class="paper-size-options">
                      <label class="paper-size-option">
                        <input
                          type="radio"
                          v-model="paperSize"
                          value="a4"
                        />
                        <span>{{ $t('view.sale.invoiceDetail.paperA4') }}</span>
                      </label>
                      <label class="paper-size-option">
                        <input
                          type="radio"
                          v-model="paperSize"
                          value="bill"
                        />
                        <span>{{ $t('view.sale.invoiceDetail.paperBill') }}</span>
                      </label>
                      <label class="paper-size-option">
                        <input
                          type="radio"
                          v-model="paperSize"
                          value="vat-bridge"
                        />
                        <span>{{ $t('view.sale.invoiceDetail.paperTax') }}</span>
                      </label>
                    </div>
                  </div>

                  <div v-if="paperSize === 'bill' || paperSize === 'vat-bridge'" class="form-group mb-3">
                    <label class="form-label">
                      <i class="bi bi-printer mr-1"></i>{{ $t('view.sale.invoiceDetail.printer') }}
                    </label>
                    <DropdownGeneric
                      v-model="selectedPrinter"
                      :options="printerOptions"
                      optionLabel="label"
                      optionValue="name"
                      :placeholder="$t('view.sale.invoiceDetail.selectPrinter')"
                      :showClear="true"
                    />
                    <small v-if="printerOptions.length === 0" class="form-text text-muted">
                      {{ $t('view.sale.invoiceDetail.noPrinterFound') }}
                    </small>
                  </div>

                  <div v-if="paperSize === 'bill'" class="form-group mb-3">
                    <div class="row">
                      <div class="col-6">
                        <label class="form-label">
                          <i class="bi bi-arrows-move mr-1"></i>Offset X (mm)
                        </label>
                        <input
                          v-model.number="billOffset.x"
                          type="number"
                          step="0.5"
                          class="form-control"
                        />
                      </div>
                      <div class="col-6">
                        <label class="form-label">
                          <i class="bi bi-arrows-move mr-1"></i>Offset Y (mm)
                        </label>
                        <input
                          v-model.number="billOffset.y"
                          type="number"
                          step="0.5"
                          class="form-control"
                        />
                      </div>
                    </div>
                    <small class="form-text text-muted">
                      {{ $t('view.sale.invoiceDetail.offsetHint') }}
                    </small>
                  </div>

                  <div v-if="paperSize === 'vat-bridge'" class="form-group mb-3">
                    <div class="row">
                      <div class="col-6">
                        <label class="form-label">
                          <i class="bi bi-arrows-move mr-1"></i>Offset X (mm)
                        </label>
                        <input
                          v-model.number="continuousOffset.x"
                          type="number"
                          step="0.5"
                          class="form-control"
                        />
                      </div>
                      <div class="col-6">
                        <label class="form-label">
                          <i class="bi bi-arrows-move mr-1"></i>Offset Y (mm)
                        </label>
                        <input
                          v-model.number="continuousOffset.y"
                          type="number"
                          step="0.5"
                          class="form-control"
                        />
                      </div>
                    </div>
                    <small class="form-text text-muted">
                      {{ $t('view.sale.invoiceDetail.offsetHint') }}
                    </small>
                  </div>
                </div>
              </div>

              <!-- Info Container -->
              <div class="filter-container-search mb-2">
                <div class="p-2">
                  <div class="d-flex align-items-start">
                    <i class="bi bi-info-circle text-info mr-2 info-icon"></i>
                    <div>
                      <p class="mb-1 info-text">
                        {{ $t('view.sale.deliveryNote.printOnlyNote') }}
                      </p>
                      <p class="mb-0 info-text">
                        {{ $t('view.sale.deliveryNote.originalNotChanged') }}
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
                    {{ $t('view.sale.invoiceDetail.printBtn') }}
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
import { warning } from '@/services/alert/sweetAlerts.js'
import { storage } from '@/services/storage.js'
import dayjs from 'dayjs'
import CalendarGeneric from '@/components/prime-vue/CalendarGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import { getPrinterList } from '@/services/api/printer-config-service.js'
import { getBillLayout } from '@/services/helper/print/bill-layout-store.js'
import { getVatLayout } from '@/services/helper/print/vat-layout-store.js'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

export default {
  name: 'InvoiceConfirmPrintModal',

  components: {
    modal,
    CalendarGeneric,
    DropdownGeneric
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
      },
      paperSize: 'vat-bridge',
      continuousOffset: { x: 0, y: 0 },
      billOffset: { x: 0, y: 0 },
      printerOptions: [],
      selectedPrinter: null,
      defaultBillPrinter: null,
      defaultVatPrinter: null
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
    },
    paperSize(newVal) {
      if (newVal === 'bill') {
        this.selectedPrinter = this.defaultBillPrinter
      } else if (newVal === 'vat-bridge') {
        this.selectedPrinter = this.defaultVatPrinter
      } else {
        this.selectedPrinter = null
      }
    }
  },

  async mounted() {
    const savedContinuous = storage.getItem('invoice-continuous-offset')
    if (savedContinuous) {
      try {
        const parsed = JSON.parse(savedContinuous)
        if (parsed && typeof parsed === 'object') {
          this.continuousOffset = {
            x: Number(parsed.x) || 0,
            y: Number(parsed.y) || 0
          }
        }
      } catch (e) {
        this.continuousOffset = { x: 0, y: 0 }
      }
    }

    const savedBill = storage.getItem('invoice-bill-offset')
    if (savedBill) {
      try {
        const parsed = JSON.parse(savedBill)
        if (parsed && typeof parsed === 'object') {
          this.billOffset = {
            x: Number(parsed.x) || 0,
            y: Number(parsed.y) || 0
          }
        }
      } catch (e) {
        this.billOffset = { x: 0, y: 0 }
      }
    }

    this.printerOptions = await getPrinterList()

    const [billLayout, vatLayout] = await Promise.all([getBillLayout(), getVatLayout()])
    this.defaultBillPrinter = billLayout?.printerName || null
    this.defaultVatPrinter = vatLayout?.printerName || null

    if (this.paperSize === 'bill') {
      this.selectedPrinter = this.defaultBillPrinter
    } else if (this.paperSize === 'vat-bridge') {
      this.selectedPrinter = this.defaultVatPrinter
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
        warning(this.$t('view.sale.invoiceDetail.validation.invoiceNumberRequired'), this.$t('common.label.incompleteData'))
        return
      }

      if (!this.printData.invoiceDate) {
        warning(this.$t('view.sale.invoiceDetail.validation.invoiceDateRequired'), this.$t('common.label.incompleteData'))
        return
      }

      // Normalize date to start of day (remove time component)
      const normalizedDate = new Date(this.printData.invoiceDate)
      normalizedDate.setHours(0, 0, 0, 0)

      if (this.paperSize === 'vat-bridge') {
        storage.setItem('invoice-continuous-offset', JSON.stringify(this.continuousOffset))
      } else if (this.paperSize === 'bill') {
        storage.setItem('invoice-bill-offset', JSON.stringify(this.billOffset))
      }

      const printDataToEmit = {
        ...this.invoiceData,
        invoiceNumber: this.printData.invoiceNumber.trim(), // Override with modified value
        invoiceDate: normalizedDate, // Override with normalized date (time = 00:00:00)
        showCifLabel: this.printData.showCifLabel,
        paperSize: this.paperSize,
        continuousOffset: { ...this.continuousOffset },
        billOffset: { ...this.billOffset },
        printerName: this.selectedPrinter
      }

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

.info-icon {
  font-size: var(--fs-lg);
}

.info-text {
  font-size: var(--fs-sm);
  color: #6c757d;
}

.checkbox-row {
  gap: var(--sp-sm);
  cursor: pointer;
}

.checkbox-input {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.label-clickable {
  cursor: pointer;
}

.paper-size-options {
  display: flex;
  flex-direction: column;
  gap: 6px;

  .paper-size-option {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    margin-bottom: 0;
    font-weight: normal;

    input[type='radio'] {
      width: 16px;
      height: 16px;
      cursor: pointer;
    }
  }
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

.webusb-info-box {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: #e8f4f8;
  border: 1px solid var(--base-green);
  border-radius: 4px;
  font-size: 0.9rem;
  color: var(--base-green);

  i {
    color: var(--base-green);
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
