<template>
  <div class="form-col-container">
    <div class="filter-container mt-2">
      <div class="d-flex justify-content-between">
        <div class="group-title pl-2">
          <div>
            <span class="title-text-lg bi bi-hammer"></span>
            <span class="title-text-lg ml-2">ส่วนประกอบสินค้า</span>
          </div>
          <small class="pl-4">รายละเอียดการผลิตสินค้า ส่วนประกอบ เเละวัสดุต่างๆ (Breakdown Materials)</small>
        </div>
        <!-- Control buttons -->
        <div class="d-flex justify-content-start mt-2 gap-2">
          <button
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
          </button>
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
              @change="$emit('updateTypeBarcode', materialData, data.stockReceiptNumber)"
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
                @change="$emit('updateTypeBarcode', materialData, data.stockReceiptNumber)"
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
                @change="$emit('updateTypeBarcode', materialData, data.stockReceiptNumber)"
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
                @change="$emit('updateTypeBarcode', materialData, data.stockReceiptNumber)"
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
              @input="$emit('updateTypeBarcode', materialData, data.stockReceiptNumber)"
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
              @input="$emit('updateTypeBarcode', materialData, data.stockReceiptNumber)"
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
                @input="$emit('updateTypeBarcode', materialData, data.stockReceiptNumber)"
              />
              <input
                type="text"
                v-model="materialData.qtyUnit"
                class="form-control unit-input"
                :style="getBgColor(false, materialData.qtyUnit)"
                placeholder="หน่วย"
                @input="$emit('updateTypeBarcode', materialData, data.stockReceiptNumber)"
              />
            </div>
            <div class="price-display" v-if="materialData.qtyPrice">
              <small class="text-muted">{{ formatCurrency(materialData.qtyPrice) }}/{{ materialData.qtyUnit || 'หน่วย' }}</small>
            </div>
          </div>
        </template>

        <template #weightTemplate="{ data: materialData }">
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
                @input="$emit('updateTypeBarcode', materialData, data.stockReceiptNumber)"
              />
              <input
                type="text"
                v-model="materialData.qtyWeightUnit"
                class="form-control unit-input"
                :style="getBgColor(false, materialData.qtyWeightUnit)"
                placeholder="หน่วย"
                @input="$emit('updateTypeBarcode', materialData, data.stockReceiptNumber)"
              />
            </div>
            <div class="price-display" v-if="materialData.qtyWeightPrice">
              <small class="text-muted">{{ formatCurrency(materialData.qtyWeightPrice) }}/{{ materialData.qtyWeightUnit || 'กรัม' }}</small>
            </div>
          </div>
        </template>

        <template #priceTemplate="{ data: materialData }">
          <div class="d-flex justify-content-center">
            <input
              type="number"
              v-model="materialData.price"
              class="form-control"
              :style="getBgColor(false, materialData.price)"
              min="0"
              step="0.01"
            />
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
          <div class="d-flex align-items-center mt-1">
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

  emits: ['addMaterial', 'removeMaterial', 'updateTypeBarcode', 'loadFromBreakdown', 'editAllMaterials'],

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