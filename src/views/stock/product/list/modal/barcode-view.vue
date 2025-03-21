<template>
  <div>
    <modal :showModal="isShowModal" @closeModal="closeModal" width="800px">
      <template v-slot:content>
        <div class="title-text-lg-bg">
          <span><i class="bi bi-upc-scan mr-2"></i></span>
          <span>{{ `พิมพ์ป้ายสินค้า | เลขที่ผลิต: ${stock.stockNumber}` }}</span>
        </div>

        <div class="pl-4 pt-2">
          <span class="title-text">ภาพตัวอย่าง</span>
        </div>

        <div class="form-col-container pl-4 pr-4">
          <div class="filter-container-bg-focus">
            <barcodeDemo
              :madeIn="barcode.madeIn"
              :madeInText="barcode.madeInText"
              :stockNumber="barcode.stockNumber"
              :mold="barcode.mold"
              :gold="barcode.gold"
              :gems="barcode.gems"
              :size="barcode.size"
              :goldType="barcode.goldType"
            >
            </barcodeDemo>
          </div>
        </div>

        <div class="pl-4 pr-4 pt-2 pb-2">
          <div class="title-text">
            <span class="bi bi-exclamation-circle mr-1"></span>
            <span>
              โปรดตรวจสอบสถานะโปรเเกรมพิมพ์บาร์โค้ด เเละเครื่องพิมพ์ก่อนการใช้งานทุกครั้ง
            </span>
          </div>

          <div class="d-flex justify-content-between items-center">
            <!-- status -->
            <div class="vertical-center-container">
              <div class="printer-status-indicator">
                <div class="status-container">
                  <!-- <div class="mr-2 title-text">
                        <span class="bi bi-gear-wide"></span>
                      </div> -->
                  <div
                    class="status-light"
                    :class="{
                      'status-red': checkPrinterService === 'error',
                      'status-green': checkPrinterService === 'success',
                      'status-yellow': checkPrinterService === 'unknown'
                    }"
                    @click="checkPrinterStatus"
                  ></div>
                  <span
                    class="status-text"
                    :class="{
                      'text-red': checkPrinterService === 'error',
                      'text-green': checkPrinterService === 'success',
                      'text-yellow': checkPrinterService === 'unknown'
                    }"
                    >{{ getPrinterServiceStatus(checkPrinterService) }}</span
                  >
                </div>
              </div>
            </div>

            <!-- action -->
            <div class="vertical-center-container">
              <!-- <button class="btn btn-sm btn-dark" type="button" @click="closeModal">
                <span class="bi bi-x"></span>
              </button> -->
              <div>
                <span class="title-text">จำนวนพิมพ์</span>
              </div>
              <div class="ml-2 mr-2">
                <input
                  class="form-control text-center"
                  type="number"
                  v-model="barcode.print"
                  min="1"
                  max="999"
                  style="
                    width: 50px;
                    font-size: 16px;
                    height: 30px;
                    border-radius: 4px;
                    border: 1px solid #ced4da;
                  "
                  @input="validateInput"
                />
              </div>
              <button
                :class="[
                  'btn btn-sm',
                  checkPrinterService !== 'success' ? 'btn-secondary' : 'btn-main'
                ]"
                :disabled="checkPrinterService !== 'success'"
                @click="onPrintBarcode"
              >
                <span class="bi bi-upc-scan"></span>
              </button>
            </div>
          </div>
        </div>
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))
const barcodeDemo = defineAsyncComponent(() =>
  import('@/components/custom/barcode-demo/barcode-demo-view.vue')
)

const interfaceBarcode = {
  madeIn: 'MADE IN THAILAND',
  madeInText: 'XXXXXXXXXXX',
  mold: 'RFXXXXR',
  goldType: 'XXK',
  stockNumber: 'XX-XXXX-XXX',
  size: 'XX',
  barcodeGold: 'Gold XX g.',
  barcodeGems: [],
  print: 1
}

import { zebraPrinterApi } from '@/stores/modules/api/printer/zebra-store.js'

