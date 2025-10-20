<template>
  <div>
    <modal :showModal="isShowModal" @closeModal="closeModal" :width="'95%'" :fitHeight="true">
      <template v-slot:content>
        <!-- Sale Order Information -->
        <div class="mb-3">
          <div class="title-text-lg-bg p-2 mb-3">
            <i class="bi bi-receipt mr-2"></i>สร้าง Invoice จาก Sale Order
          </div>
          <div class="form-col-container p-2">
            <div>
              <span class="title-text">เลขที่ใบสั่งขาย</span>
              <input
                class="form-control bg-input"
                type="text"
                :value="saleOrderData.number"
                readonly
              />
            </div>
            <div>
              <span class="title-text">ชื่อลูกค้า</span>
              <input
                class="form-control bg-input"
                type="text"
                :value="saleOrderData.customerName || '-'"
                readonly
              />
            </div>
            <div>
              <span class="title-text">Currency</span>
              <input
                class="form-control bg-input"
                type="text"
                :value="saleOrderData.currencyUnit || 'THB'"
                readonly
              />
            </div>
            <div>
              <span class="title-text">Currency Rate</span>
              <input
                class="form-control bg-input"
                type="text"
                :value="saleOrderData.currencyRate || 1"
                readonly
              />
            </div>
          </div>
        </div>

        <!-- Stock Items Selection for Invoice -->
        <div class="">
          <div>
            <div v-if="loading" class="text-center py-4">
              <div class="spinner-border text-main" role="status">
                <span class="sr-only">Loading...</span>
              </div>
              <p class="mt-2 text-muted">กำลังโหลดข้อมูลสินค้า...</p>
            </div>

            <div v-else class="pl-2 pr-2">
              <!-- Instructions -->
              <div class="filter-container mb-3">
                <div class="d-flex align-items-start ml-3">
                  <i class="bi bi-lightbulb-fill text-warning mr-2"></i>
                  <div>
                    <strong class="title-text ml-1">คำแนะนำการใช้งาน:</strong>
                    <ul class="mb-0 mt-1">
                      <li>เลือกสินค้าที่ยืนยันการขายแล้วสำหรับออก Invoice</li>
                      <li>ตรวจสอบข้อมูลและราคาให้ถูกต้องก่อนสร้าง PDF</li>
                      <li>Invoice จะสร้างไฟล์ PDF พร้อมดาวน์โหลดอัตโนมัติ</li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- Selection Controls -->
              <div
                class="d-flex justify-content-between align-items-center mb-3 p-2"
                style="background-color: #f8f9fa; border-radius: 5px"
              >
                <div>
                  <label class="d-flex align-items-center mb-0">
                    <input
                      type="checkbox"
                      :checked="isAllSelected"
                      @change="toggleSelectAll"
                      :disabled="availableItems.length === 0"
                      class="mr-2"
                    />
                    <span class="title-text"
                      >เลือกทั้งหมด ({{ availableItems.length }} รายการ)</span
                    >
                  </label>
                </div>
                <div>
                  <span class="badge badge-success mr-2">
                    <i class="bi bi-check-circle mr-1"></i>สินค้าที่ยืนยันแล้ว:
                    {{ confirmedItemsCount }}
                  </span>
                </div>
              </div>

              <!-- Stock Items Table -->
              <DataTable
                :value="availableItems"
                dataKey="id"
                :rows="10"
                class="p-datatable-sm"
                :scrollable="true"
                :loading="loading"
                responsiveLayout="scroll"
              >
                <Column :exportable="false" style="width: 50px" header="เลือก">
                  <template #body="slotProps">
                    <div class="text-center">
                      <input
                        type="checkbox"
                        :checked="selectedItems.includes(slotProps.data.id)"
                        @change="toggleItemSelection(slotProps.data)"
                        :disabled="!slotProps.data.isConfirmed"
                      />
                    </div>
                  </template>
                </Column>

                <Column field="stockNumber" header="รหัสสต็อก" style="width: 120px">
                  <template #body="slotProps">
                    <span class="text-main">{{ slotProps.data.stockNumber }}</span>
                  </template>
                </Column>
                <Column field="productNumber" header="รหัสสินค้า" style="width: 120px">
                  <template #body="slotProps">
                    <span class="text-main">{{ slotProps.data.productNumber }}</span>
                  </template>
                </Column>
                <Column field="description" header="รายละเอียดสินค้า" style="min-width: 200px">
                  <template #body="slotProps">
                    <div>
                      <div>{{ slotProps.data.description || 'ไม่มีรายละเอียด' }}</div>
                      <small class="text-muted" v-if="slotProps.data.category">{{
                        slotProps.data.category
                      }}</small>
                    </div>
                  </template>
                </Column>
                <Column field="isConfirmed" header="สถานะ" style="width: 100px">
                  <template #body="slotProps">
                    <div class="text-center">
                      <span
                        :class="[
                          'badge',
                          slotProps.data.isConfirmed ? 'box-status-success' : 'box-status-show'
                        ]"
                      >
                        <i
                          :class="
                            slotProps.data.isConfirmed
                              ? 'bi bi-check-circle-fill mr-1'
                              : 'bi bi-clock-fill mr-1'
                          "
                        ></i>
                        {{ slotProps.data.isConfirmed ? 'ยืนยันแล้ว' : 'รอยืนยัน' }}
                      </span>
                      <div
                        v-if="slotProps.data.isConfirmed && slotProps.data.confirmedDate"
                        class="text-muted"
                        style="font-size: 0.75rem"
                      >
                        {{ formatDate(slotProps.data.confirmedDate) }}
                      </div>
                    </div>
                  </template>
                </Column>

                <!-- Image Column -->
                <Column header="รูปภาพ" style="width: 80px">
                  <template #body="slotProps">
                    <div
                      v-if="stockItems.length > 0 && slotProps.data.imagePath"
                      class="text-center"
                    >
                      <imagePreview
                        :imageName="slotProps.data.imagePath"
                        :path="slotProps.data.imagePath"
                        type="STOCK-PRODUCT"
                        :width="50"
                        :height="50"
                        v-if="slotProps.data.imagePath"
                      />
                      <div
                        v-else
                        class="d-flex align-items-center justify-content-center"
                        style="
                          width: 50px;
                          height: 50px;
                          background-color: #f8f9fa;
                          border: 1px solid #dee2e6;
                          border-radius: 4px;
                        "
                      >
                        <i class="bi bi-image text-muted"></i>
                      </div>
                    </div>
                  </template>
                </Column>

                <Column field="qty" header="จำนวน" style="width: 80px">
                  <template #body="slotProps">
                    <div class="text-center">{{ slotProps.data.qty }}</div>
                  </template>
                </Column>

                <Column field="appraisalPrice" header="ราคาประเมิน" style="width: 140px">
                  <template #body="slotProps">
                    <div class="text-right">
                      <div>{{ formatItemAppraisalPrice(slotProps.data) }}</div>
                      <small
                        class="text-muted"
                        v-if="saleOrderData.currencyRate && saleOrderData.currencyRate !== 1"
                      >
                        ({{ formatCurrency(getDiscountedPrice(slotProps.data)) }} THB)
                      </small>
                    </div>
                  </template>
                </Column>

                <Column header="ราคารวม" style="width: 140px">
                  <template #body="slotProps">
                    <div class="text-right text-success font-weight-bold">
                      <div>{{ formatItemTotalPrice(slotProps.data) }}</div>
                      <small
                        class="text-muted"
                        v-if="saleOrderData.currencyRate && saleOrderData.currencyRate !== 1"
                      >
                        ({{
                          formatCurrency(
                            getTotalConvertedPrice(slotProps.data) *
                              (saleOrderData.currencyRate || 1)
                          )
                        }}
                        THB)
                      </small>
                    </div>
                  </template>
                </Column>
              </DataTable>

              <!-- Summary -->
              <div class="mt-3">
                <div class="filter-container-search p-3">
                  <div class="title-text-lg mb-3">สรุปข้อมูล Invoice</div>

                  <!-- Summary Sections using existing styles -->
                  <div class="row">
                    <div class="col-md-6">
                      <div class="summary-section">
                        <h6>รายการสินค้า</h6>
                        <div class="summary-item">
                          <span>รายการที่เลือก:</span>
                          <span class="font-weight-bold text-primary"
                            >{{ selectedItemsCount }} รายการ</span
                          >
                        </div>
                        <div class="summary-item">
                          <span>ยืนยันแล้ว:</span>
                          <span class="font-weight-bold text-success"
                            >{{ confirmedItemsCount }} รายการ</span
                          >
                        </div>
                      </div>
                    </div>

                    <div class="col-md-6">
                      <div class="summary-section">
                        <h6>ยอดเงิน Invoice</h6>
                        <div class="summary-item">
                          <span>ยอดรวมที่เลือก:</span>
                          <span class="font-weight-bold text-warning">{{
                            formatPriceWithCurrency(totalSelectedAmount)
                          }}</span>
                        </div>
                        <div class="summary-item border-top pt-2 mt-2">
                          <span class="h6">ยอดรวม Invoice:</span>
                          <span class="h6 font-weight-bold text-main">{{
                            formatPriceWithCurrency(totalSelectedAmount)
                          }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="btn-submit-container mt-4 pb-2">
          <div class="d-flex justify-content-end">
            <button
              class="btn btn-green mr-2"
              type="button"
              @click="generateInvoice"
              :disabled="loading || selectedItemsCount === 0"
            >
              <i class="bi bi-file-earmark-pdf mr-1"></i>
              สร้าง Invoice PDF
              <span v-if="selectedItemsCount > 0">({{ selectedItemsCount }} รายการ)</span>
              <span
                v-if="loading"
                class="spinner-border spinner-border-sm ml-2"
                role="status"
              ></span>
            </button>

            <button class="btn btn-secondary mr-2" type="button" @click="closeModal">
              <i class="bi bi-x-circle mr-1"></i>
              ยกเลิก
            </button>
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
import imagePreview from '@/components/prime-vue/ImagePreviewEmit.vue'
import { useInvoiceApiStore } from '@/stores/modules/api/sale/invoice-store.js'
import { warning, error, success } from '@/services/alert/sweetAlerts.js'

const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))

