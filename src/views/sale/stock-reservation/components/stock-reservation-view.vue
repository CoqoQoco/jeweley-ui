<template>
  <div class="mt-2">
    <!-- Reservation Information Section -->
    <div class="filter-container">
      <div class="vertical-center-container mb-2">
        <span class="title-text-lg bi bi-bookmark-plus mr-2"></span>
        <span class="title-text-lg">ข้อมูลการจองสต็อก</span>
      </div>
      <div class="form-col-container">
        <!-- Reservation Date -->
        <div>
          <span class="title-text">วันที่จอง</span>
          <CalendarGeneric
            v-model="formReservation.reservationDate"
            placeholder="เลือกวันที่"
            dateFormat="dd/mm/yy"
            :showIcon="true"
          />
        </div>

        <!-- Expiry Date -->
        <div>
          <span class="title-text">วันที่หมดอายุ</span>
          <CalendarGeneric
            v-model="formReservation.expiryDate"
            placeholder="เลือกวันที่หมดอายุ"
            dateFormat="dd/mm/yy"
            :showIcon="true"
          />
        </div>

        <!-- Status -->
        <div>
          <span class="title-text">สถานะ</span>
          <DropdownGeneric
            v-model="formReservation.status"
            :options="statusOptions"
            optionLabel="name"
            optionValue="value"
            placeholder="เลือกสถานะ"
          />
        </div>

        <!-- Auto Expiry Days -->
        <div>
          <span class="title-text">จำนวนวันหมดอายุอัตโนมัติ</span>
          <input
            class="form-control bg-input"
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
            class="form-control bg-input"
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
            class="form-control bg-input"
            type="text"
            v-model.trim="formReservation.customerName"
            placeholder="ชื่อลูกค้า"
            readonly
          />
        </div>

        <!-- Reservation Type -->
        <div>
          <span class="title-text">ประเภทการจอง</span>
          <DropdownGeneric
            v-model="formReservation.reservationType"
            :options="reservationTypeOptions"
            optionLabel="name"
            optionValue="value"
            placeholder="เลือกประเภทการจอง"
          />
        </div>

        <!-- Priority -->
        <div>
          <span class="title-text">ลำดับความสำคัญ</span>
          <DropdownGeneric
            v-model="formReservation.priority"
            :options="priorityOptions"
            optionLabel="name"
            optionValue="value"
            placeholder="เลือกลำดับความสำคัญ"
          />
        </div>
      </div>
    </div>

    <!-- Sale Order Information Section -->
    <div class="filter-container mt-3" v-if="saleOrderInfo.number">
      <div class="vertical-center-container mb-2">
        <span class="title-text-lg bi bi-receipt mr-2"></span>
        <span class="title-text-lg">ข้อมูลใบสั่งขายอ้างอิง</span>
      </div>
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

    <!-- Stock Items Reservation Grid -->
    <div class="filter-container mt-3">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <div class="vertical-center-container">
          <span class="title-text-lg bi bi-box-seam mr-2"></span>
          <span class="title-text-lg">รายการสินค้าสต็อกที่ต้องจอง</span>
        </div>
        <div class="d-flex align-items-center">
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
            class="btn btn-sm btn-main"
            @click="reserveSelected"
            :disabled="selectedItemsCount === 0 || hasReservationIssues"
          >
            <i class="bi bi-bookmark-plus mr-1"></i>
            จองรายการที่เลือก
          </button>
        </div>
      </div>

      <div class="responsive-table-wrapper">
        <!-- eslint-disable-next-line no-restricted-imports -->
        <DataTable
          :value="stockItems"
          dataKey="itemId"
          class="base-data-table"
          :scrollable="true"
          scrollHeight="400px"
        >
          <!-- eslint-disable-next-line no-restricted-imports -->
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

          <!-- eslint-disable-next-line no-restricted-imports -->
          <Column field="productNumber" header="รหัสสินค้า" style="min-width: 120px">
            <template #body="{ data }">
              <span class="font-weight-bold">{{ data.productNumber }}</span>
            </template>
          </Column>

          <!-- eslint-disable-next-line no-restricted-imports -->
          <Column field="productName" header="ชื่อสินค้า" style="min-width: 200px" />

          <!-- eslint-disable-next-line no-restricted-imports -->
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

          <!-- eslint-disable-next-line no-restricted-imports -->
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

          <!-- eslint-disable-next-line no-restricted-imports -->
          <Column field="unitPrice" header="ราคาต่อหน่วย" style="min-width: 120px">
            <template #body="{ data }">
              <div class="text-right">
                {{ formatCurrency(data.unitPrice) }}
              </div>
            </template>
          </Column>

          <!-- eslint-disable-next-line no-restricted-imports -->
          <Column header="สถานะการจอง" style="min-width: 140px">
            <template #body="{ data }">
              <div v-if="data.isReserved" class="reservation-status">
                <span class="badge badge-success">
                  <i class="bi bi-bookmark-check mr-1"></i>จองแล้ว
                </span>
                <div class="reservation-details">
                  <small class="text-muted">จองเมื่อ: {{ formatDate(data.reservedDate) }}</small>
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

          <!-- eslint-disable-next-line no-restricted-imports -->
          <Column header="การดำเนินการ" style="width: 120px">
            <template #body="{ data }">
              <div class="action-buttons">
                <button
                  v-if="!data.isReserved"
                  class="btn btn-sm btn-main"
                  @click="reserveItem(data)"
                  :disabled="!canReserveItem(data) || isQuantityInvalid(data)"
                  title="จองรายการนี้"
                >
                  <i class="bi bi-bookmark-plus"></i>
                </button>
                <button
                  v-else
                  class="btn btn-sm btn-red"
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
    <div class="filter-container mt-3">
      <div class="vertical-center-container mb-2">
        <span class="title-text-lg bi bi-clipboard-data mr-2"></span>
        <span class="title-text-lg">สรุปการจองสต็อก</span>
      </div>

      <div class="form-col-container">
        <div class="summary-section">
          <h6>รายการสินค้า</h6>
          <div class="summary-item">
            <span>รายการทั้งหมด:</span>
            <span class="font-weight-bold">{{ stockItemsCount }} รายการ</span>
          </div>
          <div class="summary-item">
            <span>รายการที่เลือก:</span>
            <span class="font-weight-bold" style="color: var(--base-font-color)">{{ selectedItemsCount }} รายการ</span>
          </div>
          <div class="summary-item">
            <span>จองสำเร็จแล้ว:</span>
            <span class="font-weight-bold" style="color: var(--base-green)">{{ reservedItemsCount }} รายการ</span>
          </div>
          <div class="summary-item">
            <span>ไม่สามารถจองได้:</span>
            <span class="font-weight-bold" style="color: var(--base-red)">{{ unavailableItemsCount }} รายการ</span>
          </div>
        </div>

        <div class="summary-section">
          <h6>สรุปจำนวน</h6>
          <div class="summary-item">
            <span>จำนวนรวมที่ต้องการ:</span>
            <span class="font-weight-bold">{{ totalRequestedQuantity }} ชิ้น</span>
          </div>
          <div class="summary-item">
            <span>จำนวนที่จองแล้ว:</span>
            <span class="font-weight-bold" style="color: var(--base-green)">{{ totalReservedQuantity }} ชิ้น</span>
          </div>
          <div class="summary-item">
            <span>จำนวนที่ขาด:</span>
            <span class="font-weight-bold" style="color: var(--base-warning)">{{ totalShortageQuantity }} ชิ้น</span>
          </div>
        </div>

        <div class="summary-section">
          <h6>สรุปมูลค่า</h6>
          <div class="summary-item">
            <span>มูลค่าที่จองแล้ว:</span>
            <span class="font-weight-bold" style="color: var(--base-green)">{{ formatCurrency(reservedValue) }}</span>
          </div>
          <div class="summary-item">
            <span>มูลค่าที่รอจอง:</span>
            <span class="font-weight-bold" style="color: var(--base-warning)">{{ formatCurrency(pendingValue) }}</span>
          </div>
          <div class="summary-item border-top pt-2 mt-2">
            <span class="title-text">มูลค่ารวม:</span>
            <span class="title-text" style="color: var(--base-font-color)">{{ formatCurrency(totalValue) }}</span>
          </div>
        </div>
      </div>

      <!-- Reservation Notes -->
      <div class="mt-3">
        <span class="title-text">หมายเหตุการจอง</span>
        <textarea
          class="form-control"
          rows="3"
          v-model="formReservation.remark"
          placeholder="หมายเหตุเพิ่มเติมสำหรับการจองสต็อก..."
        ></textarea>
      </div>

      <!-- Validation Messages -->
      <div class="mt-3" v-if="validationErrors.length > 0">
        <div class="alert alert-warning">
          <h6><i class="bi bi-exclamation-triangle mr-2"></i>ข้อควรระวัง:</h6>
          <ul class="mb-0">
            <li v-for="err in validationErrors" :key="err">{{ err }}</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="filter-container mt-3">
      <div class="responsive-btn-group">
        <button
          class="btn btn-main"
          type="button"
          @click="reserveAll"
          :disabled="selectedItemsCount === 0 || hasReservationIssues"
        >
          <i class="bi bi-bookmark-plus mr-1"></i>
          จองทั้งหมด
        </button>

        <button
          class="btn btn-red ml-2"
          type="button"
          @click="unreserveAll"
          :disabled="reservedItemsCount === 0"
        >
          <i class="bi bi-bookmark-dash mr-1"></i>
          ยกเลิกการจองทั้งหมด
        </button>

        <button
          class="btn btn-green ml-2"
          type="button"
          @click="generateReport"
          :disabled="stockItemsCount === 0"
        >
          <i class="bi bi-file-pdf mr-1"></i>
          รายงานการจอง
        </button>

        <button
          class="btn btn-dark ml-2"
          type="button"
          @click="clearForm"
        >
          <i class="bi bi-arrow-clockwise mr-1"></i>
          ล้างข้อมูล
        </button>

        <button
          class="btn btn-outline-main ml-2"
          type="button"
          @click="cancelReservation"
        >
          <i class="bi bi-x-circle mr-1"></i>
          ยกเลิก
        </button>
      </div>
    </div>
  </div>
