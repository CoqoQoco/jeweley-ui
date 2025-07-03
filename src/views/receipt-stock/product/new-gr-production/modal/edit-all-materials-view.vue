<template>
  <Dialog
    v-model:visible="isVisible"
    :modal="true"
    :closable="true"
    :draggable="false"
    class="edit-all-materials-modal"
    header="แก้ไขวัสดุทั้งหมด (Edit All Materials)"
    :style="{ width: '90vw', maxWidth: '1200px' }"
  >
    <div class="modal-content">
      <!-- Header Info -->
      <div class="info-section">
        <div class="alert alert-info">
          <div class="d-flex align-items-center">
            <span class="bi bi-info-circle mr-2"></span>
            <div>
              <strong>การแก้ไขวัสดุทั้งหมด:</strong> 
              การเปลี่ยนแปลงในหน้านี้จะส่งผลต่อสินค้าทั้งหมดที่เลือก ({{ selectedStocks.length }} รายการ)
            </div>
          </div>
        </div>
      </div>

      <!-- Control Buttons -->
      <div class="control-section mb-3">
        <div class="d-flex justify-content-between align-items-center">
          <div class="d-flex gap-2">
            <button
              type="button"
              class="btn btn-outline-primary btn-sm"
              @click="loadFromBreakdown"
              :disabled="!hasBreakdownData"
            >
              <span class="bi bi-download mr-1"></span>
              โหลดจาก Breakdown
            </button>
            <button
              type="button"
              class="btn btn-outline-secondary btn-sm"
              @click="resetToOriginal"
            >
              <span class="bi bi-arrow-clockwise mr-1"></span>
              รีเซ็ตเป็นค่าเดิม
            </button>
          </div>
          <div class="d-flex gap-2">
            <button
              type="button"
              class="btn btn-success btn-sm"
              @click="addMaterial"
            >
              <span class="bi bi-plus-lg mr-1"></span>
              เพิ่มวัสดุ
            </button>
          </div>
        </div>
      </div>

      <!-- Materials Table -->
      <div class="materials-table-section">
        <BaseDataTable
          :items="editableMaterials"
          :columns="materialColumns"
          :paginator="false"
          :scrollHeight="'400px'"
          class="edit-materials-table"
        >
          <!-- Material Type -->
          <template #typeTemplate="{ data: materialData }">
            <Dropdown
              v-model="materialData.type"
              :options="masterMaterialType"
              optionLabel="description"
              optionValue="value"
              class="w-full"
              placeholder="เลือกประเภท"
              @change="updateMaterialBarcode(materialData)"
            />
          </template>

          <!-- Type Code -->
          <template #typeCodeTemplate="{ data: materialData }">
            <div v-if="materialData.type === 'Gold' || materialData.type === 'Silver'">
              <Dropdown
                v-model="materialData.typeCode"
                :options="masterGold"
                optionLabel="description"
                optionValue="code"
                class="w-full"
                placeholder="เลือกทอง/เงิน"
                :showClear="true"
                @change="updateMaterialBarcode(materialData)"
              />
            </div>
            <div v-else-if="materialData.type === 'Diamond'">
              <Dropdown
                v-model="materialData.typeCode"
                :options="masterDiamondGrade"
                optionLabel="description"
                optionValue="nameEn"
                class="w-full"
                placeholder="เลือกเกรดเพชร"
                :showClear="true"
                @change="updateMaterialBarcode(materialData)"
              />
            </div>
            <div v-else-if="materialData.type === 'Gem'">
              <Dropdown
                v-model="materialData.typeCode"
                :options="masterGem"
                optionLabel="description"
                optionValue="nameEn"
                class="w-full"
                placeholder="เลือกพลอย"
                :showClear="true"
                @change="updateMaterialBarcode(materialData)"
              />
            </div>
            <div v-else-if="materialData.type === 'Worker'">
              <input
                type="text"
                v-model="materialData.typeCode"
                class="form-control"
                placeholder="รหัสงาน"
                readonly
              />
            </div>
            <div v-else-if="materialData.type === 'Setting' || materialData.type === 'ETC'">
              <input
                type="text"
                v-model="materialData.typeCode"
                class="form-control"
                placeholder="รหัส"
              />
            </div>
            <div v-else>
              <span class="text-muted">--- เลือกประเภทก่อน ---</span>
            </div>
          </template>

          <!-- Quantity -->
          <template #qtyTemplate="{ data: materialData }">
            <div class="qty-input-container">
              <input
                type="number"
                v-model="materialData.qty"
                class="form-control"
                placeholder="จำนวน"
                min="0"
                step="0.01"
                @input="updateMaterialBarcode(materialData)"
              />
              <input
                type="text"
                v-model="materialData.qtyUnit"
                class="form-control unit-input mt-1"
                placeholder="หน่วย"
              />
            </div>
          </template>

          <!-- Weight -->
          <template #weightTemplate="{ data: materialData }">
            <div class="weight-input-container">
              <input
                type="number"
                v-model="materialData.qtyWeight"
                class="form-control"
                placeholder="น้ำหนัก"
                min="0"
                step="0.01"
                @input="updateMaterialBarcode(materialData)"
              />
              <input
                type="text"
                v-model="materialData.qtyWeightUnit"
                class="form-control unit-input mt-1"
                placeholder="หน่วย"
              />
            </div>
          </template>

          <!-- Price -->
          <template #priceTemplate="{ data: materialData }">
            <div class="price-input-container">
              <input
                type="number"
                v-model="materialData.qtyPrice"
                class="form-control"
                placeholder="ราคา/หน่วย"
                min="0"
                step="0.01"
              />
              <input
                type="number"
                v-model="materialData.qtyWeightPrice"
                class="form-control mt-1"
                placeholder="ราคา/น้ำหนัก"
                min="0"
                step="0.01"
              />
            </div>
          </template>

          <!-- Region -->
          <template #regionTemplate="{ data: materialData }">
            <input
              type="text"
              v-model="materialData.region"
              class="form-control"
              placeholder="แหล่งที่มา"
            />
          </template>

          <!-- Barcode -->
          <template #typeBarcodeTemplate="{ data: materialData }">
            <input
              type="text"
              v-model="materialData.typeBarcode"
              class="form-control"
              placeholder="ข้อความ Barcode"
              readonly
            />
          </template>

          <!-- Actions -->
          <template #actionTemplate="{ index }">
            <button
              type="button"
              class="btn btn-danger btn-sm"
              @click="removeMaterial(index)"
              :disabled="editableMaterials.length <= 1"
            >
              <i class="bi bi-trash"></i>
            </button>
          </template>
        </BaseDataTable>
      </div>

      <!-- Origin Materials Display -->
      <div class="origin-section mt-3" v-if="hasBreakdownData">
        <h6 class="text-muted">
          <span class="bi bi-info-circle mr-1"></span>
          วัสดุจาก Breakdown (อ้างอิง)
        </h6>
        <div class="origin-materials">
          <div 
            v-for="(material, index) in breakdownData" 
            :key="index"
            class="origin-material-card"
          >
            <div class="material-info">
              <strong>{{ material.type }}</strong>
              <div class="text-small">
                <span v-if="material.typeName">{{ material.typeName }}</span>
                <span v-if="material.typeCode"> ({{ material.typeCode }})</span>
              </div>
            </div>
            <div class="material-values">
              <div v-if="material.qty">{{ material.qty }} {{ material.qtyUnit || 'หน่วย' }}</div>
              <div v-if="material.qtyWeight">{{ material.qtyWeight }} {{ material.qtyWeightUnit || 'กรัม' }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Footer -->
    <template #footer>
      <div class="d-flex justify-content-between">
        <div class="text-muted">
          <small>จำนวนวัสดุ: {{ editableMaterials.length }} รายการ</small>
        </div>
        <div class="d-flex gap-2">
          <button
            type="button"
            class="btn btn-secondary"
            @click="closeModal"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            class="btn btn-primary"
            @click="saveChanges"
            :disabled="!hasValidMaterials"
          >
            <span class="bi bi-check-lg mr-1"></span>
            บันทึกการเปลี่ยนแปลง
          </button>
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script>
import Dialog from 'primevue/dialog'
import Dropdown from 'primevue/dropdown'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

export default {
  name: 'EditAllMaterialsModal',

  components: {
    Dialog,
    Dropdown,
    BaseDataTable
  },

  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    selectedStocks: {
      type: Array,
      default: () => []
    },
    breakdownData: {
      type: Array,
      default: () => []
    },
    masterMaterialType: {
      type: Array,
      default: () => []
    },
    masterGold: {
      type: Array,
      default: () => []
    },
    masterDiamondGrade: {
      type: Array,
      default: () => []
    },
    masterGem: {
      type: Array,
      default: () => []
    }
  },

  emits: ['closeModal', 'saveMaterials'],

  data() {
    return {
      editableMaterials: [],
      originalMaterials: [],
      materialColumns: [
        {
          field: 'type',
          header: 'ประเภท',
          width: '120px'
        },
        {
          field: 'typeCode',
          header: 'รหัส',
          width: '150px'
        },
        {
          field: 'qty',
          header: 'จำนวน',
          width: '120px'
        },
        {
          field: 'weight',
          header: 'น้ำหนัก',
          width: '120px'
        },
        {
          field: 'price',
          header: 'ราคา',
          width: '140px'
        },
        {
          field: 'region',
          header: 'แหล่งที่มา',
          width: '100px'
        },
        {
          field: 'typeBarcode',
          header: 'Barcode',
          minWidth: '150px'
        },
        {
          field: 'action',
          header: '',
          width: '60px'
        }
      ]
    }
  },

  computed: {
    isVisible: {
      get() {
        return this.isShow
      },
      set(value) {
        if (!value) {
          this.closeModal()
        }
      }
    },

    hasBreakdownData() {
      return this.breakdownData && this.breakdownData.length > 0
    },

    hasValidMaterials() {
      return this.editableMaterials.some(m => m.type && (m.qty > 0 || m.qtyWeight > 0))
    }
  },

  watch: {
    isShow: {
      handler(newVal) {
        if (newVal) {
          this.initializeMaterials()
        }
      },
      immediate: true
    }
  },

  methods: {
    initializeMaterials() {
      // Get common materials from selected stocks
      if (this.selectedStocks.length > 0) {
        const firstStock = this.selectedStocks[0]
        if (firstStock.materials && firstStock.materials.length > 0) {
          this.editableMaterials = JSON.parse(JSON.stringify(firstStock.materials))
          this.originalMaterials = JSON.parse(JSON.stringify(firstStock.materials))
        } else {
          this.editableMaterials = []
          this.originalMaterials = []
        }
      }

      // If no materials, start with empty array
      if (this.editableMaterials.length === 0) {
        this.addMaterial()
      }
    },

    loadFromBreakdown() {
      if (!this.hasBreakdownData) return

      this.editableMaterials = this.breakdownData.map(material => ({
        type: material.type,
        typeName: material.typeName,
        typeNameDescription: material.typeNameDescription,
        typeCode: material.typeCode,
        typeCodeName: material.typeCodeName,
        typeBarcode: material.typeBarcode || this.generateBarcode(material),
        qty: material.qty || 0,
        qtyUnit: material.qtyUnit || '',
        qtyPrice: material.qtyPrice || 0,
        qtyWeight: material.qtyWeight || 0,
        qtyWeightUnit: material.qtyWeightUnit || '',
        qtyWeightPrice: material.qtyWeightPrice || 0,
        region: material.region || '',
        isOrigin: material.isOrigin || false
      }))
    },

    resetToOriginal() {
      this.editableMaterials = JSON.parse(JSON.stringify(this.originalMaterials))
    },

    addMaterial() {
      this.editableMaterials.push({
        type: '',
        typeName: '',
        typeCode: '',
        typeBarcode: '',
        qty: 1,
        qtyUnit: 'pc',
        qtyPrice: 0,
        qtyWeight: 0,
        qtyWeightUnit: 'g',
        qtyWeightPrice: 0,
        region: '',
        isOrigin: false
      })
    },

    removeMaterial(index) {
      if (this.editableMaterials.length > 1) {
        this.editableMaterials.splice(index, 1)
      }
    },

    updateMaterialBarcode(material) {
      material.typeBarcode = this.generateBarcode(material)
    },

    generateBarcode(material) {
      if (!material.type) return ''

      let display = ''

      switch (material.type) {
        case 'Diamond':
          display = `${material.qty || ''}${material.type || ''}${material.qtyWeight || ''}${
            material.qtyWeightUnit ? ` ${material.qtyWeightUnit}` : ''
          }${material.typeCode ? `, ${material.typeCode}` : ''}${
            material.region ? `, (${material.region})` : ''
          }`
          break

        case 'Gold':
        case 'Silver':
          display = `${material.qtyWeight || ''}${
            material.qtyWeightUnit ? ` ${material.qtyWeightUnit}` : ''
          }${material.type ? ` ${material.type}` : ''}`
          break

        case 'Gem':
          display = `${material.qty || ''}${material.typeCode || ''}${material.qtyWeight || ''}${
            material.qtyWeightUnit ? ` ${material.qtyWeightUnit}` : ''
          }${material.region ? `, (${material.region})` : ''}`
          break

        case 'Worker':
          display = `${material.typeName || 'ค่าแรง'}`
          break

        case 'Setting':
        case 'ETC':
          display = `${material.typeName || material.type}`
          break
      }

      return display
    },

    saveChanges() {
      // Emit materials to parent for applying to all selected stocks
      this.$emit('saveMaterials', {
        materials: JSON.parse(JSON.stringify(this.editableMaterials)),
        selectedStocks: this.selectedStocks
      })
      this.closeModal()
    },

    closeModal() {
      this.$emit('closeModal')
    }
  }
}
</script>

