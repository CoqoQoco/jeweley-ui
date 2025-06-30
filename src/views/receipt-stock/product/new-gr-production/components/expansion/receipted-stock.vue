<template>
  <div class="form-col-fix-2-container">
    <div class="form-col-container">
      <div class="filter-container-bg-focus">
        <barcodeDemo
          :madeIn="formBarcode.madeIn"
          :madeInText="formBarcode.madeInText"
          :stockNumber="slotProps.stockNumber"
          :mold="slotProps.data.moldDesign ?? formBarcode.mold"
          :gold="slotProps.data.barcodeGold"
          :gems="slotProps.data.barcodeGems"
          :size="slotProps.data.size"
          :goldType="formBarcode.goldType"
          :type="formBarcode.type"
          class="mt-4"
        />
      </div>
    </div>
    
    <!-- Product image -->
    <div class="form-col-container">
      <div class="filter-container-img">
        <div class="image-preview">
          <imagePreview
            v-if="slotProps.data.imagePath"
            :imageName="slotProps.data.imagePath"
            :path="slotProps.data.imagePath"
            :type="type"
            :width="150"
            :height="150"
            :preview="true"
            class="image-body"
          />
          <img
            v-else
            src="@/assets/no-image.png"
            :width="150"
            :height="150"
            alt="Image"
            class="image-body"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import barcodeDemo from '@/components/custom/barcode-demo/barcode-demo-view.vue'

const imagePreview = defineAsyncComponent(() => import('@/components/prime-vue/ImagePreview.vue'))

export default {
  name: 'ReceiptedStock',

  components: {
    barcodeDemo,
    imagePreview
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

.filter-container-img {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  border: 2px dashed #dddddd;
  border-radius: 8px;
  background-color: #f8f9fa;
  transition: all 0.3s ease;

  &:hover {
    border-color: #adb5bd;
  }

  .image-preview {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: white;
    border-radius: 4px;
  }
}

.image-body {
  border: 1px solid var(--base-color);
}
</style>