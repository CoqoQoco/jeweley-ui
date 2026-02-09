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
            <div class="mold-box">{{ mold }}</div>
            <div class="d-flex justify-content-between">
              <div class="barcode-wrapper">
                <svg ref="barcodeElement"></svg>
              </div>
              <div class="goldType-box">{{ goldType }}</div>
            </div>
            <div class="mold-box">{{ stockNumber }}</div>
            <div class="d-flex justify-content-start">
              <div class="gold-box">{{ gold }}</div>
              <div class="gold-box ml-1">{{ size }}</div>
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
  name: 'BarcodeTag',

  props: {
    madeIn: {
      type: String
    },
    madeInText: {
      type: String,
      default: '55123649977'
    },
    stockNumber: {
      type: String,
      default: 'XX-XXXX-XXX'
    },
    mold: {
      type: String
    },
    gold: {
      type: String,
      default: 'X.XX g. Gold'
    },
    size: {
      type: String,
      default: '#XX'
    },
    gems: {
      type: Array,
      default: () => ['XXXX XXX, XXXXX']
    },
    goldType: {
      type: String
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
    mold: {
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
      if (this.$refs.barcodeElement) {
        JsBarcode(this.$refs.barcodeElement, code, this.barcodeOptions)
      }
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

/* บาร์โค้ดคอนเทนเนอร์หลัก */
.barcode-container {
  display: flex;
  position: relative;
  margin: 0 auto;
}

/* แท็บด้านซ้าย */
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

/* กล่องหลักทางขวา */
.main-box {
  width: 450px;
  height: 100px;
  background-color: #ffff;
  border-radius: 15px;
  padding: 5px 10px 0px 15px;
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

/* สไตล์สำหรับบาร์โค้ด */
.barcode-wrapper {
  //background-color: white;
  //padding: 5px;
  border-radius: 5px;
  //margin-bottom: 10px;
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
  //margin-bottom: 10px;
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
  font-size: 10px;
}
.gem-box {
  display: flex;
  justify-content: flex-end;
  font-size: 10px;
  font-weight: bold;
  margin-left: 15px;
}
</style>
