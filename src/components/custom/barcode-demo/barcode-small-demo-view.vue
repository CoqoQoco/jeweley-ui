<template>
  <div class="small-preview">
    <div class="small-label" :style="labelStyle">
      <!-- หน้าป้าย: บรรทัด 1-2 + บาร์โค้ด -->
      <div class="text-line" :style="lineStyle(layout.line1Font, 8)">{{ layout.line1 }}</div>
      <div v-if="layout.line2" class="text-line" :style="lineStyle(layout.line2Font, 38)">{{ layout.line2 }}</div>
      <svg
        ref="barcodeElement"
        class="barcode-strip"
        preserveAspectRatio="none"
        :style="barcodeStyle"
      ></svg>

      <!-- แนวพับครึ่ง -->
      <div class="fold-line" :style="foldStyle"></div>

      <!-- หลังป้าย: แถวพลอย -->
      <div
        v-for="(row, index) in layout.gemRows"
        :key="index"
        class="text-line"
        :style="gemStyle(index)"
      >
        {{ row }}
      </div>
    </div>
  </div>
</template>

<script>
import JsBarcode from 'jsbarcode'

import { layoutGt800Small } from '@/services/helper/barcode/barcode-zpl.js'

// ขนาดป้ายใน ZPL (dots) และตำแหน่งที่ต้องตรงกับ barcode-zpl.js
const LABEL_WIDTH = 400
const LABEL_HEIGHT = 112
const FOLD_X = 200
const FRONT_X = 10
const BARCODE_Y = 70
const BARCODE_HEIGHT = 32
const GEM_TOP = 8
const SCALE = 2 // ขยายให้เห็นชัด

export default {
  name: 'BarcodeSmallDemo',

  props: {
    // ค่าชุดเดียวกับที่ส่งเข้า generateGt800ZPLSmall (mold, stockNumber, gems, goldWeight, hidePrice, hideMold, gemLabelMeta ฯลฯ)
    formValue: {
      type: Object,
      default: () => ({})
    }
  },

  computed: {
    layout() {
      return layoutGt800Small(this.formValue)
    },

    labelStyle() {
      return { width: `${LABEL_WIDTH * SCALE}px`, height: `${LABEL_HEIGHT * SCALE}px` }
    },

    foldStyle() {
      return { left: `${FOLD_X * SCALE}px` }
    },

    barcodeStyle() {
      const width = Math.max(0, this.layout.barcodeEnd - FRONT_X)
      return {
        left: `${FRONT_X * SCALE}px`,
        top: `${BARCODE_Y * SCALE}px`,
        width: `${width * SCALE}px`,
        height: `${BARCODE_HEIGHT * SCALE}px`
      }
    }
  },

  watch: {
    'layout.code': {
      handler() {
        this.$nextTick(this.generateBarcode)
      }
    }
  },

  mounted() {
    this.generateBarcode()
  },

  methods: {
    // font = [สูง, กว้าง] เหมือน ^A0N — กว้างต่างจากสูงให้บีบด้วย scaleX
    lineStyle([height, width], top) {
      return {
        left: `${FRONT_X * SCALE}px`,
        top: `${top * SCALE}px`,
        fontSize: `${height * SCALE}px`,
        lineHeight: 1,
        transform: `scaleX(${Math.min(1, width / height)})`
      }
    },

    gemStyle(index) {
      const [height, width] = this.layout.gemFont
      return {
        left: `${this.layout.gemX * SCALE}px`,
        top: `${(GEM_TOP + index * this.layout.gemLineHeight) * SCALE}px`,
        fontSize: `${height * SCALE}px`,
        lineHeight: 1,
        transform: `scaleX(${Math.min(1, width / height)})`
      }
    },

    generateBarcode() {
      const code = this.layout.code
      if (!this.$refs.barcodeElement || !code) return
      JsBarcode(this.$refs.barcodeElement, code, {
        format: 'CODE128',
        width: 1,
        height: BARCODE_HEIGHT,
        displayValue: false,
        margin: 0,
        background: '#ffffff'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.small-preview {
  display: flex;
  justify-content: center;
  padding: var(--sp-md);
  overflow-x: auto;
}

.small-label {
  position: relative;
  flex: none;
  background: #ffffff;
  border: 1px solid var(--base-font-color);
  border-radius: var(--radius-sm);
  overflow: hidden;
  color: var(--base-font-color);
  font-weight: bold;
}

.text-line {
  position: absolute;
  white-space: nowrap;
  transform-origin: left top;
}

.barcode-strip {
  position: absolute;
}

.fold-line {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 0;
  border-right: 1px dashed var(--base-font-color);
  opacity: 0.5;
}
</style>
