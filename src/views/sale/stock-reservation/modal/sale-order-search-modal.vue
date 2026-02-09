<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="dialogHeader"
    :style="{ width: '90vw', maxWidth: '1200px' }"
    :closable="true"
    :draggable="false"
    @hide="onClose"
  >
    <!-- Search Section -->
    <div class="modal-search-section mb-3">
      <div class="row">
        <div class="col-md-4">
          <label class="form-label">เลขที่ใบสั่งขาย</label>
          <input
            type="text"
            v-model="searchForm.saleOrderNumber"
            class="form-control"
            placeholder="SO-2025-001"
            @keyup.enter="onSearch"
          />
        </div>
        <div class="col-md-4">
          <label class="form-label">ชื่อลูกค้า</label>
          <input
            type="text"
            v-model="searchForm.customerName"
            class="form-control"
            placeholder="ชื่อลูกค้า"
            @keyup.enter="onSearch"
          />
        </div>
        <div class="col-md-4">
          <label class="form-label">สถานะ</label>
          <Dropdown
            v-model="searchForm.status"
            :options="statusOptions"
            optionLabel="name"
            optionValue="value"
            placeholder="เลือกสถานะ"
            class="w-100"
            showClear
          />
        </div>
      </div>
      <div class="row mt-2">
        <div class="col-md-12">
          <button
            class="btn btn-primary me-2"
            @click="onSearch"
            :disabled="loading"
          >
            <i class="bi bi-search me-1"></i>
            ค้นหา
          </button>
          <button
            class="btn btn-outline-secondary"
            @click="clearSearch"
          >
            <i class="bi bi-arrow-clockwise me-1"></i>
            ล้างข้อมูล
          </button>
        </div>
      </div>
    </div>

    <!-- Results Table -->
    <div class="modal-table-section">
      <DataTable
        :value="saleOrders"
        dataKey="saleOrderId"
        :paginator="true"
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20]"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        currentPageReportTemplate="แสดง {first} ถึง {last} จาก {totalRecords} รายการ"
        :loading="loading"
        responsiveLayout="scroll"
        class="modal-data-table"
      >
        <!-- Sale Order Number -->
        <Column field="number" header="เลขที่ใบสั่งขาย" :sortable="true" style="min-width: 140px">
          <template #body="{ data }">
            <span class="font-weight-bold text-primary">{{ data.number }}</span>
          </template>
        </Column>

        <!-- Order Date -->
        <Column field="orderDate" header="วันที่ใบสั่งขาย" :sortable="true" style="min-width: 120px">
          <template #body="{ data }">
            {{ formatDate(data.orderDate) }}
          </template>
        </Column>

        <!-- Customer Info -->
        <Column field="customerName" header="ลูกค้า" :sortable="true" style="min-width: 200px">
          <template #body="{ data }">
            <div class="customer-info">
              <div class="customer-name">{{ data.customerName }}</div>
              <div class="customer-phone text-muted">{{ data.customerPhone }}</div>
            </div>
          </template>
        </Column>

        <!-- Stock Items -->
        <Column header="รายการสต็อก" style="min-width: 120px">
          <template #body="{ data }">
            <div class="text-center">
              <span class="badge badge-info">
                <i class="bi bi-box me-1"></i>
                {{ getStockItemsCount(data.items) }} รายการ
              </span>
            </div>
          </template>
        </Column>

        <!-- Stock Status -->
        <Column header="สถานะสต็อก" style="min-width: 140px">
          <template #body="{ data }">
            <div class="stock-status-summary">
              <div class="status-item">
                <span class="status-label">พร้อมจอง:</span>
                <span class="text-success font-weight-bold">{{ getAvailableItemsCount(data.items) }}</span>
              </div>
              <div class="status-item">
                <span class="status-label">จองแล้ว:</span>
                <span class="text-warning font-weight-bold">{{ getReservedItemsCount(data.items) }}</span>
              </div>
              <div class="status-item">
                <span class="status-label">หมดสต็อก:</span>
                <span class="text-danger font-weight-bold">{{ getOutOfStockItemsCount(data.items) }}</span>
              </div>
            </div>
          </template>
        </Column>

        <!-- Expected Delivery -->
        <Column field="expectedDeliveryDate" header="กำหนดส่งมอบ" :sortable="true" style="min-width: 120px">
          <template #body="{ data }">
            <div :class="getDeliveryDateClass(data.expectedDeliveryDate)">
              {{ formatDate(data.expectedDeliveryDate) }}
            </div>
          </template>
        </Column>

        <!-- Total Amount -->
        <Column field="totalAmount" header="ยอดรวม" :sortable="true" style="min-width: 120px">
          <template #body="{ data }">
            <div class="text-right font-weight-bold">
              {{ formatCurrency(data.totalAmount) }}
            </div>
          </template>
        </Column>

        <!-- Status -->
        <Column field="status" header="สถานะ" :sortable="true" style="min-width: 120px">
          <template #body="{ data }">
            <span :class="getStatusClass(data.status)">
              {{ getStatusText(data.status) }}
            </span>
          </template>
        </Column>

        <!-- Actions -->
        <Column header="การดำเนินการ" style="width: 120px">
          <template #body="{ data }">
            <button
              class="btn btn-sm btn-success"
              @click="selectSaleOrder(data)"
              :disabled="!hasStockItems(data.items)"
              :title="hasStockItems(data.items) ? 'เลือกใบสั่งขายนี้' : 'ไม่มีรายการสต็อกที่สามารถจองได้'"
            >
              <i class="bi bi-check-circle me-1"></i>
              เลือก
            </button>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- No Results Message -->
    <div v-if="!loading && saleOrders.length === 0" class="text-center text-muted py-4">
      <i class="bi bi-inbox display-1"></i>
      <div class="mt-2">ไม่พบข้อมูลใบสั่งขาย</div>
      <div class="text-sm">ลองปรับเปลี่ยนเงื่อนไขการค้นหา</div>
    </div>

    <!-- Stock Summary Footer -->
    <div v-if="saleOrders.length > 0" class="stock-summary-footer mt-3">
      <div class="row">
        <div class="col-md-3">
          <div class="summary-card text-center">
            <div class="summary-value text-primary">{{ overallSummary.totalOrders }}</div>
            <div class="summary-label">ใบสั่งขายทั้งหมด</div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="summary-card text-center">
            <div class="summary-value text-info">{{ overallSummary.totalStockItems }}</div>
            <div class="summary-label">รายการสต็อกทั้งหมด</div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="summary-card text-center">
            <div class="summary-value text-success">{{ overallSummary.availableItems }}</div>
            <div class="summary-label">พร้อมจอง</div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="summary-card text-center">
            <div class="summary-value text-warning">{{ overallSummary.reservedItems }}</div>
            <div class="summary-label">จองแล้ว</div>
          </div>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script>
