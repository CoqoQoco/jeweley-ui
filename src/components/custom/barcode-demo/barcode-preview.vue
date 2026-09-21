<template>
  <barcodeDemo
    v-if="selectedType === 'original'"
    :type="type"
    :madeIn="barcode.madeIn"
    :stockNumber="labelCode"
    :gold="barcode.gold"
    :gems="barcode.gems"
    :size="barcode.size"
    :goldType="barcode.goldType"
    :salePrice="barcode.salePrice"
    :profile="profile"
  />
  <barcodeVerticalDemo
    v-else
    :productNameEn="barcode.productNameEn"
    :productNumber="barcode.productNumber"
    :gold="barcode.gold"
    :size="barcode.size"
    :stockNumber="labelCode"
    :goldType="barcode.goldType"
    :price="price"
    :gems="barcode.gems"
    :madeIn="barcode.madeIn"
    :profile="profile"
  />
</template>

<script>
import { defineAsyncComponent } from 'vue'

import { resolveLabelCode } from '@/services/helper/barcode/barcode-zpl.js'
import { getBarcodeProfile } from '@/services/api/barcode-printer-config.js'

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
  },

  computed: {
    // ตัวอย่างต้องแสดงเลขเดียวกับที่จะพิมพ์จริง (เลขที่ผลิตเก่าก่อน ไม่งั้นเลขใหม่)
    labelCode() {
      return resolveLabelCode(this.barcode)
    },

    // ตัวอย่างต้องตรงกับ profile เครื่องพิมพ์ที่ตั้งไว้ (legacy/gt800) ให้ตรงกับที่จะพิมพ์จริง
    profile() {
      return getBarcodeProfile()
    }
  }
}
</script>
