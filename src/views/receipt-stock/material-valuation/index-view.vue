<template>
  <div class="app-container">
    <searchView v-model:modelForm="form" @search="onSearchFilter" @clear="onClearFilter" />
    <summaryView />
    <chartView />
    <tableView />
  </div>
</template>

<script>
import { useMaterialValuationReportApiStore } from '@/stores/modules/api/stock/material-valuation-report-api.js'

import searchView from './components/search-view.vue'
import summaryView from './components/summary-view.vue'
import chartView from './components/chart-view.vue'
import tableView from './components/table-view.vue'

const interfaceForm = {
  productType: null,
  region: null
}

export default {
  name: 'MaterialValuationReportIndexView',

  components: {
    searchView,
    summaryView,
    chartView,
    tableView
  },

  setup() {
    const materialValuationStore = useMaterialValuationReportApiStore()
    return { materialValuationStore }
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
        this.materialValuationStore.fetchSummary({ formValue: val })
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
