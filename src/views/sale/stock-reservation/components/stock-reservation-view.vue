<template>
  <div class="mt-2">
    <!-- Reservation Information Section -->
    <div class="card-container">
      <div class="card-header">
        <h6 class="mb-0">ข้อมูลการจองสต็อก</h6>
      </div>
      <div class="card-body">
        <div class="form-col-container">
          <!-- Reservation Date -->
          <div>
            <span class="title-text">วันที่จอง</span>
            <Calendar
              class="w-100"
              v-model="formReservation.reservationDate"
              showIcon
              :manualInput="false"
              placeholder="เลือกวันที่"
              dateFormat="dd/mm/yy"
            />
          </div>

          <!-- Expiry Date -->
          <div>
            <span class="title-text">วันที่หมดอายุ</span>
            <Calendar
              class="w-100"
              v-model="formReservation.expiryDate"
              showIcon
              :manualInput="false"
              placeholder="เลือกวันที่หมดอายุ"
              dateFormat="dd/mm/yy"
            />
          </div>

          <!-- Status -->
          <div>
            <span class="title-text">สถานะ</span>
            <Dropdown
              v-model="formReservation.status"
              :options="statusOptions"
              optionLabel="name"
              optionValue="value"
              placeholder="เลือกสถานะ"
              class="w-100"
            />
          </div>

          <!-- Auto Expiry Days -->
          <div>
            <span class="title-text">จำนวนวันหมดอายุอัตโนมัติ</span>
            <input
              :class="['form-control bg-input']"
              type="number"
              min="1"
              max="90"
              v-model.number="formReservation.autoExpiryDays"
              placeholder="30"
              @input="calculateExpiryDate"
            />
          </div>
        </div>

        <div class="form-col-container mt-2">
          <!-- Sale Order Reference -->
          <div>
            <span class="title-text">อ้างอิงใบสั่งขาย</span>
            <input
              :class="['form-control bg-input']"
              type="text"
              v-model.trim="formReservation.saleOrderNumber"
              placeholder="SO-2025-001"
              readonly
            />
          </div>

          <!-- Customer Name -->
          <div>
            <span class="title-text">ลูกค้า</span>
            <input
              :class="['form-control bg-input']"
              type="text"
              v-model.trim="formReservation.customerName"
              placeholder="ชื่อลูกค้า"
              readonly
            />
          </div>

          <!-- Reservation Type -->
          <div>
            <span class="title-text">ประเภทการจอง</span>
            <Dropdown
              v-model="formReservation.reservationType"
              :options="reservationTypeOptions"
              optionLabel="name"
              optionValue="value"
              placeholder="เลือกประเภทการจอง"
              class="w-100"
            />
          </div>

          <!-- Priority -->
          <div>
            <span class="title-text">ลำดับความสำคัญ</span>
            <Dropdown
              v-model="formReservation.priority"
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

    <!-- Sale Order Information Section -->
    <div class="card-container mt-3" v-if="saleOrderInfo.number">
      <div class="card-header">
        <h6 class="mb-0">ข้อมูลใบสั่งขายอ้างอิง</h6>
      </div>
      <div class="card-body">
        <div class="form-col-container">
          <div>
            <span class="title-text">เลขที่ใบสั่งขาย</span>
            <div class="info-display">{{ saleOrderInfo.number }}</div>
          </div>
          <div>
            <span class="title-text">วันที่ใบสั่งขาย</span>
            <div class="info-display">{{ formatDate(saleOrderInfo.orderDate) }}</div>
          </div>
          <div>
            <span class="title-text">วันที่คาดหวังส่งมอบ</span>
            <div class="info-display">{{ formatDate(saleOrderInfo.expectedDeliveryDate) }}</div>
          </div>
          <div>
            <span class="title-text">สถานะใบสั่งขาย</span>
            <div class="info-display">
              <span :class="getSaleOrderStatusClass(saleOrderInfo.status)">
                {{ getSaleOrderStatusText(saleOrderInfo.status) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stock Items Reservation Grid -->
    <div class="card-container mt-3">
      <div class="card-header">
        <h6 class="mb-0">รายการสินค้าสต็อกที่ต้องจอง</h6>
        <div class="card-header-actions">
          <label class="d-flex align-items-center mr-3">
            <input
              type="checkbox"
              :checked="allItemsSelected"
              @change="toggleAllItems"
              class="mr-2"
            />
            <span>เลือกทั้งหมด</span>
          </label>
          <button
            class="btn btn-sm btn-outline-success"
            @click="reserveSelected"
            :disabled="selectedItemsCount === 0 || hasReservationIssues"
          >
            <i class="bi bi-bookmark-plus mr-1"></i>
            จองรายการที่เลือก
          </button>
        </div>
      </div>
      <div class="card-body p-0">
        <DataTable
          :value="stockItems"
          dataKey="itemId"
          class="base-data-table"
          :scrollable="true"
          scrollHeight="400px"
          :loading="loading"
        >
          <!-- Selection Column -->
          <Column header="เลือก" style="width: 80px">
            <template #body="{ data }">
              <input
                type="checkbox"
                v-model="data.isSelected"
                @change="updateItemSelection(data)"
                class="form-check-input"
                :disabled="data.isReserved || !canReserveItem(data)"
              />
            </template>
          </Column>

          <!-- Product Image -->
          <Column header="รูปภาพ" style="width: 80px">
            <template #body="{ data }">
              <div class="product-image">
                <img 
                  :src="data.imageUrl || '/src/assets/images/no-image.png'" 
                  :alt="data.productName"
                  class="product-thumbnail"
                />
              </div>
            </template>
          </Column>

          <!-- Product Number -->
          <Column field="productNumber" header="รหัสสินค้า" style="min-width: 120px">
            <template #body="{ data }">
              <span class="font-weight-bold">{{ data.productNumber }}</span>
            </template>
          </Column>

          <!-- Product Name -->
          <Column field="productName" header="ชื่อสินค้า" style="min-width: 200px">
            <template #body="{ data }">
              <div class="product-description">
                {{ data.productName }}
              </div>
            </template>
          </Column>

          <!-- Stock Status -->
          <Column header="สถานะสต็อก" style="min-width: 150px">
            <template #body="{ data }">
              <div class="stock-status">
                <div class="stock-item">
                  <span class="stock-label">คงคลัง:</span>
                  <span :class="getStockStatusClass(data.stockAvailable, data.quantity)">
                    {{ data.stockAvailable || 0 }}
                  </span>
                </div>
                <div class="stock-item">
                  <span class="stock-label">จองแล้ว:</span>
                  <span class="text-warning font-weight-bold">{{ data.reserved || 0 }}</span>
                </div>
                <div class="stock-item">
                  <span class="stock-label">พร้อมจอง:</span>
                  <span :class="getAvailableStockClass(data.stockAvailable - data.reserved)">
                    {{ (data.stockAvailable || 0) - (data.reserved || 0) }}
                  </span>
                </div>
              </div>
            </template>
          </Column>

          <!-- Requested Quantity -->
          <Column field="quantity" header="จำนวนที่ต้องการ" style="min-width: 140px">
            <template #body="{ data }">
              <input
                type="number"
                min="1"
                step="1"
                v-model.number="data.quantity"
                @input="updateQuantity(data)"
                :disabled="!data.isSelected || data.isReserved"
                class="form-control form-control-sm text-center"
                :class="{ 'is-invalid': isQuantityInvalid(data) }"
              />
              <div v-if="isQuantityInvalid(data)" class="invalid-feedback">
                จำนวนเกินสต็อกที่พร้อมจอง
              </div>
            </template>
          </Column>

          <!-- Unit Price -->
          <Column field="unitPrice" header="ราคาต่อหน่วย" style="min-width: 120px">
            <template #body="{ data }">
              <div class="text-right">
                {{ formatCurrency(data.unitPrice) }}
              </div>
            </template>
          </Column>

          <!-- Reservation Status -->
          <Column header="สถานะการจอง" style="min-width: 140px">
            <template #body="{ data }">
              <div v-if="data.isReserved" class="reservation-status">
                <span class="badge badge-success">
                  <i class="bi bi-bookmark-check mr-1"></i>
                  จองแล้ว
                </span>
                <div class="reservation-details">
                  <small class="text-muted">
                    จองเมื่อ: {{ formatDate(data.reservedDate) }}
                  </small>
                </div>
              </div>
              <div v-else class="reservation-status">
                <span :class="getReservationStatusClass(data)">
                  <i class="bi bi-bookmark mr-1"></i>
                  {{ getReservationStatusText(data) }}
                </span>
              </div>
            </template>
          </Column>

          <!-- Actions -->
          <Column header="การดำเนินการ" style="width: 120px">
            <template #body="{ data }">
              <div class="action-buttons">
                <button
                  v-if="!data.isReserved"
                  class="btn btn-sm btn-success"
                  @click="reserveItem(data)"
                  :disabled="!canReserveItem(data) || isQuantityInvalid(data)"
                  title="จองรายการนี้"
                >
                  <i class="bi bi-bookmark-plus"></i>
                </button>
                <button
                  v-else
                  class="btn btn-sm btn-warning"
                  @click="unreserveItem(data)"
                  title="ยกเลิกการจอง"
                >
                  <i class="bi bi-bookmark-dash"></i>
                </button>
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <!-- Reservation Summary -->
    <div class="card-container mt-3">
      <div class="card-header">
        <h6 class="mb-0">สรุปการจองสต็อก</h6>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-4">
            <!-- Items Summary -->
            <div class="summary-section">
              <h6>รายการสินค้า</h6>
              <div class="summary-item">
                <span>รายการทั้งหมด:</span>
                <span class="font-weight-bold">{{ stockItemsCount }} รายการ</span>
              </div>
              <div class="summary-item">
                <span>รายการที่เลือก:</span>
                <span class="font-weight-bold text-primary">{{ selectedItemsCount }} รายการ</span>
              </div>
              <div class="summary-item">
                <span>จองสำเร็จแล้ว:</span>
                <span class="font-weight-bold text-success">{{ reservedItemsCount }} รายการ</span>
              </div>
              <div class="summary-item">
                <span>ไม่สามารถจองได้:</span>
                <span class="font-weight-bold text-danger">{{ unavailableItemsCount }} รายการ</span>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <!-- Quantity Summary -->
            <div class="summary-section">
              <h6>สรุปจำนวน</h6>
              <div class="summary-item">
                <span>จำนวนรวมที่ต้องการ:</span>
                <span class="font-weight-bold">{{ totalRequestedQuantity }} ชิ้น</span>
              </div>
              <div class="summary-item">
                <span>จำนวนที่จองแล้ว:</span>
                <span class="font-weight-bold text-success">{{ totalReservedQuantity }} ชิ้น</span>
              </div>
              <div class="summary-item">
                <span>จำนวนที่ขาด:</span>
                <span class="font-weight-bold text-warning">{{ totalShortageQuantity }} ชิ้น</span>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <!-- Value Summary -->
            <div class="summary-section">
              <h6>สรุปมูลค่า</h6>
              <div class="summary-item">
                <span>มูลค่าที่จองแล้ว:</span>
                <span class="font-weight-bold text-success">{{ formatCurrency(reservedValue) }}</span>
              </div>
              <div class="summary-item">
                <span>มูลค่าที่รอจอง:</span>
                <span class="font-weight-bold text-warning">{{ formatCurrency(pendingValue) }}</span>
              </div>
              <div class="summary-item border-top pt-2 mt-2">
                <span class="h6">มูลค่ารวม:</span>
                <span class="h6 font-weight-bold text-primary">{{ formatCurrency(totalValue) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Reservation Notes -->
        <div class="row mt-3">
          <div class="col-md-12">
            <div>
              <span class="title-text">หมายเหตุการจอง</span>
              <textarea
                class="form-control"
                rows="3"
                v-model="formReservation.remark"
                placeholder="หมายเหตุเพิ่มเติมสำหรับการจองสต็อก..."
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

    <!-- Action Buttons -->
    <div class="btn-submit-container mt-3">
      <button
        class="btn btn-success mr-2"
        type="button"
        @click="reserveAll"
        :disabled="loading || selectedItemsCount === 0 || hasReservationIssues"
      >
        <i class="bi bi-bookmark-plus mr-1"></i>
        จองทั้งหมด
      </button>
      
      <button
        class="btn btn-warning mr-2"
        type="button"
        @click="unreserveAll"
        :disabled="loading || reservedItemsCount === 0"
      >
        <i class="bi bi-bookmark-dash mr-1"></i>
        ยกเลิกการจองทั้งหมด
      </button>

      <button
        class="btn btn-info mr-2"
        type="button"
        @click="generateReport"
        :disabled="loading || stockItemsCount === 0"
      >
        <i class="bi bi-file-pdf mr-1"></i>
        รายงานการจอง
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
        @click="cancelReservation"
      >
        <i class="bi bi-x-circle mr-1"></i>
        ยกเลิก
      </button>
    </div>
  </div>
</template>

<script>
import DataTableWithPaging from '@/components/prime-vue/DataTableWithPaging.vue'
import Calendar from 'primevue/calendar'
import Dropdown from 'primevue/dropdown'
import { formatDecimal } from '@/services/utils/decimal.js'
import { success, error } from '@/services/alert/sweetAlerts.js'

export default {
  name: 'StockReservationView',

  components: {
    DataTableWithPaging,
    Calendar,
    Dropdown
  },

  emits: ['update:modelForm', 'update:modelSaleOrder', 'reserve', 'unreserve', 'confirm', 'cancel'],

  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    },
    modelSaleOrder: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    return {
      loading: false,
      stockItems: [], // Stock items from sale order
      
      formReservation: {
        reservationId: null,
        saleOrderId: null,
        saleOrderNumber: '',
        customerName: '',
        reservationDate: new Date(),
        expiryDate: null,
        autoExpiryDays: 30,
        status: 'Active',
        reservationType: 'sales',
        priority: 'normal',
        remark: ''
      },

      saleOrderInfo: {},

      statusOptions: [
        { name: 'ใช้งาน', value: 'Active' },
        { name: 'หมดอายุ', value: 'Expired' },
        { name: 'ยกเลิก', value: 'Cancelled' },
        { name: 'ใช้แล้ว', value: 'Used' }
      ],

      reservationTypeOptions: [
        { name: 'การขาย', value: 'sales' },
        { name: 'การซ่อม', value: 'repair' },
        { name: 'การแลกเปลี่ยน', value: 'exchange' },
        { name: 'อื่นๆ', value: 'others' }
      ],

      priorityOptions: [
        { name: 'ปกติ', value: 'normal' },
        { name: 'สำคัญ', value: 'high' },
        { name: 'เร่งด่วน', value: 'urgent' }
      ]
    }
  },

  computed: {
    // Selection state
    allItemsSelected() {
      return this.stockItems.length > 0 && 
             this.stockItems.filter(item => this.canReserveItem(item)).every(item => item.isSelected)
    },

    selectedItems() {
      return this.stockItems.filter(item => item.isSelected)
    },

    selectedItemsCount() {
      return this.selectedItems.length
    },

    stockItemsCount() {
      return this.stockItems.length
    },

    reservedItemsCount() {
      return this.stockItems.filter(item => item.isReserved).length
    },

    unavailableItemsCount() {
      return this.stockItems.filter(item => !this.canReserveItem(item) && !item.isReserved).length
    },

    // Quantity calculations
    totalRequestedQuantity() {
      return this.stockItems.reduce((sum, item) => sum + (item.quantity || 0), 0)
    },

    totalReservedQuantity() {
      return this.stockItems.filter(item => item.isReserved).reduce((sum, item) => sum + (item.quantity || 0), 0)
    },

    totalShortageQuantity() {
      return this.stockItems.reduce((sum, item) => {
        const availableStock = (item.stockAvailable || 0) - (item.reserved || 0)
        const shortage = Math.max(0, (item.quantity || 0) - availableStock)
        return sum + shortage
      }, 0)
    },

    // Value calculations
    reservedValue() {
      return this.stockItems
        .filter(item => item.isReserved)
        .reduce((sum, item) => sum + ((item.quantity || 0) * (item.unitPrice || 0)), 0)
    },

    pendingValue() {
      return this.selectedItems
        .filter(item => !item.isReserved)
        .reduce((sum, item) => sum + ((item.quantity || 0) * (item.unitPrice || 0)), 0)
    },

    totalValue() {
      return this.reservedValue + this.pendingValue
    },

    // Validation
    validationErrors() {
      const errors = []
      
      if (this.totalShortageQuantity > 0) {
        errors.push(`มีสินค้าขาดสต็อก ${this.totalShortageQuantity} ชิ้น`)
      }

      if (!this.formReservation.expiryDate) {
        errors.push('กรุณาระบุวันที่หมดอายุการจอง')
      }

      // Check for items with invalid quantities
      const invalidItems = this.stockItems.filter(item => this.isQuantityInvalid(item))
      if (invalidItems.length > 0) {
        errors.push(`มีรายการที่จำนวนเกินสต็อกที่พร้อมจอง ${invalidItems.length} รายการ`)
      }

      return errors
    },

    hasReservationIssues() {
      return this.validationErrors.length > 0
    }
  },

  watch: {
    modelForm: {
      handler(newVal) {
        if (newVal && Object.keys(newVal).length > 0) {
          this.formReservation = { ...this.formReservation, ...newVal }
        }
      },
      deep: true
    },

    modelSaleOrder: {
      handler(newVal) {
        if (newVal && newVal.number) {
          this.loadSaleOrderData(newVal)
        }
      },
      deep: true
    }
  },

  mounted() {
    // Load data from URL query parameters (from Sale Order navigation)
    this.loadFromQueryParams()
  },

  methods: {
    loadFromQueryParams() {
      const query = this.$route.query
      
      if (query.saleOrderNumber && query.items) {
        try {
          const items = JSON.parse(query.items)
          const saleOrderData = {
            saleOrderId: query.saleOrderId,
            number: query.saleOrderNumber,
            customerName: query.customerName,
            items: items
          }
          
          this.loadSaleOrderData(saleOrderData)
          
          // Show info message
          success(`โหลดข้อมูลจากใบสั่งขาย ${query.saleOrderNumber} เรียบร้อย`, 'โหลดข้อมูลสำเร็จ')
        } catch (error) {
          console.error('Error parsing query params:', error)
          error('ข้อมูลจากใบสั่งขายไม่ถูกต้อง', 'โหลดข้อมูลไม่สำเร็จ')
        }
      }
    },

    async loadSaleOrderData(saleOrderData) {
      try {
        this.loading = true
        
        // Set sale order info
        this.saleOrderInfo = saleOrderData
        this.formReservation.saleOrderId = saleOrderData.saleOrderId
        this.formReservation.saleOrderNumber = saleOrderData.number
        this.formReservation.customerName = saleOrderData.customerName

        // Filter stock items only
        this.stockItems = (saleOrderData.items || [])
          .filter(item => item.itemType === 'Stock')
          .map(item => ({
            ...item,
            isSelected: false,
            isReserved: false,
            reservedDate: null,
            imageUrl: null
          }))

        // Calculate expiry date
        this.calculateExpiryDate()

      } catch (error) {
        console.error('Error loading sale order:', error)
      } finally {
        this.loading = false
      }
    },

    calculateExpiryDate() {
      if (this.formReservation.autoExpiryDays && this.formReservation.reservationDate) {
        const expiryDate = new Date(this.formReservation.reservationDate)
        expiryDate.setDate(expiryDate.getDate() + this.formReservation.autoExpiryDays)
        this.formReservation.expiryDate = expiryDate
      }
    },

    // Selection methods
    toggleAllItems() {
      const reservableItems = this.stockItems.filter(item => this.canReserveItem(item))
      const newState = !this.allItemsSelected
      
      reservableItems.forEach(item => {
        item.isSelected = newState
      })
    },

    updateItemSelection(item) {
      // Selection change handled by v-model
    },

    updateQuantity(item) {
      // Quantity change handled by v-model
    },

    // Validation methods
    canReserveItem(item) {
      const availableStock = (item.stockAvailable || 0) - (item.reserved || 0)
      return availableStock > 0 && !item.isReserved
    },

    isQuantityInvalid(item) {
      if (!item.isSelected || item.isReserved) return false
      const availableStock = (item.stockAvailable || 0) - (item.reserved || 0)
      return (item.quantity || 0) > availableStock
    },

    // Reservation methods
    async reserveItem(item) {
      if (!this.canReserveItem(item) || this.isQuantityInvalid(item)) return

      try {
        this.loading = true
        
        // TODO: API call to reserve single item
        console.log('Reserve item:', item)
        
        // Mock success
        item.isReserved = true
        item.reservedDate = new Date()
        item.reserved = (item.reserved || 0) + item.quantity
        
        this.$emit('reserve', { item, type: 'single' })
        
      } catch (error) {
        console.error('Error reserving item:', error)
        error('เกิดข้อผิดพลาดในการจองสต็อก', 'จองสต็อกไม่สำเร็จ')
      } finally {
        this.loading = false
      }
    },

    async unreserveItem(item) {
      if (!item.isReserved) return

      try {
        this.loading = true
        
        // TODO: API call to unreserve item
        console.log('Unreserve item:', item)
        
        // Mock success
        item.isReserved = false
        item.reservedDate = null
        item.reserved = Math.max(0, (item.reserved || 0) - item.quantity)
        
        this.$emit('unreserve', { item, type: 'single' })
        
      } catch (error) {
        console.error('Error unreserving item:', error)
        error('เกิดข้อผิดพลาดในการยกเลิกการจอง', 'ยกเลิกไม่สำเร็จ')
      } finally {
        this.loading = false
      }
    },

    async reserveSelected() {
      if (this.selectedItemsCount === 0 || this.hasReservationIssues) return
      
      try {
        this.loading = true
        
        const itemsToReserve = this.selectedItems.filter(item => 
          this.canReserveItem(item) && !this.isQuantityInvalid(item)
        )
        
        // TODO: API call to reserve multiple items
        console.log('Reserve selected items:', itemsToReserve)
        
        // Mock success
        itemsToReserve.forEach(item => {
          item.isReserved = true
          item.reservedDate = new Date()
          item.reserved = (item.reserved || 0) + item.quantity
        })
        
        this.$emit('reserve', { items: itemsToReserve, type: 'multiple' })
        success(`จองสต็อกเรียบร้อยแล้ว ${itemsToReserve.length} รายการ`, 'จองสต็อกสำเร็จ')
        
      } catch (error) {
        console.error('Error reserving items:', error)
        error('เกิดข้อผิดพลาดในการจองสต็อก', 'จองสต็อกไม่สำเร็จ')
      } finally {
        this.loading = false
      }
    },

    async reserveAll() {
      // Select all reservable items first
      this.stockItems.forEach(item => {
        if (this.canReserveItem(item) && !this.isQuantityInvalid(item)) {
          item.isSelected = true
        }
      })
      
      // Then reserve them
      await this.reserveSelected()
    },

    async unreserveAll() {
      if (this.reservedItemsCount === 0) return

      try {
        this.loading = true
        
        const reservedItems = this.stockItems.filter(item => item.isReserved)
        
        // TODO: API call to unreserve all items
        console.log('Unreserve all items:', reservedItems)
        
        // Mock success
        reservedItems.forEach(item => {
          item.isReserved = false
          item.reservedDate = null
          item.reserved = Math.max(0, (item.reserved || 0) - item.quantity)
        })
        
        this.$emit('unreserve', { items: reservedItems, type: 'all' })
        success(`ยกเลิกการจองเรียบร้อยแล้ว ${reservedItems.length} รายการ`, 'ยกเลิกสำเร็จ')
        
      } catch (error) {
        console.error('Error unreserving all items:', error)
        error('เกิดข้อผิดพลาดในการยกเลิกการจอง', 'ยกเลิกไม่สำเร็จ')
      } finally {
        this.loading = false
      }
    },

    async generateReport() {
      try {
        this.loading = true
        console.log('Generate reservation report')
        // TODO: Implement PDF generation
        success('สร้างรายงานเรียบร้อยแล้ว', 'สร้างรายงานสำเร็จ')
      } catch (error) {
        console.error('Error generating report:', error)
        error('เกิดข้อผิดพลาดในการสร้างรายงาน', 'สร้างรายงานไม่สำเร็จ')
      } finally {
        this.loading = false
      }
    },

    cancelReservation() {
      if (confirm('คุณต้องการยกเลิกการจองสต็อกนี้หรือไม่?')) {
        this.clearForm()
        this.$emit('cancel')
      }
    },

    clearForm() {
      this.stockItems = []
      this.saleOrderInfo = {}
      this.formReservation = {
        reservationId: null,
        saleOrderId: null,
        saleOrderNumber: '',
        customerName: '',
        reservationDate: new Date(),
        expiryDate: null,
        autoExpiryDays: 30,
        status: 'Active',
        reservationType: 'sales',
        priority: 'normal',
        remark: ''
      }
    },

    // Helper methods for UI
    getStockStatusClass(available, required) {
      if (available >= required) return 'text-success font-weight-bold'
      if (available > 0) return 'text-warning font-weight-bold'
      return 'text-danger font-weight-bold'
    },

    getAvailableStockClass(available) {
      if (available <= 0) return 'text-danger font-weight-bold'
      if (available <= 3) return 'text-warning font-weight-bold'
      return 'text-success font-weight-bold'
    },

    getReservationStatusClass(item) {
      if (!this.canReserveItem(item)) return 'badge badge-danger'
      if (item.isSelected) return 'badge badge-primary'
      return 'badge badge-secondary'
    },

    getReservationStatusText(item) {
      if (!this.canReserveItem(item)) return 'ไม่สามารถจองได้'
      if (item.isSelected) return 'เลือกแล้ว'
      return 'พร้อมจอง'
    },

    getSaleOrderStatusClass(status) {
      const classes = {
        'Confirmed': 'badge badge-success',
        'PartiallyFulfilled': 'badge badge-warning',
        'Fulfilled': 'badge badge-info'
      }
      return classes[status] || 'badge badge-secondary'
    },

    getSaleOrderStatusText(status) {
      const texts = {
        'Confirmed': 'ยืนยันแล้ว',
        'PartiallyFulfilled': 'ส่งมอบบางส่วน',
        'Fulfilled': 'ส่งมอบครบถ้วน'
      }
      return texts[status] || status
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

.info-display {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 8px 12px;
  min-height: 38px;
  display: flex;
  align-items: center;
}

.product-image {
  display: flex;
  justify-content: center;
  align-items: center;
}

.product-thumbnail {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #e9ecef;
}

.product-description {
  font-size: 0.9rem;
  line-height: 1.4;
}

.stock-status {
  .stock-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.25rem;
    font-size: 0.85rem;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .stock-label {
    margin-right: 0.5rem;
  }
}

.reservation-status {
  .reservation-details {
    margin-top: 0.25rem;
  }
}

.action-buttons {
  display: flex;
  gap: 0.25rem;
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
  
  &.badge-primary {
    background-color: #007bff;
    color: white;
  }
  
  &.badge-secondary {
    background-color: #6c757d;
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

.text-center {
  text-align: center;
}

.text-muted {
  color: #6c757d !important;
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

.font-weight-bold {
  font-weight: 600;
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

.mr-3 {
  margin-right: 1rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.mt-3 {
  margin-top: 1rem;
}

.mb-0 {
  margin-bottom: 0;
}

.p-0 {
  padding: 0;
}
</style>