<template>
  <modal :showModal="isShow" @closeModal="$emit('closeModal')" width="1000px">
    <template #title>
      <span class="title-text-lg">
        <i class="bi bi-search mr-2"></i>ค้นหาสินค้า
      </span>
    </template>
    <template #content>
      <div class="p-3">
        <!-- Search Form -->
        <div class="form-col-container mb-3">
          <div>
            <span class="title-text">Stock Number</span>
            <input
              class="form-control"
              type="text"
              v-model.trim="searchForm.stockNumber"
              placeholder="Stock Number"
              @keypress.enter="onSearch"
            />
          </div>
          <div>
            <span class="title-text">ชื่อสินค้า</span>
            <input
              class="form-control"
              type="text"
              v-model.trim="searchForm.productName"
              placeholder="ชื่อสินค้า"
              @keypress.enter="onSearch"
            />
          </div>
          <div>
            <span class="title-text">ประเภทสินค้า</span>
            <input
              class="form-control"
              type="text"
              v-model.trim="searchForm.productType"
              placeholder="ประเภทสินค้า"
              @keypress.enter="onSearch"
            />
          </div>
          <div>
            <span class="title-text">ขนาดทอง</span>
            <input
              class="form-control"
              type="text"
              v-model.trim="searchForm.productionTypeSize"
              placeholder="เช่น 18K, 9K"
              @keypress.enter="onSearch"
            />
          </div>
        </div>

        <div class="d-flex gap-2 mb-3">
          <button class="btn btn-sm btn-green" @click="onSearch">
            <i class="bi bi-search"></i>
            <span class="ml-1">ค้นหา</span>
          </button>
          <button class="btn btn-sm btn-outline-main" @click="onClear">
            <i class="bi bi-x-circle"></i>
            <span class="ml-1">ล้าง</span>
          </button>
        </div>

        <!-- Results Table -->
        <BaseDataTable
          :items="stockData.data"
          :totalRecords="stockData.total"
          :columns="columns"
          :perPage="take"
          :scrollHeight="'350px'"
          @page="handlePageChange"
          @sort="handleSortChange"
        >
          <template #actionTemplate="{ data }">
            <button
              class="btn btn-sm btn-green"
              @click="onSelectStock(data)"
              title="เพิ่ม"
            >
              <i class="bi bi-plus-circle"></i>
              <span class="ml-1">เพิ่ม</span>
            </button>
          </template>
        </BaseDataTable>

        <div class="d-flex justify-content-end mt-3">
          <button class="btn btn-sm btn-outline-main" @click="$emit('closeModal')">
            <i class="bi bi-x-circle"></i>
            <span class="ml-1">ปิด</span>
          </button>
        </div>
      </div>
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'

const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))

const interfaceSearchForm = {
  stockNumber: null,
  productName: null,
  productType: null,
  productionTypeSize: null
}

export default {
  name: 'StockSearchModal',

  components: {
    modal,
    BaseDataTable
  },

  props: {
    isShow: {
      type: Boolean,
      default: false
    }
  },

  emits: ['closeModal', 'stockSelected'],

  setup() {
    const stockStore = usrStockProductApiStore()
    return { stockStore }
  },

  data() {
    return {
      searchForm: { ...interfaceSearchForm },
      stockData: { data: [], total: 0 },
      take: 10,
      skip: 0,
      sort: [],

      columns: [
        { field: 'action', header: '', width: '100px', sortable: false },
        { field: 'stockNumber', header: 'Stock Number', minWidth: '140px', sortable: true },
        { field: 'productNameTh', header: 'ชื่อสินค้า (TH)', minWidth: '160px', sortable: true },
        { field: 'productNameEn', header: 'ชื่อสินค้า (EN)', minWidth: '160px', sortable: true },
        { field: 'productTypeName', header: 'ประเภท', minWidth: '120px', sortable: true },
        { field: 'productionTypeSize', header: 'ขนาดทอง', minWidth: '100px', sortable: true },
        { field: 'location', header: 'จัดเก็บ', minWidth: '100px', sortable: true }
      ]
    }
  },

  watch: {
    isShow(val) {
      if (val) {
        this.resetForm()
        this.fetchStockData()
      }
    }
  },

  methods: {
    async fetchStockData() {
      await this.stockStore.fetchDataSearch({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        formValue: this.searchForm
      })
      this.stockData = this.stockStore.dataSearch || { data: [], total: 0 }
    },

    async onSearch() {
      this.skip = 0
      await this.fetchStockData()
    },

    onClear() {
      this.searchForm = { ...interfaceSearchForm }
      this.skip = 0
      this.fetchStockData()
    },

    onSelectStock(data) {
      this.$emit('stockSelected', data.stockNumber)
      this.$emit('closeModal')
    },

    resetForm() {
      this.searchForm = { ...interfaceSearchForm }
      this.skip = 0
      this.sort = []
      this.stockData = { data: [], total: 0 }
    },

    handlePageChange(e) {
      this.skip = e.first
      this.take = e.rows
      this.fetchStockData()
    },

    handleSortChange(e) {
      this.skip = e.first
      this.take = e.rows
      this.sort = e.multiSortMeta
        ? e.multiSortMeta.map((item) => ({
            field: item.field,
            dir: item.order === 1 ? 'asc' : 'desc'
          }))
        : []
      this.fetchStockData()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.title-text-lg {
  font-size: 1.1rem;
  font-weight: bold;
  color: var(--base-font-color);
}

.gap-2 {
  gap: 8px;
}
</style>
