<template>
  <div class="app-container">
    <headerView :model="data" :modelHeader="header" :modelGem="gems" @onFetch="onFetch" />

    <div class="form-col-container mt-2">
      <form @submit.prevent="onSubmit">
        <ProductFormTable
          v-model:selectedItems="selectedItems"
          :form="form"
          :itemsToDisable="itemsToDisable"
          :itemsToPreSelect="itemsToPreSelect"
          :scrollHeight="scrollHeight"
          :columns="columns"
          :materialColumns="materialColumns"
          :formBarcode="formBarcode"
          :type="type"
          :masterStud="masterStud"
          :masterMaterialType="masterMaterialType"
          :masterGold="masterGold"
          :masterDiamondGrade="masterDiamondGrade"
          :masterGem="masterGem"
          :requiredStud="requiredStud"
          :isOnDraft="isOnDraft"
          :data="data"
          @searchProductName="onSearchProductName"
          @selectImage="onSelectImage"
          @addMaterial="addMaterialItem"
          @removeMaterial="removeMaterialItem"
          @updateTypeBarcode="updateTypeBarcode"
          @loadFromBreakdown="onLoadFromBreakdown"
          @editAllMaterials="onEditAllMaterials"
          @fetchDraft="fetchDraft"
          @submit="onSubmit"
          @adjustBreakdown="onAdjustBreakdown"
        />
      </form>
    </div>

    <modalSelectImage
      :isShow="isShow.imageSelect"
      :modelStock="stockUpdate"
      @select="updateImage"
      @closeModal="closeModal"
    />

    <modalBarcodePrint :isShow="isShow.barcodePrint" :modelStock="res" @closeModal="closeModal" />

    <modalSearchProductName
      :isShow="isShow.searchProductName"
      :modelStock="stockUpdate"
      :mode="searchProductNameType"
      @select="updateProductName"
      @closeModal="closeModal"
    />

    <modalEditAllMaterials
      :isShow="isShow.editAllMaterials"
      :selectedStocks="selectedItems"
      :breakdownData="data.breakDown || []"
      :masterMaterialType="masterMaterialType"
      :masterGold="masterGold"
      :masterDiamondGrade="masterDiamondGrade"
      :masterGem="masterGem"
      @saveMaterials="applyMaterialsToAll"
      @closeModal="closeModal"
    />

    <modalAdjustBreakdown
      :isShow="isShow.adjustBreakdown"
      :planData="data"
      :breakdownData="data.breakDown || []"
      :stockList="form"
      :masterMaterialType="masterMaterialType"
      :masterGold="masterGold"
      :masterDiamondGrade="masterDiamondGrade"
      :masterGem="masterGem"
      @applyBreakdown="onApplyBreakdown"
      @saveDraft="onSaveBreakdownDraft"
      @closeModal="closeModal"
    />
  </div>
</template>

<script>
import { useReceiptProductionApiStore } from '@/stores/modules/api/receipt/receipt-production-api.js'
import api from '@/axios/axios-helper.js'
import swAlert from '@/services/alert/sweetAlerts.js'
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'
import { getAzureBlobUrl } from '@/config/azure-storage-config.js'

import headerView from './components/production-header-view.vue'
import ProductFormTable from './components/product-form-table.vue'
import modalSelectImage from './modal/image-select-view.vue'
import modalBarcodePrint from './modal/barcode-print-view.vue'
import modalSearchProductName from './modal/search-product-name-view.vue'
import modalEditAllMaterials from './modal/edit-all-materials-view.vue'
import modalAdjustBreakdown from './modal/adjust-breakdown-view.vue'

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
  searchProductName: false,
  editAllMaterials: false,
  adjustBreakdown: false
}

