<template>
  <modal :showModal="isShow" @closeModal="$emit('closeModal')" width="1000px">
    <template #title>
      <span class="title-text-lg">
        <i class="bi bi-search mr-2"></i>{{ $t('view.sale.stockBasket.searchProducts') }}
      </span>
    </template>
    <template #content>
      <div class="p-3">
        <!-- Search Form -->
        <div class="form-col-container mb-3">
          <div>
            <span class="title-text">Stock Number</span>
            <InputTextGeneric
              v-model="searchForm.stockNumber"
              :trim="true"
              placeholder="Stock Number"
              @keypress.enter="onSearch"
            />
          </div>
          <div>
            <span class="title-text">{{ $t('view.sale.stockBasket.productName') }}</span>
            <InputTextGeneric
              v-model="searchForm.productName"
              :trim="true"
              :placeholder="$t('view.sale.stockBasket.productName')"
              @keypress.enter="onSearch"
            />
          </div>
          <div>
            <span class="title-text">{{ $t('view.sale.stockBasket.productType') }}</span>
            <InputTextGeneric
              v-model="searchForm.productType"
              :trim="true"
              :placeholder="$t('view.sale.stockBasket.productType')"
              @keypress.enter="onSearch"
            />
          </div>
          <div>
            <span class="title-text">{{ $t('view.sale.stockBasket.goldSize') }}</span>
            <InputTextGeneric
              v-model="searchForm.productionTypeSize"
              :trim="true"
              :placeholder="$t('view.sale.stockBasket.placeholder.karat')"
              @keypress.enter="onSearch"
            />
          </div>
        </div>

        <div class="mb-3">
          <button class="btn btn-sm btn-green" @click="onSearch">
            <i class="bi bi-search"></i>
            <span class="ml-1">{{ $t('common.btn.search') }}</span>
          </button>
          <button class="btn btn-sm btn-outline-main ml-2" @click="onClear">
            <i class="bi bi-x-circle"></i>
            <span class="ml-1">{{ $t('common.btn.clear') }}</span>
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
              :title="$t('common.btn.add')"
            >
              <i class="bi bi-plus-circle"></i>
              <span class="ml-1">{{ $t('common.btn.add') }}</span>
            </button>
          </template>
        </BaseDataTable>

        <div class="d-flex justify-content-end mt-3">
          <button class="btn btn-sm btn-outline-main" @click="$emit('closeModal')">
            <i class="bi bi-x-circle"></i>
            <span class="ml-1">{{ $t('common.btn.close') }}</span>
          </button>
        </div>
      </div>
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

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
    BaseDataTable,
    InputTextGeneric
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
      sort: []
    }
  },

  computed: {
    columns() {
      return [
        { field: 'action', header: '', width: '100px', sortable: false },
        { field: 'stockNumber', header: 'Stock Number', minWidth: '140px', sortable: true },
        { field: 'productNameTh', header: this.$t('view.sale.stockBasket.productNameTh'), minWidth: '160px', sortable: true },
        { field: 'productNameEn', header: this.$t('view.sale.stockBasket.productNameEn'), minWidth: '160px', sortable: true },
        { field: 'productTypeName', header: this.$t('view.sale.stockBasket.type'), minWidth: '120px', sortable: true },
        { field: 'productionTypeSize', header: this.$t('view.sale.stockBasket.goldSize'), minWidth: '100px', sortable: true },
        { field: 'location', header: this.$t('view.sale.stockBasket.location'), minWidth: '100px', sortable: true }
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
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';
</style>
