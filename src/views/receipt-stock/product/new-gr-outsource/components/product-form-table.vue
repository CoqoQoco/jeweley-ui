<template>
  <div class="section-card mt-3">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h6 class="mb-0">รายการสินค้า</h6>
      <button type="button" class="btn btn-sm btn-main" @click="$emit('addRow')">
        <i class="bi bi-plus"></i> เพิ่มแถว
      </button>
    </div>

    <BaseDataTable
      :items="form"
      dataKey="dataKey"
      :columns="columns"
      :paginator="false"
      :expandable="true"
      scrollHeight="calc(100vh - 420px)"
      class="outsource-form-table"
    >
      <!-- Auto index -->
      <template #noTemplate="{ index }">
        <div class="d-flex justify-content-center">
          <span>{{ index + 1 }}</span>
        </div>
      </template>

      <!-- Product Number -->
      <template #productNumberTemplate="{ data }">
        <input
          class="form-control form-control-sm"
          type="text"
          v-model.trim="data.productNumber"
          placeholder="รหัสสินค้า"
          :style="getFieldBg(data.productNumber)"
        />
      </template>

      <!-- Product Name EN -->
      <template #productNameENTemplate="{ data }">
        <div class="d-flex">
          <input
            class="form-control form-control-sm"
            type="text"
            v-model.trim="data.productNameEN"
            placeholder="ชื่อสินค้า EN"
            :style="getFieldBg(data.productNameEN)"
          />
          <button
            type="button"
            class="btn btn-sm btn-outline-secondary ml-1"
            title="ค้นหาชื่อสินค้า EN"
            @click="$emit('searchProductName', data, 'EN')"
          >
            <i class="bi bi-search"></i>
          </button>
        </div>
      </template>

      <!-- Product Name TH -->
      <template #productNameTHTemplate="{ data }">
        <div class="d-flex">
          <input
            class="form-control form-control-sm"
            type="text"
            v-model.trim="data.productNameTH"
            placeholder="ชื่อสินค้า TH"
            :style="getFieldBg(data.productNameTH)"
          />
          <button
            type="button"
            class="btn btn-sm btn-outline-secondary ml-1"
            title="ค้นหาชื่อสินค้า TH"
            @click="$emit('searchProductName', data, 'TH')"
          >
            <i class="bi bi-search"></i>
          </button>
        </div>
      </template>

      <!-- Product Type -->
      <template #productTypeTemplate="{ data }">
        <DropdownGeneric
          :modelValue="data.productType"
          :options="masterProductType"
          optionLabel="description"
          optionValue="code"
          placeholder="ประเภท"
          :showClear="true"
          @update:modelValue="data.productType = $event"
        />
      </template>

      <!-- Production Type (gold color) -->
      <template #productionTypeTemplate="{ data }">
        <DropdownGeneric
          :modelValue="data.productionType"
          :options="masterGold"
          optionLabel="description"
          optionValue="code"
          placeholder="สีทอง"
          :showClear="true"
          @update:modelValue="data.productionType = $event"
        />
      </template>

      <!-- Production Type Size (gold size) -->
      <template #productionTypeSizeTemplate="{ data }">
        <DropdownGeneric
          :modelValue="data.productionTypeSize"
          :options="masterGoldSize"
          optionLabel="description"
          optionValue="code"
          placeholder="ขนาดทอง"
          :showClear="true"
          @update:modelValue="data.productionTypeSize = $event"
        />
      </template>

      <!-- Mold Design -->
      <template #moldDesignTemplate="{ data }">
        <input
          class="form-control form-control-sm"
          type="text"
          v-model.trim="data.moldDesign"
          placeholder="แม่พิมพ์"
        />
      </template>

      <!-- Delete -->
      <template #actionTemplate="{ data }">
        <button
          type="button"
          class="btn btn-sm btn-red"
          title="ลบแถว"
          @click="$emit('removeRow', data.dataKey)"
        >
          <i class="bi bi-trash"></i>
        </button>
      </template>

      <!-- Expansion -->
      <template #expansion="slotProps">
        <div class="p-2">
          <div class="form-col-fix-2-container">
            <div class="filter-container-bg-focus p-2">
              <!-- Qty / Price / Size / Stud / Location / Remark -->
              <div class="form-col-container">
                <div>
                  <span class="title-text">จำนวน <span class="text-danger">*</span></span>
                  <input
                    class="form-control form-control-sm"
                    type="number"
                    step="any"
                    min="0"
                    v-model="slotProps.data.qty"
                    :style="getFieldBg(slotProps.data.qty)"
                  />
                </div>
                <div>
                  <span class="title-text">ราคาขาย <span class="text-danger">*</span></span>
                  <input
                    class="form-control form-control-sm"
                    type="number"
                    step="any"
                    min="0"
                    v-model="slotProps.data.price"
                    :style="getFieldBg(slotProps.data.price)"
                  />
                </div>
              </div>

              <div class="form-col-container mt-2">
                <div>
                  <span class="title-text">ขนาด</span>
                  <input
                    class="form-control form-control-sm"
                    type="text"
                    v-model="slotProps.data.size"
                  />
                </div>
                <div>
                  <span class="title-text">แป้นต่างหู</span>
                  <DropdownGeneric
                    :modelValue="slotProps.data.studEarring"
                    :options="masterStud"
                    optionLabel="description"
                    optionValue="value"
                    placeholder="เลือกแป้นต่างหู"
                    :showClear="true"
                    :disabled="slotProps.data.productType !== 'ES'"
                    @update:modelValue="slotProps.data.studEarring = $event"
                  />
                </div>
              </div>

              <div class="form-col-container mt-2">
                <div>
                  <span class="title-text">คลังจัดเก็บ</span>
                  <input
                    class="form-control form-control-sm"
                    type="text"
                    v-model="slotProps.data.location"
                    placeholder="MAIN"
                  />
                </div>
              </div>

              <div class="form-col-container mt-2">
                <div>
                  <span class="title-text">หมายเหตุ</span>
                  <textarea
                    class="form-control form-control-sm"
                    rows="2"
                    v-model="slotProps.data.remark"
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- Product image -->
            <ProductImage
              :data="slotProps.data"
              type="STOCK-PRODUCT"
              @selectImage="$emit('selectImage', $event)"
            />
          </div>

          <!-- Materials section -->
          <div class="mt-2">
            <MaterialsSection
              :data="slotProps.data"
              :masterMaterialType="masterMaterialType"
              :masterGold="masterGold"
              :masterDiamondGrade="masterDiamondGrade"
              :masterGem="masterGem"
              :materialColumns="materialColumns"
              scrollHeight="300px"
              :getBgColor="() => ''"
              :breakdownData="[]"
              @addMaterial="$emit('addMaterial', $event)"
              @removeMaterial="
                (materialData, data, index) => $emit('removeMaterial', materialData, data, index)
              "
              @updateTypeBarcode="
                (materialData, key) => $emit('updateTypeBarcode', materialData, key)
              "
              @loadFromBreakdown="() => {}"
              @editAllMaterials="$emit('editAllMaterials')"
            />
          </div>
        </div>
      </template>

      <!-- Footer -->
      <template #footer>
        <div class="table-footer">
          <div class="d-flex justify-content-between align-items-center">
            <span class="title-text">รายการทั้งหมด: {{ form.length }} แถว</span>
            <button
              :class="['btn btn-sm', form.length === 0 ? 'btn-secondary' : 'btn-main']"
              type="submit"
              :disabled="form.length === 0"
            >
              <i class="bi bi-upload"></i>
              <span class="ml-2">บันทึกสินค้า</span>
            </button>
          </div>
        </div>
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import ProductImage from '../../new-gr-production/components/expansion/product-image.vue'
import MaterialsSection from '../../new-gr-production/components/expansion/materials-section.vue'

