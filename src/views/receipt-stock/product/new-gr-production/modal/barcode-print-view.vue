<template>
  <div>
    <modal :showModal="isShowModal" @closeModal="closeModal">
      <template v-slot:content>
        <div class="title-text-lg-bg">
          <span><i class="bi bi-calendar-check-fill mr-2"></i></span>
          <span>{{ $t('view.receiptStock.product.grProduction.barcodePrintTitle') }}</span>
        </div>

        <!-- Tab เลือกแบบ -->
        <div>
          <div class="label-type-tabs">
            <button
              :class="['tab-btn', selectedType === 'original' ? 'tab-btn-active' : '']"
              @click="selectedType = 'original'"
            >
              <i class="bi bi-file-earmark-text mr-1"></i> {{ $t('view.receiptStock.product.grProduction.barcodeTypeOriginal') }}
            </button>
            <button
              :class="['tab-btn', selectedType === 'cost-no-gold' ? 'tab-btn-active' : '']"
              @click="selectedType = 'cost-no-gold'"
            >
              <i class="bi bi-file-earmark mr-1"></i> {{ $t('view.receiptStock.product.grProduction.barcodeTypeCostNoGold') }}
            </button>
          </div>
        </div>

        <div>
          <BaseDataTable
            scrollHeight="600px"
            dataKey="stockNumber"
            :items="stock"
            :columns="columns"
            :selectionMode="true"
            :itemsSelection="selectedItems"
            :preSelectedItems="itemsToPreSelect"
            @update:itemsSelection="updateSelection"
            :paginator="false"
          >
            <template #footer>
              <div class="title-text">
                <span class="bi bi-exclamation-circle mr-1"></span>
                <span>
                  {{ $t('view.stock.product.printerWarning') }}
                </span>
              </div>
              <div class="d-flex justify-content-between items-center">
                <!-- status -->
                <div class="vertical-center-container">
                  <span class="title-text">
                    {{ $t('view.receiptStock.product.grProduction.selectedCountFooter', { count: checkItemSelectedLength() }) }}
                  </span>
                  <span class="title-text ml-2 mr-2">|</span>

                  <div class="printer-status-indicator">
                    <div class="status-container">
                      <div
                        class="status-light"
                        :class="{
                          'status-green': isPrinterReady,
                          'status-yellow': isPrinterChecking,
                          'status-red': !isPrinterReady && !isPrinterChecking
                        }"
                        @click="checkPrinterStatus"
                      ></div>
                      <span
                        class="status-text"
                        :class="{
                          'text-green': isPrinterReady,
                          'text-yellow': isPrinterChecking,
                          'text-red': !isPrinterReady && !isPrinterChecking
                        }"
                        >{{ printerStatusText }}</span
                      >
                    </div>
                    <router-link
                      v-if="showPrinterSettingLink"
                      to="/setting/barcode-printer"
                      class="printer-setting-link"
                    >
                      {{ $t('common.printer.goToSetting') }}
                    </router-link>
                  </div>
                </div>

                <!-- action -->
                <div class="vertical-center-container">
                  <button class="btn btn-sm btn-dark" type="button" @click="closeModal">
                    <span class="bi bi-x"></span>
                  </button>
                  <button
                    :class="[
                      'btn btn-sm  ml-2',
                      checkItemSelectedLength() === 0 || !isPrinterReady
                        ? 'btn-secondary'
                        : 'btn-main'
                    ]"
                    :disabled="checkItemSelectedLength() === 0 || !isPrinterReady"
                    @click="onPrintBarcode"
                  >
                    <span class="bi bi-upc-scan"></span>
                  </button>
                </div>
              </div>
            </template>
          </BaseDataTable>
        </div>
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

import { zebraPrinterApi } from '@/stores/modules/api/printer/zebra-store.js'
import { error } from '@/services/alert/sweetAlerts.js'

import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

