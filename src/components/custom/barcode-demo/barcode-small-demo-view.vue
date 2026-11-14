<template>
  <div class="small-preview">
    <div class="small-label" :style="labelStyle">
      <!-- หางป้าย: MADE IN THAILAND (pill เหมือนตัวอย่างป้ายเดิม) -->
      <div class="tail-shape" :style="tailStyle">
        <span :style="madeInStyle">{{ madeIn }}</span>
      </div>
      <!-- หัวป้าย -->
      <div class="head-shape" :style="headStyle"></div>

      <!-- หน้าป้าย: บรรทัด 1-2 + บาร์โค้ด -->
      <div class="text-line" :style="lineStyle(layout.line1Font, 8)">{{ layout.line1 }}</div>
      <div v-if="layout.line2" class="text-line" :style="lineStyle(layout.line2Font, 38)">{{ layout.line2 }}</div>
      <div class="barcode-strip" :style="barcodeStyle">
        <svg ref="barcodeElement" class="barcode-svg" preserveAspectRatio="none"></svg>
      </div>

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
const LABEL_WIDTH = 640
const LABEL_HEIGHT = 112
const TAIL_HEIGHT = 34 // สัดส่วนเดียวกับป้ายเดิม (หาง 30 : หัว 100)
const SHAPE_RADIUS = 17
const MADE_IN_FONT = [17, 17]
const MADE_IN_DEFAULT = 'MADE IN THAILAND'
const BARCODE_Y = 70
const BARCODE_HEIGHT = 32
const GEM_TOP = 8
const MAX_SCALE = 1.2 // ขยายสูงสุด (px ต่อ dot) — ย่อตามความกว้างกล่องจริงเพื่อไม่ให้ล้น

export default {
  name: 'BarcodeSmallDemo',

  props: {
    // ค่าชุดเดียวกับที่ส่งเข้า generateGt800ZPLSmall (mold, stockNumber, gems, goldWeight, hidePrice, hideMold, gemLabelMeta ฯลฯ)
    formValue: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    return { scale: MAX_SCALE, resizeObserver: null }
  },

  computed: {
    madeIn() {
      return this.formValue?.madeIn || MADE_IN_DEFAULT
    },

    layout() {
      return layoutGt800Small(this.formValue)
    },

    labelStyle() {
      return { width: `${LABEL_WIDTH * this.scale}px`, height: `${LABEL_HEIGHT * this.scale}px` }
    },

    foldStyle() {
      return { left: `${this.layout.foldX * this.scale}px` }
    },

    tailStyle() {
      return {
        width: `${this.layout.headX * this.scale}px`,
        height: `${TAIL_HEIGHT * this.scale}px`,
        top: `${((LABEL_HEIGHT - TAIL_HEIGHT) / 2) * this.scale}px`,
        borderRadius: `${SHAPE_RADIUS * this.scale}px 0 0 ${SHAPE_RADIUS * this.scale}px`
      }
    },

    headStyle() {
      return {
        left: `${this.layout.headX * this.scale}px`,
        width: `${(LABEL_WIDTH - this.layout.headX) * this.scale}px`,
        borderRadius: `${SHAPE_RADIUS * this.scale}px`
      }
    },

    madeInStyle() {
      return { fontSize: `${MADE_IN_FONT[0] * this.scale}px`, lineHeight: 1 }
    },

    barcodeStyle() {
      const width = Math.max(0, this.layout.barcodeEnd - this.layout.frontX)
      return {
        left: `${this.layout.frontX * this.scale}px`,
        top: `${BARCODE_Y * this.scale}px`,
        width: `${width * this.scale}px`,
        height: `${BARCODE_HEIGHT * this.scale}px`
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
    this.updateScale()
    this.generateBarcode()
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(this.updateScale)
      this.resizeObserver.observe(this.$el)
    }
  },

  beforeUnmount() {
    this.resizeObserver?.disconnect()
  },

  methods: {
    updateScale() {
      const style = getComputedStyle(this.$el)
      const inner = this.$el.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)
      if (inner > 0) this.scale = Math.min(MAX_SCALE, inner / LABEL_WIDTH)
    },

    // font = [สูง, กว้าง] เหมือน ^A0N — กว้างต่างจากสูงให้บีบด้วย scaleX
    lineStyle([height, width], top) {
      return {
        left: `${this.layout.frontX * this.scale}px`,
        top: `${top * this.scale}px`,
        fontSize: `${height * this.scale}px`,
        lineHeight: 1,
        transform: `scaleX(${Math.min(1, width / height)})`
      }
    },

    gemStyle(index) {
      const [height, width] = this.layout.gemFont
      return {
        left: `${this.layout.gemX * this.scale}px`,
        top: `${(GEM_TOP + index * this.layout.gemLineHeight) * this.scale}px`,
        fontSize: `${height * this.scale}px`,
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
  justify-content: safe center;
  width: 600px;
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
  overflow-x: auto;
}

.small-label {
  position: relative;
  flex: none;
  font-weight: bold;
}

.tail-shape {
  position: absolute;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffff;
  white-space: nowrap;
}

.head-shape {
  position: absolute;
  top: 0;
  bottom: 0;
  background-color: #ffff;
}

.text-line {
  position: absolute;
  white-space: nowrap;
  transform-origin: left top;
}

.barcode-strip {
  position: absolute;
}

.barcode-svg {
  display: block;
  width: 100%;
  height: 100%;
}

.fold-line {
  position: absolute;
  top: var(--sp-sm);
  bottom: var(--sp-sm);
  width: 0;
  border-right: 1px dashed var(--base-font-color);
  opacity: 0.3;
}
</style>
