<template>
  <div class="app-container">
    <headerView
      :model="data"
      :modelHeader="header"
      :modelGem="gems"
      @onFetch="onFetch"
    ></headerView>
    <div class="form-col-container mt-2">
      <form @submit.prevent="onSubmit">
        <BaseDataTable
          :items="form"
          dataKey="stockReceiptNumber"
          :columns="tableColumns"
          :paginator="false"
          :selectionMode="true"
          :itemsSelection="selectedItems"
          @update:itemsSelection="updateSelection"
          :disabledItems="itemsToDisable"
          :preSelectedItems="itemsToPreSelect"
          :expandable="true"
          :scrollHeight="scrollHeight"
          class="custom-form-table"
        >
          <!-- auto index -->
          <template #noTemplate="{ index }">
            <div class="d-flex justify-content-center">
              <span>{{ index + 1 }}</span>
            </div>
          </template>

          <template #productNumberTemplate="{ data }">
            <div class="d-flex justify-content-center">
              <input
                v-if="!data.isReceipt"
                class="form-control form-control-sm"
                :style="getBgColor(data.isReceipt, data.productNumber)"
                type="text"
                v-model="data.productNumber"
                :required="isRequiredField(data)"
                :disabled="data.isReceipt"
              />
              <span v-else>{{ data.productNumber }}</span>
            </div>
          </template>

          <template #moldDesignTemplate="{ data }">
            <div class="d-flex justify-content-center">
              <input
                v-if="!data.isReceipt"
                class="form-control form-control-sm"
                :style="getBgColor(data.isReceipt, data.moldDesign)"
                type="text"
                v-model="data.moldDesign"
                :required="isRequiredField(data)"
                :disabled="data.isReceipt"
              />
              <span v-else>{{ data.moldDesign }}</span>
            </div>
          </template>

          <template #productNameEnTemplate="{ data }">
            <div class="d-flex justify-content-center">
              <!-- <input
                v-if="!data.isReceipt"
                class="form-control form-control-sm"
                :style="getBgColor(data.isReceipt, data.productNameEN)"
                type="text"
                v-model="data.productNameEN"
                :required="isRequiredField(data)"
                :disabled="data.isReceipt"
              /> -->

              <div v-if="!data.isReceipt" class="input-group input-group-sm">
                <div class="input-group input-group-inner">
                  <input
                    class="form-control"
                    :style="getBgColor(data.isReceipt, data.productNameEN)"
                    type="text"
                    autocomplete="off"
                    autocorrect="off"
                    autocapitalize="off"
                    spellcheck="false"
                    v-model="data.productNameEN"
                    :required="isRequiredField(data)"
                    :disabled="data.isReceipt"
                  />
                  <div class="input-group-append mr-1">
                    <button
                      type="button"
                      class="btn btn-green btn-sm btn-input-group"
                      @click="onSearchProductName(data, 'EN')"
                    >
                      <span class="bi bi-search"></span>
                    </button>
                  </div>
                </div>
              </div>
              <span v-else>{{ data.productNameEN }}</span>
            </div>
          </template>

          <template #productNameThTemplate="{ data }">
            <div class="d-flex justify-content-center">
              <!-- <input
                v-if="!data.isReceipt"
                class="form-control form-control-sm"
                :style="getBgColor(data.isReceipt, data.productNameTH)"
                type="text"
                v-model="data.productNameTH"
                :required="isRequiredField(data)"
                :disabled="data.isReceipt"
              /> -->
              <div v-if="!data.isReceipt" class="input-group input-group-sm">
                <div class="input-group input-group-inner">
                  <input
                    class="form-control"
                    :style="getBgColor(data.isReceipt, data.productNameTH)"
                    type="text"
                    autocomplete="off"
                    autocorrect="off"
                    autocapitalize="off"
                    spellcheck="false"
                    v-model="data.productNameTH"
                    :required="isRequiredField(data)"
                    :disabled="data.isReceipt"
                  />
                  <div class="input-group-append mr-1">
                    <button
                      type="button"
                      class="btn btn-green btn-sm btn-input-group"
                      @click="onSearchProductName(data, 'TH')"
                    >
                      <span class="bi bi-search"></span>
                    </button>
                  </div>
                </div>
              </div>
              <span v-else>{{ data.productNameTH }}</span>
            </div>
          </template>

          <template #expansion="slotProps">
            <productExpansion
              :item="slotProps.data"
              :formBarcode="formBarcode"
              :masterMaterialType="masterMaterialType"
              :masterStud="masterStud"
              :masterGold="masterGold"
              :masterGem="masterGem"
              :masterDiamondGrade="masterDiamondGrade"
              :selectedItems="selectedItems"
              :parentData="data"
              :type="type"
              :scrollHeight="scrollHeight"
              @select-image="onSelectImage"
              @search-product-name="onSearchProductName"
              @add-material="addMaterialItem"
              @remove-material="removeMaterialItem"
              @update-type-barcode="updateTypeBarcode"
            />
          </template>

          <template #footer>
            <div class="line"></div>

            <div class="d-flex justify-content-between items-center">
              <div class="vertical-center-container">
                <span class="title-text">{{ $t('receipt-stock.product.grProduction.selectedCount', { count: checkItemSelectedLength() }) }}</span>
              </div>
              <div>
                <button class="btn btn-sm btn-green" type="button" @click="fetchDraft">
                  <span v-if="isOnDraft" class="spinner-border spinner-border-sm"></span>
                  <span v-else class="bi bi-clipboard2-pulse-fill"></span>
                  <span class="ml-2">{{ $t('receipt-stock.product.grProduction.saveDraft') }}</span>
                </button>
                <button
                  :class="[
                    'btn btn-sm  ml-2',
                    checkItemSelectedLength() === 0 ? 'btn-secondary' : 'btn-main'
                  ]"
                  type="submit"
                  :disabled="checkItemSelectedLength() === 0"
                >
                  <span class="bi bi-upload"></span>
                  <span class="ml-2">{{ $t('receipt-stock.product.grProduction.saveStock') }}</span>
                </button>
              </div>
            </div>
          </template>
        </BaseDataTable>
      </form>
    </div>

    <modalSelectImage
      :isShow="isShow.imageSelect"
      :modelStock="stockUpdate"
      @select="updateImage"
      @closeModal="closeModal"
    ></modalSelectImage>

    <modalBarcodePrint
      :isShow="isShow.barcodePrint"
      :modelStock="res"
      @closeModal="closeModal"
    ></modalBarcodePrint>

    <modalSearchProductName
      :isShow="isShow.searchProductName"
      :modelStock="stockUpdate"
      :mode="searchProductNameType"
      @select="updateProductName"
      @closeModal="closeModal"
    ></modalSearchProductName>
  </div>
