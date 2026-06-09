<template>
  <div class="app-container">
    <!-- Page Header -->
    <div class="page-header-bar">
      <button
        class="btn-back"
        type="button"
        title="กลับ"
        @click="$router.push({ name: 'goods-receipt-outsource' })"
      >
        <i class="bi bi-arrow-left"></i>
      </button>
      <h2 class="page-title">รับสินค้างานนอก</h2>
    </div>

    <!-- Vendor Header -->
    <outsourceHeader
      v-model:vendor="vendor"
      v-model:poNumber="poNumber"
    />

    <!-- Product Table -->
    <form @submit.prevent="onSubmit">
      <ProductFormTable
        :form="form"
        :columns="columns"
        :materialColumns="materialColumns"
        :masterProductType="masterProductType"
        :masterGold="masterGold"
        :masterGoldSize="masterGoldSize"
        :masterMaterialType="masterMaterialType"
        :masterDiamondGrade="masterDiamondGrade"
        :masterGem="masterGem"
        :masterStud="masterStud"
        @addRow="addRow"
        @removeRow="removeRow"
        @searchProductName="onSearchProductName"
        @selectImage="onSelectImage"
        @addMaterial="addMaterialItem"
        @removeMaterial="removeMaterialItem"
        @updateTypeBarcode="updateTypeBarcode"
        @editAllMaterials="onEditAllMaterials"
      />
    </form>

    <!-- Modals (reuse from new-gr-production) -->
    <modalSelectImage
      :isShow="isShow.imageSelect"
      :modelStock="stockUpdate"
      @select="updateImage"
      @closeModal="closeModal"
    />

    <modalBarcodePrint
      :isShow="isShow.barcodePrint"
      :modelStock="res"
      @closeModal="closeModal"
    />

    <modalSearchProductName
      :isShow="isShow.searchProductName"
      :modelStock="stockUpdate"
      :mode="searchProductNameType"
      @select="updateProductName"
      @closeModal="closeModal"
    />

    <modalEditAllMaterials
      :isShow="isShow.editAllMaterials"
      :selectedStocks="form"
      :breakdownData="[]"
      :masterMaterialType="masterMaterialType"
      :masterGold="masterGold"
      :masterDiamondGrade="masterDiamondGrade"
      :masterGem="masterGem"
      @saveMaterials="applyMaterialsToAll"
      @closeModal="closeModal"
    />
  </div>
</template>

<script>
import { useReceiptOutsourceApiStore } from '@/stores/modules/api/receipt/receipt-outsource-api.js'
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'
import swAlert from '@/services/alert/sweetAlerts.js'

import outsourceHeader from './components/outsource-header-view.vue'
import ProductFormTable from './components/product-form-table.vue'
import modalSelectImage from '../new-gr-production/modal/image-select-view.vue'
import modalBarcodePrint from '../new-gr-production/modal/barcode-print-view.vue'
import modalSearchProductName from '../new-gr-production/modal/search-product-name-view.vue'
import modalEditAllMaterials from '../new-gr-production/modal/edit-all-materials-view.vue'

const interfaceIsShow = {
  imageSelect: false,
  barcodePrint: false,
  searchProductName: false,
  editAllMaterials: false
}

let rowCounter = 0

