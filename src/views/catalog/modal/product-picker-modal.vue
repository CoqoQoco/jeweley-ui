<template>
  <div>
    <modal
      :showModal="isShow"
      @closeModal="closeModal"
      width="900px"
      :isShowActionPart="true"
    >
      <template #title>
        <span class="title-text-lg px-3 pt-3 d-block">เพิ่มสินค้าเข้า Catalog</span>
      </template>

      <template #content>
        <div class="p-3">
          <div class="search-row mb-3">
            <div class="input-group">
              <input
                class="form-control"
                type="text"
                v-model="searchText"
                placeholder="ค้นหาด้วยรหัสสินค้า, ชื่อสินค้า..."
                @keyup.enter="fetchProducts"
              />
              <button type="button" class="btn btn-green" @click="fetchProducts">
                <i class="bi bi-search"></i> ค้นหา
              </button>
            </div>
          </div>

          <BaseDataTable
            scrollHeight="350px"
            :items="productData.data"
            :totalRecords="productData.total"
            :columns="columns"
            :perPage="take"
            :rowsPerPageOptions="[10, 20, 50]"
            :selectionMode="true"
            :itemsSelection="selectedItems"
            selectionType="multiple"
            dataKey="productNumber"
            @update:itemsSelection="updateSelection"
            @page="handlePageChange"
            @sort="handleSortChange"
          >
          </BaseDataTable>
        </div>
      </template>

      <template #action>
        <button
          :class="['btn btn-sm', !selectedItems.length ? 'btn-secondary' : 'btn-main']"
          type="button"
          :disabled="!selectedItems.length"
          @click="onConfirm"
        >
          <i class="bi bi-check-lg mr-1"></i>
          เพิ่มสินค้าที่เลือก ({{ selectedItems.length }})
        </button>
        <button class="btn btn-sm btn-outline-main ml-2" type="button" @click="closeModal">
          ยกเลิก
        </button>
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))
const BaseDataTable = defineAsyncComponent(() =>
  import('@/components/prime-vue/DataTableWithPaging.vue')
)

import { useCatalogStore } from '@/stores/modules/api/catalog-store.js'
import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'
import swAlert from '@/services/alert/sweetAlerts.js'

export default {
  components: {
    modal,
    BaseDataTable
  },

  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    catalogId: {
      type: [String, Number],
      default: null
    }
  },

  setup() {
    const catalogStore = useCatalogStore()
    const productStore = usrStockProductApiStore()
    return { catalogStore, productStore }
  },

  watch: {
    isShow(val) {
      if (val) {
        this.onOpen()
      }
    }
  },

  data() {
    return {
      searchText: null,
      take: 10,
      skip: 0,
      sort: [],
      productData: { data: [], total: 0 },
      selectedItems: [],

      columns: [
        {
          field: 'productNumber',
          header: 'รหัสสินค้า',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'productNameEn',
          header: 'ชื่อ EN',
          sortable: true,
          minWidth: '180px'
        },
        {
          field: 'productNameTh',
          header: 'ชื่อ TH',
          sortable: true,
          minWidth: '180px'
        },
        {
          field: 'productTypeName',
          header: 'ประเภท',
          sortable: true,
          minWidth: '130px'
        }
      ]
    }
  },

  methods: {
    onOpen() {
      this.searchText = null
      this.selectedItems = []
      this.productData = { data: [], total: 0 }
      this.skip = 0
      this.fetchProducts()
    },

    closeModal() {
      this.onClear()
      this.$emit('closeModal')
    },

    onClear() {
      this.searchText = null
      this.selectedItems = []
      this.productData = { data: [], total: 0 }
    },

    updateSelection(newSelection) {
      this.selectedItems = newSelection
    },

    handlePageChange(e) {
      this.skip = e.first
      this.take = e.rows
      this.fetchProducts()
    },

    handleSortChange(e) {
      this.skip = e.first
      this.take = e.rows
      this.sort = e.multiSortMeta.map((item) => ({
        field: item.field,
        dir: item.order === 1 ? 'asc' : 'desc'
      }))
      this.fetchProducts()
    },

    async fetchProducts() {
      await this.productStore.fetchDataSearch({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        formValue: {
          productNumber: this.searchText,
          productName: this.searchText
        }
      })

      this.productData = {
        data: this.productStore.dataSearch?.data || [],
        total: this.productStore.dataSearch?.total || 0
      }
    },

    onConfirm() {
      if (!this.selectedItems.length) return

      swAlert.confirmSubmit(
        `เพิ่มสินค้า ${this.selectedItems.length} รายการ`,
        'ยืนยันเพิ่มสินค้าเข้า catalog',
        async () => {
          await this.submitAddProducts()
        },
        null,
        null
      )
    },

    async submitAddProducts() {
      const items = this.selectedItems.map((p) => ({
        productNumber: p.productNumber
      }))

      const res = await this.catalogStore.fetchAddProducts({
        catalogId: this.catalogId,
        items: items
      })

      if (res) {
        swAlert.success(``, ``, async () => {
          this.onClear()
          this.$emit('closeModal', 'fetch')
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.search-row {
  .input-group {
    display: flex;
    gap: 8px;

    input {
      flex: 1;
    }
  }
}
</style>