export default {
  components: {
    modal,
    barcodeDemo
  },

  setup() {
    const zebraPrinter = zebraPrinterApi()
    return { zebraPrinter }
  },

  props: {
    isShow: {
      type: Boolean,
      required: true,
      default: false
    },
    modelStock: {
      type: Object,
      required: true,
      default: () => {}
    }
  },

  watch: {
    isShow: {
      handler(val) {
        //console.log('isShow', val)
        this.isShowModal = val
      },
      immediate: true
    },
    modelStock: {
      handler(val) {
        if (!val) return

        // Clone object to avoid mutation issues
        this.stock = { ...val }

        // Set basic barcode properties
        this.barcode = {
          madeIn: 'MADE IN THAILAND',
          madeInText: 'XXXXXXXXXXX',
          goldType: val.productionTypeSize,
          mold: val.mold,
          stockNumber: val.stockNumber,
          size: val.size,
          gold: '',
          gems: [],
          print: 1
        }

        // Process materials if available
        if (val.materials?.length > 0) {
          // Filter and process materials by type
          val.materials.forEach((material) => {
            switch (material.type) {
              case 'Gold':
              case 'Silver':
                this.barcode.gold = material.typeBarcode
                break
              case 'Gem':
              case 'Diamond':
                this.barcode.gems.push(material.typeBarcode)
                break
            }
          })
        }

        console.log('barcode', this.barcode)

        // Schedule printer status check if stock number exists
        if (val.stockNumber) {
          setTimeout(() => this.checkPrinterStatus(), 3000)
        }
      },
      immediate: true
    }
  },

  data() {
    return {
      isShowModal: false,
      checkPrinterService: 'unknown',

      stock: {},
      barcode: { ...interfaceBarcode }
    }
  },

  methods: {
    onClear() {
      this.stock = {}
      this.barcode = { ...interfaceBarcode }

      this.checkPrinterService = 'unknown'
    },

    closeModal() {
      this.$emit('closeModal')
      this.onClear()
    },

    getBarcode(item) {
      let display = ''

      if (item.type === 'Diamond') {
        display = `${item.qty ?? ''}${item.type ?? ''}${item.weight ?? ''}${
          item.weightUnit ? ` ${item.weightUnit}` : ''
        }${item.typeCode ? `, ${item.typeCode}` : ''}`
      }

      if (item.type === 'Gold') {
        display = `${item.weight ?? ``}${item.weightUnit ? ` ${item.weightUnit}` : ``}${
          item.type ? ` ${item.type}` : ``
        }`
      }

      if (item.type === 'Gem') {
        display = `${item.qty ?? ''}${item.typeCode ?? ''}${item.weight ?? ''}${
          item.weightUnit ? ` ${item.weightUnit}` : ``
        }`
      }

      return display
    },

    getGoldWeight(item) {
      return `${item.weight ?? ``}${item.weightUnit ? ` ${item.weightUnit}` : ``}`
    },

    getPrinterServiceStatus(check) {
      let name = 'เครื่องพิมพ์'

      if (check === 'error') {
        return `${name}ไม่พร้อมใช้งาน`
      }

      if (check === 'success') {
        return `${name}พร้อมใช้งาน`
      }

      return `กำลังตรวจสอบสถานะ${name}...`
    },

    // เพิ่ม method นี้ใน methods ที่มีอยู่แล้ว
    validateInput() {
      // ตรวจสอบว่าเป็นตัวเลขจำนวนเต็มบวกเท่านั้น
      if (this.barcode.print < 1) {
        this.barcode.print = 1
      } else if (this.barcode.print > 30) {
        this.barcode.print = 30
      }
      // แปลงเป็นจำนวนเต็ม (ตัดทศนิยมออก)
      this.barcode.print = Math.floor(this.barcode.print)
    },

    async checkPrinterStatus() {
      this.checkPrinterService = 'unknown'

      const res = await this.zebraPrinter.fetchZebraPrinterStatus({ skipLoading: true })
      //console.log('res', res)

      if (res && res.status === 'success') {
        if (res.service.status === 'running') {
          this.checkPrinterService = 'success'
        } else {
          this.checkPrinterService = 'error'
        }
      } else {
        this.checkPrinterService = 'error'
      }

      //console.log('checkPrinterService', this.checkPrinterService)
    },

    async onPrintBarcode() {
      const zplData = {
        ...this.barcode
      }

      const res = await this.zebraPrinter.fetchZebraPrint({
        formValue: zplData,
        skipLoading: true
      })

      console.log('res', res)
      this.closeModal
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form';

input {
  margin-top: 0px !important;
}

.printer-status-indicator {
  display: flex;
  align-items: center;
  //margin: 10px 0;
}

.status-container {
  display: flex;
  align-items: center;
  //background-color: #f5f5f5;
  //padding: 5px 12px;
  //border-radius: 4px;
  //border: 1px solid #ddd;
}

.status-light {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);
  cursor: pointer;
}

.status-red {
  background-color: var(--base-red);
  box-shadow: 0 0 5px var(--base-red);
}

.status-green {
  background-color: var(--base-green);
  box-shadow: 0 0 5px var(--base-green);
}

.status-yellow {
  background-color: var(--base-warning);
  box-shadow: 0 0 5px var(--base-warning);
}

.status-text {
  font-size: 14px;
  font-weight: 700;
}
.text-red {
  color: var(--base-red);
  text-shadow: 0 0 15px var(--base-red);
}
.text-green {
  color: var(--base-green);
  text-shadow: 0 0 15px var(--base-green);
}
.text-yellow {
  color: var(--base-warning);
  text-shadow: 0 0 15px #ffcc00;
}
</style>
