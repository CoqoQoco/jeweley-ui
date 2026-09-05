<template>
  <div class="app-container">
    <search-view
      v-model:dateFrom="filter.dateFrom"
      v-model:dateTo="filter.dateTo"
      v-model:goldCode="filter.goldCode"
      v-model:goldSizeCode="filter.goldSizeCode"
      v-model:type="filter.type"
      v-model:refDocNo="filter.refDocNo"
      @search="onSearch"
      @clear="onClear"
    />
    <data-table-view class="mt-2" :search="search" />
  </div>
</template>

<script>
import { formatISOString } from '@/services/utils/dayjs.js'

import searchView from './components/search-view.vue'
import dataTableView from './components/data-table-view.vue'

const defaultFilter = () => ({
  dateFrom: null,
  dateTo: null,
  goldCode: [],
  goldSizeCode: [],
  type: [],
  refDocNo: ''
})

export default {
  name: 'StockGoldTransectionListView',

  components: {
    searchView,
    dataTableView
  },

  data() {
    return {
      filter: defaultFilter(),
      search: {}
    }
  },

  methods: {
    buildSearch() {
      return {
        goldCode: this.filter.goldCode.length ? this.filter.goldCode : null,
        goldSizeCode: this.filter.goldSizeCode.length ? this.filter.goldSizeCode : null,
        type: this.filter.type.length ? this.filter.type : null,
        refDocType: null,
        refDocNo: this.filter.refDocNo || null,
        dateFrom: this.filter.dateFrom ? formatISOString(this.filter.dateFrom) : null,
        dateTo: this.filter.dateTo ? formatISOString(this.filter.dateTo) : null
      }
    },

    onSearch() {
      this.search = this.buildSearch()
    },

    onClear() {
      this.filter = defaultFilter()
      this.search = {}
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