</template>

<script>
import { useReceiptProductionApiStore } from '@/stores/modules/api/receipt/receipt-production-api.js'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

import { warning, confirmSubmit } from '@/services/alert/sweetAlerts.js'

import { useMasterApiStore } from '@/stores/modules/api/master-store.js'

import headerView from './components/production-header-view.vue'
import modalSelectImage from './modal/image-select-view.vue'
import modalBarcodePrint from './modal/barcode-print-view.vue'
import modalSearchProductName from './modal/search-product-name-view.vue'
import productExpansion from './components/product-expansion.vue'

const interfaceBarcode = {
  madeIn: 'MADE IN THAILAND',
  madeInText: 'XXXXXXXXXXX',
  mold: 'RFXXXXR',
  goldType: 'XXK',
  type: 'gem'
}
const interfaceIsShow = {
  imageSelect: false,
  barcodePrint: false,
  searchProductName: false
}

export default {
  name: 'ProductionPlanList',

  components: {
    BaseDataTable,
    headerView,
    modalSelectImage,
    modalBarcodePrint,
    modalSearchProductName,
    productExpansion
  },

  setup() {
    const receiptProductionStore = useReceiptProductionApiStore()
    const masterStore = useMasterApiStore()
    return { receiptProductionStore, masterStore }
  },

  computed: {
    masterGold() {
      return this.masterStore.gold
    },
    masterGem() {
      return this.masterStore.gem
    },
    masterDiamondGrade() {
      return this.masterStore.diamondGrade
    },
    tableColumns() {
      return [
        { field: 'no', header: this.$t('receipt-stock.product.grProduction.colNo'), sortable: false, width: '50px' },
        { field: 'stockReceiptNumber', header: this.$t('receipt-stock.product.grProduction.colStockReceiptNumber'), sortable: false, minWidth: '140px' },
        { field: 'stockNumber', header: this.$t('receipt-stock.product.grProduction.colStockNumber'), sortable: false, minWidth: '140px' },
        { field: 'productNumber', header: this.$t('receipt-stock.product.grProduction.colProductNumber'), sortable: false, minWidth: '140px' },
        { field: 'moldDesign', header: this.$t('receipt-stock.product.grProduction.colMoldDesign'), sortable: false, minWidth: '120px' },
        { field: 'productNameEn', header: this.$t('receipt-stock.product.grProduction.colProductNameEn'), sortable: false, minWidth: '150px' },
        { field: 'productNameTh', header: this.$t('receipt-stock.product.grProduction.colProductNameTh'), sortable: false, minWidth: '150px' }
      ]
    }
  },

  data() {
    return {
      isOnDraft: false,

      isShow: { ...interfaceIsShow },
      stockUpdate: {},
      type: 'STOCK-PRODUCT',

      param: {},
      data: {},
      res: [],
      searchProductNameType: 'EN',

      header: [],
      gems: [],
      form: [],
      scrollHeight: '',

      selectedItems: [],
      itemsToDisable: [], // items ที่ต้องการ disable
      itemsToPreSelect: [], // items ที่ต้องการให้ติ๊กถูกไว้ตั้งแต่แรก
      masterMaterialType: [
        { value: 'Gold', description: 'Gold' },
        { value: 'Silver', description: 'Silver' },
        { value: 'Diamond', description: 'Diamond' },
        { value: 'Gem', description: 'Gem ' }
      ],
      masterStud: [
        { value: 'lg', description: 'แป้นใหญ่' },
        { value: 'md', description: 'แป้นกลาง' },
        { value: 'sm', description: 'แป้นเล็ก' }
      ],

      images: [],

      formBarcode: { ...interfaceBarcode }
    }
  },

  methods: {
    getBgColor(isReceipt, data) {
      if (isReceipt) {
        return 'background-color: #e0e0e0'
      } else if (data) {
        return 'background-color: #b5dad4'
      } else {
        return 'background-color: #dad4b5'
      }
    },
    checkItemSelectedLength() {
      if (this.selectedItems.length > 0) {
        return this.selectedItems.length
      }

      return 0
    },

    isRequiredField(data, size = false) {
      if (size) {
        return (
          !data.isReceipt &&
          this.selectedItems.some(
            (selected) => selected.stockReceiptNumber === data.stockReceiptNumber
          ) &&
          ['G', 'B', 'R', 'N'].includes(this.data.productType)
        )
      } else {
        return (
          !data.isReceipt &&
          this.selectedItems.some(
            (selected) => selected.stockReceiptNumber === data.stockReceiptNumber
          )
        )
      }
    },
    validateForm(formValue) {
      let isValid = true
      const productNumbers = new Set() // ใช้ Set เพื่อเก็บค่า productNumber ที่ผ่านการตรวจสอบแล้ว
      let duplicateProductNumbers = [] // เก็บรายการ productNumber ที่ซ้ำกัน

      // ตรวจสอบเฉพาะรายการที่ถูกเลือกเท่านั้น
      for (const item of formValue) {
        // หารายการที่เลือกในฟอร์ม
        const formItem = this.form.find((f) => f.stockReceiptNumber === item.stockReceiptNumber)

        if (formItem && !formItem.isReceipt) {
          // ตรวจสอบข้อมูลพื้นฐาน
          if (!formItem.productNumber) {
            isValid = false
          } else {
            // ตรวจสอบความซ้ำซ้อนของ productNumber
            if (productNumbers.has(formItem.productNumber)) {
              duplicateProductNumbers.push(formItem.productNumber)
              isValid = false
            } else {
              productNumbers.add(formItem.productNumber)
            }
          }

          if (!formItem.productNameEN) {
            isValid = false
          }

          if (!formItem.productNameTH) {
            isValid = false
          }

          if (formItem.qty === null || formItem.qty === undefined || formItem.qty === '') {
            isValid = false
          }

          if (formItem.price === null || formItem.price === undefined || formItem.price === '') {
            isValid = false
          }
        }
      }

      if (!isValid) {
        if (duplicateProductNumbers.length > 0) {
          // แสดงข้อความเตือนเฉพาะกรณีมีรหัสสินค้าซ้ำกัน
          warning(
            `กรุณาตรวจสอบรหัสสินค้าต่อไปนี้: ${duplicateProductNumbers.join(', ')}`,
            'พบรหัสสินค้าซ้ำกัน'
          )
        } else {
          // แสดงข้อความเตือนทั่วไปเมื่อข้อมูลไม่ครบถ้วน
          warning('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน')
        }
      }

      return isValid
    },

    updateSelection(newSelection) {
      this.selectedItems = newSelection
    },
    addMaterialItem(data) {
      data.push({
        type: '',
        qty: 1,
        qtyUnit: 'pc',
        weight: null,
        weightUnit: 'ct.',
        description: ''
      })
    },
    removeMaterialItem(data, item, index) {
      item.materials.splice(index, 1)
      this.updateTypeBarcode(data, item.stockReceiptNumber)
    },
    updateFile(files) {
      this.images = files
    },

    closeModal() {
      this.searchProductNameType = 'EN'
      this.isShow = { ...interfaceIsShow }
    },
    onSelectImage(e) {
      this.stockUpdate = { ...e }
      this.isShow.imageSelect = true
    },
    onSearchProductName(e, type) {
      this.stockUpdate = { ...e }
      this.searchProductNameType = type
      this.isShow.searchProductName = true
    },

    updateImage(image, stock) {
      this.isShow.imageSelect = false
      const stockArray = [{ ...stock }]
      this.updateStock(null, image, stockArray)
    },
    updateProductName(name, stock, mode, all) {
      this.searchProductNameType = 'EN'
      this.isShow.searchProductName = false
      name = {
        ...name,
        mode: mode
      }
      const stockArray = [{ ...stock }]
      this.updateStock(name, null, stockArray, all)
    },
    updateStock(data, image, stock, all = false) {
      if (all) {
        this.form.forEach((item) => {
          if (item.isReceipt) return

          if (image) {
            item.imageName = image.name
            item.imageYear = image.year
            item.imagePath = image.path
          }

          if (data) {
            if (data.text) {
              if (data.mode === 'EN') {
                item.productNameEN = data.text
              }
              if (data.mode === 'TH') {
                item.productNameTH = data.text
              }
            }
          }
        })
      } else {
        stock.forEach((item) => {
          const indexForm = this.form.findIndex(
            (x) => x.stockReceiptNumber === item.stockReceiptNumber
          )
          if (indexForm > -1) {
            if (image) {
              this.form[indexForm].imageName = image.name
              this.form[indexForm].imageYear = image.year
              this.form[indexForm].imagePath = image.path
            }

            if (data) {
              if (data.text) {
                if (data.mode === 'EN') {
                  this.form[indexForm].productNameEN = data.text
                }
                if (data.mode === 'TH') {
                  this.form[indexForm].productNameTH = data.text
                }
              }
            }

          }

          if (this.selectedItems.length > 0) {
            const indexSelect = this.selectedItems.findIndex(
              (x) => x.stockReceiptNumber === item.stockReceiptNumber
            )
            if (indexSelect > -1) {
              if (image) {
                this.selectedItems[indexForm].imageName = image.name
                this.selectedItems[indexForm].imageYear = image.year
                this.selectedItems[indexForm].imagePath = image.path
              }

              if (data) {
                if (data.text) {
                  if (data.mode === 'EN') {
                    this.selectedItems[indexForm].productNameEN = data.text
                  }
                  if (data.mode === 'TH') {
                    this.selectedItems[indexForm].productNameTH = data.text
                  }
                }
              }

            }
          }
        })
      }
    },

    updateTypeBarcode(item, index) {
      if (item.type === 'Diamond') {
        item.typeBarcode = this.getBarcode(item)
      }

      if (item.type === 'Gold' || item.type === 'Silver') {
        item.typeBarcode = this.getBarcode(item)
      }

      if (item.type === 'Gem') {
        item.typeBarcode = this.getBarcode(item)
      }

      this.updateFormBarcodeIndex(index)
    },

    updateFormBarcodeAll() {
      this.form.forEach((item) => {
        item.barcodeGems = []
        if (item.materials.length > 0) {
          item.materials.forEach((mat) => {
            if (mat.type === 'Gold' || mat.type === 'Silver') {
              item.barcodeGold = this.getBarcode(mat)
            }
            if (mat.type === 'Diamond') {
              let display = this.getBarcode(mat)
              item.barcodeGems.push(display)
            }
            if (mat.type === 'Gem') {
              let display = this.getBarcode(mat)
              item.barcodeGems.push(display)
            }
          })
        }
      })
    },
    updateFormBarcodeIndex(index) {
      const item = this.form.find((x) => x.stockReceiptNumber === index)
      if (item.materials.length > 0) {
        item.barcodeGems = []
        item.materials.forEach((mat) => {
          if (mat.type === 'Gold' || mat.type === 'Silver') {
            item.barcodeGold = this.getBarcode(mat)
          }

          if (mat.type === 'Diamond') {
            let display = this.getBarcode(mat)
            item.barcodeGems.push(display)
          }

          if (mat.type === 'Gem') {
            let display = this.getBarcode(mat)
            item.barcodeGems.push(display)
          }
        })
      } else {
        item.barcodeGold = ''
        item.barcodeGems = []
      }
    },
    getBarcode(item) {
      let display = ''

      if (item.type === 'Diamond') {
        display = `${item.qty ?? ''}${item.type ?? ''}${item.weight ?? ''}${
          item.weightUnit ? ` ${item.weightUnit}` : ''
        }${item.typeCode ? `, ${item.typeCode}` : ''}${item.size ? `, ${item.size}` : ''} ${
          item.region ? `, (${item.region})` : ''
        }`
      }

      if (item.type === 'Gold' || item.type === 'Silver') {
        display = `${item.weight ?? ``}${item.weightUnit ? ` ${item.weightUnit}` : ``}${
          item.type ? ` ${item.type}` : ``
        }`
      }

      if (item.type === 'Gem') {
        display = `${item.qty ?? ''}${item.typeCode ?? ''}${item.weight ?? ''}${
          item.weightUnit ? ` ${item.weightUnit}` : ``
        }${item.size ? `, ${item.size}` : ''}${item.region ? `, (${item.region})` : ''}`
      }

      return display
    },

    onSubmit(event) {
      var confirm = this.selectedItems.filter((item) => !item.isReceipt)
      if (!this.validateForm(confirm)) {
        event.preventDefault() // ป้องกันการส่งฟอร์ม
        return false
      }

      const formValue = {
        wo: this.data.wo,
        woNumber: this.data.woNumber,
        receiptNumber: this.data.receiptNumber,
        Stocks: [...confirm]
      }

      confirmSubmit('', 'ยืนยันการบันทึกข้อมูล?', async () => {
        this.fetchConfirm(formValue)
      })
    },

    onFetch() {
      this.fetchData(true)
    },
    async fetchData(skipLoading = false) {
      this.header = []
      this.gems = []
      this.form = []
      this.itemsToDisable = []
      this.itemsToPreSelect = []

      this.data = await this.receiptProductionStore.fetchDataGetPlan({
        formValue: this.param,
        skipLoading: skipLoading
      })

      this.header.push(this.data)

      if (this.data?.gems?.length > 0) {
        this.gems.push(this.data.gems)
      }
      this.form = this.data.stocks.map((item) => ({
        ...item, // copy ทุก property จาก receiptStocks

        productNameTH: item.productNameTH?.trim() || this.data.productName || '',
        productNameEN: item.productNameEN?.trim() || this.data.productName || '',

        moldDesign: item.moldDesign?.trim() || this.data.mold || '',
        price: 0,

        barcodeGold: '',
        barcodeGems: []
      }))

      this.itemsToDisable = this.form.filter((item) => item.isReceipt)
      this.itemsToPreSelect = this.form.filter((item) => item.isReceipt)

      //set barcode
      this.formBarcode.goldType = this.data.goldSize
      this.formBarcode.mold = this.data.mold

      this.formBarcode.type = this.data.type === 'Silver' ? 'silver' : 'gem'
      //this.formBarcode.goldType = this.data.gems

      //create barcode
      this.updateFormBarcodeAll()

    },
    async fetchDraft() {
      this.isOnDraft = true

      const formValue = {
        receiptNumber: this.data.receiptNumber,
        stocks: [...this.form]
      }

      const res = await this.receiptProductionStore.fetchCreateDraft({
        formValue: formValue
      })

      if (res) {
        this.isOnDraft = false
      }
    },
    async fetchConfirm(formValue) {
      this.res = []
      this.selectedItems = []
      const response = await this.receiptProductionStore.fetchConfirm({
        formValue: formValue
      })

      if (response) {
        this.res = [...response.stocks]
        await this.fetchData(true)
        this.isShow.barcodePrint = true
      }
    },

    onResPrint() {
      this.isShow.barcodePrint = true
    }
  },

  created() {
    this.$nextTick(async () => {
      this.param = {
        running: this.$route.params.id
      }
      this.fetchData()

      await this.masterStore.fetchGold()
      await this.masterStore.fetchGem()
      await this.masterStore.fetchDiamondGrade()
    })
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form';

.btn-input-group {
  height: 35px;
  padding: 6px 12px;
  margin-top: 5px !important;
}

.form-col-repeat-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
}

.custom-form-table {
  :deep(.p-datatable) {
    .p-datatable-tbody {
      > tr {
        // row ที่ถูก preselect
        &[data-p-selectable='false'] {
          background-color: #ffe2a3 !important;

          > td {
            background-color: #ffe2a3 !important;
          }
        }

        // row ที่ถูกเลือกปกติ
        &[data-p-highlight='true']:not([data-p-selectable='false']) {
          background-color: var(--base-warning) !important;

          > td {
            //background-color: #e0e0e0 !important;
            background-color: #e0e0e0 !important;
            color: var(--base-font-color);
          }
        }

        // expansion row ของ row ที่ถูกเลือกปกติ
        &[data-p-highlight='true']:not([data-p-selectable='false']) + .p-datatable-row-expansion {
          > td {
            background-color: #e0e0e0 !important;
          }
        }
      }
    }
  }
}
.input-group-prepend .btn,
.input-group-append .btn {
  position: relative;
  z-index: 0 !important;
}
</style>
