<template>
  <div class="print-model-preview">
    <div class="preview-grid-layout" :class="{ 'has-ruler': showGrid }">
      <div v-if="showGrid" class="ruler-corner"></div>

      <div v-if="showGrid" class="ruler-top" :style="{ width: sheetWidthPx + 'px' }">
        <span
          v-for="n in rulerMarksWide"
          :key="'rt-' + n"
          class="ruler-mark ruler-mark-top"
          :style="{ left: (n * pxPerInch) + 'px' }"
        >{{ n }}</span>
      </div>

      <div v-if="showGrid" class="ruler-left" :style="{ height: sheetHeightPx + 'px' }">
        <span
          v-for="n in rulerMarksTall"
          :key="'rl-' + n"
          class="ruler-mark ruler-mark-left"
          :style="{ top: (n * pxPerInch) + 'px' }"
        >{{ n }}</span>
      </div>

      <div class="print-sheet" :style="sheetStyle">
        <div v-if="showGrid" class="grid-overlay">
          <div
            v-for="n in gridLinesV"
            :key="'gv-' + n"
            class="grid-line grid-line-v"
            :style="{ left: (n * gridStepPx) + 'px' }"
          ></div>
          <div
            v-for="n in gridLinesH"
            :key="'gh-' + n"
            class="grid-line grid-line-h"
            :style="{ top: (n * gridStepPx) + 'px' }"
          ></div>
        </div>

        <span
          v-for="(p, idx) in primitives"
          :key="idx"
          class="print-primitive"
          :style="primitiveStyle(p)"
        >{{ p.text }}</span>
      </div>
    </div>
  </div>
</template>

<script>
const BASE_PX_PER_INCH = 96
const GRID_STEP_INCH = 0.5

export default {
  name: 'PrintModelPreview',

  props: {
    model: {
      type: Object,
      default: () => null
    },
    pageIndex: {
      type: Number,
      default: 0
    },
    zoom: {
      type: Number,
      default: 1
    },
    showGrid: {
      type: Boolean,
      default: true
    }
  },

  computed: {
    pxPerInch() {
      return BASE_PX_PER_INCH * (this.zoom || 1)
    },

    paperWidthIn() {
      return (this.model?.paper?.widthHundredthInch || 900) / 100
    },

    paperHeightIn() {
      return (this.model?.paper?.heightHundredthInch || 1100) / 100
    },

    sheetWidthPx() {
      return this.paperWidthIn * this.pxPerInch
    },

    sheetHeightPx() {
      return this.paperHeightIn * this.pxPerInch
    },

    sheetStyle() {
      return {
        width: this.sheetWidthPx + 'px',
        height: this.sheetHeightPx + 'px'
      }
    },

    primitives() {
      return this.model?.pages?.[this.pageIndex] || []
    },

    gridStepPx() {
      return GRID_STEP_INCH * this.pxPerInch
    },

    gridLinesV() {
      const count = Math.floor(this.paperWidthIn / GRID_STEP_INCH)
      return Array.from({ length: count }, (_, i) => i + 1)
    },

    gridLinesH() {
      const count = Math.floor(this.paperHeightIn / GRID_STEP_INCH)
      return Array.from({ length: count }, (_, i) => i + 1)
    },

    rulerMarksWide() {
      const count = Math.floor(this.paperWidthIn)
      return Array.from({ length: count + 1 }, (_, i) => i)
    },

    rulerMarksTall() {
      const count = Math.floor(this.paperHeightIn)
      return Array.from({ length: count + 1 }, (_, i) => i)
    }
  },

  methods: {
    primitiveStyle(p) {
      const fontSize = Number(p.fontSize) || 10
      const fontSizePx = (fontSize / 72) * this.pxPerInch
      const lineHeightPx = (fontSize / 72) * 1.5 * this.pxPerInch

      const style = {
        left: (Number(p.x) || 0) * this.pxPerInch + 'px',
        top: (Number(p.y) || 0) * this.pxPerInch + 'px',
        fontSize: fontSizePx + 'px',
        lineHeight: lineHeightPx + 'px',
        fontWeight: p.bold ? '700' : '400'
      }

      if (p.align === 'right') {
        style.width = (Number(p.width) || 0.9) * this.pxPerInch + 'px'
        style.textAlign = 'right'
      } else {
        style.whiteSpace = 'nowrap'
      }

      return style
    }
  }
}
</script>

<style lang="scss" scoped>
@font-face {
  font-family: 'THSarabunNewPreview';
  src: url('@/assets/fonts/pdf-fonts/THSarabunNew.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
}

@font-face {
  font-family: 'THSarabunNewPreview';
  src: url('@/assets/fonts/pdf-fonts/THSarabunNew Bold.ttf') format('truetype');
  font-weight: 700;
  font-style: normal;
}

.print-model-preview {
  display: inline-block;
  padding: var(--sp-lg);
}

.preview-grid-layout {
  display: inline-grid;
  grid-template-columns: auto;
  grid-template-rows: auto;

  &.has-ruler {
    grid-template-columns: var(--sp-xl) auto;
    grid-template-rows: var(--sp-xl) auto;
  }
}

.ruler-corner {
  grid-column: 1;
  grid-row: 1;
  background: var(--color-highlight-bg);
}

.ruler-top {
  grid-column: 2;
  grid-row: 1;
  position: relative;
  height: var(--sp-xl);
  background: var(--color-highlight-bg);
}

.ruler-left {
  grid-column: 1;
  grid-row: 2;
  position: relative;
  width: var(--sp-xl);
  background: var(--color-highlight-bg);
}

.ruler-mark {
  position: absolute;
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}

.ruler-mark-top {
  top: 2px;
  transform: translateX(-50%);
}

.ruler-mark-left {
  left: 2px;
  transform: translateY(-50%);
}

.print-sheet {
  grid-column: 2;
  grid-row: 2;
  position: relative;
  background: var(--color-card-bg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.grid-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.grid-line {
  position: absolute;
}

.grid-line-v {
  top: 0;
  bottom: 0;
  width: 0;
  border-left: 1px dashed var(--color-border);
}

.grid-line-h {
  left: 0;
  right: 0;
  height: 0;
  border-top: 1px dashed var(--color-border);
}

.print-primitive {
  position: absolute;
  font-family: 'THSarabunNewPreview', sans-serif;
  color: #000000;
}
</style>
