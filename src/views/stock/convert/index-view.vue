<template>
  <div class="app-container">
    <searchView v-model:modelForm="filter" @search="onSearch" @clear="onClear" @create="onCreate" />

    <dataTableView
      :items="dataList.data"
      :total="dataList.total"
      :take="take"
      @page="handlePageChange"
      @sort="handleSortChange"
      @view="onView"
    />
  </div>
</template>

<script>
// External dependencies
import dataTablePaging from '@/composables/useDataTablePaging.js'
import { useStockConvertApiStore } from '@/stores/modules/api/stock/stock-convert-store.js'
import { formatISOString } from '@/services/utils/dayjs.js'

// Local components
import searchView from './components/search-view.vue'
import dataTableView from './components/data-table-view.vue'

const interfaceFilter = {
  documentNumber: null,
  soNumber: null,
  sourceStockNumber: null,
  status: null,
  dateFrom: null,
  dateTo: null
}

export default {
  name: 'StockConvertIndexView',

  mixins: [dataTablePaging],

  components: {
    searchView,
    dataTableView
  },

  setup() {
    const stockConvertStore = useStockConvertApiStore()
    return { stockConvertStore }
  },

  data() {
    return {
      filter: { ...interfaceFilter },
      dataList: { data: [], total: 0 }
    }
  },

  created() {
    this.fetchData()
  },

  methods: {
    async fetchData() {
      this.dataList = await this.stockConvertStore.list({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        documentNumber: this.filter.documentNumber || null,
        soNumber: this.filter.soNumber || null,
        sourceStockNumber: this.filter.sourceStockNumber || null,
        status: this.filter.status ?? null,
        dateFrom: this.filter.dateFrom ? formatISOString(this.filter.dateFrom) : null,
        dateTo: this.filter.dateTo ? formatISOString(this.filter.dateTo) : null
      })
    },

    onSearch() {
      this.resetPaging()
    },

    onClear() {
      this.filter = { ...interfaceFilter }
      this.resetPaging()
    },

    onCreate() {
      this.$router.push({ name: 'stock-convert-create' })
    },

    onView(data) {
      this.$router.push({ name: 'stock-convert-detail', params: { running: data.running } })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.app-container {
  padding: var(--sp-lg);
}
</style>