import Dialog from 'primevue/dialog'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dropdown from 'primevue/dropdown'
import { formatDecimal } from '@/services/utils/decimal.js'

export default {
  name: 'SaleOrderSearchModal',

  components: {
    Dialog,
    DataTable,
    Column,
    Dropdown
  },

  emits: ['update:isShow', 'select', 'close'],

  props: {
    isShow: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      visible: false,
      loading: false,
      
      searchForm: {
        saleOrderNumber: '',
        customerName: '',
        status: null
      },

      saleOrders: [],

      statusOptions: [
        { name: 'ยืนยันแล้ว', value: 'Confirmed' },
        { name: 'ส่งมอบบางส่วน', value: 'PartiallyFulfilled' },
        { name: 'ส่งมอบครบถ้วน', value: 'Fulfilled' }
      ]
    }
  },

  computed: {
    dialogHeader() {
      return 'เลือกใบสั่งขายสำหรับจองสต็อก'
    },

    overallSummary() {
      return {
        totalOrders: this.saleOrders.length,
        totalStockItems: this.saleOrders.reduce((sum, order) => sum + this.getStockItemsCount(order.items), 0),
        availableItems: this.saleOrders.reduce((sum, order) => sum + this.getAvailableItemsCount(order.items), 0),
        reservedItems: this.saleOrders.reduce((sum, order) => sum + this.getReservedItemsCount(order.items), 0)
      }
    }
  },

  watch: {
    isShow: {
      handler(newVal) {
        this.visible = newVal
        if (newVal) {
          this.loadSaleOrders()
        }
      },
      immediate: true
    },

    visible(newVal) {
      this.$emit('update:isShow', newVal)
    }
  },

  methods: {
    async loadSaleOrders() {
      try {
        this.loading = true
        
        // TODO: Replace with actual API call
        // const response = await this.saleOrderStore.fetchSaleOrdersWithStockItems(this.searchForm)
        
        // Mock data for demonstration
        this.saleOrders = [
          {
            saleOrderId: 1,
            number: 'SO-2025-001',
            orderDate: '2025-01-15',
            expectedDeliveryDate: '2025-02-15',
            customerName: 'บริษัท ABC จำกัด',
            customerPhone: '02-123-4567',
            totalAmount: 85000,
            status: 'Confirmed',
            items: [
              {
                itemId: 1,
                productId: 1,
                productName: 'Diamond Ring Set',
                itemType: 'Stock',
                quantity: 2,
                stockAvailable: 5,
                reserved: 0
              },
              {
                itemId: 2,
                productId: 2,
                productName: 'Custom Gold Necklace',
                itemType: 'Production',
                quantity: 1
              },
              {
                itemId: 3,
                productId: 3,
                productName: 'Gold Bracelet',
                itemType: 'Stock',
                quantity: 1,
                stockAvailable: 0,
                reserved: 2
              }
            ]
          },
          {
            saleOrderId: 2,
            number: 'SO-2025-002',
            orderDate: '2025-01-16',
            expectedDeliveryDate: '2025-03-01',
            customerName: 'คุณสมชาย ใจดี',
            customerPhone: '08-987-6543',
            totalAmount: 150000,
            status: 'Confirmed',
            items: [
              {
                itemId: 4,
                productId: 4,
                productName: 'Pearl Earrings',
                itemType: 'Stock',
                quantity: 1,
                stockAvailable: 3,
                reserved: 1
              },
              {
                itemId: 5,
                productId: 5,
                productName: 'Silver Chain',
                itemType: 'Stock',
                quantity: 2,
                stockAvailable: 8,
                reserved: 0
              }
            ]
          }
        ]
        
      } catch (error) {
        console.error('Error loading sale orders:', error)
      } finally {
        this.loading = false
      }
    },

    async onSearch() {
      await this.loadSaleOrders()
    },

    clearSearch() {
      this.searchForm = {
        saleOrderNumber: '',
        customerName: '',
        status: null
      }
      this.loadSaleOrders()
    },

    selectSaleOrder(saleOrder) {
      this.$emit('select', saleOrder)
    },

    onClose() {
      this.$emit('close')
    },

    // Helper methods
    hasStockItems(items) {
      return items && items.some(item => item.itemType === 'Stock')
    },

    getStockItemsCount(items) {
      if (!items) return 0
      return items.filter(item => item.itemType === 'Stock').length
    },

    getAvailableItemsCount(items) {
      if (!items) return 0
      return items.filter(item => 
        item.itemType === 'Stock' && 
        (item.stockAvailable || 0) - (item.reserved || 0) > 0
      ).length
    },

    getReservedItemsCount(items) {
      if (!items) return 0
      return items.filter(item => 
        item.itemType === 'Stock' && (item.reserved || 0) > 0
      ).length
    },

    getOutOfStockItemsCount(items) {
      if (!items) return 0
      return items.filter(item => 
        item.itemType === 'Stock' && 
        (item.stockAvailable || 0) - (item.reserved || 0) <= 0
      ).length
    },

    getStatusClass(status) {
      const classes = {
        'Confirmed': 'badge badge-success',
        'PartiallyFulfilled': 'badge badge-warning',
        'Fulfilled': 'badge badge-info'
      }
      return classes[status] || 'badge badge-secondary'
    },

    getStatusText(status) {
      const texts = {
        'Confirmed': 'ยืนยันแล้ว',
        'PartiallyFulfilled': 'ส่งมอบบางส่วน',
        'Fulfilled': 'ส่งมอบครบถ้วน'
      }
      return texts[status] || status
    },

    getDeliveryDateClass(date) {
      if (!date) return ''
      
      const today = new Date()
      const deliveryDate = new Date(date)
      const diffDays = Math.ceil((deliveryDate - today) / (1000 * 60 * 60 * 24))
      
      if (diffDays < 0) return 'text-danger font-weight-bold' // Overdue
      if (diffDays <= 7) return 'text-warning font-weight-bold' // Within a week
      return ''
    },

    formatDate(date) {
      if (!date) return '-'
      return new Date(date).toLocaleDateString('th-TH')
    },

    formatCurrency(amount) {
      return formatDecimal(amount, 2) + ' THB'
    }
  }
}
</script>

