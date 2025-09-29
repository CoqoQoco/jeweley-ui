<template>
  <div class="mt-2">
    <!-- Sale Order Information Section -->
    <div class="card-container">
      <div class="card-header">
        <h6 class="mb-0">ข้อมูลใบสั่งขาย</h6>
      </div>
      <div class="card-body">
        <div class="form-col-container">
          <!-- Sale Order Number -->
          <div>
            <span class="title-text">เลขที่ใบสั่งขาย</span>
            <input
              :class="['form-control bg-input']"
              type="text"
              v-model.trim="formSaleOrder.number"
              placeholder="SO-2025-001"
            />
          </div>

          <!-- Sale Order Date -->
          <div>
            <span class="title-text">วันที่ใบสั่งขาย</span>
            <Calendar
              class="w-100"
              v-model="formSaleOrder.date"
              showIcon
              :manualInput="false"
              placeholder="เลือกวันที่"
              dateFormat="dd/mm/yy"
            />
          </div>

          <!-- Expected Delivery Date -->
          <div>
            <span class="title-text">วันที่คาดหวังส่งมอบ</span>
            <Calendar
              class="w-100"
              v-model="formSaleOrder.expectedDeliveryDate"
              showIcon
              :manualInput="false"
              placeholder="เลือกวันที่"
              dateFormat="dd/mm/yy"
            />
          </div>

          <!-- Status -->
          <div>
            <span class="title-text">สถานะ</span>
            <Dropdown
              v-model="formSaleOrder.status"
              :options="statusOptions"
              optionLabel="name"
              optionValue="value"
              placeholder="เลือกสถานะ"
              class="w-100"
            />
          </div>
        </div>

        <div class="form-col-container mt-2">
          <!-- Quotation Reference -->
          <div>
            <span class="title-text">อ้างอิงใบเสนอราคา</span>
            <input
              :class="['form-control bg-input']"
              type="text"
              v-model.trim="formSaleOrder.quotationNumber"
              placeholder="QUO-2025-001"
              readonly
            />
          </div>

          <!-- Payment Terms -->
          <div>
            <span class="title-text">เงื่อนไขการชำระเงิน</span>
            <Dropdown
              v-model="formSaleOrder.paymentTerms"
              :options="paymentTermsOptions"
              optionLabel="name"
              optionValue="value"
              placeholder="เลือกเงื่อนไขการชำระ"
              class="w-100"
              @change="onPaymentTermsChange"
            />
          </div>

          <!-- Deposit Required -->
          <div>
            <label class="d-flex align-items-center">
              <input
                type="checkbox"
                v-model="formSaleOrder.depositRequired"
                @change="onDepositRequiredChange"
                class="mr-2"
              />
              <span class="title-text">ต้องการเงินมัดจำ</span>
            </label>
          </div>

          <!-- Deposit Percentage -->
          <div v-if="formSaleOrder.depositRequired">
            <span class="title-text">เปอร์เซ็นต์เงินมัดจำ (%)</span>
            <input
              :class="['form-control bg-input']"
              type="number"
              min="0"
              max="100"
              step="0.01"
              v-model.number="formSaleOrder.depositPercentage"
              placeholder="50.00"
              @input="updateSummary"
            />
          </div>

          <!-- Priority -->
          <div>
            <span class="title-text">ลำดับความสำคัญ</span>
            <Dropdown
              v-model="formSaleOrder.priority"
              :options="priorityOptions"
              optionLabel="name"
              optionValue="value"
              placeholder="เลือกลำดับความสำคัญ"
              class="w-100"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Demo Actions Section -->
    <div class="card-container mt-3" v-if="quotationItems.length === 0">
      <div class="card-header">
        <h6 class="mb-0">สำหรับการทดสอบระบบ</h6>
      </div>
      <div class="card-body">
        <div class="alert alert-info" role="alert">
          <i class="bi bi-info-circle mr-2"></i>
          ยังไม่มีใบเสนอราคาในระบบ คุณสามารถโหลดข้อมูลตัวอย่างเพื่อทดสอบการทำงานได้
        </div>
        <div class="demo-actions">
          <button
            class="btn btn-outline-primary mr-2"
            type="button"
            @click="loadDemoQuotation1"
          >
            <i class="bi bi-file-text mr-1"></i>
            โหลดใบเสนอราคา #1 (สินค้าคงคลัง)
          </button>
          <button
            class="btn btn-outline-success mr-2"
            type="button"
            @click="loadDemoQuotation2"
          >
            <i class="bi bi-tools mr-1"></i>
            โหลดใบเสนอราคา #2 (สินค้าผลิต)
          </button>
          <button
            class="btn btn-outline-warning"
            type="button"
            @click="loadDemoQuotation3"
          >
            <i class="bi bi-collection mr-1"></i>
            โหลดใบเสนอราคา #3 (สินค้าผสม)
          </button>
        </div>
      </div>
    </div>

    <!-- Customer Information Section -->
    <div class="card-container mt-3" v-if="quotationItems.length > 0">
      <div class="card-header">
        <h6 class="mb-0">ข้อมูลลูกค้า</h6>
      </div>
      <div class="card-body">
        <div class="form-col-container">
          <div>
            <span class="title-text">ชื่อลูกค้า</span>
            <div class="customer-info-display">
              {{ formSaleOrder.customerName || '-' }}
            </div>
          </div>

          <div>
            <span class="title-text">ที่อยู่</span>
            <div class="customer-info-display">
              {{ formSaleOrder.customerAddress || '-' }}
            </div>
          </div>

          <div>
            <span class="title-text">เบอร์โทร</span>
            <div class="customer-info-display">
              {{ formSaleOrder.customerPhone || '-' }}
            </div>
          </div>

          <div>
            <span class="title-text">อีเมล</span>
            <div class="customer-info-display">
              {{ formSaleOrder.customerEmail || '-' }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quotation Items Selection Grid -->
    <div class="card-container mt-3">
      <div class="card-header">
        <h6 class="mb-0">รายการสินค้าจากใบเสนอราคา</h6>
        <div class="card-header-actions">
          <label class="d-flex align-items-center">
            <input
              type="checkbox"
              :checked="allItemsSelected"
              @change="toggleAllItems"
              class="mr-2"
            />
            <span>เลือกทั้งหมด</span>
          </label>
        </div>
      </div>
      <div class="card-body p-0">
        <DataTableWithPaging
          :items="quotationItems"
          :columns="quotationItemColumns"
          dataKey="productId"
          :paginator="false"
          scrollHeight="400px"
          :selectionMode="false"
          emptyMessage="ยังไม่มีรายการสินค้า กรุณาเลือกใบเสนอราคา"
        >
          <!-- Custom Column Templates -->
          <template #isSelectedTemplate="{ data }">
            <input
              type="checkbox"
              v-model="data.isSelected"
              @change="updateItemSelection(data)"
              class="form-check-input"
            />
          </template>

          <template #itemTypeTemplate="{ data }">
            <span :class="getItemTypeClass(data.itemType)">
              <i :class="getItemTypeIcon(data.itemType)" class="mr-1"></i>
              {{ getItemTypeText(data.itemType) }}
            </span>
          </template>

          <template #productNumberTemplate="{ data }">
            <span class="font-weight-bold">{{ data.productNumber }}</span>
          </template>

          <template #productNameTemplate="{ data }">
            <div class="product-description">
              {{ data.productName }}
            </div>
          </template>

          <template #availabilityInfoTemplate="{ data }">
            <div v-if="data.itemType === 'Stock'">
              <div class="availability-info">
                <span :class="getStockStatusClass(data.stockAvailable, data.quantity)">
                  <i class="bi bi-box mr-1"></i>
                  คงคลัง: {{ data.stockAvailable || 0 }}
                </span>
              </div>
            </div>
            <div v-else>
              <div class="production-info">
                <span class="badge badge-warning">
                  <i class="bi bi-tools mr-1"></i>
                  ผลิต {{ data.estimatedProductionDays || 0 }} วัน
                </span>
              </div>
            </div>
          </template>

          <template #quantityTemplate="{ data }">
            <input
              type="number"
              min="1"
              step="1"
              v-model.number="data.quantity"
              @input="updateItemTotal(data)"
              :disabled="!data.isSelected"
              class="form-control form-control-sm text-center"
              :class="{ 'is-invalid': isQuantityInvalid(data) }"
            />
            <div v-if="isQuantityInvalid(data)" class="invalid-feedback">
              จำนวนเกินคงคลัง
            </div>
          </template>

          <template #lineTotalTemplate="{ data }">
            <div class="text-right font-weight-bold">
              <span v-if="data.isSelected">
                {{ formatCurrency(data.lineTotal) }}
              </span>
              <span v-else class="text-muted">-</span>
            </div>
          </template>
        </DataTableWithPaging>
      </div>
    </div>

    <!-- Order Summary -->
    <div class="card-container mt-3">
      <div class="card-header">
        <h6 class="mb-0">สรุปใบสั่งขาย</h6>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-4">
            <!-- Selected Items Summary -->
            <div class="summary-section">
              <h6>รายการที่เลือก</h6>
              <div class="summary-item">
                <span>สินค้าคงคลัง:</span>
                <span class="font-weight-bold">{{ selectedStockItemsCount }} รายการ</span>
              </div>
              <div class="summary-item">
                <span>สินค้าผลิต:</span>
                <span class="font-weight-bold">{{ selectedProductionItemsCount }} รายการ</span>
              </div>
              <div class="summary-item">
                <span>รวมทั้งหมด:</span>
                <span class="font-weight-bold">{{ selectedItemsCount }} รายการ</span>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <!-- Production Items Deposit -->
            <div class="summary-section" v-if="selectedProductionItemsCount > 0">
              <h6>เงินมัดจำสินค้าผลิต</h6>
              <div class="summary-item">
                <span>ยอดสินค้าผลิต:</span>
                <span class="font-weight-bold">{{ formatCurrency(productionItemsTotal) }}</span>
              </div>
              <div class="summary-item" v-if="formSaleOrder.depositRequired">
                <span>เงินมัดจำ ({{ formSaleOrder.depositPercentage || 0 }}%):</span>
                <span class="font-weight-bold text-info">{{ formatCurrency(productionDepositAmount) }}</span>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <!-- Total Summary -->
            <div class="summary-section">
              <h6>สรุปยอดรวม</h6>
              <div class="summary-item">
                <span>ยอดรวมรายการที่เลือก:</span>
                <span class="font-weight-bold">{{ formatCurrency(selectedItemsTotal) }}</span>
              </div>
              <div class="summary-item" v-if="formSaleOrder.depositRequired">
                <span>เงินมัดจำที่ต้องชำระ:</span>
                <span class="font-weight-bold text-success">{{ formatCurrency(totalDepositAmount) }}</span>
              </div>
              <div class="summary-item border-top pt-2 mt-2">
                <span class="h6">ยอดรวมใบสั่งขาย:</span>
                <span class="h6 font-weight-bold text-primary">{{ formatCurrency(totalOrderAmount) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Notes -->
        <div class="row mt-3">
          <div class="col-md-12">
            <div>
              <span class="title-text">หมายเหตุใบสั่งขาย</span>
              <textarea
                class="form-control"
                rows="3"
                v-model="formSaleOrder.remark"
                placeholder="หมายเหตุเพิ่มเติมสำหรับใบสั่งขาย..."
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Validation Messages -->
        <div class="row mt-3" v-if="validationErrors.length > 0">
          <div class="col-md-12">
            <div class="alert alert-warning">
              <h6><i class="bi bi-exclamation-triangle mr-2"></i>ข้อควรระวัง:</h6>
              <ul class="mb-0">
                <li v-for="error in validationErrors" :key="error">{{ error }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sales Flow Actions -->
    <div class="card-container mt-3" v-if="formSaleOrder.status === 'Confirmed'">
      <div class="card-header">
        <h6 class="mb-0">ขั้นตอนการดำเนินการต่อ</h6>
      </div>
      <div class="card-body">
        <div class="sales-flow-actions">
          <!-- Production Order Section -->
          <div class="flow-section" v-if="selectedProductionItemsCount > 0">
            <div class="flow-section-header">
              <h6><i class="bi bi-tools mr-2"></i>การผลิตสินค้า</h6>
              <span class="badge badge-info">{{ selectedProductionItemsCount }} รายการ</span>
            </div>
            <p class="text-muted">สินค้าที่ต้องผลิตตามคำสั่งซื้อ</p>
            <button 
              class="btn btn-warning mr-2"
              @click="createProductionOrder"
              :disabled="loading"
            >
              <i class="bi bi-tools mr-1"></i>
              สร้างใบสั่งผลิต
            </button>
            <button 
              class="btn btn-outline-info"
              @click="viewProductionStatus"
            >
              <i class="bi bi-eye mr-1"></i>
              ดูสถานะการผลิต
            </button>
          </div>

          <!-- Stock Reservation Section -->
          <div class="flow-section" v-if="selectedStockItemsCount > 0">
            <div class="flow-section-header">
              <h6><i class="bi bi-box mr-2"></i>การจองสต็อก</h6>
              <span class="badge badge-success">{{ selectedStockItemsCount }} รายการ</span>
            </div>
            <p class="text-muted">สินค้าคงคลังที่ต้องจองสำหรับลูกค้า</p>
            <button 
              class="btn btn-info mr-2"
              @click="createStockReservation"
              :disabled="loading"
            >
              <i class="bi bi-bookmark mr-1"></i>
              จองสต็อกสินค้า
            </button>
            <button 
              class="btn btn-outline-info"
              @click="viewStockStatus"
            >
              <i class="bi bi-eye mr-1"></i>
              ดูสถานะสต็อก
            </button>
          </div>

          <!-- Delivery Section -->
          <div class="flow-section">
            <div class="flow-section-header">
              <h6><i class="bi bi-truck mr-2"></i>การส่งมอบ</h6>
              <span class="badge badge-primary">พร้อมส่งมอบ</span>
            </div>
            <p class="text-muted">จัดส่งสินค้าให้ลูกค้าตามที่สั่งซื้อ</p>
            <button 
              class="btn btn-primary mr-2"
              @click="createDeliveryNote"
              :disabled="loading"
            >
              <i class="bi bi-truck mr-1"></i>
              สร้างใบส่งของ
            </button>
          </div>

          <!-- Invoice Section -->
          <div class="flow-section">
            <div class="flow-section-header">
              <h6><i class="bi bi-receipt mr-2"></i>การเรียกเก็บเงิน</h6>
              <span class="badge badge-warning">{{ formatCurrency(totalOrderAmount) }}</span>
            </div>
            <p class="text-muted">ออกใบแจ้งหนี้และติดตามการชำระเงิน</p>
            <button 
              class="btn btn-success mr-2"
              @click="createInvoice"
              :disabled="loading"
            >
              <i class="bi bi-receipt mr-1"></i>
              สร้างใบแจ้งหนี้
            </button>
            <button 
              class="btn btn-outline-success"
              @click="viewPaymentStatus"
            >
              <i class="bi bi-wallet2 mr-1"></i>
              ติดตามการชำระ
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="btn-submit-container mt-3">
      <button
        class="btn btn-outline-secondary mr-2"
        type="button"
        @click="saveDraft"
        :disabled="loading || selectedItemsCount === 0 || formSaleOrder.status === 'Confirmed'"
      >
        <i class="bi bi-file-earmark mr-1"></i>
        บันทึกร่าง
      </button>
      
      <button
        class="btn btn-success mr-2"
        type="button"
        @click="confirmOrder"
        :disabled="loading || selectedItemsCount === 0 || hasValidationErrors || formSaleOrder.status === 'Confirmed'"
      >
        <i class="bi bi-check-circle mr-1"></i>
        {{ formSaleOrder.status === 'Confirmed' ? 'ยืนยันแล้ว' : 'ยืนยันใบสั่งขาย' }}
      </button>

      <button
        class="btn btn-secondary mr-2"
        type="button"
        @click="clearForm"
      >
        <i class="bi bi-arrow-clockwise mr-1"></i>
        ล้างข้อมูล
      </button>

      <button
        class="btn btn-outline-danger mr-2"
        type="button"
        @click="cancelOrder"
      >
        <i class="bi bi-x-circle mr-1"></i>
        ยกเลิก
      </button>

      <!-- Print Order Button -->
      <button
        class="btn btn-outline-primary mr-2"
        type="button"
        @click="printSaleOrder"
        :disabled="formSaleOrder.status !== 'Confirmed'"
      >
        <i class="bi bi-printer mr-1"></i>
        พิมพ์ใบสั่งขาย
      </button>
    </div>
  </div>
</template>

<script>
import DataTableWithPaging from '@/components/prime-vue/DataTableWithPaging.vue'
import Calendar from 'primevue/calendar'
import Dropdown from 'primevue/dropdown'
import { formatDecimal } from '@/services/utils/decimal.js'
import { success, error, confirmSubmit } from '@/services/alert/sweetAlerts.js'

export default {
  name: 'SaleOrderView',

  components: {
    DataTableWithPaging,
    Calendar,
    Dropdown
  },

  emits: ['update:modelForm', 'update:modelQuotation'],

  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    },
    modelQuotation: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    return {
      loading: false,
      quotationItems: [], // Items from quotation
      
      // Column definition for DataTableWithPaging
      quotationItemColumns: [
        { 
          field: 'isSelected', 
          header: 'เลือก', 
          width: '80px',
          sortable: false
        },
        { 
          field: 'itemType', 
          header: 'ประเภท', 
          width: '100px'
        },
        { 
          field: 'productNumber', 
          header: 'รหัสสินค้า', 
          minWidth: '120px'
        },
        { 
          field: 'productName', 
          header: 'ชื่อสินค้า', 
          minWidth: '200px'
        },
        { 
          field: 'availabilityInfo', 
          header: 'สถานะ/ข้อมูลเพิ่มเติม', 
          minWidth: '180px',
          sortable: false
        },
        { 
          field: 'quantity', 
          header: 'จำนวน', 
          minWidth: '100px',
          sortable: false
        },
        { 
          field: 'unitPrice', 
          header: 'ราคาต่อหน่วย', 
          minWidth: '120px',
          align: 'right',
          format: 'currency'
        },
        { 
          field: 'lineTotal', 
          header: 'ราคารวม', 
          minWidth: '120px',
          align: 'right',
          sortable: false
        }
      ],
      
      formSaleOrder: {
        salesOrderId: null,
        quotationId: null,
        customerId: null,
        customerName: '',
        customerAddress: '',
        customerPhone: '',
        customerEmail: '',
        number: '',
        date: new Date(),
        expectedDeliveryDate: null,
        status: 'Draft',
        quotationNumber: '',
        paymentTerms: 'Cash',
        depositRequired: false,
        depositPercentage: 50,
        priority: 'normal',
        totalAmount: 0,
        remark: ''
      },

      statusOptions: [
        { name: 'ร่าง', value: 'Draft' },
        { name: 'ยืนยันแล้ว', value: 'Confirmed' },
        { name: 'ส่งมอบบางส่วน', value: 'PartiallyFulfilled' },
        { name: 'ส่งมอบครบถ้วน', value: 'Fulfilled' }
      ],

      paymentTermsOptions: [
        { name: 'เงินสด', value: 'Cash' },
        { name: 'เครดิต 30 วัน', value: 'Credit30' },
        { name: 'เครดิต 60 วัน', value: 'Credit60' },
        { name: 'มัดจำ + ยอดคงเหลือ', value: 'DepositAndBalance' }
      ],

      priorityOptions: [
        { name: 'ปกติ', value: 'normal' },
        { name: 'สำคัญ', value: 'high' },
        { name: 'เร่งด่วน', value: 'urgent' },
        { name: 'วิกฤต', value: 'critical' }
      ]
    }
  },

  computed: {
    // Selection state
    allItemsSelected() {
      return this.quotationItems.length > 0 && this.quotationItems.every(item => item.isSelected)
    },

    selectedItems() {
      return this.quotationItems.filter(item => item.isSelected)
    },

    selectedItemsCount() {
      return this.selectedItems.length
    },

    selectedStockItemsCount() {
      return this.selectedItems.filter(item => item.itemType === 'Stock').length
    },

    selectedProductionItemsCount() {
      return this.selectedItems.filter(item => item.itemType === 'Production').length
    },

    // Price calculations
    selectedItemsTotal() {
      return this.selectedItems.reduce((sum, item) => sum + (item.lineTotal || 0), 0)
    },

    stockItemsTotal() {
      return this.selectedItems
        .filter(item => item.itemType === 'Stock')
        .reduce((sum, item) => sum + (item.lineTotal || 0), 0)
    },

    productionItemsTotal() {
      return this.selectedItems
        .filter(item => item.itemType === 'Production')
        .reduce((sum, item) => sum + (item.lineTotal || 0), 0)
    },

    productionDepositAmount() {
      if (!this.formSaleOrder.depositRequired) return 0
      return this.productionItemsTotal * (this.formSaleOrder.depositPercentage || 0) / 100
    },

    totalDepositAmount() {
      return this.productionDepositAmount
    },

    totalOrderAmount() {
      return this.selectedItemsTotal
    },

    // Validation
    validationErrors() {
      const errors = []
      
      if (this.selectedItemsCount === 0) {
        errors.push('กรุณาเลือกสินค้าอย่างน้อย 1 รายการ')
      }

      // Check stock availability
      this.selectedItems.forEach(item => {
        if (item.itemType === 'Stock' && this.isQuantityInvalid(item)) {
          errors.push(`${item.productName}: จำนวนเกินคงคลัง (คงคลัง: ${item.stockAvailable})`)
        }
      })

      // Check production items deposit requirement
      if (this.selectedProductionItemsCount > 0 && !this.formSaleOrder.depositRequired) {
        errors.push('สินค้าผลิตต้องการเงินมัดจำ กรุณาเลือก "ต้องการเงินมัดจำ"')
      }

      return errors
    },

    hasValidationErrors() {
      return this.validationErrors.length > 0
    }
  },

  watch: {
    modelForm: {
      handler(newVal) {
        if (newVal && Object.keys(newVal).length > 0) {
          this.handleProductSearch(newVal)
        }
      },
      deep: true
    },

    modelQuotation: {
      handler(newVal) {
        if (newVal && newVal.Number) {
          this.handleQuotationSearch(newVal)
        }
      },
      deep: true
    }
  },

  methods: {
    // Demo data loading methods
    loadDemoQuotation1() {
      // สินค้าคงคลังเท่านั้น
      this.loadDemoData({
        quotationNumber: 'QUO-2025-001',
        customerName: 'บริษัท ABC จำกัด',
        customerAddress: '123 ถนนสุขุมวิท กรุงเทพฯ 10110',
        customerPhone: '02-123-4567',
        customerEmail: 'contact@abc.com',
        items: [
          {
            productId: 1,
            productNumber: 'R001',
            productName: 'แหวนเพชรคู่ รุ่นคลาสสิค',
            itemType: 'Stock',
            quantity: 2,
            unitPrice: 15000,
            lineTotal: 30000,
            isSelected: false,
            stockAvailable: 5
          },
          {
            productId: 2,
            productNumber: 'B001',
            productName: 'สร้อยข้อมือทองคำแท้ 18K',
            itemType: 'Stock',
            quantity: 1,
            unitPrice: 12000,
            lineTotal: 12000,
            isSelected: false,
            stockAvailable: 3
          }
        ]
      })
    },

    loadDemoQuotation2() {
      // สินค้าผลิตเท่านั้น
      this.loadDemoData({
        quotationNumber: 'QUO-2025-002',
        customerName: 'คุณสมชาย ใจดี',
        customerAddress: '456 ถนนเพชรบุรี กรุงเทพฯ 10400',
        customerPhone: '08-987-6543',
        customerEmail: 'somchai@email.com',
        items: [
          {
            productId: 3,
            productNumber: 'N002',
            productName: 'สร้อยคอทองคำขาว สั่งทำพิเศษ',
            itemType: 'Production',
            quantity: 1,
            unitPrice: 25000,
            lineTotal: 25000,
            isSelected: false,
            estimatedProductionDays: 14
          },
          {
            productId: 4,
            productNumber: 'E001',
            productName: 'ต่างหูเพชรแบบสั่งทำ',
            itemType: 'Production',
            quantity: 1,
            unitPrice: 18000,
            lineTotal: 18000,
            isSelected: false,
            estimatedProductionDays: 10
          }
        ]
      })
    },

    loadDemoQuotation3() {
      // สินค้าผสม (คงคลัง + ผลิต)
      this.loadDemoData({
        quotationNumber: 'QUO-2025-003',
        customerName: 'บริษัท XYZ จำกัด',
        customerAddress: '789 ถนนรัชดาภิเษก กรุงเทพฯ 10320',
        customerPhone: '02-555-0123',
        customerEmail: 'order@xyz.co.th',
        items: [
          {
            productId: 5,
            productNumber: 'R002',
            productName: 'แหวนทองคำ 18K พร้อมส่ง',
            itemType: 'Stock',
            quantity: 3,
            unitPrice: 8000,
            lineTotal: 24000,
            isSelected: false,
            stockAvailable: 8
          },
          {
            productId: 6,
            productNumber: 'P001',
            productName: 'จี้ดวงใจ สั่งทำตามแบบ',
            itemType: 'Production',
            quantity: 2,
            unitPrice: 15000,
            lineTotal: 30000,
            isSelected: false,
            estimatedProductionDays: 7
          },
          {
            productId: 7,
            productNumber: 'B002',
            productName: 'กำไลเงินแท้ 925',
            itemType: 'Stock',
            quantity: 1,
            unitPrice: 3500,
            lineTotal: 3500,
            isSelected: false,
            stockAvailable: 2
          }
        ]
      })
    },

    loadDemoData(data) {
      // โหลดข้อมูลลูกค้า
      this.formSaleOrder.customerName = data.customerName
      this.formSaleOrder.customerAddress = data.customerAddress
      this.formSaleOrder.customerPhone = data.customerPhone
      this.formSaleOrder.customerEmail = data.customerEmail
      this.formSaleOrder.quotationNumber = data.quotationNumber
      
      // โหลดรายการสินค้า
      this.quotationItems = data.items
      
      // ตั้งค่าเลขที่ใบสั่งขายอัตโนมัติ
      if (!this.formSaleOrder.number) {
        this.formSaleOrder.number = 'SO-2025-' + String(Math.floor(Math.random() * 100) + 1).padStart(3, '0')
      }
      
      // ตั้งค่าวันที่คาดหวังส่งมอบ (14 วันจากวันนี้)
      if (!this.formSaleOrder.expectedDeliveryDate) {
        const deliveryDate = new Date()
        deliveryDate.setDate(deliveryDate.getDate() + 14)
        this.formSaleOrder.expectedDeliveryDate = deliveryDate
      }
      
      console.log('โหลดข้อมูลตัวอย่างเรียบร้อย:', data.quotationNumber)
    },

    async handleProductSearch(searchData) {
      console.log('Handle product search:', searchData)
      // TODO: Implement product search and add to quotation items
    },

    async handleQuotationSearch(quotationData) {
      console.log('Handle quotation search:', quotationData)
      this.formSaleOrder.quotationNumber = quotationData.Number
      await this.loadQuotationData(quotationData.Number)
    },

    async loadQuotationData(quotationNumber) {
      try {
        this.loading = true
        
        // TODO: Replace with actual API call
        // const response = await this.quotationStore.fetchQuotationById(quotationId)
        
        // Mock data for demonstration
        this.quotationItems = [
          {
            productId: 1,
            productNumber: 'R001',
            productName: 'Diamond Ring Set',
            itemType: 'Stock',
            quantity: 2,
            unitPrice: 15000,
            lineTotal: 30000,
            isSelected: false,
            stockAvailable: 5
          },
          {
            productId: 2,
            productNumber: 'N002', 
            productName: 'Custom Gold Necklace',
            itemType: 'Production',
            quantity: 1,
            unitPrice: 25000,
            lineTotal: 25000,
            isSelected: false,
            estimatedProductionDays: 14
          }
        ]

        // Update customer info from quotation
        this.formSaleOrder.customerName = 'บริษัท ABC จำกัด'
        this.formSaleOrder.customerAddress = '123 ถนนสุขุมวิท กรุงเทพฯ'
        this.formSaleOrder.customerPhone = '02-123-4567'
        this.formSaleOrder.customerEmail = 'contact@abc.com'
        
      } catch (error) {
        console.error('Error loading quotation:', error)
      } finally {
        this.loading = false
      }
    },

    // Selection methods
    toggleAllItems() {
      const newState = !this.allItemsSelected
      this.quotationItems.forEach(item => {
        item.isSelected = newState
        this.updateItemTotal(item)
      })
    },

    updateItemSelection(item) {
      this.updateItemTotal(item)
    },

    updateItemTotal(item) {
      item.lineTotal = item.isSelected ? (item.unitPrice || 0) * (item.quantity || 1) : 0
      this.updateSummary()
    },

    updateSummary() {
      this.formSaleOrder.totalAmount = this.totalOrderAmount
    },

    // Payment terms handling
    onPaymentTermsChange() {
      if (this.formSaleOrder.paymentTerms === 'DepositAndBalance') {
        this.formSaleOrder.depositRequired = true
      }
    },

    onDepositRequiredChange() {
      if (this.formSaleOrder.depositRequired && this.selectedProductionItemsCount > 0) {
        // Auto-set deposit percentage for production items
        if (!this.formSaleOrder.depositPercentage) {
          this.formSaleOrder.depositPercentage = 50
        }
      }
      this.updateSummary()
    },

    // Validation methods
    isQuantityInvalid(item) {
      if (item.itemType !== 'Stock') return false
      return item.isSelected && item.quantity > (item.stockAvailable || 0)
    },

    // Helper methods for UI
    getItemTypeClass(itemType) {
      return itemType === 'Stock' ? 'badge badge-info' : 'badge badge-warning'
    },

    getItemTypeIcon(itemType) {
      return itemType === 'Stock' ? 'bi bi-box' : 'bi bi-tools'
    },

    getItemTypeText(itemType) {
      return itemType === 'Stock' ? 'คงคลัง' : 'ผลิต'
    },

    getStockStatusClass(available, requested) {
      if (available >= requested) return 'text-success'
      if (available > 0) return 'text-warning'
      return 'text-danger'
    },

    // Action methods
    async saveDraft() {
      try {
        this.loading = true
        
        const saleOrderData = {
          ...this.formSaleOrder,
          status: 'Draft',
          items: this.selectedItems
        }

        console.log('Save draft:', saleOrderData)
        // TODO: Implement save draft API call
        
        success('บันทึกร่างเรียบร้อยแล้ว', 'บันทึกสำเร็จ')
      } catch (error) {
        console.error('Error saving draft:', error)
        error('เกิดข้อผิดพลาดในการบันทึก', 'บันทึกไม่สำเร็จ')
      } finally {
        this.loading = false
      }
    },

    async confirmOrder() {
      if (this.hasValidationErrors) {
        error('กรุณาแก้ไขข้อผิดพลาดก่อนยืนยันใบสั่งขาย', 'ไม่สามารถยืนยันได้')
        return
      }

      try {
        this.loading = true
        
        const saleOrderData = {
          ...this.formSaleOrder,
          status: 'Confirmed',
          items: this.selectedItems
        }

        console.log('Confirm order:', saleOrderData)
        // TODO: Implement confirm order API call
        
        success('ยืนยันใบสั่งขายเรียบร้อยแล้ว', 'ยืนยันสำเร็จ')
      } catch (error) {
        console.error('Error confirming order:', error)
        error('เกิดข้อผิดพลาดในการยืนยัน', 'ยืนยันไม่สำเร็จ')
      } finally {
        this.loading = false
      }
    },

    cancelOrder() {
      confirmSubmit(
        'คุณต้องการยกเลิกการสร้างใบสั่งขายนี้หรือไม่?',
        'ยืนยันการยกเลิก',
        (result) => {
          if (result.isConfirmed) {
            this.clearForm()
            success('ยกเลิกการสร้างใบสั่งขายแล้ว', 'ยกเลิกแล้ว')
          }
        },
        {
          confirmText: 'ยกเลิก',
          cancelText: 'กลับ'
        },
        'question'
      )
    },

    clearForm() {
      this.quotationItems = []
      this.formSaleOrder = {
        salesOrderId: null,
        quotationId: null,
        customerId: null,
        customerName: '',
        customerAddress: '',
        customerPhone: '',
        customerEmail: '',
        number: '',
        date: new Date(),
        expectedDeliveryDate: null,
        status: 'Draft',
        quotationNumber: '',
        paymentTerms: 'Cash',
        depositRequired: false,
        depositPercentage: 50,
        priority: 'normal',
        totalAmount: 0,
        remark: ''
      }
    },

    formatCurrency(amount) {
      return formatDecimal(amount, 2) + ' THB'
    },

    // Sales Flow Navigation Methods
    createProductionOrder() {
      const productionItems = this.selectedItems.filter(item => item.itemType === 'Production')
      
      if (productionItems.length === 0) {
        error('ไม่พบสินค้าที่ต้องผลิต', 'ไม่สามารถสร้างใบสั่งผลิตได้')
        return
      }

      // Navigate to Production Order with Sale Order data
      this.$router.push({
        path: '/sale/production-order',
        query: {
          saleOrderId: this.formSaleOrder.salesOrderId || 'SO-DEMO',
          saleOrderNumber: this.formSaleOrder.number,
          customerName: this.formSaleOrder.customerName,
          items: JSON.stringify(productionItems)
        }
      })
    },

    createStockReservation() {
      const stockItems = this.selectedItems.filter(item => item.itemType === 'Stock')
      
      if (stockItems.length === 0) {
        error('ไม่พบสินค้าคงคลังที่ต้องจอง', 'ไม่สามารถสร้างการจองได้')
        return
      }

      // Navigate to Stock Reservation with Sale Order data
      this.$router.push({
        path: '/sale/stock-reservation',
        query: {
          saleOrderId: this.formSaleOrder.salesOrderId || 'SO-DEMO',
          saleOrderNumber: this.formSaleOrder.number,
          customerName: this.formSaleOrder.customerName,
          items: JSON.stringify(stockItems)
        }
      })
    },

    createDeliveryNote() {
      // Navigate to Delivery Note
      this.$router.push({
        path: '/sale/delivery-note',
        query: {
          saleOrderId: this.formSaleOrder.salesOrderId || 'SO-DEMO',
          saleOrderNumber: this.formSaleOrder.number,
          customerName: this.formSaleOrder.customerName,
          totalAmount: this.totalOrderAmount
        }
      })
    },

    createInvoice() {
      // Navigate to Invoice creation
      this.$router.push({
        path: '/sale/invoice',
        query: {
          saleOrderId: this.formSaleOrder.salesOrderId || 'SO-DEMO',
          saleOrderNumber: this.formSaleOrder.number,
          customerName: this.formSaleOrder.customerName,
          totalAmount: this.totalOrderAmount,
          paymentTerms: this.formSaleOrder.paymentTerms,
          depositRequired: this.formSaleOrder.depositRequired,
          depositAmount: this.totalDepositAmount
        }
      })
    },

    viewProductionStatus() {
      // Navigate to Production tracking
      this.$router.push({
        path: '/sale/production-order',
        query: {
          mode: 'view',
          saleOrderNumber: this.formSaleOrder.number
        }
      })
    },

    viewStockStatus() {
      // Navigate to Stock status
      this.$router.push({
        path: '/sale/stock-reservation',
        query: {
          mode: 'view',
          saleOrderNumber: this.formSaleOrder.number
        }
      })
    },

    viewPaymentStatus() {
      // Navigate to Payment tracking
      this.$router.push({
        path: '/sale/payment-dashboard',
        query: {
          saleOrderNumber: this.formSaleOrder.number
        }
      })
    },

    printSaleOrder() {
      try {
        // TODO: Implement PDF generation
        console.log('Print Sale Order:', this.formSaleOrder)
        success('กำลังสร้างไฟล์ PDF...', 'พิมพ์ใบสั่งขาย')
      } catch (error) {
        error('เกิดข้อผิดพลาดในการพิมพ์', 'พิมพ์ไม่สำเร็จ')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/custom-style/standard-data-table.scss';

.card-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
}

.card-header {
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  padding: 0.75rem 1rem;
  border-radius: 8px 8px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header-actions {
  display: flex;
  align-items: center;
}

.card-body {
  padding: 1rem;
}

.customer-info-display {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 8px 12px;
  min-height: 38px;
  display: flex;
  align-items: center;
}

.product-description {
  font-size: 0.9rem;
  line-height: 1.4;
}

.availability-info, .production-info {
  .badge {
    padding: 0.25em 0.5em;
    font-size: 0.75em;
    border-radius: 0.25rem;
  }
}

.badge {
  padding: 0.25em 0.5em;
  font-size: 0.75em;
  border-radius: 0.25rem;
  font-weight: 600;
  
  &.badge-info {
    background-color: #17a2b8;
    color: white;
  }
  
  &.badge-warning {
    background-color: #ffc107;
    color: #212529;
  }
  
  &.badge-success {
    background-color: #28a745;
    color: white;
  }
  
  &.badge-danger {
    background-color: #dc3545;
    color: white;
  }
}

.summary-section {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  height: 100%;
  
  h6 {
    color: #495057;
    margin-bottom: 0.75rem;
    border-bottom: 1px solid #dee2e6;
    padding-bottom: 0.5rem;
  }
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  &.border-top {
    border-top: 1px solid #dee2e6;
    padding-top: 0.5rem;
    margin-top: 0.5rem;
  }
}

.form-check-input {
  margin: 0;
}

.is-invalid {
  border-color: #dc3545;
}

.invalid-feedback {
  display: block;
  width: 100%;
  margin-top: 0.25rem;
  font-size: 0.875em;
  color: #dc3545;
}

.alert {
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid transparent;
  border-radius: 0.25rem;
  
  &.alert-warning {
    color: #856404;
    background-color: #fff3cd;
    border-color: #ffeaa7;
  }
}

.text-right {
  text-align: right;
}

.text-muted {
  color: #6c757d !important;
}

.font-weight-bold {
  font-weight: 600;
}

.text-primary {
  color: #007bff !important;
}

.text-success {
  color: #28a745 !important;
}

.text-warning {
  color: #ffc107 !important;
}

.text-danger {
  color: #dc3545 !important;
}

.text-info {
  color: #17a2b8 !important;
}

.d-flex {
  display: flex;
}

.align-items-center {
  align-items: center;
}

.mr-1 {
  margin-right: 0.25rem;
}

.mr-2 {
  margin-right: 0.5rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.mb-0 {
  margin-bottom: 0;
}

.demo-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

// Sales Flow Actions Styles
.sales-flow-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.flow-section {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
}

.flow-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  
  h6 {
    margin: 0;
    color: #495057;
    font-weight: 600;
    
    i {
      color: #6c757d;
    }
  }
  
  .badge {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    
    &.badge-info {
      background-color: #17a2b8;
    }
    
    &.badge-success {
      background-color: #28a745;
    }
    
    &.badge-primary {
      background-color: #007bff;
    }
    
    &.badge-warning {
      background-color: #ffc107;
      color: #212529;
    }
  }
}

.flow-section p {
  color: #6c757d;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  line-height: 1.4;
}

.flow-section .btn {
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  
  &:not(:last-child) {
    margin-right: 0.5rem;
  }
}

// Responsive design for smaller screens
@media (max-width: 768px) {
  .sales-flow-actions {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .flow-section {
    padding: 1rem;
  }
  
  .flow-section .btn {
    width: 100%;
    margin-right: 0;
    margin-bottom: 0.5rem;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}

.alert {
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid transparent;
  border-radius: 0.25rem;
  
  &.alert-info {
    color: #0c5460;
    background-color: #d1ecf1;
    border-color: #bee5eb;
  }
}
</style>