export default {
  name: 'ProductionPlanList',

  components: {
    headerView,
    ProductFormTable,
    modalSelectImage,
    modalBarcodePrint,
    modalSearchProductName,
    modalEditAllMaterials,
    modalAdjustBreakdown
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
    requiredStud() {
      const res = this.data.productType === 'ES'
      console.log('requiredStud', res)
      return res
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

      imgTest: {
        type: 'MOLD',
        imageName: 'JEWELRY-001'
      },

      selectedItems: [],
      itemsToDisable: [],
      itemsToPreSelect: [],
      masterMaterialType: [
        { value: 'Gold', description: 'Gold' },
        //{ value: 'Silver', description: 'Silver' },
        //{ value: 'Diamond', description: 'Diamond' },
        { value: 'Gem', description: 'Gem ' },
        { value: 'Worker', description: 'Worker ' },
        { value: 'Setting', description: 'Setting ' },
        { value: 'ETC', description: 'ETC ' }
      ],
      masterStud: [
        { value: 'lg', description: 'แป้นใหญ่' },
        { value: 'md', description: 'แป้นกลาง' },
        { value: 'sm', description: 'แป้นเล็ก' }
      ],

      columns: [
        {
          field: 'no',
          header: 'ลำดับ',
          sortable: false,
          width: '50px'
        },
        {
          field: 'stockReceiptNumber',
          header: 'เลขที่ตั้งรับ',
          sortable: false,
          minWidth: '140px'
        },
        {
          field: 'stockNumber',
          header: 'เลขที่ผลิต',
          sortable: false,
          minWidth: '140px'
        },
        {
          field: 'productNumber',
          header: 'รหัสสินค้า',
          sortable: false,
          minWidth: '140px'
        },
        {
          field: 'moldDesign',
          header: 'เเม่พิมพ์',
          sortable: false,
          minWidth: '120px'
        },
        {
          field: 'productNameEn',
          header: 'ชื่อสินค้า EN',
          sortable: false,
          minWidth: '150px'
        },
        {
          field: 'productNameTh',
          header: 'ชื่อสินค้า TH',
          sortable: false,
          minWidth: '150px'
        }
      ],
      materialColumns: [
        {
          field: 'type',
          header: 'ประเภท',
          sortable: false,
          width: '120px'
        },
        {
          field: 'typeName',
          header: 'ชื่อวัสดุ',
          sortable: false,
          //width: '180px'
        },
        {
          field: 'typeCode',
          header: 'รหัส/เกรด',
          sortable: false,
          width: '130px'
        },
        {
          field: 'qty',
          header: 'จำนวน',
          sortable: false,
          width: '150px',
          align: 'center'
        },
        {
          field: 'priceQty',
          header: 'ราคา/หน่วย',
          sortable: false,
          width: '120px',
          align: 'center'
        },
        {
          field: 'qtyWeight',
          header: 'น้ำหนัก',
          sortable: false,
          width: '150px',
          align: 'center'
        },
        {
          field: 'priceWeight',
          header: 'ราคา/น้ำหนัก',
          sortable: false,
          width: '120px',
          align: 'center'
        },
        {
          field: 'totalPrice',
          header: 'รวมราคา',
          sortable: false,
          width: '150px',
          align: 'right',
          format: 'decimal2'
        },
        {
          field: 'size',
          header: 'ขนาด',
          sortable: false,
          width: '100px'
        },
        {
          field: 'region',
          header: 'แหล่งที่มา',
          sortable: false,
          width: '100px'
        },
        // {
        //   field: 'typeBarcode',
        //   header: 'Barcode',
        //   sortable: false,
        //   width: '150px'
        // },
        {
          field: 'action',
          header: 'จัดการ',
          sortable: false,
          width: '10px',
          align: 'center'
        }
      ],

      btnClearImg: null,
      images: [],

      formBarcode: { ...interfaceBarcode }
    }
  },

  methods: {
    setBtnClearRef(ref) {
      this.btnClearImg = ref
    },

    checkItemSelectedLength() {
      if (this.selectedItems.length > 0) {
        return this.selectedItems.length
      }
      return 0
    },

    validateForm(formValue) {
      let isValid = true
      const productNumbers = new Set()
      let duplicateProductNumbers = []

      for (const item of formValue) {
        const formItem = this.form.find((f) => f.stockReceiptNumber === item.stockReceiptNumber)

        if (formItem && !formItem.isReceipt) {
          if (!formItem.productNumber) {
            isValid = false
          } else {
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
          swAlert.warning(
            'พบรหัสสินค้าซ้ำกัน',
            `กรุณาตรวจสอบรหัสสินค้าต่อไปนี้: ${duplicateProductNumbers.join(', ')}`,
            () => {
              console.log('swAlert.warning - duplicate productNumber')
            }
          )
        } else {
          swAlert.warning('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน', '', () => {
            console.log('swAlert.warning')
          })
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
        console.log('updateProductName all')
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
              console.log('updateStock data', data)
              if (data.text) {
                if (data.mode === 'EN') {
                  this.form[indexForm].productNameEN = data.text
                }
                if (data.mode === 'TH') {
                  this.form[indexForm].productNameTH = data.text
                }
              }
            }

            console.log('updateStock form index update', this.form[indexForm])
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

              console.log('updateStock selectedItems index update', this.selectedItems[indexSelect])
            }
          }
        })
      }
    },

    updateTypeBarcode(item, index) {
      console.log('updateTypeBarcode', item, index)
      // Check if item exists
      if (!item) {
        console.warn('No item provided to updateTypeBarcode')
        return
      }

      // Check if index (stockReceiptNumber) exists
      if (!index) {
        console.warn('No index (stockReceiptNumber) provided to updateTypeBarcode')
        return
      }

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

      // Check if item exists before accessing its properties
      if (!item) {
        console.warn('No item found with stockReceiptNumber:', index)
        return
      }

      // Initialize barcode properties if they don't exist
      if (!item.barcodeGems) {
        item.barcodeGems = []
      }
      if (!item.barcodeGold) {
        item.barcodeGold = ''
      }

      if (item.materials && item.materials.length > 0) {
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
        display = `${item.qty ?? ''}${item.type ?? ''}${item.qtyWeight ?? ''}${
          item.qtyWeightUnit ? ` ${item.qtyWeightUnit}` : ''
        }${item.typeCode ? `, ${item.typeCode}` : ''}${item.size ? `, ${item.size}` : ''} ${
          item.region ? `, (${item.region})` : ''
        }`
      }

      if (item.type === 'Gold' || item.type === 'Silver') {
        display = `${item.qtyWeight ?? ``}${item.qtyWeightUnit ? ` ${item.qtyWeightUnit}` : ``}${
          item.type ? ` ${item.type}` : ``
        }`
      }

      if (item.type === 'Gem') {
        display = `${item.qty ?? ''}${item.typeCode ?? ''}${item.qtyWeight ?? ''}${
          item.qtyWeightUnit ? ` ${item.qtyWeightUnit}` : ``
        }${item.size ? `, ${item.size}` : ''}${item.region ? `, (${item.region})` : ''}`
      }

      return display
    },

    onSubmit(event) {
      var confirm = this.selectedItems.filter((item) => !item.isReceipt)
      if (!this.validateForm(confirm)) {
        event.preventDefault()
        return false
      }

      const formValue = {
        wo: this.data.wo,
        woNumber: this.data.woNumber,
        receiptNumber: this.data.receiptNumber,
        Stocks: [...confirm]
      }

      swAlert.confirmSubmit('', 'ยืนยันการบันทึกข้อมูล?', async () => {
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
        ...item,
        productNameTH: item.productNameTH?.trim() || this.data.productName || '',
        productNameEN: item.productNameEN?.trim() || this.data.productName || '',
        moldDesign: item.moldDesign?.trim() || this.data.mold || '',
        price: 0,
        barcodeGold: '',
        barcodeGems: []
      }))

      this.itemsToDisable = this.form.filter((item) => item.isReceipt)
      this.itemsToPreSelect = this.form.filter((item) => item.isReceipt)

      this.formBarcode.goldType = this.data.goldSize
      this.formBarcode.mold = this.data.mold

      console.log(this.data.type)
      this.formBarcode.type = this.data.type === 'Silver' ? 'silver' : 'gem'
      console.log(this.formBarcode.type)

      this.updateFormBarcodeAll()
    },

    async fetchDraft() {
      try {
        this.isOnDraft = true

        const formValue = {
          receiptNumber: this.data.receiptNumber,
          stocks: [...this.form]
        }
        console.log('fetchDraft', formValue)

        const res = await this.receiptProductionStore.fetchCreateDraft({
          formValue: formValue
        })

        if (res) {
          this.isOnDraft = false
        }
      } catch (error) {
        console.log(error)
        this.isOnDraft = false
      }
    },

    async fetchImageData() {
      try {
        switch (this.imgTest.type) {
          case 'MOLD':
            {
              // Build Azure Blob URL for mold image
              const blobPath = `Mold/${this.imgTest.imageName}-Mold.png`
              this.urlImage = getAzureBlobUrl(blobPath)
            }
            break
        }
      } catch (error) {
        console.log(error)
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

        console.log('fetchConfirm', response)
        this.isShow.barcodePrint = true
      }
    },

    onResPrint() {
      this.isShow.barcodePrint = true
    },

    // New material management methods
    onEditAllMaterials() {
      if (this.selectedItems.length === 0) {
        swAlert.warning(
          'กรุณาเลือกสินค้าก่อน',
          'ต้องเลือกสินค้าอย่างน้อย 1 รายการเพื่อแก้ไขวัสดุ',
          () => {
            console.log('No items selected for material editing')
          }
        )
        return
      }
      this.isShow.editAllMaterials = true
    },

    onLoadFromBreakdown(stockReceiptNumber) {
      if (!this.data.breakDown || this.data.breakDown.length === 0) {
        swAlert.warning('ไม่พบข้อมูล Breakdown', 'ไม่มีข้อมูลวัสดุจาก Breakdown ให้โหลด', () => {
          console.log('No breakdown data available')
        })
        return
      }

      // Find the specific stock item
      const stockIndex = this.form.findIndex((x) => x.stockReceiptNumber === stockReceiptNumber)
      if (stockIndex > -1) {
        // Load breakdown materials into this stock's materials array
        this.form[stockIndex].materials = this.data.breakDown.map((material) => ({
          type: material.type,
          typeName: material.typeName,
          typeNameDescription: material.typeNameDescription,
          typeCode: material.typeCode,
          typeCodeName: material.typeCodeName,
          typeBarcode: material.typeBarcode || this.getBarcode(material),
          qty: material.qty || 0,
          qtyUnit: material.qtyUnit || 'pc',
          qtyPrice: material.qtyPrice || 0,
          weight: material.qtyWeight || 0, // Map qtyWeight to weight for compatibility
          weightUnit: material.qtyWeightUnit || 'g',
          qtyWeight: material.qtyWeight || 0,
          qtyWeightUnit: material.qtyWeightUnit || 'g',
          qtyWeightPrice: material.qtyWeightPrice || 0,
          size: '', // Not in breakdown, keep empty
          region: material.region || '',
          price: 0, // Individual item price, different from material price
          isOrigin: material.isOrigin || false
        }))

        // Update barcode for this stock
        this.updateFormBarcodeIndex(stockReceiptNumber)

        swAlert.success(
          'โหลดข้อมูลสำเร็จ',
          `โหลดวัสดุจาก Breakdown เรียบร้อยแล้ว (${this.data.breakDown.length} รายการ)`,
          () => {
            console.log('Breakdown materials loaded successfully')
          }
        )
      }
    },

    applyMaterialsToAll({ materials, selectedStocks }) {
      selectedStocks.forEach((selectedStock) => {
        const stockIndex = this.form.findIndex(
          (x) => x.stockReceiptNumber === selectedStock.stockReceiptNumber
        )
        if (stockIndex > -1) {
          // Deep copy materials to avoid reference issues
          this.form[stockIndex].materials = JSON.parse(JSON.stringify(materials))

          // Update barcode for this stock
          this.updateFormBarcodeIndex(selectedStock.stockReceiptNumber)
        }
      })

      swAlert.success(
        'อัปเดตสำเร็จ',
        `อัปเดตวัสดุสำหรับสินค้า ${selectedStocks.length} รายการเรียบร้อยแล้ว`,
        () => {
          console.log('Materials updated for all selected stocks')
        }
      )
    },

    // Adjust breakdown modal methods
    onAdjustBreakdown() {
      this.isShow.adjustBreakdown = true
    },

    onApplyBreakdown({ breakdown, stockNumbers }) {
      // Apply the adjusted breakdown to selected stocks
      stockNumbers.forEach((stockNumber) => {
        const stockIndex = this.form.findIndex((x) => x.stockReceiptNumber === stockNumber)
        if (stockIndex > -1) {
          // Convert breakdown materials to stock materials format
          this.form[stockIndex].materials = breakdown.map((material) => ({
            type: material.type,
            typeName: material.typeName,
            typeNameDescription: material.typeNameDescription,
            typeCode: material.typeCode,
            typeCodeName: material.typeCodeName,
            typeBarcode: material.typeBarcode || this.getBarcode(material),
            qty: material.qty || 0,
            qtyUnit: material.qtyUnit || 'pc',
            qtyPrice: material.qtyPrice || 0,
            weight: material.weight || 0,
            weightUnit: material.weightUnit || 'g',
            qtyWeight: material.qtyWeight || 0,
            qtyWeightUnit: material.qtyWeightUnit || 'g',
            qtyWeightPrice: material.qtyWeightPrice || 0,
            size: '', // Not applicable for breakdown materials
            region: material.region || '',
            price: 0, // Individual item price, different from breakdown price
            isOrigin: material.isOrigin || false
          }))

          // Update barcode for this stock
          this.updateFormBarcodeIndex(stockNumber)
        }
      })

      console.log('Breakdown applied to stocks:', stockNumbers)
    },

    onSaveBreakdownDraft({ breakdown }) {
      // Update the data breakdown with the new breakdown
      this.data.breakDown = breakdown
      console.log('Breakdown draft saved:', breakdown)
    }
  },

  created() {
    this.$nextTick(async () => {
      this.param = {
        running: this.$route.params.id
      }
      this.fetchData()

      this.fetchImageData()

      await this.masterStore.fetchGold()
      await this.masterStore.fetchGem()
      await this.masterStore.fetchDiamondGrade()
    })
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form';

.form-control {
  font-size: 50px;
}
.form-col-fix-col-container {
  display: grid;
  gap: 10px;
  padding: 0px;
  grid-template-columns: 1fr 2fr 1fr 1fr 1fr 1fr 2fr 1fr;
}
.form-col-fix-group-col-container {
  display: grid;
  gap: 10px;
  padding: 0px;
  grid-template-columns: 2fr 1fr;
}

.form-col-fix-2-container {
  display: grid;
  padding: 0px;
  grid-template-columns: 4fr 2fr;
}

.form-col-repeat-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
}

.filter-container-img {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  border: 2px dashed #dddddd;
  border-radius: 8px;
  background-color: #f8f9fa;
  transition: all 0.3s ease;

  &:hover {
    border-color: #adb5bd;
  }

  .image-preview {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: white;
    border-radius: 4px;
  }

  .image-controls {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      transform: translateY(-1px);
    }
  }
}

.image-body {
  border: 1px solid var(--base-color);
}

.field-error {
  border-color: red !important;
  background-color: #ffeeee !important;
}

.input-group-prepend .btn,
.input-group-append .btn {
  position: relative;
  z-index: 0 !important;
}

.group-title {
  display: flex;
  flex-direction: column;
}
</style>
