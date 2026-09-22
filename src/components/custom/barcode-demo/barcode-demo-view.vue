<template>
  <div class="preview-container">
    <div class="barcode-container">
      <!-- แท็บด้านซ้าย -->
      <div class="left-tab">
        <div class="d-flex">
          <span class="goldType-box">{{ madeIn }}</span>
        </div>
      </div>

      <!-- กล่องหลัก -->
      <div class="main-box">
        <div class="box-col-container">
          <div class="left-box">
            <div class="mold-box">{{ isQrMode ? productNameEn : '' }}</div>
            <div class="d-flex justify-content-between">
              <div class="barcode-wrapper">
                <svg ref="barcodeElement"></svg>
              </div>
              <div v-if="!isGt800" class="goldType-box">{{ goldType }}</div>
            </div>
            <div class="mold-box">{{ stockNumberLine }}</div>
            <div class="d-flex justify-content-start">
              <div class="gold-box">{{ goldText }}</div>
              <div class="gold-box ml-1">{{ size }}</div>
            </div>
          </div>
          <div class="right-box" :class="{ 'right-box-center': isQrMode }">
            <img v-if="qrDataUrl" :src="qrDataUrl" class="qr-preview" alt="QR" />
            <div v-else-if="displayGems.length > 0">
              <div v-for="(item, index) in displayGems" :key="index">
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
import QRCode from 'qrcode'

import { formatGemText } from '@/services/helper/barcode/barcode-zpl.js'
import { PRINTER_PROFILES } from '@/services/api/barcode-printer-config.js'

export default {
  name: 'BarcodeTag',

  props: {
    type: {
      type: String,
      default: 'gem'
    },
    madeIn: {
      type: String
    },
    stockNumber: {
      type: String,
      default: 'XX-XXXX-XXX'
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
    diamond: {
      type: Array,
      default: () => null
    },
    goldType: {
      type: String,
      default: 'gem'
    },
    salePrice: {
      type: Number,
      default: null
    },
    profile: {
      type: String,
      default: PRINTER_PROFILES.LEGACY
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
    },
    qrUrl: {
      type: String,
      default: ''
    },
    productNameEn: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      qrDataUrl: ''
    }
  },

  watch: {
    stockNumber: {
      handler(newVal) {
        this.generateBarcode(newVal)
      },
      immediate: true
    },
    qrUrl: {
      async handler(val) {
        if (!val) {
          this.qrDataUrl = ''
          return
        }
        this.qrDataUrl = await QRCode.toDataURL(val, { margin: 0, errorCorrectionLevel: 'L' })
      },
      immediate: true
    }
  },

  computed: {
    stockNumberLine() {
      const priceText =
        this.salePrice != null && this.salePrice > 0
          ? new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
              this.salePrice
            )
          : ''
      return [this.stockNumber, priceText].filter(Boolean).join(' - ')
    },

    isGt800() {
      return this.profile === PRINTER_PROFILES.GT800
    },

    // แท็บ QR ไม่มีคอลัมน์พลอย ใช้พื้นที่นั้นแสดงชื่อสินค้า/QR แทน — ไม่มี goldType นำหน้าบรรทัดทอง
    isQrMode() {
      return !!this.qrUrl
    },

    goldText() {
      if (this.isGt800 && this.goldType && !this.isQrMode) {
        return [this.goldType, this.gold].filter(Boolean).join('  ')
      }
      return this.gold
    },

    displayGems() {
      if (!this.isGt800) return this.gems
      return (this.gems || []).map(formatGemText)
    }
  },

  mounted() {
    this.generateBarcode(this.stockNumber)
  },

  methods: {
    generateBarcode(code) {
      if (this.$refs.barcodeElement && code) {
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
  font-size: 12px;
  font-weight: bold;
}
.gem-box {
  display: flex;
  justify-content: flex-end;
  font-size: 10px;
  font-weight: bold;
  margin-left: 15px;
}

.qr-preview {
  display: block;
  width: 56px;
  height: 56px;
  margin-left: auto;
  image-rendering: pixelated;
}

// แท็บ QR — จัดกลางพื้นที่ว่างขวาของบล็อกข้อความ แทนการชิดขวา
.right-box-center {
  display: flex;
  align-items: center;
  justify-content: center;

  .qr-preview {
    margin-left: 0;
  }
}
</style>
