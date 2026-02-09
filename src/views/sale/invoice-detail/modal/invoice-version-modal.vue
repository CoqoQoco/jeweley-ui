<template>
  <div>
    <modal :showModal="isShowModal" @closeModal="closeModal" :width="'90%'">
      <template v-slot:content>
        <div class="invoice-version-container">
          <div class="p-2">
            <!-- Modal Header -->
            <div class="title-text-lg-bg mb-3">
              <i class="bi bi-file-earmark-plus mr-2"></i>
              <span>สร้าง Invoice Version ใหม่ : {{ invoiceData?.invoiceNumber || '' }}</span>
            </div>

            <!-- Currency and Rate Section -->
            <div class="filter-container mb-3">
              <div class="title-text-lg-bg p-2 mb-2">
                <i class="bi bi-cash-coin mr-2"></i>สกุลเงินและอัตราแลกเปลี่ยน
              </div>
              <div class="p-2">
                <div class="row">
                  <div class="col-md-6">
                    <div class="form-group">
                      <label class="form-label">สกุลเงิน</label>
                      <input
                        v-model="versionData.currencyUnit"
                        type="text"
                        class="form-control"
                        placeholder="เช่น USD, THB"
                      />
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-group">
                      <label class="form-label">อัตราแลกเปลี่ยน</label>
                      <input
                        v-model.number="versionData.currencyRate"
                        type="number"
                        class="form-control"
                        step="0.01"
                        placeholder="เช่น 35.50"
                        @input="recalculateAll"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Items Table -->
            <div class="filter-container mb-3">
              <div class="title-text-lg-bg p-2 mb-2">
                <i class="bi bi-list-ul mr-2"></i>รายการสินค้า (แก้ไขราคาและส่วนลด)
              </div>
              <div class="p-0">
                <DataTable
                  :value="versionData.items"
                  class="p-datatable-sm"
                  :scrollable="true"
                  scrollHeight="400px"
                  stripedRows
                  showGridlines
                >
                  <Column
                    field="stockNumber"
                    header="เลขที่ผลิต"
                    :frozen="true"
                    style="min-width: 150px"
                  >
                    <template #body="slotProps">
                      <span class="font-weight-bold">{{ slotProps.data.stockNumber }}</span>
                    </template>
                  </Column>

                  <Column field="productNumber" header="รหัสสินค้า" style="min-width: 150px">
                    <template #body="slotProps">
                      <span>{{ slotProps.data.productNumber || '-' }}</span>
                    </template>
                  </Column>

                  <Column field="description" header="รายละเอียด" style="min-width: 200px">
                    <template #body="slotProps">
                      <!-- <span>{{ slotProps.data.description || '-' }}</span> -->
                      <input
                        v-model.number="slotProps.data.description"
                        type="text"
                        class="form-control text-right bg-input input-bg"
                        style="background-color: #b5dad4; width: 100%"
                      />
                    </template>
                  </Column>

                  <Column
                    field="appraisalPrice"
                    header="ราคาประเมิน (THB)"
                    style="min-width: 150px"
                  >
                    <template #body="slotProps">
                      <input
                        v-model.number="slotProps.data.appraisalPrice"
                        type="number"
                        class="form-control text-right bg-input input-bg"
                        step="0.01"
                        @input="recalculateAll"
                        style="background-color: #b5dad4; width: 100%"
                      />
                    </template>
                  </Column>

                  <Column field="discountPercent" header="ส่วนลด (%)" style="min-width: 120px">
                    <template #body="slotProps">
                      <input
                        v-model.number="slotProps.data.discountPercent"
                        type="number"
                        class="form-control text-right bg-input input-bg"
                        min="0"
                        max="100"
                        step="0.01"
                        @input="recalculateAll"
                        style="background-color: #b5dad4; width: 100%"
                        placeholder="0"
                      />
                    </template>
                  </Column>

                  <Column
                    field="priceAfterDiscount"
                    header="ราคาหลังหักส่วนลด (THB)"
                    style="min-width: 180px"
                  >
                    <template #body="slotProps">
                      <span class="text-right d-block">{{
                        formatNumber(calculatePriceAfterDiscount(slotProps.data))
                      }}</span>
                    </template>
                  </Column>

                  <Column
                    field="convertedPrice"
                    :header="'ราคาแปลง (' + versionData.currencyUnit + ')'"
                    style="min-width: 150px"
                  >
                    <template #body="slotProps">
                      <span class="text-right d-block text-primary font-weight-bold">{{
                        formatNumber(calculateConvertedPrice(slotProps.data))
                      }}</span>
                    </template>
                  </Column>

                  <Column field="qty" header="จำนวน" style="min-width: 100px">
                    <template #body="slotProps">
                      <span class="text-right d-block">{{ slotProps.data.qty || 0 }}</span>
                    </template>
                  </Column>

                  <Column
                    field="total"
                    :header="'รวม (' + versionData.currencyUnit + ')'"
                    style="min-width: 150px"
                  >
                    <template #body="slotProps">
                      <span class="text-right d-block font-weight-bold text-success">{{
                        formatNumber(calculateItemTotal(slotProps.data))
                      }}</span>
                    </template>
                  </Column>
                </DataTable>
              </div>
            </div>

            <!-- Financial Adjustments -->
            <div class="filter-container mb-3">
              <div class="title-text-lg-bg p-2 mb-2">
                <i class="bi bi-calculator mr-2"></i>ส่วนปรับราคา
              </div>
              <div class="p-2">
                <div class="row">
                  <div class="col-md-4">
                    <div class="form-group">
                      <label class="form-label">
                        <i class="bi bi-dash-circle text-danger mr-1"></i>ส่วนลดพิเศษ ({{
                          versionData.currencyUnit
                        }})
                      </label>
                      <input
                        v-model.number="versionData.specialDiscount"
                        type="number"
                        class="form-control"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        @input="recalculateAll"
                      />
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="form-group">
                      <label class="form-label">
                        <i class="bi bi-plus-circle text-success mr-1"></i>ส่วนเพิ่มพิเศษ ({{
                          versionData.currencyUnit
                        }})
                      </label>
                      <input
                        v-model.number="versionData.specialAddition"
                        type="number"
                        class="form-control"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        @input="recalculateAll"
                      />
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="form-group">
                      <label class="form-label">
                        <i class="bi bi-truck mr-1"></i>Freight & Insurance ({{
                          versionData.currencyUnit
                        }})
                      </label>
                      <input
                        v-model.number="versionData.freightAndInsurance"
                        type="number"
                        class="form-control"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        @input="recalculateAll"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Summary Section -->
            <div class="filter-container-search mb-3">
              <div class="title-text-lg p-2"><i class="bi bi-receipt mr-2"></i>สรุปยอดเงิน</div>
              <div class="p-2">
                <div class="summary-grid">
                  <div class="summary-row">
                    <span class="summary-label">ยอดรวมสินค้า:</span>
                    <span class="summary-value">{{ formatNumber(totalItems) }}</span>
                  </div>
                  <div class="summary-row text-danger" v-if="versionData.specialDiscount > 0">
                    <span class="summary-label">ส่วนลดพิเศษ:</span>
                    <span class="summary-value"
                      >-{{ formatNumber(versionData.specialDiscount) }}</span
                    >
                  </div>
                  <div class="summary-row text-success" v-if="versionData.specialAddition > 0">
                    <span class="summary-label">ส่วนเพิ่มพิเศษ:</span>
                    <span class="summary-value"
                      >+{{ formatNumber(versionData.specialAddition) }}</span
                    >
                  </div>
                  <div class="summary-row" v-if="versionData.freightAndInsurance > 0">
                    <span class="summary-label">Freight & Insurance:</span>
                    <span class="summary-value">{{
                      formatNumber(versionData.freightAndInsurance)
                    }}</span>
                  </div>
                  <div class="summary-row summary-total">
                    <span class="summary-label font-weight-bold">ยอดรวมทั้งสิ้น:</span>
                    <span class="summary-value font-weight-bold text-primary">
                      {{ formatNumber(grandTotal) }} {{ versionData.currencyUnit }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="btn-submit-container mt-4 mb-2">
              <div class="d-flex justify-content-end">
                <button class="btn btn-info mr-2" type="button" @click="onPreview">
                  <i class="bi bi-eye mr-1"></i>
                  พิมพ์ตัวอย่าง
                </button>

                <button class="btn btn-green mr-2" type="button" @click="onSaveAndPrint">
                  <i class="bi bi-printer mr-1"></i>
                  <!-- บันทึกและพิมพ์ -->
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
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { success, warning } from '@/services/alert/sweetAlerts.js'
import { useInvoiceApiStore } from '@/stores/modules/api/sale/invoice-store.js'

const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))

