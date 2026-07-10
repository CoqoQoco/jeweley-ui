<template>
  <div class="app-container">
    <div class="detail-header">
      <div class="detail-header-left">
        <ButtonGeneric variant="outline" icon="bi-arrow-left" :label="$t('common.btn.back')" @click="$router.back()" />
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
        <ButtonGeneric variant="green" icon="bi-plus-lg" :label="$t('view.catalog.btn.addProduct')" @click="onAddProducts" />
        <ButtonGeneric variant="main" icon="bi-save" :label="$t('view.catalog.btn.saveOrder')" class="ml-2" @click="onSaveItemsOrder" />
        <ButtonGeneric variant="outline" icon="bi-file-pdf" :label="$t('view.catalog.btn.generatePdf')" class="ml-2" @click="onGeneratePdf" />
      </div>
    </div>

    <div class="mt-3">
      <BaseDataTable
        :items="items"
        :totalRecords="items.length"
        :columns="columns"
        :paginator="false"
        scrollHeight="calc(100vh - 360px)"
      >
        <template #actionsTemplate="{ data: rowData }">
          <div class="btn-action-container">
            <ButtonGeneric
              variant="green"
              icon="bi-images"
              :title="$t('view.catalog.btn.manageImage')"
              @click="onManageImage(rowData)"
            />
            <ButtonGeneric
              variant="red"
              icon="bi-trash"
              class="ml-2"
              :title="$t('common.btn.delete')"
              @click="onRemoveItem(rowData)"
            />
          </div>
        </template>

        <template #sortOrderTemplate="{ data: rowData, index }">
          <div class="sort-order-cell">
            <ButtonGeneric
              variant="outline"
              icon="bi-chevron-up"
              :disabled="index === 0"
              :title="'เลื่อนขึ้น'"
              @click="moveItemUp(index)"
            />
            <InputTextGeneric
              type="number"
              class="sort-input"
              :modelValue="rowData.sortOrder"
              @update:modelValue="rowData.sortOrder = Number($event)"
            />
            <ButtonGeneric
              variant="outline"
              icon="bi-chevron-down"
              :disabled="index === items.length - 1"
              :title="'เลื่อนลง'"
              @click="moveItemDown(index)"
            />
          </div>
        </template>

        <template #productNameTemplate="{ data: rowData }">
          <span>{{ getProductName(rowData.productNumber) }}</span>
        </template>

        <template #dimension1Template="{ data: rowData }">
          <InputTextGeneric
            v-model="rowData.dimension1"
            placeholder="—"
          />
        </template>

        <template #dimension2Template="{ data: rowData }">
          <InputTextGeneric
            v-model="rowData.dimension2"
            placeholder="—"
          />
        </template>

        <template #dimension3Template="{ data: rowData }">
          <InputTextGeneric
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
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { warning, success } from '@/services/alert/sweetAlerts.js'

import { useCatalogStore } from '@/stores/modules/api/catalog-store.js'
import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'
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
    ButtonGeneric,
    InputTextGeneric,
    productPickerModal,
    catalogImageModal
  },

  setup() {
    const catalogStore = useCatalogStore()
    const productStore = usrStockProductApiStore()
    return { catalogStore, productStore }
  },

  computed: {
    columns() {
      return [
        {
          field: 'actions',
          header: '',
          sortable: false,
          width: '100px'
        },
        {
          field: 'sortOrder',
          header: this.$t('view.catalog.field.sortOrder'),
          sortable: false,
          width: '120px'
        },
        {
          field: 'productNumber',
          header: this.$t('view.catalog.field.productNumber'),
          sortable: false,
          minWidth: '130px'
        },
        {
          field: 'productName',
          header: this.$t('view.catalog.field.productName'),
          sortable: false,
          minWidth: '180px'
        },
        {
          field: 'dimension1',
          header: this.$t('view.catalog.field.dimension1'),
          sortable: false,
          width: '130px'
        },
        {
          field: 'dimension2',
          header: this.$t('view.catalog.field.dimension2'),
          sortable: false,
          width: '130px'
        },
        {
          field: 'dimension3',
          header: this.$t('view.catalog.field.dimension3'),
          sortable: false,
          width: '130px'
        }
      ]
    }
  },

  data() {
    return {
      catalogId: null,
      catalog: {},
      items: [],
      productNameMap: {},

      isShow: { ...interfaceIsShow },
      selectedProductCode: ''
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
      confirmThenSubmit(
        `${rowData.productNumber}`,
        this.$t('view.catalog.confirm.removeProduct'),
        async () => {
          await this.submitRemove(rowData)
        }
      )
    },

    async submitRemove(rowData) {
      const res = await this.catalogStore.fetchRemoveProduct({
        catalogId: this.catalogId,
        itemId: rowData.id,
        productNumber: rowData.productNumber
      })

      if (res) {
        success(``, ``, async () => {
          await this.fetchCatalog()
        })
      }
    },

    onSaveItemsOrder() {
      confirmThenSubmit(
        '',
        this.$t('view.catalog.confirm.saveOrder'),
        async () => {
          await this.submitSaveItems()
        }
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
        success(``, ``, async () => {
          await this.fetchCatalog()
        })
      }
    },

    async onGeneratePdf() {
      if (!this.items || !this.items.length) {
        warning(this.$t('view.catalog.warning.noItems'))
        return
      }

      const builder = new ProductCatalogPdfBuilder(this.catalog, this.items)
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
  gap: var(--sp-md);
  padding: var(--sp-lg);
  background: var(--color-card-bg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

.detail-header-left {
  display: flex;
  align-items: center;
}

.detail-header-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--sp-sm);
}

.catalog-info h5 {
  font-size: var(--fs-lg);
  color: var(--base-font-color);
}

.sort-order-cell {
  display: flex;
  align-items: center;
  gap: var(--sp-xs);
}

.sort-input {
  width: 55px;
  text-align: center;
}
</style>
