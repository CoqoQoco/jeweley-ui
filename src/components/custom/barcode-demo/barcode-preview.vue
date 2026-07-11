<template>
  <barcodeDemo
    v-if="selectedType === 'original'"
    :type="type"
    :madeIn="barcode.madeIn"
    :madeInText="barcode.madeInText"
    :stockNumber="barcode.stockNumber"
    :mold="barcode.mold"
    :gold="barcode.gold"
    :gems="barcode.gems"
    :size="barcode.size"
    :goldType="barcode.goldType"
  />
  <barcodeVerticalDemo
    v-else
    :productNameEn="barcode.productNameEn"
    :productNumber="barcode.productNumber"
    :gold="barcode.gold"
    :size="barcode.size"
    :stockNumber="barcode.stockNumber"
    :goldType="barcode.goldType"
    :price="price"
    :gems="barcode.gems"
    :madeIn="barcode.madeIn"
    :madeInText="barcode.madeInText"
  />
</template>

<script>
import { defineAsyncComponent } from 'vue'

const barcodeDemo = defineAsyncComponent(() =>
  import('@/components/custom/barcode-demo/barcode-demo-view.vue')
)
const barcodeVerticalDemo = defineAsyncComponent(() =>
  import('@/components/custom/barcode-demo/barcode-vertical-demo-view.vue')
)

export default {
  name: 'BarcodePreview',

  components: {
    barcodeDemo,
    barcodeVerticalDemo
  },

  props: {
    selectedType: {
      type: String,
      default: 'original'
    },
    barcode: {
      type: Object,
      default: () => ({})
    },
    price: {
      type: Number,
      default: null
    },
    type: {
      type: String,
      default: 'gem'
    }
  }
}
</script>