export default {
  name: 'NewGrOutsource',

  components: {
    outsourceHeader,
    ProductFormTable,
    modalSelectImage,
    modalBarcodePrint,
    modalSearchProductName,
    modalEditAllMaterials
  },

  setup() {
    const receiptOutsourceStore = useReceiptOutsourceApiStore()
    const masterStore = useMasterApiStore()
    return { receiptOutsourceStore, masterStore }
  },

  computed: {
    masterProductType() {
      return this.masterStore.productType
    },
    masterGold() {
      return this.masterStore.gold
    },
    masterGoldSize() {
      return this.masterStore.goldSize
    },
    masterGem() {
      return this.masterStore.gem
    },
    masterDiamondGrade() {
      return this.masterStore.diamondGrade
    }
  },

  data() {
    return {
      vendor: '',
      poNumber: '',
      form: [],
      res: [],
      stockUpdate: {},
      searchProductNameType: 'EN',
      isShow: { ...interfaceIsShow },

      masterMaterialType: [
        { value: 'Gold', description: 'Gold' },
        { value: 'Gem', description: 'Gem' },
        { value: 'Worker', description: 'Worker' },
        { value: 'Setting', description: 'Setting' },
        { value: 'ETC', description: 'ETC' }
      ],
      masterStud: [
        { value: 'lg', description: 'แป้นใหญ่' },
        { value: 'md', description: 'แป้นกลาง' },
        { value: 'sm', description: 'แป้นเล็ก' }
      ],

      columns: [
        { field: 'no', header: 'ลำดับ', sortable: false, width: '50px' },
        { field: 'productNumber', header: 'รหัสสินค้า', sortable: false, minWidth: '140px' },
        { field: 'moldDesign', header: 'แม่พิมพ์', sortable: false, minWidth: '120px' },
        { field: 'productNameEN', header: 'ชื่อสินค้า EN', sortable: false, minWidth: '180px' },
        { field: 'productNameTH', header: 'ชื่อสินค้า TH', sortable: false, minWidth: '180px' },
        { field: 'productType', header: 'ประเภทสินค้า', sortable: false, minWidth: '130px' },
        { field: 'productionType', header: 'สีทอง', sortable: false, minWidth: '120px' },
        { field: 'productionTypeSize', header: 'ขนาดทอง', sortable: false, minWidth: '120px' },
        { field: 'action', header: '', sortable: false, width: '60px', align: 'center' }
      ],

      materialColumns: [
        { field: 'type', header: 'ประเภท', sortable: false, width: '120px' },
        { field: 'typeName', header: 'ชื่อวัสดุ', sortable: false },
        { field: 'typeCode', header: 'รหัส/เกรด', sortable: false, width: '130px' },
        { field: 'qty', header: 'จำนวน', sortable: false, width: '150px', align: 'center' },
        { field: 'priceQty', header: 'ราคา/หน่วย', sortable: false, width: '120px', align: 'center' },
        { field: 'qtyWeight', header: 'น้ำหนัก', sortable: false, width: '150px', align: 'center' },
        { field: 'priceWeight', header: 'ราคา/น้ำหนัก', sortable: false, width: '120px', align: 'center' },
        { field: 'totalPrice', header: 'รวมราคา', sortable: false, width: '150px', align: 'right', format: 'decimal2' },
        { field: 'size', header: 'ขนาด', sortable: false, width: '100px' },
        { field: 'region', header: 'แหล่งที่มา', sortable: false, width: '100px' },
        { field: 'action', header: 'จัดการ', sortable: false, width: '10px', align: 'center' }
      ]
    }
  },

  methods: {
    createEmptyRow() {
      rowCounter++
      return {
        dataKey: `tmp-${rowCounter}`,
        productNumber: '',
        productNameTH: '',
        productNameEN: '',
        moldDesign: '',
        productType: null,
        productionType: null,
        productionTypeSize: null,
        qty: null,
        price: null,
        size: '',
        studEarring: null,
        location: 'MAIN',
        imageName: null,
        imagePath: null,
        remark: '',
        materials: []
      }
    },

    addRow() {
      this.form.push(this.createEmptyRow())
    },

    removeRow(dataKey) {
      const index = this.form.findIndex((x) => x.dataKey === dataKey)
      if (index > -1) {
        this.form.splice(index, 1)
      }
    },

    validateForm() {
      const productNumbers = new Set()
      const duplicates = []

      for (const item of this.form) {
        if (!item.productNumber || !item.productNameTH || !item.productNameEN) {
          swAlert.warning('กรุณากรอกรหัสสินค้า ชื่อสินค้า EN และชื่อสินค้า TH ให้ครบถ้วน', 'ข้อมูลไม่ครบถ้วน')
          return false
        }

        if (item.qty === null || item.qty === undefined || item.qty === '') {
          swAlert.warning('กรุณากรอกจำนวนสินค้าให้ครบถ้วน', 'ข้อมูลไม่ครบถ้วน')
          return false
        }

        if (item.price === null || item.price === undefined || item.price === '') {
          swAlert.warning('กรุณากรอกราคาสินค้าให้ครบถ้วน', 'ข้อมูลไม่ครบถ้วน')
          return false
        }

        if (['G', 'B', 'R', 'N'].includes(item.productType) && !item.size) {
          swAlert.warning('กรุณากรอกขนาดสินค้า สำหรับประเภทสินค้าที่เลือก', 'ข้อมูลไม่ครบถ้วน')
          return false
        }

        if (item.productType === 'ES' && !item.studEarring) {
          swAlert.warning('กรุณาเลือกแป้นต่างหู สำหรับประเภทสินค้า ES', 'ข้อมูลไม่ครบถ้วน')
          return false
        }

        if (productNumbers.has(item.productNumber)) {
          duplicates.push(item.productNumber)
        } else {
          productNumbers.add(item.productNumber)
        }
      }

      if (duplicates.length > 0) {
        swAlert.warning(
          `พบรหัสสินค้าซ้ำกัน: ${duplicates.join(', ')}`,
          'ข้อมูลซ้ำกัน'
        )
        return false
      }

      return true
    },

    onSubmit() {
      if (!this.vendor) {
        swAlert.warning('กรุณากรอกชื่อผู้ขาย / ร้านงานนอก', 'ข้อมูลไม่ครบถ้วน')
        return
      }

      if (this.form.length === 0) {
        swAlert.warning('กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ', 'ข้อมูลไม่ครบถ้วน')
        return
      }

      if (!this.validateForm()) return

      const payload = {
        vendor: this.vendor,
        poNumber: this.poNumber || null,
        stocks: this.form.map((item) => ({
          productNumber: item.productNumber,
          productNameTH: item.productNameTH,
          productNameEN: item.productNameEN,
          moldDesign: item.moldDesign || null,
          productType: item.productType || null,
          productionType: item.productionType || null,
          productionTypeSize: item.productionTypeSize || null,
          qty: item.qty,
          price: item.price,
          size: item.size || null,
          studEarring: item.studEarring || null,
          location: item.location || 'MAIN',
          imageName: item.imageName || null,
          imagePath: item.imagePath || null,
          remark: item.remark || null,
          materials: item.materials || []
        }))
      }

      swAlert.confirmSubmit('', 'ยืนยันการบันทึกข้อมูล?', async () => {
        await this.fetchConfirm(payload)
      })
    },

    async fetchConfirm(payload) {
      this.res = []
      const response = await this.receiptOutsourceStore.fetchConfirm(payload)

      if (response) {
        this.res = [...(response.stocks || [])]
        this.form = []
        this.vendor = ''
        this.poNumber = ''
        swAlert.success('บันทึกสินค้างานนอกสำเร็จ')
        this.isShow.barcodePrint = true
      }
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
      const index = this.form.findIndex((x) => x.dataKey === stock.dataKey)
      if (index > -1) {
        this.form[index].imageName = image.name
        this.form[index].imagePath = image.path
      }
    },

    updateProductName(name, stock, mode, all) {
      this.searchProductNameType = 'EN'
      this.isShow.searchProductName = false

      if (all) {
        this.form.forEach((item) => {
          if (name?.text) {
            if (mode === 'EN') item.productNameEN = name.text
            if (mode === 'TH') item.productNameTH = name.text
          }
        })
      } else {
        const index = this.form.findIndex((x) => x.dataKey === stock.dataKey)
        if (index > -1 && name?.text) {
          if (mode === 'EN') this.form[index].productNameEN = name.text
          if (mode === 'TH') this.form[index].productNameTH = name.text
        }
      }
    },

    addMaterialItem(materialsArr) {
      materialsArr.push({
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
    },

    updateTypeBarcode(item) {
      console.log('updateTypeBarcode', item)
    },

    onEditAllMaterials() {
      this.isShow.editAllMaterials = true
    },

    applyMaterialsToAll({ materials }) {
      this.form.forEach((item) => {
        item.materials = JSON.parse(JSON.stringify(materials))
      })
      swAlert.success(`อัปเดตวัสดุสำหรับสินค้า ${this.form.length} รายการเรียบร้อยแล้ว`, 'อัปเดตสำเร็จ')
    }
  },

  created() {
    this.$nextTick(async () => {
      await this.masterStore.fetchProductType()
      await this.masterStore.fetchGold()
      await this.masterStore.fetchGoldSize()
      await this.masterStore.fetchGem()
      await this.masterStore.fetchDiamondGrade()
    })
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';

.page-header-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #ffffff;
  border-radius: 8px;
  border-bottom: 2px solid var(--base-font-color);
  box-shadow: rgba(0, 0, 0, 0.06) 0 2px 8px;
  margin-bottom: 16px;
}

.btn-back {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--base-font-color);
  color: var(--base-font-color);
  background: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  transition: all 0.2s;

  &:hover {
    background: var(--base-font-color);
    color: #ffffff;
  }
}

.page-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--base-font-color);
}
</style>
