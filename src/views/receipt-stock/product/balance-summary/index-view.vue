<template>
  <div class="app-container">
    <searchView v-model:modelForm="form" @search="onSearchFilter" @clear="onClearFilter" />
    <summaryView />
    <tableView />
  </div>
</template>

<script>
import { useStockBalanceApiStore } from '@/stores/modules/api/stock/stock-balance-api.js'

import searchView from './components/search-view.vue'
import summaryView from './components/summary-view.vue'
import tableView from './components/table-view.vue'

const interfaceForm = {
  locationCode: null
}

export default {
  name: 'StockBalanceSummaryIndexView',

  components: {
    searchView,
    summaryView,
    tableView
  },

  setup() {
    const stockBalanceStore = useStockBalanceApiStore()
    return { stockBalanceStore }
  },

  data() {
    return {
      form: { ...interfaceForm },
      search: { ...interfaceForm }
    }
  },

  watch: {
    search: {
      handler(val) {
        this.stockBalanceStore.fetchSummary({ locationCode: val.locationCode })
      },
      deep: true,
      immediate: true
    }
  },

  methods: {
    onSearchFilter(data) {
      this.search = { ...data }
    },

    onClearFilter() {
      this.form = { ...interfaceForm }
      this.search = { ...interfaceForm }
    }
  }
}
</script>

<style lang="scss" scoped></style>