<style lang="scss" scoped>
.modal-search-section {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.modal-table-section {
  min-height: 400px;
}

.modal-data-table {
  .customer-info {
    .customer-name {
      font-weight: 600;
      color: #2c3e50;
    }
    
    .customer-phone {
      font-size: 0.85rem;
    }
  }
}

.stock-status-summary {
  .status-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.25rem;
    font-size: 0.85rem;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .status-label {
    margin-right: 0.5rem;
  }
}

.stock-summary-footer {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.summary-card {
  background: white;
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  
  .summary-value {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
  }
  
  .summary-label {
    font-size: 0.8rem;
    color: #6c757d;
    font-weight: 500;
  }
}

.badge {
  padding: 0.25em 0.5em;
  font-size: 0.75em;
  border-radius: 0.25rem;
  font-weight: 600;
  
  &.badge-success {
    background-color: #28a745;
    color: white;
  }
  
  &.badge-warning {
    background-color: #ffc107;
    color: #212529;
  }
  
  &.badge-info {
    background-color: #17a2b8;
    color: white;
  }
  
  &.badge-secondary {
    background-color: #6c757d;
    color: white;
  }
}

.form-label {
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.5rem;
}

.text-muted {
  color: #6c757d !important;
}

.text-danger {
  color: #dc3545 !important;
}

.text-warning {
  color: #ffc107 !important;
}

.text-success {
  color: #28a745 !important;
}

.text-primary {
  color: #007bff !important;
}

.text-info {
  color: #17a2b8 !important;
}

.text-right {
  text-align: right;
}

.text-center {
  text-align: center;
}

.font-weight-bold {
  font-weight: 600;
}

.me-1 {
  margin-right: 0.25rem;
}

.me-2 {
  margin-right: 0.5rem;
}

.mb-3 {
  margin-bottom: 1rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.mt-3 {
  margin-top: 1rem;
}

.py-4 {
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
}

.display-1 {
  font-size: 6rem;
  opacity: 0.3;
}

.text-sm {
  font-size: 0.875rem;
}
</style>