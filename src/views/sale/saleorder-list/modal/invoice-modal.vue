<template>
  <div>
    <modal :showModal="isShowModal" @closeModal="closeModal" :width="'90%'" :fitHeight="true">
      <template v-slot:content>
        <div class="title-text-lg-header mb-2">
          <span>สร้าง Invoice จาก Sale Order: {{ saleOrderData.soNumber }}</span>
        </div>
        
        <!-- Sale Order Information -->
        <div class="card-container mb-3">
          <div class="card-header">
            <h6 class="mb-0">ข้อมูลใบสั่งขาย</h6>
          </div>
          <div class="card-body">
            <div class="form-col-container">
              <div>
                <span class="title-text">เลขที่ใบสั่งขาย</span>
                <input
                  :class="['form-control bg-input']"
                  type="text"
                  :value="saleOrderData.soNumber"
                  readonly
                />
              </div>
              <div>
                <span class="title-text">ชื่อลูกค้า</span>
                <input
                  :class="['form-control bg-input']"
                  type="text"
                  :value="saleOrderData.customerName"
                  readonly
                />
              </div>
              <div>
                <span class="title-text">สกุลเงิน</span>
                <input
                  :class="['form-control bg-input']"
                  type="text"
                  v-model="invoiceForm.currencyUnit"
                  placeholder="THB"
                />
              </div>
              <div>
                <span class="title-text">อัตราแลกเปลี่ยน</span>
                <input
                  :class="['form-control bg-input']"
                  type="number"
                  v-model.number="invoiceForm.currencyRate"
                  placeholder="1.00"
                  step="0.01"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Stock Items Selection -->
        <div class="card-container">
          <div class="card-header">
            <h6 class="mb-0">เลือกสินค้าสำหรับออก Invoice</h6>
          </div>
          <div class="card-body">
            <div v-if="loading" class="text-center py-3">
              <div class="spinner-border" role="status">
                <span class="sr-only">Loading...</span>
              </div>
              <p class="mt-2">กำลังโหลดข้อมูลสินค้า...</p>
            </div>
            
            <div v-else>
              <!-- Select All Checkbox -->
              <div class="mb-3">
                <label class="d-flex align-items-center">
                  <input
                    type="checkbox"
                    :checked="isAllSelected"
                    @change="toggleSelectAll"
                    class="mr-2"
                  />
                  <span class="title-text">เลือกทั้งหมด</span>
                </label>
              </div>

              <!-- Stock Items Table -->
              <DataTable
                :value="stockItems"
                dataKey="id"
                :paginator="false"
                class="p-datatable-sm"
                :scrollable="true"
                scrollHeight="400px"
              >
                <Column :exportable="false" style="width: 50px">
                  <template #body="slotProps">
                    <input
                      type="checkbox"
                      :checked="selectedItems.includes(slotProps.data.id)"
                      @change="toggleItemSelection(slotProps.data)"
                    />
                  </template>
                </Column>
                
                <Column field="stockNumber" header="Stock Number" style="width: 120px"></Column>
                <Column field="productNumber" header="Product Number" style="width: 120px"></Column>
                <Column field="description" header="รายละเอียด" style="min-width: 200px"></Column>
                <Column field="qty" header="จำนวน" style="width: 80px">
                  <template #body="slotProps">
                    <div class="text-center">{{ slotProps.data.qty }}</div>
                  </template>
                </Column>
                <Column field="appraisalPrice" header="ราคาประเมิน" style="width: 120px">
                  <template #body="slotProps">
                    <div class="text-right">{{ formatCurrency(slotProps.data.appraisalPrice) }}</div>
                  </template>
                </Column>
                <Column header="ราคารวม" style="width: 120px">
                  <template #body="slotProps">
                    <div class="text-right">{{ formatCurrency(slotProps.data.appraisalPrice * slotProps.data.qty) }}</div>
                  </template>
                </Column>
              </DataTable>

              <!-- Total Summary -->
              <div class="mt-3">
                <div class="d-flex justify-content-end">
                  <div class="summary-container">
                    <div class="row">
                      <div class="col-6 text-right">
                        <strong>จำนวนรายการที่เลือก:</strong>
                      </div>
                      <div class="col-6 text-right">
                        <strong>{{ selectedItemsCount }} รายการ</strong>
                      </div>
                    </div>
                    <div class="row">
                      <div class="col-6 text-right">
                        <strong>ยอดรวม:</strong>
                      </div>
                      <div class="col-6 text-right">
                        <strong>{{ formatCurrency(totalAmount) }} {{ invoiceForm.currencyUnit }}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="btn-submit-container mt-3">
          <button
            class="btn btn-success mr-2"
            type="button"
            @click="generateInvoice"
            :disabled="loading || selectedItemsCount === 0"
          >
            <i class="bi bi-file-earmark-pdf mr-1"></i>
            สร้าง Invoice PDF
          </button>
          <button class="btn btn-secondary" type="button" @click="closeModal">
            <i class="bi bi-x-circle mr-1"></i>
            ยกเลิก
          </button>
        </div>
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { usrSaleOrderApiStore } from '@/stores/modules/api/sale/sale-order-store.js'
import { invoicePdfService } from '@/services/helper/pdf/invoice/invoice-pdf-integration.js'

