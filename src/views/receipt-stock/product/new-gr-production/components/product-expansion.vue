<template>
  <div class="p-2">
    <!-- Stock already receipt -->
    <div v-if="slotProps.data.isReceipt">
      <ReceiptedStock :slotProps="slotProps" :formBarcode="formBarcode" :type="type" />
    </div>

    <!-- Stock on receipt -->
    <div v-else>
      <div class="form-col-fix-2-container">
        <!-- Detail form -->
        <StockDetails
          :slotProps="slotProps"
          :masterStud="masterStud"
          :requiredStud="requiredStud"
          :getBgColor="getBgColor"
          :isRequiredField="isRequiredField"
          @selectImage="$emit('selectImage', $event)"
        />

        <!-- Product image -->
        <ProductImage
          :data="slotProps.data"
          :type="type"
          @selectImage="$emit('selectImage', $event)"
        />
      </div>

      <!-- Materials section -->
      <div class="form-col-limit-width-container">
        <MaterialsSection
          :data="slotProps.data"
          :masterMaterialType="masterMaterialType"
          :masterGold="masterGold"
          :masterDiamondGrade="masterDiamondGrade"
          :masterGem="masterGem"
          :materialColumns="materialColumns"
          :scrollHeight="scrollHeight"
          :getBgColor="getBgColor"
          :breakdownData="breakdownData"
          @addMaterial="$emit('addMaterial', $event)"
          @removeMaterial="
            (materialData, data, index) => $emit('removeMaterial', materialData, data, index)
          "
          @updateTypeBarcode="
            (materialData, stockReceiptNumber) =>
              $emit('updateTypeBarcode', materialData, stockReceiptNumber)
          "
          @loadFromBreakdown="() => $emit('loadFromBreakdown', slotProps.data.stockReceiptNumber)"
          @editAllMaterials="$emit('editAllMaterials')"
        />
      </div>

      <!-- Barcode preview -->
      <div class="form-col-container mt-2">
        <div class="filter-container-bg-focus">
          <barcodePreview selectedType="original" :type="formBarcode.type" :barcode="barcodeModel" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ReceiptedStock from './expansion/receipted-stock.vue'
import StockDetails from './expansion/stock-details.vue'
import ProductImage from './expansion/product-image.vue'
import MaterialsSection from './expansion/materials-section.vue'
import barcodePreview from '@/components/custom/barcode-demo/barcode-preview.vue'

export default {
  name: 'ProductExpansion',

  components: {
    ReceiptedStock,
    StockDetails,
    ProductImage,
    MaterialsSection,
    barcodePreview
  },

  props: {
    slotProps: {
      type: Object,
      required: true
    },
    formBarcode: {
      type: Object,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    masterStud: {
      type: Array,
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
    requiredStud: {
      type: Boolean,
      required: true
    },
    getBgColor: {
      type: Function,
      required: true
    },
    isRequiredField: {
      type: Function,
      required: true
    },
    breakdownData: {
      type: Array,
      default: () => []
    }
  },

  emits: [
    'selectImage',
    'addMaterial',
    'removeMaterial',
    'updateTypeBarcode',
    'loadFromBreakdown',
    'editAllMaterials'
  ],

  computed: {
    barcodeModel() {
      return {
        madeIn: this.formBarcode.madeIn,
        madeInText: this.formBarcode.madeInText,
        stockNumber: this.slotProps.stockNumber,
        mold: this.slotProps.data.moldDesign ?? this.formBarcode.mold,
        gold: this.slotProps.data.barcodeGold,
        gems: this.slotProps.data.barcodeGems,
        size: this.slotProps.data.size,
        goldType: this.formBarcode.goldType
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.form-col-fix-2-container {
  display: grid;
  padding: 0px;
  grid-template-columns: 4fr 2fr;
}
//scss for div fit width of display
.form-col-limit-width-container {
  display: flex;
  padding: 0px;
  grid-template-columns: 1fr;
  overflow: hidden;

}
</style>
