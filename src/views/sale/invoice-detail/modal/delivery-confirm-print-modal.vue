<template>
  <div>
    <modal :showModal="isShowModal" @closeModal="closeModal" :width="'600px'">
      <template v-slot:content>
        <div class="delivery-confirm-print-container">
          <div class="">
            <!-- Modal Header -->
            <div class="title-text-lg-bg">
              <i class="bi bi-truck mr-2"></i>
              <span>{{ $t('view.sale.deliveryNote.confirmPrintTitle') }}</span>
            </div>

            <div class="p-3">
              <!-- Form Container -->
              <div class="filter-container mb-2">
                <div class="title-text-lg mb-2">
                  <i class="bi bi-file-text mr-2"></i>{{ $t('view.sale.deliveryNote.docInfo') }}
                </div>
                <div class="p-3">
                  <div class="form-group mb-3">
                    <label class="form-label">
                      <i class="bi bi-hash mr-1"></i>Delivery Note Number
                    </label>
                    <InputTextGeneric
                      v-model="printData.deliveryNumber"
                      type="text"
                      :placeholder="$t('view.sale.deliveryNote.dnNumberPlaceholder')"
                    />
                    <small class="form-text text-muted">
                      {{ $t('view.sale.deliveryNote.originalValue') }}: {{ originalData.deliveryNumber }}
                    </small>
                  </div>

                  <div class="form-group mb-3">
                    <label class="form-label">
                      <i class="bi bi-calendar-event mr-1"></i>Delivery Date
                    </label>
                    <CalendarGeneric
                      v-model="printData.deliveryDate"
                      dateFormat="dd/mm/yy"
                      :placeholder="$t('view.sale.deliveryNote.selectDate')"
                      :showIcon="true"
                      :showButtonBar="true"
                      class="w-100"
                    />
                    <small class="form-text text-muted">
                      {{ $t('view.sale.deliveryNote.originalValue') }}: {{ formatDate(originalData.deliveryDate) }}
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
                    <i class="bi bi-truck mr-1"></i>
                    {{ $t('view.sale.deliveryNote.printBtn') }}
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
import CalendarGeneric from '@/components/prime-vue/CalendarGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import dayjs from 'dayjs'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

export default {
  name: 'DeliveryConfirmPrintModal',

  components: {
    modal,
    CalendarGeneric,
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
    }
  },

  emits: ['close-modal', 'confirm-print'],

  data() {
    return {
      originalData: {
        deliveryNumber: '',
        deliveryDate: ''
      },
      printData: {
        deliveryNumber: '',
        deliveryDate: ''
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
      // Convert Invoice Number to Delivery Note Number (INV -> DN)
      const deliveryNumber = this.invoiceData.invoiceNumber
        ? this.invoiceData.invoiceNumber.replace('INV', 'DN')
        : ''

      this.originalData = {
        deliveryNumber: deliveryNumber,
        deliveryDate: this.invoiceData.createDate || ''
      }

      // Initialize print data
      // Delivery Number: use converted value
      // Delivery Date: default to today's date
      this.printData = {
        deliveryNumber: deliveryNumber,
        deliveryDate: new Date() // Default to current date
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
      if (!this.printData.deliveryNumber || !this.printData.deliveryNumber.trim()) {
        warning(this.$t('view.sale.deliveryNote.validation.dnRequired'), this.$t('common.label.incompleteData'))
        return
      }

      if (!this.printData.deliveryDate) {
        warning(this.$t('view.sale.deliveryNote.validation.dateRequired'), this.$t('common.label.incompleteData'))
        return
      }

      // Normalize date to start of day (remove time component)
      const normalizedDate = new Date(this.printData.deliveryDate)
      normalizedDate.setHours(0, 0, 0, 0)

      // Emit confirm event with print data
      const printDataToEmit = {
        deliveryNumber: this.printData.deliveryNumber.trim(),
        deliveryDate: normalizedDate,
        invoiceData: this.invoiceData
      }

      this.$emit('confirm-print', printDataToEmit)
      this.closeModal()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form';

.delivery-confirm-print-container {
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