</template>

<script>
// eslint-disable-next-line no-restricted-imports
import DataTable from 'primevue/datatable'
// eslint-disable-next-line no-restricted-imports
import Column from 'primevue/column'
import CalendarGeneric from '@/components/prime-vue/CalendarGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import { formatDecimal } from '@/services/utils/decimal.js'
import { success, warning } from '@/services/alert/sweetAlerts.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'

export default {
  name: 'StockReservationView',

  components: {
    DataTable,
    Column,
    CalendarGeneric,
    DropdownGeneric
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
      stockItems: [],

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

    validationErrors() {
      const errors = []

      if (this.totalShortageQuantity > 0) {
        errors.push(`มีสินค้าขาดสต็อก ${this.totalShortageQuantity} ชิ้น`)
      }

      if (!this.formReservation.expiryDate) {
        errors.push('กรุณาระบุวันที่หมดอายุการจอง')
      }

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
    this.loadFromQueryParams()
  },

  methods: {
    loadFromQueryParams() {
      const query = this.$route.query

      if (query.saleOrderNumber && query.items) {
        const items = JSON.parse(query.items)
        const saleOrderData = {
          saleOrderId: query.saleOrderId,
          number: query.saleOrderNumber,
          customerName: query.customerName,
          items: items
        }

        this.loadSaleOrderData(saleOrderData)
        success(`โหลดข้อมูลจากใบสั่งขาย ${query.saleOrderNumber} เรียบร้อย`, 'โหลดข้อมูลสำเร็จ')
      }
    },

    loadSaleOrderData(saleOrderData) {
      this.saleOrderInfo = saleOrderData
      this.formReservation.saleOrderId = saleOrderData.saleOrderId
      this.formReservation.saleOrderNumber = saleOrderData.number
      this.formReservation.customerName = saleOrderData.customerName

      this.stockItems = (saleOrderData.items || [])
        .filter(item => item.itemType === 'Stock')
        .map(item => ({
          ...item,
          isSelected: false,
          isReserved: false,
          reservedDate: null,
          imageUrl: null
        }))

      this.calculateExpiryDate()
    },

    calculateExpiryDate() {
      if (this.formReservation.autoExpiryDays && this.formReservation.reservationDate) {
        const expiryDate = new Date(this.formReservation.reservationDate)
        expiryDate.setDate(expiryDate.getDate() + this.formReservation.autoExpiryDays)
        this.formReservation.expiryDate = expiryDate
      }
    },

    toggleAllItems() {
      const reservableItems = this.stockItems.filter(item => this.canReserveItem(item))
      const newState = !this.allItemsSelected

      reservableItems.forEach(item => {
        item.isSelected = newState
      })
    },

    updateItemSelection() {},

    updateQuantity() {},

    canReserveItem(item) {
      const availableStock = (item.stockAvailable || 0) - (item.reserved || 0)
      return availableStock > 0 && !item.isReserved
    },

    isQuantityInvalid(item) {
      if (!item.isSelected || item.isReserved) return false
      const availableStock = (item.stockAvailable || 0) - (item.reserved || 0)
      return (item.quantity || 0) > availableStock
    },

    async reserveItem(item) {
      if (!this.canReserveItem(item) || this.isQuantityInvalid(item)) return

      item.isReserved = true
      item.reservedDate = new Date()
      item.reserved = (item.reserved || 0) + item.quantity

      this.$emit('reserve', { item, type: 'single' })
    },

    async unreserveItem(item) {
      if (!item.isReserved) return

      item.isReserved = false
      item.reservedDate = null
      item.reserved = Math.max(0, (item.reserved || 0) - item.quantity)

      this.$emit('unreserve', { item, type: 'single' })
    },

    async reserveSelected() {
      if (this.selectedItemsCount === 0 || this.hasReservationIssues) return

      const itemsToReserve = this.selectedItems.filter(item =>
        this.canReserveItem(item) && !this.isQuantityInvalid(item)
      )

      itemsToReserve.forEach(item => {
        item.isReserved = true
        item.reservedDate = new Date()
        item.reserved = (item.reserved || 0) + item.quantity
      })

      this.$emit('reserve', { items: itemsToReserve, type: 'multiple' })
      success(`จองสต็อกเรียบร้อยแล้ว ${itemsToReserve.length} รายการ`, 'จองสต็อกสำเร็จ')
    },

    async reserveAll() {
      this.stockItems.forEach(item => {
        if (this.canReserveItem(item) && !this.isQuantityInvalid(item)) {
          item.isSelected = true
        }
      })

      await this.reserveSelected()
    },

    async unreserveAll() {
      if (this.reservedItemsCount === 0) return

      const reservedItems = this.stockItems.filter(item => item.isReserved)

      reservedItems.forEach(item => {
        item.isReserved = false
        item.reservedDate = null
        item.reserved = Math.max(0, (item.reserved || 0) - item.quantity)
      })

      this.$emit('unreserve', { items: reservedItems, type: 'all' })
      success(`ยกเลิกการจองเรียบร้อยแล้ว ${reservedItems.length} รายการ`, 'ยกเลิกสำเร็จ')
    },

    async generateReport() {
      success('สร้างรายงานเรียบร้อยแล้ว', 'สร้างรายงานสำเร็จ')
    },

    cancelReservation() {
      confirmThenSubmit('', 'คุณต้องการยกเลิกการจองสต็อกนี้หรือไม่?', () => {
        this.clearForm()
        this.$emit('cancel')
      })
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
      if (item.isSelected) return 'badge badge-main'
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
@import '@/assets/scss/responsive-style/web';

.info-display {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 8px 12px;
  min-height: 38px;
  display: flex;
  align-items: center;
  margin-top: 5px;
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
    background-color: var(--base-green);
    color: white;
  }

  &.badge-warning {
    background-color: var(--base-warning);
    color: #212529;
  }

  &.badge-main {
    background-color: var(--base-font-color);
    color: white;
  }

  &.badge-secondary {
    background-color: #6c757d;
    color: white;
  }

  &.badge-danger {
    background-color: var(--base-red);
    color: white;
  }

  &.badge-info {
    background-color: #17a2b8;
    color: white;
  }
}

.summary-section {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;

  h6 {
    color: var(--base-font-color);
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
  border-color: var(--base-red);
}

.invalid-feedback {
  display: block;
  width: 100%;
  margin-top: 0.25rem;
  font-size: 0.875em;
  color: var(--base-red);
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
</style>