export default {
  components: {
    modal,
    BaseDataTable
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
      type: Array,
      required: true,
      default: () => []
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
        if (val.length > 0) {
          this.stock = [...val]
          //this.itemsToPreSelect = [...val]
          this.selectedItems = [...val]
          //console.log('modelStock', val)

          //delay 3 second
          setTimeout(() => {
            this.checkPrinterStatus()
          }, 3000)
        }
      },
      immediate: true
    }
  },

  data() {
    return {
      isShowModal: false,
      printerCheck: { status: 'unknown', printerName: '', printers: [], detail: null },
      selectedType: 'original',

      stock: this.modelStock,
      selectedItems: [],
      itemsToPreSelect: [],
      selectionType: 'single'
    }
  },

  computed: {
    columns() {
      return [
        {
          field: 'stockNumber',
          header: this.$t('view.receiptStock.product.grProduction.colStockNumber'),
          sortable: false,
          minWidth: '150px'
        },
        {
          field: 'productNumber',
          header: this.$t('view.receiptStock.product.grProduction.colProductNumber'),
          sortable: false,
          minWidth: '150px'
        },
        {
          field: 'productNameEn',
          header: this.$t('view.receiptStock.product.grProduction.colProductNameEn'),
          sortable: false,
          minWidth: '150px'
        },
        {
          field: 'productNameTh',
          header: this.$t('view.receiptStock.product.grProduction.colProductNameTh'),
          sortable: false,
          minWidth: '150px'
        },
        {
          field: 'receiptNumber',
          header: this.$t('view.receiptStock.product.grProduction.colStockReceiptNumber'),
          sortable: false,
          minWidth: '150px'
        }
      ]
    },

    isPrinterReady() {
      return this.printerCheck.status === 'success'
    },

    isPrinterChecking() {
      return this.printerCheck.status === 'unknown'
    },

    showPrinterSettingLink() {
      return this.printerCheck.status === 'no-printer' || this.printerCheck.status === 'printer-not-found'
    },

    printerStatusText() {
      switch (this.printerCheck.status) {
        case 'success':
          return `${this.$t('view.stock.product.printerReady')} · ${this.printerCheck.printerName}`
        case 'no-printer':
          return this.$t('common.printer.noPrinterSet')
        case 'printer-not-found':
          return this.$t('common.printer.savedNotFound', { name: this.printerCheck.printerName })
        case 'bridge-error':
          return this.bridgeErrorText
        default:
          return this.$t('view.stock.product.printerChecking')
      }
    },

    bridgeErrorText() {
      const bridgeStatus = this.printerCheck.detail?.bridgeStatus
      if (bridgeStatus === 'blocked') return this.$t('common.printer.statusBlocked')
      if (bridgeStatus === 'empty') return this.$t('common.printer.statusEmpty')
      return this.$t('common.printer.statusUnreachableTitle')
    }
  },

  methods: {
    onClear() {
      this.stock = []
      this.selectedItems = []
      this.itemsToPreSelect = []
      this.selectedType = 'original'
      this.printerCheck = { status: 'unknown', printerName: '', printers: [], detail: null }
    },

    closeModal() {
      this.$emit('closeModal')
      this.onClear()
    },

    updateSelection(newSelection) {
      this.selectedItems = newSelection
    },

    checkItemSelectedLength() {
      //console.log('item', item)
      if (this.selectedItems.length > 0) {
        return this.selectedItems.length
      }

      return 0
    },

    async checkPrinterStatus() {
      this.printerCheck = { status: 'unknown', printerName: '', printers: [], detail: null }
      this.printerCheck = await this.zebraPrinter.fetchBarcodePrinterStatus()
    },

    async onPrintBarcode() {
      const zplData = this.selectedItems.map((item) => {
        const barcodeData = {
          madeIn: 'MADE IN THAILAND',
          madeInText: 'XXXXXXXXXXX',
          goldType: item.productionTypeSize,
          mold: item.mold,
          stockNumber: item.stockNumber,
          productNumber: item.productNumber || '',
          size: item.size,
          productNameEn: item.productNameEn || '',
          gold: '',
          gems: [],
          price: item.productPrice ?? null,
          salePrice: item.productPrice ?? null,
          isSilver: item.productionTypeSize === 'SILVER' ? true : false,
          barcodeType: this.selectedType
        }

        // Process materials if available
        if (item.materials?.length > 0) {
          item.materials.forEach((material) => {
            switch (material.type) {
              case 'Gold':
              case 'Silver':
                barcodeData.gold = material.typeBarcode
                break
              case 'Gem':
              case 'Diamond':
                barcodeData.gems.push(material.typeBarcode)
                break
            }
          })
        }

        return barcodeData
      })

      const res = await this.zebraPrinter.fetchZebraPrints({
        formValue: zplData,
        skipLoading: true
      })

      if (res?.status !== 'success') {
        error(res?.message || this.$t('common.printer.printFailedTitle'), this.$t('common.printer.printFailedTitle'))
      }

      this.closeModal()
    }
  },

  async created() {
    this.$nextTick(async () => {
      //await this.checkPrinterStatus()
    })
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form';

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
  gap: var(--sp-sm);
  //margin: 10px 0;
}

.printer-setting-link {
  font-size: 13px;
  color: var(--base-green);
  text-decoration: underline;
  cursor: pointer;
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
