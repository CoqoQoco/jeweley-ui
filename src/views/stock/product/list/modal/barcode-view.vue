<template>
  <div>
    <modal :showModal="isShowModal" @closeModal="closeModal" width="800px">
      <template v-slot:content>
        <div class="title-text-lg-bg">
          <span><i class="bi bi-upc-scan mr-2"></i></span>
          <span>{{ `พิมพ์ป้ายสินค้า | เลขที่ผลิต: ${stock.stockNumber}` }}</span>
        </div>

        <!-- Tab เลือกแบบ -->
        <div class="pl-4 pr-4 pt-2">
          <div class="label-type-tabs">
            <button
              :class="['tab-btn', selectedType === 'original' ? 'tab-btn-active' : '']"
              @click="selectedType = 'original'"
            >
              <i class="bi bi-file-earmark-text mr-1"></i> ดั้งเดิม
            </button>
            <button
              :class="['tab-btn', selectedType === 'cost-with-gold' ? 'tab-btn-active' : '']"
              @click="selectedType = 'cost-with-gold'"
            >
              <i class="bi bi-file-earmark mr-1"></i> ทุนรวมทอง
            </button>
            <button
              :class="['tab-btn', selectedType === 'cost-no-gold' ? 'tab-btn-active' : '']"
              @click="selectedType = 'cost-no-gold'"
            >
              <i class="bi bi-file-earmark-minus mr-1"></i> ทุนไม่รวมทอง
            </button>
            <button
              :class="['tab-btn', selectedType === 'tag-with-gold' ? 'tab-btn-active' : '']"
              @click="selectedType = 'tag-with-gold'"
            >
              <i class="bi bi-tag mr-1"></i> ราคาป้ายรวมทอง
            </button>
            <button
              :class="['tab-btn', selectedType === 'tag-no-gold' ? 'tab-btn-active' : '']"
              @click="selectedType = 'tag-no-gold'"
            >
              <i class="bi bi-tag-fill mr-1"></i> ราคาป้ายไม่รวมทอง
            </button>
          </div>
        </div>

        <div class="pl-4 pt-2">
          <span class="title-text">ภาพตัวอย่าง</span>
        </div>

        <div class="form-col-container pl-4 pr-4">
          <div class="filter-container-bg-focus">
            <barcodeDemo
              v-if="selectedType === 'original'"
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
              :price="previewPrice"
              :gems="barcode.gems"
              :madeIn="barcode.madeIn"
              :madeInText="barcode.madeInText"
            />
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
              <div>
                <span class="title-text">จำนวนพิมพ์</span>
              </div>
              <div class="ml-2 mr-2">
                <input
                  class="form-control text-center"
                  type="number"
                  v-model="barcode.print"
                  min="1"
                  max="30"
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
const barcodeVerticalDemo = defineAsyncComponent(() =>
  import('@/components/custom/barcode-demo/barcode-vertical-demo-view.vue')
)

const interfaceBarcode = {
  madeIn: 'MADE IN THAILAND',
  madeInText: 'XXXXXXXXXXX',
  mold: 'RFXXXXR',
  goldType: 'XXK',
  stockNumber: 'XX-XXXX-XXX',
  size: 'XX',
  productNameEn: '',
  gold: '',
  gems: [],
  price: null,
  originPrice: null,
  tagPriceMultiplier: 1,
  print: 1,
  isSilver: false
}

import { zebraPrinterApi } from '@/stores/modules/api/printer/zebra-store.js'
import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'

