<template>
  <div class="form-col-container">
    <div class="filter-container mt-2">
      <div class="d-flex justify-content-between">
        <div class="group-title pl-2">
          <div>
            <span class="title-text-lg bi bi-hammer"></span>
            <span class="title-text-lg ml-2">ส่วนประกอบสินค้า</span>
          </div>
          <small class="pl-4"
            >รายละเอียดการผลิตสินค้า ส่วนประกอบ เเละวัสดุต่างๆ (Breakdown Materials)</small
          >
        </div>
        <!-- Control buttons -->
        <div class="d-flex justify-content-start mt-2 gap-2">
          <!-- <button
            type="button"
            class="btn btn-outline-primary btn-sm"
            @click="$emit('loadFromBreakdown')"
            :disabled="!hasBreakdownData"
            title="โหลดวัสดุจาก Breakdown"
          >
            <span class="bi bi-download"></span>
            <span class="ml-1">โหลด Breakdown</span>
          </button>
          <button
            type="button"
            class="btn btn-outline-secondary btn-sm"
            @click="$emit('editAllMaterials')"
            title="แก้ไขวัสดุทั้งหมด"
          >
            <span class="bi bi-pencil-square"></span>
            <span class="ml-1">แก้ไขทั้งหมด</span>
          </button> -->
          <div
            type="button"
            class="p-2 text-dark cursor-pointer"
            @click="$emit('addMaterial', data.materials)"
            title="เพิ่มวัสดุใหม่"
          >
            <span class="bi bi-plus-lg"></span>
          </div>
        </div>
      </div>

      <BaseDataTable
        :items="data.materials"
        :columns="materialColumns"
        :paginator="false"
        :scrollHeight="scrollHeight"
        class="custom-form-table-material"
      >
        <template #typeTemplate="{ data: materialData }">
          <div class="d-flex justify-content-center">
            <Dropdown
              v-model="materialData.type"
              :options="masterMaterialType"
              optionLabel="description"
              optionValue="value"
              class="w-full md:w-14rem"
              :class="materialData.type === true ? `p-invalid` : ``"
              @change="emitUpdateTypeBarcode(materialData)"
            />
          </div>
        </template>

        <!-- Type Name -->
        <template #typeNameTemplate="{ data: materialData }">
          <div class="d-flex justify-content-center">
            <input
              type="text"
              v-model="materialData.typeName"
              class="form-control"
              :style="getBgColor(false, materialData.typeName)"
              placeholder="ชื่อวัสดุ"
              @input="emitUpdateTypeBarcode(materialData)"
            />
          </div>
        </template>

        <template #typeCodeTemplate="{ data: materialData }">
          <div class="">
            <div v-if="materialData.type === 'Gold' || materialData.type === 'Silver'">
              <Dropdown
                v-model="materialData.typeCode"
                :options="masterGold"
                optionLabel="description"
                optionValue="code"
                class="w-full md:w-14rem"
                placeholder="เลือกทอง"
                :showClear="materialData.typeCode ? true : false"
                @change="emitUpdateTypeBarcode(materialData)"
              />
            </div>
            <div v-else-if="materialData.type === 'Diamond'">
              <Dropdown
                v-model="materialData.typeCode"
                :options="masterDiamondGrade"
                optionLabel="description"
                optionValue="nameEn"
                class="w-full md:w-14rem"
                placeholder="เลือกเกรดเพชร"
                :showClear="materialData.typeCode ? true : false"
                @change="emitUpdateTypeBarcode(materialData)"
              />
            </div>
            <div v-else-if="materialData.type === 'Gem'">
              <Dropdown
                v-model="materialData.typeCode"
                :options="masterGem"
                optionLabel="description"
                optionValue="nameEn"
                class="w-full md:w-14rem"
                placeholder="เลือกพลอย"
                :showClear="materialData.typeCode ? true : false"
                @change="emitUpdateTypeBarcode(materialData)"
              />
            </div>
            <div v-else class="vertical-center-container text-center">
              <span> --- โปรดระบุประเภท ---</span>
            </div>
          </div>
        </template>

        <template #sizeTemplate="{ data: materialData }">
          <div class="d-flex justify-content-center">
            <input
              type="text"
              v-model="materialData.size"
              class="form-control"
              :style="getBgColor(false, materialData.size)"
              @input="emitUpdateTypeBarcode(materialData)"
            />
          </div>
        </template>

        <template #regionTemplate="{ data: materialData }">
          <div class="d-flex justify-content-center">
            <input
              type="text"
              v-model="materialData.region"
              class="form-control"
              :style="getBgColor(false, materialData.region)"
              @input="emitUpdateTypeBarcode(materialData)"
            />
          </div>
        </template>

        <template #qtyTemplate="{ data: materialData }">
          <div class="material-qty-container">
            <div class="qty-input-group">
              <input
                type="number"
                v-model="materialData.qty"
                class="form-control"
                :style="getBgColor(false, materialData.qty)"
                placeholder="จำนวน"
                min="0"
                step="0.01"
                @input="emitUpdateTypeBarcode(materialData)"
              />
              <input
                type="text"
                v-model="materialData.qtyUnit"
                class="form-control unit-input"
                :style="getBgColor(false, materialData.qtyUnit)"
                placeholder="หน่วย"
                @input="emitUpdateTypeBarcode(materialData)"
              />
            </div>
          </div>
        </template>

        <!-- Price Qty -->
        <template #priceQtyTemplate="{ data: materialData }">
          <div class="d-flex justify-content-center">
            <input
              type="number"
              v-model="materialData.qtyPrice"
              class="form-control"
              :style="getBgColor(false, materialData.qtyPrice)"
              placeholder="ราคา/หน่วย"
              min="0"
              step="0.01"
              @input="emitUpdateTypeBarcode(materialData)"
            />
          </div>
        </template>

        <template #qtyWeightTemplate="{ data: materialData }">
          <div class="material-weight-container">
            <div class="weight-input-group">
              <input
                type="number"
                v-model="materialData.qtyWeight"
                class="form-control"
                :style="getBgColor(false, materialData.qtyWeight)"
                placeholder="น้ำหนัก"
                min="0"
                step="0.01"
                @input="emitUpdateTypeBarcode(materialData)"
              />
              <input
                type="text"
                v-model="materialData.qtyWeightUnit"
                class="form-control unit-input"
                :style="getBgColor(false, materialData.qtyWeightUnit)"
                placeholder="หน่วย"
                @input="emitUpdateTypeBarcode(materialData)"
              />
            </div>
          </div>
        </template>

        <!-- Price Weight -->
        <template #priceWeightTemplate="{ data: materialData }">
          <div class="d-flex justify-content-center">
            <input
              type="number"
              v-model="materialData.qtyWeightPrice"
              class="form-control"
              :style="getBgColor(false, materialData.qtyWeightPrice)"
              placeholder="ราคา/น้ำหนัก"
              min="0"
              step="0.01"
              @input="emitUpdateTypeBarcode(materialData)"
            />
          </div>
        </template>

        <!-- Total Price -->
        <template #totalPriceTemplate="{ data: materialData }">
          <div class="total-price-display">
            <span class="total-amount">
              {{
                calculateTotalPrice(materialData).toLocaleString('th-TH', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })
              }}
            </span>
            <small class="currency-unit">บาท</small>
          </div>
        </template>

        <template #typeBarcodeTemplate="{ data: materialData }">
          <div class="d-flex justify-content-center">
            <input
              type="text"
              v-model="materialData.typeBarcode"
              class="form-control"
              placeholder="ข้อความที่จะเเสดงบน Barcode"
              disabled
            />
          </div>
        </template>

        <template #actionTemplate="{ index, data: materialData }">
          <div>
            <button
              type="button"
              class="btn btn-red btn-sm"
              @click="$emit('removeMaterial', materialData, data, index)"
            >
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </template>
      </BaseDataTable>
    </div>
  </div>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import Dropdown from 'primevue/dropdown'

