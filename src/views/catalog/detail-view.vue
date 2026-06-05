<template>
  <div class="app-container">
    <div class="detail-header">
      <div class="detail-header-left">
        <button class="btn btn-sm btn-outline-main" @click="$router.back()">
          <i class="bi bi-arrow-left"></i> กลับ
        </button>
        <div class="catalog-info ml-3">
          <h5 class="mb-0">
            <span class="text-muted mr-2">{{ catalog.code }}</span>
            {{ catalog.nameTh }}
            <span v-if="catalog.nameEn" class="text-muted ml-2">/ {{ catalog.nameEn }}</span>
          </h5>
          <small class="text-muted">
            {{ catalog.headerLabel }}
            <span v-if="catalog.collectionTitle"> — {{ catalog.collectionTitle }}</span>
          </small>
        </div>
      </div>
      <div class="detail-header-actions">
        <button class="btn btn-sm btn-green mr-2" @click="onAddProducts">
          <i class="bi bi-plus-lg"></i> เพิ่มสินค้า
        </button>
        <button class="btn btn-sm btn-main mr-2" @click="onSaveItemsOrder">
          <i class="bi bi-save"></i> บันทึกลำดับ/Dimensions
        </button>
        <button class="btn btn-sm btn-outline-main" @click="onGeneratePdf">
          <i class="bi bi-file-pdf"></i> สร้าง PDF
        </button>
      </div>
    </div>

    <div class="mt-3">
      <BaseDataTable
        :items="items"
        :totalRecords="items.length"
        :columns="columns"
        :paginator="false"
        scrollHeight="calc(100vh - 340px)"
      >
        <template #actionsTemplate="{ data: rowData }">
          <div class="btn-action-container">
            <button
              class="btn btn-sm btn-green"
              title="จัดการรูป"
              @click="onManageImage(rowData)"
            >
              <i class="bi bi-images"></i>
            </button>
            <button
              class="btn btn-sm btn-red ml-2"
              title="ลบออกจาก catalog"
              @click="onRemoveItem(rowData)"
            >
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </template>

        <template #sortOrderTemplate="{ data: rowData, index }">
          <div class="sort-order-cell">
            <button
              class="btn btn-sm btn-outline-main"
              :disabled="index === 0"
              @click="moveItemUp(index)"
              title="เลื่อนขึ้น"
            >
              <i class="bi bi-chevron-up"></i>
            </button>
            <input
              type="number"
              class="form-control form-control-sm sort-input"
              v-model.number="rowData.sortOrder"
              min="1"
            />
            <button
              class="btn btn-sm btn-outline-main"
              :disabled="index === items.length - 1"
              @click="moveItemDown(index)"
              title="เลื่อนลง"
            >
              <i class="bi bi-chevron-down"></i>
            </button>
          </div>
        </template>

        <template #productNameTemplate="{ data: rowData }">
          <span>{{ getProductName(rowData.productNumber) }}</span>
        </template>

        <template #dimension1Template="{ data: rowData }">
          <input
            type="text"
            class="form-control form-control-sm"
            v-model="rowData.dimension1"
            placeholder="—"
          />
        </template>

        <template #dimension2Template="{ data: rowData }">
          <input
            type="text"
            class="form-control form-control-sm"
            v-model="rowData.dimension2"
            placeholder="—"
          />
        </template>

        <template #dimension3Template="{ data: rowData }">
          <input
            type="text"
            class="form-control form-control-sm"
            v-model="rowData.dimension3"
            placeholder="—"
          />
        </template>
      </BaseDataTable>
    </div>

    <productPickerModal
      :isShow="isShow.productPicker"
      :catalogId="catalogId"
      @closeModal="onCloseProductPicker"
    ></productPickerModal>

    <catalogImageModal
      :isShow="isShow.catalogImage"
      :productCode="selectedProductCode"
      @closeModal="onCloseCatalogImage"
    ></catalogImageModal>
  </div>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

import { useCatalogStore } from '@/stores/modules/api/catalog-store.js'
import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'
import swAlert from '@/services/alert/sweetAlerts.js'
import { ProductCatalogPdfBuilder } from '@/services/helper/pdf/product-catalog/product-catalog-pdf-builder.js'

