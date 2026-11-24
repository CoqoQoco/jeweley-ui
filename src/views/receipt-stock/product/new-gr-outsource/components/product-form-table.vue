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
          @change="onProductNumberChange(data)"
        />
        <span v-if="data.topUpStockNumber" class="topup-badge">
          {{ $t('view.receiptStock.product.receiptLot.topUpBadge', { stockNumber: data.topUpStockNumber }) }}
        </span>
        <div v-if="data.suggestAuto && data.topUpStockNumber" class="topup-note">
          {{ $t('view.receiptStock.product.receiptLot.suggestAutoNote', { stockNumber: data.topUpStockNumber }) }}
        </div>
        <div v-else-if="showChooseNote(data)" class="topup-note">
          {{ $t('view.receiptStock.product.receiptLot.suggestChooseNote', { count: data.suggestLots.length }) }}
        </div>
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
          @update:modelValue="onProductionTypeChange(data, $event)"
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
              <LotTopupPicker
                class="mb-2"
                :location="slotProps.data.location || 'MAIN'"
                :isSilver="isSilverRow(slotProps.data)"
                :topUpStockNumber="slotProps.data.topUpStockNumber || ''"
                :suggestedLots="slotProps.data.suggestLots || []"
                :rowSize="slotProps.data.size || ''"
                :rowStud="slotProps.data.studEarring || ''"
                @select="(lot, meta) => onSelectLot(slotProps.data, lot, meta)"
              />

              <!-- Qty / Price / Size / Stud / Location / Remark -->
              <div class="form-col-container">
                <div>
                  <span class="title-text">จำนวน <span class="text-danger">*</span></span>
                  <input
                    class="form-control form-control-sm"
                    type="number"
                    step="1"
                    min="1"
                    v-model="slotProps.data.qty"
                    :style="getFieldBg(slotProps.data.qty)"
                  />
                  <small v-if="qtyWarning(slotProps.data)" class="text-danger">
                    {{ qtyWarning(slotProps.data) }}
                  </small>
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
                    @change="onSuggestInputChanged(slotProps.data)"
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
                    @update:modelValue="onStudChange(slotProps.data, $event)"
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
                    @change="onSuggestInputChanged(slotProps.data)"
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
import LotTopupPicker from '../../components/lot-topup-picker.vue'
import { isSilverMetal, normalizeProductNumber, resolveProductionType, validateReceiptQty } from '@/services/helper/receipt-lot/receipt-lot.js'
import lotSuggest, { isSuggestDismissed, markSuggestDismissed } from '../../components/lot-suggest-mixin.js'

export default {
  name: 'product-form-table',

  mixins: [lotSuggest],

  components: {
    BaseDataTable,
    DropdownGeneric,
    ProductImage,
    MaterialsSection,
    LotTopupPicker
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
    'editAllMaterials',
    'productNumberChange'
  ],

  methods: {
    onProductNumberChange(row) {
      this.onSuggestInputChanged(row)
      this.$emit('productNumberChange', row)
    },

    isSilverRow(row) {
      return isSilverMetal(resolveProductionType(row))
    },

    qtyWarning(row) {
      const error = validateReceiptQty({ isSilver: this.isSilverRow(row), qty: row.qty })
      if (error === 'goldQty') return this.$t('view.receiptStock.product.receiptLot.goldQtyWarn')
      if (error === 'silverQty') return this.$t('view.receiptStock.product.receiptLot.silverQtyWarn')
      return ''
    },

    suggestRows() {
      return this.form
    },

    suggestIsSilver(row) {
      return this.isSilverRow(row)
    },

    suggestApply(row, lot) {
      this.applyLot(row, lot)
    },

    // เลิกเติมอัตโนมัติเพราะรหัสสินค้าเปลี่ยน -- คืนชื่อ/ประเภทเดิม แต่ห้ามทับรหัสที่ผู้ใช้เพิ่งพิมพ์
    suggestRevert(row) {
      if (row.preTopUp) {
        const { productNumber, ...rest } = row.preTopUp // eslint-disable-line no-unused-vars
        Object.assign(row, rest)
      }
      row.topUpStockNumber = ''
      row.preTopUp = null
    },

    onStudChange(row, value) {
      row.studEarring = value
      this.onSuggestInputChanged(row)
    },

    onProductionTypeChange(row, value) {
      row.productionType = value
      this.onSuggestInputChanged(row)
    },

    showChooseNote(row) {
      return !row.topUpStockNumber && !isSuggestDismissed(row, normalizeProductNumber(row.productNumber)) && (row.suggestLots?.length || 0) > 0
    },

    onSelectLot(row, lot, meta) {
      row.suggestAuto = false
      if (!lot) {
        if (!meta?.system) markSuggestDismissed(row)
        if (row.topUpStockNumber && row.preTopUp) {
          Object.assign(row, row.preTopUp)
        }
        row.topUpStockNumber = ''
        row.preTopUp = null
        return
      }
      this.applyLot(row, lot)
    },

    applyLot(row, lot) {
      if (!row.topUpStockNumber) {
        row.preTopUp = {
          productNumber: row.productNumber,
          productNameTH: row.productNameTH,
          productNameEN: row.productNameEN,
          productType: row.productType
        }
      }
      row.topUpStockNumber = lot.stockNumber
      row.productNumber = lot.productNumber || row.productNumber
      row.productNameTH = lot.productNameTh || row.productNameTH
      row.productNameEN = lot.productNameEn || row.productNameEN
      row.productType = lot.productType || row.productType
    },

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

.topup-note {
  margin-top: var(--sp-xs);
  font-size: var(--fs-sm);
  line-height: var(--lh-sm);
  color: var(--base-font-color);
}

.topup-badge {
  display: inline-block;
  margin-top: var(--sp-xs);
  padding: 2px var(--sp-sm);
  border-radius: var(--radius-sm);
  background-color: var(--base-warning);
  color: var(--base-font-color);
  font-size: var(--fs-sm);
  font-weight: 700;
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