export default {
  name: 'MaterialsSection',

  components: {
    BaseDataTable,
    Dropdown
  },

  props: {
    data: {
      type: Object,
      required: true
    },
    masterMaterialType: {
      type: Array,
      required: true
    },
    masterGold: {
      type: Array,
      required: true
    },
    masterDiamondGrade: {
      type: Array,
      required: true
    },
    masterGem: {
      type: Array,
      required: true
    },
    materialColumns: {
      type: Array,
      required: true
    },
    scrollHeight: {
      type: String,
      required: true
    },
    getBgColor: {
      type: Function,
      required: true
    },
    breakdownData: {
      type: Array,
      default: () => []
    }
  },

  emits: [
    'addMaterial',
    'removeMaterial',
    'updateTypeBarcode',
    'loadFromBreakdown',
    'editAllMaterials'
  ],

  computed: {
    hasBreakdownData() {
      return this.breakdownData && this.breakdownData.length > 0
    }
  },

  methods: {
    formatCurrency(value) {
      if (!value) return '0.00'
      return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 2
      }).format(value)
    },

    calculateTotalPrice(material) {
      if (!material) return 0

      const qtyTotal = (material.qty || 0) * (material.qtyPrice || 0)
      const weightTotal = (material.qtyWeight || 0) * (material.qtyWeightPrice || 0)

      return qtyTotal + weightTotal
    },

    emitUpdateTypeBarcode(materialData) {
      console.log('materials-section emitUpdateTypeBarcode:', {
        materialData,
        stockReceiptNumber: this.data.stockReceiptNumber,
        dataObject: this.data
      })
      this.$emit('updateTypeBarcode', materialData, this.data.stockReceiptNumber)
    }
  }
}
</script>

<style lang="scss" scoped>
.filter-container {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  background-color: #f8f9fa;
}

.group-title {
  display: flex;
  flex-direction: column;
}

.title-text-lg {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--base-font-color);
}

.vertical-center-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.gap-2 {
  gap: 0.5rem;
}

.cursor-pointer {
  cursor: pointer;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    border-radius: 4px;
  }
}

// Enhanced material input containers
.material-qty-container,
.material-weight-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.qty-input-group,
.weight-input-group {
  display: flex;
  gap: 2px;
  width: 100%;

  .form-control {
    flex: 1;
    min-width: 60px;
  }

  .unit-input {
    flex: 0 0 50px;
    text-align: center;
    font-size: 0.8rem;
  }
}

.price-display {
  min-height: 16px;

  small {
    font-size: 0.7rem;
    color: #6c757d;
    white-space: nowrap;
  }
}

.total-price-display {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.25rem;
  font-weight: 600;

  .total-amount {
    color: var(--base-font-color);
    font-size: 0.9rem;
  }

  .currency-unit {
    color: #6c757d;
    font-size: 0.75rem;
    font-weight: normal;
  }
}

// Button enhancements
.btn-outline-primary {
  border-color: #007bff;
  color: #007bff;

  &:hover:not(:disabled) {
    background-color: #007bff;
    color: white;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.btn-outline-secondary {
  border-color: #6c757d;
  color: #6c757d;

  &:hover {
    background-color: #6c757d;
    color: white;
  }
}

// Responsive adjustments
@media (max-width: 768px) {
  .qty-input-group,
  .weight-input-group {
    flex-direction: column;

    .unit-input {
      flex: 1 1 auto;
    }
  }

  .gap-2 {
    gap: 0.25rem;
  }
}
</style>