import productPickerModal from './modal/product-picker-modal.vue'
import catalogImageModal from './modal/catalog-image-modal.vue'

const interfaceIsShow = {
  productPicker: false,
  catalogImage: false
}

export default {
  components: {
    BaseDataTable,
    productPickerModal,
    catalogImageModal
  },

  setup() {
    const catalogStore = useCatalogStore()
    const productStore = usrStockProductApiStore()
    const masterStore = useMasterApiStore()
    return { catalogStore, productStore, masterStore }
  },

  data() {
    return {
      catalogId: null,
      catalog: {},
      items: [],
      productNameMap: {},

      isShow: { ...interfaceIsShow },
      selectedProductCode: '',

      columns: [
        {
          field: 'actions',
          header: '',
          sortable: false,
          width: '100px'
        },
        {
          field: 'sortOrder',
          header: 'ลำดับ',
          sortable: false,
          width: '120px'
        },
        {
          field: 'productNumber',
          header: 'รหัสสินค้า',
          sortable: false,
          minWidth: '130px'
        },
        {
          field: 'productName',
          header: 'ชื่อสินค้า',
          sortable: false,
          minWidth: '180px'
        },
        {
          field: 'dimension1',
          header: 'Dimension 1',
          sortable: false,
          width: '130px'
        },
        {
          field: 'dimension2',
          header: 'Dimension 2',
          sortable: false,
          width: '130px'
        },
        {
          field: 'dimension3',
          header: 'Dimension 3',
          sortable: false,
          width: '130px'
        }
      ]
    }
  },

  methods: {
    getProductName(productNumber) {
      return this.productNameMap[productNumber] || productNumber
    },

    moveItemUp(index) {
      if (index === 0) return
      const arr = [...this.items]
      const temp = arr[index]
      arr[index] = arr[index - 1]
      arr[index - 1] = temp
      this.recalcSortOrder(arr)
      this.items = arr
    },

    moveItemDown(index) {
      if (index === this.items.length - 1) return
      const arr = [...this.items]
      const temp = arr[index]
      arr[index] = arr[index + 1]
      arr[index + 1] = temp
      this.recalcSortOrder(arr)
      this.items = arr
    },

    recalcSortOrder(arr) {
      arr.forEach((item, idx) => {
        item.sortOrder = idx + 1
      })
    },

    onManageImage(rowData) {
      this.selectedProductCode = rowData.productNumber
      this.isShow.catalogImage = true
    },

    onCloseCatalogImage() {
      this.isShow = { ...interfaceIsShow }
      this.selectedProductCode = ''
    },

    onAddProducts() {
      this.isShow.productPicker = true
    },

    onCloseProductPicker(event) {
      this.isShow = { ...interfaceIsShow }
      if (event === 'fetch') {
        this.fetchCatalog()
      }
    },

    onRemoveItem(rowData) {
      swAlert.confirmSubmit(
        `${rowData.productNumber}`,
        'ยืนยันลบสินค้าออกจาก catalog',
        async () => {
          await this.submitRemove(rowData)
        },
        null,
        null
      )
    },

    async submitRemove(rowData) {
      const res = await this.catalogStore.fetchRemoveProduct({
        catalogId: this.catalogId,
        itemId: rowData.id,
        productNumber: rowData.productNumber
      })

      if (res) {
        swAlert.success(``, ``, async () => {
          await this.fetchCatalog()
        })
      }
    },

    onSaveItemsOrder() {
      swAlert.confirmSubmit(
        '',
        'ยืนยันบันทึกลำดับและ Dimensions',
        async () => {
          await this.submitSaveItems()
        },
        null,
        null
      )
    },

    async submitSaveItems() {
      const res = await this.catalogStore.fetchUpdate({
        form: {
          id: this.catalogId,
          code: this.catalog.code,
          nameTh: this.catalog.nameTh,
          nameEn: this.catalog.nameEn,
          headerLabel: this.catalog.headerLabel,
          collectionTitle: this.catalog.collectionTitle,
          items: this.items.map((item) => ({
            id: item.id,
            productNumber: item.productNumber,
            sortOrder: item.sortOrder,
            dimension1: item.dimension1,
            dimension2: item.dimension2,
            dimension3: item.dimension3
          }))
        }
      })

      if (res) {
        swAlert.success(``, ``, async () => {
          await this.fetchCatalog()
        })
      }
    },

    async onGeneratePdf() {
      if (!this.items || !this.items.length) {
        swAlert.warning('', 'ไม่มีสินค้าใน catalog นี้')
        return
      }

      // Ensure gold master is loaded (cached after first load)
      if (!this.masterStore.gold || !this.masterStore.gold.length) {
        await this.masterStore.fetchGold()
      }

      // Build Thai→EN gold color map from master data
      const goldColorMap = {}
      if (this.masterStore.gold && this.masterStore.gold.length) {
        this.masterStore.gold.forEach((g) => {
          if (g.nameTh && g.nameEn) {
            goldColorMap[g.nameTh] = g.nameEn.toUpperCase()
          }
        })
      }

      // Fetch product material data for all item productNumbers
      const productNumbers = [...new Set(this.items.map((i) => i.productNumber).filter(Boolean))]
      const productMaterialMap = {}

      if (productNumbers.length) {
        const res = await this.productStore.fetchDataSearch({
          take: productNumbers.length + 10,
          skip: 0,
          sort: [],
          formValue: { productNumbers: productNumbers }
        })

        const products =
          res ? res.data || this.productStore.dataSearch?.data || [] : this.productStore.dataSearch?.data || []

        products.forEach((p) => {
          if (!p.productNumber) return

          const materials = p.materials || []

          const goldWeight = materials
            .filter((m) => m.type === 'Gold')
            .reduce((sum, m) => sum + (Number(m.weight) || 0), 0)

          const diamondPcs = materials
            .filter((m) => m.type === 'Diamond')
            .reduce((sum, m) => sum + (Number(m.qty) || 0), 0)

          const diamondCarat = materials
            .filter((m) => m.type === 'Diamond')
            .reduce((sum, m) => sum + (Number(m.weight) || 0), 0)

          productMaterialMap[p.productNumber] = {
            goldWeight: goldWeight ? goldWeight.toFixed(2) : '0.00',
            diamondPcs: Math.round(diamondPcs),
            diamondCarat: diamondCarat ? diamondCarat.toFixed(2) : '0.00',
            goldColor: p.productionType || ''
          }
        })
      }

      const builder = new ProductCatalogPdfBuilder(this.catalog, this.items, {
        goldColorMap,
        productMaterialMap
      })
      await builder.preparePDF()
      builder.openPDF()
    },

    async fetchCatalog() {
      const res = await this.catalogStore.fetchGet({ id: this.catalogId })

      if (res) {
        this.catalog = {
          id: res.id,
          code: res.code,
          nameTh: res.nameTh,
          nameEn: res.nameEn,
          headerLabel: res.headerLabel,
          collectionTitle: res.collectionTitle
        }
        this.items = res.items ? [...res.items] : []

        await this.fetchProductNames()
      }
    },

    async fetchProductNames() {
      const productNumbers = [...new Set(this.items.map((i) => i.productNumber).filter(Boolean))]
      if (!productNumbers.length) return

      const res = await this.productStore.fetchDataSearch({
        take: productNumbers.length + 10,
        skip: 0,
        sort: [],
        formValue: { productNumbers: productNumbers }
      })

      const map = {}
      const data = res ? res.data || this.productStore.dataSearch?.data || [] : this.productStore.dataSearch?.data || []
      data.forEach((p) => {
        if (p.productNumber) {
          map[p.productNumber] = p.productNameEn || p.productNameTh || p.productNumber
        }
      })
      this.productNameMap = map
    }
  },

  async created() {
    this.catalogId = this.$route.params.id
    await this.fetchCatalog()
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';
@import '@/assets/scss/custom-style/standard-data-table';

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.detail-header-left {
  display: flex;
  align-items: center;
}

.detail-header-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.catalog-info h5 {
  font-size: 1.1rem;
  color: var(--base-font-color);
}

.sort-order-cell {
  display: flex;
  align-items: center;
  gap: 4px;
}

.sort-input {
  width: 55px;
  text-align: center;
  padding: 2px 4px;
}
</style>