export default {
  name: 'InvoiceVersionModal',

  components: {
    modal,
    DataTable,
    Column
  },

  setup() {
    const invoiceStore = useInvoiceApiStore()
    return {
      invoiceStore
    }
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
    invoiceItems: {
      type: Array,
      default: () => []
    }
  },

  emits: ['close-modal', 'save', 'preview'],

  data() {
    return {
      versionData: {
        versionNumber: 1,
        currencyUnit: 'THB',
        currencyRate: 1,
        specialDiscount: 0,
        specialAddition: 0,
        freightAndInsurance: 0,
        items: []
      }
    }
  },

  computed: {
    totalItems() {
      return this.versionData.items.reduce((sum, item) => {
        return sum + this.calculateItemTotal(item)
      }, 0)
    },

    totalAfterAdjustments() {
      const total = this.totalItems
      const afterDiscount = total - (this.versionData.specialDiscount || 0)
      const afterAddition = afterDiscount + (this.versionData.specialAddition || 0)
      return afterAddition
    },

    grandTotal() {
      return this.totalAfterAdjustments + (this.versionData.freightAndInsurance || 0)
    }
  },

  watch: {
    isShowModal: {
      handler(newVal) {
        if (newVal) {
          this.initializeVersionData()
        }
      },
      immediate: true
    }
  },

  methods: {
    initializeVersionData() {
      // Copy data from original invoice
      this.versionData = {
        versionNumber: 1, // Will be calculated from existing versions
        currencyUnit: this.invoiceData.currencyUnit || 'THB',
        currencyRate: this.invoiceData.currencyRate || 1,
        specialDiscount: this.invoiceData.specialDiscount || 0,
        specialAddition: this.invoiceData.specialAddition || 0,
        freightAndInsurance: this.invoiceData.freightAndInsurance || 0,
        items: JSON.parse(JSON.stringify(this.invoiceItems)) // Deep copy
      }
    },

    calculatePriceAfterDiscount(item) {
      const price = Number(item.appraisalPrice) || 0
      const discount = Number(item.discountPercent) || 0
      return price * (1 - discount / 100)
    },

    calculateConvertedPrice(item) {
      const priceAfterDiscount = this.calculatePriceAfterDiscount(item)
      const rate = Number(this.versionData.currencyRate) || 1
      return priceAfterDiscount / rate
    },

    calculateItemTotal(item) {
      const convertedPrice = this.calculateConvertedPrice(item)
      const qty = Number(item.qty) || 0
      return convertedPrice * qty
    },

    recalculateAll() {
      // Force Vue to recalculate computed properties
      this.$forceUpdate()
    },

    formatNumber(value) {
      if (!value && value !== 0) return '0.00'
      return Number(value).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },

    closeModal() {
      this.$emit('close-modal')
    },

    onPreview() {
      const versionDataToSave = {
        ...this.versionData,
        totalItems: this.totalItems,
        totalAfterAdjustments: this.totalAfterAdjustments,
        grandTotal: this.grandTotal,
        createdDate: new Date().toISOString(),
        createdBy: 'Current User' // TODO: Get from auth store
      }

      this.$emit('preview', versionDataToSave)
      //success('กำลังเปิดหน้าต่างพิมพ์ตัวอย่าง', 'Preview PDF')
    },

    async onSaveAndPrint() {
      //console.log('onSaveAndPrint called')
      //console.log('invoiceData:', this.invoiceData)
      //console.log('versionData:', this.versionData)

      // Validate data
      if (!this.versionData.currencyUnit) {
        warning('กรุณากรอกสกุลเงิน', 'ข้อมูลไม่ครบถ้วน')
        return
      }

      if (!this.versionData.currencyRate || this.versionData.currencyRate <= 0) {
        warning('กรุณากรอกอัตราแลกเปลี่ยนที่ถูกต้อง', 'ข้อมูลไม่ครบถ้วน')
        return
      }

      const versionDataToSave = {
        ...this.versionData,
        totalItems: this.totalItems,
        totalAfterAdjustments: this.totalAfterAdjustments,
        grandTotal: this.grandTotal,
        createdDate: new Date().toISOString(),
        createdBy: 'Current User' // TODO: Get from auth store
      }

      //console.log('versionDataToSave:', versionDataToSave)
      //console.log('Calling API with:', {
      //   invoiceNumber: this.invoiceData.invoiceNumber,
      //   soNumber: this.invoiceData.soNumber
      // })

      // Call API to save version
      const response = await this.invoiceStore.fetchUpsertVersion({
        formValue: {
          invoiceNumber: this.invoiceData.invoiceNumber,
          soNumber: this.invoiceData.soNumber,
          data: JSON.stringify(versionDataToSave)
        }
      })

      //console.log('API Response:', response)

      if (response && response) {
        const savedVersionData = {
          ...versionDataToSave,
          versionNumber: response.versionNumber
        }

        //console.log('savedVersionData:', savedVersionData)

        //success('บันทึก Invoice Version สำเร็จ', 'กำลังพิมพ์เอกสาร...')

        // Emit save event
        this.$emit('save', savedVersionData)

        // Print preview
        //this.$emit('preview', savedVersionData)

        // Close modal
        this.closeModal()
      } else {
        console.error('No response or response.data')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form';
@import '@/assets/scss/custom-style/standard-data-table';

.invoice-version-container {
  //padding: 1rem;
}

// Hide number input spinners (arrows)
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='number'] {
  -moz-appearance: textfield;
  appearance: textfield;
}

.summary-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #e9ecef;

  &.summary-total {
    background-color: #fff;
    border: 2px solid var(--base-font-color);
    padding: 1rem;
    margin-top: 0.5rem;
    font-size: 1.1rem;
  }
}

.summary-label {
  font-size: 0.95rem;
  color: #6c757d;
  font-weight: 500;
}

.summary-value {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
}

// DataTable styles ตามมาตรฐานของ project
:deep(.p-datatable) {
  .p-datatable-thead > tr > th {
    background-color: var(--base-font-color) !important;
    color: #ffffff !important;
    font-weight: 600;
    padding: 0.75rem 0.5rem;
    border: none;
  }

  .p-datatable-tbody > tr {
    &:hover {
      background-color: #f8f9fa;
    }

    > td {
      padding: 0.75rem 0.5rem;
      border-bottom: 1px solid #e9ecef;
      vertical-align: middle;
    }
  }
}
</style>
