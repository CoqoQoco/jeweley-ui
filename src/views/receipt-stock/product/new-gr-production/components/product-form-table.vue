<template>
  <BaseDataTable
    :items="form"
    dataKey="stockReceiptNumber"
    :columns="columns"
    :paginator="false"
    :selectionMode="true"
    :itemsSelection="selectedItems"
    @update:itemsSelection="updateSelection"
    :disabledItems="itemsToDisable"
    :preSelectedItems="itemsToPreSelect"
    :expandable="true"
    :scrollHeight="scrollHeight"
    class="custom-form-table"
  >
    <!-- Auto index -->
    <template #noTemplate="{ index }">
      <div class="d-flex justify-content-center">
        <span>{{ index + 1 }}</span>
      </div>
    </template>

    <!-- Image -->
    <template #imageTemplate="{ data }">
      <div
        class="image-column-cell"
        :class="{ 'is-clickable': !data.isReceipt }"
        v-on="!data.isReceipt ? { click: (e) => onImageCellClick(e, data) } : {}"
      >
        <imagePreview
          v-if="data.imagePath"
          :imageName="data.imagePath"
          :path="data.imagePath"
          :type="type"
          :width="40"
          :height="40"
          :preview="false"
        />
        <div v-else class="image-column-placeholder">
          <i class="bi bi-image"></i>
          <span>{{ $t('view.receiptStock.product.grProduction.noImage') }}</span>
        </div>
      </div>
    </template>

    <!-- Product Number -->
    <template #productNumberTemplate="{ data }">
      <ProductNumberField
        :data="data"
        :getBgColor="getBgColor"
        :isRequiredField="isRequiredField"
      />
    </template>

    <!-- Mold Design -->
    <template #moldDesignTemplate="{ data }">
      <MoldDesignField
        :data="data"
        :getBgColor="getBgColor"
        :isRequiredField="isRequiredField"
      />
    </template>

    <!-- Product Name EN -->
    <template #productNameEnTemplate="{ data }">
      <ProductNameField
        :data="data"
        :language="'EN'"
        :getBgColor="getBgColor"
        :isRequiredField="isRequiredField"
        @search="onSearchProductName"
      />
    </template>

    <!-- Product Name TH -->
    <template #productNameThTemplate="{ data }">
      <ProductNameField
        :data="data"
        :language="'TH'"
        :getBgColor="getBgColor"
        :isRequiredField="isRequiredField"
        @search="onSearchProductName"
      />
    </template>

    <!-- Expansion slot -->
    <template #expansion="slotProps">
      <ProductExpansion
        :slotProps="slotProps"
        :formBarcode="formBarcode"
        :type="type"
        :masterStud="masterStud"
        :masterMaterialType="masterMaterialType"
        :masterGold="masterGold"
        :masterDiamondGrade="masterDiamondGrade"
        :masterGem="masterGem"
        :scrollHeight="scrollHeight"
        :materialColumns="materialColumns"
        :requiredStud="requiredStud"
        :getBgColor="getBgColor"
        :isRequiredField="isRequiredField"
        :breakdownData="data.breakDown || []"
        :locationOptions="locationOptions"
        @selectImage="onSelectImage"
        @addMaterial="addMaterialItem"
        @removeMaterial="removeMaterialItem"
        @updateTypeBarcode="updateTypeBarcode"
        @loadFromBreakdown="onLoadFromBreakdown"
        @editAllMaterials="onEditAllMaterials"
      />
    </template>

    <!-- Footer -->
    <template #footer>
      <TableFooter
        :selectedItemsLength="checkItemSelectedLength()"
        :isOnDraft="isOnDraft"
        @fetchDraft="fetchDraft"
        @submit="$emit('submit')"
        @adjustBreakdown="$emit('adjustBreakdown')"
        @selectImageBulk="$emit('selectImageBulk')"
      />
    </template>
  </BaseDataTable>
</template>

<script>
import { defineAsyncComponent } from 'vue'

import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import ProductNumberField from './fields/product-number-field.vue'
import MoldDesignField from './fields/mold-design-field.vue'
import ProductNameField from './fields/product-name-field.vue'
import ProductExpansion from './product-expansion.vue'
import TableFooter from './table-footer.vue'

const imagePreview = defineAsyncComponent(() => import('@/components/prime-vue/ImagePreview.vue'))

