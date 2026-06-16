<template>
  <div class="mt-2">
    <!-- Production Order Information Section -->
    <div class="card-container">
      <div class="card-header">
        <h6 class="mb-0">ข้อมูลใบสั่งผลิต</h6>
      </div>
      <div class="card-body">
        <div class="form-col-container">
          <!-- Production Order Number -->
          <div>
            <span class="title-text">เลขที่ใบสั่งผลิต</span>
            <input
              :class="['form-control bg-input']"
              type="text"
              v-model.trim="formProductionOrder.number"
              placeholder="PO-2025-001"
            />
          </div>

          <!-- Order Date -->
          <div>
            <span class="title-text">วันที่ใบสั่งผลิต</span>
            <CalendarGeneric
              class="w-100"
              v-model="formProductionOrder.orderDate"
              :showIcon="true"
              :manualInput="false"
              placeholder="เลือกวันที่"
              dateFormat="dd/mm/yy"
            />
          </div>

          <!-- Required Date -->
          <div>
            <span class="title-text">วันที่ต้องการใช้</span>
            <CalendarGeneric
              class="w-100"
              v-model="formProductionOrder.requiredDate"
              :showIcon="true"
              :manualInput="false"
              placeholder="เลือกวันที่"
              dateFormat="dd/mm/yy"
            />
          </div>

          <!-- Priority -->
          <div>
            <span class="title-text">ลำดับความสำคัญ</span>
            <DropdownGeneric
              v-model="formProductionOrder.priority"
              :options="priorityOptions"
              optionLabel="name"
              optionValue="value"
              placeholder="เลือกลำดับความสำคัญ"
              class="w-100"
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
              v-model.trim="formProductionOrder.saleOrderNumber"
              placeholder="SO-2025-001"
              readonly
            />
          </div>

          <!-- Status -->
          <div>
            <span class="title-text">สถานะ</span>
            <DropdownGeneric
              v-model="formProductionOrder.status"
              :options="statusOptions"
              optionLabel="name"
              optionValue="value"
              placeholder="เลือกสถานะ"
              class="w-100"
            />
          </div>

          <!-- Production Type -->
          <div>
            <span class="title-text">ประเภทการผลิต</span>
            <DropdownGeneric
              v-model="formProductionOrder.productionType"
              :options="productionTypeOptions"
              optionLabel="name"
              optionValue="value"
              placeholder="เลือกประเภทการผลิต"
              class="w-100"
            />
          </div>

          <!-- Workshop -->
          <div>
            <span class="title-text">หน่วยผลิต</span>
            <DropdownGeneric
              v-model="formProductionOrder.workshop"
              :options="workshopOptions"
              optionLabel="name"
              optionValue="value"
              placeholder="เลือกหน่วยผลิต"
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
            <span class="title-text">ลูกค้า</span>
            <div class="info-display">{{ saleOrderInfo.customerName }}</div>
          </div>
          <div>
            <span class="title-text">วันที่ใบสั่งขาย</span>
            <div class="info-display">{{ formatDate(saleOrderInfo.orderDate) }}</div>
          </div>
          <div>
            <span class="title-text">วันที่คาดหวังส่งมอบ</span>
            <div class="info-display">{{ formatDate(saleOrderInfo.expectedDeliveryDate) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Production Items Grid -->
    <div class="card-container mt-3">
      <div class="card-header">
        <h6 class="mb-0">รายการสินค้าที่ต้องผลิต</h6>
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
        <BaseDataTable
          :items="productionItems"
          :totalRecords="productionItems.length"
          dataKey="itemId"
          :columns="tableColumns"
          :paginator="false"
          scrollHeight="400px"
        >
          <template #selectionTemplate="{ data }">
            <input
              type="checkbox"
              v-model="data.isSelected"
              @change="updateItemSelection(data)"
              class="form-check-input"
            />
          </template>

          <template #imageTemplate="{ data }">
            <div class="product-image">
              <img
                :src="data.imageUrl || '/src/assets/images/no-image.png'"
                :alt="data.productName"
                class="product-thumbnail"
              />
            </div>
          </template>

          <template #productNumberTemplate="{ data }">
            <span class="font-weight-bold">{{ data.productNumber }}</span>
          </template>

          <template #productNameTemplate="{ data }">
            <div class="product-description">{{ data.productName }}</div>
          </template>

          <template #materialsTemplate="{ data }">
            <div class="materials-info">
              <div v-if="data.materials?.gold" class="material-item">
                <i class="bi bi-circle-fill text-warning mr-1"></i>
                ทอง: {{ data.materials.gold.weight }}g
              </div>
              <div v-if="data.materials?.diamond" class="material-item">
                <i class="bi bi-gem mr-1"></i>
                เพชร: {{ data.materials.diamond.weight }}ct
              </div>
              <div v-if="data.materials?.gems" class="material-item">
                <i class="bi bi-hexagon mr-1"></i>
                พลอย: {{ data.materials.gems.weight }}ct
              </div>
            </div>
          </template>

          <template #quantityTemplate="{ data }">
            <input
              type="number"
              min="1"
              step="1"
              v-model.number="data.quantity"
              @input="updateItemQuantity(data)"
              :disabled="!data.isSelected"
              class="form-control form-control-sm text-center"
            />
          </template>

          <template #estimatedProductionDaysTemplate="{ data }">
            <div class="text-center">
              <span class="badge badge-info">
                <i class="bi bi-clock mr-1"></i>
                {{ data.estimatedProductionDays || 0 }} วัน
              </span>
            </div>
          </template>

          <template #unitPriceTemplate="{ data }">
            <div class="text-right">{{ formatCurrency(data.unitPrice) }}</div>
          </template>

          <template #totalValueTemplate="{ data }">
            <div class="text-right font-weight-bold">
              <span v-if="data.isSelected">{{ formatCurrency(data.quantity * data.unitPrice) }}</span>
              <span v-else class="text-muted">-</span>
            </div>
          </template>
        </BaseDataTable>
      </div>
    </div>

    <!-- Production Summary -->
    <div class="card-container mt-3">
      <div class="card-header">
        <h6 class="mb-0">สรุปใบสั่งผลิต</h6>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-4">
            <!-- Items Summary -->
            <div class="summary-section">
              <h6>รายการที่เลือก</h6>
              <div class="summary-item">
                <span>จำนวนรายการ:</span>
                <span class="font-weight-bold">{{ selectedItemsCount }} รายการ</span>
              </div>
              <div class="summary-item">
                <span>จำนวนชิ้นรวม:</span>
                <span class="font-weight-bold">{{ totalQuantity }} ชิ้น</span>
              </div>
              <div class="summary-item">
                <span>ระยะเวลาผลิตเฉลี่ย:</span>
                <span class="font-weight-bold">{{ averageProductionDays }} วัน</span>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <!-- Materials Summary -->
            <div class="summary-section">
              <h6>สรุปวัตถุดิบ</h6>
              <div class="summary-item">
                <span>ทองรวม:</span>
                <span class="font-weight-bold text-warning">{{ totalMaterials.gold }} g</span>
              </div>
              <div class="summary-item">
                <span>เพชรรวม:</span>
                <span class="font-weight-bold">{{ totalMaterials.diamond }} ct</span>
              </div>
              <div class="summary-item">
                <span>พลอยรวม:</span>
                <span class="font-weight-bold text-info">{{ totalMaterials.gems }} ct</span>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <!-- Value Summary -->
            <div class="summary-section">
              <h6>สรุปมูลค่า</h6>
              <div class="summary-item">
                <span>มูลค่าวัตถุดิบ:</span>
                <span class="font-weight-bold">{{ formatCurrency(materialsValue) }}</span>
              </div>
              <div class="summary-item">
                <span>ค่าแรงประมาณ:</span>
                <span class="font-weight-bold">{{ formatCurrency(estimatedLaborCost) }}</span>
              </div>
              <div class="summary-item border-top pt-2 mt-2">
                <span class="h6">มูลค่ารวม:</span>
                <span class="h6 font-weight-bold" style="color: var(--base-font-color)">{{ formatCurrency(totalProductionValue) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Production Notes -->
        <div class="row mt-3">
          <div class="col-md-12">
            <div>
              <span class="title-text">หมายเหตุการผลิต</span>
              <textarea
                class="form-control"
                rows="3"
                v-model="formProductionOrder.remark"
                placeholder="หมายเหตุเพิ่มเติมสำหรับการผลิต เช่น ข้อกำหนดพิเศษ, วัตถุดิบที่ต้องการ..."
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
                <li v-for="err in validationErrors" :key="err">{{ err }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="btn-submit-container mt-3">
      <button
        class="btn btn-outline-main mr-2"
        type="button"
        @click="saveDraft"
        :disabled="selectedItemsCount === 0"
      >
        <i class="bi bi-file-earmark mr-1"></i>
        บันทึกร่าง
      </button>

      <button
        class="btn btn-main mr-2"
        type="button"
        @click="confirmProduction"
        :disabled="selectedItemsCount === 0 || hasValidationErrors"
      >
        <i class="bi bi-check-circle mr-1"></i>
        ยืนยันใบสั่งผลิต
      </button>

      <button
        class="btn btn-green mr-2"
        type="button"
        @click="generatePDF"
        :disabled="selectedItemsCount === 0"
      >
        <i class="bi bi-file-pdf mr-1"></i>
        สร้าง PDF
      </button>

      <button
        class="btn btn-dark mr-2"
        type="button"
        @click="clearForm"
      >
        <i class="bi bi-arrow-clockwise mr-1"></i>
        ล้างข้อมูล
      </button>

      <button
        class="btn btn-red mr-2"
        type="button"
        @click="cancelOrder"
      >
        <i class="bi bi-x-circle mr-1"></i>
        ยกเลิก
      </button>
    </div>
  </div>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import CalendarGeneric from '@/components/prime-vue/CalendarGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import { formatDecimal } from '@/services/utils/decimal.js'
import { success, error, confirmSubmit } from '@/services/alert/sweetAlerts.js'

export default {
  name: 'ProductionOrderView',

  components: {
    BaseDataTable,
    CalendarGeneric,
    DropdownGeneric
  },

  emits: ['update:modelForm', 'update:modelSaleOrder', 'save', 'confirm', 'cancel'],

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
      productionItems: [],

      formProductionOrder: {
        productionOrderId: null,
        saleOrderId: null,
        saleOrderNumber: '',
        number: '',
        orderDate: new Date(),
        requiredDate: null,
        priority: 'normal',
        status: 'Draft',
        productionType: 'custom',
        workshop: '',
        remark: ''
      },

      saleOrderInfo: {},

      statusOptions: [
        { name: 'ร่าง', value: 'Draft' },
        { name: 'รอการยืนยัน', value: 'PendingApproval' },
        { name: 'ยืนยันแล้ว', value: 'Confirmed' },
        { name: 'กำลังผลิต', value: 'InProduction' },
        { name: 'เสร็จสิ้น', value: 'Completed' },
        { name: 'ยกเลิก', value: 'Cancelled' }
      ],

      priorityOptions: [
        { name: 'ปกติ', value: 'normal' },
        { name: 'สำคัญ', value: 'high' },
        { name: 'เร่งด่วน', value: 'urgent' },
        { name: 'วิกฤต', value: 'critical' }
      ],

      productionTypeOptions: [
        { name: 'สั่งทำพิเศษ', value: 'custom' },
        { name: 'ผลิตมาตรฐาน', value: 'standard' },
        { name: 'ซ่อมแซม', value: 'repair' },
        { name: 'ปรับปรุง', value: 'modification' }
      ],

      workshopOptions: [
        { name: 'แผนกหล่อ', value: 'casting' },
        { name: 'แผนกเสริมเพชร', value: 'setting' },
        { name: 'แผนกขัดเงา', value: 'polishing' },
        { name: 'แผนกแกะสลัก', value: 'engraving' },
        { name: 'แผนกประกอบ', value: 'assembly' }
      ]
    }
  },

  computed: {
    tableColumns() {
      return [
        { field: 'selection', header: 'เลือก', width: '80px', sortable: false, template: 'selectionTemplate' },
        { field: 'image', header: 'รูปภาพ', width: '80px', sortable: false, template: 'imageTemplate' },
        { field: 'productNumber', header: 'รหัสสินค้า', minWidth: '120px', sortable: false, template: 'productNumberTemplate' },
        { field: 'productName', header: 'ชื่อสินค้า', minWidth: '200px', sortable: false, template: 'productNameTemplate' },
        { field: 'materials', header: 'วัตถุดิบ', minWidth: '180px', sortable: false, template: 'materialsTemplate' },
        { field: 'quantity', header: 'จำนวน', minWidth: '100px', sortable: false, template: 'quantityTemplate' },
        { field: 'estimatedProductionDays', header: 'ระยะเวลาผลิต', minWidth: '120px', sortable: false, template: 'estimatedProductionDaysTemplate' },
        { field: 'unitPrice', header: 'ราคาต่อหน่วย', minWidth: '120px', sortable: false, template: 'unitPriceTemplate' },
        { field: 'totalValue', header: 'มูลค่ารวม', minWidth: '120px', sortable: false, template: 'totalValueTemplate' }
      ]
    },

    allItemsSelected() {
      return this.productionItems.length > 0 && this.productionItems.every((item) => item.isSelected)
    },

    selectedItems() {
      return this.productionItems.filter((item) => item.isSelected)
    },

    selectedItemsCount() {
      return this.selectedItems.length
    },

    totalQuantity() {
      return this.selectedItems.reduce((sum, item) => sum + (item.quantity || 0), 0)
    },

    averageProductionDays() {
      if (this.selectedItemsCount === 0) return 0
      const totalDays = this.selectedItems.reduce((sum, item) => sum + (item.estimatedProductionDays || 0), 0)
      return Math.round(totalDays / this.selectedItemsCount)
    },

    totalMaterials() {
      return this.selectedItems.reduce(
        (totals, item) => {
          if (item.materials) {
            totals.gold += (item.materials.gold?.weight * item.quantity) || 0
            totals.diamond += (item.materials.diamond?.weight * item.quantity) || 0
            totals.gems += (item.materials.gems?.weight * item.quantity) || 0
          }
          return totals
        },
        { gold: 0, diamond: 0, gems: 0 }
      )
    },

    materialsValue() {
      const goldPrice = 2800
      const diamondPrice = 150000
      const gemPrice = 10000
      return (
        this.totalMaterials.gold * goldPrice +
        this.totalMaterials.diamond * diamondPrice +
        this.totalMaterials.gems * gemPrice
      )
    },

    estimatedLaborCost() {
      return this.selectedItems.reduce((sum, item) => {
        const baseLaborCost = 5000
        const complexityMultiplier = item.estimatedProductionDays / 7
        return sum + baseLaborCost * complexityMultiplier * item.quantity
      }, 0)
    },

    totalProductionValue() {
      return this.materialsValue + this.estimatedLaborCost
    },

    validationErrors() {
      const errors = []

      if (this.selectedItemsCount === 0) {
        errors.push('กรุณาเลือกรายการสินค้าที่ต้องผลิตอย่างน้อย 1 รายการ')
      }

      if (!this.formProductionOrder.requiredDate) {
        errors.push('กรุณาระบุวันที่ต้องการใช้สินค้า')
      }

      if (!this.formProductionOrder.workshop) {
        errors.push('กรุณาเลือกหน่วยผลิต')
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
          this.formProductionOrder = { ...this.formProductionOrder, ...newVal }
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
        let items = []
        try {
          items = JSON.parse(query.items)
        } catch {
          error('ข้อมูลจากใบสั่งขายไม่ถูกต้อง', 'โหลดข้อมูลไม่สำเร็จ')
          return
        }

        const saleOrderData = {
          saleOrderId: query.saleOrderId,
          number: query.saleOrderNumber,
          customerName: query.customerName,
          items
        }

        this.loadSaleOrderData(saleOrderData)
        success(`โหลดข้อมูลจากใบสั่งขาย ${query.saleOrderNumber} เรียบร้อย`, 'โหลดข้อมูลสำเร็จ')
      }
    },

    loadSaleOrderData(saleOrderData) {
      this.saleOrderInfo = saleOrderData
      this.formProductionOrder.saleOrderId = saleOrderData.saleOrderId
      this.formProductionOrder.saleOrderNumber = saleOrderData.number

      this.productionItems = (saleOrderData.items || [])
        .filter((item) => item.itemType === 'Production')
        .map((item) => ({
          ...item,
          isSelected: false,
          materials: {
            gold: { weight: 15.5 },
            diamond: { weight: 0.5 },
            gems: { weight: 1.2 }
          },
          imageUrl: null
        }))
    },

    toggleAllItems() {
      const newState = !this.allItemsSelected
      this.productionItems.forEach((item) => {
        item.isSelected = newState
      })
    },

    updateItemSelection() {},

    updateItemQuantity() {},

    saveDraft() {
      const productionOrderData = {
        ...this.formProductionOrder,
        status: 'Draft',
        items: this.selectedItems
      }
      this.$emit('save', productionOrderData)
      success('บันทึกร่างเรียบร้อยแล้ว', 'บันทึกสำเร็จ')
    },

    confirmProduction() {
      if (this.hasValidationErrors) {
        error('กรุณาแก้ไขข้อผิดพลาดก่อนยืนยันใบสั่งผลิต', 'ไม่สามารถยืนยันได้')
        return
      }

      const productionOrderData = {
        ...this.formProductionOrder,
        status: 'Confirmed',
        items: this.selectedItems
      }
      this.$emit('confirm', productionOrderData)
      success('ยืนยันใบสั่งผลิตเรียบร้อยแล้ว', 'ยืนยันสำเร็จ')
    },

    generatePDF() {
      // TODO: Implement PDF generation
      success('สร้าง PDF เรียบร้อยแล้ว', 'สร้างเอกสารสำเร็จ')
    },

    cancelOrder() {
      confirmSubmit('คุณต้องการยกเลิกการสร้างใบสั่งผลิตนี้หรือไม่?', 'ยืนยันการยกเลิก', () => {
        this.clearForm()
        this.$emit('cancel')
      })
    },

    clearForm() {
      this.productionItems = []
      this.saleOrderInfo = {}
      this.formProductionOrder = {
        productionOrderId: null,
        saleOrderId: null,
        saleOrderNumber: '',
        number: '',
        orderDate: new Date(),
        requiredDate: null,
        priority: 'normal',
        status: 'Draft',
        productionType: 'custom',
        workshop: '',
        remark: ''
      }
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
  background: var(--color-card-bg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--sp-lg);
}

.card-header {
  background: #f8f9fa;
  border-bottom: 1px solid var(--color-border);
  padding: var(--sp-sm) var(--sp-lg);
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header-actions {
  display: flex;
  align-items: center;
}

.card-body {
  padding: var(--sp-lg);
}

.info-display {
  background: #f8f9fa;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--sp-sm) var(--sp-md);
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
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
}

.product-description {
  font-size: var(--fs-base);
  line-height: var(--lh-sm);
}

.materials-info {
  .material-item {
    font-size: var(--fs-sm);
    margin-bottom: var(--sp-xs);

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.badge {
  padding: var(--sp-xs) var(--sp-sm);
  font-size: var(--fs-sm);
  border-radius: var(--radius-sm);
  font-weight: 600;

  &.badge-info {
    background-color: var(--base-green);
    color: white;
  }
}

.summary-section {
  background: #f8f9fa;
  padding: var(--sp-lg);
  border-radius: var(--radius-sm);
  height: 100%;

  h6 {
    color: #495057;
    margin-bottom: var(--sp-sm);
    border-bottom: 1px solid var(--color-border);
    padding-bottom: var(--sp-sm);
  }
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--sp-sm);

  &:last-child {
    margin-bottom: 0;
  }

  &.border-top {
    border-top: 1px solid var(--color-border);
    padding-top: var(--sp-sm);
    margin-top: var(--sp-sm);
  }
}

.form-check-input {
  margin: 0;
}

.alert {
  padding: var(--sp-lg);
  margin-bottom: var(--sp-lg);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);

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

.text-warning {
  color: var(--base-warning) !important;
}

.text-info {
  color: var(--base-green) !important;
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
</style>