export default {
  components: {
    modal,
    barcodeDemo,
    barcodeVerticalDemo
  },

  setup() {
    const zebraPrinter = zebraPrinterApi()
    const productStore = usrStockProductApiStore()
    return { zebraPrinter, productStore }
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
        this.isShowModal = val

        if (val && this.stock?.stockNumber) {
          this.checkPrinterStatus()
        }
      },
      immediate: true
    },
    modelStock: {
      async handler(val) {
        if (!val || !val.stockNumber) return

        this.stock = { ...val }

        this.barcode = {
          madeIn: 'MADE IN THAILAND',
          madeInText: 'XXXXXXXXXXX',
          goldType: val.productionTypeSize,
          mold: val.mold,
          stockNumber: val.stockNumber,
          size: val.size,
          productNameEn: val.productNameEn || '',
          productNumber: val.productNumber || '',
          gold: '',
          gems: [],
          price: null,
          originPrice: null,
          tagPriceMultiplier: Number(val.tagPriceMultiplier) || 1,
          print: 1,
          isSilver: val.productionTypeSize === 'SILVER' ? true : false
        }

        // Process materials
        if (val.materials?.length > 0) {
          const goldParts = []
          val.materials.forEach((material) => {
            switch (material.type) {
              case 'Gold':
              case 'Silver':
                if (material.typeBarcode) goldParts.push(material.typeBarcode)
                break
              case 'Gem':
              case 'Diamond':
                this.barcode.gems.push(material.typeBarcode)
                break
            }
          })
          this.barcode.gold = goldParts.join(' ')
        }

        // fetch price แยก API เพื่อไม่ให้ list ช้า
        if (val.stockNumber) {
          const costRes = await this.productStore.fetchGetStockCostDetail(val.stockNumber, { skipLoading: true })
          if (costRes?.length > 0) {
            this.barcode.price = costRes
              .filter((x) => x.nameGroup !== 'Gold')
              .reduce((sum, x) => sum + (x.totalPrice ?? 0), 0)
            this.barcode.originPrice = costRes.reduce((sum, x) => sum + (x.totalPrice ?? 0), 0)
          }
        }
      },
      immediate: true
    }
  },

  computed: {
    previewPrice() {
      const origin = Number(this.barcode.originPrice) || 0
      const noGold = Number(this.barcode.price) || 0
      const multiplier = Number(this.barcode.tagPriceMultiplier) || 1
      switch (this.selectedType) {
        case 'cost-with-gold':  return origin || null
        case 'cost-no-gold':    return noGold || null
        case 'tag-with-gold':   return origin ? origin * multiplier : null
        case 'tag-no-gold':     return noGold ? noGold * multiplier : null
        default:                return null
      }
    }
  },

  data() {
    return {
      isShowModal: false,
      checkPrinterService: 'unknown',
      selectedType: 'original',

      stock: {},
      barcode: { ...interfaceBarcode }
    }
  },

  methods: {
    onClear() {
      this.stock = {}
      this.barcode = { ...interfaceBarcode }
      this.selectedType = 'original'
      this.checkPrinterService = 'unknown'
    },

    closeModal() {
      this.$emit('closeModal')
      this.onClear()
    },

    getPrinterServiceStatus(check) {
      let name = 'เครื่องพิมพ์'
      if (check === 'error') return `${name}ไม่พร้อมใช้งาน`
      if (check === 'success') return `${name}พร้อมใช้งาน`
      return `กำลังตรวจสอบสถานะ${name}...`
    },

    validateInput() {
      if (this.barcode.print < 1) {
        this.barcode.print = 1
      } else if (this.barcode.print > 30) {
        this.barcode.print = 30
      }
      this.barcode.print = Math.floor(this.barcode.print)
    },

    async checkPrinterStatus() {
      this.checkPrinterService = 'unknown'
      const res = await this.zebraPrinter.fetchZebraPrinterStatus({ skipLoading: true })
      if (res && res.status === 'success') {
        this.checkPrinterService = res.service.status === 'running' ? 'success' : 'error'
      } else {
        this.checkPrinterService = 'error'
      }
    },

    async onPrintBarcode() {
      const zplData = {
        ...this.barcode,
        price: this.previewPrice,
        barcodeType: this.selectedType
      }
      await this.zebraPrinter.fetchZebraPrint({ formValue: zplData, skipLoading: true })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form';

input {
  margin-top: 0px !important;
}

.label-type-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
}

.tab-btn {
  padding: 4px 14px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background: #fff;
  font-size: 13px;
  cursor: pointer;
  color: #555;

  &:hover {
    background: #f5f5f5;
  }
}

.tab-btn-active {
  background: var(--base-font-color);
  color: #fff;
  border-color: var(--base-font-color);
}

.printer-status-indicator {
  display: flex;
  align-items: center;
}

.status-container {
  display: flex;
  align-items: center;
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