export default {
  name: 'ProductFormTable',

  components: {
    BaseDataTable,
    imagePreview,
    ProductNumberField,
    MoldDesignField,
    ProductNameField,
    ProductExpansion,
    TableFooter
  },

  props: {
    form: {
      type: Array,
      required: true
    },
    selectedItems: {
      type: Array,
      required: true
    },
    itemsToDisable: {
      type: Array,
      default: () => []
    },
    itemsToPreSelect: {
      type: Array,
      default: () => []
    },
    scrollHeight: {
      type: String,
      default: ''
    },
    columns: {
      type: Array,
      required: true
    },
    materialColumns: {
      type: Array,
      required: true
    },
    formBarcode: {
      type: Object,
      required: true
    },
    type: {
      type: String,
      default: 'STOCK-PRODUCT'
    },
    masterStud: {
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
    },
    requiredStud: {
      type: Boolean,
      default: false
    },
    isOnDraft: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      default: () => ({})
    },
    locationOptions: {
      type: Array,
      default: () => []
    }
  },

  emits: [
    'update:selectedItems',
    'searchProductName',
    'selectImage',
    'selectImageBulk',
    'addMaterial',
    'removeMaterial',
    'updateTypeBarcode',
    'loadFromBreakdown',
    'editAllMaterials',
    'fetchDraft',
    'submit',
    'adjustBreakdown'
  ],

  methods: {
    updateSelection(newSelection) {
      this.$emit('update:selectedItems', newSelection)
    },

    getBgColor(isReceipt, data) {
      if (isReceipt) {
        return 'background-color: #e0e0e0'
      } else if (data) {
        return 'background-color: #b5dad4'
      } else {
        return 'background-color: #dad4b5'
      }
    },

    isRequiredField(data, size = false) {
      if (size) {
        return (
          !data.isReceipt &&
          this.selectedItems.some(
            (selected) => selected.stockReceiptNumber === data.stockReceiptNumber
          ) &&
          ['G', 'B', 'R', 'N'].includes(this.data?.productType)
        )
      } else {
        return (
          !data.isReceipt &&
          this.selectedItems.some(
            (selected) => selected.stockReceiptNumber === data.stockReceiptNumber
          )
        )
      }
    },

    checkItemSelectedLength() {
      return this.selectedItems.length > 0 ? this.selectedItems.length : 0
    },

    onSearchProductName(data, type) {
      this.$emit('searchProductName', data, type)
    },

    onSelectImage(data) {
      this.$emit('selectImage', data)
    },

    onImageCellClick(event, data) {
      event.stopPropagation()
      this.$emit('selectImage', data)
    },

    addMaterialItem(data) {
      this.$emit('addMaterial', data)
    },

    removeMaterialItem(data, item, index) {
      this.$emit('removeMaterial', data, item, index)
    },

    updateTypeBarcode(item, index) {
      console.log('product-form-table updateTypeBarcode:', item, index)
      this.$emit('updateTypeBarcode', item, index)
    },

    onLoadFromBreakdown(stockReceiptNumber) {
      this.$emit('loadFromBreakdown', stockReceiptNumber)
    },

    onEditAllMaterials() {
      this.$emit('editAllMaterials')
    },

    fetchDraft() {
      this.$emit('fetchDraft')
    }
  }
}
</script>

<style lang="scss" scoped>
.custom-form-table {
  :deep(.p-datatable) {
    .p-datatable-tbody {
      > tr {
        // row ที่ถูก preselect
        &[data-p-selectable='false'] {
          background-color: #ffe2a3 !important;

          > td {
            background-color: #ffe2a3 !important;
          }
        }

        // row ที่ถูกเลือกปกติ
        &[data-p-highlight='true']:not([data-p-selectable='false']) {
          background-color: var(--base-warning) !important;

          > td {
            background-color: #e0e0e0 !important;
            color: var(--base-font-color);
          }
        }

        // expansion row ของ row ที่ถูกเลือกปกติ
        &[data-p-highlight='true']:not([data-p-selectable='false']) + .p-datatable-row-expansion {
          > td {
            background-color: #e0e0e0 !important;
          }
        }
      }
    }
  }
}

.image-column-cell {
  display: flex;
  align-items: center;
  justify-content: center;

  &.is-clickable {
    cursor: pointer;
  }
}

.image-column-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--sp-xs);
  color: var(--base-sub-color);

  i {
    font-size: var(--fs-lg);
  }

  span {
    font-size: var(--fs-sm);
    line-height: var(--lh-sm);
  }
}
</style>