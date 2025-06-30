<template>
  <div class="form-col-container">
    <div class="filter-container mt-2">
      <div class="d-flex justify-content-between">
        <div class="group-title pl-2">
          <div>
            <span class="title-text-lg bi bi-hammer"></span>
            <span class="title-text-lg ml-2">ส่วนประกอบสินค้า</span>
          </div>
          <small class="pl-4">รายละเอียดการผลิตสินค้า ส่วนประกอบ เและวัสดุต่างๆ</small>
        </div>
        <!-- Add button -->
        <div class="d-flex justify-content-start mt-2">
          <div
            type="button"
            class="p-2 text-dark"
            @click="$emit('addMaterial', data.materials)"
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
          <div class="d-flex justify-content-center">
            <input
              type="number"
              v-model="materialData.qty"
              class="form-control"
              :style="getBgColor(false, materialData.qty)"
              placeholder="จำนวน"
              min="0"
              @input="$emit('updateTypeBarcode', materialData, data.stockReceiptNumber)"
            />
            <input
              type="text"
              style="margin-left: 1px"
              v-model="materialData.qtyUnit"
              class="form-control"
              :style="getBgColor(false, materialData.qtyUnit)"
              placeholder="หน่วย"
              min="0"
              @input="$emit('updateTypeBarcode', materialData, data.stockReceiptNumber)"
            />
          </div>
        </template>

        <template #weightTemplate="{ data: materialData }">
          <div class="d-flex justify-content-center">
            <input
              type="number"
              v-model="materialData.weight"
              class="form-control"
              :style="getBgColor(false, materialData.weight)"
              placeholder="น้ำหนัก"
              min="0"
              step="0.01"
              @input="$emit('updateTypeBarcode', materialData, data.stockReceiptNumber)"
            />
            <input
              type="text"
              style="margin-left: 1px"
              v-model="materialData.weightUnit"
              class="form-control"
              :style="getBgColor(false, materialData.qtyUnit)"
              placeholder="หน่วย"
              min="0"
              @input="$emit('updateTypeBarcode', materialData, data.stockReceiptNumber)"
            />
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
    }
  },

  emits: ['addMaterial', 'removeMaterial', 'updateTypeBarcode']
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
</style>