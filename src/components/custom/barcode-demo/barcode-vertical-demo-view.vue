<template>
  <div class="preview-container">
    <div class="barcode-container">
      <!-- แท็บด้านซ้าย -->
      <div class="left-tab">
        <div class="d-flex">
          <span class="goldType-box">{{ madeIn }}</span>
          <span class="goldType-box ml-1">{{ madeInText }}</span>
        </div>
      </div>

      <!-- กล่องหลัก -->
      <div class="main-box">
        <div class="box-col-container">
          <div class="left-box">
            <!-- productNameEn แทน mold -->
            <div class="mold-box">{{ productNameEn }}</div>
            <!-- gold + size อยู่เหนือ barcode -->
            <div class="d-flex justify-content-start">
              <div class="gold-box">{{ gold }}</div>
              <div class="gold-box ml-1">{{ size ? `#${size}` : '' }}</div>
            </div>
            <div class="barcode-wrapper">
              <svg ref="barcodeElement"></svg>
            </div>
            <!-- productNumber - price ไม่รวม Gold -->
            <div v-if="productNumber || price" class="price-box">
              {{ productNumber }}{{ price ? ` - ${formatPrice(price)}` : '' }}
            </div>
          </div>
          <div class="right-box">
            <div v-if="gems.length > 0">
              <div v-for="(item, index) in gems" :key="index">
                <div class="gem-box">
                  <span class="text-left">{{ item }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import JsBarcode from 'jsbarcode'

export default {
  name: 'BarcodeVerticalTag',

  props: {
    productNameEn: {
      type: String,
      default: ''
    },
    stockNumber: {
      type: String,
      default: 'XX-XXXX-XXX'
    },
    gold: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: ''
    },
    goldType: {
      type: String,
      default: ''
    },
    productNumber: {
      type: String,
      default: ''
    },
    price: {
      type: Number,
      default: null
    },
    gems: {
      type: Array,
      default: () => []
    },
    madeIn: {
      type: String,
      default: 'MADE IN THAILAND'
    },
    madeInText: {
      type: String,
      default: ''
    },
    barcodeOptions: {
      type: Object,
      default: () => ({
        format: 'CODE128',
        width: 1.5,
        height: 60,
        displayValue: false,
        margin: 2,
        background: '#ffffff'
      })
    }
  },

  watch: {
    stockNumber: {
      handler(newVal) {
        this.generateBarcode(newVal)
      },
      immediate: true
    }
  },

  mounted() {
    this.generateBarcode(this.stockNumber)
  },

  updated() {
    this.generateBarcode(this.stockNumber)
  },

  methods: {
    generateBarcode(code) {
      if (this.$refs.barcodeElement && code) {
        JsBarcode(this.$refs.barcodeElement, code, this.barcodeOptions)
      }
    },
    formatPrice(value) {
      if (!value && value !== 0) return ''
      return new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value)
    }
  }
}
</script>

<style lang="scss" scoped>
.preview-container {
  width: 600px;
  margin: 0 auto;
  padding: 20px;
  position: relative;
}

.barcode-container {
  display: flex;
  position: relative;
  margin: 0 auto;
}

.left-tab {
  width: 350px;
  height: 30px;
  background-color: #ffff;
  border-radius: 15px 0 0 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  position: relative;
  top: 35px;
}

.main-box {
  width: 450px;
  min-height: 100px;
  background-color: #ffff;
  border-radius: 15px;
  padding: 5px 10px 5px 15px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
}

.box-col-container {
  display: grid;
  gap: 10px;
  padding: 0px;
  grid-template-columns: 1fr 1fr;
}

.barcode-wrapper {
  border-radius: 5px;
  width: 100%;
}

.barcode-wrapper svg {
  width: 100%;
  height: 40px;
}

.mold-box {
  text-align: start;
  font-size: 12px;
  font-weight: bold;
}

.goldType-box {
  display: flex;
  text-align: start;
  align-items: center;
  margin-left: 2px;
  font-size: 12px;
  font-weight: bold;
}

.gold-box {
  text-align: start;
  font-size: 11px;
  font-weight: bold;
}

.price-box {
  text-align: start;
  font-size: 11px;
  font-weight: bold;
  margin-top: 1px;
}

.gem-box {
  display: flex;
  justify-content: flex-end;
  font-size: 10px;
  font-weight: bold;
  margin-left: 15px;
}
</style>