<style lang="scss" scoped>
.edit-all-materials-modal {
  :deep(.p-dialog) {
    border-radius: 8px;
  }

  :deep(.p-dialog-header) {
    background-color: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
  }
}

.modal-content {
  max-height: 70vh;
  overflow-y: auto;
}

.info-section {
  .alert {
    border-radius: 6px;
    border: 1px solid #b8daff;
    background-color: #d1ecf1;
    color: #0c5460;
  }
}

.control-section {
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 1rem;
}

.materials-table-section {
  .edit-materials-table {
    :deep(.p-datatable-thead) th {
      background-color: #e9ecef;
      font-weight: 600;
    }
  }
}

.qty-input-container,
.weight-input-container,
.price-input-container {
  display: flex;
  flex-direction: column;
  gap: 2px;

  .unit-input {
    font-size: 0.8rem;
    text-align: center;
  }
}

.origin-section {
  border-top: 1px solid #dee2e6;
  padding-top: 1rem;

  .origin-materials {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;

    .origin-material-card {
      background-color: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      padding: 0.5rem;
      font-size: 0.8rem;

      .material-info {
        margin-bottom: 0.25rem;

        .text-small {
          color: #6c757d;
          font-size: 0.7rem;
        }
      }

      .material-values {
        color: #495057;
        font-size: 0.7rem;
      }
    }
  }
}

.gap-2 {
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .edit-all-materials-modal {
    :deep(.p-dialog) {
      width: 95vw !important;
      height: 90vh;
    }
  }

  .modal-content {
    max-height: 60vh;
  }

  .control-section {
    .d-flex {
      flex-direction: column;
      gap: 0.5rem;
    }
  }
}
</style>