export default {
  name: 'SaleOrderInvoiceModal',

  components: {
    modal,
    DataTable,
    Column,
    imagePreview
  },

  props: {
    isShowModal: {
      type: Boolean,
      default: false
    },
    saleOrderData: {
      type: Object,
      default: () => ({})
    },
    stockItems: {
      type: Array,
      default: () => []
    }
  },

  emits: ['close-modal', 'invoice-created'],

  data() {
    return {
      loading: false,
      selectedItems: [],
      invoiceStore: useInvoiceApiStore()
    }
  },

  computed: {
    // Only show confirmed items that don't have invoice yet
    availableItems() {
      console.log(
        'Available items for invoice:',
        this.stockItems.filter((item) => item.isConfirmed && !item.invoice)
      )
      return this.stockItems.filter((item) => item.isConfirmed && !item.invoice)
    },

    isAllSelected() {
      return (
        this.availableItems.length > 0 && this.selectedItems.length === this.availableItems.length
      )
    },

    selectedItemsCount() {
      return this.selectedItems.length
    },

    confirmedItemsCount() {
      return this.stockItems.filter((item) => item.isConfirmed).length
    },

    totalSelectedAmount() {
      const selectedStockItems = this.stockItems.filter((item) =>
        this.selectedItems.includes(item.id)
      )

      return selectedStockItems.reduce((total, item) => {
        return total + this.getTotalConvertedPrice(item)
      }, 0)
    }
  },

  watch: {
    isShowModal: {
      handler(newVal) {
        if (newVal) {
          this.loadInitialData()
        }
      },
      immediate: true
    }
  },

  methods: {
    loadInitialData() {
      // Reset selections when modal opens
      this.selectedItems = []
      console.log('Invoice modal loaded with stock items:', this.stockItems)
    },

    toggleSelectAll() {
      if (this.isAllSelected) {
        this.selectedItems = []
      } else {
        // Only select confirmed items
        this.selectedItems = this.availableItems.map((item) => item.id)
      }
    },

    toggleItemSelection(item) {
      // Don't allow selection of unconfirmed items
      if (!item.isConfirmed) {
        return
      }

      const index = this.selectedItems.indexOf(item.id)
      if (index > -1) {
        this.selectedItems.splice(index, 1)
      } else {
        this.selectedItems.push(item.id)
      }
    },

    formatCurrency(amount) {
      return new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount || 0)
    },

    // คำนวณราคาประเมิน
    getAppraisalPrice(item) {
      return item.appraisalPrice || item.price || 0
    },

    // คำนวณราคาหลังหักส่วนลด
    getDiscountedPrice(item) {
      const appraisalPrice = this.getAppraisalPrice(item)
      const discountPercent = item.discountPercent || 0
      return appraisalPrice * (1 - discountPercent / 100)
    },

    // คำนวณราคาแปลงสกุลเงิน
    getConvertedPrice(item) {
      const discountedPrice = this.getDiscountedPrice(item)
      const currencyRate = this.saleOrderData.currencyRate || 1
      return discountedPrice / currencyRate
    },

    // คำนวณราคารวมของแต่ละรายการ
    getTotalConvertedPrice(item) {
      const convertedPrice = this.getConvertedPrice(item)
      const qty = item.qty || 0
      return convertedPrice * qty
    },

    // Format ราคาพร้อม currency
    formatPriceWithCurrency(price) {
      const currency = this.saleOrderData.currencyUnit || 'THB'
      return `${this.formatCurrency(price)} ${currency}`
    },

    // Format ราคาประเมินพร้อม currency สำหรับแสดงในตาราง
    formatItemAppraisalPrice(item) {
      const convertedPrice = this.getConvertedPrice(item)
      const currency = this.saleOrderData.currencyUnit || 'THB'
      return `${this.formatCurrency(convertedPrice)} ${currency}`
    },

    // Format ราคารวมพร้อม currency สำหรับแสดงในตาราง
    formatItemTotalPrice(item) {
      const totalPrice = this.getTotalConvertedPrice(item)
      const currency = this.saleOrderData.currencyUnit || 'THB'
      return `${this.formatCurrency(totalPrice)} ${currency}`
    },

    formatDate(date) {
      if (!date) return '-'
      try {
        return new Date(date).toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      } catch {
        return '-'
      }
    },

    // Helper method to get payment ID from payment terms value
    getPaymentId(paymentTerms) {
      const paymentMapping = {
        Cash: 1,
        Credit30: 2,
        Credit60: 3,
        DepositAndBalance: 4
      }
      return paymentMapping[paymentTerms] || 1
    },

    async generateInvoice() {
      try {
        if (this.selectedItemsCount === 0) {
          warning('กรุณาเลือกสินค้าอย่างน้อย 1 รายการ')
          return
        }

        // ตรวจสอบข้อมูล Sale Order ก่อน
        if (!this.saleOrderData || (!this.saleOrderData.soNumber && !this.saleOrderData.number)) {
          warning('ไม่พบข้อมูลเลขที่ใบสั่งขาย กรุณาตรวจสอบข้อมูล')
          return
        }

        if (!this.saleOrderData.customerName) {
          warning('ไม่พบชื่อลูกค้า กรุณาตรวจสอบข้อมูลใบสั่งขาย')
          return
        }

        this.loading = true

        // Get selected items
        const selectedStockItems = this.stockItems.filter((item) =>
          this.selectedItems.includes(item.id)
        )

        // Prepare invoice data for API
        const invoiceRequest = {
          soNumber: this.saleOrderData.number || this.saleOrderData.soNumber,
          customerCode: this.saleOrderData.customerCode || 'CUST-DEFAULT',
          customerName: this.saleOrderData.customerName,
          customerAddress: this.saleOrderData.customerAddress,
          customerTel: this.saleOrderData.customerPhone || this.saleOrderData.customerTel,
          customerEmail: this.saleOrderData.customerEmail,
          customerRemark: this.saleOrderData.customerRemark,
          currencyUnit: this.saleOrderData.currencyUnit || 'THB',
          currencyRate: this.saleOrderData.currencyRate || 1.0,
          deliveryDate: this.saleOrderData.expectedDeliveryDate || this.saleOrderData.deliveryDate,
          depositPercent:
            this.saleOrderData.depositPercentage || this.saleOrderData.depositPercent || 0,
          discount: this.saleOrderData.discountPercent || 0,
          goldRate: this.saleOrderData.goldPerOz || 0,
          markup: this.saleOrderData.markup || 0,
          paymentName: this.saleOrderData.paymentTerms,
          payment: this.getPaymentId(this.saleOrderData.paymentTerms),
          priority: this.saleOrderData.priority || 'normal',
          refQuotation: this.saleOrderData.quotationNumber || '',
          remark: this.saleOrderData.remark || '',
          items: selectedStockItems.map((item) => ({
            stockNumber: item.stockNumber,
            stockNumberOrigin: item.stockNumberOrigin || item.stockNumber,
            id: item.id,
            priceOrigin: item.appraisalPrice || item.price || 0,
            currencyUnit: this.saleOrderData.currencyUnit || 'THB',
            currencyRate: this.saleOrderData.currencyRate || 1.0,
            markup: this.saleOrderData.markup || 0,
            discount: item.discountPercent || 0,
            goldRate: this.saleOrderData.goldPerOz || 0,
            remark: item.remark || '',
            netPrice: String(this.getConvertedPrice(item)),
            priceDiscount: this.getDiscountedPrice(item),
            priceAfterCurrencyRate: this.getConvertedPrice(item),
            qty: item.qty || 1
          }))
        }

        console.log('Creating invoice with data:', invoiceRequest)

        // Call API to create invoice
        const response = await this.invoiceStore.fetchCreate({
          formValue: invoiceRequest
        })

        if (response) {
          console.log('Invoice created successfully:', response)

          const invoiceNumber = response.invoiceNumber || 'สร้างสำเร็จ'
          success(`เลขที่ Invoice: ${invoiceNumber}`, 'สร้าง Invoice สำเร็จ')

          // Emit event to parent to refresh sale order data
          this.$emit('invoice-created', {
            invoiceNumber: response.invoiceNumber,
            selectedItems: this.selectedItems
          })

          this.closeModal()
        } else {
          throw new Error('ไม่ได้รับข้อมูลการตอบกลับจาก API')
        }
      } catch (error) {
        console.error('Error generating invoice:', error)

        // Extract error message from API response
        let errorMessage = 'ไม่สามารถสร้าง Invoice ได้'

        if (error.response && error.response.data) {
          if (error.response.data.message) {
            errorMessage = error.response.data.message
          } else if (error.response.data.error) {
            errorMessage = error.response.data.error
          } else if (typeof error.response.data === 'string') {
            errorMessage = error.response.data
          }
        } else if (error.message) {
          errorMessage = error.message
        }

        error(errorMessage, 'เกิดข้อผิดพลาดในการสร้าง Invoice')
      } finally {
        this.loading = false
      }
    },

    closeModal() {
      this.selectedItems = []
      this.$emit('close-modal')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form';
@import '@/assets/scss/custom-style/standard-data-table';

// ใช้ DataTable style ที่มีอยู่แล้วในระบบ
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

// ใช้ badge style ที่มีอยู่แล้วในระบบ
.badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  display: inline-flex;
  align-items: center;
}

// ใช้ spinner ที่มีอยู่แล้วในระบบ
.text-main {
  color: var(--base-font-color) !important;
}

// Summary styles เหมือนกับหน้า sale-order-view
.summary-section {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 0.25rem;
  padding: 1rem;
  margin-bottom: 1rem;

  h6 {
    color: var(--base-font-color);
    margin-bottom: 0.75rem;
    font-weight: 600;
  }
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0;

  span:first-child {
    color: #6c757d;
  }

  span:last-child {
    text-align: right;
  }
}

// Responsive สำหรับมือถือ
@media (max-width: 768px) {
  .row .col-md-6 {
    margin-bottom: 1rem;
  }

  .d-flex.justify-content-between {
    flex-direction: column;
    gap: 1rem;
  }

  .btn-submit-container {
    text-align: center;

    .btn {
      margin: 0.25rem;
      width: auto;
      min-width: 120px;
    }
  }
}
</style>