export default {
  name: 'product-form-table',

  components: {
    BaseDataTable,
    DropdownGeneric,
    ProductImage,
    MaterialsSection
  },

  props: {
    form: {
      type: Array,
      required: true
    },
    columns: {
      type: Array,
      required: true
    },
    materialColumns: {
      type: Array,
      required: true
    },
    masterProductType: {
      type: Array,
      default: () => []
    },
    masterGold: {
      type: Array,
      default: () => []
    },
    masterGoldSize: {
      type: Array,
      default: () => []
    },
    masterMaterialType: {
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
    },
    masterStud: {
      type: Array,
      default: () => []
    }
  },

  emits: [
    'addRow',
    'removeRow',
    'searchProductName',
    'selectImage',
    'addMaterial',
    'removeMaterial',
    'updateTypeBarcode',
    'editAllMaterials'
  ],

  methods: {
    getFieldBg(value) {
      if (value === null || value === undefined || value === '') {
        return 'background-color: #dad4b5'
      }
      return 'background-color: #b5dad4'
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';

.section-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: rgba(0, 0, 0, 0.06) 0 2px 8px;
  padding: 20px;
  background: #ffffff !important;

  h6 {
    color: var(--base-font-color);
    font-weight: 600;
    padding-bottom: 8px;
    border-bottom: 1px solid #f0f0f0;
    background: transparent !important;
  }
}

.table-footer {
  border-top: 1px solid #e0e0e0;
  padding-top: 12px;
  margin-top: 4px;
}

.form-col-fix-2-container {
  display: grid;
  padding: 0;
  grid-template-columns: 4fr 2fr;
  gap: 12px;
}

.outsource-form-table {
  :deep(.p-datatable) {
    .p-datatable-tbody {
      > tr {
        &[data-p-highlight='true'] {
          background-color: var(--base-warning) !important;
          > td {
            background-color: #e0e0e0 !important;
            color: var(--base-font-color);
          }
        }
      }
    }
  }
}
</style>