const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))

export default {
  name: 'InvoiceModal',

  components: {
    modal,
    DataTable,
    Column
  },

  props: {
    isShowModal: {
      type: Boolean,
      default: false
    },
    saleOrderData: {
      type: Object,
      default: () => ({})
    }
  },

  emits: ['close-modal'],

  data() {
    return {
      loading: false,
      stockItems: [],
      selectedItems: [],
      invoiceForm: {
        currencyUnit: 'THB',
        currencyRate: 1.00
      }
    }
  },

  computed: {
    isAllSelected() {
      return this.stockItems.length > 0 && this.selectedItems.length === this.stockItems.length
    },

    selectedItemsCount() {
      return this.selectedItems.length
    },

    totalAmount() {
      const selectedStockItems = this.stockItems.filter(item => 
        this.selectedItems.includes(item.id)
      )
      
      return selectedStockItems.reduce((total, item) => {
        return total + (item.appraisalPrice * item.qty)
      }, 0)
    }
  },

  watch: {
    isShowModal: {
      handler(newVal) {
        if (newVal && this.saleOrderData.soNumber) {
          this.loadSaleOrderData()
        }
      },
      immediate: true
    },

    saleOrderData: {
      handler(newVal) {
        if (newVal && newVal.currencyUnit) {
          this.invoiceForm.currencyUnit = newVal.currencyUnit || 'THB'
          this.invoiceForm.currencyRate = newVal.currencyRate || 1.00
        }
      },
      deep: true,
      immediate: true
    }
  },

  methods: {
    async loadSaleOrderData() {
      try {
        this.loading = true
        const saleOrderStore = usrSaleOrderApiStore()
        const response = await saleOrderStore.fetchGet({
          formValue: { soNumber: this.saleOrderData.soNumber }
        })

        if (response && response.data) {
          const parsedData = JSON.parse(response.data)
          
          // Filter only stock items (items with stockNumber)
          this.stockItems = parsedData.stockItems || parsedData.filter(item => item.stockNumber) || []
          
          // Add unique ID for each item if not present
          this.stockItems = this.stockItems.map((item, index) => ({
            ...item,
            id: item.id || `stock_${index}_${Date.now()}`
          }))

          console.log('Loaded stock items for invoice:', this.stockItems)
        }
      } catch (error) {
        console.error('Error loading sale order data:', error)
        alert('ไม่สามารถโหลดข้อมูลใบสั่งขายได้: ' + error.message)
      } finally {
        this.loading = false
      }
    },

    toggleSelectAll() {
      if (this.isAllSelected) {
        this.selectedItems = []
      } else {
        this.selectedItems = this.stockItems.map(item => item.id)
      }
    },

    toggleItemSelection(item) {
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

    async generateInvoice() {
      try {
        if (this.selectedItemsCount === 0) {
          alert('กรุณาเลือกสินค้าอย่างน้อย 1 รายการ')
          return
        }

        this.loading = true

        // Get selected items
        const selectedStockItems = this.stockItems.filter(item => 
          this.selectedItems.includes(item.id)
        )

        // Prepare invoice data
        const invoiceData = {
          saleOrder: this.saleOrderData,
          items: selectedStockItems,
          customer: {
            name: this.saleOrderData.customerName,
            address: this.saleOrderData.customerAddress,
            phone: this.saleOrderData.customerTel,
            email: this.saleOrderData.customerEmail
          },
          currency: {
            unit: this.invoiceForm.currencyUnit,
            rate: this.invoiceForm.currencyRate
          },
          totals: {
            subtotal: this.totalAmount,
            total: this.totalAmount
          }
        }

        // Validate data before generating PDF
        const validation = invoicePdfService.previewInvoiceData(invoiceData)
        
        if (!validation.valid) {
          alert('ข้อมูลไม่ถูกต้อง:\n' + validation.errors.join('\n'))
          return
        }

        // Generate PDF using the service
        console.log('Generating invoice PDF with data:', invoiceData)
        
        await invoicePdfService.generateInvoicePDF(invoiceData, {
          download: true,
          open: false
        })
        
        alert('สร้าง Invoice PDF สำเร็จ')
        
        this.closeModal()
      } catch (error) {
        console.error('Error generating invoice:', error)
        alert('เกิดข้อผิดพลาดในการสร้าง Invoice: ' + error.message)
      } finally {
        this.loading = false
      }
    },

    closeModal() {
      this.selectedItems = []
      this.stockItems = []
      this.$emit('close-modal')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form';
@import '@/assets/scss/custom-style/standard-data-table';

.summary-container {
  min-width: 300px;
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 0.25rem;
  border: 1px solid #e9ecef;
}

.btn-action-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
}
</style>