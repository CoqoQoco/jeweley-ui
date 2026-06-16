<template>
  <modal
    :showModal="isShow"
    @closeModal="closeModal"
    width="90vw"
    :isShowActionPart="true"
  >
    <template #title>
      <span class="title-text-lg px-3 pt-3 d-block">แก้ไขวัสดุทั้งหมด (Edit All Materials)</span>
    </template>

    <template #content>
      <div class="modal-body-content p-3">
        <!-- Header Info -->
        <div class="info-section mb-3">
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
            <div>
              <button
                type="button"
                class="btn btn-outline-main btn-sm"
                @click="loadFromBreakdown"
                :disabled="!hasBreakdownData"
              >
                <span class="bi bi-download mr-1"></span>
                โหลดจาก Breakdown
              </button>
              <button
                type="button"
                class="btn btn-dark btn-sm ml-2"
                @click="resetToOriginal"
              >
                <span class="bi bi-arrow-clockwise mr-1"></span>
                รีเซ็ตเป็นค่าเดิม
              </button>
            </div>
            <div>
              <button
                type="button"
                class="btn btn-main btn-sm"
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
              <DropdownGeneric
                :modelValue="materialData.type"
                :options="masterMaterialType"
                optionLabel="description"
                optionValue="value"
                placeholder="เลือกประเภท"
                @update:modelValue="val => { materialData.type = val; updateMaterialBarcode(materialData) }"
              />
            </template>

            <!-- Type Code -->
            <template #typeCodeTemplate="{ data: materialData }">
              <div v-if="materialData.type === 'Gold' || materialData.type === 'Silver'">
                <DropdownGeneric
                  :modelValue="materialData.typeCode"
                  :options="masterGold"
                  optionLabel="description"
                  optionValue="code"
                  placeholder="เลือกทอง/เงิน"
                  :showClear="true"
                  @update:modelValue="val => { materialData.typeCode = val; updateMaterialBarcode(materialData) }"
                />
              </div>
              <div v-else-if="materialData.type === 'Diamond'">
                <DropdownGeneric
                  :modelValue="materialData.typeCode"
                  :options="masterDiamondGrade"
                  optionLabel="description"
                  optionValue="nameEn"
                  placeholder="เลือกเกรดเพชร"
                  :showClear="true"
                  @update:modelValue="val => { materialData.typeCode = val; updateMaterialBarcode(materialData) }"
                />
              </div>
              <div v-else-if="materialData.type === 'Gem'">
                <DropdownGeneric
                  :modelValue="materialData.typeCode"
                  :options="masterGem"
                  optionLabel="description"
                  optionValue="nameEn"
                  placeholder="เลือกพลอย"
                  :showClear="true"
                  @update:modelValue="val => { materialData.typeCode = val; updateMaterialBarcode(materialData) }"
                />
              </div>
              <div v-else-if="materialData.type === 'Worker'">
                <InputTextGeneric
                  v-model="materialData.typeCode"
                  placeholder="รหัสงาน"
                  :readonly="true"
                />
              </div>
              <div v-else-if="materialData.type === 'Setting' || materialData.type === 'ETC'">
                <InputTextGeneric
                  v-model="materialData.typeCode"
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
                <InputTextGeneric
                  v-model="materialData.qty"
                  type="number"
                  placeholder="จำนวน"
                  :min="0"
                  :step="0.01"
                  @blur="updateMaterialBarcode(materialData)"
                />
                <InputTextGeneric
                  v-model="materialData.qtyUnit"
                  placeholder="หน่วย"
                  class="mt-1 unit-input"
                />
              </div>
            </template>

            <!-- Weight -->
            <template #weightTemplate="{ data: materialData }">
              <div class="weight-input-container">
                <InputTextGeneric
                  v-model="materialData.qtyWeight"
                  type="number"
                  placeholder="น้ำหนัก"
                  :min="0"
                  :step="0.01"
                  @blur="updateMaterialBarcode(materialData)"
                />
                <InputTextGeneric
                  v-model="materialData.qtyWeightUnit"
                  placeholder="หน่วย"
                  class="mt-1 unit-input"
                />
              </div>
            </template>

            <!-- Price -->
            <template #priceTemplate="{ data: materialData }">
              <div class="price-input-container">
                <InputTextGeneric
                  v-model="materialData.qtyPrice"
                  type="number"
                  placeholder="ราคา/หน่วย"
                  :min="0"
                  :step="0.01"
                />
                <InputTextGeneric
                  v-model="materialData.qtyWeightPrice"
                  type="number"
                  placeholder="ราคา/น้ำหนัก"
                  :min="0"
                  :step="0.01"
                  class="mt-1"
                />
              </div>
            </template>

            <!-- Region -->
            <template #regionTemplate="{ data: materialData }">
              <InputTextGeneric
                v-model="materialData.region"
                placeholder="แหล่งที่มา"
              />
            </template>

            <!-- Barcode -->
            <template #typeBarcodeTemplate="{ data: materialData }">
              <InputTextGeneric
                v-model="materialData.typeBarcode"
                placeholder="ข้อความ Barcode"
                :readonly="true"
              />
            </template>

            <!-- Actions -->
            <template #actionTemplate="{ index }">
              <button
                type="button"
                class="btn btn-red btn-sm"
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
    </template>

    <template #action>
      <div class="d-flex justify-content-between w-100">
        <div class="text-muted">
          <small>จำนวนวัสดุ: {{ editableMaterials.length }} รายการ</small>
        </div>
        <div>
          <button
            type="button"
            class="btn btn-outline-main btn-sm"
            @click="closeModal"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            class="btn btn-main btn-sm ml-2"
            @click="saveChanges"
            :disabled="!hasValidMaterials"
          >
            <span class="bi bi-check-lg mr-1"></span>
            บันทึกการเปลี่ยนแปลง
          </button>
        </div>
      </div>
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'

import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

export default {
  name: 'EditAllMaterialsModal',

  components: {
    modal,
    BaseDataTable,
    DropdownGeneric,
    InputTextGeneric
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
@import '@/assets/scss/custom-style/standard-form.scss';

.modal-body-content {
  max-height: 70vh;
  overflow-y: auto;
}

.info-section {
  .alert {
    border-radius: var(--radius-sm);
    border: 1px solid #b8daff;
    background-color: #d1ecf1;
    color: #0c5460;
  }
}

.control-section {
  border-bottom: 1px solid var(--color-border);
  padding-bottom: var(--sp-lg);
}

.qty-input-container,
.weight-input-container,
.price-input-container {
  display: flex;
  flex-direction: column;
  gap: var(--sp-xs);

  .unit-input {
    font-size: var(--fs-sm);
    text-align: center;
  }
}

.origin-section {
  border-top: 1px solid var(--color-border);
  padding-top: var(--sp-lg);

  .origin-materials {
    display: flex;
    flex-wrap: wrap;
    gap: var(--sp-sm);

    .origin-material-card {
      background-color: var(--color-highlight-bg);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      padding: var(--sp-sm);
      font-size: var(--fs-sm);

      .material-info {
        margin-bottom: var(--sp-xs);

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
</style>
